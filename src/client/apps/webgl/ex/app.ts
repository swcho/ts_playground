
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

import {mat4} from 'gl-matrix';
import * as utils from './utils';

console.log(__filename);
console.log('WebGL Trials')

var gl: WebGLRenderingContext = null; // WebGL context
var prg = null; // The program (shaders)
var c_width = 0; // Variable to store the width of the canvas
var c_height = 0; // Variable to store the height of the canvas

var mvMatrix = mat4.create(); // The Model-View matrix
var pMatrix = mat4.create(); // The projection matrix

/*-----------------------------------------------------*/
var nMatrix =  mat4.create();       // The normal matrix
/*-----------------------------------------------------*/

var verticesBuffer;
var indicesBuffer;

/*-----------------------------------------------------*/
var normalsBuffer;               //VBO for normals
/*-----------------------------------------------------*/


var vertices;
var indices;
/*-----------------------------------------------------*/
var normals;              //JavaScript Array for normals
/*-----------------------------------------------------*/

/**
* The program contains a series of instructions that tell the Graphic Processing Unit (GPU)
* what to do with every vertex and fragment that we pass it.
* The vertex shader and the fragment shader together are called the program.
*/
function initProgram() {
    var fragmentShader          = utils.getFragShaderFromSource(gl, require('./fragment.glsl'));
    var vertexShader            = utils.getVertShaderFromSource(gl, require('./vertex.glsl'));

    prg = gl.createProgram();
    gl.attachShader(prg, vertexShader);
    gl.attachShader(prg, fragmentShader);
    gl.linkProgram(prg);

    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(prg);

    prg.aVertexPosition  = gl.getAttribLocation(prg, "aVertexPosition");
    prg.aVertexNormal    = gl.getAttribLocation(prg, "aVertexNormal");

    prg.uPMatrix      = gl.getUniformLocation(prg, "uPMatrix");
    prg.uMVMatrix        = gl.getUniformLocation(prg, "uMVMatrix");
    prg.uNMatrix         = gl.getUniformLocation(prg, "uNMatrix");

    prg.uLightDirection  = gl.getUniformLocation(prg, "uLightDirection");
    prg.uLightAmbient    = gl.getUniformLocation(prg, "uLightAmbient");
    prg.uLightDiffuse    = gl.getUniformLocation(prg, "uLightDiffuse");
    prg.uMaterialDiffuse = gl.getUniformLocation(prg, "uMaterialDiffuse");

}


function initLights(){
    gl.uniform3fv(prg.uLightDirection,  [0.0, 0.0, -1.0]);
    gl.uniform4fv(prg.uLightAmbient,    [0.01,0.01,0.01,1.0]);
    gl.uniform4fv(prg.uLightDiffuse,    [0.5,0.5,0.5,1.0]);
    gl.uniform4f(prg.uMaterialDiffuse, 0.1,0.5,0.8,1.0);
}

/**
* This function generates the example data and create the buffers
*
*           4          5             6         7
*           +----------+-------------+---------+
*           |          |             |         |
*           |          |             |         |
*           |          |             |         |
*           |          |             |         |
*           |          |             |         |
*           +----------+-------------+---------+
*           0          1             2         3
*
*/
function initBuffers()
{
    vertices = [
    -20.0, -7.0, 20.0,  //0
    -10.0, -7.0,  0.0,  //1
    10.0, -7.0,  0.0,  //2
    20.0, -7.0, 20.0,  //3

    -20.0,  7.0, 20.0,  //4
    -10.0,  7.0,  0.0,  //5
    10.0,  7.0,  0.0,  //6
    20.0,  7.0, 20.0   //7
    ];

    indices = [
    0,5,4,
    1,5,0,
    1,6,5,
    2,6,1,
    2,7,6,
    3,7,2
    ];

    normals = utils.calculateNormals(vertices, indices);

    verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    indicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

}

/**
* Main rendering function. Called every 500ms according to WebGLStart function (see below)
*/
function drawScene() {

    gl.clearColor(0.12,0.12,0.12, 1.0);
    gl.clearDepth(100.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.viewport(0, 0, c_width, c_height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



    mat4.perspective(pMatrix, 45, c_width / c_height, 0.1, 10000.0);
    mat4.identity(mvMatrix);

    //distance
    mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, -40.0]);

    gl.uniformMatrix4fv(prg.uMVMatrix, false, mvMatrix);
    gl.uniformMatrix4fv(prg.uPMatrix, false, pMatrix);

    mat4.copy(nMatrix, mvMatrix);
    mat4.invert(nMatrix, nMatrix);
    mat4.transpose(nMatrix, nMatrix);

    gl.uniformMatrix4fv(prg.uNMatrix, false, nMatrix);

    try{
        //1. Enabling Vertex Attributes
        gl.enableVertexAttribArray(prg.aVertexPosition);
        gl.enableVertexAttribArray(prg.aVertexNormal);

        //2. Bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
        gl.vertexAttribPointer(prg.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
        gl.vertexAttribPointer(prg.aVertexNormal,3,gl.FLOAT, false, 0,0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indicesBuffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
    catch(err){
        alert(err);
        console.log(err.description);
    }
}

/**
* Render Loop
*/
function renderLoop() {
    requestAnimationFrame(renderLoop);
    drawScene();
}

/**
* Entry point. This function is invoked when the page is loaded
*/
function runWebGLApp() {
    //Obtains a WebGL context
    const ret = utils.getGLContext("canvas-element-id");
    gl = ret.context;
    c_width = ret.width;
    c_height = ret.height
    //Initializes the program (shaders)
    initProgram();
    //Initializes the buffers that we are going to use
    initBuffers();
    //Initializes lights
    initLights();
    //Renders the scene!
    renderLoop();
}

runWebGLApp();
