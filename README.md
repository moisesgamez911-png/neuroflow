# NeuroFlow AI

Static site (HTML, CSS, vanilla JS). No build step, no dependencies besides Google Fonts.

## Run locally
    python3 -m http.server 8000   # then open http://localhost:8000
(Opening `index.html` directly also works.)

## Structure
- `index.html` – markup and the three dialogs
- `assets/css/styles.css` – original styles + card CTA and dialog styles
- `assets/js/main.js` – background network, scroll reveal, focus meter, dialogs, break timer

## Deploy to GitHub Pages
1. Create a repository and push these files to the `main` branch.
2. Settings → Pages → Source: "Deploy from a branch" → `main` / `(root)` → Save.
3. Your site appears at `https://<user>.github.io/<repo>/`. All paths are relative, so the subpath works.
