
type Ratio = number;

type Color = string;

interface Param {
    leaf_thickness: number;
    leaf_length: number;
    leaf_density: number;
    leaf_drawcnt: number;
    color: Color;
}

interface Pos {
    x: number;
    y: number;
}
