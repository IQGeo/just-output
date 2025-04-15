export default class TestRunner {
    /**
     * @param {Array<import('./specs.js').Test>} tests
     * @param {TestEnv} env
     */
    constructor(tests: Array<import("./specs.js").Test>, env: TestEnv);
    _tests: import("./specs.js").Test[];
    /**
     * @param {TestRunnerOptions} newOptions
     */
    setOptions(newOptions: TestRunnerOptions): void;
    /**
     * @param {RegExp} filter
     * @param {string} resultsPath
     */
    run(filter: RegExp, resultsPath: string): Promise<void>;
    /**
     * @param {Function} testFunc
     */
    runTest(testFunc: Function): Promise<void>;
    cancelTests(): void;
    /**
     * @param {RegExp} filter
     */
    listTests(filter: RegExp): void;
    /**
     * Produce serializable metadata listing the tests and their test options,
     * tags, etc.
     *
     * @param {RegExp} filter
     * @returns {TestsMeta}
     */
    getTestsMeta(filter: RegExp): TestsMeta;
    /**
     * @param {RegExp} filter
     */
    listTestFilenames(filter: RegExp): Promise<void>;
    /**
     * @param {RegExp} filter
     * @param {ShouldRunTestOptions} options
     */
    getTests(filter: RegExp, options: ShouldRunTestOptions): import("./specs.js").Test[];
}
export type TestRunnerOptions = {
    tmpdir?: string;
    getFilename?: (test: import("./specs.js").Test) => string;
    getTestName?: (test: import("./specs.js").Test) => string;
};
export type TestEnv = {
    startRun: (resultsPath: string, opts: typeof options) => void;
    writeTmpResult: (test: import("./specs.js").Test) => void | Promise<void>;
    getAcceptedResult: (test: import("./specs.js").Test) => Promise<string | void>;
    getAcceptedResultPath: (test?: import("./specs.js").Test) => string;
    handleResult: (test: import("./specs.js").Test, result: TestResult) => void;
};
export type TestResult = {
    pass: boolean;
    message: string;
    diffs?: Array<import("./diff.js").Diff>;
    comparison?: Array<import("./diff.js").Diff>;
};
export type ShouldRunTestOptions = {
    logSkippedTests?: boolean;
};
export type SingleTestMeta = {
    name: string;
    testOpts: import("./specs.js").TestOptions;
    suite: string;
    filename?: string;
};
export type TestsMeta = {
    order: Array<string>;
    byTestName: {
        [x: string]: SingleTestMeta;
    };
};
declare namespace options {
    let tmpdir: any;
    function getFilename(test: import("./specs.js").Test): string;
    function getTestName(test: import("./specs.js").Test): string;
}
export {};
