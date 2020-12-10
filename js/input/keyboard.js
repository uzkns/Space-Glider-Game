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