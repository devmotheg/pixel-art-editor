/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const findPath = (start, end, color) => {
  const path = [];
  // Finding the main axis then slowly adding the slope to the non-main one
  if (Math.abs(start.x - end.x) > Math.abs(start.y - end.y)) {
    if (start.x > end.x) [start, end] = [end, start];
    const slope = (end.y - start.y) / (end.x - start.x);
    for (let { x, y } = start; x <= end.x; x++) {
      path.push({ x, y: Math.round(y), color });
      y += slope;
    }
  } else {
    if (start.y > end.y) [start, end] = [end, start];
    const slope = (end.x - start.x) / (end.y - start.y);
    for (let { x, y } = start; y <= end.y; y++) {
      path.push({ x: Math.round(x), y, color });
      x += slope;
    }
  }
  return path;
};

export const line = (start, state, dispatch) => {
  const drawLine = pos => {
    const drawn = findPath(start, pos, state.color);
    dispatch({ picture: state.picture.draw(drawn) });
  };

  drawLine(start);
  return drawLine;
};

export const draw = (start, state, dispatch) => {
  let prev = start;

  const drawPixel = (pos, state) => {
    const drawn = findPath(prev, pos, state.color);
    prev = pos;
    dispatch({ picture: state.picture.draw(drawn) });
  };

  drawPixel(start, state);
  return drawPixel;
};

export const rectangle = (start, state, dispatch) => {
  // Not binding the 2nd argument (state) to allow rectangle resizing while still holding and moving pointer
  const drawRectangle = pos => {
    const xStart = Math.min(start.x, pos.x),
      xEnd = Math.max(start.x, pos.x);
    const yStart = Math.min(start.y, pos.y),
      yEnd = Math.max(start.y, pos.y);
    const drawn = [];
    for (let y = yStart; y <= yEnd; y++)
      for (let x = xStart; x <= xEnd; x++)
        drawn.push({ x, y, color: state.color });
    // Using the state on the outer function (closure) to apply the aforementioned effect
    dispatch({ picture: state.picture.draw(drawn) });
  };

  drawRectangle(start);
  return drawRectangle;
};

const around = [
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: -1 },
  { dx: 0, dy: 1 },
];

export const fill = ({ x, y }, state, dispatch) => {
  const targetColor = state.picture.pixel(x, y);
  const drawn = [{ x, y, color: state.color }];
  for (let i = 0; i < drawn.length; i++)
    for (const { dx, dy } of around) {
      const x = drawn[i].x + dx,
        y = drawn[i].y + dy;
      if (
        state.picture.pixel(x, y) !== targetColor ||
        x < 0 ||
        x >= state.picture.width ||
        y < 0 ||
        y >= state.picture.height ||
        drawn.some(p => p.x === x && p.y === y)
      )
        continue;
      drawn.push({ x, y, color: state.color });
    }
  dispatch({ picture: state.picture.draw(drawn) });
};

export const pick = ({ x, y }, { picture }, dispatch) =>
  dispatch({ color: picture.pixel(x, y) });

export const circle = (center, state, dispatch) => {
  const getRadius = (x1, x2, y1, y2) => {
    return Math.floor(Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2));
  };

  const drawCircle = point => {
    const r = getRadius(center.x, point.x, center.y, point.y);
    const drawn = [];
    for (let y = center.y - r; y <= center.y + r; y++)
      for (let x = center.x - r; x <= center.x + r; x++) {
        if (
          getRadius(center.x, x, center.y, y) > r ||
          x < 0 ||
          x >= state.picture.width ||
          y < 0 ||
          y >= state.picture.height
        )
          continue;
        drawn.push({ x, y, color: state.color });
      }
    dispatch({ picture: state.picture.draw(drawn) });
  };

  drawCircle(center);
  return drawCircle;
};
