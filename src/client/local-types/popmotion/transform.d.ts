
import * as calc from './calc';

export const bezier;
export const alpha;
export const blendColor;

/**
 * Interpolate from set of values to another
 * @param  {Array} input array
 * @param  {Array} output
 * @param  {Function} rangeEasing
 * @return {Function}
 */
export const interpolate: (input: number[], output: number[], rangeEasing?: Function) => (v: number) => typeof calc.getValueFromProgress;
