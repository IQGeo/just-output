const diff = require('./diff');

const tests = [];
const options = {
    tmpdir: undefined, //default is up to env
};
let currentSuite;
let currentTest;
let cancelRun = false;
let testsEnv;

function setTestEnv(env) {
    testsEnv = env;
}

/**
 * Declares a test suite
 * @param  {string} name        Name of test suite
 * @param  {function} [tests]   Tests to run. If not specified, all tests declared until next call will be considered part of this suite
 */
function suite(name, tests) {
    currentSuite = name;
    if (tests) {
        tests();
        currentSuite = undefined;
    }
}

/**
 * Declares a test
 * @param  {string} name        Name of test
 * @param  {function} testFunc  Function to execute as part of test
 */
function test(name, testFunc) {
    const fullName = currentSuite ? currentSuite + '_' + name : name;
    const testName = fullName
    const filename = options.getFileName ? options.getFileName(testName) : testName;

    tests.push({
        name: fullName,
        testFunc,
        suite: currentSuite,
        filename: filename.replace(/[^a-z0-9]/gi, '_'),
        testName: testName.replace(/[^a-z0-9]/gi, '_')
    });
}

function output(...args) {
    const strArgs = args.map((value) => (typeof value == 'string' ? value : _stringify(value)));
    currentTest.output += strArgs.join(' ');
    currentTest.output += '\n';
}

function section(name, test) {
    if (typeof test == 'function') {
        output('\n***', name);
        test();
    } else {
        output('\n***', ...arguments);
    }
}

function subTest(name, test) {
    currentTest.subTests.push(async function () {
        output('\n***', name);
        try {
            await test();
        } catch (e) {
            _handleUnexpectedRejection(e);
        }
    });
}

function config(newOptions) {
    Object.assign(options, newOptions);
}

async function runTests(filter, resultsPath) {
    cancelRun = false;
    testsEnv.startRun(resultsPath, options);
    for (const aTest of tests) {
        if (cancelRun || (filter && !_includeTest(filter, aTest))) continue;

        currentTest = aTest;
        currentTest.output = '';
        currentTest.subTests = [];
        testsEnv.startTest(currentTest);
        try {
            await runTest(currentTest.testFunc);
            for (const subTest of currentTest.subTests) {
                await runTest(subTest);
            }
        } catch (e) {
            _handleUnexpectedRejection(e);
        }
        try {
            await testsEnv.writeTmpResult();
        } catch (e) {
            console.log(e);
        }
        let expectedResult;
        try {
            expectedResult = await testsEnv.getAcceptedResult();
        } catch (reason) {}
        const comparison = _compareResultToAccepted(expectedResult);
        testsEnv.handleResult(comparison);
    }
}

async function runTest(testFunc) {
    try {
        await testFunc();
    } catch (e) {
        _handleUnexpectedRejection(e);
    }
}

function cancelTests() {
    cancelRun = true;
}

function listTests(filter) {
    getTests(filter).forEach(testsEnv.list);
}

function listTestFilenames(filter) {
    getTests(filter).forEach(testsEnv.listFilename);
}

function getTests(filter) {
    if (!filter) return tests;
    return tests.filter(_includeTest.bind(null, filter));
}

var _includeTest = function (filter, test) {
    var testName = test.testName;
    return testName.match(filter) != null;
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

function _stringify(obj, indentLvl) {
    var type = Object.prototype.toString.call(obj);
    indentLvl = indentLvl || 1;
    var indent = new Array(indentLvl + 1).join('\t'),
        indentClose = new Array(indentLvl).join('\t');
    if (type === '[object Object]') {
        var pairs = [];
        for (var k in obj) {
            if (!obj.hasOwnProperty(k)) continue;
            pairs.push([k, _stringify(obj[k], indentLvl + 1)]);
        }
        pairs.sort(function (a, b) {
            return a[0] < b[0] ? -1 : 1;
        });
        pairs = pairs.reduce(function (m, v, i) {
            return (i ? m + ',\n' : '') + indent + '"' + v[0] + '": ' + v[1];
        }, '');
        return '{\n' + pairs + '\n' + indentClose + '}';
    } else if (type === '[object Array]') {
        return (
            '[\n' +
            obj.reduce(function (m, v, i) {
                return (i ? m + ',\n' : '') + indent + _stringify(v, indentLvl + 1);
            }, '') +
            '\n' +
            indentClose +
            ']'
        );
    } else if (type === '[object Number]') {
        if (obj.toString().length > 13 || Math.abs(obj) > 1.0e12) {
            return parseFloat(obj.toPrecision(12)).toString();
        }
        return obj.toString();
    }

    return JSON.stringify(obj, null, '\t');
}

function _compareResultToAccepted(expected) {
    const actual = currentTest.output;
    let fullContext = false;

    if (!expected) {
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

//these functions will be exposed as globals
const framework = {
    suite,
    test,
    tests,
    output,
    subTest,
    section,
};
Object.assign(global, framework);
global.jo = framework;

//these are not exposed as globals
module.exports = Object.assign(framework, {
    runTests,
    listTests,
    listTestFilenames,
    cancelTests,
    config,
    setTestEnv,
});
