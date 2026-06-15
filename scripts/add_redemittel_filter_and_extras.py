#!/usr/bin/env python3
"""
1. Marks the first 8 A2 presentation-heavy categories with "presentationHeavy": true
   so the UI can offer an "All" vs "Strictly Goethe (Speaking + Writing)" filter.

2. Enhances picture description phrases for A2 (and adds a B1 version).

3. Adds a dedicated high-value category for B1 Schreiben: connectors & text structure
   (very useful because the Redemittel section is used for writing prep too).

Only appends new categories and adds the flag to existing ones. Safe to re-run.
"""

import json
from pathlib import Path

# The exact titles of the 8 presentation-heavy A2 categories (from current data)
PRESENTATION_HEAVY_A2_TITLES = [
    "Anrede",
    "Einleitung",
    "Thema nennen",
    "Begründung",
    "Gliederung",
    "Hauptteil — Übergänge",
    "Auf Tabellen / Bilder verweisen",
    "Schluss & Dank",
]

# Additional high-quality picture description phrases (will be merged into the existing A2 "Bild beschreiben" cat)
EXTRA_PICTURE_PHRASES_A2 = [
    {"de": "Auf dem Bild sieht man ...", "en": "In the picture you can see ..."},
    {"de": "Im Vordergrund / Im Hintergrund ist/sind ...", "en": "In the foreground / In the background there is/are ..."},
    {"de": "Links / Rechts / In der Mitte erkennt man ...", "en": "On the left / On the right / In the middle you can see ..."},
    {"de": "Die Person / Die Menschen tragen ... und wirken ...", "en": "The person / The people are wearing ... and seem ..."},
    {"de": "Die Stimmung auf dem Bild ist fröhlich / ernst / hektisch.", "en": "The mood in the picture is cheerful / serious / hectic."},
    {"de": "Ich glaube, das Bild soll zeigen, dass ...", "en": "I think the picture is meant to show that ..."},
    {"de": "Ein interessantes Detail ist ...", "en": "An interesting detail is ..."},
]

# New or enhanced B1 picture description (some exams have visual elements or for general prep)
EXTRA_PICTURE_PHRASES_B1 = [
    {"de": "Das Bild / Die Grafik veranschaulicht das Thema ...", "en": "The picture / The graphic illustrates the topic ..."},
    {"de": "Besonders auffällig ist, dass ...", "en": "What stands out particularly is that ..."},
    {"de": "Man kann erkennen, dass die Personen ...", "en": "You can see that the people ..."},
    {"de": "Die Darstellung soll wahrscheinlich darauf hinweisen, dass ...", "en": "The depiction is probably meant to indicate that ..."},
]

# New dedicated B1 Schreiben category (text structure & connectors) - extremely useful for writing prep
B1_SCHREIBEN_CONNECTORS = {
    "cat": "Schreiben: Textstruktur & Konnektoren (B1)",
    "en": "Writing: Text Structure & Connectors (B1)",
    "topic": "",
    "level": "B1",
    "phrases": [
        {"de": "Lieber / Liebe ...,", "en": "Dear ...,"},
        {"de": "Vielen Dank für deinen / Ihren Brief / deine / Ihre E-Mail.", "en": "Thank you very much for your letter / email."},
        {"de": "Ich schreibe dir / Ihnen, weil ... / um dir / Ihnen von ... zu erzählen.", "en": "I'm writing to you because ... / to tell you about ..."},
        {"de": "Zuerst / Zunächst einmal möchte ich ...", "en": "First of all I would like to ..."},
        {"de": "Ein weiterer wichtiger Punkt ist ...", "en": "Another important point is ..."},
        {"de": "Außerdem / Des Weiteren / Darüber hinaus ...", "en": "In addition / Furthermore / Moreover ..."},
        {"de": "Deshalb / Aus diesem Grund ...", "en": "Therefore / For this reason ..."},
        {"de": "Allerdings / Trotzdem / Dennoch ...", "en": "However / Nevertheless / Still ..."},
        {"de": "Einerseits ... , andererseits ...", "en": "On the one hand ... , on the other hand ..."},
        {"de": "Zusammenfassend kann man sagen, dass ...", "en": "To sum up, one can say that ..."},
        {"de": "Ich hoffe, bald wieder von dir / Ihnen zu hören.", "en": "I hope to hear from you again soon."},
        {"de": "Herzliche / Viele Grüße", "en": "Best / Kind regards"},
        {"de": "Mit freundlichen Grüßen", "en": "Yours sincerely / Kind regards (formal)"},
    ]
}

def main():
    src = Path("public/data/redemittel.json")
    if not src.exists():
        raise FileNotFoundError(f"Source not found: {src}")

    print("Loading redemittel.json ...")
    with open(src, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 1. Mark presentationHeavy categories for A2
    marked = 0
    for cat in data:
        if cat.get("level") == "A2" and cat.get("cat") in PRESENTATION_HEAVY_A2_TITLES:
            cat["presentationHeavy"] = True
            marked += 1
            print(f"  Marked as presentationHeavy: {cat['cat']}")

    print(f"\nMarked {marked} A2 categories as presentationHeavy.")

    # 2. Enhance existing A2 "Bild beschreiben" category with more phrases
    enhanced = 0
    for cat in data:
        if cat.get("level") == "A2" and "Bild beschreiben" in cat.get("cat", ""):
            existing_des = {p["de"] for p in cat.get("phrases", [])}
            for p in EXTRA_PICTURE_PHRASES_A2:
                if p["de"] not in existing_des:
                    cat.setdefault("phrases", []).append(p)
                    enhanced += 1
            print(f"  Enhanced A2 picture description category (+{enhanced} new phrases)")
            break

    # 3. Add a B1 picture description category (new, useful for prep)
    has_b1_picture = any(
        c.get("level") == "B1" and "Bild" in c.get("cat", "") or "Visual" in c.get("cat", "")
        for c in data
    )
    if not has_b1_picture:
        new_b1_pic = {
            "cat": "Bild- und Grafikbeschreibung (B1)",
            "en": "Describing Pictures and Graphics (B1)",
            "topic": "",
            "level": "B1",
            "phrases": EXTRA_PICTURE_PHRASES_B1
        }
        data.append(new_b1_pic)
        print("  Added new B1 picture/graphics description category")

    # 4. Add the new B1 Schreiben connectors category (if not already present)
    has_schreiben_connectors = any(
        c.get("level") == "B1" and "Schreiben" in c.get("cat", "") and "Konnektoren" in c.get("cat", "")
        for c in data
    )
    if not has_schreiben_connectors:
        data.append(B1_SCHREIBEN_CONNECTORS)
        print("  Added new B1 'Schreiben: Textstruktur & Konnektoren (B1)' category")

    # Write back (keep pretty-printed for maintainability)
    with open(src, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Final counts
    with open(src, "r", encoding="utf-8") as f:
        final = json.load(f)

    a2 = [c for c in final if c.get("level") == "A2"]
    b1 = [c for c in final if c.get("level") == "B1"]
    print(f"\nFinal counts:")
    print(f"  A2: {len(a2)} categories")
    print(f"  B1: {len(b1)} categories")
    print("[OK] redemittel.json updated with filter flag + extra exam-relevant phrases.")

if __name__ == "__main__":
    main()
