
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

class CellMachine {
    constructor(size) {
        this.updateSize(size);
        this.dirs = DIRS;
        this.turnNormal = 3;
        this.turnOpposite = 2;
    }

    updateSize(size) {
        if (size == this.size) {
            return false;
        }
        this.size = size;
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
     */
    getCleanDirForEdge(i, c, preCheck) {
        var prevC = c,
            limit = this.maxPerRow - 1;
        var pos = this.getIToC(i);
        var dir = this.dirs[c];
        // Horizontal movement, check edges.
        if (dir.x != 0) {
            if (pos.x == 0) {
                c = DIR_RIGHT;
            } else if (pos.x == limit) {
                c = DIR_LEFT;
            }
        }
        // Vertical movement, check edges.
        if (dir.y != 0) {
            if (pos.y == 0) {
                c = DIR_DOWN;
            } else if (pos.y == limit) {
                c = DIR_UP;
            }
        }
        // We had to change dir, ie. we bounced (and not in pre-check).
        if (c != prevC && !preCheck) {
            this.bounces.push(i);
        }
        return c;
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
