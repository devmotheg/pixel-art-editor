/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

import { elt, drawPicture, pointerPosition, SCALE } from "./helper.js";

export class Picture {
  constructor(width, height, pixels) {
    this.width = width;
    this.height = height;
    this.pixels = pixels;
  }

  static empty(width, height, color) {
    // Representing a matrix (2d array) in a 1d array for the ease of accessing elements
    const pixels = new Array(width * height).fill(color);
    return new Picture(width, height, pixels);
  }

  static fromImage(image) {
    const width = Math.min(100, image.width),
      height = Math.min(100, image.height);
    const canvas = elt("canvas", { width, height }),
      context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);
    const pixels = [];
    const { data } = context.getImageData(0, 0, width, height);

    const hex = n => n.toString(16).padStart(2, "0");

    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = data.slice(i, i + 3);
      pixels.push(`#${hex(r)}${hex(g)}${hex(b)}`);
    }
    return new Picture(width, height, pixels);
  }

  pixel(x, y) {
    return this.pixels[x + y * this.width];
  }

  draw(pixels) {
    const copy = this.pixels.slice();
    for (const { x, y, color } of pixels) copy[x + y * this.width] = color;
    return new Picture(this.width, this.height, copy);
  }
}

export class PictureCanvas {
  constructor(picture, pointerDown) {
    this.$dom = elt(
      "canvas",
      {
        onmousedown: event => this.mouse(event, pointerDown),
        ontouchstart: event => this.touch(event, pointerDown),
      },
      { class: "app__picture" }
    );
    this.syncState(picture);
  }

  syncState(picture) {
    // Redrawing a picture only when we get a new one
    if (this.picture === picture) return;
    drawPicture(picture, this.$dom, SCALE, this.picture);
    this.picture = picture;
  }
}

PictureCanvas.prototype.mouse = function (downEvent, onDown) {
  if (downEvent.button !== 0) return;
  let pos = pointerPosition(downEvent, this.$dom);
  const onMove = onDown(pos);
  if (!onMove) return;

  const move = moveEvent => {
    if (moveEvent.buttons === 0)
      // Clearing previous handlers to avoid bugs
      this.$dom.removeEventListener("mousemove", move);
    else {
      const newPos = pointerPosition(moveEvent, this.$dom);
      if (newPos.x === pos.x && newPos.y === pos.y) return;
      // To keep track of the previous position using closure
      pos = newPos;
      // Applying the appropriate tool effect when the pointer moves
      onMove(newPos);
    }
  };

  this.$dom.addEventListener("mousemove", move);
};

PictureCanvas.prototype.touch = function (startEvent, onDown) {
  startEvent.preventDefault();
  let pos = pointerPosition(startEvent.touches[0], this.$dom);
  const onMove = onDown(pos);
  if (!onMove) return;

  const move = moveEvent => {
    const newPos = pointerPosition(moveEvent.touches[0], this.$dom);
    if (newPos.x === pos.x && newPos.y === pos.y) return;
    // To keep track of the previous position using closure
    pos = newPos;
    // Applying the appropriate tool effect when the pointer moves
    onMove(newPos);
  };

  // Clearing previous handlers to avoid bugs
  const end = _ => {
    this.$dom.removeEventListener("touchmove", move);
    this.$dom.removeEventListener("touchend", end);
  };

  this.$dom.addEventListener("touchmove", move);
  this.$dom.addEventListener("touchend", end);
};
