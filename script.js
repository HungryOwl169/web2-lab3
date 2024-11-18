var myPaddle;
var myBall;
var bricks = [];
var currentScore = 0;
var maxScore = localStorage.getItem("maxScore") || 0;

const myPaddleWidth = 230;
const myPaddleHeight = 10;
const paddleSpeed = 13;
const ballSpeed = 7;
const brickNumber = 3;
const myBallRadius = 15;
const destroyedBricks = 0;

// funckija koja kad igra zavrsi cisti ekran i ispisuje odgovarajucu poruku, pa resetira igru
function endTheGame(msg) {
  clearInterval(myGameArea.interval);
  myGameArea.clear();
  let ctx = myGameArea.context;
  ctx.fillStyle = "black";
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(msg, myGameArea.canvas.width / 2, myGameArea.canvas.height / 2);
  if (currentScore > maxScore) {
    maxScore = currentScore;
    localStorage.setItem("maxScore", maxScore);
  }
  setTimeout(() => {
    startGame();
  }, 2000);
}

// funckija koja crta cigle
function spawnBricks(brickNumberPerRow, numberOfRows) {
  let brickWidth = window.innerWidth / brickNumberPerRow;
  let brickHeight = 110;

  for (let row = 0; row < numberOfRows; row++) {
    for (let col = 0; col < brickNumberPerRow; col++) {
      let x = col * brickWidth;
      let y = row * brickHeight;
      brick = new rectangleComponent(brickWidth, brickHeight, "green", x, y);
      bricks.push(brick);
    }
  }
}

// funckija koja kontrolira sudare
function checkCollision(ball, rectangle) {
  let ballLeft = ball.x - ball.radius;
  let ballRight = ball.x + ball.radius;
  let ballTop = ball.y - ball.radius;
  let ballBottom = ball.y + ball.radius;

  let recLeft = rectangle.x;
  let recRight = rectangle.x + rectangle.width;
  let recTop = rectangle.y;
  let recBottom = rectangle.y + rectangle.height;

  if (
    ballRight > recLeft &&
    ballLeft < recRight &&
    ballBottom > recTop &&
    ballTop < recTop
  ) {
    ball.speedY *= -1;
    return true;
  }
  if (
    ballRight > recLeft &&
    ballLeft < recRight &&
    ballBottom > recBottom &&
    ballTop < recBottom
  ) {
    ball.speedY *= -1;
    return true;
  }
  if (
    ballBottom > recTop &&
    ballTop < recBottom &&
    ballRight > recLeft &&
    ballLeft < recLeft
  ) {
    ball.speedX *= -1;
    return true;
  }
  if (
    ballBottom > recTop &&
    ballTop < recBottom &&
    ballLeft < recRight &&
    ballRight > recRight
  ) {
    ball.speedX *= -1;
    return true;
  }

  return false;
}

// fukcija koja starta igru i postavlja odgovarajuce elemente i varijable u pocetno stanje
function startGame() {
  myGameArea.start();
  myPaddle = new rectangleComponent(
    myPaddleWidth,
    myPaddleHeight,
    "red",
    myGameArea.canvas.width / 2 - myPaddleWidth / 2,
    myGameArea.canvas.height - myPaddleHeight - 5
  );
  myPaddle.moveRight = function (num) {
    if (this.x + myPaddleWidth < myGameArea.canvas.width) {
      this.x += num;
    }
  };
  myPaddle.moveLeft = function (num) {
    if (this.x > 0) {
      this.x -= num;
    }
  };
  myBall = new ballComponent(
    myBallRadius,
    "blue",
    myPaddle.x + myPaddleWidth / 2,
    myGameArea.canvas.height - myPaddleHeight - 20
  );
  myBall.initialAngle();
  spawnBricks(brickNumber, 2);
  currentScore = 0;
}

// objekt koji pretstavlja sam kanvas i igru
var myGameArea = {
  canvas: document.createElement("canvas"),
  start: function () {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.interval = setInterval(updateGameArea, 20);
    window.addEventListener("keydown", function (e) {
      myGameArea.key = e.key;
    });
    window.addEventListener("keyup", function (e) {
      myGameArea.key = null;
    });
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
};

// construktor funkcija za pravokutaste elemente
function rectangleComponent(width, height, color, x, y) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;

  // funckija koja updejta pravokutnike
  this.update = function () {
    ctx = myGameArea.context;
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  };
}

// konstruktor funkcija za loptu, osim sto crta loptu takoder pazi na sudare sa ostalim elementima ili rubovima
// kanvasa. Pritom zove odgovarajuce pomocne funkcije. Postavlja pocetni kut loptice i bavi se odbijanjem od palicu
function ballComponent(radius, color, x, y) {
  this.radius = radius;
  this.x = x;
  this.y = y;
  this.update = function () {
    ctx = myGameArea.context;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  };
  this.speedX = ballSpeed;
  this.speedY = ballSpeed;
  this.move = function () {
    this.x += this.speedX;
    this.y += this.speedY;

    for (let i = bricks.length - 1; i >= 0; i--) {
        if (checkCollision(this, bricks[i])) {
          bricks.splice(i, 1);
          currentScore++;
          break;
        }
    }

    if (
      this.x - this.radius <= 0 ||
      this.x + this.radius >= myGameArea.canvas.width
    ) {
      this.speedX *= -1;
    }

    if (this.y - this.radius <= 0) {
      this.speedY *= -1;
    }
    if (this.y + this.radius >= myGameArea.canvas.height) {
      endTheGame("GAME OVER!");
    }

    if (
      this.y + this.radius >= myPaddle.y &&
      this.y - this.radius <= myPaddle.y + myPaddleHeight &&
      this.x + this.radius >= myPaddle.x &&
      this.x - this.radius <= myPaddle.x + myPaddleWidth
    ) {
      this.speedY *= -1;
      this.speedX *= 0.9 + Math.random() * 0.5;
    }
  };

  // funckija za postavljanje pocetnog kuta
  this.initialAngle = function () {
    let angle = Math.floor(Math.random() * 121) + 30;
    let angleInRadians = (angle * Math.PI) / 180;
    this.speedX = Math.cos(angleInRadians);
    this.speedY = -1 * Math.sin(angleInRadians);
    this.speedX *= ballSpeed;
    this.speedY *= ballSpeed;
  };
}

// funckija koja updejta igru te time omogucuje kretanje elemenata
function updateGameArea() {
  myGameArea.clear();
  if (myGameArea.key === "ArrowLeft") {
    myPaddle.moveLeft(paddleSpeed);
  }
  if (myGameArea.key === "ArrowRight") {
    myPaddle.moveRight(paddleSpeed);
  }
  myPaddle.update();
  myBall.update();
  myBall.move();

  bricks.forEach(brick => brick.update());

  let ctx = myGameArea.context;
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText("Score: " + currentScore, myGameArea.canvas.width - 20, 20);
  ctx.fillText("Max Score: " + maxScore, myGameArea.canvas.width - 20, 40);

  if (bricks.length === 0) {
    endTheGame("YOU WON !");
  }
}
