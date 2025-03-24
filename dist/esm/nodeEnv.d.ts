export default nodeEnv;
declare namespace nodeEnv {
    function startRun(lResultsPath: string, options: {
        tmpdir: any;
        getFilename: (test: import("./specs.js").Test) => string;
        getTestName: (test: import("./specs.js").Test) => string;
    }): void;
    function writeTmpResult(test: import("./specs.js").Test): void;
    function getAcceptedResult(test: import("./specs.js").Test): Promise<string>;
    function getAcceptedResultPath(test: import("./specs.js").Test): string;
    function handleResult(test: import("./specs.js").Test, result: import("./testRunner.js").TestResult): void;
}
