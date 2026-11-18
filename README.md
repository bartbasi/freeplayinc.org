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

A change goes to three places: commit and push this repository, run the deploy above, and update the copy on GitHub below.

## The copy on GitHub

https://bartbasi.github.io/ is a copy of this site, served from the `bartbasi/bartbasi.github.io` repository. After a change here, copy `public/`, `LICENSE` and `NOTICE` into that repository and push it. Three things differ:

- Leave out `_headers`, `robots.txt` and `sitemap.xml`. They only apply to freeplayinc.org.
- Keep `google218d7ed2f01f27bd.html` in the repository. It verifies the site for Google Play.
- Keep `.nojekyll` and the repository's own `README.md`.

## Rules

- No trackers, no cookies, no third-party requests. Fonts are served from the site (Anybody, Instrument Sans and Doto, all under the SIL Open Font License).
- Every fact on the page comes from a repository, a README or a live site. Dates in the "Order of play" table are when each GitHub repository was created. Fair Deal Solitaire has no GitHub repository yet, so its date is its first commit.

## License

Copyright 2026 Free Play, Inc.

freeplayinc.org is free software under the GNU General Public License, version 3, with three additional terms under section 7 of that license. They cover its code, design, text, drawings, icons and documents.

1. Author attribution, 7(b): any work based on freeplayinc.org, in whole or in part, keeps the attribution "Based on freeplayinc.org, designed and written by Bart Basi, with assistance from Claude. Copyright 2026 Free Play, Inc." in its source code (by keeping the NOTICE file or its full text) and, if it has a user interface, among the legal notices it shows, such as the footer of a web page.
2. Marking modified versions, 7(c) and 7(d): a modified version is marked as changed from the original and is not presented as the original freeplayinc.org. Beyond the attribution in term 1, it may not use the names Free Play, Inc. or Bart Basi to promote it or to suggest that they made or endorsed it.
3. Name and icon, 7(c) and 7(e): the license grants no trademark rights to the names Free Play, Inc. and freeplayinc.org or to the Free Play, Inc. coin icon. A modified version you distribute uses its own name and icon instead. Saying it is "based on freeplayinc.org" is allowed, and term 1 requires it.

The full license text is in [LICENSE](LICENSE). The additional terms, in their exact wording, are in [NOTICE](NOTICE).

Parts made by others have their own licenses:

- The pictures in `src/originals` and `public/img` show other work: the games, the apps and the other web sites. They are not under this license. Each keeps the copyright and license of the work it shows. NOTICE lists them.
- The Anybody, Instrument Sans and Doto fonts are under the SIL Open Font License, version 1.1. Their licenses are in `public/fonts/`.
