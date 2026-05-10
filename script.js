document.addEventListener('DOMContentLoaded', () => {
    // ### DOM-Elemente holen ###
    const mainTitle = document.querySelector('h1');
    const modeMobButton = document.getElementById('mode-mob');
    const modeCraftingButton = document.getElementById('mode-crafting');
    const modeDiscButton = document.getElementById('mode-disc');
    
    const mobGameContent = document.getElementById('mob-game-content');
    const craftingGameContent = document.getElementById('crafting-game-content');
    const discGameContent = document.getElementById('disc-game-content');
    
    const achievementsButton = document.getElementById('achievements-button');
    const toastContainer = document.getElementById('toast-container');
    const achievementsModal = document.getElementById('achievements-modal');
    const closeAchievementsModal = document.getElementById('close-achievements-modal');
    const achievementsGrid = document.getElementById('achievements-grid');

    // Mob-Rätsel Elemente
    const guessForm = document.getElementById('guess-form');
    const guessInput = document.getElementById('guess-input');
    const guessesBody = document.getElementById('guesses-body');
    const mobGridHeader = document.getElementById('mob-grid-header');
    const guessesLeftSpan = document.getElementById('guesses-left');
    const searchResults = document.getElementById('search-results');
    const hintBox = document.getElementById('hint-box');
    
    // Crafting-Rätsel Elemente
    const craftingGuessForm = document.getElementById('guess-form-crafting');
    const craftingGuessInput = document.getElementById('guess-input-crafting');
    const craftingGuessesBody = document.getElementById('guesses-body-crafting');
    const craftingGridHeader = document.getElementById('crafting-grid-header');
    const craftingSearchResults = document.getElementById('search-results-crafting');
    const craftingGuessesLeftSpan = document.getElementById('crafting-guesses-left');

    // Disc-Rätsel Elemente
    const discGuessForm = document.getElementById('guess-form-disc');
    const discGuessInput = document.getElementById('guess-input-disc');
    const discGuessesBody = document.getElementById('guesses-body-disc');
    const discSearchResults = document.getElementById('search-results-disc');
    const discGuessesLeftSpan = document.getElementById('disc-guesses-left');
    const playDiscButton = document.getElementById('play-disc-button');

    // End Game Elemente
    const endGameSection = document.getElementById('end-game-section');
    const shareButton = document.getElementById('share-button');
    const endGameMessage = document.getElementById('end-game-message');
    const countdownTimer = document.getElementById('countdown-timer');
    const gamesPlayedSpan = document.getElementById('games-played');
    const winRateSpan = document.getElementById('win-rate');
    const currentStreakSpan = document.getElementById('current-streak');
    const maxStreakSpan = document.getElementById('max-streak');

    // ### Globale Variablen ###
    let allMobs = [];
    let allItems = [];
    let allDiscs = [];
    let allAchievements = [];
    let unlockedAchievements = new Set();
    let currentMode = 'mob';

    // Variablen für Mob-Rätsel
    const MAX_GUESSES = 10;
    let targetMob = null;
    let guessesLeft = MAX_GUESSES;
    let highlightedIndex = -1;
    let guessHistory = [];
    let revealedHints = new Set();
    let isAnimating = false;
    let guessedMobsList = new Set();

    // Variablen für Crafting-Rätsel
    const MAX_CRAFTING_GUESSES = 5;
    let targetItem = null;
    let craftingGuessesLeft = MAX_CRAFTING_GUESSES;
    let craftingIsAnimating = false;
    let guessedItemsList = new Set();

    // Variablen für Disc-Rätsel
    const MAX_DISC_GUESSES = 5;
    let targetDisc = null;
    let discGuessesLeft = MAX_DISC_GUESSES;
    let discIsAnimating = false;
    let guessedDiscsList = new Set();
    let currentAudio = null;

    // ### Spielinitialisierung ###
    const initApp = async () => {
        try {
            const [mobRes, achRes, itemRes, discRes] = await Promise.all([
                fetch('./mobs.json'),
                fetch('./achievements.json'),
                fetch('./items.json'),
                fetch('./discs.json')
            ]);
            
            if (!mobRes.ok || !achRes.ok || !itemRes.ok || !discRes.ok) {
                throw new Error("Failed to load JSON files.");
            }
            
            allMobs = await mobRes.json();
            allAchievements = await achRes.json();
            allItems = await itemRes.json();
            allDiscs = await discRes.json();
            
            unlockedAchievements = loadUnlockedAchievements();
            
            setupEventListeners();
            switchToMobMode();
        } catch (error) {
            console.error("Initialization error:", error);
            alert("The game could not be loaded. Please try again later.");
        }
    };

    const setupEventListeners = () => {
        modeMobButton.addEventListener('click', switchToMobMode);
        modeCraftingButton.addEventListener('click', switchToCraftingMode);
        modeDiscButton.addEventListener('click', switchToDiscMode);
        achievementsButton.addEventListener('click', showAchievements);
        closeAchievementsModal.addEventListener('click', () => {
            achievementsModal.style.display = 'none';
        });
        window.addEventListener('click', (e) => {
            if (e.target === achievementsModal) {
                achievementsModal.style.display = 'none';
            }
        });
        
        playDiscButton.addEventListener('click', toggleAudio);
    };

    const switchModeLayout = () => {
        mobGameContent.style.display = 'none';
        craftingGameContent.style.display = 'none';
        discGameContent.style.display = 'none';
        endGameSection.style.display = 'none';
        
        modeMobButton.classList.remove('active');
        modeCraftingButton.classList.remove('active');
        modeDiscButton.classList.remove('active');
        
        if (currentAudio) {
            currentAudio.pause();
            playDiscButton.classList.remove('playing');
            playDiscButton.querySelector('.play-icon').classList.remove('spin-icon');
        }
    };

    const switchToMobMode = () => {
        currentMode = 'mob';
        mainTitle.innerHTML = 'Minecraft Puzzle';
        switchModeLayout();
        mobGameContent.style.display = 'flex';
        modeMobButton.classList.add('active');
        initMobGame();
    };

    const switchToCraftingMode = () => {
        currentMode = 'crafting';
        mainTitle.innerHTML = 'Minecraft Puzzle';
        switchModeLayout();
        craftingGameContent.style.display = 'flex';
        modeCraftingButton.classList.add('active');
        initCraftingGame();
    };

    const switchToDiscMode = () => {
        currentMode = 'disc';
        mainTitle.innerHTML = 'Minecraft Puzzle';
        switchModeLayout();
        discGameContent.style.display = 'flex';
        modeDiscButton.classList.add('active');
        initDiscGame();
    };

    // ===============================================================
    // ### LOGIK FÜR MOB-RÄTSEL ###
    // ===============================================================
    function initMobGame() {
        guessesLeft = MAX_GUESSES;
        isAnimating = false;
        guessedMobsList.clear();
        if(guessesLeftSpan) guessesLeftSpan.textContent = guessesLeft;
        if(hintBox) hintBox.style.display = 'none';
        if(mobGridHeader) mobGridHeader.style.display = 'none';
        revealedHints = new Set();
        if(guessesBody) guessesBody.innerHTML = '';
        guessHistory = [];
        
        const dayIndex = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
        targetMob = allMobs[dayIndex % allMobs.length];
        console.log("Daily mob:", targetMob.name);

        guessForm.onsubmit = handleGuess;
        guessInput.oninput = (e) => handleLiveSearch(e, guessInput, searchResults, allMobs, mobResultClick, guessedMobsList);
        guessInput.onkeydown = (e) => handleKeyboardNav(e, guessInput, searchResults, handleGuess, highlightedIndex, (idx) => highlightedIndex = idx);
        
        shareButton.onclick = shareResults;
        guessInput.disabled = false;
    }

    const mobResultClick = (item) => {
        guessInput.value = item.name;
        searchResults.style.display = 'none';
        searchResults.innerHTML = '';
        guessForm.dispatchEvent(new Event('submit'));
    };

    const handleGuess = (e) => {
        e.preventDefault();
        if (isAnimating || guessesLeft <= 0) return;
        
        const guessName = guessInput.value.trim();
        const guessedMob = allMobs.find(b => b.name.toLowerCase() === guessName.toLowerCase());
        
        if (!guessedMob) {
            guessInput.classList.add('color-incorrect');
            setTimeout(() => guessInput.classList.remove('color-incorrect'), 300);
            return;
        }
        
        guessedMobsList.add(guessedMob.id);
        searchResults.style.display = 'none';
        guessInput.value = '';
        
        if (guessesLeft > 0) {
            guessesLeft--;
            guessesLeftSpan.textContent = guessesLeft;
            if (mobGridHeader.style.display === 'none') mobGridHeader.style.display = 'flex';
            
            isAnimating = true;
            renderGuessRow(guessedMob, () => {
                isAnimating = false;
                if (guessedMob.name === targetMob.name) {
                    endGame(true, targetMob.name);
                } else {
                    if (guessesLeft === MAX_GUESSES - 5) giveHint();
                    if (guessesLeft === 0) endGame(false, targetMob.name);
                }
            });
        }
    };

    const renderGuessRow = (guessedMob, onComplete) => {
        const row = document.createElement('div');
        row.className = 'guess-row';
        guessesBody.prepend(row);
        
        let rowHistory = '';
        const cellsData = [];
        
        cellsData.push({ display: `<img src="${guessedMob.bild_url}" alt="${guessedMob.name}">`, class: guessedMob.name === targetMob.name ? 'color-correct' : 'color-incorrect' });
        const properties = ['typ', 'dimension', 'lebenspunkte', 'angriffsart', 'bewegungsart', 'groesse', 'release_version', 'hat_beute'];
        
        properties.forEach(prop => {
            let feedback;
            if (prop === 'release_version') feedback = compareValue(guessedMob[prop], targetMob[prop], true, false);
            else if (typeof guessedMob[prop] === 'number') feedback = compareValue(guessedMob[prop], targetMob[prop], false, true);
            else feedback = compareValue(guessedMob[prop], targetMob[prop], false, false);
            
            cellsData.push(feedback);
            if (feedback.class.includes('color-correct')) rowHistory += '🟩';
            else if (feedback.class.includes('color-partial')) rowHistory += '🟨';
            else rowHistory += '🟥';
        });
        
        guessHistory.push(rowHistory);
        executeFlipAnimation(row, cellsData, onComplete);
    };

    // ===============================================================
    // ### LOGIK FÜR CRAFTING-RÄTSEL ###
    // ===============================================================
    function initCraftingGame() {
        craftingGuessesLeft = MAX_CRAFTING_GUESSES;
        craftingIsAnimating = false;
        guessedItemsList.clear();
        craftingGuessesBody.innerHTML = '';
        craftingGuessInput.value = '';
        craftingGuessInput.disabled = false;
        if(craftingGuessesLeftSpan) craftingGuessesLeftSpan.textContent = craftingGuessesLeft;
        if(craftingGridHeader) craftingGridHeader.style.display = 'none';
        
        const dayIndex = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
        targetItem = allItems[dayIndex % allItems.length]; 
        console.log("Daily crafting item:", targetItem?.name);

        craftingGuessForm.onsubmit = handleCraftingGuess;
        craftingGuessInput.oninput = (e) => handleLiveSearch(e, craftingGuessInput, craftingSearchResults, allItems, craftingResultClick, guessedItemsList);
        craftingGuessInput.onkeydown = (e) => handleKeyboardNav(e, craftingGuessInput, craftingSearchResults, handleCraftingGuess, craftingHighlightedIndex, (idx) => craftingHighlightedIndex = idx);
    }

    const craftingResultClick = (item) => {
        craftingGuessInput.value = item.name;
        craftingSearchResults.style.display = 'none';
        craftingSearchResults.innerHTML = '';
        craftingGuessForm.dispatchEvent(new Event('submit'));
    };

    function handleCraftingGuess(e) {
        e.preventDefault();
        if(craftingIsAnimating || craftingGuessesLeft <= 0) return;
        
        const guessName = craftingGuessInput.value.trim();
        if (!guessName) return;
        const guessedItem = allItems.find(item => item.name.toLowerCase() === guessName.toLowerCase());

        if (!guessedItem) {
            craftingGuessInput.classList.add('color-incorrect');
            setTimeout(() => craftingGuessInput.classList.remove('color-incorrect'), 300);
            return;
        }

        guessedItemsList.add(guessedItem.id);
        craftingSearchResults.style.display = 'none';
        craftingGuessInput.value = '';
        
        if (craftingGuessesLeft > 0) {
            craftingGuessesLeft--;
            if(craftingGuessesLeftSpan) craftingGuessesLeftSpan.textContent = craftingGuessesLeft;
            if (craftingGridHeader.style.display === 'none') {
                craftingGridHeader.style.display = 'flex';
            }
            
            craftingIsAnimating = true;
            renderCraftingGuessRow(guessedItem, () => {
                craftingIsAnimating = false;
                if (guessedItem.name === targetItem.name) {
                    endGame(true, targetItem.name);
                } else if (craftingGuessesLeft <= 0) {
                    endGame(false, targetItem.name);
                }
            });
        }
    }

    function renderCraftingGuessRow(guessedItem, onComplete) {
        const row = document.createElement('div');
        row.className = 'guess-row';
        craftingGuessesBody.prepend(row);
        
        const targetRecipes = targetItem.recipe || [];
        const isIngredientInRecipe = targetRecipes.includes(guessedItem.id);

        let recipeFeedbackClass = 'color-incorrect';
        if (guessedItem.name === targetItem.name) recipeFeedbackClass = 'color-correct';
        else if (isIngredientInRecipe) recipeFeedbackClass = 'color-partial'; 

        const cellsData = [
            { display: `<img src="${guessedItem.bild_url}" alt="${guessedItem.name}">`, class: guessedItem.name === targetItem.name ? 'color-correct' : 'color-incorrect' },
            { display: guessedItem.typ || 'N/A', class: guessedItem.typ === targetItem.typ ? 'color-correct' : 'color-incorrect' },
            { display: guessedItem.erneuerbar || 'N/A', class: (guessedItem.erneuerbar || 'N/A') === (targetItem.erneuerbar || 'N/A') ? 'color-correct' : 'color-incorrect' },
            { display: guessedItem.stapelbar || 'N/A', class: (guessedItem.stapelbar || 0) === (targetItem.stapelbar || 0) ? 'color-correct' : 'color-incorrect' },
            { display: guessedItem.abbauwerkzeug || 'N/A', class: (guessedItem.abbauwerkzeug || 'N/A') === (targetItem.abbauwerkzeug || 'N/A') ? 'color-correct' : 'color-incorrect' },
            { display: isIngredientInRecipe ? 'Yes' : 'No', class: recipeFeedbackClass }
        ];

        executeFlipAnimation(row, cellsData, onComplete);
    }

    // ===============================================================
    // ### LOGIK FÜR DISC-RÄTSEL ###
    // ===============================================================
    function initDiscGame() {
        discGuessesLeft = MAX_DISC_GUESSES;
        discIsAnimating = false;
        guessedDiscsList.clear();
        discGuessesBody.innerHTML = '';
        discGuessInput.value = '';
        discGuessInput.disabled = false;
        if(discGuessesLeftSpan) discGuessesLeftSpan.textContent = discGuessesLeft;
        
        // Target Disc selection relies on dates to be daily
        const dayIndex = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
        targetDisc = allDiscs[dayIndex % allDiscs.length]; 
        console.log("Daily disc:", targetDisc?.name);

        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        currentAudio = new Audio(targetDisc.audio_url);
        currentAudio.loop = true;

        discGuessForm.onsubmit = handleDiscGuess;
        
        let discHighlightedIndex = -1;
        discGuessInput.oninput = (e) => handleLiveSearch(e, discGuessInput, discSearchResults, allDiscs, discResultClick, guessedDiscsList);
        discGuessInput.onkeydown = (e) => handleKeyboardNav(e, discGuessInput, discSearchResults, handleDiscGuess, discHighlightedIndex, (idx) => discHighlightedIndex = idx);
    }

    function toggleAudio() {
        if (!currentAudio) return;
        const icon = playDiscButton.querySelector('.play-icon');
        
        if (currentAudio.paused) {
            currentAudio.play();
            playDiscButton.classList.add('playing');
            icon.classList.add('spin-icon');
        } else {
            currentAudio.pause();
            playDiscButton.classList.remove('playing');
            icon.classList.remove('spin-icon');
        }
    }

    const discResultClick = (item) => {
        discGuessInput.value = item.name;
        discSearchResults.style.display = 'none';
        discSearchResults.innerHTML = '';
        discGuessForm.dispatchEvent(new Event('submit'));
    };

    function handleDiscGuess(e) {
        e.preventDefault();
        if(discIsAnimating || discGuessesLeft <= 0) return;
        
        const guessName = discGuessInput.value.trim();
        if (!guessName) return;
        const guessedDisc = allDiscs.find(item => item.name.toLowerCase() === guessName.toLowerCase());

        if (!guessedDisc) {
            discGuessInput.classList.add('color-incorrect');
            setTimeout(() => discGuessInput.classList.remove('color-incorrect'), 300);
            return;
        }

        guessedDiscsList.add(guessedDisc.id);
        discSearchResults.style.display = 'none';
        discGuessInput.value = '';
        
        if (discGuessesLeft > 0) {
            discGuessesLeft--;
            if(discGuessesLeftSpan) discGuessesLeftSpan.textContent = discGuessesLeft;
            
            discIsAnimating = true;
            renderDiscGuessRow(guessedDisc, () => {
                discIsAnimating = false;
                if (guessedDisc.name === targetDisc.name) {
                    endGame(true, targetDisc.name);
                } else if (discGuessesLeft <= 0) {
                    endGame(false, targetDisc.name);
                }
            });
        }
    }

    function renderDiscGuessRow(guessedDisc, onComplete) {
        const cell = document.createElement('div');
        cell.className = 'disc-guess-cell';
        cell.innerHTML = `<img src="${guessedDisc.bild_url}" alt="${guessedDisc.name}" title="${guessedDisc.name}">`;
        
        const isCorrect = guessedDisc.name === targetDisc.name;
        const finalClass = isCorrect ? 'color-correct' : 'color-incorrect';
        
        discGuessesBody.appendChild(cell);

        setTimeout(() => {
            cell.classList.add('flip-animate');
            setTimeout(() => {
                cell.classList.add(finalClass);
            }, 300);
            setTimeout(() => {
                if(onComplete) onComplete();
            }, 600);
        }, 100);
    }


    // ===============================================================
    // ### HELPERS & ANIMATIONS & ENDGAME ###
    // ===============================================================

    const executeFlipAnimation = (row, cellsData, onComplete) => {
        let completedAnimations = 0;
        const totalAnimations = cellsData.length;

        cellsData.forEach((data, index) => {
            const cell = document.createElement('div');
            cell.className = 'guess-cell';
            cell.innerHTML = data.display;
            row.appendChild(cell);

            setTimeout(() => {
                cell.classList.add('flip-animate');
                setTimeout(() => {
                    const classes = data.class.split(' ').filter(c => c);
                    cell.classList.add(...classes);
                }, 300);
                setTimeout(() => {
                    completedAnimations++;
                    if(completedAnimations === totalAnimations && onComplete) onComplete();
                }, 600);
            }, index * 250);
        });
    };

    const handleLiveSearch = (e, inputEle, resultsEle, dataList, clickHandler, excludeSet) => {
        const query = inputEle.value.toLowerCase().trim();
        resultsEle.innerHTML = '';
        if (query.length === 0) {
            resultsEle.style.display = 'none';
            return;
        }
        
        const filteredData = dataList.filter(item => {
            if (excludeSet.has(item.id)) return false;
            return item.name.toLowerCase().startsWith(query) || item.name.toLowerCase().includes(query);
        }).slice(0, 5);
        
        if (filteredData.length > 0) {
            filteredData.forEach(item => {
                const div = document.createElement('div');
                div.className = 'result-item';
                const imgSrc = item.bild_url || '';
                div.innerHTML = `<img src="${imgSrc}" alt="${item.name}"><span>${item.name}</span>`;
                div.addEventListener('click', () => clickHandler(item));
                resultsEle.appendChild(div);
            });
            resultsEle.style.display = 'block';
        } else {
            resultsEle.style.display = 'none';
        }
    };

    const handleKeyboardNav = (e, inputEle, resultsEle, submitHandler, indexVar, updateIndex) => {
        const items = resultsEle.querySelectorAll('.result-item');
        if (items.length === 0 && e.key !== 'Enter') return;
        
        if (indexVar > -1 && items[indexVar]) {
            items[indexVar].classList.remove('highlighted');
        }
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            indexVar++;
            if (indexVar >= items.length) indexVar = 0;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            indexVar--;
            if (indexVar < 0) indexVar = items.length - 1;
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (indexVar > -1 && items[indexVar]) items[indexVar].click();
            else submitHandler(e);
            resultsEle.style.display = 'none';
            return;
        }
        
        if (indexVar > -1 && items[indexVar]) {
            items[indexVar].classList.add('highlighted');
        }
        updateIndex(indexVar);
    };

    const compareValue = (guessValue, targetValue, isVersion = false, isNumeric = false) => {
        let result = { display: guessValue, class: 'color-incorrect' };
        
        if (isVersion) {
            const gVal = parseVersion(guessValue);
            const tVal = parseVersion(targetValue);
            if (gVal === tVal) result.class = 'color-correct';
            else if (gVal < tVal) result.class += ' arrow-up';
            else result.class += ' arrow-down';
        } else if (isNumeric) {
            if (guessValue === targetValue) result.class = 'color-correct';
            else if (guessValue < targetValue) result.class += ' arrow-up';
            else result.class += ' arrow-down';
        } else {
            if (guessValue === targetValue) result.class = 'color-correct';
        }
        return result;
    };

    const parseVersion = (ver) => {
        if (!ver) return 0;
        const v = ver.toString().toLowerCase();
        if (v.includes("alpha")) return 0.1;
        if (v.includes("beta")) {
            const num = parseFloat(v.replace(/[^0-9.]/g, '')) || 0;
            return 0.5 + (num * 0.01); 
        }
        const parts = v.replace(/[^0-9.]/g, '').split('.');
        let score = 1.0; 
        if (parts.length > 0) score += parseInt(parts[0]) || 0;
        if (parts.length > 1) score += (parseInt(parts[1]) || 0) * 0.001; 
        if (parts.length > 2) score += (parseInt(parts[2]) || 0) * 0.00001;
        return score;
    };

    const giveHint = () => {
        const hintableProperties = ['typ', 'dimension', 'bewegungsart', 'angriffsart', 'release_version', 'hat_beute'];
        const availableHints = hintableProperties.filter(prop => !revealedHints.has(prop));
        if (availableHints.length === 0) return;
        const randomProp = availableHints[Math.floor(Math.random() * availableHints.length)];
        revealedHints.add(randomProp);
        const propNameMap = { typ: "Type", dimension: "Dimension", bewegungsart: "Movement", angriffsart: "Attack", release_version: "Release", hat_beute: "Drops" };
        const hintValue = targetMob[randomProp];
        hintBox.textContent = `💡 Hint: ${propNameMap[randomProp]} -> ${hintValue}`;
        hintBox.style.display = 'block';
    };

    const endGame = (isWin, answerName) => {
        if (currentAudio) {
            currentAudio.pause();
            playDiscButton.classList.remove('playing');
            playDiscButton.querySelector('.play-icon').classList.remove('spin-icon');
        }

        // Disable input
        if (currentMode === 'mob') guessInput.disabled = true;
        if (currentMode === 'crafting') craftingGuessInput.disabled = true;
        if (currentMode === 'disc') discGuessInput.disabled = true;
        
        setTimeout(() => {
            const finalStats = updateStats(isWin);
            displayStats(finalStats);
            if (currentMode === 'mob') checkAllAchievements(finalStats, isWin);
            
            if (isWin) endGameMessage.textContent = "🎉 GG! You guessed it! 🎉";
            else endGameMessage.textContent = `Too bad! The answer was: ${answerName}`;
            
            endGameSection.style.display = 'block';
            endGameSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            startCountdown();
        }, 500); 
    };

    const startCountdown = () => {
        const timerInterval = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            const diff = tomorrow - now;
            const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
            const m = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
            const s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
            countdownTimer.textContent = `${h}:${m}:${s}`;
            if (diff < 0) {
                clearInterval(timerInterval);
                countdownTimer.textContent = "New puzzle available!";
            }
        }, 1000);
    };

    const loadStats = () => {
        const stats = JSON.parse(localStorage.getItem('mobRaetselStats'));
        return stats || { gamesPlayed: 0, wins: 0, currentStreak: 0, maxStreak: 0 };
    };

    const saveStats = (stats) => localStorage.setItem('mobRaetselStats', JSON.stringify(stats));

    const updateStats = (isWin) => {
        const stats = loadStats();
        stats.gamesPlayed++;
        if (isWin) {
            stats.wins++;
            stats.currentStreak++;
            if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
        } else {
            stats.currentStreak = 0;
        }
        saveStats(stats);
        return stats;
    };

    const displayStats = (stats) => {
        gamesPlayedSpan.textContent = stats.gamesPlayed;
        const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
        winRateSpan.textContent = `${winRate}%`;
        currentStreakSpan.textContent = stats.currentStreak;
        maxStreakSpan.textContent = stats.maxStreak;
    };

    const shareResults = () => {
        const dayIndex = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
        const attemptsText = currentMode === 'mob' ? `${MAX_GUESSES - guessesLeft}/${MAX_GUESSES}` : (currentMode === 'crafting' ? `${MAX_CRAFTING_GUESSES - craftingGuessesLeft}/${MAX_CRAFTING_GUESSES}` : `${MAX_DISC_GUESSES - discGuessesLeft}/${MAX_DISC_GUESSES}`);
        
        let grids = "";
        if (currentMode === 'mob') grids = guessHistory.join('\n');
        // Other modes can append their grids later
        
        const resultText = `${mainTitle.innerHTML} #${dayIndex} 🎮 ${attemptsText}\n\n${grids}`;
        navigator.clipboard.writeText(resultText).then(() => {
            alert("Result copied to clipboard!");
        }).catch(err => {
            console.error("Error copying: ", err);
        });
    };

    const loadUnlockedAchievements = () => new Set(JSON.parse(localStorage.getItem('mobRaetselUnlockedAchievements')) || []);
    const saveUnlockedAchievements = () => localStorage.setItem('mobRaetselUnlockedAchievements', JSON.stringify([...unlockedAchievements]));

    const showToast = (achievement) => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span class="toast-emoji">${achievement.emoji}</span> <div><b>Achievement unlocked!</b><br>${achievement.name}</div>`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    };

    const unlockAchievement = (id) => {
        if (!unlockedAchievements.has(id)) {
            unlockedAchievements.add(id);
            saveUnlockedAchievements();
            const achievement = allAchievements.find(a => a.id === id);
            if (achievement) showToast(achievement);
        }
    };

    const checkAllAchievements = (stats, isWin) => {
        // Reduced for brevity in generic mode handling
        if (!isWin) return unlockAchievement('ich_habs_vermasselt');
        unlockAchievement('erster_sieg');
        if (stats.wins >= 5) unlockAchievement('lehrling');
    };
    
    const showAchievements = () => {
        achievementsGrid.innerHTML = '';
        allAchievements.forEach(ach => {
            const item = document.createElement('div');
            item.className = 'achievement-item';
            const isUnlocked = unlockedAchievements.has(ach.id);
            if (isUnlocked) item.classList.add('unlocked');
            item.innerHTML = `<div class="achievement-header"><span>${ach.emoji}</span><span>${ach.name}</span></div><div class="achievement-desc">${isUnlocked ? ach.beschreibung : '???'}</div>`;
            achievementsGrid.appendChild(item);
        });
        achievementsModal.style.display = 'flex';
    };

    // Begin
    initApp();
});