---
description: Knowledge base lookup for support triage. Load when classifying tickets or choosing escalation paths.
---

# Knowledge base lookup

## When to use

- Customer asks how to do something covered by self-serve docs.
- Ticket mentions billing, security, legal, or data-loss keywords.
- You need an escalation owner before recommending action.

## Workflow

1. Call `search_kb` with the ticket topic (e.g. "billing dispute", "security", "legal hold").
2. Cite the matching article id and title in your reply.
3. If KB says escalate, state the escalation tag and owner explicitly.
4. If no KB match, say so and fall back to `search_records` on local queue data.

## Escalation triggers (always check KB first)

- Billing disputes over policy thresholds → Finance
- Security / data exposure → Security-OnCall
- Legal / subpoena → Legal queue