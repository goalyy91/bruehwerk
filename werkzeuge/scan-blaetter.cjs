#!/usr/bin/env node
/**
 * Holt die Seitenbilder aus einem gescannten PDF und schreibt sie als PNG.
 *
 *   node werkzeuge/scan-blaetter.cjs <scan.pdf> [weitere.pdf ...] [--ziel ORDNER]
 *
 * Gedacht fuer die Le-Nez-Datenblaetter (siehe src/daten/aroma-datenblaetter.ts):
 * die Scans kommen als PDF ohne Textebene, und die Blaetter muessen als Bild
 * gelesen werden, um sie abzutippen.
 *
 * Warum ein eigenes Skript und nicht pdftoppm/pdfimages/ImageMagick:
 * Auf diesem Rechner ist von poppler nur `pdftotext` da — kein Rasterizer,
 * kein Ghostscript, kein ImageMagick, kein Python. (`convert.exe` im PATH ist
 * das Windows-Dateisystem-Werkzeug, nicht ImageMagick — nicht aufrufen.) Node
 * bringt mit `zlib` alles mit, was fehlt, deshalb kommt das Skript ohne eine
 * einzige Abhaengigkeit aus und kann nicht durch ein npm-Update kaputtgehen.
 *
 * Grenzen, bewusst: gelesen werden unverschluesselte PDFs, deren Seitenbilder
 * als /FlateDecode-Bitmap mit 8 Bit je Kanal drinliegen — genau das, was der
 * Scanner ueber "Drucken als PDF" (Producer "Skia/PDF") erzeugt. Ein PDF mit
 * JPEG-Bildern (/DCTDecode) wird erkannt und die Bilder werden unveraendert
 * als .jpg herausgeschrieben. Alles andere meldet das Skript und bricht ab,
 * statt eine kaputte Datei zu hinterlassen — lieber ein klarer Abbruch als
 * ein PNG, in dem niemand den Text lesen kann.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

// ---------------------------------------------------------------- PNG bauen

const CRC_TABELLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABELLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function block(typ, daten) {
  const laenge = Buffer.alloc(4);
  laenge.writeUInt32BE(daten.length);
  const koerper = Buffer.concat([Buffer.from(typ, 'latin1'), daten]);
  const pruefsumme = Buffer.alloc(4);
  pruefsumme.writeUInt32BE(crc32(koerper));
  return Buffer.concat([laenge, koerper, pruefsumme]);
}

/** Rohe Bildpunkte (kanalweise, 8 Bit) -> fertige PNG-Datei. */
function alsPng(breite, hoehe, kanaele, roh) {
  const farbtyp = { 1: 0, 2: 4, 3: 2, 4: 6 }[kanaele];
  if (farbtyp === undefined) throw new Error(`${kanaele} Kanäle kann PNG nicht`);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(breite, 0);
  ihdr.writeUInt32BE(hoehe, 4);
  ihdr[8] = 8; // Bit je Kanal
  ihdr[9] = farbtyp;

  // Jede PNG-Zeile traegt ein fuehrendes Filterbyte; 0 = unveraendert.
  const zeile = breite * kanaele;
  const gefiltert = Buffer.alloc((zeile + 1) * hoehe);
  for (let y = 0; y < hoehe; y++) {
    gefiltert[y * (zeile + 1)] = 0;
    roh.copy(gefiltert, y * (zeile + 1) + 1, y * zeile, (y + 1) * zeile);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    block('IHDR', ihdr),
    block('IDAT', zlib.deflateSync(gefiltert, { level: 6 })),
    block('IEND', Buffer.alloc(0)),
  ]);
}

// ------------------------------------------------------------- PDF zerlegen

function zahlAus(woerterbuch, feld) {
  const treffer = woerterbuch.match(new RegExp(`/${feld}\\s+(\\d+)`));
  return treffer ? Number(treffer[1]) : undefined;
}

/**
 * Alle Bild-XObjects eines PDFs, in Dateireihenfolge — die entspricht bei
 * den Scans der Seitenreihenfolge.
 */
function bilderAus(pdf) {
  const text = pdf.toString('latin1');
  const objekte = /(\d+)\s+0\s+obj\s*<<([\s\S]*?)>>\s*stream\r?\n/g;
  const gefunden = [];
  let treffer;

  while ((treffer = objekte.exec(text)) !== null) {
    const woerterbuch = treffer[2];
    if (!/\/Subtype\s*\/Image/.test(woerterbuch)) continue;

    const laenge = zahlAus(woerterbuch, 'Length');
    if (laenge === undefined) {
      throw new Error(`Objekt ${treffer[1]}: /Length fehlt (indirekte Länge wird nicht unterstützt)`);
    }
    gefunden.push({
      objekt: treffer[1],
      breite: zahlAus(woerterbuch, 'Width'),
      hoehe: zahlAus(woerterbuch, 'Height'),
      bits: zahlAus(woerterbuch, 'BitsPerComponent'),
      filter: (woerterbuch.match(/\/Filter\s*\/(\w+)/) || [])[1],
      daten: pdf.subarray(treffer.index + treffer[0].length, treffer.index + treffer[0].length + laenge),
    });
  }
  return gefunden;
}

function schreibeBild(bild, basis, nummer) {
  if (bild.filter === 'DCTDecode') {
    const ziel = `${basis}-${nummer}.jpg`;
    fs.writeFileSync(ziel, bild.daten); // DCTDecode ist bereits eine JPEG-Datei
    return { ziel, hinweis: `${bild.breite}x${bild.hoehe}, JPEG unverändert` };
  }

  if (bild.filter !== 'FlateDecode') {
    throw new Error(`Objekt ${bild.objekt}: Filter /${bild.filter ?? '?'} wird nicht unterstützt`);
  }
  if (bild.bits !== undefined && bild.bits !== 8) {
    throw new Error(`Objekt ${bild.objekt}: ${bild.bits} Bit je Kanal, erwartet 8`);
  }
  if (!bild.breite || !bild.hoehe) {
    throw new Error(`Objekt ${bild.objekt}: /Width oder /Height fehlt`);
  }

  const roh = zlib.inflateSync(bild.daten);
  const kanaele = roh.length / (bild.breite * bild.hoehe);
  if (!Number.isInteger(kanaele)) {
    throw new Error(
      `Objekt ${bild.objekt}: ${roh.length} Bytes passen nicht zu ${bild.breite}x${bild.hoehe} ` +
        `(${kanaele.toFixed(3)} Kanäle) — vermutlich ein /DecodeParms-Vorfilter, der hier fehlt`,
    );
  }

  const ziel = `${basis}-${nummer}.png`;
  fs.writeFileSync(ziel, alsPng(bild.breite, bild.hoehe, kanaele, roh));
  return { ziel, hinweis: `${bild.breite}x${bild.hoehe}, ${kanaele} Kanäle` };
}

// ------------------------------------------------------------------ Aufruf

function main(argv) {
  const zielIndex = argv.indexOf('--ziel');
  const ziel = zielIndex >= 0 ? argv[zielIndex + 1] : '.';
  const pdfs = argv.filter((a, i) => a !== '--ziel' && i !== zielIndex + 1);

  if (pdfs.length === 0) {
    console.error('Aufruf: node werkzeuge/scan-blaetter.cjs <scan.pdf> [...] [--ziel ORDNER]');
    return 1;
  }
  fs.mkdirSync(ziel, { recursive: true });

  let gesamt = 0;
  for (const pdf of pdfs) {
    const bilder = bilderAus(fs.readFileSync(pdf));
    if (bilder.length === 0) {
      console.error(`${pdf}: kein Bild gefunden — ist das wirklich ein Scan?`);
      return 1;
    }
    const basis = path.join(ziel, path.basename(pdf, path.extname(pdf)));
    bilder.forEach((bild, i) => {
      const { ziel: datei, hinweis } = schreibeBild(bild, basis, i + 1);
      console.log(`${datei}  (${hinweis})`);
      gesamt++;
    });
  }
  console.log(`\n${gesamt} Seite(n) geschrieben.`);
  return 0;
}

try {
  process.exit(main(process.argv.slice(2)));
} catch (fehler) {
  console.error(`Abbruch: ${fehler.message}`);
  process.exit(1);
}
