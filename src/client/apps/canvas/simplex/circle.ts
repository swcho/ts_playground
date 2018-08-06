
export const PI = Math.PI;

const
  toRad = deg => deg * (PI / 180),
  toDeg = rad => rad * (180 / PI);

class GEO_Circle {

    /**
     * Get coordinates of point on circle at given angle
     *
     * @param {Object} circle - circle object
     * @param {number} angle - angle to find point
     *
     * @return {Object} - point with coordinates
     */
    getPoint(circle, angle) {
        let x = circle.x + Math.cos(toRad(angle)) * circle.r;
        let y = circle.y + Math.sin(toRad(angle)) * circle.r;

        return { x, y };
    }

    /**
     * Creates proper circle object
     *
     * @param {number} x - center x
     * @param {number} y - center y
     * @param {number} r - radius
     *
     * @return {Object} - circle object
     */
    new(x, y, r) {
        return { x, y, r };
    }
}

export const Circle = new GEO_Circle();
