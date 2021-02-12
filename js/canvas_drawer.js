class CanvasDrawer {
    constructor(sides) {
        this.sides = sides;
        this.coords = [];
        this.arrowCoords = [];
        for (var i = 0; i <= this.sides; i++) {
            let angle = i / this.sides * Math.PI * 2 - Math.PI * .5;
            this.coords.push({ x: Math.cos(angle), y: Math.sin(angle) });
            this.arrowCoords.push(this.makeArrowCoords(i));
        }
    }

    makeArrowCoords(i) {
        let aOffset = Math.PI * 2 / this.sides * (i - 1),
            x, y,
            points = [ // Arrow shape in radius + angle. 0 - tip.
                { r: 1, a: 0 },
                { r: 1, a: Math.PI - .6 },
                { r: .5, a: Math.PI },
                { r: 1, a: Math.PI + .6 },
                { r: 1, a: 0 }, // And close the shape.
            ]
        let result = [];
        for (var p in points) {
            let point = points[p];
            result.push(
                {
                    x: point.r * Math.cos(aOffset + point.a),
                    y: point.r * Math.sin(aOffset + point.a)
                }
            );
        }
        return result;
    }

    drawBackground(ctx, coord, radius, hasColl) {
        if (this.sides == 4) {
            ctx.moveTo(coord.x - radius, coord.y - radius);
            ctx.rect(coord.x - radius, coord.y - radius, radius * 2, radius * 2)
        } else {
            this.drawCoords(ctx, coord, this.coords, radius);
        }
    }

    drawArrow(ctx, coord, radius, c) {
        if (c == 0) {
            return;
        }
        this.drawCoords(ctx, coord, this.arrowCoords[c - 1], radius);
    }

    drawCircle(ctx, coord, radius) {
        ctx.moveTo(coord.x + radius, coord.y);
        ctx.arc(coord.x, coord.y, radius, 0, Math.PI * 2);
    }

    drawCoords(ctx, coord, coords, radius) {
        for (var i in coords) {
            let c = {
                x: coord.x + radius * coords[i].x,
                y: coord.y + radius * coords[i].y
            }
            if (i == '0') {
                ctx.moveTo(c.x, c.y);
            } else {
                ctx.lineTo(c.x, c.y);
            }
        }
    }
}