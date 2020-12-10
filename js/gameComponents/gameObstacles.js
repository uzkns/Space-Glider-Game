

function obstacle (width, height, color, x, y, type) {
    this.type = type;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;

    this.update = function(gameArea) {
        ctx = gameArea.context;
        ctx.fillStyle = color;
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

    this.createNewObstacle = function(gameArea, obstacles) {
        y = gameArea.canvas.height;
        x = gameArea.canvas.width;
        
        //select a random height for the gap
        minHeight = 20;
        maxHeight = y - 20;
        height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
        
        //select a random width of the gap
        minGap = 50;
        maxGap = 200;
        gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);

        //create a new obstacle
        obstacles.push(new component(15, height, "green", x, 0));
        obstacles.push(new component(15, y - height - gap, "green", x, height + gap));
    }

    this.moveObstacles = function(obstacles) {
        //move all obstacles to the left (towards x=0)
        for (i = 0; i < obstacles.length; i += 1) {
            obstacles[i].x += -1;
            obstacles[i].update();
        }
    }
}