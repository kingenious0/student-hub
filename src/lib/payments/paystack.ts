// src/lib/payments/paystack.ts
/**
 * SECURITY: PAYSTACK_SECRET_KEY should NEVER be exposed to client
 * Only use process.env.PAYSTACK_SECRET_KEY (server-only)
 */

if (typeof window !== 'undefined') {
  throw new Error('Paystack integration should only run on server side');
}

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

if (!PAYSTACK_SECRET_KEY) {
  throw new Error('PAYSTACK_SECRET_KEY environment variable is not set');
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
    const response = await fetch(`${PAYSTACK_BASE_URL}/paymentrequest`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
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
    const response = await fetch(
        `${PAYSTACK_BASE_URL}/paymentrequest/verify/${requestCode}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
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
    const response = await fetch(
        `${PAYSTACK_BASE_URL}/paymentrequest/${idOrCode}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
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
    const response = await fetch(`${PAYSTACK_BASE_URL}/customer`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
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
    const encoder = new TextEncoder();
    const keyData = encoder.encode(PAYSTACK_SECRET_KEY);
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
    const response = await fetch(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Paystack verification error: ${error.message || response.statusText}`);
    }

    return response.json();
}
