#!/usr/bin/env bash
# PostToolUse-Hook: führt die Verifikation nach jeder Code-Änderung aus.
#
# Liest das Hook-Event von stdin, prüft ob die geänderte Datei überhaupt
# verifizierbar ist, und ruft dann `npm test`.
#
# Exit 2 meldet Claude den Fehlschlag zurück (stderr wird ihm gezeigt).
# Exit 0 heißt: alles gut oder nicht zuständig.

set -uo pipefail

WURZEL="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$WURZEL" || exit 0

nutzlast="$(cat)"

pfad="$(printf '%s' "$nutzlast" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      try{const e=JSON.parse(s);process.stdout.write(e?.tool_input?.file_path??"")}catch{}
    })' 2>/dev/null)"

# Kein Dateipfad im Event (z. B. Bash-Aufruf) → nicht zuständig.
[ -n "$pfad" ] || exit 0

# Nur was `npm test` auch wirklich prüft. Eine Änderung an CLAUDE.md oder
# am Konzept 8 Sekunden lang zu verifizieren, wäre reine Wartezeit.
case "$pfad" in
  *"$WURZEL"/src/*|*"$WURZEL"/tests/*) ;;
  *"$WURZEL"/package.json|*"$WURZEL"/tsconfig.json) ;;
  *"$WURZEL"/vite.config.ts|*"$WURZEL"/vitest.config.ts|*"$WURZEL"/svelte.config.js) ;;
  *"$WURZEL"/index.html) ;;
  *) exit 0 ;;
esac

# Ohne node_modules kann nichts laufen — das ist kein Testfehler.
if [ ! -d node_modules ]; then
  echo "Hinweis: node_modules fehlt, Verifikation übersprungen. 'npm install' ausführen." >&2
  exit 0
fi

ausgabe="$(npm test 2>&1)"
status=$?

if [ $status -ne 0 ]; then
  {
    echo "npm test ist fehlgeschlagen (nach Änderung an ${pfad#"$WURZEL"/})."
    echo
    # Nur der Schwanz: der Fehler steht dort, und der volle Build-Log wäre Rauschen.
    printf '%s\n' "$ausgabe" | tail -40
    echo
    echo "Beheben, bevor weitergearbeitet wird — nicht umgehen und nicht später nachholen."
  } >&2
  exit 2
fi

exit 0
