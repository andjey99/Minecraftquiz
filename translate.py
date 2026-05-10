import json
import os

def title_case(s):
    return ' '.join(word.capitalize() for word in s.split('_'))

# Translate mobs.json
try:
    with open('mobs.json', 'r', encoding='utf-8') as f:
        mobs = json.load(f)
        
    translations = {
        "Feindlich": "Hostile",
        "Passiv": "Passive",
        "Neutral": "Neutral",
        "Boss": "Boss",
        "Oberwelt": "Overworld",
        "Nether": "Nether",
        "Ende": "The End",
        "Explosiv": "Explosive",
        "Nahkampf": "Melee",
        "Fernkampf": "Ranged",
        "Gemischt": "Mixed",
        "Defensiv": "Defensive",
        "Boden": "Walking",
        "Fliegend": "Flying",
        "Schwimmend": "Swimming",
        "Ja": "Yes",
        "Nein": "No"
    }

    for mob in mobs:
        mob['name'] = title_case(mob['id'])
        if mob.get('typ') in translations: mob['typ'] = translations[mob['typ']]
        if mob.get('dimension') in translations: mob['dimension'] = translations[mob['dimension']]
        if mob.get('angriffsart') in translations: mob['angriffsart'] = translations[mob['angriffsart']]
        if mob.get('bewegungsart') in translations: mob['bewegungsart'] = translations[mob['bewegungsart']]
        if mob.get('hat_beute') in translations: mob['hat_beute'] = translations[mob['hat_beute']]

    with open('mobs.json', 'w', encoding='utf-8') as f:
        json.dump(mobs, f, indent=2, ensure_ascii=False)
except Exception as e:
    print("Error mobs:", e)

# Translate items.json
try:
    with open('items.json', 'r', encoding='utf-8') as f:
        items = json.load(f)
        
    for item in items:
        item['name'] = title_case(item['id'])
        
    with open('items.json', 'w', encoding='utf-8') as f:
        json.dump(items, f, indent=2, ensure_ascii=False)
except Exception as e:
    print("Error items:", e)

# Translate achievements.json
try:
    with open('achievements.json', 'r', encoding='utf-8') as f:
        achievements = json.load(f)
        
    # Manual translation for achievements
    ach_dict = {
        "ich_habs_vermasselt": ("I Messed Up", "Fail guessing the mob"),
        "erster_sieg": ("First Blood", "Win your first game"),
        "lehrling": ("Apprentice", "Win 5 games"),
        "geselle": ("Journeyman", "Win 25 games"),
        "meister": ("Master", "Win 50 games"),
        "heissgelaufen": ("Warming Up", "Reach a 3 win streak"),
        "unaufhaltsam": ("Unstoppable", "Reach a 10 win streak"),
        "legende": ("Legend", "Reach a 30 win streak"),
        "perfekte_woche": ("Perfect Week", "7 win streak"),
        "volltreffer": ("Bullseye", "Guess correctly on the first try"),
        "scharfschuetze": ("Sniper", "Guess correctly on the second try"),
        "effizient": ("Efficient", "Guess correctly within 3 tries"),
        "nervenkitzel": ("Thrill Seeker", "Guess correctly on the last try"),
        "pazifist": ("Pacifist", "Target was a passive mob"),
        "krieger": ("Warrior", "Target was a hostile mob"),
        "diplomat": ("Diplomat", "Target was a neutral mob"),
        "boss_bezwinger": ("Boss Slayer", "Target was a boss"),
        "one_shot_boss": ("One Shot Boss", "Guess a boss on the first try"),
        "nether_reisender": ("Nether Traveler", "Target was from the Nether"),
        "end_erforscher": ("End Explorer", "Target was from the End"),
        "flugkuenstler": ("Aviator", "Target is a flying mob"),
        "tiefseetaucher": ("Deep Sea Diver", "Target is a swimming mob"),
        "goliath": ("Goliath", "Target has more than 50 HP"),
        "zwerg": ("Dwarf", "Target is smaller than 1 block"),
        "historiker": ("Historian", "Target is from Alpha versions"),
        "zeitspringer": ("Time Hopper", "Target is from version 1.20 or newer")
    }
    
    for ach in achievements:
        if ach['id'] in ach_dict:
            ach['name'] = ach_dict[ach['id']][0]
            ach['beschreibung'] = ach_dict[ach['id']][1]
            
    with open('achievements.json', 'w', encoding='utf-8') as f:
        json.dump(achievements, f, indent=2, ensure_ascii=False)
except Exception as e:
    print("Error achievements:", e)

print("Translation done.")
