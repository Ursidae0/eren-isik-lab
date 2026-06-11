# Eren Isik Lab

A nature-led engineering portfolio for
[erenisiklab.com](https://erenisiklab.com), packaged for Docker and exposed
through a Cloudflare Tunnel.

## Stack

- Next.js App Router and TypeScript
- Tailwind CSS
- Canvas-based ambient animation
- Docker Compose
- Cloudflare Tunnel

## Architecture

```text
Internet
   |
Cloudflare edge (erenisiklab.com)
   |
cloudflared container
   |
frontend:3000 (private Docker network)
```

No inbound port needs to be opened on the LXC container. The `frontend`
service is only exposed to the Compose network.

## 1. Prepare the Proxmox LXC

Use an Ubuntu LXC container. Docker in LXC normally requires the Proxmox
features `nesting=1` and `keyctl=1`.

On the Proxmox host:

```bash
pct set <CT_ID> -features nesting=1,keyctl=1
pct restart <CT_ID>
```

Copy this repository into the container, enter the project directory, and
install Docker:

```bash
sudo bash scripts/install-docker-ubuntu.sh
```

## 2. Create the Cloudflare Tunnel

1. Open Cloudflare Zero Trust.
2. Go to **Networks > Tunnels** and create a Cloudflared tunnel.
3. Add a public hostname:
   - **Subdomain:** `@` for the apex, or `www`
   - **Domain:** `erenisiklab.com`
   - **Type:** `HTTP`
   - **URL:** `http://frontend:3000`
4. Open the tunnel's connector installation instructions and copy the token
   shown after `--token`.

Cloudflare manages the DNS record when the public hostname is saved.

The local atmosphere needs Cloudflare's **Add visitor location headers**
Managed Transform. Enable that transform for the zone so the origin receives
`cf-iplatitude`, `cf-iplongitude`, `cf-ipcity`, and `cf-ipcountry`.

## 3. Configure the Deployment

Create the local environment file:

```bash
cp .env.example .env
nano .env
```

Set the tunnel token:

```dotenv
TUNNEL_TOKEN=your-real-cloudflare-tunnel-token
```

The `.env` file is excluded from Git. Treat the token like a password.

## 4. Build and Start

```bash
docker compose up -d --build
```

Inspect service state and tunnel logs:

```bash
docker compose ps
docker compose logs -f cloudflared
```

When both services are healthy, visit:

```text
https://erenisiklab.com
```

The landing page should load with the forest hero, growing project timeline,
contextual resume link, and Atmosphere control.

## Local Atmosphere

The default **Local** setting follows the visitor's daylight, weather, and
wind. The server rounds Cloudflare coordinates to one decimal place, caches
conditions for 20 minutes, and never returns coordinates or an IP address to
the browser. Browser geolocation is not requested.

When location headers or the weather service are unavailable, the design
falls back to the visitor's browser clock. Visitors can select **Default** to
use the original forest or **Off** to remove ambient particles.

## Contact Email Delivery

The contact API works in simulation mode without additional configuration.
To deliver messages by email, create a Resend API key and add these values to
`.env`:

```dotenv
RESEND_API_KEY=re_your_key
CONTACT_TO_EMAIL=your-inbox@example.com
CONTACT_FROM_EMAIL=Eren Isik Lab <contact@erenisiklab.com>
```

The sender domain used by `CONTACT_FROM_EMAIL` must be verified in Resend.

## Local Docker Check

The production Compose file deliberately publishes no host ports. Use the
local override to bind the frontend to the host without starting Cloudflared:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.local.yml \
  up -d --build frontend
```

Then open `http://localhost:3000`.

Direct localhost requests do not include Cloudflare location headers, so the
Atmosphere control will use its browser-time fallback.

To use a different port, set `LOCAL_PORT` for the command:

```bash
LOCAL_PORT=8080 docker compose \
  -f docker-compose.yml \
  -f docker-compose.local.yml \
  up -d --build frontend
```

Stop the local stack with:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.local.yml \
  down
```

## Docker Tests

Run unit tests without installing Node dependencies on the host:

```bash
docker build --target test -t eren-isik-lab-test .
```

After building the production image, run the deterministic ambient integration
test. It starts a temporary mock weather service, production frontend, and
probe on an isolated Docker network:

```bash
docker compose build frontend
scripts/test-ambient-integration.sh
```

## Operations

Rebuild after pulling code changes:

```bash
docker compose up -d --build
```

View application logs:

```bash
docker compose logs -f frontend
```

Stop the deployment:

```bash
docker compose down
```

## Troubleshooting

- **Tunnel shows healthy but the site returns 502:** confirm that the
  Cloudflare public hostname service is exactly `http://frontend:3000`.
- **Docker fails inside LXC:** verify `nesting=1,keyctl=1`. Some unprivileged
  LXC configurations also need host-specific AppArmor or storage settings.
- **Compose reports a missing token:** confirm `.env` exists beside
  `docker-compose.yml` and contains `TUNNEL_TOKEN`.
- **DNS is not resolving:** verify that `erenisiklab.com` is active in the same
  Cloudflare account and that the tunnel public hostname was saved.
