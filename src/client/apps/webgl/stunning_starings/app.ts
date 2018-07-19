
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

declare const starlings;

const createGeometry = (size: number, combine: boolean) => {
    const geometry = {
      vertices: [
        { x: -size, y: -size, z: size },
        { x: size, y: size, z: size },
        { x: -size, y: size, z: -size },
        { x: size, y: -size, z: -size },
      ],
      faces: [
        { a: 0, b: 1, c: 2 },
        { a: 3, b: 2, c: 1 },
        { a: 3, b: 1, c: 0 },
        { a: 3, b: 0, c: 2 },
      ],
    };

    if (combine) {
      const combined = [];
      for (let i = 0; i < geometry.faces.length; i += 1) {
        for (const key in geometry.faces[i]) {
          combined.push(geometry.vertices[geometry.faces[i][key]]);
        }
      }
      geometry.vertices = combined;
    }

    return geometry;
  };

  const hex2rgb = hex => [
    (parseInt(`0x${hex[1]}${hex[2]}`, 16) | 0) / 255,
    (parseInt(`0x${hex[3]}${hex[4]}`, 16) | 0) / 255,
    (parseInt(`0x${hex[5]}${hex[6]}`, 16) | 0) / 255,
  ];

  const getRandom = value => (Math.random() * value) - (value / 2);

  const colors = ['#47debd', '#7821ec', '#fff95d'].map(color => hex2rgb(color));

  const geometry = createGeometry(0.035, true);
  const multiplier = 5000;
  const duration = 0.2;
  const delay = (1 - duration) / (multiplier - 1);

  const attributes = [
    {
      name: 'aPositionStart',
      size: 3,
      data: () => [getRandom(1), -2.5, 1],
    },
    {
      name: 'aControlPointOne',
      size: 3,
      data: () => [-4 + getRandom(2), -1 + getRandom(2), 1],
    },
    {
      name: 'aControlPointTwo',
      size: 3,
      data: () => [4 + getRandom(2), 1 + getRandom(2), 1],
    },
    {
      name: 'aPositionEnd',
      size: 3,
      data: () => [getRandom(1), 2.5, 1],
    },
    {
      name: 'aOffset',
      size: 1,
      data: i => [i * delay],
    },
    {
      name: 'aColor',
      size: 3,
      data: () => colors[Math.floor(Math.random() * colors.length)],
    },
  ];

  const uniforms = {
    uProgress: { type: 'float', value: 0 },
  };

  const vertexShader = `
    attribute vec3 position;
    attribute vec3 aPositionStart;
    attribute vec3 aControlPointOne;
    attribute vec3 aControlPointTwo;
    attribute vec3 aPositionEnd;
    attribute float aOffset;

    attribute vec3 aColor;
    varying lowp vec3 sharedColor;

    uniform float uProgress;
    uniform mat4 uProjMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uModelMatrix;

    mat4 rotationMatrix(vec3 axis, float angle){
      axis = normalize(axis);
      float s = sin(angle);
      float c = cos(angle);
      float oc = 1.0 - c;

      return mat4(
        oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0,
        oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0,
        oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0.0,
        0.0, 0.0, 0.0, 1.0
      );
    }

    vec3 bezier4(vec3 a, vec3 b, vec3 c, vec3 d, float t) {
      return mix(mix(mix(a, b, t), mix(b, c, t), t), mix(mix(b, c, t), mix(c, d, t), t), t);
    }

    void main () {
      float tProgress = min(1.0, max(0.0, (uProgress - aOffset)) / ${duration});
      vec3 newPosition = bezier4(aPositionStart, aControlPointOne, aControlPointTwo, aPositionEnd, tProgress);
      gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * (rotationMatrix(newPosition, 45.0 * tProgress)) * vec4(newPosition + position, 1.0);

      sharedColor = aColor;
    }
  `;

  const fragmentShader = `
    varying lowp vec3 sharedColor;

    void main() {
      gl_FragColor = vec4(sharedColor, 1.0);
    }
  `;

  const afterRender = (props) => {
    if (uniforms.uProgress.value > 1.0) {
      props.uniforms.uProgress.value = 0;
    } else {
      props.uniforms.uProgress.value += 0.0008;
    }
  };

  starlings({
    geometry,
    multiplier,
    attributes,
    uniforms,
    vertexShader,
    fragmentShader,
    afterRender,
    colorOffset: 0.1,
  });
