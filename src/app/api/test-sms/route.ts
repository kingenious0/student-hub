import { NextRequest, NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms/wigal';
import { isAuthorizedAdmin } from '@/lib/auth/admin';

export async function POST(req: NextRequest) {
    if (!await isAuthorizedAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { phone, message } = await req.json();

        if (!phone || !message) {
            return NextResponse.json({ error: 'Missing phone or message' }, { status: 400 });
        }

        const result = await sendSMS(phone, message);
        return NextResponse.json(result);

    } catch (error) {
        return NextResponse.json({ error: 'Test Failed' }, { status: 500 });
    }
}

export async function GET() {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Test SMS</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #050505; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #111; border: 1px solid #222; border-radius: 24px; padding: 40px; width: 100%; max-width: 420px; }
    h1 { font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 8px; }
    p { font-size: 12px; color: #666; font-weight: 700; margin-bottom: 24px; }
    label { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: #666; display: block; margin-bottom: 6px; }
    input, textarea { width: 100%; background: #000; border: 1px solid #222; border-radius: 16px; padding: 14px 16px; color: #fff; font-size: 14px; font-weight: 700; outline: none; margin-bottom: 16px; }
    input:focus, textarea:focus { border-color: #39FF14; }
    button { width: 100%; background: #39FF14; color: #000; border: none; border-radius: 16px; padding: 16px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; cursor: pointer; }
    button:hover { opacity: 0.9; }
    .result { margin-top: 20px; padding: 16px; border-radius: 16px; font-size: 12px; font-weight: 700; display: none; }
    .success { background: #39FF1410; border: 1px solid #39FF1430; color: #39FF14; display: block; }
    .error { background: #ff333310; border: 1px solid #ff333330; color: #ff3333; display: block; }
    pre { font-size: 10px; margin-top: 8px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="card">
    <h1>📡 Test SMS</h1>
    <p>Send a test SMS via Wigal</p>
    <form id="smsForm">
      <label>Phone Number</label>
      <input type="tel" id="phone" placeholder="054 XXX XXXX" required />
      <label>Message</label>
      <textarea id="message" rows="3" placeholder="Your test message..." required></textarea>
      <button type="submit">Send SMS</button>
    </form>
    <div id="result" class="result"></div>
  </div>
  <script>
    document.getElementById('smsForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      btn.disabled = true; btn.textContent = 'Sending...';
      const resultDiv = document.getElementById('result');
      resultDiv.className = 'result';
      try {
        const res = await fetch('/api/test-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: document.getElementById('phone').value, message: document.getElementById('message').value })
        });
        const data = await res.json();
        if (res.ok) {
          resultDiv.className = 'result success';
          resultDiv.innerHTML = data.success ? '✅ SMS Sent!' : '❌ Failed: ' + (data.error || 'Unknown');
          if (data.data) resultDiv.innerHTML += '<pre>' + JSON.stringify(data.data, null, 2) + '</pre>';
        } else {
          resultDiv.className = 'result error';
          resultDiv.textContent = 'Error: ' + (data.error || 'Request failed');
        }
      } catch(err) {
        resultDiv.className = 'result error';
        resultDiv.textContent = 'Network Error: ' + err.message;
      }
      btn.disabled = false; btn.textContent = 'Send SMS';
    });
  </script>
</body>
</html>`;

    return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
    });
}
