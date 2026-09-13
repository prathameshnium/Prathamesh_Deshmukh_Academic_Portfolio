# Domain configuration

The site is currently served from the **GitHub Pages project URL**:

> https://prathameshnium.github.io/Prathamesh_Deshmukh_Academic_Portfolio/

The custom domain `prathameshdeshmukh.site` is **disabled**, not deleted. Its DNS
does not point at GitHub Pages (it resolves to an unrelated host that fails the
TLS handshake), so while the `CNAME` file was active GitHub redirected every
visitor to a domain that would not load.

## What was changed

| File | Change |
| --- | --- |
| `CNAME` | renamed to `CNAME.disabled` — GitHub Pages only reads a file named exactly `CNAME` |
| `*.html` | `canonical`, `og:url`, `og:image`, `twitter:image` and JSON-LD URLs point at the project URL |
| `sitemap.xml`, `llms.txt`, `humans.txt`, `index.rst`, `README.md`, `CITATION.cff`, `security.txt` | same URL swap |
| `pages/sitemap.html`, `index.html` | root-absolute links (`/robots.txt`, `/pages/search.html`, …) made relative, because a project page is served from a subpath, not the origin root |
| `site.webmanifest` | `scope`, `start_url` and icon paths made relative, for the same reason |
| `robots.txt` | replaced the `https://example.com/sitemap.xml` placeholder |

## Restoring a custom domain

1. Point DNS at GitHub Pages:

   ```
   A     @     185.199.108.153
   A     @     185.199.109.153
   A     @     185.199.110.153
   A     @     185.199.111.153
   CNAME www   prathameshnium.github.io
   ```

2. `git mv CNAME.disabled CNAME` (and put the new domain in it, if it changed).
3. Replace `https://prathameshnium.github.io/Prathamesh_Deshmukh_Academic_Portfolio`
   with `https://<new-domain>` across the repo.
4. The relative links from step 3 of the table above keep working at the origin
   root — they do not need reverting.
5. Wait for GitHub to issue the TLS certificate, then enable **Enforce HTTPS**
   in Settings → Pages.

## Known issues, not yet fixed

- **`robots.txt` blocks `/_assets/`**, which holds the site's CSS and JS.
  Search engines need those to render pages; this likely hurts indexing.
- **Both `security.txt` files are expired** (`Expires: 2025-12-31`) and list
  *different* contact addresses. `pages/security.txt` also references
  `pgp-key.txt`, `security-acknowledgements.html` and `security-policy.html`,
  none of which exist in this repo.
- **Three presentation PDFs are missing** from `_assets/`, so the download links
  on `pages/presentations.html` are dead: `Multiferroics_Year3_PPT_V2_Prathamesh_Deshmukh.pdf`,
  `Python_Ising_Final.pdf`, `Dielectric_PPT.pdf`.
- The footer copyright in `_assets/js/main.js` links to the `prathameshnium.github.io`
  repository rather than this one.
