# Minecraftquiz (Minecraft Puzzle)

A daily guessing game inspired by Wordle and Lolidle, built entirely for Minecraft fans! Test your knowledge across different game modes and see if you can guess the correct mob, item, or music disc.

## 🎮 Game Modes

### 1. Mobdle 🧟‍♂️
Guess the daily Minecraft mob! Each guess will reveal properties of the mob, helping you narrow down your options:
- **Type:** Passive, Hostile, Neutral, etc.
- **Dimension:** Overworld, Nether, or End.
- **Health & Attack:** Does it match the stats?
- **Movement, Size & Drops:** Additional clues to find the right mob!

*(Green color indicates an exact match for the property, yellow/red indicate partial matches or incorrect properties depending on the context).*

### 2. Craftdle 🛠️
Test your crafting and item knowledge. Guess the daily item based on its properties:
- **Type:** Block, Item, Food, etc.
- **Renewable:** Can you get it infinitely?
- **Stackable:** Does it stack to 64, 16, or not at all?
- **Tool:** Is it used as a tool or weapon?
- **Recipe:** Is it craftable?

### 3. Discdle 🎵
For the audiophiles! Listen to a short audio snippet and guess which Minecraft music disc is currently playing.

## ✨ Features

- **Daily Challenges:** A new mob, item, and disc every day!
- **Achievements System:** Unlock special trophies as you play 🏆
- **Stats Tracking:** Keep track of your win rate, current streak, and max streak.
- **Share your results:** Show off your score with a shareable text output.
- **Responsive UI:** Works great on desktop and mobile devices.

## 🚀 How to Play Locally

This project is fully client-side. To run it locally:

1. Clone or download this repository.
2. Open the folder `Minecraftquiz`.
3. Double-click the `index.html` file to open it in your web browser.
4. Enjoy playing!

## 🛠️ Technologies Used

- **HTML5** & **CSS3** (Custom Lolidle-inspired UI)
- **Vanilla JavaScript** (Game logic, daily seed generation, and local storage for stats)
- **Python** (Scripts for data translation/fetching like `translate.py` and `fix_img.py`)
- JSON data files (`mobs.json`, `items.json`, `discs.json`)

## 📜 License

This project is for educational and entertainment purposes. Minecraft is a registered trademark of Mojang Synergies AB. This project is not affiliated with or endorsed by Mojang or Microsoft.