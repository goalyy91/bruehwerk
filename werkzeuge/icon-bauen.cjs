/**
 * Baut die App-Icons — ohne Abhaengigkeit, aus den Farben von tokens.css.
 *
 * Kein Bildwerkzeug im Projekt und keins auf dem Rechner (ImageMagick fehlt,
 * `convert.exe` ist das Windows-Dateisystem-Werkzeug). Ein PNG ist aber kein
 * Geheimnis: Kopf, IHDR, ein zlib-Block mit einer Filter-Null pro Zeile,
 * IEND, jeweils mit CRC32. Genau das steht hier.
 *
 * Das Zeichen ist die Tasse von oben — der gefuellte Punkt (Brühwerks
 * eigenes Herkunftszeichen fuer "gemessen") im Ring. Kein Buchstabe: dafuer
 * braeuchte es einen Schriftrenderer, und ein schlecht gerastertes "B" waere
 * schlechter als kein Buchstabe.
 *
 * Aufruf: node werkzeuge/icon-bauen.cjs
 */
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const GRUND = [0x17, 0x14, 0x0f]; // --d-grund
const RING = [0x8f, 0x6c, 0x4d]; // --d-fuellung-leicht
const CREMA = [0xe0, 0xae, 0x79]; // --d-fuellung

function crc32(buf) {
  let c, tabelle = crc32.tabelle;
  if (!tabelle) {
    tabelle = crc32.tabelle = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      tabelle[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ tabelle[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(typ, daten) {
  const laenge = Buffer.alloc(4);
  laenge.writeUInt32BE(daten.length);
  const koerper = Buffer.concat([Buffer.from(typ, 'ascii'), daten]);
  const pruef = Buffer.alloc(4);
  pruef.writeUInt32BE(crc32(koerper));
  return Buffer.concat([laenge, koerper, pruef]);
}

/**
 * Weiche Kante statt harter Treppe: pro Pixel wird 3x3 abgetastet und der
 * Anteil gemittelt. Ohne das sieht ein Kreis auf 192 px ausgefranst aus.
 */
function farbeAn(x, y, groesse) {
  const m = groesse / 2;
  const rAussen = groesse * 0.30;
  const rInnen = groesse * 0.205;
  let summe = [0, 0, 0];
  const proben = 3;
  for (let sy = 0; sy < proben; sy++) {
    for (let sx = 0; sx < proben; sx++) {
      const px = x + (sx + 0.5) / proben;
      const py = y + (sy + 0.5) / proben;
      const d = Math.hypot(px - m, py - m);
      const farbe = d <= rInnen ? CREMA : d <= rAussen ? RING : GRUND;
      summe[0] += farbe[0];
      summe[1] += farbe[1];
      summe[2] += farbe[2];
    }
  }
  const n = proben * proben;
  return [Math.round(summe[0] / n), Math.round(summe[1] / n), Math.round(summe[2] / n)];
}

function baue(groesse, ziel) {
  const zeilen = [];
  for (let y = 0; y < groesse; y++) {
    const zeile = Buffer.alloc(1 + groesse * 3);
    for (let x = 0; x < groesse; x++) {
      const [r, g, b] = farbeAn(x, y, groesse);
      zeile[1 + x * 3] = r;
      zeile[2 + x * 3] = g;
      zeile[3 + x * 3] = b;
    }
    zeilen.push(zeile);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(groesse, 0);
  ihdr.writeUInt32BE(groesse, 4);
  ihdr[8] = 8; // Bittiefe
  ihdr[9] = 2; // Farbtyp: Truecolor
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(zeilen), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(ziel, png);
  console.log(`${path.basename(ziel)}: ${groesse}×${groesse}, ${png.length} Bytes`);
}

baue(192, 'public/icon-192.png');
baue(512, 'public/icon-512.png');
