# skybox005000 Portfolio

Personal portfolio for Daryl John Jeannoh Bravo, focused on full-stack engineering, Generative AI, agentic AI, cloud, DevOps, and production delivery.

## Requirements

- Node.js 18.20 or newer
- pnpm 10.13.1

## Run Locally

Use the lightweight run script:

```bat
run-portfolio.cmd
```

Then open:

```text
http://localhost:3000
```

## GenAI Integration

Ask Portfolio AI and Job Match can generate grounded responses from retrieved portfolio evidence. Set the AI provider secret locally or in GitHub Actions before deploying.

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm typecheck
```

## Production

The production Docker deployment uses:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## GitHub

Before pushing, keep local-only files out of git:

- `.env`
- `.data/`
- `node_modules/`
- `apps/web/.next/`
- `apps/web/.next-local/`

The included GitHub Actions workflow runs install, typecheck, and build on every push and pull request.
