// Notes from low C, 12 half notes.
const PENTATONIC_SCALE = [0, 2, 4, 7, 9];

OCTAVE = 12;

// 9 octaves, 12 notes per octave.
const NOTE_FREQUENCIES = [
    16.35, 17.32, 18.35, 19.45, 20.6, 21.83, 23.12, 24.5, 25.96, 27.5, 29.14, 30.87,
    32.7, 34.65, 36.71, 38.89, 41.2, 43.65, 46.25, 49, 51.91, 55, 58.27, 61.74,
    65.41, 69.3, 73.42, 77.78, 82.41, 87.31, 92.5, 98, 103.83, 110, 116.54, 123.47,
    130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185, 196, 207.65, 220, 233.08, 246.94,
    261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392, 415.3, 440, 466.16, 493.88,
    523.25, 554.37, 587.33, 622.25, 659.25, 698.46, 739.99, 783.99, 830.61, 880, 932.33, 987.77,
    1046.5, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91, 1479.98, 1567.98, 1661.22, 1760, 1864.66, 1975.53,
    2093, 2217.46, 2349.32, 2489.02, 2637.02, 2793.83, 2959.96, 3135.96, 3322.44, 3520, 3729.31, 3951.07,
    4186.01, 4434.92, 4698.63, 4978.03, 5274.04, 5587.65, 5919.91, 6271.93, 6644.88, 7040, 7458.62, 7902.13,
];

class CellAudio {
    constructor() {
        var AudioContext = window.AudioContext // Default
            || window.webkitAudioContext // Safari and old versions of Chrome
            || false;

        if (!AudioContext) {
            alert("I'm sorry, this browser does not support audio...");
        } else {
            this.AudioContext = AudioContext;
        }
        this.major = true;
        this.updateLength(4);
        this.updateType(1);
        this.volume = .5;
        this.curVolume = .25;
    }
    prepareSound() {
        if (!this.context && this.AudioContext) {
            this.context = new this.AudioContext();
            // Make funky instrument :)
            var real = new Float32Array([0, 0.4, 0.4, 1, 1, 1, 0.3, 0.7, 0.6, 0.5, 0.9, 0.8]);
            var imag = new Float32Array(real.length);
            this.custom = {};
            this.custom.horn = this.context.createPeriodicWave(real, imag);
        }
    }

    render(machine) {
        let len = machine.bounces.length;
        if (!len || !this.context) {
            return;
        }
        this.curVolume = 1 / len * this.volume;
        for (var i = 0; i < len; i++) {
            var coords = machine.getIToC(machine.bounces[i]);
            var index = coords.y + coords.x;
            var octave = Math.floor(index / PENTATONIC_SCALE.length);
            var note = index - octave * PENTATONIC_SCALE.length;
            this.playNote(octave + 3, note);
        }
    }
    playNote(oct, pent) {
        var index = oct * OCTAVE + (PENTATONIC_SCALE[pent] + this.key) % OCTAVE;
        this.makeSound(NOTE_FREQUENCIES[index]);
    }
    makeSound(hz) {
        var context = this.context;
        var o = context.createOscillator()
        var g = context.createGain()
        g.gain.value = .00001;
        if (this.type == 'horn') {
            o.setPeriodicWave(this.custom.horn);
        } else {
            o.type = this.type;
        }
        o.frequency.value = hz;
        o.connect(g)
        g.connect(context.destination)
        o.start(context.currentTime);
        o.stop(context.currentTime + this.length * 1.1);
        g.gain.exponentialRampToValueAtTime(this.curVolume, context.currentTime + this.length * .01);
        g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + this.length);
    }
    updateLength(length) {
        this.length = length / 2;
    }
    updateType(type) {
        let types = ['sine', 'square', 'triangle', 'sawtooth', 'horn'];
        this.type = types[type - 1];
    }
    updateKey(key) {
        this.key = parseInt(key) % OCTAVE;
    }
}