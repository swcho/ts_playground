
import * as THREE from 'three';
export * from 'three/examples/js/loaders/OBJLoader';
export * from 'three/examples/js/controls/OrbitControls';
export * from 'three/examples/js/controls/FirstPersonControls';
export * from './OBJExporter';
export * from './STLExporter';

// for knot
export * from 'three/examples/js/postprocessing/EffectComposer';
export * from 'three/examples/js/postprocessing/ShaderPass';
export * from 'three/examples/js/postprocessing/RenderPass';
export * from 'three/examples/js/shaders/ColorCorrectionShader';
export * from 'three/examples/js/shaders/CopyShader';
export * from 'three/examples/js/shaders/FXAAShader';

// for mobius
export * from 'three/examples/js/postprocessing/UnrealBloomPass';
export * from 'three/examples/js/shaders/LuminosityHighPassShader';

// for universe
export * from 'three/examples/js/renderers/CanvasRenderer';

// for flip_pannel
export const Detector = require('three/examples/js/Detector') as any;

// export import BAS = require('three-bas/dist/bas');
export import BAS = require('./bas.index');
import { Geometry } from 'three';

// https://github.com/Microsoft/TypeScript/issues/4336#issuecomment-264636767
// export import BAS = require('./BAS');

// export const BAS: typeof _BAS = _BAS;

declare module 'three' {

    class Mesh<M = THREE.Material, G = THREE.Geometry> extends THREE.Object3D {
        constructor(geometry?: Geometry | THREE.BufferGeometry, material?: THREE.Material | THREE.Material []);

        geometry: G;
        material: M;
        drawMode: THREE.TrianglesDrawModes;
        morphTargetInfluences?: number[];
        morphTargetDictionary?: { [key: string]: number; };

        setDrawMode(drawMode: THREE.TrianglesDrawModes): void;
        updateMorphTargets(): void;
        getMorphTargetIndexByName(name: string): number;
        raycast(raycaster: THREE.Raycaster, intersects: any): void;
    }

    /**
     * A class for displaying particles in the form of variable size points. For example, if using the WebGLRenderer, the particles are displayed using GL_POINTS.
     *
     * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/objects/ParticleSystem.js">src/objects/ParticleSystem.js</a>
     */
    export class Points<G = THREE.Geometry, M = THREE.Material> extends THREE.Object3D {

        /**
         * @param geometry An instance of Geometry or BufferGeometry.
         * @param material An instance of Material (optional).
         */
        constructor(
            geometry?: G,
            material?: M
        );

        /**
         * An instance of Geometry or BufferGeometry, where each vertex designates the position of a particle in the system.
         */
        geometry: G;

        /**
         * An instance of Material, defining the object's appearance. Default is a PointsMaterial with randomised colour.
         */
        material: M;

        raycast(raycaster: THREE.Raycaster, intersects: any): void;
    }

    class DragControls extends THREE.EventDispatcher {
        constructor(objs: any[], camera: THREE.Camera, domElement: HTMLCanvasElement);
    }

    // interface MaterialParameters {
    // }

    interface MeshToonMaterialParameters extends THREE.MaterialParameters {
        color?: number;
        shininess?: number;
        reflectivity?: number;
        transparent?: boolean;
        opacity?: number;
        roughness?: number;
    }

    class MeshToonMaterial extends THREE.Material {
        constructor(param?: MeshToonMaterialParameters)
    }

    // interface Material {
    //     uniforms: any;
    // }

    // export const BAS: typeof _BAS;

    // export namespace BAS {

    // }

    export const ColorCorrectionShader: THREE.Shader;
    export const FilmShader: THREE.Shader;

    export class Pass {
        // if set to true, the pass is processed by the composer
        enabled: boolean;

        // if set to true, the pass indicates to swap read and write buffer after rendering
        needsSwap: boolean;

        // if set to true, the pass clears its buffer before rendering
        clear: boolean;

        // if set to true, the result of the pass is rendered to screen
        renderToScreen: boolean;
    }

    export class UnrealBloomPass extends THREE.Pass {
        constructor(resolution?: THREE.Vector2, strength?: number, radius?: number, threshold?: number);
    }

    /**
     *
     * https://threejs.org/docs/#api/geometries/ParametricBufferGeometry
     * https://github.com/mrdoob/three.js/blob/master/src/geometries/ParametricGeometry.js
     *
     * @export
     * @class ParametricBufferGeometry
     * @extends {Geometry}
     */
    export class ParametricBufferGeometry extends Geometry {
        /**
         * Creates an instance of ParametricBufferGeometry.
         * @param {any} func A function that takes in a u and v value each between 0 and 1 and returns a Vector3
         * @param {number} slices The count of slices to use for the parametric function
         * @param {number} stacks The count of stacks to use for the parametric function
         * @memberof ParametricBufferGeometry
         */
        constructor(func, slices: number, stacks: number);
    }

}




export * from 'three';

// export * from './OrbitControls';
