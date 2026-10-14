# Persia Market management and provider setup

The dashboard, catalogue, daily offers, captured demo orders and provider controls are implemented. A real administrator mailbox and WhatsApp Business Platform account have not yet been supplied. No provider credentials are bundled, and no external message was sent during implementation.

## Email setup

1. Create the management inbox. A mailbox provider and sending provider serve different purposes; Resend sends the order notifications and does not replace the management inbox.
2. Choose and verify a sending domain in Resend. Add the required DNS records in the domain's DNS service. The temporary Railway hostname cannot be used as a customer-controlled sending domain.
3. Set `RESEND_API_KEY`, `ORDER_NOTIFY_TO` and `ORDER_EMAIL_FROM` securely in the Railway service Variables. `ORDER_NOTIFY_TO` is the management inbox and `ORDER_EMAIL_FROM` is one verified sender address, without a display name. Do not commit credentials, send them in chat or put them in client-side configuration.
4. Redeploy, sign in to `/admin.html?view=integrations`, and enable automatic order notifications. Existing queued demo notifications will also be processed. Subjects clearly identify the current demo checkout mode.
5. Review provider acceptance/failures on the Orders page. A provider-accepted notification is not proof of delivery to an inbox. Failed attempts may be retried within the bounded retry window; ambiguous older attempts require checking the provider dashboard before any manual send.

Sources: [Resend domain setup](https://resend.com/docs/dashboard/domains/introduction), [send email API](https://resend.com/docs/api-reference/emails/send-email), [24-hour idempotency behavior](https://resend.com/docs/dashboard/emails/idempotency-keys).

## WhatsApp setup

1. Create the appropriate Meta developer/business account and WhatsApp Business Platform configuration. Register the intended business number and complete any required account verification in the official provider flow.
2. Configure `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` and `WHATSAPP_API_VERSION` on Railway. Use a random verification token of at least 24 characters. Use the Graph API version selected for the Meta app, such as `vNN.0`; do not copy that placeholder as an actual version.
3. Register `https://persia-market-production.up.railway.app/api/webhooks/whatsapp` as the webhook and enter the verification token directly in Meta. Subscribe the app to the appropriate WhatsApp message events.
4. Enable incoming-message replies in Admin → Connections. Send an inbound product query from a permitted test phone and verify the provider response before general use. No outbound cold-message campaign is included.
5. The bot answers product names, prices and stock from the public catalogue. A tracking question receives the private account link. Full order/status tracking and ordering through WhatsApp require a separate verified customer-identity and production ordering flow.

Sources: [Meta app management](https://developers.facebook.com/apps/), [Meta's WhatsApp Cloud API collection](https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api).

## Current commerce boundary

Orders are explicitly labelled demo. Server verification protects catalogue prices and stock limits, but demo confirmation does not take payment, calculate shipping, reserve stock or create a tax invoice. No customer street address is collected. These production-commerce requirements remain separate from provider account setup.

Existing browser-only receipts remain downloadable; they are not silently imported into the server. Newly confirmed checkouts receive a server reference. Admin access retains the existing mandatory production MFA and role protection.
