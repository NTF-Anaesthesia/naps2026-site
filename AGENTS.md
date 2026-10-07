# Instructions for AI assistants working on naps2026.anantf.com

This repo is the NAPS (National Airway Program Singapore) 2026 airway trainer site, published by
GitHub Pages at https://naps2026.anantf.com. **Anything pushed to `main` is public within about a minute.**

## Layout

| Path | What it is |
|---|---|
| `index.html` | Model viewer and download page |
| `accessibility.html` | Accessibility statement (linked from the footer) |
| `site.css` | Shared styles |
| `models/*.stl` | Original STL files, offered as downloads |
| `models/view/*.mesh.gz` | Compressed copies the 3D viewer loads |
| `tools/compress-models.mjs` | Builds `models/view/` from `models/*.stl` |
| `LICENSE.md` | Licence terms, also bundled into "Download all" |

## Rules

- After adding or changing any STL, run `node tools/compress-models.mjs` and commit the updated
  `models/view/` files, or the viewer keeps showing the old model.
- The two bronchus models must stay **CC BY-SA 4.0**: they derive from BodyParts3D (CC BY-SA 2.1 JP),
  whose ShareAlike terms forbid adding a non-commercial restriction. Everything else is CC BY-NC-SA 4.0.
- Keep the upstream credits (Kardioversion, flanker1743, BodyParts3D) in the page and `LICENSE.md`.
- Don't publish collaborators' or advisors' names. Don't put personal email addresses or phone
  numbers on any page; public contact is contact@anantf.com.
- Style: plain English, spell out acronyms on first use, one primary button per page, breadcrumbs
  above the title, 16px minimum body text, visible focus states, WCAG 2.1 AA. Colours and fonts are
  the CSS variables in `site.css`.
- After editing a page, open it in a browser (or a local static server) and check it still loads
  without console errors before committing.
