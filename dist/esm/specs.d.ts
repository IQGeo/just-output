/** @param {Test} test */
export function setCurrentTest(test: Test): void;
/**
 * Declares a test suite
 * @param  {string} name        Name of test suite
 * @param  {function} [tests]   Tests to run. If not specified, all tests declared until next call will be considered part of this suite
 */
export function suite(name: string, tests?: Function): void;
/**
 * Declares a test, result is stored in a separate file
 * @overload
 * @param {string} name Name of test
 * @param {Function} optsOrFunc Test function
 * @returns {void}
 */
export function test(name: string, optsOrFunc: Function): void;
/**
 * Declares a test, result is stored in a separate file
 * @overload
 * @param {string} name Name of test
 * @param {TestOptions} optsOrFunc Test options
 * @param {Function} func Test function
 * @returns {void}
 */
export function test(name: string, optsOrFunc: TestOptions, func: Function): void;
/**
 * Defines a section in the current test
 * @param {string} name
 * @param {function} [test] Optional sub test to execute
 */
export function section(name: string, test?: Function, ...args: any[]): void;
/**
 * Defines a sub test.
 * Output will be in same file as parent test but identified with the sub test's name.
 * Options aren't currently used and are only supported for parity with `test`.
 * @overload
 * @param {string} name Name of test
 * @param {Function} optsOrFunc Test function
 * @returns {void}
 */
export function subTest(name: string, optsOrFunc: Function): void;
/**
 * Defines a sub test.
 * Output will be in same file as parent test but identified with the sub test's name.
 * Options aren't currently used and are only supported for parity with `test`.
 * @overload
 * @param {string} name Name of test
 * @param {Record<string, any>} optsOrFunc Test options
 * @param {Function} func Test function
 * @returns {void}
 */
export function subTest(name: string, optsOrFunc: Record<string, any>, func: Function): void;
/**
 * Outputs the given arguments to the result of the test.
 * Values are stringified for readability and sorted for consistency
 * @param  {...any} args
 */
export function output(...args: any[]): void;
/** @type {Array<Test>} */
export const tests: Array<Test>;
export default tests;
export type Test = {
    name: string;
    testFunc: Function;
    testOpts: TestOptions;
    suite: string;
    output?: string;
    subTests?: Array<Function>;
    filename?: string;
};
export type TestOptions = {
    testFilename?: string | ((testName: string) => string);
    shouldRunTest?: boolean | string | (() => boolean | string);
    tags?: Array<string>;
};
