# Working agreement

- Use the user's default delivery flow: create a branch → commit logical changes → push → open a PR → wait for required checks → merge. Related tasks may share one branch with separate commits.
- Do not bypass branch protection or CI. After merging, fast-forward local `main` and verify a clean working tree.
- Run `npm run verify`, `npm run build`, and relevant browser tests before delivery. Run UI checks after verification scripts finish to avoid competing Vite dependency caches.
- Keep existing Korean copy, Pretendard typography, and theme tokens unless the requested change calls for a redesign.
- Distinguish automated/agent checks, CI virtual machines, actual devices, and real participant feedback. Never claim participant testing or hardware coverage that has not happened.
