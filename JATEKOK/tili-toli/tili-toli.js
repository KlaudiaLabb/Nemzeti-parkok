var rows = 3;
var columns = 3;

var currTile; // a négyzet amit megfogunk vagy amire rákattintunk
var otherTile; // az üres négyzet (3.jpg)

var turns = 0;

// Alapértelmezett mappa neve (megegyezik a HTML option value-val)
var currentFolder = "aggtelek";  //induló mappa

var isAnimating = false; // Megakadályozza a spammelést animáció közben

/* Ez a fix kiinduló keverés
var defaultOrder = ["4", "2", "8", "5", "1", "6", "7", "9", "3"]; // 3: üres
var imgOrder = [...defaultOrder]; // Másolatot készítünk, amit szabadon módosíthatunk a shift()-tel
*/
// --- MEGOLDHATÓ KEZDŐSORRENDEK LISTÁJA ---
// 4 különböző, előre letesztelt variációt (a 3-as az üres mező)
var solvableOrders = [
    /*["1", "3", "2", "4", "5", "6", "7", "8", "9"]*/
    ["4", "2", "8", "5", "1", "6", "7", "9", "3"], // jók
    ["5", "4", "2", "6", "3", "9", "8", "1", "7"],   
    ["3", "7", "4", "2", "9", "5", "1", "8", "6"],
    ["7", "9", "4", "2", "8", "6", "3", "5", "1"],
    ["5", "1", "3", "4", "8", "7", "9", "6", "2"]
];
// Ebbe a változóba mentjük el az éppen aktuálisan kiválasztott random sorrendet
var activeOrder = [];
// Ebből a másolatból fogunk dolgozni a tábla építésekor (.shift())
var imgOrder = [];


// Amikor a böngésző teljesen betöltött, elindul a játék
window.onload = function() {
    pickRandomOrder(); // Sorsolunk egy kezdőállást
    buildBoard(); // Tábla felépítése

    // Figyeljük, mikor vált a felhasználó a menüben
    document.getElementById("park-select").addEventListener("change", function() {
        currentFolder = this.value; // Pl. "hortobagy"
        resetGame(); // Újraépítjük a játékot az új képekkel
    });

    // Felugró ablak "Új játék" gombja
    document.getElementById("restart-btn").addEventListener("click", function() {
        //e.preventDefault(); // Megakadályozza, hogy a href="#" felugorjon a lap tetejére -- function(e)=event
        resetGame();
    });
    
    // Ha megnyomják az X gombot, csak bezárjuk a felugrót, a megoldott kép ott marad a táblán!
    document.querySelector(".bezar-gomb").addEventListener("click", function() {
        document.getElementById("win-popup").classList.remove("show");
    });

    // --- Bezárás a háttérre kattintva --- nemjo nem működik a háttérre kattintás
    /*document.getElementById("parkModal").addEventListener("click", function(e) {
        // Az e.target megmutatja, hogy PONTOSAN mire kattintott a felhasználó.
        // Csak akkor zárjuk be, ha magára a sötétített háttérre (this) kattintott, 
        // és nem a belső fehér kártyára (.modal-tartalom) vagy a gombokra.
        if (e.target === this) {
            this.classList.remove("show");
        }
    });*/
}

// Újraindító és mappa-váltó funkció
/*function resetGame() {
    turns = 0;
    document.getElementById("turns").innerText = turns;
    pickRandomOrder(); // Minden váltásnál vagy restartnál ÚJ random sorrendet sorsolunk!
    buildBoard();      // Újraépítjük a teljes táblát
}*/
// Újraindítás / Mappa váltás kezelése lágy halványítással
// Újraindítás / Mappa váltás kezelése - csak a belső képek halványodnak el
function resetGame() {
    let tiles = document.getElementById("board").getElementsByTagName("img");
    
    // 1. Végigmegyünk az összes képen, és elhalványítjuk őket nullára
    for (let i = 0; i < tiles.length; i++) {
        // Mivel a CSS-ben nincs rájuk transition téve az opacity-re, JS-ből adunk nekik egy gyors átmenetet
        tiles[i].style.transition = "opacity 0.4s ease-in-out";
        tiles[i].style.opacity = "0";
    }

    // 2. Megvárjuk, míg a képek elhalványodnak (400 ezredmásodperc = 0.4s)
    setTimeout(() => {
        turns = 0;
        document.getElementById("turns").innerText = turns;
        
        pickRandomOrder(); // Új random keverést sorsolunk
        buildBoard();      // Felépítjük az új táblát a háttérben
        
        // 3. Az új képek beúszását a buildBoard() fogja elindítani, 
        // mert az egy friss táblát hoz létre, amire rátesszük a CSS-ben megírt beúszást.
    }, 400); 
}



// Véletlenszerűen kiválaszt egyet a sorrendek közül
function pickRandomOrder() {
    // Generálunk egy random indexet 0 és a lista hossza között
    let randomIndex = Math.floor(Math.random() * solvableOrders.length);
    // Elmentjük a kisorsolt sorrendet az activeOrder-be
    activeOrder = solvableOrders[randomIndex];
    // Készítünk belőle egy friss másolatot az imgOrder-be, amit szabadon üríthetünk
    imgOrder = [...activeOrder];

    /*vagy kihagyjuk az activeOrder-t:  imgOrder = [...solvableOrders[randomIndex]];*/
}

// A játéktábla legenerálása
function buildBoard() {
    // Biztosítjuk, hogy a board üres legyen pl. váltáskor vagy restart-kor (kiürítjük a HTML-t)
    let board = document.getElementById("board");
    board.innerHTML = ""; 
    
    // Alaphelyzetbe állítjuk a tábla és a megoldás-kép láthatóságát
    board.style.opacity = "1";
    document.getElementById("solved-image").classList.remove("show");
    document.getElementById("win-popup").classList.remove("show");

    for (let r=0; r < rows; r++) {
        for (let c=0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.id = r.toString() + "-" + c.toString();
            
            // Elérési út, például: images/orseg/4.png
            tile.src = "images/" + currentFolder + "/" + imgOrder.shift() + ".png";
            
            tile.draggable = false; // nem lehessen megfogni (elhúzni a képet), csak kattintani
            tile.loading = "eager"; // Lusta betöltés tiltása a bevillanás ellen
            tile.addEventListener("click", tileClick);

            //Beúszás előkészítése az új képeknek ---
            tile.style.opacity = "0";
            tile.style.transition = "opacity 0.5s ease-in-out, transform 0.2s ease-in-out";
            
            board.append(tile);

            // Egy minimális időköz után láthatóvá tesszük, így lágyan fog beúszni
            setTimeout(() => {
                tile.style.opacity = "1";
            }, 50);

        }
    }
}

/*
// mikor a képenyő betölt akkor meghívjuk ezt a függvényt
// a képeket betölti a board-ra
window.onload = function() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {

           //<img id="0-0" src="1.jpg">
            let tile = document.createElement("img"); //<img> tag készítése
            tile.id = r.toString() + "-" + c.toString(); //id hozzáadása: <img id="0-1"> //koordináták helymeghatározáshoz
            tile.src = imgOrder.shift() + ".jpg";  //shift(): kiveszi(pop) a lista első elemét <img id="0-0" src="1.png">

            // --- 1. KATTINTÁS / ÉRINTÉS FUNKCIÓ (Mobilra és Asztali gépre) ---
            tile.addEventListener("click", tileClick);

            /* --- 2. EGÉRREL HÚZÁS FUNKCIÓ (Megmarad asztali gépekre) ---   gépnél zavaró mindkettő
            //DRAG FUNCTIONALITY (esemény, függvény)  az EventListere-ek teszik lehetővé a drag-and-drop funkciót
            tile.addEventListener("dragstart", dragStart);  //kép meg lett fogva mozgatáshoz (drag)
            tile.addEventListener("dragover", dragOver);    //kép mozgatása míg rá van kattintva
            tile.addEventListener("dragenter", dragEnter);  //képet ráhúzzuk egy másikra //belépünk egy másik képre
            tile.addEventListener("dragleave", dragLeave);  //a mozgatott kép elhagyja a másik képet //kilépünk egy mási képből
            tile.addEventListener("drop", dragDrop);        //a mozgatott kép elengedése egy másik felett (drop)
            tile.addEventListener("dragend", dragEnd);*      //drag drop után mi történjen: cserélje fel a két képet
            
            // TILTÁS: Megakadályozzuk, hogy a böngésző megpróbálja elhúzni a képet
            tile.draggable = false; 

            document.getElementById("board").append(tile);
        }
    }
}*/

// Kattintáskor fut le
function tileClick() {
    if (isAnimating) return; // Ha épp csúszik egy elem, ne engedjünk újat kattintani

    currTile = this; // Amire rákattintott a felhasználó
    // Megkeressük a táblán az aktuális üres négyzetet (3.jpg)
    let tiles = document.getElementById("board").getElementsByTagName("img");
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].src.includes("3.png")) {
            otherTile = tiles[i];
            break;
        }
    }
    // Ha szomszédosak, akkor csere
    checkAndMove();
}

// Ellenőrzi, hoy szomszédos elemre volt-e kattintva, ha igen akkor cserél
function checkAndMove() { 
    if (!otherTile || !otherTile.src.includes("3.png")) { 
        return; 
    }

    let currCoords = currTile.id.split("-");
    let r = parseInt(currCoords[0]);
    let c = parseInt(currCoords[1]);

    let otherCoords = otherTile.id.split("-");
    let r2 = parseInt(otherCoords[0]);
    let c2 = parseInt(otherCoords[1]);

    let moveLeft = r == r2 && c2 == c-1;
    let moveRight = r == r2 && c2 == c+1;
    let moveUp = c == c2 && r2 == r-1;
    let moveDown = c == c2 && r2 == r+1;

    /*let isAdjacent = moveLeft || moveRight || moveUp || moveDown;

    if (isAdjacent) {
        let currImg = currTile.src;
        let otherImg = otherTile.src;

        currTile.src = otherImg;
        otherTile.src = currImg;

        turns += 1;
        document.getElementById("turns").innerText = turns;
    }*/

    if (moveLeft || moveRight || moveUp || moveDown) { //ha szomszédosak
        isAnimating = true;

        // ANIMÁCIÓ KISZÁMÍTÁSA: Megnézzük mekkora egy négyzet mérete pixelben
        let tileSize = currTile.clientWidth;
        let xDiff = (c2 - c) * (tileSize + 2); // +2 a CSS gap miatt
        let yDiff = (r2 - r) * (tileSize + 2);

        // Elmozdítjuk vizuálisan a kattintott elemet az üres helyre
        currTile.style.transform = `translate(${xDiff}px, ${yDiff}px)`;

        // Megvárjuk, míg a CSS animáció (0.2s) lefut
        setTimeout(() => {
            // Visszaállítjuk a transzformációt alaphelyzetbe
            currTile.style.transform = "none";

            // Ténylegesen megcseréljük az src-ket a háttérben
            let currImg = currTile.src;
            currTile.src = otherTile.src;
            otherTile.src = currImg;

            turns += 1;
            document.getElementById("turns").innerText = turns;
            isAnimating = false;

            // Minden sikeres lépés után megnézzük, nyert-e a játékos
            checkWinCondition();
        }, 200); 
    }
}

// Győzelem ellenőrzése
function checkWinCondition() {
    let tiles = document.getElementById("board").getElementsByTagName("img");
    let currentOrder = [];

    // Összegyűjtjük a táblán lévő képek neveit a sorrendjük alapján
    for (let i = 0; i < tiles.length; i++) {
        let filename = tiles[i].src.split('/').pop(); // pl: "1.png"
        let number = filename.replace(".png", "");    // pl: "1"
        currentOrder.push(number);
    }

    // A tökéletes nyerő sorrend: 1-től 9-ig pontosan sorban
    let winningOrder = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let isWon = currentOrder.every((val, index) => val === winningOrder[index]);

    if (isWon) {
        let solvedImage = document.getElementById("solved-image");
        let board = document.getElementById("board");

        // 1. Azonnal beállítjuk és megjelenítjük a teljes 10.png-t a tábla helyén
        solvedImage.src = "images/" + currentFolder + "/10.png";
        solvedImage.classList.add("show");
        board.style.opacity = "0"; // Elhalványítjuk a kockákból álló táblát mögötte

        // 2. Pontosan 1 másodperc (1000 ms) múlva feldobjuk a szöveges ablakot
        setTimeout(() => {
            document.getElementById("win-popup").classList.add("show");
        }, 1000); //1sec
    }
}