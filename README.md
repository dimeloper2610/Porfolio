# Dimitrios Fragkoulis — Portfolio

Personal portfolio site, live at **https://dimeloper2610.github.io/**

Plain HTML/CSS/JS, no build step. Hosted with GitHub Pages from the `main` branch.

- `index.html` — content
- `styles.css` — design (light/dark theme, print styles for "Download CV")
- `script.js` — theme toggle, scroll animations
- `photo.jpg` — profile photo
- `Dimitrios-Fragkoulis-CV.pdf` — downloadable CV, exported from `cv/cv.html` with headless Chrome
- `Dimitrios-Fragkoulis-CV.docx` — Word version, built by `cv/build_cv_docx.py` (needs `python-docx`)
- Update `cv/cv.html` and `cv/build_cv_docx.py` together when CV content changes, then regenerate both files

## Notes

- Live site: https://dimeloper2610.github.io/
- Code: [dimeloper2610/dimeloper2610.github.io](https://github.com/dimeloper2610/dimeloper2610.github.io)
- Custom domain request: [is-a-dev/register#60815](https://github.com/is-a-dev/register/pull/60815) for `fragkoulis.is-a.dev` (all checks passed, waiting for review)

### After the domain PR is merged

1. Check DNS works: `dig +short fragkoulis.is-a.dev` should point to `dimeloper2610.github.io`.
2. Set the custom domain in GitHub Pages: repo **Settings → Pages → Custom domain** → `fragkoulis.is-a.dev`.
3. Tick **Enforce HTTPS** once the certificate is ready.
