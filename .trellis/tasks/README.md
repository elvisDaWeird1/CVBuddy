# Trellis Tasks

Use `.trellis/tasks/` for short working notes on non-trivial frontend tasks. Do not store secrets, large logs, generated build output, or permanent API/UI reference data here.

Recommended shape:

```txt
.trellis/tasks/<task-slug>/
  task.md
```

Start from `.trellis/tasks/_template/task.md`. Keep notes short and tied to the current task. Trellis should record meaningful work done, changed files, validation, and follow-up notes; it should not become a second specification system.
