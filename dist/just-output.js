/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["jo"] = factory();
	else
		root["jo"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/browserEnv.js":
/*!***************************!*\
  !*** ./src/browserEnv.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _main__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./main */ \"./src/main.js\");\n/* harmony import */ var _main__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_main__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};\n/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _main__WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== \"default\") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _main__WEBPACK_IMPORTED_MODULE_0__[__WEBPACK_IMPORT_KEY__]\n/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);\n\n\n\nlet resultsPath = 'results';\nlet currentTest;\n\nfunction startRun(lResultsPath, options) {\n    if (lResultsPath) resultsPath = lResultsPath;\n    //ENH: simplify integration with react app\n    justOutputUIRender(true);\n}\n\nfunction startTest(test) {\n    currentTest = test;\n}\n\nfunction writeTmpResult() {\n    //do nothing\n    //ENH: write file via a chrome plugin?\n}\n\nfunction getAcceptedResult() {\n    const acceptedFilePath = getAcceptedResultPath();\n    const url = acceptedFilePath + '?' + Math.random(); //add a random param to the url so that the browser doesn't use cached results\n    return _ajax(url);\n}\n\nfunction getAcceptedResultPath() {\n    return resultsPath + '/' + currentTest.filename + '.txt';\n}\n\nfunction handleResult(result) {\n    window.handleTestResult(result, currentTest);\n}\n\nfunction list(test) {\n    console.log('test:', test.testName);\n}\n\nfunction listFilename(test) {\n    console.log(test.testName + ': ' + test.filename);\n}\n\nfunction _ajax(url) {\n    return new Promise(function (resolve, reject) {\n        var request = new XMLHttpRequest();\n\n        function onload() {\n            if (request.status >= 200 && request.status < 400) {\n                var result = request.response || request.responseText || request.responseXML;\n                resolve(result);\n            } else {\n                var error = new Error('Status code was ' + request.status);\n                error.code = request.status;\n                error.responseText = request.responseText;\n                reject(error);\n            }\n        }\n\n        function onerror() {\n            reject(new Error(\"Can't XHR \" + JSON.stringify(url)));\n        }\n\n        try {\n            request.open('GET', url, true);\n            request.onreadystatechange = function () {\n                if (request.readyState === 4) {\n                    onload();\n                }\n            };\n            request.onload = request.load = onload;\n            request.onerror = request.error = onerror;\n            request.send();\n        } catch (exception) {\n            reject(exception);\n        }\n    });\n}\n\n(0,_main__WEBPACK_IMPORTED_MODULE_0__.setTestEnv)({\n    startRun,\n    startTest,\n    writeTmpResult,\n    getAcceptedResult,\n    handleResult,\n    list,\n    listFilename\n});\n\n//# sourceURL=webpack://jo/./src/browserEnv.js?");

/***/ }),

/***/ "./src/diff.js":
/*!*********************!*\
  !*** ./src/diff.js ***!
  \*********************/
/***/ ((module) => {

eval("//Adapted from https://github.com/Slava/diff.js\n\n// Refer to http://www.xmailserver.org/diff2.pdf\n\n// Longest Common Subsequence\n// @param A - sequence of atoms - Array\n// @param B - sequence of atoms - Array\n// @param equals - optional comparator of atoms - returns true or false,\n//                 if not specified, triple equals operator is used\n// @returns Array - sequence of atoms, one of LCSs, edit script from A to B\nvar LCS = function (A, B, /* optional */equals) {\n    // We just compare atoms with default equals operator by default\n    if (equals === undefined) equals = function (a, b) {\n        return a === b;\n    };\n\n    // NOTE: all intervals from now on are both sides inclusive\n    // Get the points in Edit Graph, one of the LCS paths goes through.\n    // The points are located on the same diagonal and represent the middle\n    // snake ([D/2] out of D+1) in the optimal edit path in edit graph.\n    // @param startA, endA - substring of A we are working on\n    // @param startB, endB - substring of B we are working on\n    // @returns Array - [\n    //                   [x, y], - beginning of the middle snake\n    //                   [u, v], - end of the middle snake\n    //                    D,     - optimal edit distance\n    //                    LCS ]  - length of LCS\n    var findMidSnake = function (startA, endA, startB, endB) {\n        var N = endA - startA + 1;\n        var M = endB - startB + 1;\n        var Max = N + M;\n        var Delta = N - M;\n        var halfMaxCeil = (Max + 1) / 2 | 0;\n\n        var overlap = null;\n\n        // Maps -Max .. 0 .. +Max, diagonal index to endpoints for furthest reaching\n        // D-path on current iteration.\n        var V = {};\n        // Same but for reversed paths.\n        var U = {};\n\n        // Special case for the base case, D = 0, k = 0, x = y = 0\n        V[1] = 0;\n        // Special case for the base case reversed, D = 0, k = 0, x = N, y = M\n        U[Delta - 1] = N;\n\n        // Iterate over each possible length of edit script\n        for (var D = 0; D <= halfMaxCeil; D++) {\n            // Iterate over each diagonal\n            for (var k = -D; k <= D && !overlap; k += 2) {\n                // Positions in sequences A and B of furthest going D-path on diagonal k.\n                var x, y;\n\n                // Choose from each diagonal we extend\n                if (k === -D || k !== D && V[k - 1] < V[k + 1])\n                    // Extending path one point down, that's why x doesn't change, y\n                    // increases implicitly\n                    x = V[k + 1];\n                    // Extending path one point to the right, x increases\n                else x = V[k - 1] + 1;\n\n                // We can calculate the y out of x and diagonal index.\n                y = x - k;\n\n                if (isNaN(y) || x > N || y > M) continue;\n\n                var xx = x;\n                // Try to extend the D-path with diagonal paths. Possible only if atoms\n                // A_x match B_y\n                while (x < N && y < M && // if there are atoms to compare\n                equals(A[startA + x], B[startB + y])) {\n                    x++;\n                    y++;\n                }\n\n                // We can safely update diagonal k, since on every iteration we consider\n                // only even or only odd diagonals and the result of one depends only on\n                // diagonals of different iteration.\n                V[k] = x;\n\n                // Check feasibility, Delta is checked for being odd.\n                if ((Delta & 1) === 1 && inRange(k, Delta - (D - 1), Delta + (D - 1))) if (V[k] >= U[k])\n                    // Forward D-path can overlap with reversed D-1-path\n                    // Found an overlap, the middle snake, convert X-components to dots\n                    overlap = [xx, x].map(el => toPoint(el, k));\n            }\n\n            if (overlap) var SES = D * 2 - 1;\n\n            // Iterate over each diagonal for reversed case\n            for (var k = -D; k <= D && !overlap; k += 2) {\n                // The real diagonal we are looking for is k + Delta\n                var K = k + Delta;\n                var x, y;\n                if (k === D || k !== -D && U[K - 1] < U[K + 1]) x = U[K - 1];else x = U[K + 1] - 1;\n\n                y = x - K;\n                if (isNaN(y) || x < 0 || y < 0) continue;\n                var xx = x;\n                while (x > 0 && y > 0 && equals(A[startA + x - 1], B[startB + y - 1])) {\n                    x--;\n                    y--;\n                }\n                U[K] = x;\n\n                if (Delta % 2 === 0 && inRange(K, -D, D)) if (U[K] <= V[K]) overlap = [x, xx].map(el => toPoint(el, K));\n            }\n\n            if (overlap) {\n                SES = SES || D * 2;\n                // Remember we had offset of each sequence?\n                for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) overlap[i][j] += [startA, startB][j] - i;\n                return overlap.concat([SES, (Max - SES) / 2]);\n            }\n        }\n    };\n\n    var lcsAtoms = [];\n    var lcs = function (startA, endA, startB, endB) {\n        var N = endA - startA + 1;\n        var M = endB - startB + 1;\n\n        if (N > 0 && M > 0) {\n            var middleSnake = findMidSnake(startA, endA, startB, endB);\n            // A[x;u] == B[y,v] and is part of LCS\n            var x = middleSnake[0][0],\n                y = middleSnake[0][1];\n            var u = middleSnake[1][0],\n                v = middleSnake[1][1];\n            var D = middleSnake[2];\n\n            if (D > 1) {\n                lcs(startA, x - 1, startB, y - 1);\n                if (x <= u) {\n                    lcsAtoms.push(...A.slice(x, u + 1));\n                }\n                lcs(u + 1, endA, v + 1, endB);\n            } else if (M > N) lcsAtoms.push(...A.slice(startA, endA + 1));else lcsAtoms.push(...B.slice(startB, endB + 1));\n        }\n    };\n\n    lcs(0, A.length - 1, 0, B.length - 1);\n    return lcsAtoms;\n};\n\n// Helpers\nvar inRange = function (x, l, r) {\n    return l <= x && x <= r || r <= x && x <= l;\n};\n\n// Takes X-component as argument, diagonal as context,\n// returns array-pair of form x, y\nvar toPoint = function (x, diagonal) {\n    return [x, x - diagonal];\n};\n\n// Wrappers\nLCS.StringLCS = function (A, B) {\n    return LCS(A.split(''), B.split('')).join('');\n};\n\n// Exports\nif (true) module.exports = LCS;\n\n// Diff sequence\n// @param A - sequence of atoms - Array\n// @param B - sequence of atoms - Array\n// @param equals - optional comparator of atoms - returns true or false,\n//                 if not specified, triple equals operator is used\n// @returns Array - sequence of objects in a form of:\n//   - operation: one of \"none\", \"add\", \"delete\"\n//   - atom: the atom found in either A or B\n// Applying operations from diff sequence you should be able to transform A to B\n\nvar diff = function (A, B, equals) {\n    // We just compare atoms with default equals operator by default\n    if (equals === undefined) equals = function (a, b) {\n        return a === b;\n    };\n\n    var diff = [];\n    var i = 0,\n        j = 0;\n    var N = A.length,\n        M = B.length,\n        K = 0;\n\n    while (i < N && j < M && equals(A[i], B[j])) i++, j++;\n\n    while (i < N && j < M && equals(A[N - 1], B[M - 1])) N--, M--, K++;\n\n    diff.push(...A.slice(0, i));\n\n    var lcs = LCS(A.slice(i, N), B.slice(j, M), equals);\n\n    for (var k = 0; k < lcs.length; k++) {\n        var atom = lcs[k];\n        var ni = customIndexOf.call(A, atom, i, equals);\n        var nj = customIndexOf.call(B, atom, j, equals);\n\n        // Delete unmatched atoms from A\n        diff.push(...A.slice(i, ni).map(function (atom) {\n            return { operation: 'delete', atom: atom };\n        }));\n\n        // Add unmatched atoms from B\n        diff.push(...B.slice(j, nj).map(function (atom) {\n            return { operation: 'add', atom: atom };\n        }));\n\n        // Add the atom found in both sequences\n        diff.push({ operation: 'none', atom: atom });\n\n        i = ni + 1;\n        j = nj + 1;\n    }\n\n    // Don't forget about the rest\n\n    diff.push(...A.slice(i, N).map(function (atom) {\n        return { operation: 'delete', atom: atom };\n    }));\n\n    diff.push(...B.slice(j, M).map(function (atom) {\n        return { operation: 'add', atom: atom };\n    }));\n\n    diff.push(...A.slice(N, N + K).map(function (atom) {\n        return { operation: 'none', atom: atom };\n    }));\n\n    return diff;\n};\n\n// Accepts custom comparator\nvar customIndexOf = function (item, start, equals) {\n    var arr = this;\n    for (var i = start; i < arr.length; i++) if (equals(item, arr[i])) return i;\n    return -1;\n};\n\n// Exports\nmodule.exports = diff;\n\n//# sourceURL=webpack://jo/./src/diff.js?");

/***/ }),

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("let runTests = (() => {\n    var _ref2 = _asyncToGenerator(function* (filter, resultsPath) {\n        cancelRun = false;\n        testsEnv.startRun(resultsPath, options);\n        for (const aTest of tests) {\n            if (cancelRun || filter && !_includeTest(filter, aTest)) continue;\n\n            currentTest = aTest;\n            currentTest.output = '';\n            currentTest.subTests = [];\n            testsEnv.startTest(currentTest);\n            try {\n                yield runTest(currentTest.testFunc);\n                for (const subTest of currentTest.subTests) {\n                    yield runTest(subTest);\n                }\n            } catch (e) {\n                _handleUnexpectedRejection(e);\n            }\n            try {\n                yield testsEnv.writeTmpResult();\n            } catch (e) {\n                console.log(e);\n            }\n            let expectedResult;\n            try {\n                expectedResult = yield testsEnv.getAcceptedResult();\n            } catch (reason) {}\n            const comparison = _compareResultToAccepted(expectedResult);\n            testsEnv.handleResult(comparison);\n        }\n    });\n\n    return function runTests(_x, _x2) {\n        return _ref2.apply(this, arguments);\n    };\n})();\n\nlet runTest = (() => {\n    var _ref3 = _asyncToGenerator(function* (testFunc) {\n        try {\n            yield testFunc();\n        } catch (e) {\n            _handleUnexpectedRejection(e);\n        }\n    });\n\n    return function runTest(_x3) {\n        return _ref3.apply(this, arguments);\n    };\n})();\n\nfunction _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step(\"next\", value); }, function (err) { step(\"throw\", err); }); } } return step(\"next\"); }); }; }\n\nconst diff = __webpack_require__(/*! ./diff */ \"./src/diff.js\");\n\nconst tests = [];\nconst options = {\n    tmpdir: undefined //default is up to env\n};\nlet currentSuite;\nlet currentTest;\nlet cancelRun = false;\nlet testsEnv;\n\nfunction setTestEnv(env) {\n    testsEnv = env;\n}\n\n/**\n * Declares a test suite\n * @param  {string} name        Name of test suite\n * @param  {function} [tests]   Tests to run. If not specified, all tests declared until next call will be considered part of this suite\n */\nfunction suite(name, tests) {\n    currentSuite = name;\n    if (tests) {\n        tests();\n        currentSuite = undefined;\n    }\n}\n\n/**\n * Declares a test\n * @param  {string} name        Name of test\n * @param  {function} testFunc  Function to execute as part of test\n */\nfunction test(name, testFunc) {\n    const fullName = currentSuite ? currentSuite + '_' + name : name;\n    const testName = fullName;\n    const filename = options.getFileName ? options.getFileName(testName) : testName;\n\n    tests.push({\n        name: fullName,\n        testFunc,\n        suite: currentSuite,\n        filename: filename.replace(/[^a-z0-9]/gi, '_'),\n        testName: testName.replace(/[^a-z0-9]/gi, '_')\n    });\n}\n\nfunction output(...args) {\n    const strArgs = args.map(value => typeof value == 'string' ? value : _stringify(value));\n    currentTest.output += strArgs.join(' ');\n    currentTest.output += '\\n';\n}\n\nfunction section(name, test) {\n    if (typeof test == 'function') {\n        output('\\n***', name);\n        test();\n    } else {\n        output('\\n***', ...arguments);\n    }\n}\n\nfunction subTest(name, test) {\n    currentTest.subTests.push(_asyncToGenerator(function* () {\n        output('\\n***', name);\n        try {\n            yield test();\n        } catch (e) {\n            _handleUnexpectedRejection(e);\n        }\n    }));\n}\n\nfunction config(newOptions) {\n    Object.assign(options, newOptions);\n}\n\nfunction cancelTests() {\n    cancelRun = true;\n}\n\nfunction listTests(filter) {\n    getTests(filter).forEach(testsEnv.list);\n}\n\nfunction listTestFilenames(filter) {\n    getTests(filter).forEach(testsEnv.listFilename);\n}\n\nfunction getTests(filter) {\n    if (!filter) return tests;\n    return tests.filter(_includeTest.bind(null, filter));\n}\n\nvar _includeTest = function (filter, test) {\n    var testName = test.testName;\n    return testName.match(filter) != null;\n};\n\nfunction _handleUnexpectedRejection(reason) {\n    var error = reason instanceof Error ? reason : new Error(reason.msg || reason);\n\n    if (document && document.location && document.location.search && document.location.search.indexOf('spec=') >= 0) {\n        //individual test run\n        if (document.location.search.indexOf('catch=false') >= 0) {\n            throw error;\n        } else {\n            console.log(error.stack);\n            _outputErrorStack(error);\n        }\n    } else {\n        //full run (node or browser)\n        _outputErrorStack(error);\n    }\n}\n\nfunction _outputErrorStack(error) {\n    error.stack.split('\\n').forEach(line => output(line));\n}\n\nfunction _stringify(obj, indentLvl) {\n    var type = Object.prototype.toString.call(obj);\n    indentLvl = indentLvl || 1;\n    var indent = new Array(indentLvl + 1).join('\\t'),\n        indentClose = new Array(indentLvl).join('\\t');\n    if (type === '[object Object]') {\n        var pairs = [];\n        for (var k in obj) {\n            if (!obj.hasOwnProperty(k)) continue;\n            pairs.push([k, _stringify(obj[k], indentLvl + 1)]);\n        }\n        pairs.sort(function (a, b) {\n            return a[0] < b[0] ? -1 : 1;\n        });\n        pairs = pairs.reduce(function (m, v, i) {\n            return (i ? m + ',\\n' : '') + indent + '\"' + v[0] + '\": ' + v[1];\n        }, '');\n        return '{\\n' + pairs + '\\n' + indentClose + '}';\n    } else if (type === '[object Array]') {\n        return '[\\n' + obj.reduce(function (m, v, i) {\n            return (i ? m + ',\\n' : '') + indent + _stringify(v, indentLvl + 1);\n        }, '') + '\\n' + indentClose + ']';\n    } else if (type === '[object Number]') {\n        if (obj.toString().length > 13 || Math.abs(obj) > 1.0e12) {\n            return parseFloat(obj.toPrecision(12)).toString();\n        }\n        return obj.toString();\n    }\n\n    return JSON.stringify(obj, null, '\\t');\n}\n\nfunction _compareResultToAccepted(expected) {\n    const actual = currentTest.output;\n    let fullContext = false;\n\n    if (!expected) {\n        var message = 'No accepted output (' + testsEnv.getAcceptedResultPath() + ')';\n        if (fullContext) message += '. Output: \\n' + actual;\n        return { pass: false, message: message };\n    }\n\n    var comparison = diff(actual.split(/\\r?\\n/), expected.split(/\\r?\\n/));\n    var diffs = comparison.filter(aDiff => aDiff.operation == 'add' || aDiff.operation == 'delete');\n    var result = {\n        pass: diffs.length === 0,\n        message: ''\n    };\n    if (result.pass) {\n        result.message = 'output is equal to accepted output';\n    } else {\n        var lineDiffs = [];\n        (fullContext ? comparison : diffs).forEach(aDiff => {\n            if (aDiff.operation == 'add') {\n                lineDiffs.push('-  ' + aDiff.atom);\n            } else if (aDiff.operation == 'delete') {\n                lineDiffs.push('+  ' + aDiff.atom);\n            } else if (aDiff.atom) {\n                lineDiffs.push('   ' + aDiff.atom);\n            } else {\n                lineDiffs.push('   ' + aDiff);\n            }\n        });\n        result.message = 'Expected output to match accepted output:\\n' + lineDiffs.join('\\n');\n        result.diffs = diffs;\n        result.comparison = comparison;\n    }\n    return result;\n}\n\n//these functions will be exposed as globals\nconst framework = {\n    suite,\n    test,\n    tests,\n    output,\n    subTest,\n    section\n};\nObject.assign(__webpack_require__.g, framework);\n__webpack_require__.g.jo = framework;\n\n//these are not exposed as globals\nmodule.exports = Object.assign(framework, {\n    runTests,\n    listTests,\n    listTestFilenames,\n    cancelTests,\n    config,\n    setTestEnv\n});\n\n//# sourceURL=webpack://jo/./src/main.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/browserEnv.js");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});