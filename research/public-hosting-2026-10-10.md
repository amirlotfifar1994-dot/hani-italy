# Public Node preview — 2026-10-10

Public URL: https://persia-market-production.up.railway.app/?lang=fa

The Railway service successfully deployed runtime commit `508fffc2dd03b43434bc7eea3943f41e4e370359` from `codex/persia-market-complete-preview`. Deployment ID: `018a98b4-c818-4655-903e-abb91e10fdca`. The service runs the Node 24 Docker image with one instance and a 500 MB persistent volume mounted at `/app/.local-data`. Account records, catalogue edits, uploaded images and owner setup tokens stay private on that volume. Local runtime data was not copied to the host.

## Verified remotely

- HTTPS `/healthz` returned 200 with `{"status":"ok"}`.
- Home pages in Persian, Italian and English, the Italian shop, Persian journal, Milan article, national shopping guide, product page and account page returned 200.
- The public catalogue contains 44 Hani SKUs plus six explicitly labelled examples. Three held draft SKUs returned 404 and were absent from the public catalogue.
- Product imagery returned 200 with `image/webp`.
- Product and settings administration APIs returned 401 without a session.
- `.env`, private account storage and the owner setup token were not publicly accessible (404).
- Persian home metadata uses the public canonical URL, with no localhost origin. Preview HTML continues to send `noindex, follow`; admin and API responses send `noindex, nofollow`.
- GitHub CI passed the complete checks and Docker build/startup smoke check for the deployed runtime commit. Isolated hosting checks cover secure cookies, proxy address handling, profile changes and account/setup-token persistence after restart.

This remote smoke check is read-only. It does not create fake customers or orders in the public database. Live Google sign-in, verification/recovery email, actual payments, permanent domain ownership and search indexing remain unconfigured. Real phone, email and physical address remain blank per the owner's instruction. Trial hosting is temporary and subject to Railway's current account allowance.

## Maintenance

Back up the SQLite database using SQLite backup facilities together with uploaded assets, privately. Do not commit the volume or setup token to GitHub. First owner setup requires the private one-time URL generated inside the service; public sign-up only grants the customer role.

A branch push did not automatically replace the initial failed deployment during this session. Do not assume a working GitHub deployment webhook. Use Railway's authenticated `serviceInstanceDeployV2` operation with the exact reviewed commit SHA, or reconnect the configured repository and branch, then verify the deployment's actual commit and `/healthz`. Standard redeploy may reuse the previous commit. No hosting token belongs in the repository.

The live service has explicit `/healthz` readiness, a 120-second readiness timeout, `node tools/preview.mjs` start command and failure restart policy. `railway.json` is a legacy provider configuration supported until 2026-12-01 according to the installed CLI; migrate to current Infrastructure as Code before that cutoff if keeping this deployment.

Official references: [Railway API deployment](https://docs.railway.com/integrations/api/manage-services), [volumes](https://docs.railway.com/volumes), [trial limits](https://docs.railway.com/pricing/free-trial), [configuration migration](https://docs.railway.com/infrastructure-as-code#migrating-from-config-as-code).
