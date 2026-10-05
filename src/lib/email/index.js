// const FROM = process.env.EMAIL_FROM || "Aurelia Commerce <noreply@example.com>";
// const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// function wrap(title, body) {
//   return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px"><table role="presentation" width="100%"><tr><td align="center"><table role="presentation" width="600" style="max-width:100%;background:white;border-radius:16px;padding:32px"><tr><td><h1 style="font-size:24px;margin:0 0 16px">${title}</h1>${body}<p style="color:#666;font-size:12px;margin-top:32px">Aurelia Commerce transactional message.</p></td></tr></table></td></tr></table></body></html>`;
// }

// async function viaResend({ to, subject, html }) {
//   const key = process.env.RESEND_API_KEY;
//   if (!key) return null;
//   const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM, to: [to], subject, html }) });
//   if (!response.ok) throw new Error(`Resend failed: ${response.status}`);
//   return response.json();
// }

// async function viaBrevo({ to, subject, html }) {
//   const key = process.env.BREVO_API_KEY;
//   if (!key) return null;
//   const senderMatch = FROM.match(/^(.*)<([^>]+)>$/);
//   const sender = senderMatch ? { name: senderMatch[1].trim(), email: senderMatch[2].trim() } : { email: FROM };
//   const response = await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { "api-key": key, "Content-Type": "application/json" }, body: JSON.stringify({ sender, to: [{ email: to }], subject, htmlContent: html }) });
//   if (!response.ok) throw new Error(`Brevo failed: ${response.status}`);
//   return response.json();
// }

// async function viaSmtp({ to, subject, html }) {
//   if (!process.env.SMTP_HOST || process.env.ENABLE_SMTP !== "true") return null;
//   const nodemailer = await import("nodemailer");
//   const transporter = nodemailer.default.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT || 587),
//     secure: process.env.SMTP_SECURE === "true",
//     auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
//   });
//   return transporter.sendMail({ from: FROM, to, subject, html });
// }

// export async function sendEmail(message) {
//   if (!message?.to) return { skipped: true, reason: "missing-recipient" };
//   const payload = { ...message, html: message.html || wrap(message.subject || "Notification", message.body || "") };
//   for (const provider of [viaResend, viaBrevo, viaSmtp]) {
//     const result = await provider(payload);
//     if (result) return { sent: true, result };
//   }
//   if (process.env.NODE_ENV !== "production") console.info("[email:dev]", { to: payload.to, subject: payload.subject });
//   return { skipped: true, reason: "no-provider-configured" };
// }

// export const emailTemplates = {
//   verifyEmail: (name, token) => ({ subject: "Verify your email", html: wrap("Verify your email", `<p>Hello ${name},</p><p>Confirm your email to finish setting up your account.</p><p><a href="${APP_URL}/verify-email?token=${encodeURIComponent(token)}">Verify email</a></p>`) }),
//   passwordReset: (name, token) => ({ subject: "Reset your password", html: wrap("Reset your password", `<p>Hello ${name},</p><p><a href="${APP_URL}/reset-password?token=${encodeURIComponent(token)}">Reset password</a>. This link expires soon.</p>`) }),
//   orderPlaced: (name, orderNumber, total, currency) => ({ subject: `Order ${orderNumber} received`, html: wrap("Order received", `<p>Hello ${name},</p><p>We received order <strong>${orderNumber}</strong> for ${currency} ${Number(total).toFixed(2)}.</p>`) }),
//   orderStatus: (orderNumber, status) => ({ subject: `Order ${orderNumber}: ${status.replaceAll("_", " ")}`, html: wrap("Order update", `<p>Your order <strong>${orderNumber}</strong> is now <strong>${status.replaceAll("_", " ")}</strong>.</p>`) }),
//   payment: (orderNumber, status) => ({ subject: `Payment ${status}: ${orderNumber}`, html: wrap(`Payment ${status}`, `<p>Payment for order <strong>${orderNumber}</strong> is <strong>${status}</strong>.</p>`) }),
//   refund: (orderNumber, status, amount, currency) => ({ subject: `Refund ${status}: ${orderNumber}`, html: wrap(`Refund ${status}`, `<p>Refund for <strong>${orderNumber}</strong>: ${currency} ${Number(amount).toFixed(2)} · ${status}.</p>`) }),
//   returnStatus: (orderNumber, status) => ({ subject: `Return ${status}: ${orderNumber}`, html: wrap(`Return ${status}`, `<p>Your return for <strong>${orderNumber}</strong> is now <strong>${status}</strong>.</p>`) }),
//   wallet: (title, detail) => ({ subject: title, html: wrap(title, `<p>${detail}</p>`) }),
//   security: (title, detail) => ({ subject: title, html: wrap(title, `<p>${detail}</p>`) })
// };

const FROM =
  process.env.EMAIL_FROM ||
  "Aurelia Commerce <noreply@example.com>";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

function wrap(title, body) {
  return `<!doctype html>
<html>
  <body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px">
    <table role="presentation" width="100%">
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="600"
            style="max-width:100%;background:white;border-radius:16px;padding:32px"
          >
            <tr>
              <td>
                <h1 style="font-size:24px;margin:0 0 16px">
                  ${title}
                </h1>

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

async function viaResend({
  to,
  subject,
  html,
}) {
  const key =
    process.env.RESEND_API_KEY;

  if (!key) {
    return null;
  }

  const response =
    await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${key}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          from: FROM,
          to: [to],
          subject,
          html,
        }),
      }
    );

  if (!response.ok) {
    const errorBody =
      await response.text();

    throw new Error(
      `Resend failed: ${response.status} ${errorBody}`
    );
  }

  return response.json();
}

async function viaBrevo({
  to,
  subject,
  html,
}) {
  const key =
    process.env.BREVO_API_KEY;

  if (!key) {
    return null;
  }

  const senderMatch =
    FROM.match(
      /^(.*)<([^>]+)>$/
    );

  const sender = senderMatch
    ? {
      name:
        senderMatch[1].trim(),

      email:
        senderMatch[2].trim(),
    }
    : {
      email: FROM,
    };

  const response =
    await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",

        headers: {
          "api-key": key,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          sender,

          to: [
            {
              email: to,
            },
          ],

          subject,

          htmlContent: html,
        }),
      }
    );

  if (!response.ok) {
    const errorBody =
      await response.text();

    throw new Error(
      `Brevo failed: ${response.status} ${errorBody}`
    );
  }

  return response.json();
}

async function viaSmtp({
  to,
  subject,
  html,
}) {
  if (
    !process.env.SMTP_HOST ||
    process.env.ENABLE_SMTP !==
    "true"
  ) {
    return null;
  }

  const nodemailer =
    await import("nodemailer");

  const transporter =
    nodemailer.default.createTransport(
      {
        host:
          process.env.SMTP_HOST,

        port:
          Number(
            process.env.SMTP_PORT ||
            587
          ),

        secure:
          process.env.SMTP_SECURE ===
          "true",

        auth:
          process.env.SMTP_USER
            ? {
              user:
                process.env
                  .SMTP_USER,

              pass:
                process.env
                  .SMTP_PASS,
            }
            : undefined,
      }
    );

  return transporter.sendMail({
    from: FROM,
    to,
    subject,
    html,
  });
}

export async function sendEmail(
  message
) {
  if (!message?.to) {
    return {
      skipped: true,
      reason:
        "missing-recipient",
    };
  }

  const payload = {
    ...message,

    html:
      message.html ||
      wrap(
        message.subject ||
        "Notification",

        message.body || ""
      ),
  };

  /*
   * DEVELOPMENT EMAIL CONTROL
   *
   * When running locally:
   *
   * ENABLE_DEV_EMAIL=false
   *
   * means:
   * - do not call Resend
   * - do not call Brevo
   * - do not call SMTP
   * - only log the email
   *
   * This prevents local checkout/register/etc.
   * from failing because of external email providers.
   */
  const isDevelopment =
    process.env.NODE_ENV !==
    "production";

  const devEmailEnabled =
    process.env
      .ENABLE_DEV_EMAIL ===
    "true";

  if (
    isDevelopment &&
    !devEmailEnabled
  ) {
    console.info(
      "[email:dev:skipped]",
      {
        from: FROM,
        to: payload.to,
        subject:
          payload.subject,
      }
    );

    return {
      skipped: true,
      reason:
        "development-email-disabled",
    };
  }

  /*
   * Try providers in order.
   *
   * Resend -> Brevo -> SMTP
   */
  const providers = [
    viaResend,
    viaBrevo,
    viaSmtp,
  ];

  for (
    const provider
    of providers
  ) {
    try {
      const result =
        await provider(
          payload
        );

      if (result) {
        return {
          sent: true,
          result,
        };
      }
    } catch (error) {
      console.error(
        "[email:provider:error]",
        error
      );

      /*
       * In development, don't let
       * provider errors break app flows.
       */
      if (isDevelopment) {
        continue;
      }

      /*
       * In production, rethrow so serious
       * provider problems remain visible.
       */
      throw error;
    }
  }

  if (isDevelopment) {
    console.info(
      "[email:dev:no-provider]",
      {
        to: payload.to,
        subject:
          payload.subject,
      }
    );
  }

  return {
    skipped: true,
    reason:
      "no-provider-configured",
  };
}

export const emailTemplates = {
  verifyEmail: (
    name,
    token
  ) => ({
    subject:
      "Verify your email",

    html: wrap(
      "Verify your email",

      `
        <p>Hello ${name},</p>

        <p>
          Confirm your email to finish
          setting up your account.
        </p>

        <p>
          <a href="${APP_URL}/verify-email?token=${encodeURIComponent(
        token
      )}">
            Verify email
          </a>
        </p>
      `
    ),
  }),

  passwordReset: (
    name,
    token
  ) => ({
    subject:
      "Reset your password",

    html: wrap(
      "Reset your password",

      `
        <p>Hello ${name},</p>

        <p>
          <a href="${APP_URL}/reset-password?token=${encodeURIComponent(
        token
      )}">
            Reset password
          </a>.

          This link expires soon.
        </p>
      `
    ),
  }),

  orderPlaced: (
    name,
    orderNumber,
    total,
    currency
  ) => ({
    subject:
      `Order ${orderNumber} received`,

    html: wrap(
      "Order received",

      `
        <p>Hello ${name},</p>

        <p>
          We received order
          <strong>${orderNumber}</strong>
          for
          ${currency}
          ${Number(
        total
      ).toFixed(2)}.
        </p>
      `
    ),
  }),

  orderStatus: (
    orderNumber,
    status
  ) => ({
    subject:
      `Order ${orderNumber}: ${status.replaceAll(
        "_",
        " "
      )}`,

    html: wrap(
      "Order update",

      `
        <p>
          Your order
          <strong>${orderNumber}</strong>
          is now
          <strong>
            ${status.replaceAll(
        "_",
        " "
      )}
          </strong>.
        </p>
      `
    ),
  }),

  payment: (
    orderNumber,
    status
  ) => ({
    subject:
      `Payment ${status}: ${orderNumber}`,

    html: wrap(
      `Payment ${status}`,

      `
        <p>
          Payment for order
          <strong>${orderNumber}</strong>
          is
          <strong>${status}</strong>.
        </p>
      `
    ),
  }),

  refund: (
    orderNumber,
    status,
    amount,
    currency
  ) => ({
    subject:
      `Refund ${status}: ${orderNumber}`,

    html: wrap(
      `Refund ${status}`,

      `
        <p>
          Refund for
          <strong>${orderNumber}</strong>:
          ${currency}
          ${Number(
        amount
      ).toFixed(2)}
          ·
          ${status}.
        </p>
      `
    ),
  }),

  returnStatus: (
    orderNumber,
    status
  ) => ({
    subject:
      `Return ${status}: ${orderNumber}`,

    html: wrap(
      `Return ${status}`,

      `
        <p>
          Your return for
          <strong>${orderNumber}</strong>
          is now
          <strong>${status}</strong>.
        </p>
      `
    ),
  }),

  wallet: (
    title,
    detail
  ) => ({
    subject: title,

    html: wrap(
      title,

      `
        <p>${detail}</p>
      `
    ),
  }),

  security: (
    title,
    detail
  ) => ({
    subject: title,

    html: wrap(
      title,

      `
        <p>${detail}</p>
      `
    ),
  }),
};
