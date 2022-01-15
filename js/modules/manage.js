/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

import { PictureCanvas } from "./picture.js";
import { elt } from "./helper.js";

export class PixelEditor {
  constructor(state, config) {
    const { tools, controls, dispatch } = config;
    this.state = state;
    this.canvas = new PictureCanvas(state.picture, pos => {
      const tool = tools[this.state.tool];
      // Getting a callback function from the selected tool to handle pointer moving event
      const onMove = tool(pos, this.state, dispatch);
      if (onMove) return pos => onMove(pos, this.state);
    });
    this.controls = controls.map(Control => new Control(state, config));
    this.$dom = elt(
      "main",
      {
        tabIndex: 0,
        onkeydown: event => {
          const validKeys = Object.keys(tools).reduce((o, t) => {
            o[t[0]] = t;
            return o;
          }, {});
          if (event.key in validKeys) dispatch({ tool: validKeys[event.key] });
          else if (
            (event.ctrlKey || event.metaKey) &&
            (event.key === "z" || event.key === "Z")
          )
            dispatch({ undo: true });
        },
      },
      { class: "app" },
      this.canvas.$dom,
      elt(
        "div",
        null,
        { class: "app__interface" },
        ...this.controls.reduce((a, c) => a.concat(c.$dom), [])
      )
    );
  }

  syncState(state) {
    this.state = state;
    this.canvas.syncState(state.picture);
    for (const ctrl of this.controls) ctrl.syncState(state);
  }
}
