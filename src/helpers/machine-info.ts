import * as os from 'os';

class Machine {
    async getIp(): Promise<string> {
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

    async getName(): Promise<string> {
        return os.hostname();
    }

    async getUser(): Promise<string> {
        return os.userInfo().username;
    }
}

export interface MachineInfoData {
    ip?: string;
    name?: string;
    user?: string;
}

export module MachineInfo {
    const _machine: Machine = new Machine();
    export async function get(): Promise<MachineInfoData> {
        return {
            ip: await _machine.getIp(),
            name: await _machine.getName(),
            user: await _machine.getUser()
        };
    }
}