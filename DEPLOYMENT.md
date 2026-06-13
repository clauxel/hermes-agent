# Deployment Guide

## Modes

Hermes Agent supports two deployment modes:

- `mock` — writes deployment artifacts to a local mock directory for development and testing
- `ssh` — connects to a real Linux server and deploys Hermes there

The mode is controlled by:

```json
{
  "deployment": {
    "provider": "mock"
  }
}
```

## 1. Prepare the Config File

Copy the example file:

```bash
copy hermes-agent.config.example.json hermes-agent.config.json
```

Then update these fields:

- `deployment.provider`
- `deployment.targetServer`
- `server.host`
- `server.port`
- `server.username`
- `server.password`
- `hermes.repoUrl`
- `hermes.repoRef`
- `hermes.baseDir`

## 2. Mock Deployment

Use this for local development:

```json
{
  "deployment": {
    "provider": "mock"
  }
}
```

Behavior:

- no real SSH connection is made
- deployment output is written under `data/mock-remote`
- tests use this mode by default

## 3. Real SSH Deployment

Use this for a real Linux host:

```json
{
  "deployment": {
    "provider": "ssh"
  }
}
```

Expected target characteristics:

- Linux server with SSH access
- root or equivalent privileged account
- outbound internet access for cloning/installing dependencies
- systemd available

During SSH deployment, the runtime will:

- clone or update the configured Hermes repository
- create a dedicated instance directory under:

```text
<baseDir>/instances/<instanceName>
```

- create a dedicated runtime user
- create and enable a dedicated systemd service
- write an instance `.env`
- generate a unique Hermes gateway token
- write the real console URL back to the PostgreSQL application database
- attempt to open the instance port via:
  - `firewall-cmd`
  - `ufw`
  - `iptables`

## 4. Local App Commands

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev:deploy
```

This script is the recommended development entrypoint. It is responsible for loading any
development values from `.env.development`, ensuring `QS_KEY` is present,
creating or reusing the SSH tunnel for the dev router on `116`, and exposing the local
Launch model proxy back to `116` through a reverse SSH tunnel.

Build:

```bash
npm run build
```

Start production mode:

```bash
npm run start
```

Run tests:

```bash
npm test
```

## 5. Production Release Checklist

Before pushing a production release, confirm:

- `npm test` passes
- `npm run build` passes
- `.env.production` points to the production PostgreSQL database instead of any development database
- `APP_ORIGIN` matches the public frontend origin
- `HERMES_CONFIG_PATH` points to the production deployment config file on the server
- Creem production credentials are present and `PAYMENT_PROVIDER=creem`, `CREEM_ENV=live`
- the production frontend build does not set `VITE_API_BASE_URL`, so browser traffic stays same-origin by default
- the server-side `hermes` service user has the required `~/.hermes/hermes.json` and `~/.hermes/agents/main/agent/auth-profiles.json`
- the Hermes archive or repository reference in `hermes-agent.config.json` is valid on the target server
- old test or failed instance services on the server are cleaned up before production verification
- the public site domain resolves to the Nginx host that fronts `npm run start`
- after deploy, `/api/runtime`, `/api/auth/me`, checkout return, and one real `Open console` path all return healthy results on the same site origin

## 6. Same-Host Production Deployment

Use this mode for `https://www.aigeamy.com/` so the same Node process serves both the frontend and `/api/*`.

For repeatable production releases, prefer the fixed deploy script:

```bash
scripts/deploy-production.sh
```

The script builds the frontend locally, packages a release archive without `.env.*` or other local secret files, uploads it to the production server, installs production dependencies, switches `/data/hermes-agent/app` to the new release, restarts `hermes-agent.service`, and checks `/api/runtime`.

Production secrets are not uploaded by the script. Keep them on the server in:

```text
/data/hermes-agent/hermes-agent.env
```

Useful overrides:

```bash
SKIP_BUILD=1 scripts/deploy-production.sh
DEPLOY_HOST=1.2.3.4 DEPLOY_KEY=/path/to/key scripts/deploy-production.sh
```

Recommended server layout:

```text
/data/hermes-agent/
  app/
  data/
  hermes-agent.env
  hermes-agent.config.json
```

Deploy steps on the Linux server:

```bash
sudo mkdir -p /data/hermes-agent
sudo chown $USER:$USER /data/hermes-agent
cd /data/hermes-agent
git clone git@github.com:wcsmomo02/hermes_launch.git app
cd app
npm install
npm run build
cp hermes-agent.config.example.json ../hermes-agent.config.json
cp deploy/hermes-agent.env.example ../hermes-agent.env
```

Then update:

- `/data/hermes-agent/hermes-agent.env`
- `/data/hermes-agent/hermes-agent.config.json`

Required production environment values:

- `APP_ORIGIN=https://www.aigeamy.com,https://aigeamy.com`
- `HERMES_DATA_DIR=/data/hermes-agent/data`
- `HERMES_CONFIG_PATH=/data/hermes-agent/hermes-agent.config.json`
- `HERMES_POSTGRES_HOST`
- `HERMES_POSTGRES_DB`
- `HERMES_POSTGRES_USER`
- `HERMES_POSTGRES_PASSWORD`
- `HERMES_TOKEN_SECRET`
- `HERMES_CONFIG_SECRET`
- `PAYMENT_PROVIDER=creem`
- `CREEM_ENV=live`
- `API_PROD_KEY` or `CREEM_API_KEY`
- optional `CREEM_WEBHOOK_SECRET`

Install the systemd unit:

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin hermes || true
sudo cp /data/hermes-agent/app/deploy/hermes-agent.service.example /etc/systemd/system/hermes-agent.service
sudo systemctl daemon-reload
sudo systemctl enable hermes-agent
sudo systemctl restart hermes-agent
sudo systemctl status hermes-agent
```

Put Nginx in front of the Node service:

```bash
sudo cp /data/hermes-agent/app/deploy/aigeamy.com.nginx.example /etc/nginx/sites-available/aigeamy.com.conf
sudo ln -sf /etc/nginx/sites-available/aigeamy.com.conf /etc/nginx/sites-enabled/aigeamy.com.conf
sudo nginx -t
sudo systemctl reload nginx
```

Verification:

```bash
curl -I https://www.aigeamy.com/
curl https://www.aigeamy.com/api/auth/me
```

Expected result:

- homepage returns `200`
- `/api/auth/me` returns JSON instead of `404 NOT_FOUND`
- direct visits to `/console?order=<id>` return the SPA instead of a platform 404 page
- `POST /api/launch-orders` works from the browser on the same domain

## 7. Optional Vercel Frontend Split Deployment

Use this mode only when the marketing site must stay on Vercel while the Node backend runs elsewhere. It is not the default production topology.

Recommended split:

- frontend: `https://www.aigeamy.com`
- backend: `https://api.aigeamy.com`

Frontend configuration on Vercel:

- `VITE_API_BASE_URL=https://api.aigeamy.com`
- keep the repo root [vercel.json](./vercel.json) in the deployed project so direct hits to `/console`, `/checkout`, `/plans`, `/privacy`, `/terms`, `/compare/*`, and `/solutions/*` rewrite to the SPA entry

Backend configuration:

- `APP_ORIGIN=https://www.aigeamy.com,https://aigeamy.com`
- put the canonical frontend origin first, because Creem hosted return URLs use the first configured origin
- all existing Creem, PostgreSQL, and Hermes deployment variables remain on the backend host

Behavior:

- the frontend calls `https://api.aigeamy.com/api/*`
- the backend accepts cross-origin credentialed requests from `https://www.aigeamy.com`
- Creem hosted return URLs send the user back to the frontend origin instead of the API origin

Verification:

```bash
curl https://api.aigeamy.com/api/auth/me
```

Expected result:

- the API responds with JSON
- browser checkout from the Vercel site can create orders and redirect to the payment provider
- direct requests such as `https://www.aigeamy.com/console?order=test` return the SPA shell instead of `404 NOT_FOUND`

Example frontend env file:

- [vercel-frontend.env.example](file:///d:/c_workspace/%E7%81%B5%E9%AD%82%E5%95%86%E4%BA%BA/Hermes%20Launch/deploy/vercel-frontend.env.example)

## 8. Real-Server Deployment Helper

There is a direct helper script for force-deploying a paid order to the configured real server:

```bash
node scripts/deploy-order-to-real-server.mjs
```

Deploy a specific order:

```bash
node scripts/deploy-order-to-real-server.mjs <orderId>
```

If you use encrypted local secrets, set the environment variables before running:

```bash
set HERMES_CONFIG_SECRET=your-config-secret
set HERMES_TOKEN_SECRET=your-token-secret
```

## 9. Data and Secrets

Do not commit:

- `hermes-agent.config.json`
- local `.env` files with live PostgreSQL or payment secrets
- exported database dumps
- any ad-hoc scratch data under `data/`

The repo already ignores them through [.gitignore](./.gitignore).

## 10. Payment Keys

Creem payment credentials are configured through environment variables.

- Active provider: `PAYMENT_PROVIDER=creem`
- Environment selector: `CREEM_ENV=test|live`
- Test API key: `API_TEST_KEY` or `CREEM_TEST_KEY`
- Live API key: `API_PROD_KEY`, `CREEM_API_KEY`, or `CREEM_KEY`
- Optional API override: `CREEM_BASE_URL`
- Optional webhook secret: `CREEM_WEBHOOK_SECRET`

Selection rules:

- If `CREEM_ENV=test`, the app uses the Creem test API key and test API endpoint
- If `CREEM_ENV=live`, the app uses the Creem live API key and live API endpoint
- If `PAYMENT_PROVIDER` is omitted, Creem is selected whenever a Creem API key is present
- PayPal variables are only used when `PAYMENT_PROVIDER=paypal` or no Creem API key is configured

## 11. Troubleshooting

### Console opens but asks for a gateway token

Use the in-app `Open console` button instead of opening the bare URL directly. The backend route will return a tokenized dashboard URL.

### Console URL points to a placeholder domain

Redeploy the instance with the current SSH runtime. New deployments write the real server URL back into the database.

### Console port is unreachable

Check:

- the Linux firewall on the target host
- cloud security group or provider firewall
- whether the service is listening on the expected port

### Channel token is missing or invalid

This no longer blocks console-first deployment. The Hermes console can still open, and the chat channel can be bound later.

### Homepage works but payment APIs return 404 online

This means the domain is serving only static frontend assets. Switch to the same-host production setup above so Nginx proxies both the landing page and `/api/*` to `npm run start`.
