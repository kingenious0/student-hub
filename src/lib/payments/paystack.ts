// src/lib/payments/paystack.ts

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

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
    metadata?: Record<string, any>;
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
        metadata: Record<string, any> | null;
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
        metadata: Record<string, any> | null;
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
export function verifyWebhookSignature(
    payload: string,
    signature: string
): boolean {
    const crypto = require('crypto');
    const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY)
        .update(payload)
        .digest('hex');

    return hash === signature;
}
