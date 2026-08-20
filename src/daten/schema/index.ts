/**
 * Sammelt alle Schemata der Datenschicht. Import-Punkt fuer db.ts, ablage.ts
 * und die Migration — niemand sonst importiert einzelne Schema-Dateien
 * direkt, damit der Store-Katalog in db.ts die eine Quelle fuer Namen bleibt.
 */
export * from './common';
export * from './geraete';
export * from './kaffee';
export * from './shot';
export * from './getraenk';
export * from './bestellung';
