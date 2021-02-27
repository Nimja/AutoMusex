const DIR_O_U = 1,
    DIR_O_UR = 2,
    DIR_O_R = 3,
    DIR_O_DR = 4,
    DIR_O_D = 5,
    DIR_O_DL = 6,
    DIR_O_L = 7,
    DIR_O_UL = 8;


    DIR_O_U, DIR_O_UR, DIR_O_R, DIR_O_DR, DIR_O_D, DIR_O_DL, DIR_O_L, DIR_O_UL

const DIRS_OCT = [
    { x: 0, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
];

// How it bounces.
const EDGE_BOUNCE_OCT = {
    'left'  : [DIR_NONE, DIR_O_D, DIR_O_DR, DIR_O_R, DIR_O_DR, DIR_O_D, DIR_O_DR, DIR_O_R, DIR_O_DR],
    'center': [DIR_NONE, DIR_O_D, DIR_O_DR, DIR_O_R, DIR_O_DR, DIR_O_D, DIR_O_DL, DIR_O_L, DIR_O_DL],
    'right' : [DIR_NONE, DIR_O_D, DIR_O_DL, DIR_O_L, DIR_O_DL, DIR_O_D, DIR_O_DL, DIR_O_L, DIR_O_DL],
}

/**
 * This machine uses square coordinates for most things, but allows for diagonal movements.
 */
class CellMachineOct extends CellMachine {
    constructor(size) {
        super(size);
        this.dirs = DIRS_OCT;
        this.turnNormal = 5;
        this.turnOpposite = 4;
        this.sides = 8;
    }

    getRotation(coord, left, right) {
        let rotation = 0;
        if (coord.y == left || coord.y == right) {
            rotation = coord.y == left ? 0 : 4;
        } else if (coord.x == left || coord.x == right) {
            rotation = coord.x == left ? 6 : 2;
        }
        return rotation;
    }

    getBounce(edge, c) {
        return EDGE_BOUNCE_OCT[edge][c];
    }

    // Rotate square grid around center.
    rotateXYCoord(coord, rotation) {
        switch (rotation) {
            case 2: return { x: coord.y, y: -coord.x };
            case 4: return { x: -coord.x, y: -coord.y };
            case 6: return { x: -coord.y, y: coord.x };
            default: return coord;
        }
    }
}
