/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

import { historyUpdateState } from "./modules/helper.js";
import { PixelEditor } from "./modules/manage.js";
import {
  ToolSelect,
  ColorSelect,
  SaveButton,
  LoadButton,
  UndoButton,
} from "./modules/interface.js";
import { line, draw, rectangle, fill, pick, circle } from "./modules/tools.js";
import { Picture } from "./modules/picture.js";

const startState = {
  tool: "draw",
  color: "#000000",
  picture: Picture.empty(75, 55, "#f0f0f0"),
  // Keeping track of the history of picture in a queue
  done: [],
  doneAt: 0,
};
const baseTools = { line, draw, rectangle, fill, pick, circle };
const baseControls = [
  ToolSelect,
  ColorSelect,
  SaveButton,
  LoadButton,
  UndoButton,
];

const startPixelEditor = ({
  state = startState,
  tools = baseTools,
  controls = baseControls,
}) => {
  const app = new PixelEditor(state, {
    tools,
    controls,
    // The dispatch function which updates the app (main component) which in turn updates the mini components
    dispatch(action) {
      state = historyUpdateState(state, action);
      app.syncState(state);
    },
  });
  return app.$dom;
};

document.body.appendChild(startPixelEditor({}));
