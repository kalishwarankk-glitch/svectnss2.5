# SVCET NSS — Flat Static Site (no subfolders)

This is the same SVCET NSS site, restructured so **every file sits directly
in one folder with no subdirectories** — matching what actually ended up in
your GitHub repo after upload. This exists specifically to stop fighting
folder uploads that kept getting flattened.

## What changed vs. the original structured version

- `css/styles.css` → `styles.css` (at root)
- `css/admin.css` → `admin.css` (at root)
- `js/main.js`, `js/store.js`, `js/admin.js`, `js/admin-auth.js` → same names, at root
- `assets/logo.png`, `assets/favicon.png` → `logo.png`, `favicon.png` (at root)
- `programs/<slug>.html` (11 files) → `<slug>.html` (at root)
- `admin/dashboard.html` → `dashboard.html` (at root)
- Every internal link, `<link>`, and `<script src>` was updated to match —
  nothing was left pointing at a folder that no longer exists.

Design, copy, all 11 programs, the admin CRUD, and your real Google Form
link (`https://forms.gle/BQs9YHya6GnUjgGY7`) are all unchanged.

## How to deploy this

**Delete every file in your existing repo first**, then add these — don't
mix this flat version with the old nested one, or you'll have both
`styles.css` and a leftover `css/styles.css` confusing things.

1. On github.com, open your repo → select all files → delete them (commit
   the deletion).
2. Add file → Upload files → drag **all the files from this zip's extracted
   folder directly** (select all of them at once — there are no subfolders
   this time, so there's nothing to lose in the upload).
3. Commit. Vercel/GitHub Pages will auto-redeploy.
4. Hard-refresh the live URL (Ctrl+Shift+R).

## Admin login

`svcetnss26@gmail.com` / `svcetnss@26` at `/admin-login.html`. Same
client-side-only behavior as before (see the earlier README if you still
have it: edits save to that browser's localStorage only, not shared across
visitors).
