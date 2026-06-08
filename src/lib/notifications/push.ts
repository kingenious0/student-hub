import webpush from 'web-push';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

let initialized = false;
function ensureInit() {
  if (initialized) return;
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) return;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  initialized = true;
}

export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: PushPayload
) {
  ensureInit();
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { sent: true };
  } catch (err) {
    const isGone = err?.statusCode === 410 || err?.statusCode === 404;
    return { sent: false, expired: isGone, endpoint: subscription.endpoint };
  }
}
