/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

export const SCALE = 10;

export const elt = (tag, props, attrs = {}, ...children) => {
  const $dom = document.createElement(tag);
  if (props) Object.assign($dom, props);
  for (const attr of Object.keys(attrs)) $dom.setAttribute(attr, attrs[attr]);
  for (const child of children)
    if (typeof child !== "string") $dom.appendChild(child);
    else $dom.appendChild(document.createTextNode(child));
  return $dom;
};

export const drawPicture = (newPic, cnv, scale, oldPic = null) => {
  if (!oldPic || oldPic.width !== newPic.width)
    cnv.width = newPic.width * scale;
  if (!oldPic || oldPic.height !== newPic.height)
    cnv.height = newPic.height * scale;
  const ctx = cnv.getContext("2d");
  for (let y = 0; y < newPic.height; y++)
    for (let x = 0; x < newPic.width; x++)
      if (!oldPic || oldPic.pixel(x, y) !== newPic.pixel(x, y)) {
        ctx.fillStyle = newPic.pixel(x, y);
        // Giving picture pixels scale * scale dimensions on canvas
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
};

export const pointerPosition = (pos, domNode) => {
  const rect = domNode.getBoundingClientRect();
  // Getting pixel coords by making sure each pixel takes SCALE * SCALE dimensions on canvas
  return {
    x: Math.floor((pos.clientX - rect.left) / SCALE),
    y: Math.floor((pos.clientY - rect.top) / SCALE),
  };
};

export const historyUpdateState = (state, action) => {
  if (action.undo) {
    if (!state.done.length) return state;
    return Object.assign({}, state, action, {
      picture: state.done[0],
      done: state.done.slice(1),
      doneAt: 0,
    });
  } else if (action.picture && state.doneAt < Date.now() - 1000) {
    return Object.assign({}, state, action, {
      done: [state.picture, ...state.done],
      doneAt: Date.now(),
    });
  } else return Object.assign({}, state, action);
};
