//////////////// canvas 20*20-as  [0-17]   X-Y =  oszlop-sor  (pozitív: x-jobb, y-le) (negatív: x-bal, y-fel)
//board
var blockSize = 25;  //1 dobozka mérete
var rows = 15;
var cols = 15;
var board;
var context; //amivel rajzolunk
var points = 0;

//snake feje hol kezdjen
var snakeX = blockSize * 5;
var snakeY = blockSize * 5;

var velocityX = 0; //snake sebessége
var velocityY = 0;

var snakeBody = []; //szegmenteket (x,y koordinátákat) fog tárolni

//food
var foodX; //fix:  var foodX = blockSize *10
var foodY;

var gameOver = false;

//amikor az oldal betöltődik
window.onload = function() {
    board = document.getElementById("board"); //canvas id-ja
    board.height = rows * blockSize;
    board.width = cols * blockSize;
    context = board.getContext("2d"); //used for drawing on the board

    placeFood(); //kaja random elhejezése
    document.addEventListener("keydown", changeDirection); //kígyó mozgatása ->keydown:gyorsabb reakció  keyup: nyílas billentyűket figyeli, ahogy elengeded a billentyűt fogja hívni a függvényt
    // update(); //board rajzolása            //itt csak egyszer hívja a függvényt
    setInterval(update, 3000/10); //3000 1000/10: 10szer 1 másodpercben - 100 milliseconds-onként hívja meg az update function-t  //itt többször hívja a függvényt
}

function update() { //fest a canvas-ra
    if (gameOver) {
        return; //ha vége a játékna akkor nem frissíti a canvas-t 
    }

    context.fillStyle="black"; //a toll színét feketére állítja HÁTTÉR
    context.fillRect(0, 0, board.width, board.height); //beszínezi: start-0,0 end-w,h

    context.fillStyle="red"; // a toll színét pirosra állítja KAJA
    context.fillRect(foodX, foodY, blockSize, blockSize); //színezés  x, y, w, h

    if (snakeX == foodX && snakeY == foodY) { //amikor ugyanott van a fej és a kaja, megeszi a kaját
        snakeBody.push([foodX, foodY]); //növekszik a kígyó
        placeFood();
        points += 1; //pontok növelése
        document.getElementById("points").innerText = points; //megjelenítésa a képernyőn
    }

    for (let i = snakeBody.length-1; i > 0; i--) { //test mozgatása    hátúlról a fej fele megy, így tudja az előzőek koordinátáit megszerezni, utána mozdulhat a fej
        snakeBody[i] = snakeBody[i-1]; //oda mozgatja ahol az előtte lévő "testrész" van
    }
    if (snakeBody.length) { //ha már vannak testrészek
        snakeBody[0] = [snakeX, snakeY]; //a fej előtt lévő részt beállítja oda ahol a fej van (utána mozgatjuk el a fejet)
    }

    context.fillStyle="lime"; //a toll színe zöld KÍGYÓ
    snakeX += velocityX * blockSize; //snake helyét frissítjük mielőtt színezünk (blockSize nélkül pixelenként mozog, de nehéz enni)
    snakeY += velocityY * blockSize;
    context.fillRect(snakeX, snakeY, blockSize, blockSize); //színezés  x, y, w, h
    for (let i = 0; i < snakeBody.length; i++) { //test megrajzolása
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize); //színezés  x, y, w, h
    }

    //game over conditions
    //kimegy a pályáról
    if (snakeX < 0 || snakeX > cols*blockSize || snakeY < 0 || snakeY > rows*blockSize) {
        endGame()
    }
    //belemegy magába
    for (let i = 0; i < snakeBody.length; i++) { //minden szegmensen végigmegy
        if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) { //fej ugyan ott van-e mit valamelyik testrész
            endGame()
        }
    }
}

function changeDirection(e) { //e=event, keyevent   IRÁNYVÁLTÁS
    if (e.code == "ArrowUp" && velocityY != 1) { //velocityY=1 ==> lefele megy, vagyis nem mehet fel
        velocityX = 0;
        velocityY = -1; 
    }
    else if (e.code == "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    }
    else if (e.code == "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    }
    else if (e.code == "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
}


function placeFood() { // random elhejezi a kaját
    //Olyan helyre rakjuk a kaját, ahol nincs ott a kígyó
    let validPosition = false;
    while (!validPosition) {
        //(0-1) * cols -> (0-19.9999) -> (0-19) * 25
        foodX = Math.floor(Math.random() * cols) * blockSize; //math.random: [0-1[  //math.floor: lefele kerekít, leveszi a tizedes számokat
        foodY = Math.floor(Math.random() * rows) * blockSize;
        
        validPosition = true;
        
        // Ellenőrizzük a fejet
        if (foodX == snakeX && foodY == snakeY) {
            validPosition = false;
        }
        // Ellenőrizzük a testet
        for (let i = 0; i < snakeBody.length; i++) {
            if (foodX == snakeBody[i][0] && foodY == snakeBody[i][1]) {
                validPosition = false;
            }
        }
    }
}

function endGame() {
    gameOver = true;
    alert("Game Over");
}