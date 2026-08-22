---
description: Run Phase 5 — Deploy & Handoff
---

Invoke the `deploy-agent` subagent to provision the Docker/VPS deployment, env config, and generated docs, consistent with the project's existing `/opt/`-style self-hosted compose conventions.

Confirm target host/VPS and domain with the user before provisioning anything that costs money or claims a domain.

Invoke `checkpoint-reviewer` for final sign-off. The project is only complete once a deployed URL is confirmed reachable and the user has signed off.

