
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

export declare class DepthAnimationMaterial extends BaseAnimationMaterial {
    constructor(params: BaseAnimationMaterialParameters);
}

export declare class DistanceAnimationMaterial extends BaseAnimationMaterial {
    constructor(params: BaseAnimationMaterialParameters);
}

export declare class StandardAnimationMaterial extends BaseAnimationMaterial {
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
    export function separateFaces(geometry: THREE.Geometry): THREE.Geometry;

    /**
     * Compute the centroid (center) of a THREE.Face3.
     *
     * @param {THREE.Geometry} geometry Geometry instance the face is in.
     * @param {THREE.Face3} face Face object from the THREE.Geometry.faces array
     * @param {THREE.Vector3=} v Optional vector to store result in.
     * @returns {THREE.Vector3}
     */
    export function computeCentroid(geometry: THREE.Geometry, face: THREE.Face3, v?: THREE.Vector3): THREE.Vector3;

    /**
     * Get a random vector between box.min and box.max.
     *
     * @param {THREE.Box3} box THREE.Box3 instance.
     * @param {THREE.Vector3=} v Optional vector to store result in.
     * @returns {THREE.Vector3}
     */
    export function randomInBox(box: THREE.Box3, v: THREE.Vector3): THREE.Vector3;

    /**
     * Get a random axis for quaternion rotation.
     *
     * @param {THREE.Vector3=} v Option vector to store result in.
     * @returns {THREE.Vector3}
     */
    export function randomAxis(v: THREE.Vector3): THREE.Vector3;

    /**
     * Create a DepthAnimationMaterial for shadows from a THREE.SpotLight or THREE.DirectionalLight by copying relevant shader chunks.
     * Uniform values must be manually synced between the source material and the depth material.
     *
     * @see {@link http://three-bas-examples.surge.sh/examples/shadows/}
     *
     * @param {BaseAnimationMaterial} sourceMaterial Instance to get the shader chunks from.
     * @returns {DepthAnimationMaterial}
     */
    export function createDepthAnimationMaterial(sourceMaterial: BaseAnimationMaterial): DepthAnimationMaterial;

    /**
     * Create a DistanceAnimationMaterial for shadows from a THREE.PointLight by copying relevant shader chunks.
     * Uniform values must be manually synced between the source material and the distance material.
     *
     * @see {@link http://three-bas-examples.surge.sh/examples/shadows/}
     *
     * @param {BaseAnimationMaterial} sourceMaterial Instance to get the shader chunks from.
     * @returns {DistanceAnimationMaterial}
     */
    export function createDistanceAnimationMaterial(sourceMaterial: BaseAnimationMaterial): DistanceAnimationMaterial;
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
