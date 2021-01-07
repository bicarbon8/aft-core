import { DefectStatus, IDefect, IDefectHandlerPlugin, RandomGenerator } from "../../../../src";

export class MockDefectHandlerPlugin implements IDefectHandlerPlugin {
    name: string = 'mock-defect-handler-plugin';
    async enabled(): Promise<boolean> {
        return true;
    }
    async getDefect(defectId: string): Promise<IDefect> {
        return {
            id: defectId, 
            title: RandomGenerator.getString(17),
            description: RandomGenerator.getString(150),
            status: RandomGenerator.getEnum(DefectStatus)
        } as IDefect;
    }
    async findDefects(searchTerm: string): Promise<IDefect[]> {
        switch (searchTerm) {
            case 'C1234':
                let d1: IDefect = await this.getDefect('AUTO-123');
                d1.status = DefectStatus.open;
                return [d1];
            case 'C2345':
                let d2: IDefect = await this.getDefect('AUTO-234');
                d2.status = DefectStatus.closed;
                return [d2];
            default: 
                let defects: IDefect[] = [];
                let randomCount: number = RandomGenerator.getInt(1, 5);
                for (var i=0; i<randomCount; i++) {
                    let defect: IDefect = {
                        id: RandomGenerator.getString(5),
                        title: RandomGenerator.getString(17),
                        description: RandomGenerator.getString(150),
                        status: RandomGenerator.getEnum(DefectStatus)
                    } as IDefect;
                    defects.push(defect);
                }
                return defects;
        }
    }
}