# Production Deployment

This guide deploys `erenisiklab.com` as two Docker services inside an Ubuntu
Proxmox LXC:

```text
Cloudflare edge -> cloudflared -> frontend:3000
```

The frontend has no published host port. All public traffic enters through the
authenticated Cloudflare Tunnel.

## 1. Prepare the Ubuntu LXC

On the Proxmox host, enable the features Docker commonly needs:

```bash
pct set <CT_ID> -features nesting=1,keyctl=1
pct restart <CT_ID>
```

Use an unprivileged Ubuntu LXC where possible. Allocate at least 2 CPU cores,
2 GB RAM, and 8 GB storage for image builds.

## 2. Install Docker

Inside the LXC, enter the repository and run:

```bash
sudo bash scripts/install-docker-ubuntu.sh
```

Confirm the daemon and Compose plugin:

```bash
docker version
docker compose version
```

## 3. Create the Cloudflare Tunnel

1. Open Cloudflare Zero Trust.
2. Go to **Networks > Connectors > Cloudflare Tunnels**.
3. Create a Cloudflared tunnel and select the Docker connector instructions.
4. Copy only the token shown after `--token`.
5. Add a published application route for `erenisiklab.com`.
6. Set the service type to `HTTP`.
7. Set the service URL to `http://frontend:3000`.
8. Add `www.erenisiklab.com` as another route if required.

Do not use `localhost:3000` in the tunnel route. `cloudflared` reaches the
frontend by its Compose service name on the private `edge` network.

## 4. Configure Runtime Secrets

Create the runtime environment file:

```bash
cp .env.example .env
nano .env
chmod 600 .env
```

Set the tunnel token:

```dotenv
TUNNEL_TOKEN=your-cloudflare-tunnel-token
```

Mission Control runs in simulation mode when the Resend values are empty. For
live delivery, verify `erenisiklab.com` in Resend and set:

```dotenv
RESEND_API_KEY=re_your_key
CONTACT_TO_EMAIL=your-inbox@example.com
CONTACT_FROM_EMAIL="Eren Isik Lab <contact@erenisiklab.com>"
```

Secrets are read by Docker Compose at runtime. They are excluded from the build
context and are not embedded in the frontend image.

## 5. Validate the Compose Configuration

Render the resolved configuration before starting:

```bash
docker compose config --quiet
```

This command fails immediately when `TUNNEL_TOKEN` is missing.

## 6. Build and Start

Build the pinned multi-stage image and start the stack:

```bash
docker compose build --pull
docker compose up -d
```

Check health:

```bash
docker compose ps
docker compose logs --tail=100 frontend
docker compose logs --tail=100 cloudflared
```

The frontend should report `healthy`, and Cloudflared should show registered
tunnel connections. Visit `https://erenisiklab.com`.

## 7. Verify the Deployment

Check the public routes:

```bash
curl -I https://erenisiklab.com
curl -I https://erenisiklab.com/projects/sparse-gpu-kernels
curl https://erenisiklab.com/robots.txt
curl https://erenisiklab.com/sitemap.xml
```

Submit Mission Control once and confirm either `simulation` or `live` mode in
the returned JSON.

## 8. Update the Site

Pull and rebuild only from the repository directory:

```bash
git pull --ff-only
docker compose build --pull frontend
docker compose up -d --remove-orphans
docker image prune -f
```

Compose replaces the frontend after the new image is built. Cloudflared
continues reconnecting automatically.

## 9. Rotate Credentials

To rotate the Cloudflare token or Resend key:

1. Create the replacement credential in the provider dashboard.
2. Update `.env`.
3. Run `docker compose up -d --force-recreate`.
4. Confirm service health.
5. Revoke the previous credential.

Never commit `.env`, tunnel tokens, or Resend keys.

## 10. Roll Back

Check out the last known-good commit and rebuild:

```bash
git log --oneline -5
git checkout <KNOWN_GOOD_COMMIT>
docker compose up -d --build
```

Return to the deployment branch after the incident is resolved.

## 11. Operations

Follow logs:

```bash
docker compose logs -f --tail=100
```

Restart services:

```bash
docker compose restart
```

Stop the stack:

```bash
docker compose down
```

The services run as non-root where supported, drop all Linux capabilities, use
read-only filesystems, and apply `no-new-privileges`.

## Troubleshooting

- **Cloudflare returns 502:** verify the tunnel service is
  `http://frontend:3000` and `docker compose ps` shows the frontend healthy.
- **Cloudflared exits immediately:** replace the token in `.env` and ensure it
  belongs to the intended tunnel.
- **Docker fails in LXC:** confirm `nesting=1,keyctl=1` and review the LXC
  AppArmor and storage driver settings on the Proxmox host.
- **Mission Control stays in simulation mode:** confirm all three Resend values
  are non-empty, the sender domain is verified, and recreate the frontend.
- **A build runs out of memory:** raise the LXC memory allocation or add
  temporary swap for the image build.
