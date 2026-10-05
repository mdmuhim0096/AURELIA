# Aurelia SMTP-only email setup (Gmail App Password + Vercel)

This build uses **SMTP only**. Resend and Brevo are not used by `src/lib/email/index.js`.

## Required Vercel environment variables

Set these for **Production**:

```env
ENABLE_SMTP=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-google-account@gmail.com
SMTP_PASS=your-16-character-google-app-password
SMTP_FROM=Aurelia Commerce <your-google-account@gmail.com>

APP_URL=https://aurelia-ten-weld.vercel.app
NEXT_PUBLIC_APP_URL=https://aurelia-ten-weld.vercel.app
```

Optional:

```env
SMTP_REPLY_TO=your-google-account@gmail.com
SMTP_CONNECTION_TIMEOUT=10000
SMTP_GREETING_TIMEOUT=10000
SMTP_SOCKET_TIMEOUT=15000
```

## Google account requirements

1. Enable Google 2-Step Verification.
2. Create a Google App Password for Mail / your Aurelia app.
3. Put the App Password in `SMTP_PASS`, not your normal Google password.
4. The code removes spaces from the pasted App Password automatically.

## Recommended Gmail settings

For port 587:

```env
SMTP_PORT=587
SMTP_SECURE=false
```

For port 465 instead:

```env
SMTP_PORT=465
SMTP_SECURE=true
```

Use one combination only. Port 587 is the recommended default in this build.

## Remove old providers from Vercel

You can delete these because this build does not use them:

```text
RESEND_API_KEY
RESEND_FROM
BREVO_API_KEY
BREVO_FROM
```

## Redeploy

After changing environment variables, redeploy the Vercel Production deployment.

## Logs

Successful mail:

```text
[email:smtp:sent]
```

Configuration issue:

```text
[email:smtp:skipped]
```

SMTP/Gmail failure:

```text
[email:smtp:error]
```

The error log includes the Nodemailer error code, SMTP response code, command and response text when available.

## Local testing

Development email is intentionally disabled unless you add:

```env
ENABLE_DEV_EMAIL=true
```

Then use the same SMTP variables in `.env.local` and restart `npm run dev`.
