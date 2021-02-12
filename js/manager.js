// Directional constants, needed everywhere.
const DIR_NONE = 0;
// In the same order as dirs.
KEY_DIRECTIONS_SQUARE = {
    8: 0,
    46: 0,
    38: 1,
    39: 2,
    40: 3,
    37: 4
};
KEY_DIRECTIONS_HEX = {
    8: 0,
    46: 0,
    38: 1,
    39: 2,
    40: 4,
    37: 5
};

class CellManager {
    constructor() {
        this.bpm = 90;
        this.interval = null;
        this.heldDir = DIR_NONE;
        // Parse query string in url (if present) before we do anything.
        let urlParams = new URLSearchParams(window.location.search);
        this.storedString = urlParams.get('q');

        // Get all the elements and set up event listeners.
        this.buttons = {
            'play': document.getElementById('toy-play'),
            'step': document.getElementById('toy-step'),
            'clear': document.getElementById('toy-clear'),
            'store': document.getElementById('toy-store'),
            'restore': document.getElementById('toy-restore')
        }
        // Order of sliders.
        this.sliderKeys = ['size', 'bpm', 'noteLength', 'noteType', 'noteKey'];
        this.sliders = {
            'size': document.getElementById('toy-size'),
            'bpm': document.getElementById('toy-bpm'),
            'noteLength': document.getElementById('toy-note-length'),
            'noteType': document.getElementById('toy-note-type'),
            'noteKey': document.getElementById('toy-note-key')
        }
        // Order of checkboxes.
        this.checkBoxKeys = ['square'];
        this.checkboxes = {
            'square': document.getElementById('toy-square')
        }

        // Instantiate the machine, renderer and sound.
        this.isSquare = 3;
        this.sound = new CellAudio();
        let canvas = document.getElementById('toy-canvas');
        // Square setup.
        this.machine_square = new CellMachine(1);
        this.renderer_square = new CellRenderer(this, this.machine_square, canvas);
        // Hex setup.
        this.machine_hex = new CellMachineHex(1);
        this.renderer_hex = new CellRendererHex(this, this.machine_hex, canvas);

        // Apply the current defaults (purely for performance).
        if (!this.storedString) {
            this.applySettings();
        }

        // Add the event listeners.
        this.buttons.play.addEventListener('click', this.autoStep.bind(this));
        this.buttons.step.addEventListener('click', this.doStep.bind(this));
        this.buttons.clear.addEventListener('click', this.doClear.bind(this));
        this.buttons.store.addEventListener('click', this.doStore.bind(this));
        this.buttons.restore.addEventListener('click', this.doRestore.bind(this));

        for (let i in this.sliders) {
            this.sliders[i].addEventListener('change', this.applySettings.bind(this));
        }
        for (let i in this.checkboxes) {
            this.checkboxes[i].addEventListener('change', this.applySettings.bind(this));
        }
        window.addEventListener('resize', this.handleResize.bind(this));
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));

        // Finally, restore data from url, if present.
        this.doRestore();
    }

    // Applied automatically with the settings.
    updateSquare(square) {
        square = !!square;
        if (this.isSquare === square) {
            return;
        }
        this.isSquare = square;
        if (this.isSquare) {
            this.machine = this.machine_square;
            this.renderer = this.renderer_square;
        } else {
            this.machine = this.machine_hex;
            this.renderer = this.renderer_hex;
        }
        this.renderer_square.active = square;
        this.renderer_hex.active = !square;
        this.machine.updateSize(2);
    }

    updateSpeed(bpm) {
        if (this.bpm != bpm) {
            this.bpm = bpm;
            if (this.interval) {
                this.stopIfPlaying();
                this.autoStep();
            }
        }
    }

    updateSize(size) {
        let result = this.machine.updateSize(size);
        this.renderer.updateSize();
        if (result) {
            this.machine.addRandom();
            this.renderer.render();
        }
        return result;
    }

    autoStep() {
        if (this.interval) {
            this.stopIfPlaying();
        } else {
            this.interval = setInterval(this.doStep.bind(this), 60000 / this.bpm);
        }
    }
    stopIfPlaying() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    doStep() {
        this.sound.prepareSound();
        this.machine.step();
        this.renderer.render();
        this.sound.render(this.machine);
    }

    doClear() {
        this.stopIfPlaying();
        this.machine.clear();
        this.renderer.render();
    }

    doStore() {
        this.storedString = this.getShareString();
    }

    doRestore() {
        if (this.storedString) {
            this.stopIfPlaying();
            this.setShareString(this.storedString);
        }
    }

    handleKeyDown(event) {
        this.handleKeyPress(event, true);
    }

    handleKeyUp(event) {
        this.handleKeyPress(event, false);
    }

    handleKeyPress(event, down) {
        var code = event.keyCode || event.which;
        var codes = this.isSquare ? KEY_DIRECTIONS_SQUARE : KEY_DIRECTIONS_HEX;
        if (codes.hasOwnProperty(code)) {
            event.preventDefault();
            this.heldDir = down ? codes[code] : -1;
        } else if (code == 32 && down) {
            event.preventDefault();
            this.autoStep();
        }
    }

    handleResize(event) {
        this.renderer_square.updateCanvas();
        this.renderer_hex.updateCanvas();
    }

    applySettings() {
        this.updateSquare(this.checkboxes.square.checked);
        this.updateSize(parseInt(this.sliders.size.value));
        this.updateSpeed(parseInt(this.sliders.bpm.value));
        this.sound.updateLength(parseInt(this.sliders.noteLength.value));
        this.sound.updateType(parseInt(this.sliders.noteType.value));
        this.sound.updateKey(this.sliders.noteKey.value);
        this.afterStep();
    }

    afterStep() {
        history.replaceState({}, document.title, '?q=' + this.getShareString());
    }

    getShareString() {
        let result = [];
        for (let i in this.checkBoxKeys) {
            result.push(this.checkboxes[this.checkBoxKeys[i]].checked ? 1 : 0);
        }
        for (let i in this.sliderKeys) {
            result.push(this.sliders[this.sliderKeys[i]].value);
        }
        var encoder = new GridEncoder();
        result.push(encoder.encode(this.machine.grid));
        return result.join('-');
    }
    setShareString(string) {
        let parts = string.split('-');
        let expectedLength = this.checkBoxKeys.length + this.sliderKeys.length + 1;
        if (parts.length !== expectedLength) {
            return;
        }
        for (let i in this.checkBoxKeys) {
            this.checkboxes[this.checkBoxKeys[i]].checked = parseInt(parts.shift()) > 0;
        }
        for (let i in this.sliderKeys) {
            this.sliders[this.sliderKeys[i]].value = parts.shift();
        }
        this.applySettings();
        var encoder = new GridEncoder();
        // Clear bounces :)
        this.machine.bounces = [];
        encoder.decode(this.machine.grid, parts.shift());
        this.renderer.render();
    }
}
