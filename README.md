# AutoMusex
A more modern version of Otomata, supporting a HEX grid and more!

Live Demo: https://nimja.com/other/interactive/automusex

# How does it work?
Tap/click to set add/change/remove arrow in a cell.

Play does automatic steps according to BPM.

You can share the url with your current 'song'. Changing size will randomize the field.

Advanced: Hold an arrow key or del/backspace while clicking.

The rules
* A filled cell will move in the direction it points.
* Edge: Bounce off
* Collision: If it lands in a cell with another arrow, they both turn clockwise.
* Edge + Collision: Turn around.

This was inspired by [OtoMata](http://earslap.com/page/otomata.html) - Completely re-done, hex grid and with web-audio that is generated on the fly!

# Features

* Basic HTML and JS, no visual or audio resources needed.
* Reasonably efficient and mobile friendly!
* Urls generated (and read) by JS.
* Generic drawer & encoder.
* Support for both hex and square grids.