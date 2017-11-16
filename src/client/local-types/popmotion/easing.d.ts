
export interface Easing {
    (v: number): number;
}

export const createReversedEasing: (easing: Easing) => Easing;
export const createMirroredEasing: (easing: Easing) => Easing;

export const linear: Easing;

export const createExpoIn: (power: number) => Easing;
export const easeIn: Easing;
export const easeOut: Easing;
export const easeInOut: Easing;

export const circIn: Easing; // = (p) => 1 - Math.sin(Math.acos(p));
export const circOut: Easing; //  = createReversedEasing(circIn);
export const circInOut: Easing; // = createMirroredEasing(circOut);

export const createBackIn: (power) => Easing; // (p) => (p * p) * ((power + 1) * p - power);
export const backIn: Easing; // = createBackIn(DEFAULT_OVERSHOOT_STRENGTH);
export const backOut: Easing; // = createReversedEasing(backIn);
export const backInOut: Easing; // = createMirroredEasing(backIn);

// export const createAnticipateEasing = (power) => {
//   const backEasing = createBackIn(power);
//   return (p) => ((p *= 2) < 1) ? 0.5 * backEasing(p) : 0.5 * (2 - Math.pow(2, -10 * (p - 1)));
// };

// export const anticipate = createAnticipateEasing(DEFAULT_OVERSHOOT_STRENGTH);

// export const cubicBezier = (x1, y1, x2, y2) => {
//   const xBezier = bezier(0, x1, x2, 1);
//   const yBezier = bezier(0, y1, y2, 1);

//   return (t) => yBezier(xBezier(t));
// };
