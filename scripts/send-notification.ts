import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

interface NotificationData {
  type: 'success' | 'error' | 'info';
  subject: string;
  message: string;
  metadata?: Record<string, any>;
}

export async function sendNotification(data: NotificationData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.NOTIFICATION_EMAIL || 'john@pravos.xyz';

  if (!apiKey) {
    console.warn('⚠️  RESEND_API_KEY not found, skipping email notification');
    console.log(`📧 Would have sent: ${data.subject}`);
    console.log(`   ${data.message}`);
    return;
  }

  const emoji = data.type === 'success' ? '✅' : data.type === 'error' ? '❌' : 'ℹ️';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .message { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
    .metadata { background: white; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 14px; }
    .metadata-item { margin: 8px 0; }
    .metadata-label { font-weight: 600; color: #667eea; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${emoji} ${data.subject}</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Pravos YouTube Automation</p>
    </div>
    <div class="content">
      <div class="message">
        <p style="margin: 0; font-size: 16px;">${data.message}</p>
      </div>

      ${data.metadata ? `
        <div class="metadata">
          <p style="margin: 0 0 10px 0; font-weight: 600;">Details:</p>
          ${Object.entries(data.metadata).map(([key, value]) => `
            <div class="metadata-item">
              <span class="metadata-label">${key}:</span> ${value}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="footer">
        <p>Automated by Pravos Publishing System</p>
        <p style="margin-top: 10px;">
          <a href="https://studio.youtube.com" style="color: #667eea; text-decoration: none;">
            View YouTube Studio →
          </a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Pravos Automation <noreply@pravos.xyz>',
        to: toEmail,
        subject: `${emoji} ${data.subject}`,
        html: htmlBody,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const result = await response.json();
    console.log(`📧 Email sent successfully: ${result.id}`);
  } catch (error: any) {
    // Don't throw on network errors - just log them
    if (error.name === 'AbortError' || error.code === 'UND_ERR_CONNECT_TIMEOUT') {
      console.warn('⚠️  Email notification timed out (network issue) - continuing...');
    } else {
      console.error('❌ Failed to send email notification:', error.message);
    }
    // Don't re-throw - we don't want publishing to fail because of email issues
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const type = (process.argv[2] || 'info') as 'success' | 'error' | 'info';
  const subject = process.argv[3] || 'Test Notification';
  const message = process.argv[4] || 'This is a test message from Pravos automation';

  sendNotification({ type, subject, message })
    .then(() => console.log('✅ Done'))
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}
