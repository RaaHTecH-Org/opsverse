## Verify SEO Fixes

### Steps

1. **Read current findings** — call `seo_chat--list_findings` to see what the last scan flagged as failing/ignored.
2. **Verify per-route metadata** — navigate the preview to `/`, `/incidents`, `/admin`, `/digital-twin` and confirm `document.title` changes per route (Helmet is working post react-helmet-async@2.0.5 downgrade).
3. **Verify static assets** — fetch `/sitemap.xml`, `/robots.txt`, `/llms.txt` from the preview to confirm they serve correctly.
4. **Verify head structure** — read `index.html` to confirm JSON-LD blocks, canonical, og/twitter tags, and favicon link are intact.
5. **Verify single H1** — confirm `AppLayout.tsx` no longer emits an H1 for the sidebar brand and each page provides exactly one H1.
6. **Mark resolved findings fixed** — call `seo_chat--update_findings` for each failing row that the code now satisfies, with a one-line explanation per finding.
7. **Report** — summarize what passed, what (if anything) still needs work, and prompt user to click Rescan in the SEO tab for instant re-verification.

### Notes
- No code changes expected unless verification surfaces a regression.
- Canonical base URL in `SEO.tsx` is `https://raahcomcenter.lovable.app`; the SEO guidance recommends `https://rcc.raahtech.org`. Flag this and ask before changing.
