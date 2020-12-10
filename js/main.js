var myGamePiece;
var myObstacles = [];
var myScore;
var debugText;
var backgroundImage;

var _DEBUG = true;

function initalizeGame() {
  var xposition = $(window).width() / 2;
  var yposition = $(window).height() / 2;

  myGamePiece = new ship (width=24, height=16, x=xposition, y=yposition);
  myGamePiece.gravity = 0.00;
  myScore = new text ("30px", "Courier New", "black", 20, 40);

  debugText = new text ("15px", "Courier New", "red", 20, 70);

  backgroundImage = new Image();
  backgroundImage.src = "./res/bg/bg2.png";
  background.start();
  $("#gameMenu").modal("show");
  $('#gameMenu').on('shown.bs.modal', function (e) {
    console.log("modal active");
  });
  //myGameArea.start();
}

var background = {
  canvas : document.createElement("canvas"),

  start : function() {
    this.canvas.width = $(window).width();
    this.canvas.height = $(window).height();
    this.canvas.id = "background";
    var nav = document.getElementById("div1");
    nav.appendChild(this.canvas);
    
    this.context = this.canvas.getContext("2d");
    this.context.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height);  
  },

  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
  }
}

var myGameArea = {
    canvas : document.createElement("canvas"),

    start : function() {
        this.canvas.width = $(window).width();
        this.canvas.height = $(window).height();
        this.canvas.id = "gameArea";
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;

        var nav = document.getElementById("div1");
        nav.appendChild(this.canvas);

        registerKeyboard();
        //registerMotionControls();
        //this.motionInterval = setInterval(updateMotion, 30);
        this.updateInterval = setInterval(updateGameArea, 30);
    },

    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}


function registerKeyboard() {
  window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
      return;
    }

    switch (event.key) {
      case "Down":
      case "ArrowDown":
        //move the game piece down by increasing its y offset
        for (i = 0; i < 5; i++) {
          myGamePiece.y += 1;
        }
        break;
      case "Up":
      case "ArrowUp":
        //move the game piece up by decreasing its y offset
        for (i = 0; i < 5; i++) {
          myGamePiece.y -= 1;
        }
        break;
      case "Esc":
      case "Escape":
        // Do something for "ESC" key press.
        myGamePiece.y -= 5;
        break;
      default:
        return; // do nothing when this doesn't handle the key event.
    }
  
    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
  }, true);
}

function registerMotionControls() {

      straight = "UNDEFINED";

      window.ondevicemotion = function(event) {
          var xmotion = event.accelerationIncludingGravity.x;
          var ymotion = event.accelerationIncludingGravity.y;
          var zmotion = event.accelerationIncludingGravity.z;

          if (straight == "UNDEFINED") {
              //set the initial sensor position as the "straight" position (the ship should not move)
              straight = ymotion;
          } else {
              //debugText.text = "X: " + xmotion;
              debugText.text = "Y: " + Math.floor(ymotion - straight);
              //debugText.text = "Z: " + zmotion;
              debugText.update();

              if (Math.floor(ymotion - straight) < 0) {
                  myGamePiece.y -= 1;
              } else if (Math.floor(ymotion - straight) > 0) {
                  myGamePiece.y += 1;
              }
          }       
      }
}

function updateGameArea() {
    var x, y, height, gap, minHeight, maxHeight, minGap, maxGap;

    //check if the player has crashed with any obstacles
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            return;
        } 
    }
    myGameArea.clear();
    myGameArea.frameNo += 1;

    //every 300ms, create a new obstacle
    if (myGameArea.frameNo == 1 || everyinterval(300)) {
        y = myGameArea.canvas.height;
        x = myGameArea.canvas.width;
        
        //select a random height for the gap
        minHeight = 20;
        maxHeight = y - 200;
        height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
        
        //select a random size of the gap
        minGap = 50;
        maxGap = 200;
        gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);

        //create a new obstacle for above and below the gap
        myObstacles.push(new obstacle(45, height, x, 0));
        myObstacles.push(new obstacle(45, y - height - gap, x, height + gap));
    }

    //move all obstacles to the left (towards x=0)
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }


    myScore.text = "SCORE: " + myGameArea.frameNo;
    myScore.update();
    myGamePiece.newPos();
    myGamePiece.update();
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

function accelerate(n) {
    myGamePiece.gravity = n;
}





// window.addEventListener("deviceorientation", function(event) {
// 	document.querySelector("#mag_alpha").innerHTML = "alpha = " + event.alpha;
// 	document.querySelector("#mag_beta").innerHTML = "beta = " + event.beta;
// 	document.querySelector("#mag_gamma").innerHTML = "gamma = " + event.gamma;
// }, true);



//data structures


function ship (width, height, x, y) {
  this.width = width;
  this.height = height;
  this.speedX = 0;
  this.speedY = 0;    
  this.x = x;
  this.y = y;
  this.gravity = 100;
  this.gravitySpeed = 0.3;

  this.update = function() {
      ctx = myGameArea.context;
      ctx.fillStyle = "white";
      var image = new Image();
      image.src = "./res/ship.png";
      ctx.drawImage(image, this.x, this.y);
  }

  this.newPos = function() {
      this.gravitySpeed += this.gravity;
      this.x += this.speedX;
      this.y += this.speedY + this.gravitySpeed;
      this.hitBottom();
  }

  this.hitBottom = function() {
      var rockbottom = myGameArea.canvas.height - this.height;
      if (this.y > rockbottom) {
          this.y = rockbottom;
          this.gravitySpeed = 0;
      }
  }

  this.crashWith = function(otherobj) {
      var myleft = this.x;
      var myright = this.x + (this.width);
      var mytop = this.y;
      var mybottom = this.y + (this.height);
      var otherleft = otherobj.x;
      var otherright = otherobj.x + (otherobj.width);
      var othertop = otherobj.y;
      var otherbottom = otherobj.y + (otherobj.height);

      if (_DEBUG == true) {
          var crash = false;
      } else {

      var crash = true;
      }

      if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
          crash = false;
      }
      return crash;
  }
}


function obstacle (width, height, x, y) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;

  this.update = function() {
      ctx = myGameArea.context;
      ctx.fillStyle = "#58777D";
      ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  this.crashWith = function(otherobj) {
      var myleft = this.x;
      var myright = this.x + (this.width);
      var mytop = this.y;
      var mybottom = this.y + (this.height);
      var otherleft = otherobj.x;
      var otherright = otherobj.x + (otherobj.width);
      var othertop = otherobj.y;
      var otherbottom = otherobj.y + (otherobj.height);
      var crash = true;
      if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
          crash = false;
      }
      return crash;
  }
}


function text (width, height, color, x, y) {
  this.text = "";
  this.score = 0;
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;

  this.update = function() {
      ctx = myGameArea.context;
      ctx.font = this.width + " " + this.height;
      ctx.fillStyle = color;
      ctx.fillText(this.text, this.x, this.y);
  }
}