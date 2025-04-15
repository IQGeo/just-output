import diff from './diff.js';
import specs, { setCurrentTest, output } from './specs.js';
/** @satisfies {TestRunnerOptions} */
const options = {
    tmpdir: undefined, //default is up to env
    getFilename: (test) => {
        const testFilenameFunc = test.testOpts.testFilename;
        if (testFilenameFunc === undefined)
            return test.name;
        if (typeof testFilenameFunc === 'function')
            return testFilenameFunc(test.name);
        else
            return testFilenameFunc;
    },
    getTestName: (test) => test.name,
};
let cancelRun = false;
/** @type {TestEnv} */
let testsEnv;
let currentTest;
export default class TestRunner {
    /**
     * @param {Array<import('./specs.js').Test>} tests
     * @param {TestEnv} env
     */
    constructor(tests, env) {
        this._tests = tests;
        testsEnv = env;
    }
    /**
     * @param {TestRunnerOptions} newOptions
     */
    setOptions(newOptions) {
        Object.assign(options, newOptions);
    }
    /**
     * @param {RegExp} filter
     * @param {string} resultsPath
     */
    async run(filter, resultsPath) {
        cancelRun = false;
        testsEnv.startRun(resultsPath, options);
        let c = 0;
        let totalTests = this._tests.length;
        for (const test of this._tests) {
            if (cancelRun)
                break;
            if (filter && !_includeTest(filter, test))
                continue;
            if (!_shouldRunTest(test)) {
                totalTests--;
                continue;
            }
            c++;
            currentTest = test;
            setCurrentTest(test);
            test.output = '';
            test.subTests = [];
            test.filename = options.getFilename(test);
            try {
                await this.runTest(test.testFunc);
                for (const subTest of test.subTests) {
                    await this.runTest(subTest);
                }
            }
            catch (e) {
                _handleUnexpectedRejection(e);
            }
            try {
                await testsEnv.writeTmpResult(test);
            }
            catch (e) {
                console.log(e);
            }
            let expectedResult;
            try {
                expectedResult = await testsEnv.getAcceptedResult(test);
            }
            catch (reason) {
                expectedResult = null;
            }
            const comparison = _compareResultToAccepted(expectedResult);
            testsEnv.handleResult(test, comparison);
        }
        if (c !== 1 && c !== totalTests) {
            console.log(`Ran ${c} tests out of ${totalTests}`);
        }
    }
    /**
     * @param {Function} testFunc
     */
    async runTest(testFunc) {
        try {
            await testFunc();
        }
        catch (e) {
            _handleUnexpectedRejection(e);
        }
    }
    cancelTests() {
        cancelRun = true;
    }
    /**
     * @param {RegExp} filter
     */
    listTests(filter) {
        const tests = this.getTests(filter, { logSkippedTests: false });
        tests.forEach((test) => {
            console.log('test:', options.getTestName(test));
        });
    }
    /**
     * Produce serializable metadata listing the tests and their test options,
     * tags, etc.
     *
     * @param {RegExp} filter
     * @returns {TestsMeta}
     */
    getTestsMeta(filter) {
        const tests = this.getTests(filter, { logSkippedTests: false });
        const testNames = tests.map(test => test.name);
        const metadataByName = tests.map(test => ({ ...test, filename: options.getFilename(test) }))
            .map(({ name, testOpts, suite, filename }) => ({ name, testOpts, suite, filename }))
            .reduce((obj, test) => (obj[test.name] = test, obj), {});
        return {
            "by_test_name": metadataByName,
            "order": testNames
        };
    }
    /**
     * @param {RegExp} filter
     */
    async listTestFilenames(filter) {
        const tests = this.getTests(filter, { logSkippedTests: false });
        tests.forEach((test) => {
            console.log(test.name + ': ' + options.getFilename(test));
        });
    }
    /**
     * @param {RegExp} filter
     * @param {ShouldRunTestOptions} options
     */
    getTests(filter, options) {
        let tests = specs;
        if (filter)
            tests = tests.filter(_includeTest.bind(null, filter));
        tests = tests.filter((test) => _shouldRunTest(test, options));
        return tests;
    }
}
function _compareResultToAccepted(expected) {
    const actual = currentTest.output;
    let fullContext = false;
    if (expected === null) {
        var message = 'No accepted output (' + testsEnv.getAcceptedResultPath() + ')';
        if (fullContext)
            message += '. Output: \n' + actual;
        return { pass: false, message: message };
    }
    var comparison = diff(actual.split(/\r?\n/), expected.split(/\r?\n/));
    var diffs = comparison.filter((aDiff) => {
        return (typeof aDiff === 'object' && (aDiff.operation == 'add' || aDiff.operation == 'delete'));
    });
    /** @type {TestResult} */
    var result = {
        pass: diffs.length === 0,
        message: '',
    };
    if (result.pass) {
        result.message = 'output is equal to accepted output';
    }
    else {
        var lineDiffs = [];
        (fullContext ? comparison : diffs).forEach((aDiff) => {
            if (typeof aDiff === 'object' && aDiff.operation == 'add') {
                lineDiffs.push('-  ' + aDiff.atom);
            }
            else if (typeof aDiff === 'object' && aDiff.operation == 'delete') {
                lineDiffs.push('+  ' + aDiff.atom);
            }
            else if (typeof aDiff === 'object' && aDiff.atom) {
                lineDiffs.push('   ' + aDiff.atom);
            }
            else {
                lineDiffs.push('   ' + aDiff);
            }
        });
        result.message = 'Expected output to match accepted output:\n' + lineDiffs.join('\n');
        result.diffs = diffs;
        result.comparison = comparison;
    }
    return result;
}
/**
 * @param {RegExp} filter
 * @param {import('./specs.js').Test} test
 */
const _includeTest = function (filter, test) {
    return test.name.match(filter) != null;
};
/**
 * @param {import('./specs.js').Test} test
 * @param {ShouldRunTestOptions} options
 */
const _shouldRunTest = function (test, { logSkippedTests = true } = {}) {
    const testName = options.getTestName(test);
    const shouldRunTestFunc = test.testOpts.shouldRunTest;
    if (shouldRunTestFunc === undefined)
        return true;
    const shouldRunTestRes = typeof shouldRunTestFunc === 'function' ? shouldRunTestFunc() : !!shouldRunTestFunc;
    if (typeof shouldRunTestRes === 'string') {
        if (logSkippedTests)
            console.log(`Skipping test ${testName}: ${shouldRunTestRes}`);
        return false;
    }
    if (shouldRunTestRes === false) {
        if (logSkippedTests)
            console.log(`Skipping test ${testName}`);
        return false;
    }
    return true;
};
function _handleUnexpectedRejection(reason) {
    var error = reason instanceof Error ? reason : new Error(reason.msg || reason);
    if (document &&
        document.location &&
        document.location.search &&
        document.location.search.indexOf('spec=') >= 0) {
        //individual test run
        if (document.location.search.indexOf('catch=false') >= 0) {
            throw error;
        }
        else {
            console.log(error.stack);
            _outputErrorStack(error);
        }
    }
    else {
        //full run (node or browser)
        _outputErrorStack(error);
    }
}
function _outputErrorStack(error) {
    error.stack.split('\n').forEach((line) => output(line));
}
/**
 * @typedef {object} TestRunnerOptions
 * @property {string} [tmpdir]
 * @property {(test: import('./specs.js').Test) => string} [getFilename]
 * @property {(test: import('./specs.js').Test) => string} [getTestName]
 */
/**
 * @typedef {object} TestEnv
 * @property {(resultsPath: string, opts: typeof options) => void} startRun
 * @property {(test: import('./specs.js').Test) => void | Promise<void>} writeTmpResult
 * @property {(test: import('./specs.js').Test) => Promise<string | void>} getAcceptedResult
 * @property {(test?: import('./specs.js').Test) => string} getAcceptedResultPath
 * @property {(test: import('./specs.js').Test, result: TestResult) => void} handleResult
 */
/**
 * @typedef {object} TestResult
 * @property {boolean} pass
 * @property {string} message
 * @property {Array<import('./diff.js').Diff>} [diffs]
 * @property {Array<import('./diff.js').Diff>} [comparison]
 */
/**
 * @typedef {object} ShouldRunTestOptions
 * @property {boolean} [logSkippedTests]
 */
/**
 * @typedef {object} SingleTestMeta
 * @property {string} name
 * @property {import('./specs.js').TestOptions} testOpts
 * @property {string} suite
 * @property {string} [filename]
 */
/**
 * @typedef {object} TestsMeta
 * @property {Array<string>} order
 * @property {Object.<string, SingleTestMeta>} by_test_name
 */
