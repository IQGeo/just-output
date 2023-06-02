import diff from './diff.js';
import specs, { setCurrentTest, output } from './specs.js';

const options = {
    tmpdir: undefined, //default is up to env
    getFilename: async (test) => {
        const testFilenameFunc = test.testOpts.testFilename;
        if (testFilenameFunc === undefined) return test.name;
        if (typeof testFilenameFunc === 'function') return testFilenameFunc(test.name);
        else return testFilenameFunc;
    },
    getTestName: (test) => test.name,
};

let cancelRun = false;
let testsEnv;
let currentTest;

export default class TestRunner {
    constructor(tests, env) {
        this._tests = tests;
        testsEnv = env;
    }

    setOptions(newOptions) {
        Object.assign(options, newOptions);
    }

    async run(filter, resultsPath) {
        cancelRun = false;
        testsEnv.startRun(resultsPath, options);
        let c = 0;
        let totalTests = this._tests.length;

        for (const test of this._tests) {
            if (cancelRun) break;
            if (filter && !_includeTest(filter, test)) continue;
            if (!_shouldRunTest(test)) {
                totalTests--;
                continue;
            }

            c++;
            currentTest = test;
            setCurrentTest(test);
            test.output = '';
            test.subTests = [];
            test.filename = await options.getFilename(test);
            try {
                await this.runTest(test.testFunc);
                for (const subTest of test.subTests) {
                    await this.runTest(subTest);
                }
            } catch (e) {
                _handleUnexpectedRejection(e);
            }
            try {
                await testsEnv.writeTmpResult(test);
            } catch (e) {
                console.log(e);
            }
            let expectedResult;
            try {
                expectedResult = await testsEnv.getAcceptedResult(test);
            } catch (reason) {
                expectedResult = null;
            }
            const comparison = _compareResultToAccepted(expectedResult);
            testsEnv.handleResult(test, comparison);
        }
        if (c !== 1 && c !== totalTests) {
            console.log(`Ran ${c} tests out of ${totalTests}`);
        }
    }

    async runTest(testFunc) {
        try {
            await testFunc();
        } catch (e) {
            _handleUnexpectedRejection(e);
        }
    }

    cancelTests() {
        cancelRun = true;
    }

    listTests(filter) {
        const tests = this.getTests(filter, { logSkippedTests: false });
        tests.forEach((test) => {
            console.log('test:', options.getTestName(test));
        });
    }

    async listTestFilenames(filter) {
        const tests = this.getTests(filter, { logSkippedTests: false });
        const testFilenames = await Promise.all(tests.map((test) => options.getFilename(test)));
        tests.forEach((test, i) => {
            console.log(test.name + ': ' + testFilenames[i]);
        });
    }

    getTests(filter, options) {
        let tests = specs;
        if (filter) tests = tests.filter(_includeTest.bind(null, filter));
        tests = tests.filter((test) => _shouldRunTest(test, options));
        return tests;
    }
}

function _compareResultToAccepted(expected) {
    const actual = currentTest.output;
    let fullContext = false;

    if (expected === null) {
        var message = 'No accepted output (' + testsEnv.getAcceptedResultPath() + ')';
        if (fullContext) message += '. Output: \n' + actual;
        return { pass: false, message: message };
    }

    var comparison = diff(actual.split(/\r?\n/), expected.split(/\r?\n/));
    var diffs = comparison.filter(
        (aDiff) => aDiff.operation == 'add' || aDiff.operation == 'delete'
    );
    var result = {
        pass: diffs.length === 0,
        message: '',
    };
    if (result.pass) {
        result.message = 'output is equal to accepted output';
    } else {
        var lineDiffs = [];
        (fullContext ? comparison : diffs).forEach((aDiff) => {
            if (aDiff.operation == 'add') {
                lineDiffs.push('-  ' + aDiff.atom);
            } else if (aDiff.operation == 'delete') {
                lineDiffs.push('+  ' + aDiff.atom);
            } else if (aDiff.atom) {
                lineDiffs.push('   ' + aDiff.atom);
            } else {
                lineDiffs.push('   ' + aDiff);
            }
        });
        result.message = 'Expected output to match accepted output:\n' + lineDiffs.join('\n');
        result.diffs = diffs;
        result.comparison = comparison;
    }
    return result;
}

const _includeTest = function (filter, test) {
    return test.name.match(filter) != null;
};

const _shouldRunTest = function (test, { logSkippedTests = true } = {}) {
    const testName = options.getTestName(test);
    const shouldRunTestFunc = test.testOpts.shouldRunTest;
    if (shouldRunTestFunc === undefined) return true;

    const shouldRunTestRes =
        typeof shouldRunTestFunc === 'function' ? shouldRunTestFunc() : !!shouldRunTestFunc;
    if (typeof shouldRunTestRes === 'string') {
        if (logSkippedTests) console.log(`Skipping test ${testName}: ${shouldRunTestRes}`);
        return false;
    }

    if (shouldRunTestRes === false) {
        if (logSkippedTests) console.log(`Skipping test ${testName}`);
        return false;
    }

    return true;
};

function _handleUnexpectedRejection(reason) {
    var error = reason instanceof Error ? reason : new Error(reason.msg || reason);

    if (
        document &&
        document.location &&
        document.location.search &&
        document.location.search.indexOf('spec=') >= 0
    ) {
        //individual test run
        if (document.location.search.indexOf('catch=false') >= 0) {
            throw error;
        } else {
            console.log(error.stack);
            _outputErrorStack(error);
        }
    } else {
        //full run (node or browser)
        _outputErrorStack(error);
    }
}

function _outputErrorStack(error) {
    error.stack.split('\n').forEach((line) => output(line));
}
