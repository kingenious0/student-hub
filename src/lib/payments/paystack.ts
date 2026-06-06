// src/lib/payments/paystack.ts
/**
 * SECURITY: PAYSTACK_SECRET_KEY should NEVER be exposed to client
 * Only use process.env.PAYSTACK_SECRET_KEY (server-only)
 */

if (typeof window !== 'undefined') {
  throw new Error('Paystack integration should only run on server side');
}

import { prisma } from '@/lib/db/prisma';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

async function getPaystackSecretKey(): Promise<string> {
    try {
        const config = await prisma.systemSettings.findUnique({
            where: { id: 'GLOBAL_CONFIG' },
            select: { paystackMode: true, paystackLiveSecretKey: true, paystackTestSecretKey: true }
        });
        if (config) {
            if (config.paystackMode === 'LIVE' && config.paystackLiveSecretKey) {
                return config.paystackLiveSecretKey;
            } else if (config.paystackMode === 'TEST' && config.paystackTestSecretKey) {
                return config.paystackTestSecretKey;
            }
        }
    } catch (e) {
        console.error("Failed to load secret key from db, falling back to env:", e);
    }
    return process.env.PAYSTACK_SECRET_KEY || "";
}

export interface PaystackCustomer {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
}

export interface PaymentRequestLineItem {
    name: string;
    amount: number;
    quantity?: number;
}

export interface CreatePaymentRequestParams {
    customer: string; // Customer code or email
    amount: number;
    description: string;
    line_items?: PaymentRequestLineItem[];
    due_date?: string; // ISO 8601 format
    currency?: string;
    send_notification?: boolean;
    metadata?: Record<string, unknown>;
}

export interface PaymentRequestResponse {
    status: boolean;
    message: string;
    data: {
        id: number;
        domain: string;
        amount: number;
        currency: string;
        due_date: string;
        has_invoice: boolean;
        invoice_number: number;
        description: string;
        request_code: string;
        status: 'pending' | 'success' | 'failed';
        paid: boolean;
        paid_at: string | null;
        metadata: Record<string, unknown> | null;
        customer: number;
        created_at: string;
    };
}

export interface VerifyPaymentResponse {
    status: boolean;
    message: string;
    data: {
        id: number;
        amount: number;
        currency: string;
        request_code: string;
        status: 'pending' | 'success' | 'failed';
        paid: boolean;
        paid_at: string | null;
        metadata: Record<string, unknown> | null;
        customer: {
            id: number;
            email: string;
            customer_code: string;
        };
    };
}

/**
 * Create a payment request on Paystack
 * This generates an invoice that the student can pay
 */
export async function createPaymentRequest(
    params: CreatePaymentRequestParams
): Promise<PaymentRequestResponse> {
    const secretKey = await getPaystackSecretKey();
    const response = await fetch(`${PAYSTACK_BASE_URL}/paymentrequest`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            customer: params.customer,
            amount: params.amount,
            description: params.description,
            line_items: params.line_items,
            due_date: params.due_date,
            currency: params.currency || 'GHS',
            send_notification: params.send_notification ?? true,
            metadata: params.metadata,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Paystack API error: ${error.message || response.statusText}`);
    }

    return response.json();
}

/**
 * Verify a payment request by its code
 * This checks if the student has paid the invoice
 */
export async function verifyPaymentRequest(
    requestCode: string
): Promise<VerifyPaymentResponse> {
    const secretKey = await getPaystackSecretKey();
    const response = await fetch(
        `${PAYSTACK_BASE_URL}/paymentrequest/verify/${requestCode}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${secretKey}`,
            },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Paystack verification error: ${error.message || response.statusText}`);
    }

    return response.json();
}

/**
 * Fetch payment request details
 */
export async function fetchPaymentRequest(
    idOrCode: string
): Promise<PaymentRequestResponse> {
    const secretKey = await getPaystackSecretKey();
    const response = await fetch(
        `${PAYSTACK_BASE_URL}/paymentrequest/${idOrCode}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${secretKey}`,
            },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Paystack fetch error: ${error.message || response.statusText}`);
    }

    return response.json();
}

/**
 * Create or get a Paystack customer
 */
export async function createCustomer(
    customer: PaystackCustomer
): Promise<{ customer_code: string }> {
    const secretKey = await getPaystackSecretKey();
    const response = await fetch(`${PAYSTACK_BASE_URL}/customer`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Paystack customer error: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    return { customer_code: result.data.customer_code };
}


/**
 * Verify webhook signature from Paystack
 * Use this to validate webhook events
 */
export async function verifyWebhookSignature(
    payload: string,
    signature: string
): Promise<boolean> {
    const secretKey = await getPaystackSecretKey();
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const data = encoder.encode(payload);

    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['sign']
    );

    const hashBuffer = await crypto.subtle.sign('HMAC', key, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex === signature;
}

/**
 * Verify a standard transaction by its reference (for Paystack Inline)
 */
export interface VerifyTransactionResponse {
    status: boolean;
    message: string;
    data: {
        id: number;
        amount: number;
        currency: string;
        reference: string;
        status: 'success' | 'failed' | 'abandoned';
        paid_at: string | null;
        metadata: Record<string, unknown> | null;
        customer: {
            id: number;
            email: string;
            customer_code: string;
        };
    };
}

export async function verifyTransaction(
    reference: string
): Promise<VerifyTransactionResponse> {
    const secretKey = await getPaystackSecretKey();
    const response = await fetch(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${secretKey}`,
            },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Paystack verification error: ${error.message || response.statusText}`);
    }

    return response.json();
}

/**
 * Create a Transfer Recipient on Paystack
 */
export async function createTransferRecipient(
    name: string,
    accountNumber: string,
    bankCode: string
): Promise<string> {
    const secretKey = await getPaystackSecretKey();
    const response = await fetch(`${PAYSTACK_BASE_URL}/transferrecipient`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'mobile_money',
            name: name,
            account_number: accountNumber,
            bank_code: bankCode,
            currency: 'GHS',
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Paystack recipient creation error: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    return result.data.recipient_code;
}

/**
 * Initiate an instant Transfer via Paystack (Mobile Money / Bank)
 */
/**
 * Fetch Paystack account balance
 * Returns the GHS balance available for transfers
 */
export async function getBalance(): Promise<{ currency: string; balance: number }[]> {
  const secretKey = await getPaystackSecretKey();
  const response = await fetch(`${PAYSTACK_BASE_URL}/balance`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Paystack balance error: ${error.message || response.statusText}`);
  }

  const result = await response.json();
  // result.data is an array of { currency: "GHS", balance: number } in kobo/pesewas
  return (result.data || []).map((b: any) => ({
    currency: b.currency,
    balance: b.balance / 100, // convert from pesewas to GHS
  }));
}

export async function initiateTransfer(
    amountGHS: number,
    recipientCode: string,
    reason: string = 'OMNI Vendor Withdrawal'
): Promise<{ transfer_code: string; status: string }> {
    // Paystack transfers expect amount in PESEWAS (GHS * 100)
    const amountInPesewas = Math.round(amountGHS * 100);
    const secretKey = await getPaystackSecretKey();

    const response = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            source: 'balance',
            amount: amountInPesewas,
            recipient: recipientCode,
            reason: reason,
            currency: 'GHS',
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Paystack transfer error: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    return {
        transfer_code: result.data.transfer_code,
        status: result.data.status,
    };
}
