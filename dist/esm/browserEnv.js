let resultsPath = 'results';
/** @satisfies {import('./testRunner.js').TestEnv} */
const browserEnv = {
    startRun(lResultsPath, options) {
        if (lResultsPath)
            resultsPath = lResultsPath;
        //ENH: simplify integration with react app
        window.justOutputUIRender(true);
    },
    writeTmpResult(test) {
        //do nothing
        //ENH: write file via a chrome plugin?
    },
    getAcceptedResult(test) {
        const acceptedFilePath = getAcceptedResultPath(test);
        const url = acceptedFilePath + '?' + Math.random(); //add a random param to the url so that the browser doesn't use cached results
        return _ajax(url);
    },
    getAcceptedResultPath(test) {
        return getAcceptedResultPath(test);
    },
    handleResult(test, result) {
        window.handleTestResult(result, test);
    },
};
/** @type {import('./testRunner.js').TestEnv['getAcceptedResultPath']} */
function getAcceptedResultPath(test) {
    return resultsPath + '/' + test.filename + '.txt';
}
/**
 * @param {string} url
 */
function _ajax(url) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        function onload() {
            if (request.status >= 200 && request.status < 400) {
                var result = request.response || request.responseText || request.responseXML;
                resolve(result);
            }
            else {
                const error = /** @type {RequestError} */ (new Error('Status code was ' + request.status));
                error.code = request.status;
                error.responseText = request.responseText;
                reject(error);
            }
        }
        function onerror() {
            reject(new Error("Can't XHR " + JSON.stringify(url)));
        }
        try {
            request.open('GET', url, true);
            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    onload();
                }
            };
            request.onload = onload;
            request.onerror = onerror;
            request.send();
        }
        catch (exception) {
            reject(exception);
        }
    });
}
/**
 * @typedef {Error & { code: number; responseText: string; }} RequestError
 */
export default browserEnv;
