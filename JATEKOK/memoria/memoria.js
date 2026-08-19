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
            card.id = r.toString() + "-" + c.toString();
            card.src = "images/kutyak/"+ cardImg + ".png";
            card.classList.add("card");
            card.addEventListener("click", selectCard);
            document.getElementById("board").append(card);

        }
        board.push(row);
    }

    console.log(board);
    setTimeout(hideCards, 1000);
}

function hideCards() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let card = document.getElementById(r.toString() + "-" + c.toString());
            card.src = "images/kutyak/hatter.png";
        }
    }
}

function selectCard() {
    if (this.src.includes("hatter")) {
        if (!card1Selected) {
            card1Selected = this;

            let coords = card1Selected.id.split("-"); //"0-1" -> ["0", "1"]
            let r = parseInt(coords[0]);
            let c = parseInt(coords[1]);

            card1Selected.src = "images/kutyak/"+ board[r][c] + ".png";
        }
        else if (!card2Selected && this != card1Selected) {
            card2Selected = this;

            let coords = card2Selected.id.split("-"); //"0-1" -> ["0", "1"]
            let r = parseInt(coords[0]);
            let c = parseInt(coords[1]);

            card2Selected.src = "images/kutyak/"+ board[r][c] + ".png";
            setTimeout(update, 1000);
        }
    }

}

function update() {
    //if cards aren't the same, flip both back
    if (card1Selected.src != card2Selected.src) {
        card1Selected.src = "images/kutyak/hatter.png";
        card2Selected.src = "images/kutyak/hatter.png";
        errors += 1;
        document.getElementById("errors").innerText = errors;
    }

    card1Selected = null;
    card2Selected = null;
}