import { Validator } from "../../src/wrappers/validator";

describe('Validator', () => {
    it('treats null as success', async () => {
        let foo: Function = () => { return null; };
        let v: Validator = new Validator(() => foo());

        expect(() => v.because()).not.toThrow();
    });

    it('treats undefined as success', async () => {
        let foo: Function = () => { return undefined; };
        let v: Validator = new Validator(() => foo());

        expect(() => v.because()).not.toThrow();
    });

    it('treats true as success', async () => {
        let foo: Function = () => { return true; };
        let v: Validator = new Validator(() => foo());

        expect(() => v.because()).not.toThrow();
    });

    it('treats false as failure', async () => {
        let foo: Function = () => { return false; };
        let v: Validator = new Validator(() => foo());

        expect(() => v.because()).toThrow();
    });
});