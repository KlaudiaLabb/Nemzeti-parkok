var rows = 3;
var columns = 3;
var currTile; // a négyzet amire rákattintunk
var otherTile; // az üres négyzet (3.jpg)
var turns = 0;

// Alapértelmezett mappa neve (megegyezik a HTML option value-val)
var currentFolder = "aggtelek";  //induló mappa

var isAnimating = false; // Megakadályozza a spammelést animáció közben

// Különböző variációk (a 3-as az üres mező)
var solvableOrders = [
    /*["1", "3", "2", "4", "5", "6", "7", "8", "9"]*/
    ["3", "1", "5", "7", "6", "2", "8", "4", "9"],
    ["1", "3", "2", "7", "5", "9", "6", "4", "8"],
    ["1", "9", "3", "7", "2", "5", "8", "6", "4"],
    ["1", "5", "2", "3", "4", "9", "7", "6", "8"],
    ["4", "1", "5", "6", "3", "8", "7", "9", "2"],
    ["7", "1", "2", "5", "9", "3", "8", "6", "4"],
    ["1", "5", "2", "7", "9", "4", "3", "8", "6"],
    ["7", "1", "2", "5", "6", "9", "8", "3", "4"],
    ["4", "1", "2", "9", "8", "6", "5", "7", "3"]
];
// Ebbe a változóba mentjük el az éppen aktuálisan kiválasztott random sorrendet
var activeOrder = [];
// Ebből a másolatból fogunk dolgozni a tábla építésekor (.shift())
var imgOrder = [];


// Amikor a böngésző teljesen betöltött, elindul a játék
window.onload = function() {
    pickRandomOrder(); // Sorsol egy kezdőállást
    buildBoard(); // Tábla felépítése

    // Figyeli, mikor vált a felhasználó a menüben
    document.getElementById("park-select").addEventListener("change", function() {
        currentFolder = this.value; // Pl. "hortobagy"
        resetGame(); // Újraépíti a játékot az új képekkel
    });

    // Felugró ablak "Új játék" gombja
    document.getElementById("restart-btn").addEventListener("click", function() {                   //e.preventDefault(); // Megakadályozza, hogy a href="#" felugorjon a lap tetejére -- function(e)=event
        resetGame();
    });
    
    // Ha megnyomják az X gombot, csak bezárja a felugrót, a megoldott kép ott marad a táblán!
    document.querySelector(".bezar-gomb").addEventListener("click", function() {
        document.getElementById("win-popup").classList.remove("show");
    });

    // Győzelmi ablak (Sikerült!) bezárása, ha a sötét részre kattint
    document.getElementById("win-popup").addEventListener("click", function(e) {
        // Csak akkor tünteti el, ha pontosan a sötét hátteret találta el
        if (e.target === this) {
            this.classList.remove("show");
        }
    });
}
    // --- Bezárás a háttérre kattintva --- nemjo nem működik a háttérre kattintás
    /*document.getElementById("parkModal").addEventListener("click", function(e) {
        // Az e.target megmutatja, hogy PONTOSAN mire kattintott a felhasználó.
        // Csak akkor zárja be, ha magára a sötétített háttérre (this) kattintott, 
        // és nem a belső fehér kártyára (.modal-tartalom) vagy a gombokra.
        if (e.target === this) {
            this.classList.remove("show");
        }
    });*/



// Újraindítás / Mappa váltás kezelése - csak a belső képek halványodnak el
function resetGame() {
    let tiles = document.getElementById("board").getElementsByTagName("img");
    
    // 1. Végigmegy az összes képen, és elhalványítja őket nullára
    for (let i = 0; i < tiles.length; i++) {
        // Mivel a CSS-ben nincs rájuk transition téve az opacity-re, JS-ből ad nekik egy gyors átmenetet
        tiles[i].style.transition = "opacity 0.4s ease-in-out";
        tiles[i].style.opacity = "0";
    }

    // 2. Megvárja, míg a képek elhalványodnak (400 ezredmásodperc = 0.4s)
    setTimeout(() => {
        turns = 0;
        document.getElementById("turns").innerText = turns;
        pickRandomOrder(); // Új random keverést sorsol
        buildBoard();      // Felépíti az új táblát a háttérben        
        // 3. Az új képek beúszását a buildBoard() fogja elindítani, 
        // mert az egy friss táblát hoz létre, amire ráteszi a CSS-ben megírt beúszást.
    }, 400); 
}



// Véletlenszerűen kiválaszt egyet a sorrendek közül
function pickRandomOrder() {
    // Generál egy random indexet 0 és a lista hossza között
    let randomIndex = Math.floor(Math.random() * solvableOrders.length);
    // Elmenti a kisorsolt sorrendet az activeOrder-be
    activeOrder = solvableOrders[randomIndex];
    // Készít belőle egy friss másolatot az imgOrder-be, amit szabadon üríthet
    imgOrder = [...activeOrder];
}
    /*vagy kihagyjuk az activeOrder-t:  imgOrder = [...solvableOrders[randomIndex]];*/


// A játéktábla legenerálása
function buildBoard() {
    // Biztosítja, hogy a board üres legyen pl. váltáskor vagy restart-kor (kiürítjük a HTML-t)
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
            
            tile.draggable = false; // ne lehessen megfogni (elhúzni a képet), csak kattintani
            tile.loading = "eager"; // Lusta betöltés tiltása a bevillanás ellen
            tile.addEventListener("click", tileClick);

            //Beúszás előkészítése az új képeknek
            tile.style.opacity = "0";
            tile.style.transition = "opacity 0.5s ease-in-out, transform 0.2s ease-in-out";
            
            board.append(tile);

            // Egy minimális időköz után láthatóvá teszi, így lágyan fog beúszni
            setTimeout(() => {
                tile.style.opacity = "1";
            }, 50);

        }
    }
}



// Kattintáskor fut le
function tileClick() {
    if (isAnimating) return; // Ha épp csúszik egy elem, ne engedje újat kattintani

    currTile = this; // Amire rákattintott a felhasználó
    // Megkeresi a táblán az aktuális üres négyzetet (3.jpg)
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
    if (!otherTile || !otherTile.src.includes("3.png")) { return; }

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

    if (moveLeft || moveRight || moveUp || moveDown) { //ha szomszédosak
        isAnimating = true;

        // ANIMÁCIÓ KISZÁMÍTÁSA: Megnézi mekkora egy négyzet mérete pixelben
        let tileSize = currTile.clientWidth;
        let xDiff = (c2 - c) * (tileSize + 2); // +2 a CSS gap miatt
        let yDiff = (r2 - r) * (tileSize + 2);

        // Elmozdítja vizuálisan a kattintott elemet az üres helyre
        currTile.style.transform = `translate(${xDiff}px, ${yDiff}px)`;

        // Megvárja, míg a CSS animáció (0.2s) lefut
        setTimeout(() => {
            // Visszaállítja a transzformációt alaphelyzetbe
            currTile.style.transform = "none";
            // Ténylegesen megcseréli az src-ket a háttérben
            let currImg = currTile.src;
            currTile.src = otherTile.src;
            otherTile.src = currImg;
            turns += 1; // lépések növelése
            document.getElementById("turns").innerText = turns; // megjelenítése a képernyőn
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

    // A nyerő sorrend: 1-től 9-ig sorban
    let winningOrder = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let isWon = currentOrder.every((val, index) => val === winningOrder[index]);

    if (isWon) {
        let solvedImage = document.getElementById("solved-image");
        let board = document.getElementById("board");

        // 1. Azonnal beállítja és megjeleníti a teljes 10.png-t a tábla helyén
        solvedImage.src = "images/" + currentFolder + "/10.png";
        solvedImage.classList.add("show");
        board.style.opacity = "0"; // Elhalványítja a kockákból álló táblát mögötte

        // 2. Pontosan 1 másodperc (1000 ms) múlva feldobja a szöveges ablakot
        setTimeout(() => {
            document.getElementById("win-popup").classList.add("show");
        }, 1000); //1sec
    }
}