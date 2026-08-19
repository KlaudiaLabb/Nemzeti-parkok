var errors = 0; //hibaszámláláshoz

//var cardList; //kivalasztott mappa neve --> kutya vs lovak
//-----KUTYA V LO
var cardList = [ //jelenleg a fájlok neve
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

var cardSet; //kártyák amikkel játszunk
var board = []; //kártyák elhelyezése
var rows = 4;
var columns =5;

var card1Selected;
var card2Selected;

window.onload = function() { //mikor sz oldal betölt ezt a függvényt meghívja
    shuffleCards(); //a cardSet-hez hozzáadja a kártyákat kétszer, megkeveri
    startGame(); //kártyák elhelyezése a html-ben
}

function shuffleCards() {
    //-----KUTYA V LO
    cardSet = cardList.concat(cardList); //hozzáfűzi mégegyszer -> minden lapból kettő lesz
    //console.log(cardSet); //consol-ra kiírja
    //shuffle: összekerjük
    for (let i = 0; i < cardSet.length; i++) {
        let j = Math.floor(Math.random() * cardSet.length); //random index   Math.random->[0-1[ [0-20[ floor levágja a decimális részt
        //swap: megcseréljük a kettőt
        let temp = cardSet[i];
        cardSet[i] = cardSet[j];
        cardSet[j] = temp;
    }
    //console.log(cardSet);
}

function startGame() {
    //4sorx5oszlop táblába betesszük a képeket
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let cardImg = cardSet.pop(); //hátulról szed ki ey képet
            row.push(cardImg); //JS-nek

            //HTML-nek   <img> készítése
            // <img id="0-0" class="card" src="water.jpg">
            let card = document.createElement("img"); //<img>
            card.id = r.toString() + "-" + c.toString(); //id: sor oszlop koordináták a táblához
            card.src = "images/kutyak/"+ cardImg + ".png";
            //card.classList.add("card");
            card.addEventListener("click", selectCard); //kattinthatóak legyenek a kártyák
            document.getElementById("board").append(card); //hozzáfűzi a táblához a kártyát -> div board-ba belerak 20 img-t

        }
        board.push(row); //JS táblához hozzáadja (2d)
    }

    //console.log(board); //2d tábla js = képek html-ben
    setTimeout(hideCards, 2000); //1000 = 1s  //a hideCards függványt 1000milisec után hívja meg
}

function hideCards() { // kártyák megfordítása hogy ne a színe hanem a háttér látszódjon
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let card = document.getElementById(r.toString() + "-" + c.toString());
            card.src = "images/kutyak/hatter.png";
        }
    }
}

function selectCard() { //ahhoz hogy rá tudhassunk kattintani a kártyára, muszáj hogy a kártya lefele nézzen, vagyis a háttér látszódjon
    if (this.src.includes("hatter")) { //this = a kártya ami ki lett választva
        if (!card1Selected) { //ha card1 nem volt még kiválaszva akkor a most kiválasztott lesz az
            card1Selected = this;

            let coords = card1Selected.id.split("-"); //"0-1" -> ["0", "1"]   2 string
            let r = parseInt(coords[0]);
            let c = parseInt(coords[1]);

            card1Selected.src = "images/kutyak/"+ board[r][c] + ".png";
        }
        else if (!card2Selected && this != card1Selected) { //ha a card1 már ki volt választva akkor a card2-t állítjuk be   && nem válasszuk ki ugyanazt a kártyát kétszer
            card2Selected = this;

            let coords = card2Selected.id.split("-"); //"0-1" -> ["0", "1"]
            let r = parseInt(coords[0]);
            let c = parseInt(coords[1]);

            card2Selected.src = "images/kutyak/"+ board[r][c] + ".png";
            setTimeout(update, 1000); //1s várás   miután 2 kártya ki lett választva, frissíteni kell a táblát
        }
    }

}

function update() {
    //ha a kártyák nem ugyanazok, akkor visszafordítja mindkettőt
    if (card1Selected.src != card2Selected.src) {
        card1Selected.src = "images/kutyak/hatter.png";
        card2Selected.src = "images/kutyak/hatter.png";
        errors += 1;
        document.getElementById("errors").innerText = errors; //szöveg frissítése
    }

    card1Selected = null; //mindkettő kijelölést megszünteti
    card2Selected = null;
}