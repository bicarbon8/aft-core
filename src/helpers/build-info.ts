export module BuildInfo {
    export async function name(): Promise<string> {
        // TODO: use Build Server plugin to get value
        return process.env['JOB_NAME'];
    }

    export async function number(): Promise<string> {
        // TODO: use Build Server plugin to get value
        return process.env['BUILD_NUMBER'];
    }
}