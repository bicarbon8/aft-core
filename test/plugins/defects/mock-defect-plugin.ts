import { nameof } from "ts-simple-nameof";
import { DefectStatus, IDefect, AbstractDefectPlugin, rand, IDefectPluginOptions } from "../../../src";

export class MockDefectPlugin extends AbstractDefectPlugin {
    constructor(options?: IDefectPluginOptions) {
        super(nameof(MockDefectPlugin), options);
    }
    async onLoad(): Promise<void> {
        /* do nothing */
    }
    async getDefect(defectId: string): Promise<IDefect> {
        return {
            id: defectId, 
            title: rand.getString(17),
            description: rand.getString(150),
            status: rand.getEnum(DefectStatus)
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
                let randomCount: number = rand.getInt(1, 5);
                for (var i=0; i<randomCount; i++) {
                    let defect: IDefect = {
                        id: rand.getString(5),
                        title: rand.getString(17),
                        description: rand.getString(150),
                        status: rand.getEnum(DefectStatus)
                    } as IDefect;
                    defects.push(defect);
                }
                return defects;
        }
    }
    async dispose(error?: Error): Promise<void> {
        /* do nothing */
    }
}