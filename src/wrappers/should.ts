import { Func } from "../helpers/func";
import { ITestWrapperOptions } from "./itest-wrapper-options";
import { TestWrapper } from "./test-wrapper";

export const should = async function(expectation: Func<void, any>, options?: ITestWrapperOptions): Promise<TestWrapper> {
    let t: TestWrapper = new TestWrapper();
    return await t.init(expectation, options);
}