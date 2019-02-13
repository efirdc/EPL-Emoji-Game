
// Constructor for the Card class
function Card (cardID, faceUp, row, col) {
    this.cardID = cardID;
    this.faceUp = faceUp;
    this.row = row;
    this.col = col;
    this.matched = false;
}

// Constructor for the GameState class
// Consider this class the data "Model" in the Model-View-Controller (MVC) programming pattern
// The only responsibility of this class is to hold all the data for the memory game
// The View should be able to display all game information just from reading this class
function GameState (rows, columns, flips) {

    this.rows = rows;
    this.columns = columns;
    this.size = rows * columns;
    this.initialFlips = flips;
    this.flipsLeft = flips;
    this.currentLevel = 0;
    this.board = [];
    this.flipped = [];
    this.len = rows * columns;

    // populate the board with face down cards that have ID 0
    for (var row = 0; row < rows; row++) {
        this.board[row] = [];
        for (var col = 0; col < columns; col++) {
            this.board[row][col] = new Card(0, false, row, col);
        }
    }
}

module.exports = GameState;