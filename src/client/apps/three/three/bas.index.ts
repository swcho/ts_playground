
// export * from 'three-bas/dist/bas';
import * as THREE from 'three';
export * from 'three-bas/dist/bas.module';

interface BaseAnimationMaterialParameters extends THREE.ShaderMaterialParameters {
    uniformValues?: any;
    // uniformValues: {
    //     map: THREE.Texture;
    // };

    varyingParameters?: string[];

    vertexFunctions?: string[];
    vertexParameters?: string[];
    vertexInit?: string[];
    vertexNormal?: string[];
    vertexPosition?: string[];
    vertexColor?: string[];

    fragmentFunctions?: string[];
    fragmentParameters?: string[];
    fragmentInit?: string[];
    fragmentMap?: string[];
    fragmentDiffuse?: string[];
}

export declare class BaseAnimationMaterial extends THREE.ShaderMaterial {
    constructor(params: BaseAnimationMaterialParameters);
}

export declare class BasicAnimationMaterial extends BaseAnimationMaterial {
    constructor(params: BaseAnimationMaterialParameters);
}

export declare class PhongAnimationMaterial extends BaseAnimationMaterial {
    constructor(params: BaseAnimationMaterialParameters);
}

export interface ModelBufferGeometryOptions {
    computeCentroids?: boolean;
    localizeFaces?: boolean;
}

export declare class ModelBufferGeometry extends THREE.BufferGeometry {
    constructor(model: THREE.Geometry, options?: ModelBufferGeometryOptions);

    centroids: THREE.Vector3[];

    /**
     * Creates a THREE.BufferAttribute with UV coordinates.
     */
    bufferUVs();

    /**
     * Creates a THREE.BufferAttribute on this geometry instance.
     *
     * @param {String} name Name of the attribute.
     * @param {int} itemSize Number of floats per vertex (typically 1, 2, 3 or 4).
     * @param {function=} factory Function that will be called for each face upon creation. Accepts 3 arguments: data[], index and faceCount. Calls setFaceData.
     *
     * @returns {THREE.BufferAttribute}
     */
    createAttribute(name: string, itemSize: number, factory?): THREE.BufferAttribute;
}

export declare class PrefabBufferGeometry extends THREE.BufferGeometry {
    constructor(prefab: THREE.Geometry, count: number);
    bufferIndices();
    bufferPositions();
    bufferUvs();
    createAttribute(name: string, itemSize: number, factory?): THREE.BufferAttribute;
    setPrefabData(attribute: string | THREE.BufferAttribute, prefabIndex: number, data: any[]);
}

export declare namespace Utils {
    /**
     * Duplicates vertices so each face becomes separate.
     * Same as THREE.ExplodeModifier.
     *
     * @param {THREE.Geometry} geometry Geometry instance to modify.
     */
    export function separateFaces(geometry): THREE.Geometry;
};

type ShaderChunkName =
    'catmull_rom_spline' |
    'cubic_bezier' |
    'ease_back_in' |
    'ease_back_in_out' |
    'ease_back_out' |
    'ease_bezier' |
    'ease_bounce_in' |
    'ease_bounce_in_out' |
    'ease_bounce_out' |
    'ease_circ_in' |
    'ease_circ_in_out' |
    'ease_circ_out' |
    'ease_cubic_in' |
    'ease_cubic_in_out' |
    'ease_cubic_out' |
    'ease_elastic_in' |
    'ease_elastic_in_out' |
    'ease_elastic_out' |
    'ease_expo_in' |
    'ease_expo_in_out' |
    'ease_expo_out' |
    'ease_quad_in' |
    'ease_quad_in_out' |
    'ease_quad_out' |
    'ease_quart_in' |
    'ease_quart_in_out' |
    'ease_quart_out' |
    'ease_quint_in' |
    'ease_quint_in_out' |
    'ease_quint_out' |
    'ease_sine_in' |
    'ease_sine_in_out' |
    'ease_sine_out' |
    'quaternion_rotation' |
    'quaternion_slerp';

export declare const ShaderChunk: { [key in ShaderChunkName]: string; };
