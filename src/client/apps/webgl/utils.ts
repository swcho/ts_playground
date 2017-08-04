
/**
* Provides requestAnimationFrame in a cross browser way.
*/
// const requestAnimFrame = (function() {
//     return window.requestAnimationFrame ||
//         window.webkitRequestAnimationFrame ||
//         window.mozRequestAnimationFrame ||
//         window.oRequestAnimationFrame ||
//         window.msRequestAnimationFrame ||
//         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
//             window.setTimeout(callback, 1000/60);
//         };
// })();

/**
 * Obtains a WebGL context for the canvas with id 'canvas-element-id'
 * This function is invoked when the WebGL app is starting.
 */
export function getGLContext(name): {
    context: WebGLRenderingContext;
    width: number;
    height: number;
} {
    let context: WebGLRenderingContext = null;
    let width: number;
    let height: number;

    const canvas = document.getElementById(name) as HTMLCanvasElement ;
    if (canvas == null){
        alert('there is no canvas on this page');
        return null;
    }
    else {
        width = canvas.width;
        height = canvas.height;
    }

    const names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];

    for (const name of names) {
        try {
            context = canvas.getContext(name) as WebGLRenderingContext;
        } catch(e) {}
        if (context) {
            break;
        }
    }
    if (context == null) {
        alert("Could not initialise WebGL");
        return null;
    } else {
        return {
            context,
            width,
            height,
        };
    }
}

/**
* Utilitary function that allows to set up the shaders (program) using an embedded script (look at the beginning of this source code)
*/
export function getShader(gl: WebGLRenderingContext, id): WebGLShader {
    const script = document.getElementById(id) as HTMLScriptElement;
    if (!script) {
        return null;
    }

    let str = "";
    let k = script.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    let shader;
    if (script.type === "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (script.type === "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

export function getVertShaderFromSource(gl: WebGLRenderingContext, src: string): WebGLShader {
    const shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

export function getFragShaderFromSource(gl: WebGLRenderingContext, src: string): WebGLShader {
    const shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

export function requestAnimFrame(o){
    requestAnimFrame(o);
}

//indices have to be completely defined NO TRIANGLE_STRIP only TRIANGLES
export function calculateNormals(vs: number[], ind: number[]) {
    var x=0;        var x=0;
    var y=1;
    var z=2;

    var ns = [];
    for(var i=0;i<vs.length;i=i+3){ //for each vertex, initialize normal x, normal y, normal z
        ns[i+x]=0.0;
        ns[i+y]=0.0;
        ns[i+z]=0.0;
    }

    for(var i=0;i<ind.length;i=i+3){ //we work on triads of vertices to calculate normals so i = i+3 (i = indices index)
        var v1 = [];
        var v2 = [];
        var normal = [];
        //p2 - p1
        v1[x] = vs[3*ind[i+2]+x] - vs[3*ind[i+1]+x];
        v1[y] = vs[3*ind[i+2]+y] - vs[3*ind[i+1]+y];
        v1[z] = vs[3*ind[i+2]+z] - vs[3*ind[i+1]+z];
        //p0 - p1
        v2[x] = vs[3*ind[i]+x] - vs[3*ind[i+1]+x];
        v2[y] = vs[3*ind[i]+y] - vs[3*ind[i+1]+y];
        v2[z] = vs[3*ind[i]+z] - vs[3*ind[i+1]+z];
        //cross product by Sarrus Rule
        normal[x] = v1[y]*v2[z] - v1[z]*v2[y];
        normal[y] = v1[z]*v2[x] - v1[x]*v2[z];
        normal[z] = v1[x]*v2[y] - v1[y]*v2[x];
        for(var j=0;j<3;j++){ //update the normals of that triangle: sum of vectors
            ns[3*ind[i+j]+x] =  ns[3*ind[i+j]+x] + normal[x];
            ns[3*ind[i+j]+y] =  ns[3*ind[i+j]+y] + normal[y];
            ns[3*ind[i+j]+z] =  ns[3*ind[i+j]+z] + normal[z];
        }
    }
    //normalize the result
    for(var i=0;i<vs.length;i=i+3){ //the increment here is because each vertex occurs with an offset of 3 in the array (due to x, y, z contiguous values)

        var nn=[];
        nn[x] = ns[i+x];
        nn[y] = ns[i+y];
        nn[z] = ns[i+z];

        var len = Math.sqrt((nn[x]*nn[x])+(nn[y]*nn[y])+(nn[z]*nn[z]));
        if (len == 0) len = 1.0;

        nn[x] = nn[x]/len;
        nn[y] = nn[y]/len;
        nn[z] = nn[z]/len;

        ns[i+x] = nn[x];
        ns[i+y] = nn[y];
        ns[i+z] = nn[z];
    }

    return ns;
}


export function calculateTangents(vertices, normals)
{
    var vs = vertices;
    var ts = [];
    for(var i=0;i<vs.length; i++){
        ts[i]=0.0;
    }
    return ts;
}
