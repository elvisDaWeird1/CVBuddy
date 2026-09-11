# DEP-014 — Frontend CI release gate

Uses `npm ci`, regression tests, lint, web build, and a production Docker image
build. The workflow is scoped to the web repository and does not gate mobile release.
