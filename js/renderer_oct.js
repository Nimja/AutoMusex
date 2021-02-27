
// Enlarge the octagons by this factor, to make them touch like squares.
OCT_SIDE = 1 / 0.924;

class CellRendererOct extends CellRenderer {
    updateSize() {
        this.blockSize = this.size / this.machine.maxPerRow;
        this.blockSizeH = this.blockSize * .5;

        this.backgroundRadius = this.blockSizeH * OCT_SIDE * .95;
        this.arrowRadius = this.blockSizeH * OCT_SIDE * .45;
        this.circleRadius = this.blockSizeH * OCT_SIDE * .35;
    }
}