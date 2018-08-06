class GEO_Line {

    /**
     * Get coordinates of point at line's position
     *
     * @param {Object} line - line object
     * @param {number} percentage - position on line in percents
     *
     * @return {Object} - point with coordinates
     */
    getPoint(line, position) {
        let equation = this.getLineEquation(line);

        let dx = line.end.x - line.start.x;

        let x = line.start.x + (dx * position / 100);
        let y = equation(x);

        return { x, y };
    }

    /**
     * Get length of a given line
     *
     * @param {Object} line - line object
     *
     * @return {number} - absolute value of line's length
     */
    getLength(line) {
        let dx = line.end.x - line.start.x;
        let dy = line.end.y - line.start.y;

        return Math.abs(Math.sqrt(dx * dx + dy * dy));
    }

    /**
     * Get line equation for given line
     *
     * @param {Object} line - line object
     *
     * @return {function}
     */
    getLineEquation(line) {
        let m = this.getSlope(line);

        /**
         * Get y coordinate from x coordinate
         *
         * @param {number} x - x coordinate
         *
         * @return {number} - y coordinate
         */
        let equation = function (x) {
            return m * x - m * line.start.x + line.start.y;
        };

        return equation;
    }

    /**
     * Get line's slope for line equation
     *
     * @param {Object} line - line object
     *
     * @return {number} - slope
     */
    getSlope(line) {
        return (line.end.y - line.start.y) / (line.end.x - line.start.x);
    }

    /**
     * Creates proper line object
     *
     * @param {number} x1 - start x
     * @param {number} y1 - start y
     * @param {number} x2 - end x
     * @param {number} y2 - end y
     *
     * @return {Object} - line object
     */
    new(x1, y1, x2, y2) {
        return {
            start: { x: x1, y: y1 },
            end: { x: x2, y: y2 }
        };
    }
}

export const Line = new GEO_Line();
