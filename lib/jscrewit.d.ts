// Type definitions for JScrewIt

import { encode }   from './encode';
import { Feature }  from './feature';

export * from './encode';
export * from './feature';
export * from './feature-all';

interface JScrewIt
{
    Feature:    typeof Feature;
    encode:     typeof encode;
}

declare global
{
    /** Global JScrewIt object, available in browsers. */
    const JScrewIt: JScrewIt;
}

declare const JScrewIt: JScrewIt;

/** JScrewIt object, available in Node.js. */
export default JScrewIt;
