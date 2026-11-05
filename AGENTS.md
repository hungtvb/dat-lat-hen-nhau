# Agent working agreement

Before each independent repository task, read the latest `AGENTS.md` from the target branch and any nested instructions. Review the applicable design docs before changing behavior. Explain the intended code changes and verification plan before editing; significant changes require an approved implementation plan.

- Work in a feature branch and submit a PR. Do not commit application changes directly to `main`.
- Preserve the GDD's social sightseeing concept: no combat, quests, scores, or unsolicited features.
- Keep the server authoritative for multiplayer state; do not trust client-provided positions or invite tokens in logs.
- Distinguish unit/contract checks from actual Colyseus, WebGL and two-browser E2E verification. Never claim unrun tests passed.
- Keep `README.md` focused on introduction, setup and running; detailed design, decisions and evidence belong in `docs/`.
- Update implementation status, acceptance criteria and PR notes when behavior or test evidence changes.
