import { getAppUrl } from "@/lib/app-url";

const APP_URL = getAppUrl();

function wrap(title, body) {
  return `<!doctype html>
<html>
  <body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px">
    <table role="presentation" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" width="600" style="max-width:100%;background:white;border-radius:16px;padding:32px">
            <tr>
              <td>
                <h1 style="font-size:24px;margin:0 0 16px">${title}</h1>
                ${body}
                <p style="color:#666;font-size:12px;margin-top:32px">
                  Aurelia Commerce transactional message.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function smtpConfig() {
  const enabled = process.env.ENABLE_SMTP === "true";
  const host = String(process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = String(process.env.SMTP_USER || "").trim();
  // Google displays app passwords in groups. Removing whitespace makes either
  // pasted format work reliably.
  const pass = String(process.env.SMTP_PASS || "").replace(/\s+/g, "");
  const secure =
    process.env.SMTP_SECURE === "true" ||
    (process.env.SMTP_SECURE !== "false" && port === 465);

  const from = String(
    process.env.SMTP_FROM ||
      (user ? `Aurelia Commerce <${user}>` : "")
  ).trim();

  return {
    enabled,
    host,
    port,
    secure,
    user,
    pass,
    from,
    replyTo: String(process.env.SMTP_REPLY_TO || "").trim() || undefined,
  };
}

async function sendViaSmtp({ to, subject, html, text }) {
  const config = smtpConfig();

  if (!config.enabled) {
    return {
      sent: false,
      skipped: true,
      provider: "smtp",
      reason: "smtp-disabled",
    };
  }

  if (!config.host || !config.user || !config.pass || !config.from) {
    return {
      sent: false,
      skipped: true,
      provider: "smtp",
      reason: "smtp-misconfigured",
      missing: [
        !config.host ? "SMTP_HOST" : null,
        !config.user ? "SMTP_USER" : null,
        !config.pass ? "SMTP_PASS" : null,
        !config.from ? "SMTP_FROM" : null,
      ].filter(Boolean),
    };
  }

  const nodemailer = await import("nodemailer");

  const transporter = nodemailer.default.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 15000),
    tls: {
      minVersion: "TLSv1.2",
    },
  });

  const result = await transporter.sendMail({
    from: config.from,
    to,
    subject,
    html,
    text,
    replyTo: config.replyTo,
  });

  return {
    sent: true,
    provider: "smtp",
    result: {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      response: result.response,
    },
  };
}

export async function sendEmail(message) {
  if (!message?.to) {
    return {
      sent: false,
      skipped: true,
      provider: "smtp",
      reason: "missing-recipient",
    };
  }

  const payload = {
    ...message,
    subject: message.subject || "Aurelia Commerce",
    html:
      message.html ||
      wrap(message.subject || "Notification", message.body || ""),
  };

  const isDevelopment = process.env.NODE_ENV !== "production";
  const devEmailEnabled = process.env.ENABLE_DEV_EMAIL === "true";

  if (isDevelopment && !devEmailEnabled) {
    console.info("[email:smtp:dev-skipped]", {
      to: payload.to,
      subject: payload.subject,
    });

    return {
      sent: false,
      skipped: true,
      provider: "smtp",
      reason: "development-email-disabled",
    };
  }

  try {
    const result = await sendViaSmtp(payload);

    if (result?.skipped) {
      console.warn("[email:smtp:skipped]", {
        to: payload.to,
        subject: payload.subject,
        reason: result.reason,
        missing: result.missing || [],
      });

      return result;
    }

    console.info("[email:smtp:sent]", {
      to: payload.to,
      subject: payload.subject,
      messageId: result?.result?.messageId || null,
    });

    return result;
  } catch (error) {
    console.error("[email:smtp:error]", {
      to: payload.to,
      subject: payload.subject,
      name: error?.name,
      code: error?.code,
      command: error?.command,
      responseCode: error?.responseCode,
      response: error?.response,
      message: error?.message,
      stack: error?.stack,
    });

    // Email is a side effect. Returning a failure result keeps checkout,
    // payment reconciliation, account updates, and admin actions from being
    // rolled back just because Gmail SMTP is temporarily unavailable.
    return {
      sent: false,
      skipped: false,
      provider: "smtp",
      reason: "smtp-send-failed",
      error: error?.message || "SMTP send failed",
    };
  }
}

export const emailTemplates = {
  verifyEmail: (name, token) => ({
    subject: "Verify your email",
    html: wrap(
      "Verify your email",
      `<p>Hello ${name},</p><p>Confirm your email to finish setting up your account.</p><p><a href="${APP_URL}/verify-email?token=${encodeURIComponent(token)}">Verify email</a></p>`
    ),
  }),

  passwordReset: (name, token) => ({
    subject: "Reset your password",
    html: wrap(
      "Reset your password",
      `<p>Hello ${name},</p><p><a href="${APP_URL}/reset-password?token=${encodeURIComponent(token)}">Reset password</a>. This link expires soon.</p>`
    ),
  }),

  orderPlaced: (name, orderNumber, total, currency) => ({
    subject: `Order ${orderNumber} received`,
    html: wrap(
      "Order received",
      `<p>Hello ${name},</p><p>We received order <strong>${orderNumber}</strong> for ${currency} ${Number(total).toFixed(2)}.</p>`
    ),
  }),

  orderStatus: (orderNumber, status) => ({
    subject: `Order ${orderNumber}: ${status.replaceAll("_", " ")}`,
    html: wrap(
      "Order update",
      `<p>Your order <strong>${orderNumber}</strong> is now <strong>${status.replaceAll("_", " ")}</strong>.</p>`
    ),
  }),

  payment: (orderNumber, status) => ({
    subject: `Payment ${status}: ${orderNumber}`,
    html: wrap(
      `Payment ${status}`,
      `<p>Payment for order <strong>${orderNumber}</strong> is <strong>${status}</strong>.</p>`
    ),
  }),

  refund: (orderNumber, status, amount, currency) => ({
    subject: `Refund ${status}: ${orderNumber}`,
    html: wrap(
      `Refund ${status}`,
      `<p>Refund for <strong>${orderNumber}</strong>: ${currency} ${Number(amount).toFixed(2)} · ${status}.</p>`
    ),
  }),

  returnStatus: (orderNumber, status) => ({
    subject: `Return ${status}: ${orderNumber}`,
    html: wrap(
      `Return ${status}`,
      `<p>Your return for <strong>${orderNumber}</strong> is now <strong>${status}</strong>.</p>`
    ),
  }),

  wallet: (title, detail) => ({
    subject: title,
    html: wrap(title, `<p>${detail}</p>`),
  }),

  security: (title, detail) => ({
    subject: title,
    html: wrap(title, `<p>${detail}</p>`),
  }),
};
