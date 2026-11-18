# freeplayinc.org

Source for the Free Play, Inc. web site. It is one page of plain HTML, CSS and JavaScript with no framework and no build step. Cloudflare serves the `public/` folder as it is.

## Folders

| Path | What is in it |
|---|---|
| `public/` | The site: `index.html`, `css/site.css`, `js/site.js`, fonts, images |
| `src/originals/` | The screenshots the web images are made from |
| `tools/` | Scripts for images, screenshots and a local server |
| `worker/index.js` | A few lines that redirect the workers.dev address to freeplayinc.org |
| `wrangler.jsonc` | Cloudflare settings |

## Look at it locally

```
npm install
node tools/serve.js
```

Then open http://127.0.0.1:4180.

## Change the text

All the words are in `public/index.html`. Copy follows `C:\Websites\bartbasi.com\writing-rules-for-bart.md`.

## Images

```
node tools/images.js      # remakes public/img from src/originals
node tools/shots.js       # retakes the screenshots of the other web sites
node tools/selfshot.js    # retakes this site's own screenshot and the social card (local server must be running)
```

The game screenshots come from each game's repository and from the old games site. The ScaleConnect screenshots show the real staff page running against the project's fake scale, with made-up items. The Board Game Collector screens are golden images from that app's test suite. The Fair Deal Solitaire screens are from its style study, in `docs/art/screens` of the project folder, which is not on GitHub yet. The MapApp screens are from `docs/evidence` in its public repository, with owner names masked. Only use MapApp screens that are already public there.

## Deploy

```
npx wrangler deploy
```

This publishes to the `freeplayinc` Worker, which serves https://freeplayinc.org/ and https://www.freeplayinc.org/. The Worker's own address, https://freeplayinc.freeplayinc-org.workers.dev, redirects to https://freeplayinc.org/.

## The copy on GitHub

https://bartbasi.github.io/ is a copy of this site, served from the `bartbasi/bartbasi.github.io` repository. After a change here, copy `public/` into that repository and push it. Three things differ:

- Leave out `_headers`, `robots.txt` and `sitemap.xml`. They only apply to freeplayinc.org.
- Keep `google218d7ed2f01f27bd.html` in the repository. It verifies the site for Google Play.
- Keep `.nojekyll` and the repository's own `README.md`.

## Rules

- No trackers, no cookies, no third-party requests. Fonts are served from the site (Anybody, Instrument Sans and Doto, all under the SIL Open Font License).
- Every fact on the page comes from a repository, a README or a live site. Dates in the "Order of play" table are when each GitHub repository was created. Fair Deal Solitaire has no GitHub repository yet, so its date is its first commit.
