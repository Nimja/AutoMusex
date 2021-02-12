class CellRenderer {
    constructor(manager, machine, canvas) {
        this.manager = manager;
        this.machine = machine;
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        // Specific to Square.
        canvas.addEventListener('click', this.handleClick.bind(this));
        this.updateCanvas();
        this.drawer = new CanvasDrawer(4);
        this.active = false;
    }
    updateSize() {
        this.blockSize = this.size / this.machine.maxPerRow;
        this.blockSizeH = this.blockSize * .5;

        this.backgroundRadius = this.blockSizeH * .95;
        this.arrowRadius = this.blockSizeH * .45;
        this.circleRadius = this.blockSizeH * .4;
    }

    getCoordsForIndex(i) {
        var coord = this.machine.getIToC(i);
        coord.x = coord.x * this.blockSize + this.blockSizeH;
        coord.y = coord.y * this.blockSize + this.blockSizeH;
        return coord;
    }

    handleClick(event) {
        if (!this.active) {
            return;
        }
        event.preventDefault();
        var rect = this.canvas.getBoundingClientRect();
        let x = this.realCoordToGrid(event.clientX, rect.left, rect.width),
            y = this.realCoordToGrid(event.clientY, rect.top, rect.height);
        this.machine.rotateItem(x, y, this.manager.heldDir);
        this.render(true);
    }

    realCoordToGrid(v, offset, size) {
        v = Math.floor((v - offset) / size * this.machine.maxPerRow);
        return Math.max(0, Math.min(this.machine.maxPerRow - 1, v));
    }

    /**
     * - - - - - -
     * Everything below is identical to the hex rendering.
     * - - - - - -
     */

    render() {
        if (!this.active) {
            return;
        }
        let ctx = this.context;
        ctx.fillStyle = '#ccc';
        ctx.clearRect(0, 0, this.size, this.size);
        this.drawGrid(ctx);
        this.drawBlocks(ctx);
        // After step, call manager.
        this.manager.afterStep();
    }
    drawGrid(ctx) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0, 0, 0, .25)';
        ctx.fillStyle = '#ccc';
        ctx.beginPath();
        for (var i = 0; i < this.machine.maxIndex; i++) {
            let coord = this.getCoordsForIndex(i);
            this.drawer.drawBackground(ctx, coord, this.backgroundRadius);
        }
        ctx.fill();
    }

    drawBlocks(ctx) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ccc';
        // Get the 4 groups of things we have to draw.
        let arrows = [];
        let circles = [];
        let bounces = [];
        let backgrounds = [];
        for (var i = 0; i < this.machine.maxIndex; i++) {
            let c = this.machine.grid[i];
            if (c === DIR_NONE) {
                continue;
            }
            let coord = this.getCoordsForIndex(i);
            // If it has a bounce.
            if (this.machine.bounces.indexOf(i) != -1) {
                bounces.push(coord);
            } else {
                backgrounds.push(coord);
            }
            // Arrow or circle.
            if (Array.isArray(c)) {
                circles.push(coord);
            } else {
                arrows.push({ c: c, coord: coord });
            }
        }
        // Draw highlighted backgrounds.
        ctx.beginPath();
        ctx.shadowColor = "cyan";
        ctx.fillStyle = 'white';
        ctx.shadowBlur = this.backgroundRadius * .2;
        for (var i in bounces) {
            this.drawer.drawBackground(ctx, bounces[i], this.backgroundRadius);
        }
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        // Draw normal backgrounds.
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, .5)';
        for (var i in backgrounds) {
            this.drawer.drawBackground(ctx, backgrounds[i], this.backgroundRadius);
        }
        ctx.fill();
        // Draw arrows.
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0, 0, 0, .5)';
        for (var i in arrows) {
            this.drawer.drawArrow(ctx, arrows[i].coord, this.arrowRadius, arrows[i].c);
        }
        ctx.fill();

        // Draw circles.
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0, 0, 0, .5)';
        for (var i in circles) {
            this.drawer.drawCircle(ctx, circles[i], this.circleRadius);
        }
        ctx.fill();

    }

    updateCanvas() {
        var rect = this.canvas.getBoundingClientRect();
        this.size = rect.width;
        this.updateSize();
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.render();
    }
}