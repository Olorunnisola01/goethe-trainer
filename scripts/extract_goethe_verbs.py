#!/usr/bin/env python3
"""Extract verbs from Goethe B1 official Wortliste CSV."""
import re
from pathlib import Path

def extract_verbs_from_goethe_wortliste(csv_path: str):
    verbs = set()
    with open(csv_path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line:
                continue
            # Match lines starting with infinitive-like word, possibly quoted
            m = re.match(r'^"?([a-zäöüß]+(?:en|eln|ern|n))"?\s*,', line, re.IGNORECASE)
            if not m:
                continue
            inf = m.group(1).lower()
            if len(inf) < 3:
                continue
            # Skip obvious function words / nouns that slipped the pattern
            skip_prefixes = ("der", "die", "das", "ein", "eine", "zu", "für", "mit", "auf", "in", "an", "von", "bei", "nach", "vor", "um", "über", "durch", "unter", "zwischen", "während", "seit", "bis", "aus", "ohne", "gegen", "wider", "statt", "trotz", "wegen", "innerhalb", "außerhalb", "dies", "mein", "dein", "sein", "ihr", "unser", "euer", "jeder", "mancher", "viel", "wenig", "alle", "kein", "irgend", "etwas", "nichts", "jemand", "niemand", "wer", "was", "welch", "dieser", "jener", "man", "frau", "herr", "frau", "kind", "leute")
            if any(inf == p or inf.startswith(p) for p in skip_prefixes):
                continue
            # Strong signal it's a verb entry: contains typical aux or prefix patterns after comma, or long entry with forms
            if re.search(r',\s*(hat |ist |sind |wird |kann |muss |soll |will |darf |mag |[a-zäöüß]+(ab|an|auf|aus|ein|mit|nach|vor|zu|her|hin|weg|zurück|durch|um|unter|über|ent|er|ge|be|ver|zer|zer|miss))', line, re.IGNORECASE):
                verbs.add(inf)
            elif len(line) > 40 and "," in line:
                # fallback for some entries
                verbs.add(inf)
    return sorted(verbs)

if __name__ == "__main__":
    vs = extract_verbs_from_goethe_wortliste("goethe_b1_official.csv")
    print(f"Extracted {len(vs)} verb candidates from Goethe B1 Wortliste")
    print("Sample A1-ish common:", [v for v in vs if v in {"machen","gehen","kommen","sehen","sprechen","lesen","schreiben","essen","trinken","schlafen","fahren","fliegen","laufen","lernen","arbeiten","wohnen","heißen","haben","sein","werden","können","müssen"}][:20])
    print("First 40:", vs[:40])
    print("...")
    Path("scripts/goethe_b1_verbs.txt").write_text("\n".join(vs), encoding="utf-8")
    print("Wrote scripts/goethe_b1_verbs.txt")
