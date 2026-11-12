# Dimitrios Fragkoulis — Portfolio

Personal portfolio site, live at **https://fragkoulis.is-a.dev/**

Plain HTML/CSS/JS, no build step. Hosted with GitHub Pages from the `main` branch.

- `index.html` — content
- `styles.css` — design (light/dark theme, palettes, print styles)
- `script.js` — theme toggle, headline motion, command palette, map, scroll animations
- `photo.jpg` — profile photo
- `Dimitrios-Fragkoulis-CV.pdf` — downloadable CV, exported from `cv/cv.html` with headless Chrome
- `Dimitrios-Fragkoulis-CV.docx` — Word version, built by `cv/build_cv_docx.py` (needs `python-docx`)
- `og-image.png` — 1200×630 link-preview image, rendered from `og/card.html` with headless Chrome
- `CNAME` — custom domain for GitHub Pages
- Update `cv/cv.html` and `cv/build_cv_docx.py` together when CV content changes, then regenerate both files

## Notes

- Live site: https://fragkoulis.is-a.dev/ (the old `dimeloper2610.github.io` address redirects here)
- Code: [dimeloper2610/dimeloper2610.github.io](https://github.com/dimeloper2610/dimeloper2610.github.io)
- Domain: `fragkoulis.is-a.dev`, registered through [is-a-dev/register#60815](https://github.com/is-a-dev/register/pull/60815) (merged 2026-11-12). DNS is a CNAME to `dimeloper2610.github.io`; HTTPS is enforced in GitHub Pages.
- Preview other colour palettes with `?palette=<name>` (default is `navy`).
