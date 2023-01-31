import specs from './specs.js';
import TestRunner from './testRunner.js';
import browserEnv from './browserEnv.js';

export * from './specs.js';
export { specs };

export const testRunner = (specs, env = browserEnv) => {
    return new TestRunner(specs, env);
};

export const tests = testRunner(specs);
