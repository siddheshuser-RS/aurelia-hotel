# Aurelia — Database

Single source of truth for connecting to and inspecting the SQL Server
database used by the Aurelia backend in both local and containerized setups.

## Where the schema lives

The **table definitions live in [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma)**.
Prisma owns the schema; this folder only contains:

| File | Purpose |
|---|---|
| `01-create-database.sql` | Run **once** in SSMS to create the empty `LuxuryHotelDB` database. |
| `02-admin-queries.sql` | Handy diagnostic / inspection queries. |

To change the schema you should edit `schema.prisma`, create/update a Prisma
migration, then apply with `npm run prisma:migrate:deploy`.

For mixed environments (fresh DB or pre-existing DB), use `npm run db:prepare`.
It ensures the database exists, baselines the initial migration when legacy
tables are already present, then runs `prisma migrate deploy`.

---

## Primary (Docker/Container) connection style

Use SQL authentication with explicit host and port:

```
sqlserver://sqlserver:1433;database=LuxuryHotelDB;user=sa;password=YourStrong!Passw0rd;trustServerCertificate=true
```

Important for containers:

- Do not use `integratedSecurity=true`.
- Do not use machine-local instance names (for example `localhost\SQLEXPRESS...`).
- Use environment variables and service DNS names (`sqlserver`) instead.

---

## Optional local Windows SQL Express mode

If you run backend directly on Windows (without containers), you can still use
your local SQL Express instance.

Open **SSMS -> Connect -> Database Engine** and use:

| Field | Value |
|---|---|
| Server type | Database Engine |
| Server name | `localhost\SQLEXPRESS2014` &nbsp; *or* &nbsp; `localhost,44340` |
| Authentication | **Windows Authentication** (recommended on this machine) |

> If "Windows Authentication" is greyed out for the SA-style password you
> tried earlier, just use Windows auth — it's already working from the app.

Once connected, open `01-create-database.sql` and click **Execute** (F5).

---

## Connect from the Node app

`backend/.env` should use one of these:

Container-style (recommended for Docker):

```
sqlserver://sqlserver:1433;database=LuxuryHotelDB;user=sa;password=YourStrong!Passw0rd;trustServerCertificate=true
```

Windows local alternative:

```
sqlserver://localhost:44340;database=LuxuryHotelDB;integratedSecurity=true;trustServerCertificate=true
```

---

## Reset everything

```powershell
cd backend
npm run db:prepare    # ensure DB + baseline if needed + apply migrations
npm run prisma:seed   # reseed admin user + demo rooms / testimonials / gallery
```

Or one-shot:

```powershell
cd backend
npm run db:setup
```

Reset schema + seed in non-interactive automation:

```powershell
cd backend
npm run db:setup:reset
```

`db:setup:reset` uses `prisma db push --accept-data-loss` as a development
fallback when you intentionally want to reconcile schema state.

The seeded admin account is:

| Email | Password |
|---|---|
| `admin@aurelia.local` | `Admin@12345` |

---

## Troubleshooting

- **"Login failed" in containers** — check `DATABASE_URL` uses `user=` and
  `password=` (not `integratedSecurity=true`).
- **"Can't reach database server" in containers** — verify host is the service
  name (`sqlserver`) and port is `1433`.
- **"Can't reach database server at localhost:1433" on Windows host** — your
  SQL Express instance is not on the default port. Use `localhost:44340` (or
  `localhost\SQLEXPRESS2014`) as shown above.
- **"The table dbo.X does not exist"** — your `.env` `DATABASE_URL` is
  pointing at a different DB than the one Prisma pushed to. Confirm with
  `node scripts/diag.cjs` from `backend/`.
- **SSMS shows the DB but app fails to connect** — make sure the
  `MSSQL$SQLEXPRESS2014` Windows service is running (`Get-Service MSSQL*`).
