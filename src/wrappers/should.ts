import { Func } from "../helpers/func";
import { ITestWrapperOptions } from "./itest-wrapper-options";
import { TestWrapper } from "./test-wrapper";

/**
 * function creates a new TestWrapper that can be used like:
 * ```
 * should(() => expect(true).toBeTruthy()).because('true will always be truthy');
 * should(() => expect(false).toBeFalsy(), {testCases: ['C1234']}).because('false is always falsy');
 * should(() => expect('foo').toBe('foo'), {because: 'string foo is foo', testCases: ['C1245', 'C3344']});
 * ```
 * @param expectation a test expectation like Jasmine.Assert.expect Chai.Assert.expect
 * @param options an optional ITestWrapperOptions object containing additional options
 */
export const should = async function(expectation: Func<void, any>, options?: ITestWrapperOptions): Promise<TestWrapper> {
    let t: TestWrapper = new TestWrapper();
    return await t.init(expectation, options);
}