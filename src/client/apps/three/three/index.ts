
import * as THREE from 'three';
export * from './OBJExporter';
export * from './STLExporter';

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

    class MaterialMissing extends THREE.Material {
        uniforms: { [uniform: string]: THREE.IUniform };
    }

    // interface Material {
    //     uniforms: any;
    // }

}

export * from 'three';

// export * from './OrbitControls';
