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
this.outerBounds = {x: 82, y: 45};
this.innerBounds = {x: 43, y: 15};
this.hexSize = 4.2;

this.outerBounds = {x: 85, y: 48};
this.innerBounds = {x: 42, y: 15};
this.hexSize = 4.95;

this.outerBounds = {x: 84, y: 47};
this.innerBounds = {x: 43, y: 15};
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
        // These just need to be big enough for things to work
        this.maxColumn = 13;
        this.maxRow = 7;

        // Defines where the hex cells should actually be
        // This config has 206 cards
        this.outerBounds = {x: 85, y: 48};
        this.innerBounds = {x: 42, y: 15};
        this.hexSize = 4.95;
        this.boardCellOverrides = [
            //[-2, -2], [-2, -3], [-2, -4],
            //[-2,  2], [-2,  3], [-2,  4],
            //[ 2, -2], [ 2, -3], [ 2, -4],
            //[ 2,  2], [ 2,  3], [ 2,  4],
        ];
        this.innerCellOverrides = [
            [0, -5], [0,  5]
        ];
        this.outerCellOverrides = [

        ];

        // contains the Cell objects that are part of the game board.
        // This is initialized during construction and should probably not be modified.
        // All boardCells should have a blobID of -1
        this.boardCells = [];

        // Contains the same cells as boardCells but in a multidimensional array.
        // They are indexable at their [row][col]
        this.boardCellsRC = [];

        // These arrays hold the cells that are inside the innerBound and outside the outerBounds
        // These are not part of the playable game area, but we may want to draw some visual components at these points
        this.innerCells = [];
        this.outerCells = [];

        // These arrays hold the cells that are part of innerCells and outerCells, but with the extra condition that
        // they must be adjacent to cells that are part of the boardCells.
        this.adjacentInnerCells = [];
        this.adjacentOuterCells = [];

        //
        this.cornerCells = [[0, -5], [-2, -4], [-2,  4], [0,  5], [ 2,  4], [ 2, -4]];
        this.cornerCellCenters = [];

        // Contains the Cell objects that are part of the "blob"
        // The blob is all the cells that are selected by the flood fill algorithm
        // These cells are copies (not references) of the cells in boardCells.
        // They are ordered in the order that they "flood" into the scene.
        // The data in these cells can be used to spawn the game objects.
        this.blobCells = [];

        // Chance for a cell to "flood" in the blob flood fill algorithm
        this.floodChance = 0.5;

        // Initialize all cells
        this.initializeCells();
    }

    // MAIN FUNCTIONS - these two do most of the heavy lifting

    // Initializes all cell arrays
    initializeCells() {

        // Reset all the cell arrays
        this.boardCells = [];
        this.boardCellsRC = [];
        this.outerCells = [];
        this.innerCells = [];
        this.adjacentInnerCells = [];
        this.adjacentOuterCells = [];

        // Iterate through all the row/column pairs within the maxRadius
        for (let row = -this.maxRow; row <= this.maxRow; row++) {
            this.boardCellsRC[row] = [];
            for (let col = -this.maxColumn; col <= this.maxColumn; col++) {

                // Create the cell at this row/col
                let point = this.getPoint(row, col);
                let newCell = new Cell(row, col, point.x, point.y, -1);

                let innerOverride = this.isOverrideCell(row, col, this.innerCellOverrides);
                let boardOverride = this.isOverrideCell(row, col, this.boardCellOverrides);
                let outerOverride = this.isOverrideCell(row, col, this.outerCellOverrides);

                // If it is within the inner bounds, then it belongs to the innerCells
                if ((this.pointInBounds(point, this.innerBounds) || innerOverride) && !boardOverride) {
                    this.innerCells.push(newCell);
                }
                // If it is outside the inner bounds, but inside the outer bounds, then it belongs to the boardCells
                else if ((this.pointInBounds(point, this.outerBounds) || boardOverride) && !outerOverride) {
                    this.boardCells.push(newCell);
                    this.boardCellsRC[row][col] = newCell;
                }

                // If it is outside the outer bounds, then it belongs to the outerCells
                else {
                    this.outerCells.push(newCell);
                }
            }
        }

        // Find the cells from the innerCells and outerCells that are adjacent to the boardCells.
        for (let innerCell of this.innerCells) {
            if (this.adjacentToBoardCells(innerCell)) {
                this.adjacentInnerCells.push(innerCell);
            }
        }
        for (let outerCell of this.outerCells) {
            if (this.adjacentToBoardCells(outerCell)) {
                this.adjacentOuterCells.push(outerCell);
            }
        }

        this.cornerCellCenters = this.cornerCells.map(([row, col]) => this.getPoint(row, col));
    }

    // initializes the blobCells
    initializeBlob(numCells, numBlobs) {

        // Reset the blob
        this.blobCells = [];

        // Get random distant cells from the gameBoard
        let startCells = this.getRandomDistantCells(numBlobs);

        // Create a shuffled array of blobIDs
        let blobIDs = [0, 1, 2, 3, 4];
        shuffle(blobIDs);

        // Use these cells to seed the blob
        for (let i in startCells) {
            // Get a random blobID for this cell
            let blobID = blobIDs.pop();

            // Set the blobID on the cell and add it to the blob
            let startCell = startCells[i];
            let seedCell = new Cell(startCell.row, startCell.col, startCell.x, startCell.y, blobID);
            this.blobCells.push(seedCell);
        }

        // We added numBlobs cells so far, so subtract them from the total we need to add.
        numCells -= numBlobs;

        // Flood out from these seed cells until all cells are distributed.
        while (numCells > 0) {

            // Gets all the cells that we could flood to on this iteration
            let potentialBlobs = this.getPotentialBlobs();

            // Filter out some of them randomly. Gives a more irregular shape to the blobs
            let willBlob = potentialBlobs.filter(() => (Math.random() < this.floodChance));

            // Shuffle the cells we will add to the blob, so there is less direction bias in their spawning order
            shuffle(willBlob);

            // Add them to the blob
            while (numCells > 0 && willBlob.length > 0) {
                this.blobCells.push(willBlob.pop());
                numCells -= 1;
            }
        }

        // Actually lets group the blobCells by blobID because it looks cooler
        const maxBlobs = 5;
        let blobIdGroups = [];
        for (let i = 0; i < maxBlobs; i++) {
            let blobIdGroup = this.blobCells.filter((blobCell) => (blobCell.blobID === i));
            blobIdGroups.push(blobIdGroup);
        }
        shuffle(blobIdGroups);
        this.blobCells = [];
        for (let group of blobIdGroups) {
            this.blobCells = this.blobCells.concat(group);
        }
    }

    // UTILITY FUNCTIONS - These are used by the initialization functions

    // Calculate position of the center of a hex cell
    getPoint(row, col) {
        var x = this.hexSize * sqrt3 * (col + 0.5 * (row & 1));
        var y = this.hexSize * 3 / 2 * row;
        return {x: x, y: y};
    }

    // Returns true if a point is within the {x, y} boundary
    // The point is within the boundary if its absolute value is less than the boundary.
    pointInBounds(point, boundary) {
        return Math.abs(point.x) < boundary.x && Math.abs(point.y) < boundary.y;
    }

    isOverrideCell(row, col, overrides) {
        for (let [rowException, colException] of overrides) {

            if (row === rowException && col === colException) {
                return true;
            }
        }
        return false;
    }

    // Returns true if the given cell is adjacent to the boardCells and false otherwise
    adjacentToBoardCells(cell) {
        let neighbors = this.getNeighbors(cell);
        for (let neighbor of neighbors) {
            if (neighbor.row in this.boardCellsRC && neighbor.col in this.boardCellsRC[neighbor.row]) {
                return true;
            }
        }
        return false;
    }

    // Get a random cell from the boardCells.
    getRandomCell() {
        let cellIndex = Math.floor(Math.random() * this.boardCells.length);
        return this.boardCells[cellIndex];
    }

    // Gets a number of random cells from the boardCells that are reasonably far away from each other.
    getRandomDistantCells(numRandomCells) {

        // First cell can be any random cell
        let distantCells = [this.getRandomCell()];
        numRandomCells -= 1;

        // For the rest, get $searchDepth random cells and then pick the one that is furthest away from the distantCells picked so far
        // The "furthest" cell is the one that has the largest min(distancesToAllCells)
        const searchDepth = 50;
        for (let i = 0; i < numRandomCells; i++) {
            let furthestCell = this.getRandomCell();
            let smallestDistance = this.getSmallestDistance(furthestCell, distantCells);
            for (let j = 0; j < searchDepth; j++) {
                let maybeMoreDistantCell = this.getRandomCell();
                let maybeLargerSmallestDistance = this.getSmallestDistance(maybeMoreDistantCell, distantCells);
                if (maybeLargerSmallestDistance > smallestDistance) {
                    furthestCell = maybeMoreDistantCell;
                    smallestDistance = maybeLargerSmallestDistance;
                }
            }
            distantCells.push(furthestCell);
        }
        return distantCells;
    }

    // Calculates the distances from one cell to an array of cells, then returns the smallest distance.
    getSmallestDistance(fromCell, toCells) {
        let smallestDistance = Infinity;
        for (let toCell of toCells) {
            let deltaX = fromCell.x - toCell.x;
            let deltaY = fromCell.y - toCell.y;
            let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            smallestDistance = Math.min(smallestDistance, distance);
        }
        return smallestDistance;
    }

    // Returns an array of {row, col} objects that neighbor the given cell
    getNeighbors(cell) {

        // Get the local directions of neighboring cells.
        // neighbor directions are different depending on if we are in an even/odd row
        // these are in [col, row] order instead of [row, col] for some reason
        const directions = [
            [[+1, 0], [0, -1], [-1, -1],
            [-1, 0], [-1, +1], [0, +1]],
            [[+1, 0], [+1, -1], [0, -1],
            [-1, 0], [0, +1], [+1, +1]],
        ];
        let parity = cell.row & 1;
        let neighborDirections = directions[parity];

        // Get the neighbor positions in board coordinates.
        let neighbors = [];
        for (let [colDir, rowDir] of neighborDirections) {
            let row = cell.row + rowDir;
            let col = cell.col + colDir;
            neighbors.push({row: row, col: col});
        }
        return neighbors;
    }

    // Gets an array of the blobIDs of the blobCells adjacent to the given cell
    getNeighborBlobIDs(cell) {
        // Check if any neighbors are part of the blobCells
        // If they are, store the cells blobID in neighborBlobIDs
        let neighbors = this.getNeighbors(cell);
        let neighborBlobIDs = [];
        for (let neighbor of neighbors) {
            for (let blobCell of this.blobCells) {
                if (blobCell.row === neighbor.row && blobCell.col === neighbor.col) {
                    neighborBlobIDs.push(blobCell.blobID);
                }
            }
        }
        return neighborBlobIDs;
    }

    // gets an array of cells that can be added to the blobCells
    getPotentialBlobs() {

        // Iterate through all of the boardCells and figure out which ones we can flood to
        let blobbableCells = [];
        for (let boardCell of this.boardCells) {

            // Skip board cells that are already in the blob
            if (this.inBlob(boardCell.row, boardCell.col)) {
                continue;
            }

            // Skip cells that have no neighboring blobbed cells
            let neighborBlobIDs = this.getNeighborBlobIDs(boardCell);
            if (neighborBlobIDs.length === 0) {
                continue;
            }

            // If it has neighboring blobbed cells, then choose one of their blobIDs at random
            let randomIndex = Math.floor(Math.random() * neighborBlobIDs.length);
            let randomBlobID = neighborBlobIDs[randomIndex];

            // Create the blobbable cell by copying the fields of the board cell, but also give it the randomly chosen ID
            let blobbableCell = new Cell(boardCell.row, boardCell.col, boardCell.x, boardCell.y, randomBlobID);
            blobbableCells.push(blobbableCell);
        }
        return blobbableCells;
    }

    // Check if a cell with row, col is in the blobCells using a sequential search
    inBlob(row, col) {
        for (let blobCell of this.blobCells) {
            if (blobCell.row === row && blobCell.col === col) {
                return true;
            }
        }
        return false;
    }
}
