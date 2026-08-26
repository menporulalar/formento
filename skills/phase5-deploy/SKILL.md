---
name: phase5-deploy
description: This skill should be used when the user asks to "run Phase 5", "deploy the app", "hand off the project", or invokes "/phase5-deploy" for Deploy & Handoff.
argument-hint: ""
allowed-tools: Task, AskUserQuestion
---

Invoke the `deploy-agent` subagent to provision the Docker/VPS deployment, env config, and generated docs, consistent with the project's existing `/opt/`-style self-hosted compose conventions.

Confirm target host/VPS and domain with the user before provisioning anything that costs money or claims a domain.

Invoke `review-coordinator` to run `deploy-reviewer` (secrets, reachability, handoff-doc completeness) and aggregate findings. Only invoke `checkpoint-reviewer` for final sign-off once no blocking findings remain. The project is only complete once a deployed URL is confirmed reachable and the user has signed off.
