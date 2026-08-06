// Pálya alapbeállításai
var blockSize = 35; //1 négyzet mérete
var rows = 15; //10*10-ös pálya
var cols = 15;
var board;
var context; 
var points = 0;

// Kígyó adatai
var snakeX, snakeY; //fej
var velocityX, velocityY; //melyik irányba halad
var snakeBody = []; 
var foodX, foodY;

// Játékállapotok kezelése: "START" (kezdőképernyő), "PLAYING" (játék), "GAMEOVER" (vége)
var gameState = "START"; 

// Telefonon: swipe
// Érintéses irányítás változói
var touchStartX = 0;
var touchStartY = 0;


window.onload = function() {
    board = document.getElementById("board"); 
    context = board.getContext("2d"); 
    
    board.height = rows * blockSize;
    board.width = cols * blockSize;

    // Eseménykezelők regisztrálása
    document.addEventListener("keydown", handleKeyDown); //keydown gyorsabb mint a keyup a nyílbillentyűk kezelésére
    board.addEventListener("click", handleCanvasClick); // Kattintás figyelése a gombokhoz
    
    // Érintőképernyős események regisztrálása (mobil irányítás)
    board.addEventListener("touchstart", handleTouchStart, { passive: false });
    board.addEventListener("touchmove", handleTouchMove, { passive: false });
    board.addEventListener("touchend", handleTouchEnd, { passive: false });

    board.addEventListener("touchstart", function(e) {
        // Ha a menüben vagyunk, a touchstart-ot is átküldjük a gombvizsgálónak
        if (gameState === "START" || gameState === "GAMEOVER") {
            handleCanvasClick(e.changedTouches[0]);
        }
    });

    // Inicializáljuk az alaphelyzetet, de még nem indítjuk el a mozgást
    resetGameData();
    
    // A játékhurok folyamatosan fut   //(másodpercenként 10-szer frissít)
    setInterval(gameLoop, 2000 / 10); //1000/10
}

// Új játékhurok, ami az aktuális állapot (gameState) szerint rajzol
function gameLoop() {
    if (gameState === "START") {
        drawStartScreen();
    } else if (gameState === "PLAYING") {
        updateGame();
    } else if (gameState === "GAMEOVER") {
        drawGameOverScreen();
    }
}

// Játékadatok alaphelyzetbe állítása
function resetGameData() {
    points = 0;
    document.getElementById("points").innerText = points;
    snakeX = blockSize * 5;
    snakeY = blockSize * 5;
    velocityX = 0; 
    velocityY = 0;
    snakeBody = [];
    placeFood();
}

// --- 1. BILLENTYŰZET KEZELÉSE ÉS GÖRDÜLÉS LETILTÁSA ---
function handleKeyDown(e) {
    // Ha játékban vagyunk, letiltjuk a nyilak és a Space alapértelmezett gördítési funkcióját
    if (gameState === "PLAYING") {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
            e.preventDefault(); 
        }
    }

    // Irányváltás logika (csak játék közben)
    if (gameState === "PLAYING") {
        if (e.code == "ArrowUp" && velocityY != 1) { //hogy ne tudjon magába visszafordulni
            velocityX = 0; velocityY = -1;
        }
        else if (e.code == "ArrowDown" && velocityY != -1) { 
            velocityX = 0; velocityY = 1;
        }
        else if (e.code == "ArrowLeft" && velocityX != 1) { 
            velocityX = -1; velocityY = 0;
        }
        else if (e.code == "ArrowRight" && velocityX != -1) { 
            velocityX = 1; velocityY = 0; 
        }
    } 
}

// Játék indítása
function startGame() {
    resetGameData();
    gameState = "PLAYING";
}

// --- 2. CANVAS KATTINTÁSOK KEZELÉSE (EGÉR) ---
function handleCanvasClick(e) {
    // Megszerezzük a kattintás pontos koordinátáit a Canvas-on belül
    const rect = board.getBoundingClientRect();

    // Kiszámoljuk az arányt a belső felbontás és a CSS méret között a pontos kattintáshoz
    const scaleX = board.width / rect.width;
    const scaleY = board.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Ha a START vagy GAMEOVER képernyőn a gombra kattintanak (a gomb középen van)
    const buttonWidth = 140;
    const buttonHeight = 45;
    const buttonX = board.width / 2 - buttonWidth / 2;
    const buttonY = board.height / 2 + 30;

    if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth && mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
        if (gameState === "START" || gameState === "GAMEOVER") {
            startGame();
        }
    }
}

// --- 3. KÉPERNYŐK RAJZOLÁSA A CANVAS-RA ---

// START KÉPERNYŐ
function drawStartScreen() {
    context.fillStyle = "#51923a";
    context.fillRect(0, 0, board.width, board.height);

    // Cím (A modal stílusú zölddel)
    context.fillStyle = "#eefbb2";
    context.font = "bold 32px Times serif";
    context.textAlign = "center";
    context.fillText("Kígyós játék", board.width / 2, board.height / 2 - 40);
    //context.fillText("Kígyós játék", board.width / 2, board.height / 2 - 45);


    // --- ASCII ART RAJZOLÁSA ---
    // Elmentjük a sorokat egy tömbbe
    var asciiArt = [ //https://asciiart.website/art/737
        "                           ____",
        "  ________________________/ O  \\___/",
        " <_/_\\_/_\\_/_\\_/_\\_/_\\_/_______/   \\"
    ];

    context.fillStyle = "#ffffff";
    context.font = "12px 'Courier New', Courier, monospace"; // Fix szélességű betűtípus, hogy ne csússzanak el a karakterek
    context.textAlign = "left"; // FONTOS: Balra igazítjuk, különben szétesik a minta!

    // Kiszámoljuk a kezdő X és Y koordinátát, hogy az egész ábra középen legyen
    // Egy karakter szélessége 12px-es betűméretnél kb. 7.2px. A leghosszabb sor 48 karakteres.
    var artWidth = 48 * 7.2; 
    var startX = (board.width - artWidth) / 2 +40;
    var startY = board.height / 2 - 20; // Az ábra tetejének pozíciója

    // Végigmegyünk a sorokon és egymás alá rajzoljuk őket
    for (var i = 0; i < asciiArt.length; i++) {
        context.fillText(asciiArt[i], startX, startY + (i * 15)); // 15px a sortávolság
    }


    // Indító gomb rajzolása (visszaállítjuk a center igazítást a gomb előtt)
    context.textAlign = "center";
    drawCanvasButton("START", board.width / 2, board.height / 2 + 30);
    //drawCanvasButton("START", board.width / 2, board.height / 2 + 30);
}

// JÁTÉK VÉGE KÉPERNYŐ
function drawGameOverScreen() {
    // Sötétített áttetsző réteget vonunk a meglévő játékfázisra (mint a modal-hatter)
    context.fillStyle = "#51923a"; //"rgb(60,93,56)";
    context.fillRect(0, 0, board.width, board.height);

    // Sikerült! / Játék Vége felirat
    context.fillStyle = "#eefbb2";
    context.font = "bold 32px Times serif";
    context.textAlign = "center";
    context.fillText("Játék vége", board.width / 2, board.height / 2 - 40);

    // Pontszám kijelzése
    context.fillStyle = "#ffffff";
    context.font = "bold 20px Times serif";
    context.fillText("Elért pontszám: " + points, board.width / 2, board.height / 2 - 5);

    // Új játék gomb rajzolása
    drawCanvasButton("ÚJ JÁTÉK", board.width / 2, board.height / 2 + 30);
}

// Segédfüggvény a gomb megrajzolásához a Canvas-ra
function drawCanvasButton(text, centerX, centerY) {
    const w = 140;
    const h = 45;
    const x = centerX - w / 2;
    const y = centerY;

    // Lekerekített gomb háttér
    context.beginPath();
    context.fillStyle = "#247606";
    context.roundRect(x, y, w, h, 8); // 8px lekerekítés (pont mint a .modal-tartalom a CSS-ben)
    context.fill()
    
    // Lekerekített gomb keret
    context.beginPath();
    context.strokeStyle = "#eefbb2";
    context.lineWidth = 2;
    context.roundRect(x, y, w, h, 8);
    context.stroke();

    // Gomb szöveg
    context.fillStyle = "#white";
    context.font = "bold 16px Times serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#ffffff";
    context.fillText(text, centerX, y + h / 2);
    context.textBaseline = "alphabetic"; // Alapértelmezett visszaállítása
}

// --- 4. A JÁTÉKMENET LOGIKÁJA (A frissítésekért felel) ---
function updateGame() { 
    // Háttér
    context.fillStyle = "rgb(60,93,56)"; //vagy #51923a
    context.fillRect(0, 0, board.width, board.height);

    // Kaja
    context.fillStyle = "red"; 
    context.fillRect(foodX, foodY, blockSize, blockSize);

    // Kaja megevése
    if (snakeX == foodX && snakeY == foodY) { 
        snakeBody.push([foodX, foodY]); 
        placeFood();
        points += 1; 
        document.getElementById("points").innerText = points; 
    }

    // Test mozgatása
    for (let i = snakeBody.length - 1; i > 0; i--) { 
        snakeBody[i] = snakeBody[i - 1]; 
    }
    if (snakeBody.length) { 
        snakeBody[0] = [snakeX, snakeY]; 
    }

    // Fej mozgatása
    snakeX += velocityX * blockSize; 
    snakeY += velocityY * blockSize;

    // Kígyó kirajzolása
    context.fillStyle = "lime"; 
    context.fillRect(snakeX, snakeY, blockSize, blockSize); 
    for (let i = 0; i < snakeBody.length; i++) { 
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize); 
    }

    // FALNAK ÜTKÖZÉS ELLENŐRZÉSE
    if (snakeX < 0 || snakeX >= cols * blockSize || snakeY < 0 || snakeY >= rows * blockSize) {
        gameState = "GAMEOVER";
    }

    // ÖNMAGÁBA ÜTKÖZÉS ELLENŐRZÉSE
    for (let i = 0; i < snakeBody.length; i++) { 
        if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) { 
            gameState = "GAMEOVER";
        }
    }
}

function placeFood() { 
    let validPosition = false;
    while (!validPosition) {
        foodX = Math.floor(Math.random() * cols) * blockSize;
        foodY = Math.floor(Math.random() * rows) * blockSize;
        
        validPosition = true;
        if (foodX == snakeX && foodY == snakeY) {
            validPosition = false;
        }
        for (let i = 0; i < snakeBody.length; i++) {
            if (foodX == snakeBody[i][0] && foodY == snakeBody[i][1]) {
                validPosition = false;
            }
        }
    }
}


// MOBILON IRÁNYÍTÁS
// 1. Amikor az ujj hozzáér a kijelzőhöz
function handleTouchStart(e) {
    // Csak játék közben tiltjuk le az alapértelmezett görgetést, a menüben engedjük
    if (gameState === "PLAYING") {
        e.preventDefault(); 
    }
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}

// 2. Amikor az ujj mozog a kijelzőn (megakadályozza az oldal ugrálását játék közben)
function handleTouchMove(e) {
    if (gameState === "PLAYING") {
        e.preventDefault();
    }
}

// 3. Amikor az ujj felemelkedik a kijelzőről (itt számoljuk ki az irányt)
function handleTouchEnd(e) {
    if (gameState !== "PLAYING") return;

    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;

    // Kiszámoljuk a vízszintes és függőleges elmozdulás távolságát
    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;

    // Minimum 30 pixel elmozdulás kell, hogy ne érzékelje véletlen kattintásnak
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 30) {
            // Vízszintes elhúzás
            if (diffX > 0 && velocityX != -1) { // Jobbra
                velocityX = 1; velocityY = 0;
            } else if (diffX < 0 && velocityX != 1) { // Balra
                velocityX = -1; velocityY = 0;
            }
        }
    } else {
        if (Math.abs(diffY) > 30) {
            // Függőleges elhúzás
            if (diffY > 0 && velocityY != -1) { // Le
                velocityX = 0; velocityY = 1;
            } else if (diffY < 0 && velocityY != 1) { // Fel
                velocityX = 0; velocityY = -1;
            }
        }
    }
}
