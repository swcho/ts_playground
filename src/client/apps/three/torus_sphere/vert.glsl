varying vec3 vPos;
// varying vec3 vNormal;

uniform float uTick;

const float PI = 3.1415926;

mat2 calcRotate2D(float _time){
    float _sin = sin(_time);
    float _cos = cos(_time);
    return mat2(_cos, _sin, -_sin, _cos);
}

vec3 paramFunction1(){
    float u = -uv.x * 2.0 * PI;
    float v = uv.y * PI;

    float _x = sin(u) * sin(v);
    float _y = cos(u) * sin(v);
    float _z = cos(v);

    return vec3(_x, _y, _z);
}


vec3 paramFunction2(){
    float a = 3.0;
    float n = 3.0;
    float m = 1.0;

    float u = uv.x * 4.0 * PI;
    float v = uv.y * 2.0 * PI;

    float _x = (a + cos(n * u / 2.0) * sin(v) - sin(n * u / 2.0) * sin(2.0 * v)) * cos(m * u / 2.0);
    float _y = (a + cos(n * u / 2.0) * sin(v) - sin(n * u / 2.0) * sin(2.0 * v)) * sin(m * u / 2.0);
    float _z = sin(n * u / 2.0) * sin(v) + cos(n * u / 2.0) * sin(2.0 * v);

    return vec3(_x, _y, _z);
}


void main(){
    float time = uTick * 0.012;

    float shapeRatio = cos(time * 1.5 + sin(time * 1.5)) * 0.5 + 0.5;

    vec3 shape1 = paramFunction1() * 1.5;
    vec3 shape2 = paramFunction2();


    vec3 newPos =mix(shape2, shape1, shapeRatio);
    // vec3 newPos = shape2;

    vec3 scalePos = newPos * 4.0;


    vec3 rotatePos = scalePos;
    rotatePos.yz = calcRotate2D(time * 0.6) * rotatePos.yz;
    rotatePos.xz = calcRotate2D(time * 0.6) * rotatePos.xz;

    vec4 mvPos = vec4(rotatePos, 1.0);

    vPos = mvPos.xyz;
    // vNormal = normal;

    gl_Position =projectionMatrix * modelViewMatrix * mvPos; 
}