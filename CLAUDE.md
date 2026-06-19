@AGENTS.md

# School Management System — Claude Code Instructions

## What We Are Building
An exact replica of **Smart School v7.1.0** using Next.js 16 / Prisma / PostgreSQL.
The original Smart School source is at: `~/Downloads/smart-school-school-7.1.0 (1)/smart_school_src/`

## Always Read First
Before continuing any work, read these files:
1. `BUILD_PLAN.md` — phase-by-phase tracker, current status, what's next
2. `prisma/schema.prisma` — the full data model (matches Smart School's DB)
3. `lib/auth/middleware-utils.ts` — add new routes here or they'll be blocked

## Key Rules
- Before implementing any feature, read the corresponding PHP model in `~/Downloads/smart-school-school-7.1.0 (1)/smart_school_src/application/models/`
- All Prisma calls use `(prisma as any).modelName` — do NOT use typed Prisma
- After schema changes: `npx prisma db push`
- After code changes: `git push && vercel --prod`
- Vercel is NOT auto-deployed from GitHub — always run `vercel --prod` manually

## Page Structure
- `/app/(dashboard)/[module]/page.tsx` — server component (data fetch only)
- `/app/(dashboard)/[module]/[Module]Client.tsx` — client component (forms + interactivity)
- `/app/api/[module]/route.ts` — API route handler
- `/lib/services/[module].ts` — business logic

## Live URLs
- Production: https://getskula.com
- Repo: https://github.com/Amoahalexkofi/school-ms
