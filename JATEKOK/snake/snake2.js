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

// Kaja kép objektum és a kiválasztott kígyó fajtája
var foodImage = new Image();
// Kígyó fejének kép objektuma
var snakeHeadImage = new Image();
// Kígyó farkának kép objektuma
var snakeTailImage = new Image();



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

        updateSnakeHeadImage(); // Billentyűzetes irányváltáskor frissül a kígyó feje
    
    } 
}

// Játék indítása
function startGame() {
    resetGameData();
    loadRandomFoodImage(); // Betöltünk egy véletlenszerű kaja képet a kiválasztott fajhoz
    updateSnakeHeadImage(); // Betöltjük a kezdő fej képet
    gameState = "PLAYING";
}
// Beolvassa a kiválasztott kígyóhoz tartozó 3 kaja egyikét randomizálva
function loadRandomFoodImage() {
    var selectElement = document.getElementById("kigyo-select");
    var kigyoMappa = selectElement.value; // Megkapjuk pl: "erdeisiklo"
    
    // Generálunk egy random számot 1 és 3 között (1, 2 vagy 3)
    var randomKajaSzam = Math.floor(Math.random() * 3) + 1;
    
    // Beállítjuk a kép elérését a kért struktúra szerint (pl: images/erdeisiklo/kaja/1.png)
    foodImage.src = "images/" + kigyoMappa + "/kaja/" + randomKajaSzam + ".png";
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
    context.fillStyle = "rgb(231, 241, 172)"; //60,93,56 vagy #51923a
    context.fillRect(0, 0, board.width, board.height);

    // Kaja
    //context.fillStyle = "red"; 
    //context.fillRect(foodX, foodY, blockSize, blockSize);
    context.drawImage(foodImage, foodX, foodY, blockSize, blockSize);

    // Kaja megevése
    if (snakeX == foodX && snakeY == foodY) { 
        snakeBody.push([foodX, foodY]); 
        placeFood();
        loadRandomFoodImage(); // Ha megette, a következő kaja megint egy random választott kép lesz a 3 közül
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

    // Fej mozgatása (Léptetjük a fejet az új pozícióra)
    snakeX += velocityX * blockSize; 
    snakeY += velocityY * blockSize;

    // --- KÍGYÓ GRAFIKÁK FRISSÍTÉSE ---
    // Közvetlenül a rajzolás előtt kiszámoljuk, hogy merről jött a fej és a farok
    updateSnakeHeadImage(); 
    updateSnakeTailImage(); 

    // --- KÍGYÓ KIRAJZOLÁSA ---
    // 1. Kígyó fejének megrajzolása
    context.drawImage(snakeHeadImage, snakeX, snakeY, blockSize, blockSize); 

    // 2. Kígyó testének és farkának megrajzolása (ha már van legalább 1 pontunk)
    if (snakeBody.length > 0) {
        // A törzset (sima lime kockák) csak a legutolsó elem ELŐTTIG rajzoljuk (i < snakeBody.length - 1)
        // Így az utolsó elemet üresen hagyja a zöld színezés, mert oda jön a farok képe!
        context.fillStyle = "lime"; 
        for (let i = 0; i < snakeBody.length - 1; i++) { 
            context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize); 
        }

        // A legutolsó testrész helyére pontosan kirajzoljuk a farok képét
        var utolsoIndex = snakeBody.length - 1;
        context.drawImage(snakeTailImage, snakeBody[utolsoIndex][0], snakeBody[utolsoIndex][1], blockSize, blockSize);
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

// KÍGYÓ FEJ FRISSÍTÉS
// Beolvassa az irányának megfelelő fej képet a kiválasztott kígyó mappájából
function updateSnakeHeadImage() {
    var selectElement = document.getElementById("kigyo-select");
    var kigyoMappa = selectElement.value; // Kikérjük a kiválasztott kígyó mappanevét (pl. "erdeisiklo")
    
    var irany = "fej-jobbra"; // Alapértelmezett kezdőkép, ha valamiért nem futna le a feltétel
    
    // Megnézzük, mi volt az ELŐZŐ kép a vásznon, mert ez mutatja meg, merre mozgott a kígyó a fordulás előtt.
    // Ha a játék most indult el, akkor az 'aktualisKep' egy üres szöveg lesz.
    var aktualisKep = snakeHeadImage.src || "";

    // 1. ESET: HA FELFELÉ HALAD A KÍGYÓ (velocityY === -1)
    if (velocityY === -1) {
        // Ha a kígyó eddig BALRÓL mozgott JOBBRA, akkor a képernyőn a 'fej-jobbra' kép volt kint.
        // Mivel menet közben felfelé indult, a test balról érkezik a fordulóhoz -> 'fej-fel-balrol'
        if (aktualisKep.includes("fej-jobbra") || aktualisKep.includes("fej-fel-balrol") || aktualisKep.includes("fej-le-balrol")) {
            irany = "fej-fel-balrol";
        } 
        // Ha a kígyó eddig JOBBRÓL mozgott BALRA, akkor a képernyőn a 'fej-balra' kép volt kint.
        // Mivel menet közben felfelé indult, a test jobbról érkezik a fordulóhoz -> 'fej-fel-jobbrol'
        else {
            irany = "fej-fel-jobbrol";
        }
    }
    // 2. ESET: HA LEFELÉ HALAD A KÍGYÓ (velocityY === 1)
    else if (velocityY === 1) {
        // Ha a kígyó eddig BALRÓL mozgott JOBBRA ('fej-jobbra' kép volt kint), és lefelé indultunk vele:
        // A test balról érkezik a fordulóhoz -> 'fej-le-balrol'
        if (aktualisKep.includes("fej-jobbra") || aktualisKep.includes("fej-fel-balrol") || aktualisKep.includes("fej-le-balrol")) {
            irany = "fej-le-balrol";
        } 
        // Ha a kígyó eddig JOBBRÓL mozgott BALRA ('fej-balra' kép volt kint), és lefelé indultunk vele:
        // A test jobbról érkezik a fordulóhoz -> 'fej-le-jobbrol'
        else {
            irany = "fej-le-jobbrol";
        }
    }
    // 3. ESET: HA VÍZSZINTESEN BALRA HALAD A KÍGYÓ (velocityX === -1)
    else if (velocityX === -1) {
        irany = "fej-balra"; // Sima vízszintes balra haladás képe
    }
    // 4. ESET: HA VÍZSZINTESEN JOBBRA HALAD A KÍGYÓ (velocityX === 1)
    else if (velocityX === 1) {
        irany = "fej-jobbra"; // Sima vízszintes jobbra haladás képe (a kövi testrész a fejtől balra van)
    }
    
    // Végül a kiszámolt pontos irány alapján összeállítjuk a dinamikus elérési utat,
    // és betöltjük a megfelelő képet (pl: images/erdeisiklo/atest/fej-fel-balrol.png)
    snakeHeadImage.src = "images/" + kigyoMappa + "/atest/" + irany + ".png";
}

// KÍGYÓ VÉGE
// Kiszámolja a farok irányát és kanyarodását az utolsó testrészek alapján
function updateSnakeTailImage() {
    var selectElement = document.getElementById("kigyo-select");
    var kigyoMappa = selectElement.value; // Pl: "erdeisiklo"
    
    // Ha nincs még testünk (0 pont), akkor nem kell farkat rajzolni, kilépünk
    if (snakeBody.length === 0) return;

    var irany = "farok-jobbra"; // Alapértelmezett, ha valamiért nem futna le a feltétel
    
    // Megkeressük a legutolsó elemet (ez lesz a farok helye)
    var utolsoIndex = snakeBody.length - 1;
    var farokX = snakeBody[utolsoIndex][0];
    var farokY = snakeBody[utolsoIndex][1];
    
    // Megkeressük az előtte lévő elemet (ami felé a farok "mutat" vagy halad).
    // Ha csak 1 testrészünk van (2 blokkos a kígyó), akkor az előtte lévő elem maga a fej!
    var elotteX = (snakeBody.length === 1) ? snakeX : snakeBody[utolsoIndex - 1][0];
    var elotteY = (snakeBody.length === 1) ? snakeY : snakeBody[utolsoIndex - 1][1];

    // Kiszámoljuk a mozgásvektort (merre mozdul el a farok az előtte lévőhöz képest)
    var vX = (elotteX - farokX) / blockSize;
    var vY = (elotteY - farokY) / blockSize;

    // Megnézzük, mi volt a farok ELŐZŐ képe a vásznon, hogy a függőleges tartást biztosítsuk
    var aktualisFarokKep = snakeTailImage.src || "";

    // 1. ESET: HA A FAROK FELFELÉ MOZDUL EL (vY === -1)
    if (vY === -1) {
        // Ha eddig BALRÓL mozgott JOBBRA a farok (a képernyőn a 'farok-jobbra' kép volt kint), és felfelé fordult:
        if (aktualisFarokKep.includes("farok-jobbra") || aktualisFarokKep.includes("farok-fel-balrol") || aktualisFarokKep.includes("farok-le-balrol")) {
            irany = "farok-fel-balrol";
        } else {
            irany = "farok-fel-jobbrol";
        }
    }
    // 2. ESET: HA A FAROK LEFELÉ MOZDUL EL (vY === 1)
    else if (vY === 1) {
        // Ha eddig BALRÓL mozgott JOBBRA, és lefelé fordult:
        if (aktualisFarokKep.includes("farok-jobbra") || aktualisFarokKep.includes("farok-fel-balrol") || aktualisFarokKep.includes("farok-le-balrol")) {
            irany = "farok-le-balrol";
        } else {
            irany = "farok-le-jobbrol";
        }
    }
    // 3. ESET: HA A FAROK VÍZSZINTESEN BALRA MOZDUL EL (vX === -1)
    else if (vX === -1) {
        irany = "farok-balra";
    }
    // 4. ESET: HA A FAROK VÍZSZINTESEN JOBBRA MOZDUL EL (vX === 1)
    else if (vX === 1) {
        irany = "farok-jobbra";
    }

    // Betöltjük a pontos képet a megfelelő mappából (pl: images/erdeisiklo/atest/farok-fel-balrol.png)
    snakeTailImage.src = "images/" + kigyoMappa + "/atest/" + irany + ".png";
}



// ÚJ FÜGGVÉNY: Kiszámolja és azonnal kirajzolja az adott testrész textúráját a környezete alapján
function drawSnakeBodySegment(i) {
    var selectElement = document.getElementById("kigyo-select");
    var kigyoMappa = selectElement.value;

    var curr = snakeBody[i];     // Az aktuális testrész, amit épp rajzolunk
    
    // Megkeressük az előtte lévő elemet. Ha az első testrészről van szó (i=0), akkor az előtte lévő a FEJ!
    var prev = (i === 0) ? {x: snakeX, y: snakeY} : {x: snakeBody[i - 1][0], y: snakeBody[i - 1][1]};
    
    // A mögötte lévő elem mindig a tömb következő eleme (i+1)
    var next = {x: snakeBody[i + 1][0], y: snakeBody[i + 1][1]};

    // Kiszámoljuk a szomszédok relatív irányát az aktuális ponthoz képest (-1, 0, vagy 1)
    var pX = (prev.x - curr[0]) / blockSize;
    var pY = (prev.y - curr[1]) / blockSize;
    var nX = (next.x - curr[0]) / blockSize;
    var nY = (next.y - curr[1]) / blockSize;

    var irany = "test-jobbra"; // Alapértelmezett, ha valami elcsúszna

    // --- KANYARODÁSI LOGIKA (Ha az egyik szomszéd vízszintesen, a másik függőlegesen van) ---
    // 1. Kanyar: Fent és Balra van szomszéd
    if ((pY === -1 && nX === -1) || (nX === -1 && pY === -1)) {
        irany = "test-fel-balrol";
    }
    // 2. Kanyar: Fent és Jobbra van szomszéd
    else if ((pY === -1 && nX === 1) || (nX === 1 && pY === -1)) {
        irany = "test-fel-jobbrol";
    }
    // 3. Kanyar: Lent és Balra van szomszéd
    else if ((pY === 1 && nX === -1) || (nX === -1 && pY === 1)) {
        irany = "test-le-balrol";
    }
    // 4. Kanyar: Lent és Jobbra van szomszéd
    else if ((pY === 1 && nX === 1) || (nX === 1 && pY === 1)) {
        irany = "test-le-jobbrol";
    }
    // --- EGYENES LOGIKA (Ha mindkét szomszéd vízszintes, vagy ha függőlegesen halad) ---
    else if (pY === 0 && nY === 0) {
        irany = "test-balra"; // Vízszintes egyenes szakasz
    } 
    else {
        // Függőleges egyenes szakasz: Mivel nincs külön függőleges kép, megtartjuk a legutóbbi kanyar irányát
        // Megnézzük a mögötte lévő (közelebb a farokhoz) elem vízszintes helyzetét a forduló ponthoz képest
        if (next.x < curr[0]) {
            irany = "test-fel-balrol"; 
        } else {
            irany = "test-fel-jobbrol";
        }
    }

    // Létrehozunk egy ideiglenes képobjektumot az azonnali kirajzoláshoz
    var tempBodyImage = new Image();
    tempBodyImage.src = "images/" + kigyoMappa + "/atest/" + irany + ".png";
    
    // Kirajzoljuk az aktuális rácspontra
    context.drawImage(tempBodyImage, curr[0], curr[1], blockSize, blockSize);
}
