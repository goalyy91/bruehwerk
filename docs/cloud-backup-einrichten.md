# Cloud-Backup einrichten

Diese Schritte kann nur Julian machen — brauchen ein Google-Konto und den
Zugriff auf die Firebase-Konsole. Der Code (`src/daten/cloud.ts`,
`bereiche/bestand.svelte.ts`, `einstellungen/Backup.svelte`) ist fertig und
bleibt bis dahin folgenlos inaktiv: fehlt die Konfiguration, zeigt die App
den ganzen Cloud-Abschnitt einfach nicht an.

**Firestore, nicht Cloud Storage:** Cloud Storage für Firebase verlangt seit
3.2.2026 zwingend den kostenpflichtigen Blaze-Tarif — eine hinterlegte
Zahlungsmethode, selbst wenn die Nutzung im Gratis-Kontingent bleibt.
Firestore bleibt auf dem kostenlosen Spark-Tarif nutzbar, **keine
Kreditkarte nötig**. Abgelegt wird trotzdem keine "Datenbank" im
eigentlichen Sinn, nur ein einzelnes Dokument mit dem kompletten Bestand
als JSON — dieselbe Form wie die manuell exportierte Datei.

## 1 · Firebase-Projekt anlegen

1. [console.firebase.google.com](https://console.firebase.google.com) öffnen,
   mit dem eigenen Google-Konto.
2. „Projekt hinzufügen" — Name frei wählbar, z. B. „bruehwerk". Google
   Analytics kann man abwählen, wird hier nicht gebraucht.
3. **Nicht** zu Blaze wechseln, wenn danach gefragt wird — Spark (der
   Standard-Tarif) reicht für alles hier.

## 2 · „Mit Google anmelden" aktivieren

1. Im Projekt: **Build → Authentication → Get started**.
2. Tab **Sign-in method** → **Google** auswählen → aktivieren → Speichern.
   Als „Projekt-Support-E-Mail" reicht die eigene Adresse.

## 3 · Firestore aktivieren + Sicherheitsregel

1. **Build → Firestore Database → Create database**. Standort/Region frei
   wählbar (nächstgelegene, z. B. `eur3`). Modus: „Production" (die
   Sicherheitsregel gleich danach macht es trotzdem sicher).
2. Tab **Rules** — den vorgegebenen Text ersetzen durch:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /sicherungen/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```

   Das erlaubt jedem angemeldeten Konto **ausschließlich sein eigenes**
   Dokument zu lesen/schreiben (Dokument-Name = die eigene, von Google
   vergebene Kontokennung) — niemand sonst kommt an fremde Sicherungen.
3. **Publish**.

## 4 · Web-App registrieren und Werte holen

1. Zahnrad oben links → **Projekteinstellungen** → runterscrollen zu
   „Deine Apps" → Web-Symbol (`</>`) → App registrieren (Name frei, z. B.
   „bruehwerk-web"). Firebase Hosting nicht nötig.
2. Es erscheint ein Codeblock mit `const firebaseConfig = { apiKey: "...",
   authDomain: "...", projectId: "...", ... }`. Vier Werte werden gebraucht
   (nicht geheim — bei einer Firebase-Web-App sind sie ohnehin öffentlich
   einsehbar, sobald die Seite läuft; die eigentliche Sicherheit kommt aus
   Schritt 3): `apiKey`, `authDomain`, `projectId`, `appId`.
   `storageBucket`/`messagingSenderId` werden nicht gebraucht, können
   ignoriert werden.

## 5 · Werte in die App eintragen

Im Projektordner eine neue Datei **`.env`** anlegen (direkt neben
`package.json`, nicht im `src`-Ordner) mit genau diesem Inhalt, den Werten
aus Schritt 4 entsprechend ausgefüllt:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

`.env` ist in `.gitignore` eingetragen — landet nie im Repo, nie auf GitHub.
Für die Vercel-Produktivumgebung (bruehwerk.vercel.app) müssen dieselben
vier Werte zusätzlich im Vercel-Projekt unter **Settings → Environment
Variables** eingetragen werden, sonst bleibt das Cloud-Backup dort inaktiv,
obwohl es lokal funktioniert.

Danach einmal `npm run dev` neu starten (bzw. bei Vercel neu deployen) —
in den Einstellungen der App erscheint dann unter „Daten" ein neuer
Abschnitt „Cloud" mit „Mit Google anmelden".
