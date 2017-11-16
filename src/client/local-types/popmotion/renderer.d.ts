
class Renderer {
    /**
     * Get current state.
     * If `key` is not defined, return entire cached state.
     * If `key` is defined, return cached value if present.
     * If `key` is defined and cached value is not present, read and return.
     * @param  {string} (optional) key of value
     * @return {value}
     */
    get(key: string): any;

    /**
     * Read value according to `onRead`
     * @param  {string} Name of property to read
     * @return {[type]}
     */
    read(key: string);


    /**
     * Update `state` with new values and schedule `render`.
     * @param {object} values
     * @param {value} value toset
     */
    set(...args);

}

class CSSRenderer extends Renderer {

}

export function css(element, props?): CSSRenderer;
