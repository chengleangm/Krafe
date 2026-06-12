# Repository Guidelines

## Project Structure & Module Organization

Krafe Coffee is a small Node/Express site with static pages served from the repository root. Key entry points are `index.html`, `menu.html`, `about.html`, `contact.html`, `login.html`, and `admin.html`. Shared browser behavior lives in `script.js`; shared presentation styles live in `style.css`; brand images are `logoKrafe.png` and `logoKrafe-white.png`. The Express API and static file server are in `server.js`. Local development data is stored in `db.json`; production can use MongoDB through `MONGODB_URI`. Vercel deployment rules are defined in `vercel.json`.

## Build, Test, and Development Commands

- `npm install`: install Express and MongoDB dependencies from `package-lock.json`.
- `npm start`: run `server.js` on `http://localhost:3000`.
- `npm run dev`: same as `npm start`; use it for local development.

There is no build step. HTML, CSS, JavaScript, PNG assets, and `db.json` are served directly by Express.

## Coding Style & Naming Conventions

Use plain JavaScript and CommonJS in server code, matching `server.js`. Keep route handlers small and return JSON consistently for `/api/orders` and `/api/products`. The current CSS uses compact selectors, CSS custom properties in `:root`, and BEM-like class names such as `.card__body`, `.drawer__head`, and `.btn--ghost`; follow those patterns when adding UI. Keep product and order records shaped consistently with existing `db.json` examples, using numeric product `id` values and string order `id` values.

## Testing Guidelines

No automated test framework is configured yet. Before submitting changes, run `npm start` and manually verify the affected pages in a browser, especially `menu.html`, cart checkout, admin product/order flows, and API endpoints such as `GET /api/products`. If tests are added later, prefer focused integration tests for Express routes and name them by feature, for example `products.test.js`.

## Commit & Pull Request Guidelines

Recent history uses short imperative messages with a conventional prefix when useful, for example `fix: include static files in Vercel function bundle`. Keep commits scoped to one concern. Pull requests should include a concise summary, manual verification steps, linked issues when applicable, and screenshots for visible UI changes.

## Security & Configuration Tips

Do not commit real credentials. Set `MONGODB_URI` in the deployment environment, not in source files. Treat `db.json` as local demo data and avoid storing sensitive customer information in it.
