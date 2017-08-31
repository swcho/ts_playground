
export default {
    math: {
        degToRad: alpha => alpha * Math.PI / 180,

        polarToDecart: (alpha, r) => {
            alpha = this.degToRad(alpha);
            return { x: r * Math.cos(alpha), y: r * Math.sin(alpha) };
        }
    },

    color: {
        random: (opts: Options = {}) => {
            let h, s, l;

            h = opts.hue || Math.floor(Math.random() * 360);
            s = opts.saturation || Math.floor(Math.random() * 101);
            l = opts.lightness || Math.floor(Math.random() * 101);

            return `hsl(${h}, ${s}%, ${l}%)`;
        }
    }
};
