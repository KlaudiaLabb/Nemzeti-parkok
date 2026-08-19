var errors = 0; //hibaszámláláshoz

var cardSet = []; //kártyák amikkel játszunk
var board = []; //kártyák elhelyezése
var rows = 4;
var columns = 5;

var card1Selected = null;
var card2Selected = null;

//a kártyák nevei amiket asználunk
var kutyak = [//a fájlok neve
    "d vizsla",
    "e kopo",
    "komondor",
    "kuvasz",
    "m agar",
    "mudi",
    "puli",
    "pumi",
    "r vizsla",
    "sinka"
]
var lovak = [//a fájlok neve
    "furioso",
    "gidran",
    "hucul",
    "kisberi",
    "lipicai",
    "m hidegveru",
    "m sportlo",
    "murakozi",
    "noniusz",
    "shagya-arab"
]

// Aktuális játékbeállítások (alapértelmezett: kutyák, 20 kártya)
var aktualisMappa = "kutyak";
var aktualisHatter = "hatter-k.png";
var kivalasztottPakli = [...kutyak];


window.onload = function() { //mikor sz oldal betölt ezt a függvényt meghívja
    // Figyeljük, ha a felhasználó megváltoztatja a paklit vagy a darabszámot
    document.getElementById("pakli-select").addEventListener("change", beallitasokFrissitese);
    document.getElementById("db-select").addEventListener("change", beallitasokFrissitese);
    
    // Új játék gomb a felugró ablakban
    document.getElementById("restart-btn").addEventListener("click", () => {
        document.getElementById("win-popup").classList.remove("show");
        beallitasokFrissitese();
    });
    // Ha megnyomják az X gombot, csak bezárjuk a felugrót, a megoldott kép ott marad a táblán!
    document.querySelector(".bezar-gomb").addEventListener("click", function() {
        document.getElementById("win-popup").classList.remove("show");
    });
    // Győzelmi ablak (Sikerült!) bezárása, ha a sötét részre kattintanak
    document.getElementById("win-popup").addEventListener("click", function(e) {
        // Csak akkor tüntetjük el, ha pontosan a sötét hátteret találta el
        if (e.target === this) {
            this.classList.remove("show");
        }
    });

     // --- ÚJ RÉSZ: Az igazi indítógomb eseményfigyelője a lebegő ablakban ---
    document.getElementById("real-start-btn").addEventListener("click", jatekValodiInditasa);

    beallitasokFrissitese();
}

function beallitasokFrissitese() {
    // 1. Pakli kiválasztása (Kutyák vagy Lovak)
    const pakliValasztas = document.getElementById("pakli-select").value;
    if (pakliValasztas === "kutyak") {
        aktualisMappa = "kutyak";
        kivalasztottPakli = [...kutyak];
    } else {
        aktualisMappa = "lovak";
        kivalasztottPakli = [...lovak];
    }

    // 2. Darabszám kiválasztása a lenyíló menüből
    const db = parseInt(document.getElementById("db-select").value);
    
    // --- ÚJ RÉSZ: Dinamikus rácsosztás (Oszlopok és sorok beállítása) ---
    // Kevesebb kártyánál kevesebb oszlop lesz, így a kártyák automatikusan megnőnek telefonon is!
    if (db === 20) { rows = 4; columns = 5; }
    else if (db === 16) { rows = 4; columns = 4; }
    else if (db === 12) { rows = 3; columns = 4; }
    else if (db === 8)  { rows = 2; columns = 4; }
    else if (db === 4)  { rows = 2; columns = 2; }

    // --- ÚJ RÉSZ: A HTML tábla (rács) szerkezetének azonnali átírása ---
    const boardElem = document.getElementById("board");
    if (boardElem) {
        boardElem.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        boardElem.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }

    // --- MÓDOSÍTÁS: Pakliváltáskor újra megmutatjuk a lebegő ablakot ---
    document.getElementById("game-start-overlay").classList.remove("hide");

    // Elindítjuk az új játékot a friss rácsmérettel
    jatekInditasa();
}
function jatekInditasa() {
    errors = 0;
    document.getElementById("errors").innerText = errors;
    document.getElementById("board").innerHTML = ""; // Kiürítjük a régi táblát
    board = [];
    card1Selected = null;
    card2Selected = null;

    // 1. KEVERÉS: Először a TELJES 10 darabos paklit keverjük meg alaposan
    // Így minden játékindításnál teljesen más állatok/gombák kerülnek az első helyekre!
    for (let i = 0; i < kivalasztottPakli.length; i++) {
        let j = Math.floor(Math.random() * kivalasztottPakli.length);
        let temp = kivalasztottPakli[i];
        kivalasztottPakli[i] = kivalasztottPakli[j];
        kivalasztottPakli[j] = temp;
    }

    // Csak a keverés UTÁN vágjuk le a szükséges mennyiséget (pl. 4 kártyához csak 2 párt)
    const parokSzama = (rows * columns) / 2;
    let jatekPakli = kivalasztottPakli.slice(0, parokSzama);
    
    // Duplázzuk a levágott paklit a párok létrehozásához
    cardSet = jatekPakli.concat(jatekPakli); 

    // 2. KEVERÉS: Megkeverjük a duplázott paklit is, hogy a párok ne egymás mellett szülessenek meg a táblán
    for (let i = 0; i < cardSet.length; i++) {
        let j = Math.floor(Math.random() * cardSet.length);
        let temp = cardSet[i];
        cardSet[i] = cardSet[j];
        cardSet[j] = temp;
    }

    // HTML generálás a 3D struktúrával
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let cardImg = cardSet.pop();
            row.push(cardImg);

            let cardContainer = document.createElement("div");
            cardContainer.className = "card-container flipped"; // Először megmutatjuk a képeket
            cardContainer.id = r.toString() + "-" + c.toString();

            let cardInner = document.createElement("div");
            cardInner.className = "card-inner";

            // Előlap (az állat képe az images/mappa/ mappából)
            let cardFront = document.createElement("div");
            cardFront.className = "card-front";
            let frontImg = document.createElement("img");
            frontImg.src = "images/" + aktualisMappa + "/" + cardImg + ".png";
            cardFront.appendChild(frontImg);

            // Hátlap (a kiválasztott mappa saját hatter.png fájlja)
            let cardBack = document.createElement("div");
            cardBack.className = "card-back";
            let backImg = document.createElement("img");
            backImg.src = "images/" + aktualisMappa + "/hatter.png"; 
            cardBack.appendChild(backImg);

            // Szerkezet összeállítása
            cardInner.appendChild(cardBack);
            cardInner.appendChild(cardFront);
            cardContainer.appendChild(cardInner);

            cardContainer.addEventListener("click", selectCard);
            document.getElementById("board").append(cardContainer);
        }
        board.push(row);
    }

    // 2 másodperces megmutatás után lefordítjuk a kártyákat
    //setTimeout(hideCards, 2000);
}

function hideCards() { // kártyák megfordítása hogy ne a színe hanem a háttér látszódjon
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let card = document.getElementById(r.toString() + "-" + c.toString());
            if (card) card.classList.remove("flipped");
        }
    }
}

function selectCard() { //ahhoz hogy rá tudhassunk kattintani a kártyára, muszáj hogy a kártya lefele nézzen, vagyis a háttér látszódjon
    if (!this.classList.contains("flipped") && !card2Selected) {
        if (!card1Selected) {
            card1Selected = this;
            card1Selected.classList.add("flipped");
        }
        else if (this != card1Selected) {
            card2Selected = this;
            card2Selected.classList.add("flipped");
            setTimeout(update, 1000);
        }
    }

}

function update() {
    let coords1 = card1Selected.id.split("-");
    let name1 = board[parseInt(coords1[0])][parseInt(coords1[1])]; // JAVÍTVA: Pontos 2D indexelés

    let coords2 = card2Selected.id.split("-");
    let name2 = board[parseInt(coords2[0])][parseInt(coords2[1])]; // JAVÍTVA: Pontos 2D indexelés

    if (name1 !== name2) {
        card1Selected.classList.remove("flipped");
        card2Selected.classList.remove("flipped");
        errors += 1;
        document.getElementById("errors").innerText = errors;
    }

    card1Selected = null;
    card2Selected = null;

    // Győzelem ellenőrzése
    const osszesKártya = document.querySelectorAll(".card-container");
    const megforditottKartyak = document.querySelectorAll(".card-container.flipped");
    if (osszesKártya.length === megforditottKartyak.length) {
        document.getElementById("win-popup").classList.add("show");
    }
}

// --- ÚJ FÜGGVÉNY: Csak akkor indul a visszaszámlálás, ha a gombra kattintottak ---
function jatekValodiInditasa() {
    // Elrejtjük a lebegő indító ablakot animációval
    document.getElementById("game-start-overlay").classList.add("hide");
    
    // Elindítjuk a 2 másodperces időzítőt: a képek ekkor kezdenek el ketyegni, majd lefordulnak
    setTimeout(hideCards, 2000);
}
