export * from "./specs.js";
export { specs };
export function testRunner(specs: Array<import("./specs.js").Test>, env?: import("./testRunner.js").TestEnv): TestRunner;
export const tests: TestRunner;
declare namespace _default {
    export { tests };
    export { testRunner };
    export { specs };
    export { suite };
    export { test };
    export { section };
    export { subTest };
    export { output };
}
export default _default;
import { tests as specs } from './specs.js';
import TestRunner from './testRunner.js';
import { suite } from './specs.js';
import { test } from './specs.js';
import { section } from './specs.js';
import { subTest } from './specs.js';
import { output } from './specs.js';
