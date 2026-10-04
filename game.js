let clicks = 0;
let plusOnes = [];

let clickPower = 1;
let upgradeCost = 100;

let autoClick = false;
let autoClick2 = false;

let jackpot = false;
let jackpotCost = 300;

// Скины
let currentSkin = "default";
let skinCowboyBought = false;
let skinJirityBought = false;
const box = new Image();
box.src = "assets/box.png";

const background = new Image();
background.src = "assets/background.png";

// Прозрачность фона: 1.0 — полностью непрозрачный, 0.5 — полупрозрачный
let backgroundAlpha = 1;

// Музыка
const backgroundMusic = new Audio("assets/music.mp3");
backgroundMusic.loop = true;      // зацикливаем
backgroundMusic.volume = 0.3;     // громкость 30%
let musicStarted = false;         // запущена ли уже
let musicEnabled = true;          // включена ли (для кнопки)

// Звуки (клики)
let soundsEnabled = true;         // вкл/выкл звуков (независимо от музыки)
const CLICK_VOLUME = 0.2;         // громкость клика (0.0 — 1.0)

// Состояние магазина
let shopTab = "shop";        // "shop" или "bought"
let selectedItemId = null;   // id выбранного товара
let clickUpgradeTimes = 0;   // сколько раз куплен "Усиленный клик"

let currentScreen = "game";
let gameState = "intro";   // "intro" или "playing"

// Настройки
let settingsOpen = false;

// Интро
let introClicks = 0;
let introClicksNeeded = 15;
let introPhase = "box";    // "box" → "greeting" → "done"
let introTimer = 0;        // кадры с момента открытия
const introGreetingDuration = 180;   // ~3 секунд при 60 fps

// Анимация коробки
let boxScale = 0.5;            // текущий размер (0.5 = 50%)
let boxTargetScale = 0.5;      // цель, к которой тянется пружина
let boxVelocity = 0;           // скорость для пружины

// Скример
let screamerActive = false;
let screamerTimer = 0;
const SCREAMER_DURATION = 90;        // ~1.5 сек при 60 fps
const SCREAMER_CHANCE = 0.001;       // 0.1% (1 из 1000 кликов)

const screamerImage = new Image();
screamerImage.src = "assets/screamer.png";

// Реплика на 100-м клике
let verityClickCount = 0;
let hundredMessageActive = false;
let hundredMessageTimer = 0;
const HUNDRED_MESSAGE_DURATION = 300;       // всего 5 секунд × 60 fps
const HUNDRED_MESSAGE_FADE_START = 210;     // с какого кадра начинать затухание (3.5 сек)

// Реплика на 500-м клике
let fiveHundredMessageActive = false;
let fiveHundredMessageTimer = 0;
const FIVE_HUNDRED_MESSAGE_DURATION = 300;
const FIVE_HUNDRED_MESSAGE_FADE_START = 210;

// Реплика на 1000-м клике
let thousandMessageActive = false;
let thousandMessageTimer = 0;
const THOUSAND_MESSAGE_DURATION = 300;
const THOUSAND_MESSAGE_FADE_START = 210;

const BOX_BASE_SIZE = 200;     // базовый размер коробки (при scale = 1.0)
const BOX_START_SCALE = 0.5;   // стартовый размер
const BOX_END_SCALE = 1.2;     // размер при 15 кликах
const BOX_GROW_PER_CLICK = (BOX_END_SCALE - BOX_START_SCALE) / introClicksNeeded;

let verityX = 300;
let verityY = 200;
let verityWidth = 200;
let verityHeight = 200;
let verityScale = 1;
let verityVelocity = 0;   // скорость изменения размера (для пружины)
let verityPressed = false; // нажата ли сейчас Верити
let verityPressedScale = 0.95;   // <-- до какого размера сжимается при нажатии

const verity = new Image();
verity.src = "assets/verity.png";

const verityCowboy = new Image();
verityCowboy.src = "assets/verity_cowboy.png";

const verityJirity = new Image();
verityJirity.src = "assets/jirity.png";

// ===== Описание всех товаров магазина =====
const shopItems = [
        {
        id: "skinDefault",
        name: "Обычный Верити",
        desc: "Стандартный образ Верити. Ничего лишнего.",
        color: "white",
        tab: "skins",
        oneTime: true,
        isVisible: function() { return true; },
        isBought: function() { return true; },
        getCost: function() { return 0; },
        getBoughtText: function() { return "надет"; },
        onBuy: function() {
            currentSkin = "default";
        }
    },
    {
        id: "skinCowboy",
        name: "Ковбой Верити",
        desc: "Где твоя ковбойская шляпа?",
        color: "white",
        tab: "skins",
        oneTime: true,
        isVisible: function() { return true; },
        isBought: function() { return skinCowboyBought; },
        getCost: function() { return 1000; },
        getBoughtText: function() { return "надет"; },
        onBuy: function() {
            if (skinCowboyBought === false) {
                clicks = clicks - 1000;
                skinCowboyBought = true;
            }
            currentSkin = "cowboy";
        }
    },
        {
        id: "skinJirity",
        name: "Жирити",
        desc: "Как Верити но толстый",
        color: "white",
        tab: "skins",
        oneTime: true,
        isVisible: function() { return true; },
        isBought: function() { return skinJirityBought; },
        getCost: function() { return 50000; },
        getBoughtText: function() { return "надет"; },
        onBuy: function() {
            if (skinJirityBought === false) {
                clicks = clicks - 50000;
                skinJirityBought = true;
            }
            currentSkin = "jirity";
        }
    },
    {
        id: "clickPower",
        name: "Усиленный клик",
        desc: "Увеличивает силу клика на +1. Каждая следующая покупка дороже в 3 раза.",
        color: "white",
        tab: "shop",
        oneTime: false,
        isVisible: function() { return true; },
        isBought: function() { return false; },
        getCost: function() { return upgradeCost; },
        getBoughtText: function() { return "куплено " + clickUpgradeTimes + " раз"; },
        onBuy: function() {
            clicks = clicks - upgradeCost;
            clickPower = clickPower + 1;
            this.totalSpent = (this.totalSpent || 0) + upgradeCost;
            upgradeCost = upgradeCost * 3;
            clickUpgradeTimes = clickUpgradeTimes + 1;
        },
        totalSpent: 0
    },
    {
        id: "jackpot",
        name: "Джекпот",
        desc: "Даёт 5% шанс, что ручной клик принесёт в 3 раза больше очков. Работает только на ручные клики.",
        color: "white",
        tab: "shop",
        oneTime: true,
        isVisible: function() { return true; },
        isBought: function() { return jackpot; },
        getCost: function() { return jackpotCost; },
        getBoughtText: function() { return "куплено"; },
        onBuy: function() {
            clicks = clicks - jackpotCost;
            jackpot = true;
            this.paidPrice = jackpotCost;
        }
    },
    {
        id: "autoClick",
        name: "Автоклик",
        desc: "Автоматически кликает по Верити раз в 2 секунды. Сила автоклика равна силе обычного клика.",
        color: "white",
        tab: "shop",
        oneTime: true,
        isVisible: function() { return true; },
        isBought: function() { return autoClick; },
        getCost: function() { return 250; },
        getBoughtText: function() { return "куплено"; },
        onBuy: function() {
            clicks = clicks - 250;
            autoClick = true;
            this.paidPrice = 250;
        }
    },
    {
        id: "autoClick2",
        name: "Автоклик 2.0",
        desc: "Улучшение для Автоклика: теперь он кликает раз в 1 секунду вместо 2 секунд.",
        color: "white",
        tab: "shop",
        oneTime: true,
        isVisible: function() { return autoClick === true; },
        isBought: function() { return autoClick2; },
        getCost: function() { return 1000; },
        getBoughtText: function() { return "куплено"; },
        onBuy: function() {
            clicks = clicks - 1000;
            autoClick2 = true;
            this.paidPrice = 1000;
        }
    }
];

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function drawBackground() {
    if (background.complete) {
        ctx.globalAlpha = backgroundAlpha;
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
    }
}
function playClickSound() {
    if (soundsEnabled === false) return;

    // Создаём НОВЫЙ объект Audio на каждый клик —
    // так несколько звуков могут играть одновременно
    let sound = new Audio("assets/click.mp3");
    sound.volume = CLICK_VOLUME;
    sound.play();
}
function drawScreamer() {
    if (screamerActive === false) return;

    if (screamerImage.complete) {
        ctx.drawImage(screamerImage, 0, 0, canvas.width, canvas.height);
    } else {
        // Заглушка, если картинка не загрузилась
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawGame() {
    drawBackground();

    // Счёт
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Очки: " + clicks, 20, 40);

        // верити (с учётом сжатия и скина)
    let scaledWidth = verityWidth * verityScale;
    let scaledHeight = verityHeight * verityScale;
    let scaledX = verityX + (verityWidth - scaledWidth) / 2;
    let scaledY = verityY + (verityHeight - scaledHeight) / 2;

    // Какую картинку рисовать — зависит от currentSkin
    let skinImage = verity;
    let skinOffsetY = 0;

    if (currentSkin === "cowboy" && verityCowboy.complete) {
        skinImage = verityCowboy;
        skinOffsetY = -30;
    } else if (currentSkin === "jirity" && verityJirity.complete) {
        skinImage = verityJirity;
        skinOffsetY = 0;   // <-- здесь при необходимости сдвинешь Жирити
    }

    ctx.drawImage(skinImage, scaledX, scaledY + skinOffsetY, scaledWidth, scaledHeight);

    // +1
    for (let plusOne of plusOnes) {
        ctx.font = "25px Arial";
        ctx.globalAlpha = plusOne.opacity;

        if (plusOne.isJackpot === true) {
            ctx.fillStyle = "red";
        } else {
            ctx.fillStyle = "yellow";
        }

        let amount = plusOne.amount !== undefined ? plusOne.amount : clickPower;
        ctx.fillText("+" + amount, plusOne.x, plusOne.y);
    }
    ctx.globalAlpha = 1;
    
//магаз
ctx.fillStyle = "white";
ctx.fillRect(20, 520, 200, 60);

ctx.font = "22px Arial";
ctx.fillStyle = "black";

// Центрируем текст по горизонтали внутри кнопки
let textWidth = ctx.measureText("МАГАЗИН").width;
let textX = 20 + (200 - textWidth) / 2;

ctx.fillText("МАГАЗИН", textX, 558);

// Реплика "Ты классный" на 100-м клике (с плавным затуханием)
if (hundredMessageActive === true) {
    // Считаем прозрачность: 1.0 — полностью видно, 0.0 — невидимо
    let alpha = 1.0;
    if (hundredMessageTimer > HUNDRED_MESSAGE_FADE_START) {
        // Плавное затухание в последние секунды
        let fadeProgress = (hundredMessageTimer - HUNDRED_MESSAGE_FADE_START) /
                           (HUNDRED_MESSAGE_DURATION - HUNDRED_MESSAGE_FADE_START);
        alpha = 1.0 - fadeProgress;
        if (alpha < 0) alpha = 0;
    }

    ctx.globalAlpha = alpha;
    ctx.font = "28px Arial";
    ctx.fillStyle = "white";
    let msg = "- ты классный :)";
    let msgW = ctx.measureText(msg).width;
    ctx.fillText(msg, (canvas.width - msgW) / 2, verityY + verityHeight + 50);
    ctx.globalAlpha = 1;   // обязательно вернуть!
}
// Реплика на 500-м клике
if (fiveHundredMessageActive === true) {
    let alpha = 1.0;
    if (fiveHundredMessageTimer > FIVE_HUNDRED_MESSAGE_FADE_START) {
        let fadeProgress = (fiveHundredMessageTimer - FIVE_HUNDRED_MESSAGE_FADE_START) /
                           (FIVE_HUNDRED_MESSAGE_DURATION - FIVE_HUNDRED_MESSAGE_FADE_START);
        alpha = 1.0 - fadeProgress;
        if (alpha < 0) alpha = 0;
    }

    ctx.globalAlpha = alpha;
    ctx.font = "28px Arial";
    ctx.fillStyle = "white";
    let msg500 = "- ты мне так нравишься!";
    let msg500W = ctx.measureText(msg500).width;
    ctx.fillText(msg500, (canvas.width - msg500W) / 2, verityY + verityHeight + 50);
    ctx.globalAlpha = 1;
}

// Реплика на 1000-м клике
if (thousandMessageActive === true) {
    let alpha = 1.0;
    if (thousandMessageTimer > THOUSAND_MESSAGE_FADE_START) {
        let fadeProgress = (thousandMessageTimer - THOUSAND_MESSAGE_FADE_START) /
                           (THOUSAND_MESSAGE_DURATION - THOUSAND_MESSAGE_FADE_START);
        alpha = 1.0 - fadeProgress;
        if (alpha < 0) alpha = 0;
    }

    ctx.globalAlpha = alpha;
    ctx.font = "28px Arial";
    ctx.fillStyle = "white";
    let msg1000 = "- я начинаю уставать...";
    let msg1000W = ctx.measureText(msg1000).width;
    ctx.fillText(msg1000, (canvas.width - msg1000W) / 2, verityY + verityHeight + 50);
    ctx.globalAlpha = 1;
}
drawSettingsButton();
drawSettingsWindow();
drawScreamer();   // <-- рисуется поверх всего
}
function drawIntro() {
    drawBackground();

    // ----- Параметры сцены -----
    let boxSize = 200;
    let boxX = (canvas.width - boxSize) / 2;
    let boxY = 200;

    // ----- Шкала прогресса -----
    let barW = 300;
    let barH = 20;
    let barX = (canvas.width - barW) / 2;
    let barY = boxY + boxSize + 40;

    // Фон шкалы
    ctx.fillStyle = "white";
    ctx.fillRect(barX, barY, barW, barH);

    // Заполнение
    let progress = introClicks / introClicksNeeded;
    if (progress > 1) progress = 1;
    ctx.fillStyle = "gold";
    ctx.fillRect(barX, barY, barW * progress, barH);

    // Рамка
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barW, barH);

    // ----- Фаза "box" — показываем коробку -----
    if (introPhase === "box") {
        // Размер с учётом пружины
        let drawSize = BOX_BASE_SIZE * boxScale;
        // Центрируем — коробка растёт из центра, а не от верхнего левого угла
        let drawX = (canvas.width - drawSize) / 2;
        let drawY = boxY + (BOX_BASE_SIZE - drawSize) / 2;

        if (box.complete) {
            ctx.drawImage(box, drawX, drawY, drawSize, drawSize);
        } else {
            // Заглушка, если картинка не загрузилась
            ctx.fillStyle = "sandybrown";
            ctx.fillRect(drawX, drawY, drawSize, drawSize);
            ctx.strokeStyle = "black";
            ctx.strokeRect(drawX, drawY, drawSize, drawSize);
        }

        // Надпись "ЖМИ!" над коробкой
        // Позиция текста привязана к базовому размеру, чтобы не прыгала
        ctx.font = "36px Arial";
        ctx.fillStyle = "white";
        let hint = "ЖМИ!";
        let hintW = ctx.measureText(hint).width;
        ctx.fillText(hint, (canvas.width - hintW) / 2, boxY - 30);
    }

    // ----- Фаза "greeting" — Верити выпрыгнула, здоровается -----
    if (introPhase === "greeting") {
        // Рисуем открытую коробку (чуть ниже)
        if (box.complete) {
            ctx.drawImage(box, boxX, boxY + 40, boxSize, boxSize);
        } else {
            ctx.fillStyle = "sandybrown";
            ctx.fillRect(boxX, boxY + 40, boxSize, boxSize);
        }

        // Верити выглядывает из коробки
        let verityW = 150;
        let verityH = 150;
        let verityX = (canvas.width - verityW) / 2;
        let verityY = boxY - verityH + 60;

        let skinImage = verity;
        if (currentSkin === "cowboy" && verityCowboy.complete) {
            skinImage = verityCowboy;
        }

        if (skinImage.complete) {
            ctx.drawImage(skinImage, verityX, verityY, verityW, verityH);
        }

        // Текст-приветствие под Верити
        ctx.font = "24px Arial";
        ctx.fillStyle = "white";
        let greeting = "Привет! Спасибо, что выпустил меня!";
        let textW = ctx.measureText(greeting).width;
        ctx.fillText(greeting, (canvas.width - textW) / 2, boxY + boxSize + 100);
    }

    drawSettingsButton();
    drawSettingsWindow();
}
function updatePlusOnes() {
    for (let i = plusOnes.length - 1; i >= 0; i--) {
        plusOnes[i].y = plusOnes[i].y - 1;
        plusOnes[i].opacity = plusOnes[i].opacity - 0.02;

        if (plusOnes[i].opacity <= 0) {
            plusOnes.splice(i, 1);
        }
    }

        // Пружинная физика для размера Верити
    const targetScale = verityPressed ? verityPressedScale : 1.0;
    const stiffness = 0.3;   // жёсткость пружины (чем больше — тем резче)
    const damping = 0.75;    // затухание (чем меньше — тем больше колебаний)

    verityVelocity = verityVelocity + (targetScale - verityScale) * stiffness;
    verityVelocity = verityVelocity * damping;
    verityScale = verityScale + verityVelocity;

    // Пружинная физика для размера коробки (только в фазе "box")
    if (gameState === "intro" && introPhase === "box") {
        const boxStiffness = 0.22;   // чуть слабее, чем у Верити (0.3)
        const boxDamping = 0.75;

        boxVelocity = boxVelocity + (boxTargetScale - boxScale) * boxStiffness;
        boxVelocity = boxVelocity * boxDamping;
        boxScale = boxScale + boxVelocity;
    }
    // --- Логика интро ---
    if (gameState === "intro") {
        if (introPhase === "greeting") {
            introTimer = introTimer + 1;
            if (introTimer >= introGreetingDuration) {
                introPhase = "done";
                gameState = "playing";
            }
        }
    }

    // --- Логика скримера (работает всегда) ---
    if (screamerActive === true) {
        screamerTimer = screamerTimer + 1;
        if (screamerTimer >= SCREAMER_DURATION) {
            screamerActive = false;
            screamerTimer = 0;
        }
    }
    // --- Логика реплики на 100-м клике ---
    if (hundredMessageActive === true) {
        hundredMessageTimer = hundredMessageTimer + 1;
        if (hundredMessageTimer >= HUNDRED_MESSAGE_DURATION) {
            hundredMessageActive = false;
            hundredMessageTimer = 0;
        }
    }
        // --- Логика реплики на 500-м клике ---
    if (fiveHundredMessageActive === true) {
        fiveHundredMessageTimer = fiveHundredMessageTimer + 1;
        if (fiveHundredMessageTimer >= FIVE_HUNDRED_MESSAGE_DURATION) {
            fiveHundredMessageActive = false;
            fiveHundredMessageTimer = 0;
        }
    }

    // --- Логика реплики на 1000-м клике ---
    if (thousandMessageActive === true) {
        thousandMessageTimer = thousandMessageTimer + 1;
        if (thousandMessageTimer >= THOUSAND_MESSAGE_DURATION) {
            thousandMessageActive = false;
            thousandMessageTimer = 0;
        }
    }

    if (currentScreen === "game") {
        if (gameState === "intro") {
            drawIntro();
        } else {
            drawGame();
        }
    }

    requestAnimationFrame(updatePlusOnes);
}
function drawShop() {
    drawBackground();

      // Заголовок
    ctx.font = "40px Arial";
    ctx.fillStyle = "white";
    let titleW = ctx.measureText("МАГАЗИН").width;
    ctx.fillText("МАГАЗИН", (canvas.width - titleW) / 2, 60);

    // Очки
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Очки: " + clicks, 20, 40);

    // ----- Вкладки -----
    // Товары
    if (shopTab === "shop") {
        ctx.fillStyle = "gold";
    } else {
        ctx.fillStyle = "white";
    }
    ctx.fillRect(20, 80, 150, 40);
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("ТОВАРЫ", 50, 107);

    // Куплено
    if (shopTab === "bought") {
        ctx.fillStyle = "gold";
    } else {
        ctx.fillStyle = "white";
    }
    ctx.fillRect(180, 80, 150, 40);
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("КУПЛЕНО", 210, 107);

        // Скины
    if (shopTab === "skins") {
        ctx.fillStyle = "gold";
    } else {
        ctx.fillStyle = "white";
    }
    ctx.fillRect(470, 80, 150, 40);
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("СКИНЫ", 510, 107);

    // ----- Список товаров слева -----
    let listX = 20;
    let listY = 140;
    let listW = 180;
    let itemH = 50;
    let itemGap = 10;

    // Собираем видимые товары для текущей вкладки
    let visibleItems = [];
    for (let i = 0; i < shopItems.length; i++) {
        let item = shopItems[i];
        if (item.isVisible() === false) continue;

        if (shopTab === "shop") {
            // В "Товарах" — только товары с tab="shop", которые ещё можно купить
            if (item.tab !== "shop") continue;
            if (item.oneTime === true && item.isBought() === true) continue;
            visibleItems.push(item);
        } else if (shopTab === "skins") {
            // В "Скинах" — только товары с tab="skins"
            if (item.tab !== "skins") continue;
            visibleItems.push(item);
        } else {
            // В "Куплено" — только то, что куплено (и не скины)
            if (item.tab === "skins") continue;
            if (item.oneTime === true && item.isBought() === true) {
                visibleItems.push(item);
            } else if (item.oneTime === false && clickUpgradeTimes > 0 && item.id === "clickPower") {
                visibleItems.push(item);
            }
        }
    }

    // Рисуем кнопки
    for (let i = 0; i < visibleItems.length; i++) {
        let item = visibleItems[i];
        let y = listY + i * (itemH + itemGap);

        // Подсветка, если выбран
        if (selectedItemId === item.id) {
            ctx.fillStyle = "gold";
        } else {
            ctx.fillStyle = item.color;
        }
        ctx.fillRect(listX, y, listW, itemH);

        // Рамка
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.strokeRect(listX, y, listW, itemH);

        // Название
        ctx.font = "16px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(item.name, listX + 10, y + 30);
    }

    // Если список пуст
    if (visibleItems.length === 0) {
        ctx.font = "18px Arial";
        ctx.fillStyle = "white";
        if (shopTab === "shop") {
            ctx.fillText("Все товары куплены!", listX + 10, listY + 30);
        } else {
            ctx.fillText("Ты пока ничего не купил.", listX + 10, listY + 30);
        }
    }

    // ----- Панель описания справа -----
    let panelX = 260;
    let panelY = 140;
    let panelW = 400;
    let panelH = 340;

    ctx.fillStyle = "white";
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    // Находим выбранный товар
    let selected = null;
    for (let i = 0; i < shopItems.length; i++) {
        if (shopItems[i].id === selectedItemId) {
            selected = shopItems[i];
            break;
        }
    }

    if (selected === null) {
        // Ничего не выбрано
        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Выбери товар слева", panelX + 40, panelY + 170);
    } else {
        // Название
        ctx.font = "26px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(selected.name, panelX + 20, panelY + 40);

        // Описание — переносим по строкам вручную
        ctx.font = "16px Arial";
        ctx.fillStyle = "black";
        let words = selected.desc.split(" ");
        let line = "";
        let lineY = panelY + 80;
        let maxWidth = panelW - 40;

        for (let w = 0; w < words.length; w++) {
            let testLine = line + words[w] + " ";
            if (ctx.measureText(testLine).width > maxWidth && line !== "") {
                ctx.fillText(line, panelX + 20, lineY);
                line = words[w] + " ";
                lineY += 22;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, panelX + 20, lineY);

        // Цена (или инфа о покупке, если мы во вкладке "Куплено")
        ctx.font = "22px Arial";
        ctx.fillStyle = "black";

        let cost = selected.getCost();

        // Для скинов — своя логика
        if (shopTab === "skins") {
            if (selected.isBought() === true) {
                // Скин куплен — показываем статус
                if ((selected.id === "skinDefault" && currentSkin === "default") ||
                    (selected.id === "skinCowboy" && currentSkin === "cowboy") ||
                    (selected.id === "skinJirity" && currentSkin === "jirity")) {
                    ctx.fillText("Надет", panelX + 20, panelY + 220);
                } else {
                    ctx.fillText("Куплено", panelX + 20, panelY + 220);
                }
            } else {
                // Скин не куплен — показываем цену
                ctx.fillText("Цена: " + cost + "⭐", panelX + 20, panelY + 220);

                if (clicks < cost) {
                    ctx.font = "16px Arial";
                    ctx.fillStyle = "red";
                    ctx.fillText("Не хватает " + (cost - clicks) + "⭐", panelX + 20, panelY + 245);
                }
            }
        } else if (shopTab === "bought") {
            // Во вкладке "Куплено" — показываем историю
            if (selected.id === "clickPower") {
                ctx.fillText("Куплено " + clickUpgradeTimes + " раз", panelX + 20, panelY + 220);
                ctx.font = "18px Arial";
                ctx.fillText("Всего потрачено: " + (selected.totalSpent || 0) + "⭐", panelX + 20, panelY + 248);
            } else {
                ctx.fillText("Куплено за: " + (selected.paidPrice || 0) + "⭐", panelX + 20, panelY + 220);
            }
        } else {
            ctx.fillText("Цена: " + cost + "⭐", panelX + 20, panelY + 220);

            if (clicks < cost) {
                ctx.font = "16px Arial";
                ctx.fillStyle = "red";
                ctx.fillText("Не хватает " + (cost - clicks) + "⭐", panelX + 20, panelY + 245);
            }
        }

        // ----- Кнопка "Купить" или "Куплено" -----
        let btnX = panelX + 20;
        let btnY = panelY + 270;
        let btnW = panelW - 40;
        let btnH = 50;

        let isBoughtHere = false;

        // Для скинов — отдельная логика
        if (shopTab === "skins") {
            // Если скин уже надет — кнопка "НАДЕТ"
            if ((selected.id === "skinDefault" && currentSkin === "default") ||
                (selected.id === "skinCowboy" && currentSkin === "cowboy") ||
                (selected.id === "skinJirity" && currentSkin === "jirity")) {
                isBoughtHere = true;
            }
            // Если скин куплен, но не надет — покажем "НАДЕТЬ" (обрабатывается ниже)
        } else {
            // Старая логика для обычных товаров
            if (selected.oneTime === true && selected.isBought() === true) {
                isBoughtHere = true;
            } else if (selected.oneTime === false && shopTab === "bought") {
                isBoughtHere = true;
            }
        }

        if (isBoughtHere === true) {
            ctx.fillStyle = "white";
            ctx.fillRect(btnX, btnY, btnW, btnH);
            ctx.font = "22px Arial";
            ctx.fillStyle = "black";
            if (shopTab === "skins") {
                ctx.fillText("НАДЕТ", btnX + 145, btnY + 33);
            } else {
                ctx.fillText("КУПЛЕНО", btnX + 130, btnY + 33);
            }
        } else {
            // Определяем текст кнопки
            let btnText = "КУПИТЬ";
            let btnTextX = btnX + 145;

            if (shopTab === "skins" && selected.isBought() === true) {
                btnText = "НАДЕТЬ";
                btnTextX = btnX + 145;
            }

            // Цвет кнопки — зависит от того, хватает ли денег (для купленных скинов всегда зелёный)
            if (shopTab === "skins" && selected.isBought() === true) {
                ctx.fillStyle = "green";
            } else if (clicks >= cost) {
                ctx.fillStyle = "green";
            } else {
                ctx.fillStyle = "white";
            }
            ctx.fillRect(btnX, btnY, btnW, btnH);
            ctx.font = "22px Arial";
            ctx.fillStyle = "white";
            if (shopTab === "skins" && selected.isBought() === false && clicks < cost) {
                ctx.fillStyle = "white";
            } else if (shopTab !== "skins" && clicks < cost) {
                ctx.fillStyle = "white";
            }
            ctx.fillText(btnText, btnTextX, btnY + 33);
        }
    }

    // ----- Кнопка Назад -----
    ctx.fillStyle = "white";
    ctx.fillRect(20, 520, 200, 60);
    ctx.font = "22px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("← НАЗАД", 60, 558);

    // ⚠️ ЧИТ-КНОПКА (удалить потом)
    ctx.fillStyle = "red";
    ctx.fillRect(340, 520, 200, 60);
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("+1000 (ЧИТ)", 375, 558);

    drawSettingsButton();
    drawSettingsWindow();
}
function drawSettingsButton() {
    let btnSize = 50;
    let btnX = canvas.width - btnSize - 10;
    let btnY = 10;

    // Фон
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(btnX, btnY, btnSize, btnSize);

    // Рамка
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnSize, btnSize);

    // Иконка шестерёнки (центрируем)
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.fillText("⚙", btnX + btnSize / 2, btnY + btnSize / 2 + 2);

    // Возвращаем выравнивание
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
}

function drawSettingsWindow() {
    if (settingsOpen === false) return;

    // Затемнение фона
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Параметры окна
    let winW = 400;
    let winH = 250;
    let winX = (canvas.width - winW) / 2;
    let winY = (canvas.height - winH) / 2;

    // Фон окна
    ctx.fillStyle = "white";
    ctx.fillRect(winX, winY, winW, winH);

    // Рамка
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeRect(winX, winY, winW, winH);

    // Заголовок
    ctx.font = "32px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("НАСТРОЙКИ", winX + winW / 2, winY + 50);

    // ----- Кнопка МУЗЫКА -----
    let soundBtnW = 300;
    let soundBtnH = 45;
    let soundBtnX = winX + (winW - soundBtnW) / 2;
    let soundBtnY = winY + 80;

    if (musicEnabled === true) {
        ctx.fillStyle = "green";
    } else {
        ctx.fillStyle = "white";
    }
    ctx.fillRect(soundBtnX, soundBtnY, soundBtnW, soundBtnH);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(soundBtnX, soundBtnY, soundBtnW, soundBtnH);

    ctx.font = "20px Arial";
    if (musicEnabled === true) {
        ctx.fillStyle = "white";
        ctx.fillText("МУЗЫКА: ВКЛ", soundBtnX + soundBtnW / 2, soundBtnY + 30);
    } else {
        ctx.fillStyle = "black";
        ctx.fillText("МУЗЫКА: ВЫКЛ", soundBtnX + soundBtnW / 2, soundBtnY + 30);
    }

    // ----- Кнопка ЗВУКИ -----
    let sfxBtnW = 300;
    let sfxBtnH = 45;
    let sfxBtnX = winX + (winW - sfxBtnW) / 2;
    let sfxBtnY = winY + 140;

    if (soundsEnabled === true) {
        ctx.fillStyle = "green";
    } else {
        ctx.fillStyle = "white";
    }
    ctx.fillRect(sfxBtnX, sfxBtnY, sfxBtnW, sfxBtnH);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(sfxBtnX, sfxBtnY, sfxBtnW, sfxBtnH);

    ctx.font = "20px Arial";
    if (soundsEnabled === true) {
        ctx.fillStyle = "white";
        ctx.fillText("ЗВУКИ: ВКЛ", sfxBtnX + sfxBtnW / 2, sfxBtnY + 30);
    } else {
        ctx.fillStyle = "black";
        ctx.fillText("ЗВУКИ: ВЫКЛ", sfxBtnX + sfxBtnW / 2, sfxBtnY + 30);
    }

    // ----- Кнопка "✕" в правом верхнем углу окна -----
    let closeBtnSize = 40;
    let closeBtnX = winX + winW - closeBtnSize - 10;
    let closeBtnY = winY + 10;

    ctx.fillStyle = "white";
    ctx.fillRect(closeBtnX, closeBtnY, closeBtnSize, closeBtnSize);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(closeBtnX, closeBtnY, closeBtnSize, closeBtnSize);

    ctx.font = "28px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✕", closeBtnX + closeBtnSize / 2, closeBtnY + closeBtnSize / 2 + 2);

    // Возвращаем выравнивание
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
}
canvas.addEventListener("mousedown", function(event) {
    let x = event.offsetX;
    let y = event.offsetY;

    // ===== Скример — блокируем все клики, пока он идёт =====
    if (screamerActive === true) {
        return;
    }

    // ===== Окно настроек — обрабатываем в первую очередь =====
    if (settingsOpen === true) {
        let winW = 400;
        let winH = 250;
        let winX = (canvas.width - winW) / 2;
        let winY = (canvas.height - winH) / 2;

        // Кнопка "✕" — закрыть
        let closeBtnSize = 40;
        let closeBtnX = winX + winW - closeBtnSize - 10;
        let closeBtnY = winY + 10;

        if (x >= closeBtnX && x <= closeBtnX + closeBtnSize &&
            y >= closeBtnY && y <= closeBtnY + closeBtnSize) {
            settingsOpen = false;

            // Перерисовываем текущий экран
            if (currentScreen === "game") {
                if (gameState === "intro") drawIntro(); else drawGame();
            } else if (currentScreen === "shop") {
                drawShop();
            }
            return;
        }

        // ----- Кнопка МУЗЫКА -----
        let soundBtnW = 300;
        let soundBtnH = 45;
        let soundBtnX = winX + (winW - soundBtnW) / 2;
        let soundBtnY = winY + 80;

        if (x >= soundBtnX && x <= soundBtnX + soundBtnW &&
            y >= soundBtnY && y <= soundBtnY + soundBtnH) {

            musicEnabled = !musicEnabled;

            if (musicEnabled === true) {
                backgroundMusic.play();
                musicStarted = true;
            } else {
                backgroundMusic.pause();
            }

            if (currentScreen === "game") {
                if (gameState === "intro") drawIntro(); else drawGame();
            } else if (currentScreen === "shop") {
                drawShop();
            }
            return;
        }

        // ----- Кнопка ЗВУКИ -----
        let sfxBtnW = 300;
        let sfxBtnH = 45;
        let sfxBtnX = winX + (winW - sfxBtnW) / 2;
        let sfxBtnY = winY + 140;

        if (x >= sfxBtnX && x <= sfxBtnX + sfxBtnW &&
            y >= sfxBtnY && y <= sfxBtnY + sfxBtnH) {

            soundsEnabled = !soundsEnabled;

            // Перерисовываем текущий экран, чтобы кнопка обновилась
            if (currentScreen === "game") {
                if (gameState === "intro") drawIntro(); else drawGame();
            } else if (currentScreen === "shop") {
                drawShop();
            }
            return;
        }

        // Клик вне кнопок — просто игнорируем (окно модальное)
        return;
    }

    // ===== Кнопка настроек (⚙) — открывает окно =====
    let sbSize = 50;
    let sbX = canvas.width - sbSize - 10;
    let sbY = 10;

    if (x >= sbX && x <= sbX + sbSize && y >= sbY && y <= sbY + sbSize) {
        settingsOpen = true;

        // Перерисовываем текущий экран
        if (currentScreen === "game") {
            if (gameState === "intro") drawIntro(); else drawGame();
        } else if (currentScreen === "shop") {
            drawShop();
        }
        return;
    }

    // ЕСЛИ МЫ В ИГРЕ
    if (currentScreen === "game") {

        // --- ИНТРО: клики идут только на коробку ---
        if (gameState === "intro") {
            if (introPhase === "box") {
                introClicks = introClicks + 1;
                playClickSound();

                // Коробка растёт — цель пружины увеличивается
                boxTargetScale = boxTargetScale + BOX_GROW_PER_CLICK;

                if (introClicks >= introClicksNeeded) {
                    introPhase = "greeting";
                    introTimer = 0;

                    if (musicStarted === false && musicEnabled === true) {
                        backgroundMusic.play();
                        musicStarted = true;
                    }
                }
                drawIntro();
            }
            return;
        }

        // Кнопка магазина
        if (x >= 20 && x <= 220 && y >= 520 && y <= 580) {
            currentScreen = "shop";
            drawShop();
            return;
        }

        // Клик по Верити
        if (
            x >= verityX &&
            x <= verityX + verityWidth &&
            y >= verityY &&
            y <= verityY + verityHeight
        ) {
            // ===== ПРОВЕРКА НА СКРИМЕР =====
            if (Math.random() < SCREAMER_CHANCE) {
                screamerActive = true;
                screamerTimer = 0;

                // Звук скримера
                let scrSound = new Audio("assets/screamer.mp3");
                scrSound.volume = 0.7;
                if (soundsEnabled === true) {
                    scrSound.play();
                }

                drawGame();
                return;   // выходим — очки не начисляем, звук клика не играет
            }

            // Считаем клики по Верити
            verityClickCount = verityClickCount + 1;

            // На 100-м клике показываем реплику
            if (verityClickCount === 100) {
                hundredMessageActive = true;
                hundredMessageTimer = 0;
            }

            // На 500-м клике показываем реплику
            if (verityClickCount === 500) {
                fiveHundredMessageActive = true;
                fiveHundredMessageTimer = 0;
            }

            // На 1000-м клике показываем реплику
            if (verityClickCount === 1000) {
                thousandMessageActive = true;
                thousandMessageTimer = 0;
            }

            let isJackpot = false;
            let earned = clickPower;

            if (jackpot === true && Math.random() < 0.05) {
                isJackpot = true;
                earned = clickPower * 3;
            }

            clicks = clicks + earned;

            plusOnes.push({
                x: x,
                y: y,
                opacity: 1,
                isJackpot: isJackpot,
                amount: earned
            });

            verityPressed = true;

            playClickSound();

            drawGame();
            return;
        }
    }

    // ЕСЛИ МЫ В МАГАЗИНЕ
    if (currentScreen === "shop") {

        // Кнопка "Назад"
        if (x >= 20 && x <= 220 && y >= 520 && y <= 580) {
            currentScreen = "game";
            selectedItemId = null;
            drawGame();
            return;
        }

        // ⚠️ ЧИТ-КНОПКА (удалить потом)
        if (x >= 340 && x <= 540 && y >= 520 && y <= 580) {
            clicks = clicks + 1000;
            drawShop();
            return;
        }

        // ----- Вкладки -----
        // Товары
        if (x >= 20 && x <= 170 && y >= 80 && y <= 120) {
            shopTab = "shop";
            selectedItemId = null;
            drawShop();
            return;
        }
        // Куплено
        if (x >= 180 && x <= 330 && y >= 80 && y <= 120) {
            shopTab = "bought";
            selectedItemId = null;
            drawShop();
            return;
        }
                // Скины
        if (x >= 470 && x <= 620 && y >= 80 && y <= 120) {
            shopTab = "skins";
            selectedItemId = null;
            drawShop();
            return;
        }

        // ----- Клики по списку товаров слева -----
        let listX = 20;
        let listY = 140;
        let listW = 180;
        let itemH = 50;
        let itemGap = 10;

        // Собираем видимые товары — точно так же, как в drawShop
        let visibleItems = [];
        for (let i = 0; i < shopItems.length; i++) {
            let item = shopItems[i];
            if (item.isVisible() === false) continue;

            if (shopTab === "shop") {
                if (item.tab !== "shop") continue;
                if (item.oneTime === true && item.isBought() === true) continue;
                visibleItems.push(item);
            } else if (shopTab === "skins") {
                if (item.tab !== "skins") continue;
                visibleItems.push(item);
            } else {
                if (item.tab === "skins") continue;
                if (item.oneTime === true && item.isBought() === true) {
                    visibleItems.push(item);
                } else if (item.oneTime === false && clickUpgradeTimes > 0 && item.id === "clickPower") {
                    visibleItems.push(item);
                }
            }
        }

        for (let i = 0; i < visibleItems.length; i++) {
            let item = visibleItems[i];
            let y1 = listY + i * (itemH + itemGap);
            let y2 = y1 + itemH;

            if (x >= listX && x <= listX + listW && y >= y1 && y <= y2) {
                selectedItemId = item.id;
                drawShop();
                return;
            }
        }

        // ----- Кнопка "Купить" справа -----
        let panelX = 260;
        let panelY = 140;
        let panelW = 400;
        let btnX = panelX + 20;
        let btnY = panelY + 270;
        let btnW = panelW - 40;
        let btnH = 50;

        if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {

            // Находим выбранный товар
            let selected = null;
            for (let i = 0; i < shopItems.length; i++) {
                if (shopItems[i].id === selectedItemId) {
                    selected = shopItems[i];
                    break;
                }
            }

            if (selected === null) return;

            // Если мы во вкладке "Куплено" — тут ничего не покупаем
            if (shopTab === "bought") return;

            // --- Логика для скинов ---
            if (shopTab === "skins") {
                // Если скин уже надет — ничего не делаем
                if ((selected.id === "skinDefault" && currentSkin === "default") ||
                    (selected.id === "skinCowboy" && currentSkin === "cowboy") ||
                    (selected.id === "skinJirity" && currentSkin === "jirity")) {
                    return;
                }

                // Если скин куплен, но не надет — просто надеваем (бесплатно)
                if (selected.isBought() === true) {
                    selected.onBuy();
                    drawShop();
                    return;
                }

                // Скин не куплен — проверяем, хватает ли денег
                if (clicks < selected.getCost()) return;

                // Покупаем и надеваем
                selected.onBuy();
                drawShop();
                return;
            }

            // --- Логика для обычных товаров ---
            // Если одноразовый уже куплен — не покупаем
            if (selected.oneTime === true && selected.isBought() === true) return;

            // Если не хватает денег — не покупаем
            if (clicks < selected.getCost()) return;

            // Покупаем!
            selected.onBuy();
            drawShop();
            return;
        }
    }
});
canvas.addEventListener("mouseup", function() {
    verityPressed = false;
});

window.addEventListener("mouseup", function() {
    verityPressed = false;
});

verity.onload = function() {
    drawGame();
};
updatePlusOnes();

let autoTickCounter = 0;

setInterval(function() {
    if (autoClick) {
        autoTickCounter = autoTickCounter + 1;

        // Если 2.0 НЕ куплен — работаем только каждый второй тик (раз в 2 секунды)
        // Если 2.0 куплен — работаем каждый тик (раз в 1 секунду)
        if (autoClick2 === false && autoTickCounter % 2 !== 0) {
            return;
        }

        clicks = clicks + clickPower;

        plusOnes.push({
            x: verityX + verityWidth / 2,
            y: verityY,
            opacity: 1,
            isJackpot: false,
            amount: clickPower
        });

        if (currentScreen === "game") {
            drawGame();
        } else if (currentScreen === "shop") {
            drawShop();
        }
    }
}, 1000);