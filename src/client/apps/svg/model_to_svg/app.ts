
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import d3 = require('d3');

/**
 *
 */
/**
 *
 */
let _svg, _json, _Vertexs, _current, _graphic, _faces = [], _Traingles = [], _angle = 0, _r = 0;
let _windowHalfX, _windowHalfY;
let _V = { x: 0, y: 0, z: 300 }, _L = { x: 0, y: 0, z: 0 };

function init() {
    d3.json('https://hankuro.sakura.ne.jp/Model_134/model278_134.json', function (error, root) {
        _json = root;
        _svg = d3.select('#svg');
        _graphic = _svg.select('#graphic');
        _current = 0;
        _Vertexs = _json.vertices;
        makeFace(_json.faces);
        _faces.forEach(function (f, i) { _Traingles.push(new Traingle(f, i)); });
        setInterval(onFrame, 100);
        _windowHalfX = 800 / 2;
        _windowHalfY = 400 / 2;
        d3.select('#svg')
            .on('mousemove', function () {
                let mouse = d3.mouse(this as any);
                let x = (_windowHalfX - mouse[0]) * -1;
                let y = _windowHalfY - mouse[1];
                _L.x = x * 10;
                _L.y = y * 10;
                console.log(_L.x + ' ' + _L.y);
            });
    });
}
function onFrame() {
    let array = [];
    _Traingles.forEach(function (t) {
        t.setVrtex();
        t.rotateY(_angle);
        t.scale(10);
        t.translate([0, -30, 0]);
        array.push({ obj: t, z: t.getZ() });
    });
    array.sort(function (a, b) {
        return a.z < b.z ? -1 : a.z > b.z ? 1 : 0;
    });
    array.forEach(function (e, i) { e.obj.draw(i); });

    _angle += 0.03;
}
function Vertex() {
    if (arguments.length === 3) {
        this.x = arguments[0];
        this.y = arguments[1];
        this.z = arguments[2];
    } else {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
    this.fl = 1000;
}
Vertex.prototype = {
    getScrrenPoint: function () {
        let scale_z = this.fl + this.z;
        let scale = this.fl / scale_z;
        let x = this.x * scale;
        let y = this.y * scale;
        return { x: x, y: y, scale: scale };
    },
    set: function (p1, p2, p3) {
        this.x = p1;
        this.y = p2;
        this.z = p3;
    },
    copy: function (v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
    }
};
let _Vector = {
    add: function (p1, p2) {
        let rtn = new Object() as any;
        rtn.x = p1.x + p2.x;
        rtn.y = p1.y + p2.y;
        rtn.z = p1.z + p2.z;
        return rtn;
    },
    substrct: function (p1, p2) {
        let rtn = new Object() as any;
        rtn.x = p1.x - p2.x;
        rtn.y = p1.y - p2.y;
        rtn.z = p1.z - p2.z;
        return rtn;
    },
    dot: function (p1, p2) {
        let rtn;
        rtn = p1.x * p2.x + p1.y * p2.y + p1.z * p2.z;
        return rtn;
    },
    crossproduct: function (p1, p2) {
        let rtn = new Object() as any;
        rtn.x = p1.y * p2.z - p1.z * p2.y;
        rtn.y = p1.z * p2.x - p1.x * p2.z;
        rtn.z = p1.x * p2.y - p1.y * p2.x;
        return rtn;
    },
    normalize: function (p) {
        let magsq = p.x * p.x + p.y * p.y + p.z * p.z;
        let rtn = { x: 0, y: 0, z: 0 };
        if (magsq > 0.0) {
            let oneovaermag = 1.0 / Math.sqrt(magsq);
            rtn.x = p.x * oneovaermag;
            rtn.y = p.y * oneovaermag;
            rtn.z = p.z * oneovaermag;
        }
        return rtn;
    },
    check: function (p1, p2) {
        return p1.x === p2.x && p1.y === p2.y && p1.z === p2.z;
    },
    distance: function (p1, p2) {
        let dx = p1.x - p2.x;
        let dy = p1.y - p2.y;
        let dz = p1.z - p2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },
    Multiply: function (p1, p2) {
        let rtn = {} as any;
        rtn.x = p1.x * p2;
        rtn.y = p1.y * p2;
        rtn.z = p1.z * p2;
        return rtn;
    }
};
function Traingle(f, i) {
    this.face = f;
    this.index = i;
    this.id = '#dorgon' + i;
    let v1 = new Vertex();
    let v2 = new Vertex();
    let v3 = new Vertex();
    this.Vetexs = [v1, v2, v3];
    this.WorkPos = { x: 0, y: 0, z: 0 };
    this.setVrtex();
    this.Color = f.Color;
    _graphic.append('path')
        .attr('d', this.getPath())
        .attr('id', 'dorgon' + i)
        .attr('fill', 'black')
        .attr('stroke', 'none');
}
Traingle.prototype = {
    setVrtex: function () {
        this.Vetexs.forEach(function (e, i) {
            switch (i) {
                case 0: setFaceToVetex(this.face.a, this.Vetexs[i]); break;
                case 1: setFaceToVetex(this.face.b, this.Vetexs[i]); break;
                case 2: setFaceToVetex(this.face.c, this.Vetexs[i]); break;
            }
        }.bind(this));
        function setFaceToVetex(vindex, v) {
            let v1 = _Vertexs[vindex * 3 + 0];
            let v2 = _Vertexs[vindex * 3 + 1];
            let v3 = _Vertexs[vindex * 3 + 2];
            v.set(v1, v2, v3);
        }
    },
    rotateY: function (a) {
        let cos = Math.cos(a);
        let sin = Math.sin(a);
        let _this = this;
        this.Vetexs.forEach(function (v) { rotateVertex(v); });
        function rotateVertex(v) {
            _this.WorkPos.x = cos * v.x - sin * v.z;
            _this.WorkPos.y = v.y;
            _this.WorkPos.z = cos * v.z + sin * v.x;
            v.x = _this.WorkPos.x;
            v.y = _this.WorkPos.y;
            v.z = _this.WorkPos.z;
        }
    },
    scale: function (s) {
        this.Vetexs.forEach(function (v) {
            v.x *= s;
            v.y *= s;
            v.z *= s;
        });
    },
    translate: function (t) {
        this.Vetexs.forEach(function (v) {
            v.x += t[0];
            v.y += t[1];
            v.z += t[2];
        });
    },
    getPath: function () {
        let v1 = this.Vetexs[0].getScrrenPoint();
        let v2 = this.Vetexs[1].getScrrenPoint();
        let v3 = this.Vetexs[2].getScrrenPoint();
        return 'M ' + v1.x + ' ' + v1.y + ' L ' + v2.x + ' ' + v2.y + ' L ' + v3.x + ' ' + v3.y + ' Z';
    },
    getZ: function () {
        return Math.min(this.Vetexs[0].z, this.Vetexs[1].z, this.Vetexs[2].z);
    },
    draw: function (i) {
        if (this.isFace()) {
            _graphic.select('#dorgon' + i)
                .attr('visibility', 'hidden');
        } else {
            let color = this.getColor();
            let d = this.getPath();
            _graphic.select('#dorgon' + i)
                .attr('visibility', 'visible')
                .attr('d', d)
                .attr('fill', color);
        }
    },
    isFace: function () {
        let N = this.getNormal();
        return _Vector.dot(_V, N) <= 0;
    },
    getColor: function () {
        let kd = 0.6, ks = 0.2, ke = 0.5;
        let WHITE = { x: 1, y: 1, z: 1 };
        let N = this.getNormal();
        let V = _Vector.substrct(this.Vetexs[0], _V);
        V = _Vector.normalize(V);
        let L = _Vector.substrct(this.Vetexs[0], _L);
        L = _Vector.normalize(L);
        let dot = _Vector.dot(L, N);
        let vec1 = _Vector.Multiply(N, dot);
        vec1 = _Vector.Multiply(vec1, 2);
        let R = _Vector.substrct(L, vec1);
        vec1 = _Vector.Multiply(N, -1);
        dot = Math.max(_Vector.dot(vec1, L), 0);
        vec1 = _Vector.Multiply(_Vector.Multiply(this.Color, dot), kd);
        let vec2 = _Vector.Multiply(R, -1);
        dot = Math.pow(Math.max(_Vector.dot(vec2, V)), 20);
        vec2 = _Vector.Multiply(WHITE, dot * ks);
        let vec3 = _Vector.Multiply(this.Color, ke);
        let col = _Vector.add(_Vector.add(vec1, vec2), vec3);
        let red = Math.floor(col.x * 255);
        let green = Math.floor(col.y * 255);
        let blue = Math.floor(col.z * 255);
        return 'rgb(' + red + ',' + green + ',' + blue + ')';
    },
    getNormal: function () {
        let v1 = this.Vetexs[0];
        let v2 = this.Vetexs[1];
        let v3 = this.Vetexs[2];
        let e1 = _Vector.substrct(v3, v2);
        let e2 = _Vector.substrct(v1, v3);
        let N = _Vector.crossproduct(e1, e2);
        N = _Vector.normalize(N);
        return N;
    }
};

function Face(a?, b?, c?) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.Color = { x: 0, y: 0, z: 0 };
}
Face.prototype.setHexColor = function (hex) {
    hex = Math.floor(hex);
    this.Color.x = (hex >> 16 & 255) / 255;
    this.Color.y = (hex >> 8 & 255) / 255;
    this.Color.z = (hex & 255) / 255;
};

function makeFace(faces) {
    let offset = 0;
    while (offset < faces.length) {
        let type = faces[offset++];
        let isQuad = isBitSet(type, 0);
        let hasMaterial = isBitSet(type, 1);
        let hasFaceVertexUv = isBitSet(type, 3);
        let hasFaceNormal = isBitSet(type, 4);
        let hasFaceVertexNormal = isBitSet(type, 5);
        let hasFaceColor = isBitSet(type, 6);
        let hasFaceVertexColor = isBitSet(type, 7);
        if (isQuad !== 0) {
            let faceA = new Face();
            faceA.a = faces[offset + 0];
            faceA.b = faces[offset + 1];
            faceA.c = faces[offset + 3];
            let faceB = new Face();
            faceB.a = faces[offset + 1];
            faceB.b = faces[offset + 2];
            faceB.c = faces[offset + 3];
            offset += 4;
            if (hasMaterial !== 0) offset++;
            if (hasFaceVertexUv !== 0) {
                for (let i = 0; i < 4; i++) offset++;
            }
            if (hasFaceNormal !== 0) offset++;
            if (hasFaceVertexNormal !== 0) {
                for (let i = 0; i < 4; i++) offset++;
            }
            if (hasFaceColor !== 0) {
                offset++;
            }
            if (hasFaceVertexColor !== 0) {
                for (let i = 0; i < 4; i++) {
                    let colorIndex = faces[offset++];
                    let hex = _json.colors[colorIndex];
                    if (i !== 2) faceA.setHexColor(hex);
                    if (i !== 0) faceB.setHexColor(hex);
                }
            }
            _faces.push(faceA);
            _faces.push(faceB);
        }
        else {
            let face = new Face();
            face.a = faces[offset++];
            face.b = faces[offset++];
            face.c = faces[offset++];
            if (hasMaterial !== 0) offset++;
            if (hasFaceVertexUv !== 0) {
                for (let i = 0; i < 3; i++) offset++;
            }
            if (hasFaceNormal !== 0) offset++;
            if (hasFaceVertexNormal !== 0) {
                for (let i = 0; i < 3; i++) offset++;
            }
            if (hasFaceColor !== 0) {
                offset++;
            }
            if (hasFaceVertexColor !== 0) {
                for (let i = 0; i < 3; i++) {
                    let colorIndex = faces[offset++];
                    let hex = _json.colors[colorIndex];
                    face.setHexColor(hex);
                }
            }
            _faces.push(face);
        }
    }
}
function isBitSet(value, position) {
    return value & (1 << position);
}
window.onload = function () { init(); };
