
const testsEnv = (typeof window == 'undefined') ? require('./nodeEnv') : require('./browserEnv');
const diff = require('./diff');
const _ = require('underscore');

const tests = [];
let currentSuite;
let currentTest;

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
    const fullName = currentSuite ? currentSuite+' '+name : name;
    tests.push({
        name: fullName, 
        testFunc, 
        suite: currentSuite,
        filename: fullName.replace(/[^a-z0-9]/gi, '_')
    });
}

function output() {
    var args = _.map(arguments, function (value) {return (typeof value == 'string') ? value : _stringify(value);} );
    currentTest.output += args.join(' ');
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
    currentTest.subTests.push(function () {
        output('\n***', name);
        return Promise.resolve().then(test)
        .catch(_handleUnexpectedRejection);
    });
}

function runTests( filter, resultsPath ) {
    testsEnv.startRun(resultsPath);
    return Promise.each(tests, function (aTest) {
        if (filter && !_includeTest(filter, aTest)) return;

        currentTest = aTest;
        currentTest.output = '';
        currentTest.subTests = [];
        testsEnv.startTest(currentTest);
        return runTest(currentTest.testFunc)
            .then(function () {
                return Promise.each(currentTest.subTests, runTest);
            })
            .catch(_handleUnexpectedRejection)
            .tap(testsEnv.writeTmpResult)
            .then(testsEnv.getAcceptedResult)
            .catch(reason => undefined)
            .then(_compareResultToAccepted)
            .then(testsEnv.handleResult);
    });
}

function runTest( testFunc ) {
    return Promise.resolve().then(testFunc)
        .catch(_handleUnexpectedRejection);
}

function listTests( filter ) {
    getTests(filter).forEach(testsEnv.list);
}


function getTests(filter) {
    if (!filter) return tests;
    return tests.filter(_includeTest.bind(null, filter));
}

var _includeTest = function (filter, test) {
    var testName = test.name;
    return (testName.match(filter) != null);
};

function _handleUnexpectedRejection(reason) {
    var error = (reason instanceof Error) ? reason : new Error(reason.msg || reason);

    if (document && document.location && document.location.search && 
        document.location.search.indexOf("spec=") >= 0) {
        //individual test run              
        if (document.location.search.indexOf("catch=false") >= 0) {
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
    if (error.stack && error.stack.indexOf("From previous event") >= 0) {
        //include full stack as it will include the line that originated the error
        _.each(error.stack.split('\n'), function (line) {
            output(line);
        }); 
    } else {
        //no need to clutter output since it won't include the request's origin
        output("Error: " + error.message);
    }
}

function _stringify(obj, indentLvl) {
    var type = Object.prototype.toString.call(obj);
    indentLvl = indentLvl || 1;
    var indent = new Array( indentLvl + 1 ).join('\t'), 
        indentClose = new Array( indentLvl ).join('\t');
    if (type === '[object Object]') {
        var pairs = [];
        for (var k in obj) {
            if (!obj.hasOwnProperty(k)) continue;
            pairs.push([k, _stringify(obj[k], indentLvl+1)]);
        }
        pairs.sort(function(a, b) { return a[0] < b[0] ? -1 : 1;});
        pairs = _.reduce(pairs, function(m, v, i) { return (i?m+',\n':'')+indent+'"' + v[0] + '": ' + v[1];}, '');
        return '{\n' + pairs + '\n'+indentClose+'}';
    } else if (type === '[object Array]') {
        return '[\n' + _.reduce(obj, function(m, v, i) { return (i?m+',\n':'')+indent+_stringify(v, indentLvl+1); }, '') + '\n'+indentClose+']';
    } else if (type === '[object Number]') {
        if ((obj.toString().length > 13) || (Math.abs(obj) > 1.0e+12)) {
            return parseFloat( obj.toPrecision(12) ).toString();
        }
        return obj.toString();
    }

    return JSON.stringify(obj, null, '\t');
}



function _compareResultToAccepted(expected) {
    const actual = currentTest.output;
    let fullContext = false;

    if (!expected) {
        var message = 'No accepted output ('+testsEnv.getAcceptedResultPath()+')';
        if (fullContext) message += '. Output: \n' +actual;
        return {pass: false, message: message};
    }

    var comparison = diff(actual.split(/\r?\n/), expected.split(/\r?\n/));
    var diffs = _.filter(comparison, function (aDiff) { return (aDiff.operation == "add" || aDiff.operation == "delete"); });                    
    var result = {
        pass: (diffs.length === 0),
        message: ''
    };
    if (result.pass) {
        result.message = "output is equal to accepted output";
    } else {
        var lineDiffs = [];
        _.each(fullContext ? comparison : diffs, function (aDiff) {
            if (aDiff.operation == "add") {
                lineDiffs.push('-  ' + aDiff.atom);
            } else if (aDiff.operation == "delete") {
                lineDiffs.push('+  ' + aDiff.atom);
            } else if (aDiff.atom) {
                lineDiffs.push('   ' + aDiff.atom);
            } else {
                lineDiffs.push('   ' + aDiff);
            }
        });
        result.message = "Expected output to match accepted output:\n" + lineDiffs.join('\n');
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
    section
};
Object.assign(global, framework);
global.jo = framework;

module.exports = Object.assign(framework, {
    runTests,
    listTests
});