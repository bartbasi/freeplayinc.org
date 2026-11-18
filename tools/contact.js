// Makes small contact sheets so originals can be reviewed quickly. node tools/contact.js <out.jpg> <cellW> <cellH> <files...>
const sharp = require('sharp');
(async () => {
  const [out, cw, ch, ...files] = process.argv.slice(2);
  const W = +cw, H = +ch, cols = Math.min(files.length, 5), rows = Math.ceil(files.length / cols);
  const comps = [];
  for (let i = 0; i < files.length; i++) {
    const buf = await sharp(files[i]).resize(W, H, { fit: 'contain', position: 'top', background: '#222' }).toBuffer();
    comps.push({ input: buf, left: (i % cols) * (W + 8), top: Math.floor(i / cols) * (H + 8) });
    const m = await sharp(files[i]).metadata();
    console.log(i, files[i].split('/').slice(-2).join('/'), m.width + 'x' + m.height);
  }
  await sharp({ create: { width: cols * (W + 8), height: rows * (H + 8), channels: 3, background: '#555' } }).composite(comps).jpeg({ quality: 80 }).toFile(out);
})();
