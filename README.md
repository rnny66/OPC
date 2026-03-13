# OPC Europe — European Open Poker Championship

Static marketing website and tournament management platform for the European Open Poker Championship.

## Repository Structure

| Directory    | Description                          | Deployment   |
|-------------|--------------------------------------|--------------|
| `site/`     | Static marketing website (HTML/CSS)  | GitHub Pages |
| `platform/` | Tournament management app (Next.js)  | Vercel       |
| `supabase/` | Shared database migrations & tests   | Supabase     |
| `docs/`     | Project documentation & plans        | —            |
| `designs/`  | Figma design screenshots             | —            |

## Branch Naming Convention

| Prefix             | Scope                  | Example                      |
|--------------------|------------------------|------------------------------|
| `feat/site-*`      | Static site changes    | `feat/site-france-page`      |
| `feat/platform-*`  | Platform changes       | `feat/platform-email-notifs` |
| `feat/db-*`        | Migration-only changes | `feat/db-add-season-table`   |
| `fix/site-*`       | Site bug fixes         | `fix/site-responsive-nav`    |
| `fix/platform-*`   | Platform bug fixes     | `fix/platform-auth-redirect` |
| `docs/*`           | Documentation only     | `docs/update-scope`          |

## Deployments

- **Site** deploys to GitHub Pages automatically when `site/` files change on `main`
- **Platform** deploys to Vercel automatically when `platform/` files change on `main`
- **Database** migrations in `supabase/` are shared by both site and platform
