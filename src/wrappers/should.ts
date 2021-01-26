import { Func } from "../helpers/func";
import { ProcessingResult } from "../helpers/processing-result";
import { TestWrapperOptions } from "./test-wrapper-options";
import { TestWrapper } from "./test-wrapper";

/**
 * function creates a new TestWrapper that can be used like:
 * ```
 * await should(() => expect(true).toBeTruthy(), {description: 'expect true will always be truthy'});
 * await should(() => expect(false).toBeFalsy(), {testCases: ['C1234'], description: 'expect false is always falsy'});
 * await should(() => expect('foo').toBe('foo'));
 * await should((tw) => tw.logger().warn('foo'); expect('foo').not.toBe('bar'));
 * ```
 * @param expectation a function containing a test expectation like Jasmine `expect` or Chai `expect`
 * @param options an optional `ITestWrapperOptions` object containing additional options
 */
export const should = async function(expectation: Func<TestWrapper, any>, options?: TestWrapperOptions): Promise<ProcessingResult> {
    let t: TestWrapper = new TestWrapper(expectation, options);
    return await t.run();
}