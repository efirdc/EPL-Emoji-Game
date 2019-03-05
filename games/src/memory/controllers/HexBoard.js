// Primary source for designing this class was https://www.redblobgames.com/grids/hexagons/
// This is using the "offset, odd-r" coordinate system described there

// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

const sqrt3 = Math.sqrt(3);

/* Some viable configurations
this.outerBox = {x: 82, y: 45};
this.innerBox = {x: 43, y: 15};
this.hexSize = 4.2;

this.outerBox = {x: 85, y: 48};
this.innerBox = {x: 42, y: 15};
this.hexSize = 4.95;

this.outerBox = {x: 84, y: 47};
this.innerBox = {x: 43, y: 15};
this.hexSize = 5.8;
*/

// Simple data structure that stores data for a cell
class Cell {
    constructor(row, col, x, y, blobID) {
        this.row = row;
        this.col = col;
        this.x = x;
        this.y = y;

        // The "group" that this cell belongs to
        this.blobID = blobID;
    }
}

export default class HexBoard {
    constructor() {

        // Largest row/column radius the board can have
        // This just needs to be big enough for things to work
        this.maxRadius = 15;

        // Defines where the hex cells should actually be
        // This config has 206 cards
        this.outerBox = {x: 85, y: 48};
        this.innerBox = {x: 42, y: 15};
        this.hexSize = 4.95;

        // contains the Cell objects that are part of the game board.
        // This is initialized during construction and should probably not be modified.
        // All boardCells should have a blobID of -1
        this.boardCells = [];

        // Contains the Cell objects that are part of the "blob"
        // The blob is all the cells that are selected by the flood fill algorithm
        // These cells are copies (not references) of the cells in boardCells.
        // They are ordered in the order that they "flood" into the scene.
        this.blobCells = [];

        this.points = []; // contains {x, y} point objects of every board cell with 2d indices: [row][col]
        this.pointsFlat = []; // contains {x, y} point objects of every board cell in a normal flat array
        this.blobs = []; // contains {row, col, blobID} objects
        this.blobData = []; // contains {{x, y}, blobID} objects
        this.floodChance = 0.7; // Chance for a cell to "flood" in the blob flood fill algorithm

        this.initializeCells();
    }

    getBoardSize() {
        return this.boardCells.length;
    }

    // Calculate position of the center of a hex cell
    getPoint(row, col) {
        var x = this.hexSize * sqrt3 * (col + 0.5 * (row & 1));
        var y = this.hexSize * 3/2 * row;
        return {x:x, y:y};
    }

    // Check if a point is within the outerBox but also outside the innerBox
    pointInBounds(point) {
        var absX = Math.abs(point.x);
        var absY = Math.abs(point.y);
        var inBoundsX = this.innerBox.x < absX && absX < this.outerBox.x && absY < this.outerBox.y;
        var inBoundsY = this.innerBox.y < absY && absY < this.outerBox.y && absX < this.outerBox.x;
        return (inBoundsX || inBoundsY);
    }

    initializeCells() {
        this.boardCells = 0;
        this.size = 0;

        for (var row = -this.maxRadius; row <= this.maxRadius; row++) {
            for (var col = -this.maxRadius; col <= this.maxRadius; col++) {

                let point = this.getPoint(row, col);
                if (!this.pointInBounds(point)) {
                    continue;
                }

                this.size += 1;
                this.boardCells.push(new Cell(row, col, point.x, point.y, -1));
            }
        }
    }



    // Check if a cell is actually part of the game board
    validCell(row, col) {
        for (let cell of this.boardCells) {
            if (row === cell.row && row === cell.col) {
                return true;
            }
        }
        return false;
    }

    // Check if a cell is already a blob
    alreadyBlobbed(row, col) {
        for (let blob of this.blobs) {
            if (blob.row === cell.row && blob.col === cell.col) {
                return true;
            }
        }
        return false;
    }

    // We can blob a cell if it is part of the game board and not yet blobbed
    canBlob(cell) {
        return this.validCell(cell) && !this.alreadyBlobbed(cell);
    }

    // Get all cells adjacent to a cell
    getNeighbors(cell) {

        // Get the local offset of neighboring cells.
        // neighbor directions are different depending on if we are in an even/odd row
        const directions = [
            [[+1,  0], [ 0, -1], [-1, -1],
            [-1,  0], [-1, +1], [ 0, +1]],
            [[+1,  0], [+1, -1], [ 0, -1],
            [-1,  0], [ 0, +1], [+1, +1]],
        ];
        var parity = cell.row & 1;
        var localNeighbors = directions[parity];

        // Convert the local neighbors to their board position by adding the row/col of the center cell
        var neighbors = [];
        for (let i = 0; i < 6; i++) {
            var localNeighbor = localNeighbors[i];
            neighbors.push({
                row: cell.row + localNeighbor[1],
                col: cell.col + localNeighbor[0],
            });
        }
        return neighbors;
    }

    // Gets the cells that we can blob on the next blob iteration.
    getBlobbableNeighbors() {

        // Get all neighbors to the current blobs and attach the blobIds to them
        var blobs = [];
        var canBlobFilter = (cell) => (this.canBlob(cell));
        for (let blob of this.blobs) {
            let neighbors = this.getNeighbors(blob);
            neighbors = neighbors.filter(canBlobFilter);
            neighbors = neighbors.map((cell) => ({...cell, id: blob.id}));
            blobs = blobs.concat(neighbors);
        }

        // Remove duplicates
        var noDuplicates = [];
        var numBlobs = blobs.length;
        for (let i = 0; i < numBlobs; i++) {
            let blob = blobs.pop();
            let isDuplicate = false;
            for (let cmpBlob of blobs) {
                if (blob.col === cmpBlob.col && blob.row === cmpBlob.row) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                noDuplicates.push(blob);
            }
        }
        return noDuplicates;
    }

    initializeBlob(numCells) {
        this.blobCells = [];

        // calculate how many origins the blob fill algorithm can have
        var blobStarts = Math.max(1, Math.floor(numCells / 20));
        blobStarts = Math.min(blobStarts, 5);


    }

    // Get a random cell from the gameBoard.
    getRandomCell() {
        let cellIndex = Math.floor(Math.random() * this.boardCells.length);
        return this.boardCells[cellIndex];
    }

    getRandomCells(numRandomCells) {

        let cells = [this.getRandomCell()];
        numRandomCells -= 1;

        let searchDepth = 10;
        for (let i = 0; i < numRandomCells; i++) {


            let bestCell = this.getRandomCell();
            let distance = cells.reduce((accum, cell) => {
                let deltaX = bestCell.x - cell.x;
                let deltaY = bestCell.y - cell.y;
                return accum + Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            });

            for (let j = 0; j < searchDepth; j++) {
                let mightBeABetterCell = this.getRandomCell();

            }
        }
    }

    // reset the blobs and distribute new ones using flood fill
    distributeBlobs(numBlobs) {

        // Reset the blobs and blob data
        this.blobs = [];
        this.blobData = [];

        // calculate how many origins the blob fill algorithm can have
        var blobStarts = Math.max(1, Math.floor(numBlobs / 20));
        blobStarts = Math.min(blobStarts, 5);

        // choose the starting positions
        for (let i = 0; i < blobStarts; i++) {
            var cell = this.randCell();
            while (!this.canBlob(cell)) {
                cell = this.randCell();
            }
            var blob = {...cell, id: i};
            this.blobs.push(blob);
        }
        numBlobs -= blobStarts;

        // flood from the starting positions until we run out of blobs
        while(numBlobs > 0) {
            var blobs = this.getBlobbableNeighbors();
            blobs = blobs.filter(() => (Math.random() < this.floodChance));
            shuffle(blobs);
            while(numBlobs > 0 && blobs.length > 0) {
                var newBlob = blobs.pop();
                if (!this.canBlob(newBlob)) {
                    console.log("ERROR: Blobbing a blob that was already blobbed.");
                }
                this.blobs.push(newBlob);
                numBlobs -= 1;
            }
        }

        // store the point and ID of each blob so we can use it to position the game elements.
        this.blobData = this.blobs.map((blob) => ({
            point: this.points[blob.row][blob.col],
            blobID: blob.id,
        }));
    }
}
