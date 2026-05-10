import json

# Fix items.json
try:
    with open('items.json', 'r', encoding='utf-8') as f:
        items = json.load(f)
        
    block_ids = {
        "obsidian": "block/obsidian.png",
        "beacon": "block/beacon.png",
        "furnace": "block/furnace_front.png",
        "crafting_table": "block/crafting_table_top.png",
        "tnt": "block/tnt_side.png",
        "glass": "block/glass.png",
        "sand": "block/sand.png"
    }
        
    for item in items:
        # Some items are blocks
        if item['id'] in block_ids:
            item['bild_url'] = f"https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/{block_ids[item['id']]}"
        else:
            # Everything else is an item
            item['bild_url'] = f"https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/item/{item['id']}.png"
            
    with open('items.json', 'w', encoding='utf-8') as f:
        json.dump(items, f, indent=2, ensure_ascii=False)
except Exception as e:
    print("Error items:", e)

# Fix mobs.json (if any images are broken)
# Actually, the user's mobs.json images were probably fine because the user had the game working before!
# They said "füge aber auch das richtige bild ein bei den logos", which refers to the newly added things (Discs and my expanded Items).
print("Done.")
