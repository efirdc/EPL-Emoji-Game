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

        // The "blobs" are cells that we will put cards

        this.size = 0;  // number of hex cells in the board
        this.points = []; // contains {x, y} point objects of every board cell with 2d indices: [row][col]
        this.pointsFlat = []; // contains {x, y} point objects of every board cell in a normal flat array
        this.blobs = []; // contains {row, col, blobID} objects
        this.blobData = []; // contains {{x, y}, blobID} objects
        this.floodChance = 0.7; // Chance for a cell to "flood" in the blob flood fill algorithm

        this.initializePoints();
    }

    // Calculate position of the center of a hex cell
    getPoint(row, col) {
        var x = this.hexSize * sqrt3 * (col + 0.5 * (row & 1));
        var y = this.hexSize * 3/2 * row;
        return {x:x, y:y};
    }

    // Check if a point is within the outerBox and outside the innerBox
    pointInBounds(point) {
        var absX = Math.abs(point.x);
        var absY = Math.abs(point.y);
        var inBoundsX = this.innerBox.x < absX && absX < this.outerBox.x && absY < this.outerBox.y;
        var inBoundsY = this.innerBox.y < absY && absY < this.outerBox.y && absX < this.outerBox.x;
        return (inBoundsX || inBoundsY)
    }

    initializePoints() {

        // Reset the points and board size
        this.points = [];
        this.size =  0;

        // Check all hex cells within this.maxRadius
        for (var row = -this.maxRadius; row <= this.maxRadius; row++) {
            this.points[row] = [];
            for (var col = -this.maxRadius; col <= this.maxRadius; col++) {

                // Test if the hex cell is within the board region
                var point = this.getPoint(row, col);
                if(!this.pointInBounds(point)) {
                    continue;
                }

                // If it is, add it to the board points.
                this.size += 1;
                this.points[row][col] = point;
                this.pointsFlat.push(point);
            }
        }
    }

    // Get a random cell within the board maxRadius
    randCell() {
        return {
            row: Math.floor(Math.random() * 2 * this.maxRadius) - this.maxRadius,
            col: Math.floor(Math.random() * 2 * this.maxRadius) - this.maxRadius,
        };
    }

    // Check if a cell is actually part of the game board
    validCell(cell) {
        return cell.row in this.points && cell.col in this.points[cell.row];
    }

    // Check if a cell is already a blob
    alreadyBlobbed(cell) {
        for (let blobNum in this.blobs) {
            let blob = this.blobs[blobNum];
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
        const directions = [
            [[+1,  0], [ 0, -1], [-1, -1],
            [-1,  0], [-1, +1], [ 0, +1]],
            [[+1,  0], [+1, -1], [ 0, -1],
            [-1,  0], [ 0, +1], [+1, +1]],
        ];
        var parity = cell.row & 1;
        var localNeighbors = directions[parity];
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
