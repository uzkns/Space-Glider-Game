// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
//
// Variables
//
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

// The user-controllable ship
var myGamePiece;

// Holds all obstacles, new obstacles will be added to the end of the array
var myObstacles = [];

// The score text
var myScore;

// The debug text
var debugText;

// The background Image()
var backgroundImage;

// Turns collision detection off and adds debug text to the screen
// Can be toggeled via settings modal
var _DEBUG = false;





// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
//
//  Procedures (menu interaction, controls, game loop, helper methods)
//
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --


// This is called when the body loads (html onload) and when the ship crashes with another object (game over)
// When the score parameter is null, the score will not be displayed.
function initalizeGame(score) {
    // Reset all values (this is needed when re-starting the game after a game over)
    // clear main game loop
    // The obstacles will not be reset so that the user can still see them behind the modal after a game over
    clearInterval(myGameArea.updateInterval);
    myScore = null;
    myGamePiece = null;
    debugText = null;
    backgroundImage = null;

    backgroundImage = new Image();
    backgroundImage.src = "./res/bg/bg2.png";
    background.start();    

    myScore = new text ("30px", "Courier New", "black", 20, 40);
    debugText = new text ("15px", "Courier New", "red", 20, 70);
    
    // Preselect motion controls, when possible
    // This can be changed later in the settings modal
    if ("ontouchstart" in document.documentElement) {
        $("#button-motion").addClass("active");
    } else {
        $("#button-keyboard").addClass("active");
    }

    // Render score and make modal visible
    $(document).ready(function() {
        if (score != null) {
            $("#score").empty();
            $("#score").append("<h3>Your score was: " + score + "</h3>")
            $("#score").append("<br>");
        }
        
        $("#gameMenu").modal('show');
    });
}

// Parse settings, create the ship and start the main game loop (myGameArea.start())
// This is called via onclick in index.html:44
function startGame() {
    if ($("#button-motion").hasClass("active")) {
        registerMotionControls();
        registerKeyboard();
    } else {
        registerKeyboard();
    }

    if ($("#debug").prop("checked")) {
        _DEBUG = true;
        alert("Debug mode is ON!");
    } else {
        _DEBUG = false;
    }

    $("#gameMenu").modal('hide');

    // reset obstacles
    myObstacles = [];

    // create ship
    var xposition = $(window).width() / 2;
    var yposition = $(window).height() / 2;
    myGamePiece = new ship (width=24, height=16, x=xposition, y=yposition);

    background.start();
    myGameArea.start();
}

// The main game loop, called every interval
// This moves and redraws all game elements, creates new obstacles and checks for collisions
function updateGameArea() {
    var x, y, height, gap, minHeight, maxHeight, minGap, maxGap;

    // check if the player has crashed with any obstacles
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            initalizeGame(Math.floor(myGameArea.frameNo / 100));
        } 
    }
    myGameArea.clear();
    myGameArea.frameNo += 1;

    // every 300ms, create a new obstacle
    if (myGameArea.frameNo == 1 || everyinterval(300)) {
        y = myGameArea.canvas.height;
        x = myGameArea.canvas.width;
        
        // select a random height for the gap
        minHeight = 20;
        maxHeight = y - 200;
        height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
        
        // select a random size of the gap
        minGap = 50;
        maxGap = 200;
        gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);

        // create a new obstacle for above and below the gap
        myObstacles.push(new obstacle(45, height, x, 0));
        myObstacles.push(new obstacle(45, y - height - gap, x, height + gap));
    }

    
    // every 50ms, change the direction of the ship (up/down)
    // The ship will slowly move in that direction by itself (see. moveGravity() )
    if (everyinterval(50) && myGamePiece.controlled == false) {
        myGamePiece.gravity = - (myGamePiece.gravity);
    }

    // redraw everything
    for (i = 0; i < myObstacles.length; i += 1) {
        // move all obstacles to the left (towards x=0)
        myObstacles[i].x += -1;
        myObstacles[i].redraw();
    }
    myScore.text = "SCORE: " + Math.floor(myGameArea.frameNo / 100);
    myScore.redraw();
    myGamePiece.gravityMove();
    myGamePiece.redraw();
}

// register hooks for the keyboard (Arrow up / Arrow down / ESC)
function registerKeyboard() {
    window.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) {
            return;
        }

        switch (event.key) {
          case "Down":
          case "ArrowDown":
              for (i = 0; i < 5; i++) {
                  myGamePiece.move(1);
              }
              break;
          case "Up":
          case "ArrowUp":
              for (i = 0; i < 5; i++) {
                  myGamePiece.move(-1);
              }
              break;
          case "Esc":
          case "Escape":
              // End game with score 0
              initalizeGame(0);
              break;
          default:
              return; // do nothing when any other key has been pressed.
        }
      
        // Cancel the default action to avoid it being handled twice
        event.preventDefault();
    }, true);
}

// register and calibrate motion controls
function registerMotionControls() {
    straight = null;

    // Register event handler
    window.ondevicemotion = function(event) {
        //we are only interested in the y motion
        var ymotion = event.accelerationIncludingGravity.y;

        if (straight == null) {
            //set the initial sensor position as the "straight" position (where the ship doesnt move)
            straight = ymotion;
        } else {
            if (_DEBUG) {
              // display debug text when it is selected in settings
                debugText.text = "Y: " + Math.floor(ymotion - straight);
                debugText.update();
            }

            // move ship up / down
            if (Math.floor(ymotion - straight) < 0) {
                myGamePiece.move(-1);
            } else if (Math.floor(ymotion - straight) > 0) {
                myGamePiece.move(1);
            }
        }       
    }
}

// returns true every n milli-seconds
function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}





// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
//
// Data structures (background, game area, ship, obstacles, text)
//
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --


// The background image
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
        //this.startResizeHandler();
    },

    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
    },

    // Starts the resize handler that redraws the background on every size change
    startResizeHandler : function() {
        $(window).resize(this.start());
    }
}


// The game area on which the obstacles and ship will be drawn
var myGameArea = {
    canvas : document.createElement("canvas"),

    // -- -- -- -- -- -- -- -- -- -- 

    // initialize game canvas and add it to DOM
    start : function() {
        this.canvas.width = $(window).width();
        this.canvas.height = $(window).height();
        this.canvas.id = "gameArea";
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;

        var nav = document.getElementById("div1");
        nav.appendChild(this.canvas);

        // Set game loop every 30ms
        this.updateInterval = setInterval(updateGameArea, 07);
    },

    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}


// The user-controllable ship
function ship (width, height, x, y) {
    this.width = width;
    this.height = height;    
    this.x = x;
    this.y = y;
    this.gravity = 0.25;
    this.controlled = false;

    // -- -- -- -- -- -- -- -- -- -- 

    //positive n moves down, negative n moves up
    this.move = function(n) {  
        this.controlled = true; 
        if (this.y < 1) {
            this.y = 0;
        } else if (this.y > (myGameArea.canvas.height - this.height)) {
            this.y = myGameArea.canvas.height - this.height;
        } else {
            this.y = this.y + n;
        }
        this.controlled = false;
    }

    // Draw the ship image at the x,y coordinates
    this.redraw = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = "white";
        var image = new Image();
        image.src = "./res/ship.png";
        ctx.drawImage(image, this.x, this.y);
    }

    // Move the ship up or down by itself
    // This makes the game more challenging
    this.gravityMove = function() {
        this.move(this.gravity);
    }

    // Crash with another object
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
            // In debug mode, never crash
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


// Obstacle with which the ship can collide
function obstacle (width, height, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;

    // -- -- -- -- -- -- -- -- -- -- 

    //Draw the obstacle at x,y coordinates
    this.redraw = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = "#58777D";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}


// Text object
function text (width, height, color, x, y) {
    this.text = "";
    this.score = 0;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;

    // -- -- -- -- -- -- -- -- -- -- 

    //Draw the text at x,y coordinates
    this.redraw = function() {
        ctx = myGameArea.context;
        ctx.font = this.width + " " + this.height;
        ctx.fillStyle = color;
        ctx.fillText(this.text, this.x, this.y);
    }
}