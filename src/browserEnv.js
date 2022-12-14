let resultsPath = 'results';

function startRun(lResultsPath, options) {
    if (lResultsPath) resultsPath = lResultsPath;
    //ENH: simplify integration with react app
    justOutputUIRender(true);
}

function writeTmpResult(test) {
    //do nothing
    //ENH: write file via a chrome plugin?
}

function getAcceptedResult(test) {
    const acceptedFilePath = getAcceptedResultPath(test);
    const url = acceptedFilePath + '?' + Math.random(); //add a random param to the url so that the browser doesn't use cached results
    return _ajax(url);
}

function getAcceptedResultPath(test) {
    return resultsPath + '/' + test.filename + '.txt';
}

function handleResult(test, result) {
    window.handleTestResult(result, test);
}

function _ajax(url) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();

        function onload() {
            if (request.status >= 200 && request.status < 400) {
                var result = request.response || request.responseText || request.responseXML;
                resolve(result);
            } else {
                var error = new Error('Status code was ' + request.status);
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
            request.onload = request.load = onload;
            request.onerror = request.error = onerror;
            request.send();
        } catch (exception) {
            reject(exception);
        }
    });
}

export default { startRun, writeTmpResult, getAcceptedResult, getAcceptedResultPath, handleResult };
