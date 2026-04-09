// Type definitions for JScrewIt

import type { EncodeInterface }     from './encode';
import type { FeatureConstructor }  from './feature';

export type *   from './encode';
export type *   from './feature';
export type *   from './feature-all';

interface JScrewIt
{
    Feature:    FeatureConstructor;
    encode:     EncodeInterface;
}

declare global
{
    /** Global JScrewIt object, available in browsers. */
    const JScrewIt: JScrewIt;
}

declare const JScrewIt: JScrewIt;

/** JScrewIt object, available in Node.js. */
export default JScrewIt;
