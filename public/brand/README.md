# Auro Brokers — Brand Assets

Drop real brand files into the matching paths below. Each one is consumed by
a `<BrandImg>` slot in the React code; if the file is missing, the site falls
back to its current SVG / gradient placeholder, so things never break — they
just light up as soon as the asset arrives.

## File map

### Logo

| Path                  | Format            | Used by              |
| --------------------- | ----------------- | -------------------- |
| `/brand/logo.svg`     | SVG (preferred)   | Nav + Footer logos   |
| `/brand/logo-mark.svg`| SVG (square mark) | Mobile / favicon use |

### Leadership portraits (Company page)

Each portrait should be a square or 4:5 portrait JPG/WebP, ~600px wide,
sRGB. Filenames are slugified from the executive's name as it appears in
`src/pages/Company.tsx`.

| Path                                          | Subject              |
| --------------------------------------------- | -------------------- |
| `/brand/portraits/helena-cardenas.jpg`        | Helena Cárdenas, CEO |
| `/brand/portraits/niels-hvidberg.jpg`         | Niels Hvidberg, COO  |
| `/brand/portraits/maria-bertolini.jpg`        | Maria Bertolini, CMS |
| `/brand/portraits/tunde-akande.jpg`           | Tunde Akande, CCO    |

### Article thumbnails (Education page)

16:10 JPG/WebP, ~1200×750. Filenames slugified from article title.

| Path                                                | Article                                        |
| --------------------------------------------------- | ---------------------------------------------- |
| `/brand/articles/forex-from-first-principles.jpg`   | Forex from first principles                    |
| `/brand/articles/risk-of-ruin.jpg`                  | Risk-of-ruin calculator                        |
| `/brand/articles/depth-of-market.jpg`               | Reading the depth-of-market series             |
| `/brand/articles/mql5-bootcamp.jpg`                 | MQL5 algorithmic trading bootcamp              |
| `/brand/articles/auro-weekly-247.jpg`               | Auro Weekly · Issue 247                        |
| `/brand/articles/eur-usd-1860.jpg`                  | EUR/USD: 1.0860 holds                          |
| `/brand/articles/btc-etf-flows.jpg`                 | BTC: spot ETF flows turn net positive          |
| `/brand/articles/sp-earnings-three-names.jpg`       | S&P earnings: three names that matter          |

### Partner / regulator logos (Trust marquee)

Each ~120×40 SVG with a transparent background. The marquee text falls
back to wordmark form if the SVG is missing.

| Path                              |
| --------------------------------- |
| `/brand/partners/fca.svg`         |
| `/brand/partners/cysec.svg`       |
| `/brand/partners/fsca.svg`        |
| `/brand/partners/lmax.svg`        |
| `/brand/partners/lseg.svg`        |
| `/brand/partners/equinix.svg`     |
| `/brand/partners/bloomberg.svg`   |
| `/brand/partners/tradingview.svg` |
| `/brand/partners/hsbc.svg`        |
| `/brand/partners/visa.svg`        |

### Award logos (Home Trust panel)

~120×40 transparent SVGs. Optional — falls back to the existing text list.

| Path                                          |
| --------------------------------------------- |
| `/brand/awards/finance-magnates-2024.svg`     |
| `/brand/awards/world-finance-2024.svg`        |
| `/brand/awards/global-forex-2023.svg`         |
| `/brand/awards/forex-brokers-2023.svg`        |

## Notes

- All paths are served from the site root because they live under
  `public/` (Vite default). E.g. `/brand/portraits/helena-cardenas.jpg`
  resolves to `public/brand/portraits/helena-cardenas.jpg`.
- For the single-file bundle (`docs/index.html` deployed to GitHub Pages),
  these paths must be reachable on the deployed origin — the Pages site
  at `https://ajoxf.github.io/Auro_cap/brand/...` will serve them
  automatically once committed.
- Prefer WebP for photos (~30% smaller than JPG), SVG for marks/logos.
- Keep portraits, articles and partner logos under ~250KB each.
