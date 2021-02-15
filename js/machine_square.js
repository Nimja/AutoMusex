
// Indexes for the directions, 0 = none, 1 is up, 2 is right, etc.
const DIR_UP = 1,
    DIR_RIGHT = 2,
    DIR_DOWN = 3,
    DIR_LEFT = 4;

// The directions we move on index.
const DIRS = [
    { x: 0, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 }
];

// How it bounces, all the same.
const EDGE_BOUNCE = {
    'left': [DIR_NONE, DIR_DOWN, DIR_RIGHT, DIR_DOWN, DIR_LEFT],
    'center': [DIR_NONE, DIR_DOWN, DIR_RIGHT, DIR_DOWN, DIR_LEFT],
    'right': [DIR_NONE, DIR_DOWN, DIR_RIGHT, DIR_DOWN, DIR_LEFT],
}

class CellMachine {
    constructor(size) {
        this.updateSize(size);
        this.dirs = DIRS;
        this.turnNormal = 3;
        this.turnOpposite = 2;
        this.sides = 4;
    }

    updateSize(size) {
        if (size == this.size) {
            return false;
        }
        this.size = size;
        this.distanceToCenter = size - 1;
        this.maxPerRow = size * 2 - 1;
        this.maxIndex = this.maxPerRow * this.maxPerRow;
        // Current state.
        this.grid = Array(this.maxIndex).fill(0);
        // Future state.
        this.gridBuffer = Array(this.maxIndex).fill(0);
        // Bounces.
        this.bounces = [];
        return true;
    }

    /**
     * Make sure the dir around edges is always correct (and bounce).
     *
     * Using rotation, we can use the same rule for hex and square.
     */
    getCleanDirForEdge(i, c, preCheck) {
        let coord = this.getIToCentered(i);
        if (!coord.edge) {
            return c;
        }
        let prevC = c
        let left = -this.distanceToCenter;
        let right = this.distanceToCenter;

        let rotation = this.getRotation(coord, left, right);
        // Get which edge we're checking.

        coord = this.rotateXYCoord(coord, rotation);
        c = this.rotateC(c, this.sides - rotation);

        c = this.getBounce(this.getEdgeName(coord, left, right), c);
        // Rotate back.
        c = this.rotateC(c, rotation);

        // We had to change dir, ie. we bounced (and not in pre-check).
        if (c != prevC && !preCheck) {
            this.bounces.push(i);
        }
        return c;
    }

    getRotation(coord, left, right) {
        let rotation = 0;
        if (coord.y == left || coord.y == right) {
            rotation = coord.y == left ? 0 : 2;
        } else if (coord.x == left || coord.x == right) {
            rotation = coord.x == left ? 3 : 1;
        }
        return rotation;
    }

    getEdgeName(coord, left, right) {
        let edge = 'center';
        if (coord.x == left) { // Left corner.
            edge = 'left'
        } else if (coord.x == right) { // Right corner.
            edge = 'right';
        }
        return edge;
    }

    getBounce(edge, c) {
        return EDGE_BOUNCE[edge][c];
    }

    // Rotate square grid around center.
    rotateXYCoord(coord, rotation) {
        switch (rotation) {
            case 1: return { x: -coord.y, y: coord.x };
            case 2: return { x: -coord.x, y: -coord.y };
            case 3: return { x: coord.y, y: -coord.x };
            default: return coord;
        }
    }

    // Coord to array index.
    getCToI(x, y) {
        return y * this.maxPerRow + x;
    }
    // Get index to coordinate.
    getIToC(i) {
        let maxVal = this.maxPerRow - 1;
        var y = Math.floor(i / this.maxPerRow);
        var x = i - (y * this.maxPerRow);
        return {
            x: x,
            y: y,
            edge: x == 0 || y == 0 || x == maxVal || y == maxVal
        };
    }
    // Get centered, cool XYZ hex coord. - Edges are -distanceToCenter.
    getIToCentered(i) {
        var coord = this.getIToC(i);
        coord.x -= this.distanceToCenter;
        coord.y -= this.distanceToCenter;
        return coord
    }

    // Get index + offset using coordinates.
    getIAddC(i, x, y) {
        return i + y * this.maxPerRow + x;
    }

    /**
     * - - - - - -
     * Everything below is identical to the hex rendering.
     * - - - - - -
     */



    step() {
        this.gridBuffer.fill(DIR_NONE);
        this.bounces = [];
        for (var i = 0; i < this.maxIndex; i++) {
            var c = this.grid[i];
            if (c == DIR_NONE) {
                continue; // Cell has nothing or is already handled.
            }
            var steps = Array.isArray(c) ? c : [c];
            for (var cc in steps) {
                this.doStepForIndex(i, steps[cc]);
            }
        }
        let temp = this.grid;
        this.grid = this.gridBuffer;
        this.gridBuffer = temp;
    }

    doStepForIndex(i, c) {
        // Get the 'current' direction. Fixes arrows that are pointing out on edges.
        c = this.getCleanDirForEdge(i, c, true);
        var dir = this.dirs[c];

        // Get the next index.
        var nextI = this.getIAddC(i, dir.x, dir.y);
        var target = this.gridBuffer[nextI];
        // There was nothing there, no collisions.
        if (target == DIR_NONE) {
            target = this.getCleanDirForEdge(nextI, c);
        } else if (target == c) {
            // Two overlapping.
            return;
        } else {
            let tcoord = this.getIToC(nextI);
            let turns = tcoord.edge ? this.turnOpposite : this.turnNormal;
            if (!Array.isArray(target)) {
                target = [this.rotateC(target, turns)];
                this.bounces.push(nextI);
            }
            c = this.rotateC(c, turns);
            // Avoid 2 arrows with the same direction.
            if (target.indexOf(c) === -1) {
                target.push(c);
            }
        }
        this.gridBuffer[nextI] = target;
    }

    rotateC(c, rotation) {
        if (c == DIR_NONE) {
            return c
        }
        c -= 1;
        let len = this.dirs.length - 1;
        return (c + rotation) % len + 1;
    }

    rotateItem(x, y, targetC) {
        let index = this.getCToI(x, y);
        let c = this.grid[index];
        if (Array.isArray(c)) {
            return;
        }
        if (targetC == -1) {
            targetC = c + 1;
        }
        this.grid[index] = targetC % this.dirs.length;
    }

    clear() {
        this.grid.fill(DIR_NONE);
        this.bounces = [];
    }

    addRandom() {
        for (var i = 0; i < this.maxPerRow; i++) {
            this.rotateItem(
                Math.floor(Math.random() * this.maxPerRow),
                Math.floor(Math.random() * this.maxPerRow),
                Math.floor(Math.random() * 4) + 1,
            )
        }
    }
}
