# Wanderlog — 7-day Vacation Planner

A beautiful, opinionated planner for a one-week trip with day-by-day
itinerary, scattered stays, shared spend tracking in GBP, a visual timelapse
of how packed each day is, and a built-in time-fit predictor that warns you
when a day won't fit into the hours you have.

Built with **Next.js 14** + **TypeScript** + **Tailwind**, persisted to
**BigQuery**, and ready to deploy on **Cloud Run**.

## Features

- **Day-wise planning** — pick a day, add attractions with start times,
  duration, travel and cost.
- **Scattered stays** — hotels/rentals can span any subset of days; the day
  view automatically shows where you're sleeping that night.
- **Trip timelapse** — at-a-glance bar chart of how packed every day is, with
  green/amber/red status.
- **Time-fit predictor** — sums up planned minutes vs. a 14-hour awake budget
  per day and tells you which days won't fit.
- **Cost tracker (GBP)** — log expenses by category and day. Cards show
  spent-so-far, grand total, and per-person share for shared bills.
- **BigQuery persistence** — every change writes through to BigQuery; the UI
  is stateless on reload.

## Stack

| Layer       | Tech                                      |
|-------------|-------------------------------------------|
| Frontend    | Next.js 14 App Router, React, Tailwind    |
| API         | Next.js route handlers (Node runtime)     |
| Persistence | BigQuery (`@google-cloud/bigquery`)       |
| Hosting     | Cloud Run (Docker, standalone Next build) |

## Local development

### Prerequisites
- Node 20+
- A GCP project with BigQuery API enabled
- `gcloud` CLI authenticated

### 1. Install
```bash
npm install
```

### 2. Authenticate to GCP locally
```bash
gcloud auth application-default login
```
This writes ADC (Application Default Credentials) so the BigQuery client
authenticates without a service-account key file.

### 3. Configure environment
```bash
cp .env.example .env.local
# edit .env.local — at minimum set GCP_PROJECT_ID
```

### 4. Initialise the dataset
Either:
```bash
npm run init-db
```
…or just run the app and POST to `/api/init` (the UI does this automatically
on first load).

### 5. Run
```bash
npm run dev
```
Open http://localhost:3000.

## Deploying to Cloud Run

The repo includes a `Dockerfile` (multi-stage, output: standalone) and a
`cloudbuild.yaml`.

### One-time setup
1. **Artifact Registry** repo named `cloud-run-builds` in your chosen region:
   ```bash
   gcloud artifacts repositories create cloud-run-builds \
     --repository-format=docker \
     --location=europe-west2
   ```
2. **Service account** for the Cloud Run service with BigQuery access:
   ```bash
   gcloud iam service-accounts create vacation-planner-sa
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member=serviceAccount:vacation-planner-sa@$PROJECT_ID.iam.gserviceaccount.com \
     --role=roles/bigquery.dataEditor
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member=serviceAccount:vacation-planner-sa@$PROJECT_ID.iam.gserviceaccount.com \
     --role=roles/bigquery.jobUser
   ```

### Deploy
```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=vacation-planner,_REGION=europe-west2,_REPO=cloud-run-builds
```

After the first deploy, attach the service account to the Cloud Run service:
```bash
gcloud run services update vacation-planner \
  --region=europe-west2 \
  --service-account=vacation-planner-sa@$PROJECT_ID.iam.gserviceaccount.com
```

On Cloud Run no key file is needed — ADC picks up the runtime service
account automatically.

## BigQuery schema

`/api/init` (and `npm run init-db`) creates these tables in
`${GCP_PROJECT_ID}.${BQ_DATASET}`:

| Table         | Purpose                                       |
|---------------|-----------------------------------------------|
| `trips`       | Trip metadata (id, name, dates, travellers)   |
| `attractions` | Per-day stops (name, time, duration, cost…)   |
| `stays`       | Hotels/rentals with check-in / check-out date |
| `expenses`    | Free-form spend log, optional day + category  |

All money is stored as `FLOAT64` GBP. The schema is created idempotently —
re-running `init-db` is safe.

## Project layout

```
app/                  # Next.js App Router pages + API routes
  api/
    init/             # Idempotently creates dataset + tables
    trip/             # GET = trip summary; PUT = update trip metadata
    attractions/      # CRUD
    stays/            # CRUD
    expenses/         # CRUD
components/           # UI (Dashboard, DayPlanner, Timelapse, modals…)
lib/
  bigquery.ts         # BigQuery client + queries + schema
  time.ts             # Summary builder, predictor, formatters
  types.ts            # Shared TS types
scripts/init-db.ts    # CLI for one-shot schema bootstrap
Dockerfile            # Multi-stage build (Cloud Run friendly)
cloudbuild.yaml       # Cloud Build → Cloud Run deploy
```

## Known limits / next steps

- Single-trip app today (controlled via `DEFAULT_TRIP_ID`). Multi-trip would
  add a trip selector in the header.
- No auth — Cloud Run is deployed with `--allow-unauthenticated`. Put it
  behind IAP or add NextAuth if the trip data is sensitive.
- Predictor uses a fixed 14-hour awake window per day; that's good enough
  for day-trip planning but worth making configurable later.
