# CI/CD Pipeline

## Overview

Pushing to `main` triggers a GitHub Actions workflow that builds both Docker images and publishes them to GitHub Container Registry.

Published images:

```
ghcr.io/geoandri/ai-coach/backend:latest
ghcr.io/geoandri/ai-coach/backend:<git-sha>

ghcr.io/geoandri/ai-coach/frontend:latest
ghcr.io/geoandri/ai-coach/frontend:<git-sha>
```

No secrets need to be configured — the workflow uses the automatic `GITHUB_TOKEN`.

Monitor builds at: **https://github.com/geoandri/ai-coach/actions**

## Strategy

Images are built for both `linux/amd64` and `linux/arm64` using native runners in parallel to avoid slow QEMU emulation:

1. **`build` job** — runs two matrix jobs simultaneously, one on `ubuntu-latest` (amd64) and one on `ubuntu-24.04-arm` (arm64), each producing a single-platform image tagged with the commit SHA and architecture suffix.
2. **`merge` job** — combines the two single-platform images into one multi-platform manifest tagged `:latest` and `:<git-sha>`.

## Skip condition

The workflow does not run when only `.md` files are changed.
