import diff from './diff.js';
import specs, { setCurrentTest, output } from './specs.js';

const options = {
    tmpdir: undefined, //default is up to env
    getFilename: (test) => test.name,
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
        for (const test of this._tests) {
            if (cancelRun) break;
            if (filter && !_includeTest(filter, test)) continue;
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
        if (filter && c !== 1) console.log(`Ran ${c} tests out of ${this._tests.length}`);
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
        this.getTests(filter).forEach((test) => {
            console.log('test:', options.getTestName(test));
        });
    }

    listTestFilenames(filter) {
        this.getTests(filter).forEach((test) => {
            console.log(test.testName + ': ' + options.getFilename(test));
        });
    }

    getTests(filter) {
        if (!filter) return specs;
        return specs.filter(_includeTest.bind(null, filter));
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
