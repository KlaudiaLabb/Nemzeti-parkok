// 1. JÁTÉKTÉR ÉS ALAPBEÁLLÍTÁSOK
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const pointsSpan = document.getElementById("points");

const blockSize = 35;
const rows = 15;
const cols = 15;

canvas.height = rows * blockSize; 
canvas.width = cols * blockSize; 

// Játékállapotok: "START", "PLAYING", "GAMEOVER"
let gameState = "START"; 
let score = 0;
let spawnTimer = 0;
const spawnInterval = 40; // Új pixel hullási gyakorisága (kisebb = sűrűbb)
const fallSpeed = 3;      // Hullási sebesség pixelben

// Kosár adatai (2 blokk széles a legalsó sorban)
let basket = {
    x: Math.floor(cols / 2) * blockSize - blockSize, 
    y: (rows - 2) * blockSize, // 1 helyett 2-vel toljuk fel, mert kétszer olyan magas lett a kosár!
    width: blockSize * 2,      // 2 blokk széles (40px)
    height: blockSize * 2,     // MÓDOSÍTVA: 2 blokk magas lett (40px), így a darabkák tökéletes négyzetek!
    // Új változó a sima és gyors kosármozgáshoz
    speed: 6 
};

let fallingObjects = [];

// A canvas-on lévő gomb pontos koordinátái az egérkattintáshoz
const btnX = canvas.width / 2 - 80;
const btnY = canvas.height / 2 + 20;
const btnWidth = 160;
const btnHeight = 40;


// --- KÉPEK ELŐTÖLTÉSE ---
const ehetoKepek = [];
const mergezoKepek = [];
const kepekSzama = 18; // 18-18 kép van a mappákban

// Ehető gombák betöltése (images/eheto/1.png-től 18.png-ig)
for (let i = 1; i <= kepekSzama; i++) {
    let img = new Image();
    img.src = `images/eheto/${i}.png`; // Ellenőrizd, hogy a kiterjesztés .png vagy .jpg!
    ehetoKepek.push(img);
}

// Mérges gombák betöltése (images/mergezo/1.png-től 18.png-ig)
for (let i = 1; i <= kepekSzama; i++) {
    let img = new Image();
    img.src = `images/mergezo/${i}.png`;
    mergezoKepek.push(img);
}

// --- KOSÁR KÉPEINEK BETÖLTÉSE ---
const basketImg1 = new Image(); 
basketImg1.src = "images/k1.png"; // Bal felső
const basketImg2 = new Image(); 
basketImg2.src = "images/k2.png"; // Jobb felső
const basketImg3 = new Image(); 
basketImg3.src = "images/k3.png"; // Bal alsó
const basketImg4 = new Image(); 
basketImg4.src = "images/k4.png"; // Jobb alsó


// Billentyűzet-állapot figyelő a folyamatos csúszáshoz ---
let keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.code] = true; // Elmentjük, hogy a gomb le van nyomva
    
    // Space vagy Enter indítás (mint a Snake-nél)
    if (gameState !== "PLAYING" && (e.code === "Space" || e.code === "Enter")) {
        startTheGame();
    }
});
window.addEventListener("keyup", (e) => {
    keys[e.code] = false; // Elmentjük, hogy a gombot felengedték
});


// Új hulló tárgy generálása
function spawnObject() {
    const randomCol = Math.floor(Math.random() * cols);
    const objectType = Math.random() < 0.5 ? "GOOD" : "BAD"; 
    
    // --- MÓDOSÍTÁS: Véletlenszerű kép kiválasztása ---
    let randomIndex = Math.floor(Math.random() * kepekSzama);
    let kivalasztottKep = objectType === "GOOD" ? ehetoKepek[randomIndex] : mergezoKepek[randomIndex];
    
    fallingObjects.push({
        x: randomCol * blockSize,
        y: -blockSize,
        type: objectType,
        img: kivalasztottKep // Eltároljuk a kiválasztott Image objektumot
    });
}


// Játék indítása / újraindítása
function startTheGame() {
     score = 0;
    pointsSpan.textContent = score;
    fallingObjects = [];
    basket.x = Math.floor(cols / 2) * blockSize - blockSize;
    // --- MÓDOSÍTÁS: Az újraindításnál is beállítjuk a helyes magassági pozíciót ---
    basket.y = (rows - 2) * blockSize; 
    gameState = "PLAYING";
}


// 1. IRÁNYÍTÁS: Egérkattintás a Canvas-on lévő gombra
canvas.addEventListener("click", (e) => {
    if (gameState !== "PLAYING") {
        // Megnézzük, pontosan hova kattintott a felhasználó a canvas-on belül
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Ellenőrizzük, hogy a kirajzolt gomb területére kattintott-e
        if (mouseX >= btnX && mouseX <= btnX + btnWidth &&
            mouseY >= btnY && mouseY <= btnY + btnHeight) {
            startTheGame();
        }
    }
});



// 2. TELEFONOS ÉRINTŐKÉPERNYŐS IRÁNYÍTÁS (KÉPERNYŐ-FELEZÉS) ---

// Eseményfigyelő az érintés kezdetére (amikor az ujj hozzáér a canvas-hoz)
canvas.addEventListener("touchstart", (e) => {
    // Megakadályozzuk, hogy a telefon görgessen az oldalon, miközben játszunk
    e.preventDefault();

    // Lekérjük az érintés pontos helyét a canvas-hoz képest (az első ujj alapján)
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;

    // --- HA NEM JÁTÉKBAN VAGYUNK: Ellenőrizzük, hogy a gombra nyomott-e rá ---
    if (gameState !== "PLAYING") {
        // Átszámoljuk a gomb koordinátáit a képernyőn látható (skálázott) mérethez
        const skalaX = rect.width / canvas.width;
        const skalaY = rect.height / canvas.height;
        
        const gombLathatoX = btnX * skalaX;
        const gombLathatoY = btnY * skalaY;
        const gombLathatoWidth = btnWidth * skalaX;
        const gombLathatoHeight = btnHeight * skalaY;

        // Ha pontosan a kirajzolt gomb területén belül van az érintés, csak akkor indul!
        if (touchX >= gombLathatoX && touchX <= gombLathatoX + gombLathatoWidth &&
            touchY >= gombLathatoY && touchY <= gombLathatoY + gombLathatoHeight) {
            startTheGame();
        }
        return; // Ha nem a gombra nyomott, nem csinálunk semmit
    }

    // --- HA JÁTÉKBAN VAGYUNK: Irányítás logikája (Felezővonal) ---
    const felezoVonal = rect.width / 2;

    if (touchX < felezoVonal) {
        // Bal oldalt nyomta meg -> szimuláljuk a balra nyilat
        keys["ArrowLeft"] = true;
        keys["ArrowRight"] = false;
    } else {
        // Jobb oldalt nyomta meg -> szimuláljuk a jobbra nyilat
        keys["ArrowRight"] = true;
        keys["ArrowLeft"] = false;
    }
}, { passive: false });

// Eseményfigyelő az érintés végére (amikor a felhasználó felemeli az ujját)
canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    // Megállítjuk a kosár mozgását
    keys["ArrowLeft"] = false;
    keys["ArrowRight"] = false;
});

// Biztonsági eseményfigyelő, ha az ujj kicsúszna a játéktérből
canvas.addEventListener("touchcancel", (e) => {
    keys["ArrowLeft"] = false;
    keys["ArrowRight"] = false;
});




// Logika frissítése
function update() {
    if (gameState !== "PLAYING") return;

    // --- MÓDOSÍTÁS: Folyamatos kosármozgás feldolgozása (Sokkal precízebb irányítás) ---
    if ((keys["ArrowLeft"] || keys["KeyA"]) && basket.x > 0) {
        basket.x -= basket.speed;
    }
    if ((keys["ArrowRight"] || keys["KeyD"]) && basket.x < canvas.width - basket.width) {
        basket.x += basket.speed;
    }

    spawnTimer++;
    if (spawnTimer >= spawnInterval) {
        spawnObject();
        spawnTimer = 0;
    }

    for (let i = fallingObjects.length - 1; i >= 0; i--) {
        let obj = fallingObjects[i];
        obj.y += fallSpeed;

        // --- MÓDOSÍTÁS: Tökéletesített, hajszálpontos ütközésvizsgálat mindkét oldalon ---
        // A gomba jobb széle (obj.x + blockSize) és bal széle (obj.x) is ellenőrizve van a kosárhoz képest
        if (obj.y + blockSize >= basket.y && 
            obj.y <= basket.y + basket.height &&
            obj.x + blockSize >= basket.x && 
            obj.x <= basket.x + basket.width) {
            
            if (obj.type === "GOOD") {
                score++;
                pointsSpan.textContent = score;
            } else {
                gameState = "GAMEOVER";
            }
            fallingObjects.splice(i, 1);
            continue;
        }

        // Ha leesett a képernyőről
        if (obj.y > canvas.height) {
            fallingObjects.splice(i, 1);
        }
    }
}

// Kirajzolás a vászonra
function draw() {
    // Alap háttér letisztítása
    ctx.fillStyle = "rgb(231, 241, 172)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Barna téglalap helyett a 4 képből álló kosár kirajzolása ---
    // Egy-egy negyed mérete: szélesség = basket.width / 2 (20px), magasság = basket.height / 2 (10px)
    const wHalf = basket.width / 2;
    const hHalf = basket.height / 2;
    // 1. Bal felső rész (k1)
    ctx.drawImage(basketImg1, basket.x, basket.y, wHalf, hHalf);
    // 2. Jobb felső rész (k2)
    ctx.drawImage(basketImg2, basket.x + wHalf, basket.y, wHalf, hHalf);
    // 3. Bal alsó rész (k3)
    ctx.drawImage(basketImg3, basket.x, basket.y + hHalf, wHalf, hHalf);
    // 4. Jobb alsó rész (k4)
    ctx.drawImage(basketImg4, basket.x + wHalf, basket.y + hHalf, wHalf, hHalf);


    // Pixelek helyett gomba képek rajzolása
    fallingObjects.forEach(obj => {
        // ctx.drawImage(kép, x_pozíció, y_pozíció, szélesség, magasság)
        ctx.drawImage(obj.img, obj.x, obj.y, blockSize, blockSize);
    });


    // --- START KÉPERNYŐ (Gombbal együtt) ---
    if (gameState === "START") {
        ctx.fillStyle = "#51923a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Cím
        ctx.fillStyle = "#eefbb2";
        ctx.font = "bold 32px Times serif";
        ctx.textAlign = "center";
        ctx.fillText("Gomba elkapó játék", canvas.width / 2, canvas.height / 2 - 30);

        // --- ASCII ART RAJZOLÁSA ---
    // Elmentjük a sorokat egy tömbbe
    var asciiArt = [ //https://www.asciiart.eu/art/c8cc0ebe54da56f3
        "         ___..._",
        "    _,--'       \"`-.",
        "  ,'.  .            \\",
        ",/:. .     .       .'",
        "|;..  .      _..--'",
        "\`--:...-,-'\"\"\\",
        "        |:.  \`.",
        "        l;.   l",
        "        \`|:.   |",
        "         |:.   \`.,",
        "        .l;.    j, ,",
        "     \`. \\\`;:.   //,/",
        "      .\\\\)\`;,|\\'/(",
        "       \` \`itz \`(,"
    ];

    ctx.fillStyle = "#ffffff";
    ctx.font = "12px 'Courier New', Courier, monospace"; // Fix szélességű betűtípus, hogy ne csússzanak el a karakterek
    ctx.textAlign = "left"; // FONTOS: Balra igazítjuk, különben szétesik a minta!

    // Kiszámoljuk a kezdő X és Y koordinátát, hogy az egész ábra középen legyen
    // Egy karakter szélessége 12px-es betűméretnél kb. 7.2px. A leghosszabb sor 48 karakteres.
    var artWidth = 48 * 7.2; 
    var startX = (canvas.width - artWidth) / 2 - 70;
    var startY = canvas.height / 2 - 10; // Az ábra tetejének pozíciója

    // Végigmegyünk a sorokon és egymás alá rajzoljuk őket
    for (var i = 0; i < asciiArt.length; i++) {
        ctx.fillText(asciiArt[i], startX, startY + (i * 15)); // 15px a sortávolság
    }


        // Zöld gomb rajzolása a canvasra
        // Indító gomb rajzolása (visszaállítjuk a center igazítást a gomb előtt)
        ctx.textAlign = "center";
        drawCanvasButton("START", canvas.width / 2, canvas.height / 2 +20);
        // Zöld gomb rajzolása a drawCanvasButton függvénnyel
        //drawCanvasButton(btnX, btnY, btnWidth, btnHeight, "VAGY KATTINTS IDE", "#2ecc71", "#ffffff");
    } 
    // --- GAMEOVER KÉPERNYŐ (Gombbal együtt) ---
    else if (gameState === "GAMEOVER") {
        ctx.fillStyle = "#51923a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        //játék vége felirat
        ctx.fillStyle = "#eefbb2";
        ctx.font = "bold 32px Times serif";
        ctx.textAlign = "center";
        ctx.fillText("Játék vége", canvas.width / 2, canvas.height / 2 - 40);
        
        //elért pontszám
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px Times serif";
        ctx.fillText(`Elért pontszám: ${score}`, canvas.width / 2, canvas.height / 2 - 5);

        // Új játék gomb rajzolása
        drawCanvasButton("ÚJ JÁTÉK", board.width / 2, board.height / 2 + 20);

    }
}

// Segédfüggvény a gomb megrajzolásához a Canvas-ra
function drawCanvasButton(text, centerX, centerY) {
    const w = 140;
    const h = 45;
    const x = centerX - w / 2;
    const y = centerY;

    // Lekerekített gomb háttér
    ctx.beginPath();
    ctx.fillStyle = "#247606";
    ctx.roundRect(x, y, w, h, 8); // 8px lekerekítés (pont mint a .modal-tartalom a CSS-ben)
    ctx.fill()
    
    // Lekerekített gomb keret
    ctx.beginPath();
    ctx.strokeStyle = "#eefbb2";
    ctx.lineWidth = 2;
    ctx.roundRect(x, y, w, h, 8);
    ctx.stroke();

    // Gomb szöveg
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Times serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, centerX, y + h / 2);
    ctx.textBaseline = "alphabetic"; // Alapértelmezett visszaállítása
}


// KÉPNÉZEGETŐ
let aktualisEhetoIndex = 1;
let aktualisMergezoIndex = 1;
const maxKepek = 6; // Csak az 1-6.png képeket nézegetjük

// Elemek kijelölése a HTML-ből
const ehetoKepElem = document.getElementById("eheto-kep");
const mergezoKepElem = document.getElementById("mergezo-kep");

// Ehető gombák léptetése
document.getElementById("eheto-bal").addEventListener("click", () => {
    aktualisEhetoIndex--;
    if (aktualisEhetoIndex < 1) aktualisEhetoIndex = maxKepek; // Ha az elejére ért, ugorjon a végére
    ehetoKepElem.src = `images/eheto/${aktualisEhetoIndex}.png`;
});

document.getElementById("eheto-jobb").addEventListener("click", () => {
    aktualisEhetoIndex++;
    if (aktualisEhetoIndex > maxKepek) aktualisEhetoIndex = 1; // Ha a végére ért, ugorjon az elejére
    ehetoKepElem.src = `images/eheto/${aktualisEhetoIndex}.png`;
});

// Mérgező gombák léptetése
document.getElementById("mergezo-bal").addEventListener("click", () => {
    aktualisMergezoIndex--;
    if (aktualisMergezoIndex < 1) aktualisMergezoIndex = maxKepek;
    mergezoKepElem.src = `images/mergezo/${aktualisMergezoIndex}.png`;
});

document.getElementById("mergezo-jobb").addEventListener("click", () => {
    aktualisMergezoIndex++;
    if (aktualisMergezoIndex > maxKepek) aktualisMergezoIndex = 1;
    mergezoKepElem.src = `images/mergezo/${aktualisMergezoIndex}.png`;
});



// Fő játékhurok
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Indítás
gameLoop();

