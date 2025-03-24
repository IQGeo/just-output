import { tests as specs, suite, test, section, subTest, output } from './specs.js';
import TestRunner from './testRunner.js';
import browserEnv from './browserEnv.js';
export * from './specs.js';
export { specs };
/**
 * @param {Array<import('./specs.js').Test>} specs
 * @param {import('./testRunner.js').TestEnv} env
 */
export const testRunner = (specs, env = browserEnv) => {
    return new TestRunner(specs, env);
};
export const tests = testRunner(specs);
// also export a default to be used as an external
export default {
    tests,
    testRunner,
    specs,
    suite,
    test,
    section,
    subTest,
    output,
};
