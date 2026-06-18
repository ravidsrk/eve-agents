# 14 · Codebase / Filesystem Agent

**Rationale.** Clone a real repository into the sandbox and answer questions about it using
`bash` + git + the file tools. Demonstrates real network egress (git clone) and filesystem
inspection inside a SuperServe microVM.

**Stack.** OpenRouter `openai/gpt-oss-120b` · SuperServe `superserve/base` (git/curl/coreutils).

## Run
```bash
bash run_archetype.sh archetypes/14-codebase 3123 "Clone sindresorhus/yocto-queue; how many files and what does it do?"
```

## Proof (see `run.log`)
Cloned `yocto-queue`, ran `git ls-files | wc -l` → **13 files**, read `package.json` →
*"tiny queue data structure"*. Final answer: **13 tracked files; a tiny queue data structure**.

## Failures hit + fixes
- gpt-oss-120b occasionally leaks a follow-up tool call into its reasoning text on multi-step turns
  (ends the turn with no message). Guiding it to gather everything in **one combined bash command**
  made it reliable.

## Cost notes
~few k tokens; one `base` microVM + a shallow git clone. ≈ $0.001.
