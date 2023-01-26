const tests = [];
let currentSuite;
let current = {};

export function setCurrentTest(test) {
    current.test = test;
}

/**
 * Declares a test suite
 * @param  {string} name        Name of test suite
 * @param  {function} [tests]   Tests to run. If not specified, all tests declared until next call will be considered part of this suite
 */
export function suite(name, tests) {
    currentSuite = name;
    if (tests) {
        tests();
        currentSuite = undefined;
    }
}

/**
 * Declares a test, result is stored in a separate file
 * @param  {string} name        Name of test
 * @param  {function} testFunc  Function to execute as part of test
 */
export function test(name, testFunc) {
    const fullName = currentSuite ? currentSuite + '_' + name : name;

    tests.push({
        name: fullName.replace(/[^a-z0-9]/gi, '_'),
        testFunc,
        suite: currentSuite,
    });
}

/**
 * Defines a section in the current test
 * @param {string} name
 * @param {function} [test]
 */
export function section(name, test) {
    if (typeof test == 'function') {
        output('\n***', name);
        test();
    } else {
        output('\n***', ...arguments);
    }
}

/**
 * Defines a sub test
 * @param {string} name
 * @param {function} [test]
 */
export function subTest(name, test) {
    current.test.subTests.push(async function () {
        output('\n***', name);
        try {
            await test();
        } catch (e) {
            _handleUnexpectedRejection(e);
        }
    });
}

export function output(...args) {
    const strArgs = args.map((value) => (typeof value == 'string' ? value : _stringify(value)));
    current.test.output += strArgs.join(' ');
    current.test.output += '\n';
}

function _stringify(obj, indentLvl) {
    // if (obj instanceof Set) obj = [...obj];
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

//these functions will be exposed as globals
export default tests;
