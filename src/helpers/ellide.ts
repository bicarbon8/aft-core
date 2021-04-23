export enum EllipsisLocation {
    beginning = 0,
    middle = 1,
    end = 2
}
export const ellide = function(original: string, finalLength: number, ellipsisLocation: EllipsisLocation = EllipsisLocation.end, ellipsis: string = '...'): string {
    if (finalLength >= 5 && original.length > finalLength) {
        switch (ellipsisLocation) {
            case EllipsisLocation.beginning:
                let shortenedStr: string = original.substring((original.length - finalLength) + ellipsis.length);
                return `${ellipsis}${shortenedStr}`;
            case EllipsisLocation.middle:
                let beginningStr: string = original.substring(0, original.length / 2);
                let endStr: string = original.substring(original.length / 2);
                let shortenedBeginningStr: string = this.ellide(beginningStr, (finalLength / 2) - (ellipsis.length / 2), 2, ''); // 2 = EllipsisLocation.end
                let shortenedEndStr: string = this.ellide(endStr, (finalLength / 2) - (ellipsis.length / 2), 0, ''); // 0 = EllipsisLocation.beginning
                let removeFromBeginning: boolean = true;
                while (shortenedBeginningStr.length + ellipsis.length + shortenedEndStr.length > finalLength) {
                    if (removeFromBeginning) {
                        shortenedBeginningStr = shortenedBeginningStr.substring(0, shortenedBeginningStr.length - 1);
                        removeFromBeginning = false;
                    } else {
                        shortenedEndStr = shortenedEndStr.substring(1, shortenedEndStr.length - 1);
                        removeFromBeginning = true;
                    }
                }
                let finalStr: string = `${shortenedBeginningStr}${ellipsis}${shortenedEndStr}`;
                return finalStr;
            case EllipsisLocation.end:
            default:
                var shortStr = original.substring(0, (finalLength - ellipsis.length));
                return `${shortStr}${ellipsis}`;
        }
    }
    return original; // no need to ellide so return original string
};