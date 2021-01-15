import { Func } from "../helpers/func";
import { IProcessingResult } from "../helpers/iprocessing-result";
import { ITestWrapperOptions } from "./itest-wrapper-options";
import { TestWrapper } from "./test-wrapper";

/**
 * function creates a new TestWrapper that can be used like:
 * ```
 * await should(() => expect(true).toBeTruthy(), {description: 'expect true will always be truthy'});
 * await should(() => expect(false).toBeFalsy(), {testCases: ['C1234'], description: 'expect false is always falsy'});
 * await should(() => expect('foo').toBe('foo'), {defects: ['AUTO-123', 'AUTO-234']});
 * ```
 * @param expectation a test expectation like Jasmine `expect` or Chai `expect`
 * @param options an optional `ITestWrapperOptions` object containing additional options
 */
export const should = async function(expectation: Func<void, any>, options?: ITestWrapperOptions): Promise<IProcessingResult> {
    let t: TestWrapper = new TestWrapper();
    return await t.run(expectation, options);
}