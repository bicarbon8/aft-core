import * as os from 'os';

export module MachineInfo {
    export async function ip(): Promise<string> {
        var interfaces = os.networkInterfaces();
        var addresses = [];
        for (var k in interfaces) {
            for (var k2 in interfaces[k]) {
                var address = interfaces[k][k2];
                if (address.family === 'IPv4' && !address.internal) {
                    addresses.push(address.address);
                }
            }
        }
        if (addresses.length > 0) {
            return addresses[0];
        } else {
            return '127.0.0.1';
        }
    }

    export async function name(): Promise<string> {
        return os.hostname();
    }

    export async function user(): Promise<string> {
        return os.userInfo().username;
    }
}