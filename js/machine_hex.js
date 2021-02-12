const DIR_UR = 1,
    DIR_R = 2,
    DIR_DR = 3,
    DIR_DL = 4,
    DIR_L = 5,
    DIR_UL = 6;



const DIRS_HEX = [
    { x: 0, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
];

// How it bounces.
const EDGE_BOUNCE = {
    'left': [DIR_NONE, DIR_R, DIR_R, DIR_DR, DIR_DL, DIR_DL, DIR_DR],
    'center': [DIR_NONE, DIR_DR, DIR_R, DIR_DR, DIR_DL, DIR_L, DIR_DL],
    'right': [DIR_NONE, DIR_DL, DIR_DR, DIR_DR, DIR_DL, DIR_L, DIR_L],
}

class CellMachineHex extends CellMachine {
    constructor(size) {
        super(size);
        this.dirs = DIRS_HEX;
        this.turnNormal = 5;
        this.turnOpposite = 3;
    }

    updateSize(size) {
        if (size == this.size) {
            return false;
        }
        this.size = size;
        this.distanceToCenter = size - 1;
        this.maxPerRow = size + this.distanceToCenter;
        // 1 + 6 * (factorial)
        this.maxIndex = 1 + ((size - 1) * size / 2) * 6;
        // How many rows.
        this.rows = Array(this.maxPerRow);
        let midRow = Math.floor(this.maxPerRow / 2);
        // Make the rows which we can use for coord calculations.
        // Our hex shape uses X/Y as a base.
        for (var i = 0; i < this.maxPerRow; i++) {
            if (i <= midRow) {
                this.rows[i] = { width: size + i, offset: 0 };
            } else {
                let offset = (i - midRow)
                this.rows[i] = { width: size + midRow - offset, offset: offset };
            }
        }
        // With the row information, generate index to coord lookups.
        this.generateCoordinates();

        // Current state.
        this.grid = Array(this.maxIndex).fill(0);
        // Future state.
        this.gridBuffer = Array(this.maxIndex).fill(0);
        // Bounces.
        this.bounces = [];

        this.grid[3] = 3;
        return true;
    }

    /**
     * Generate hex to XY and index coordinate system, to easily go from index to coord and vice versa.
     */
    generateCoordinates() {
        this.indexToCoords = [];
        this.coordsToIndex = {};
        let maxVal = this.maxPerRow - 1;
        for (var y = 0; y < this.maxPerRow; y++) {
            let row = this.rows[y];
            for (var x = 0; x < row.width; x++) {
                this.coordsToIndex[(x + row.offset) + ',' + y] = this.indexToCoords.length;
                let coord = {
                    x: x + row.offset,
                    y: y,
                    edge: x == 0 || y == 0 || x == (row.width - 1) || y == maxVal
                }
                this.indexToCoords.push(coord);
            }
        }
    }

    /**
     * Make sure the dir around edges is always correct (and bounce).
     *
     * For HEX this is a lot more complicated.
     */
    getCleanDirForEdge(i, c, preCheck) {
        let coord = this.getIToXYZ(i);
        if (!coord.edge) {
            return c;
        }
        let prevC = c
        let left = -this.distanceToCenter;
        let right = this.distanceToCenter;

        let rotation = 0;
        // Get which edge we're checking.
        if (coord.y == left || coord.y == right) {
            rotation = coord.y == left ? 0 : 3;
        } else if (coord.x == left || coord.x == right) {
            rotation = coord.x == left ? 5 : 2;
        } else if (coord.z == left || coord.z == right) {
            rotation = coord.z == left ? 4 : 1;
        }
        coord = this.rotateXYZCoord(coord, rotation);
        c = this.rotateC(c, 6 - rotation);

        let edge = 'center';
        if (coord.x == left) { // Left corner.
            edge = 'left'
        } else if (coord.x == 0) { // Right corner.
            edge = 'right';
        }
        c = EDGE_BOUNCE[edge][c];
        // Rotate back.
        c = this.rotateC(c, rotation);

        // We had to change dir, ie. we bounced (and not in pre-check).
        if (c != prevC && !preCheck) {
            this.bounces.push(i);
        }
        return c;
    }

    // Rotate our hexadecimal grid around the center easily.
    rotateXYZCoord(coord, rotation) {
        switch (rotation) {
            case 1: return { x: coord.y, y: -coord.z, z: coord.x };
            case 2: return { x: -coord.z, y: -coord.x, z: coord.y };
            case 3: return { x: -coord.x, y: -coord.y, z: -coord.z };
            case 4: return { x: -coord.y, y: coord.z, z: -coord.x };
            case 5: return { x: coord.z, y: coord.x, z: -coord.y };
            default: return coord;
        }
    }

    // Coord to array index.
    getCToI(x, y) {
        return this.coordsToIndex[x + ',' + y];
    }
    // Get index to coordinate.
    getIToC(i) {
        let coord = this.indexToCoords[i];
        return { x: coord.x, y: coord.y, edge: coord.edge }; // Return a copy.
    }
    // Get centered, cool XYZ hex coord. - Edges are -distanceToCenter.
    getIToXYZ(i) {
        var coord = this.getIToC(i);
        coord.x -= this.distanceToCenter;
        coord.y -= this.distanceToCenter;
        coord.z = coord.x - coord.y;
        return coord
    }

    // Get index + offset using coordinates.
    getIAddC(i, x, y) {
        let coord = this.getIToC(i);
        return this.getCToI(coord.x + x, coord.y + y);
    }
}
