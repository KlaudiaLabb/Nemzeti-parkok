var rows = 3;
var columns = 3;

var currTile; // a négyzet amit megfogunk vagy amire rákattintunk
var otherTile; // az üres négyzet (3.jpg)

var turns = 0;

// var imgOrder = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]; //a darabok nevei
var imgOrder = ["4", "2", "8", "5", "1", "6", "7", "9", "3"]; // 3: üres

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

            // --- 2. EGÉRREL HÚZÁS FUNKCIÓ (Megmarad asztali gépekre) ---
            //DRAG FUNCTIONALITY (esemény, függvény)  az EventListere-ek teszik lehetővé a drag-and-drop funkciót
            tile.addEventListener("dragstart", dragStart);  //kép meg lett fogva mozgatáshoz (drag)
            tile.addEventListener("dragover", dragOver);    //kép mozgatása míg rá van kattintva
            tile.addEventListener("dragenter", dragEnter);  //képet ráhúzzuk egy másikra //belépünk egy másik képre
            tile.addEventListener("dragleave", dragLeave);  //a mozgatott kép elhagyja a másik képet //kilépünk egy mási képből
            tile.addEventListener("drop", dragDrop);        //a mozgatott kép elengedése egy másik felett (drop)
            tile.addEventListener("dragend", dragEnd);      //drag drop után mi történjen: cserélje fel a két képet

            document.getElementById("board").append(tile);
        }
    }
}

// Kattintáskor fut le
function tileClick() {
    currTile = this; // Amire rákattintott a felhasználó
    // Megkeressük a táblán az aktuális üres négyzetet (3.jpg)
    let tiles = document.getElementById("board").getElementsByTagName("img");
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].src.includes("3.jpg")) {
            otherTile = tiles[i];
            break;
        }
    }
    // Meghívjuk a már létező dragEnd() függvényedet, ami elvégzi a szomszédossági ellenőrzést és a cserét
    dragEnd();
}

function dragStart() {
    currTile = this;
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() {
}

function dragDrop() {
    otherTile = this;
}

function dragEnd() { 
    if (!otherTile || !otherTile.src.includes("3.jpg")) { 
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

    let isAdjacent = moveLeft || moveRight || moveUp || moveDown;

    if (isAdjacent) {
        let currImg = currTile.src;
        let otherImg = otherTile.src;

        currTile.src = otherImg;
        otherTile.src = currImg;

        turns += 1;
        document.getElementById("turns").innerText = turns;
    }
}
