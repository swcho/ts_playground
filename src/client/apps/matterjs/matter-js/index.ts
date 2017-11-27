
import * as Matter from 'matter-js';
import {Composite} from 'matter-js';

declare module 'matter-js' {

    class Common {

        static chain<F>(...funcs): F;

        static random(from?: number, to?: number): number;

        static chainPathAfter<T>(base: T, path: keyof T, func: Function): Function;

        static choose<T>(array: T[]): T;

        static extend<A, B>(obj1: A, obj2: B): A & B;
        static extend<A, B, C>(obj1: A, obj2: B, obj3: C): A & B & C;

    }

    // Class augmentation
    interface Bounds {
        max: Matter.Vector;
        min: Matter.Vector;
    }

    namespace Composite {
        export function bounds(composite: Composite): Bounds;
    }

    interface Constraint {
        angularStiffness: number;
    }

    type RenderObject = {
        bounds: Bounds;
    } | {
        position: Vector;
    } | {
        min: Vector;
        max: Vector;
    } | {
        x: number;
        y: number;
    };


    namespace Render {

        export function lookAt(render: Render, objects: RenderObject | RenderObject[], padding?: Vector, center?: boolean);

    }

    interface Render {

        mouse: Mouse;
    }

    interface IConstraintDefinition {
        /**
         * A Number that specifies the damping of the constraint, i.e. the amount of resistance applied to each body based on their velocities to limit the amount of oscillation. Damping will only be apparent when the constraint also has a very low stiffness. A value of 0.1 means the constraint will apply heavy damping, resulting in little to no oscillation. A value of 0 means the constraint will apply no damping.
         */
        damping?: number;
    }

    interface IMouseConstraintDefinition {
    }

}

Composite.bounds = function(composite) {
    let bodies = Matter.Composite.allBodies(composite),
        vertices = [];

    for (let i = 0; i < bodies.length; i += 1) {
        let body = bodies[i];
        vertices.push(body.bounds.min, body.bounds.max);
    }

    return Matter.Bounds.create(vertices);
};

export = Matter;
