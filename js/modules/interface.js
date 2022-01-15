/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

import { elt, drawPicture } from "./helper.js";
import { Picture } from "./picture.js";

export class ToolSelect {
  constructor(state, { tools, dispatch }) {
    this.select = elt(
      "select",
      {
        onchange: _ => dispatch({ tool: this.select.value }),
      },
      { id: "app__tools" },
      ...Object.keys(tools).map(name =>
        elt("option", { selected: name === state.tool }, {}, name)
      )
    );
    this.$dom = elt(
      "label",
      null,
      { for: "app__tools" },
      "🖌 Tool:",
      this.select
    );
  }

  syncState(state) {
    this.select.value = state.tool;
  }
}

export class ColorSelect {
  constructor(state, { dispatch }) {
    this.input = elt(
      "input",
      {
        type: "color",
        value: state.color,
        onchange: _ => dispatch({ color: this.input.value }),
      },
      { id: "app__colors" }
    );
    this.$dom = elt(
      "label",
      null,
      { for: "app__colors" },
      "🎨 Color:",
      this.input
    );
  }

  syncState(state) {
    this.input.value = state.color;
  }
}

export class SaveButton {
  constructor(state) {
    this.picture = state.picture;
    this.$dom = elt(
      "button",
      { onclick: _ => this.save() },
      { class: "app__save" },
      "💾 Save"
    );
  }

  save() {
    const canvas = elt("canvas");
    drawPicture(this.picture, canvas, 1);
    const link = elt("a", {
      href: canvas.toDataURL(),
      download: "pixelart.png",
    });
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  syncState(state) {
    this.picture = state.picture;
  }
}

export class LoadButton {
  constructor(_, { dispatch }) {
    // Handeling loading asynchronously by giving dispatch as a callback
    this.$dom = elt(
      "button",
      { onclick: _ => this.startLoad(dispatch) },
      { class: "app__load" },
      "📁 Load"
    );
  }

  syncState() { }
}

LoadButton.prototype.startLoad = function (dispatch) {
  const input = elt("input", {
    type: "file",
    onchange: _ => this.finishLoad(input.files[0], dispatch),
  });
  document.body.appendChild(input);
  input.click();
  input.remove();
};

LoadButton.prototype.finishLoad = function (file, dispatch) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", _ => {
    const image = elt("img", {
      onload: _ => dispatch({ picture: Picture.fromImage(image) }),
      src: reader.result,
    });
  });
  reader.readAsDataURL(file);
};

export class UndoButton {
  constructor(state, { dispatch }) {
    this.$dom = elt(
      "button",
      {
        onclick: _ => dispatch({ undo: true }),
        disabled: !state.done.length,
      },
      { class: "app__undo" },
      "⮪ Undo"
    );
  }

  syncState(state) {
    this.$dom.disabled = !state.done.length;
  }
}
