// On a circle, of length 1, where would the first point be, and the spaces between the centers.
const HEXPOINT = { x: .86603, xspace: .86603 * 2, y: .5, yspace: .5 + 1 }


class CellRendererHex extends CellRenderer {
    constructor(manager, machine, canvas) {
        super(manager, machine, canvas);
        this.drawer = new CanvasDrawer(6);
    }

    updateSize() {
        // Set up the details we need for rendering the hexagons :)
        let middle = this.size / 2;
        this.hexDiameter = this.size / (this.machine.maxPerRow);
        this.hexRadius = this.hexDiameter / 2;
        this.startingOffset = this.machine.size - 1;
        this.hexSpace = {
            w: HEXPOINT.xspace * this.hexRadius, // Space between Hex cells horizontally.
            h: HEXPOINT.yspace * this.hexRadius // Space between hex cells vertically.
        }
        this.startPos = {
            x: middle - this.hexSpace.w * (this.startingOffset * .5),
            y: middle - this.hexSpace.h * this.startingOffset,
        }
        // Drawing sizes:
        this.backgroundRadius = this.hexRadius * .95;
        this.arrowRadius = this.hexRadius * .45;
        this.circleRadius = this.hexRadius * .4;
    }

    getCoordsForIndex(i) {
        let coord = this.machine.getIToC(i);
        return {
            x: this.startPos.x + this.hexSpace.w * (coord.y * -.5) + this.hexSpace.w * coord.x,
            y: this.startPos.y + this.hexSpace.h * coord.y
        }
    }

    handleClick(event) {
        if (!this.active) {
            return;
        }
        event.preventDefault();
        let rect = this.canvas.getBoundingClientRect();
        let coord = {
            x: (event.clientX - rect.left) / rect.width * this.size,
            y: (event.clientY - rect.top) / rect.height * this.size
        }
        // Shift y up to the start of the grid, then divide by the vertical division.
        let y = Math.floor((coord.y - (this.startPos.y - this.hexSpace.h * .5)) / this.hexSpace.h);
        if (y < 0 || y >= this.machine.maxPerRow) {
            // out of bounds.
            return;
        }
        let x = Math.floor((coord.x - (this.startPos.x - this.hexSpace.w * .5)) / this.hexSpace.w + y * .5);
        let row = this.machine.rows[y];
        let maxVal = row.offset + row.width;
        if (x < row.offset || x >= maxVal) {
            //Out of bounds.
            return;
        }
        this.machine.rotateItem(x, y, this.manager.heldDir);
        this.render(true);
    }
}