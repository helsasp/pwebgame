let size =30;
let row = 20;
let column = 40;

let canvas;
let canvasWidth = size * column;
let canvasHeight = size * row;
let context;

// TANK
let tankWidth = size*4;
let tankHeight = size*4;
let tankX = size * column/2 - size ;
let tankY = size *row - size*3.2;

let tank = {
    x : tankX,
    y : tankY,
    width : tankWidth,
    height : tankHeight,
}

let tankImg;
let tankVeloX = size;

// STARS
let starsArray = [];
let starsWidth = size *1.5;
let starsHeight = size *1.5;
let starsX = size;
let starsY = size;
let starsImg;
let starsRow = 2;
let starsColumn = 3;
let starsCount = 0;
let starsVeloX = 1;

// SHOOT

let shootArray =[];
let shootVeloY =-10;

// SCORE

let score = 0;
let gameOver = false;

// LEVEL
let level = 1;

//TIMER 
let time = 30;
let timerInterval;

let highscore = 0;



window.onload = function (){

    canvas = document.getElementById("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context= canvas.getContext("2d");


    //load image

    tankImg = new Image ();
    tankImg.src = "./tank.png";
    tankImg.onload = function(){
        
        context.drawImage(tankImg,tank.x,tank.y,tank.width,tank.height);

    }

    starsImg = new Image ();
    starsImg.src = "./stars.png"
    displayStars ();



    requestAnimationFrame(update);

    document.addEventListener("keydown",moveTank);
    document.addEventListener("keyup", fire);

    startTimer();

    loadHighScore();

}

//loop draw
function update () {

    if (isPaused) {
        return; // Don't update the game if it's paused
    }


    requestAnimationFrame(update);


    if (gameOver) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "white";
        context.font = "40px courier";
        context.fillText("Game Over. Try Again!", canvas.width / 2 - 250, canvas.height / 2);


        saveHighScore();

    
    document.getElementById("highscore").textContent = "🆙 High Score : " + highscore;

       
        return;
    }

    
    
    context.clearRect(0,0,canvas.width,canvas.height);


    // Time
    drawTimer();
        // LEVEL SCORE SH

        drawLevelandScore()

        context.drawImage(tankImg, tank.x, tank.y, tank.width, tank.height);

    
    
    // STARS
    for(let x = 0; x< starsArray.length; x++) {
        let stars = starsArray[x];
        if(stars.alive) {

            stars.x += starsVeloX;

            if(stars.x <= 0 || stars.x + stars.width >= canvas.width){
                starsVeloX *= -1;
                stars.x += starsVeloX*2;

                for(let p=0; p<starsArray.length; p++) {
                    starsArray[p].y += starsHeight; 
                }
            }
           
            context.drawImage(starsImg,stars.x,stars.y,stars.width,stars.height);

            // Game Over Condition
            if(tank.y <= stars.y || time == 0) {
                gameOver = true;
            

            }
        }
    }

    
// SHOOT
    for (let i=0; i<shootArray.length; i++){
        let shoot = shootArray[i];
        shoot.y += shootVeloY;

        context.fillStyle = "black";
        context.fillRect(shoot.x, shoot.y, shoot.width, shoot.height);

        // collision with stars
        for(let j = 0; j<starsArray.length; j++) {
            let stars = starsArray[j];

            if (collision(shoot, stars) && !shoot.used && stars.alive ){
                
                stars.alive = false;
                starsCount -= 1;
                shoot.used = true;

                score += 1000;
            }
        }
}

    // clear shoot
    while( shootArray[0].y <0 || shootArray[0].used && shootArray.length > 0 )
shootArray.shift();

    // next level
    if(starsCount == 0) {
        starsColumn = Math.min (starsColumn+1, column/2 -2);
        starsRow = Math.min(starsRow+1, row-4);

        starsVeloX+= 1;
        starsArray=[];
        shootArray=[];

        displayStars();

        level++;
        
        time = 30; 
        startTimer();
    

    }
 


}

function moveTank (x) {

    if(gameOver){
        return;
    }

    if(x.code == "ArrowRight" && tank.x + tankVeloX + tank.width <= canvas.width ){
        tank.x += tankVeloX;
    }

    else if (x.code == "ArrowLeft" && tank.x - tankVeloX >= 0 ){
        tank.x -= tankVeloX;
    }


}

function displayStars (){
    for(let i = 0; i<starsColumn; i++){
        for(let j = 0; j<starsRow; j++){
            let stars = {
                img : starsImg,
                x : starsX + i * starsWidth,
                y : starsY + j * starsHeight,
                width : starsWidth,
                height : starsHeight,
                alive : true
            }

            starsArray.push(stars);
        }
    }
    starsCount = starsArray.length;
}

function fire (x) {

    if(gameOver) {
        return;
    }

    if(x.code == "Space") {
        x.preventDefault();
        let shoot = {
            x : tank.x + tankWidth*15/32,
            y : tank.y,
            width : size/8,
            height : size/2,
            used : false

        }

        shootArray.push(shoot);

        //sound
        let fireSound = document.getElementById("fireSound");
        fireSound.currentTime = 0; 
        fireSound.play();
    }
}

function collision (i,j) {
    return i.x < j.x + j.width && // top left a doesnt reach top right b
    i.x + i.width > j.x && // top right a pass top left b
    i.y < j.y + j.height && // top left a doesnt reach b bottom left
    i.y + i.height > j.y; // bottom left a pass b top left
}

//Level Score Text
function drawLevelandScore() {

    document.getElementById("level").textContent = "🎖️ Level : " + level;
    document.getElementById("score").textContent = "✨ Score : " + score;
    

}

function drawTimer (){
    
    document.getElementById("timer").textContent = "⏰ Time : " + time + "s";

    
}


function startTimer() {
    timerInterval = setInterval(function () {
      time--;
      if (time <= 0) {
        clearInterval(timerInterval);
       
      }
    }, 1000); 
  }

  let isPaused = false;
  function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(timerInterval); // Pause the timer
        document.getElementById("pauseButton").textContent = "⏸ Resume";
    } else {
        startTimer(); // Resume the timer
        document.getElementById("pauseButton").textContent = "▶ Pause";
        requestAnimationFrame(update);
    }
}

function saveHighScore() {
    if (score > highscore) {
        highscore = score;
        localStorage.setItem("highscore", highscore);
    }
}


function loadHighScore() {
    const storedHighScore = localStorage.getItem("highscore");
    if (storedHighScore) {
        highscore = parseInt(storedHighScore);
    }
}

function restartGame() {
    tank.x = tankX;
    tank.y = tankY;
    starsArray = [];
    starsColumn = 3;
    starsRow = 2;
    starsCount = 0;
    starsVeloX = 1;
    shootArray = [];
    score = 0;
    gameOver = false;
    level = 1;
    time = 30;
    clearInterval(timerInterval);
    startTimer();
    displayStars();
}

// Add a Restart button and link it to the restartGame function
document.getElementById("restartButton").addEventListener("click", restartGame);




