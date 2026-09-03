# EMPEROR Task Management

**BUILD. LEAD. CREATE.**

A focused personal task-management workspace with local persistence, task CRUD, status tracking, search, filters, sorting, deadline calendar, progress metrics, notifications, and responsive cinematic UI.

## Run locally

```bash
npm install
npm run dev
```

Task data is persisted in the browser with `localStorage`.

## Optional API

The repository includes a small JSON-backed CRUD API. The API key is provided
through an environment variable and must never be committed to GitHub.

```bash
copy .env.example .env
# set EMPEROR_API_KEY in your shell/environment
npm run api
```

Endpoints:

- `GET /health`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

Send the key using the `X-API-Key` header. Set `FRONTEND_ORIGIN` when deploying
the API to restrict browser access to the hosted frontend.
