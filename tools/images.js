// Makes the web images in public/img from the originals in src/originals.
// Usage: node tools/images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, '..', 'src', 'originals');
const OUT = path.join(__dirname, '..', 'public', 'img');

// [source, output, width, options]
const jobs = [
  ['forkline/icon_512.png', 'forkline/icon.webp', 192],
  ['forkline/screen_1_front_door.png', 'forkline/home.webp', 600],
  ['forkline/screen_4_build_phase.png', 'forkline/build.webp', 600],
  ['forkline/screen_5_wave.png', 'forkline/wave.webp', 600],
  ['forkline/screen_3_levels.png', 'forkline/levels.webp', 600],
  ['sumup/icon.png', 'sumup/icon.webp', 192],
  ['sumup/chain.webp', 'sumup/chain.webp', 540],
  ['sumup/nova.webp', 'sumup/nova.webp', 540],
  ['sumup/slate.webp', 'sumup/slate.webp', 540],
  ['updraft/icon_512.png', 'updraft/icon.webp', 192],
  ['updraft/screenshot_1_title.png', 'updraft/title.webp', 1280],
  ['updraft/screenshot_2_sunbeam.png', 'updraft/sunbeam.webp', 1280],
  ['updraft/screenshot_3_kettle_steam_out_the_window.png', 'updraft/kettle.webp', 1280],
  ['updraft/screenshot_4_valley_with_the_gull.png', 'updraft/valley.webp', 1280],
  ['updraft/screenshot_6_under_the_viaduct.png', 'updraft/viaduct.webp', 1280],
  ['woodlogic/icon.png', 'woodlogic/icon.webp', 192],
  ['woodlogic/board.webp', 'woodlogic/board.webp', 540],
  ['woodlogic/home.webp', 'woodlogic/home.webp', 540],
  ['woodlogic/map.webp', 'woodlogic/map.webp', 540],
  ['sudoku/icon.png', 'sudoku/icon.webp', 192],
  ['sudoku/play.webp', 'sudoku/play.webp', 540],
  ['sudoku/hint.webp', 'sudoku/hint.webp', 540],
  ['sudoku/play-dark.webp', 'sudoku/play-dark.webp', 540],
  ['fairdeal/lamplight_icon.png', 'fairdeal/icon.webp', 192],
  ['fairdeal/lamplight_cover.png', 'fairdeal/klondike.webp', 600],
  ['fairdeal/classic_spider_normal.png', 'fairdeal/classic.webp', 600],
  ['fairdeal/modern_spider_normal.png', 'fairdeal/modern.webp', 600],
  ['mapapp/readout.png', 'mapapp/readout.webp', 600],
  ['mapapp/hybrid.png', 'mapapp/hybrid.webp', 600],
  ['mapapp/publicland.png', 'mapapp/publicland.webp', 360, { scale: 2 }],
  ['boardgames/app_shell_default_light_compact.png', 'boardgames/scan.webp', 390, { scale: 2 }],
  ['boardgames/manual_entry_initial_light_compact.png', 'boardgames/enter.webp', 390, { scale: 2 }],
  ['web/bartbasi.png', 'web/bartbasi.webp', 1100, { q: 74 }],
  ['web/crackerscheese-new.png', 'web/crackerscheese.webp', 1100, { q: 74 }],
  ['web/cupm.png', 'web/cupm.webp', 1100, { q: 74 }],
  ['web/financeillinois.png', 'web/financeillinois.webp', 1100, { q: 74 }],
  ['web/freeplayinc.png', 'web/freeplayinc.webp', 1100, { q: 74 }],
  ['scaleconnect/01-pin.png', 'scaleconnect/pin.webp', 1280],
  ['scaleconnect/02-items.png', 'scaleconnect/items.webp', 1280],
  ['scaleconnect/03-edit.png', 'scaleconnect/edit.webp', 1280],
  ['scaleconnect/04-preview.png', 'scaleconnect/preview.webp', 1280],
  ['scaleconnect/05-result.png', 'scaleconnect/result.webp', 1280],
  ['scaleconnect/06-phone.png', 'scaleconnect/phone.webp', 600],
];

(async () => {
  for (const [src, out, width, opt = {}] of jobs) {
    const from = path.join(SRC, src);
    if (!fs.existsSync(from)) { console.log('skip (no original yet):', src); continue; }
    const to = path.join(OUT, out);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    const meta = await sharp(from).metadata();
    const w = Math.min(width * (opt.scale || 1), meta.width * (opt.scale || 1));
    const info = await sharp(from)
      .resize({ width: Math.round(w), kernel: opt.scale ? 'nearest' : 'lanczos3' })
      .webp({ quality: opt.q || 82, effort: 6 })
      .toFile(to);
    console.log(out, info.width + 'x' + info.height, Math.round(info.size / 1024) + ' KB');
  }
})();
