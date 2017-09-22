
import * as THREE from 'three';
export * from 'three/examples/js/loaders/OBJLoader';
export * from 'three/examples/js/controls/OrbitControls';
export * from './OBJExporter';
export * from './STLExporter';
// https://github.com/Microsoft/TypeScript/issues/4336#issuecomment-264636767
export import BAS = require('./BAS');

// export const BAS: typeof _BAS = _BAS;

declare module 'three' {

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

}

export * from 'three';

// export * from './OrbitControls';
