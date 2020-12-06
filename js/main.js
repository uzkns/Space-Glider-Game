var myGamePiece;
var myObstacles = [];
var myScore;

function initalizeGame() {
  var yposition = $(window).width() / 2;
  var xposition = $(window).height() / 2;

  myGamePiece = new component(30, 30, "black", 10, xposition);
  myGamePiece.gravity = 0.00;
  myScore = new component("30px", "Consolas", "black", 280, 40, "text");
  myGameArea.start();
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = $(window).width();
        this.canvas.height = $(window).height() - 3;
        this.context = this.canvas.getContext("2d");
        var nav = document.getElementById("body1")
        insertAfter(this.canvas, nav);
        this.frameNo = 0;
        registerKeyboard();
        this.interval = setInterval(updateGameArea, 30);
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
        // Do something for "esc" key press.
        myGamePiece.y -= 5;
        break;
      default:
        return; // Quit when this doesn't handle the key event.
    }
  
    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
  }, true);
}

function component(width, height, color, x, y, type) {
    this.type = type;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;
    this.gravity = 0;
    this.gravitySpeed = 0;
    this.update = function() {
        ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
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
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}

function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;

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
        maxHeight = y - 20;
        height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
        
        //select a random width of the gap
        minGap = 50;
        maxGap = 200;
        gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);

        //create a new obstacle
        myObstacles.push(new component(15, height, "green", x, 0));
        myObstacles.push(new component(15, y - height - gap, "green", x, height + gap));
    }

    //move all obstacles to the left (towards the player)
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }

    myScore.text="SCORE: " + myGameArea.frameNo;
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

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}