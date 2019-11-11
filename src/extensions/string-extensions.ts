export {};

declare global {
    interface String {
        /**
         * shortens a string to the specified length and includes ellipsis
         * @param finalLength the maximum length of final string including ellipsis
         * @param ellipsisLocation the location from which to ellide (EllipsisLocation.Beginning|EllipsisLocation.Middle|EllipsisLocation.End). Defaults to End
         * @param ellipsis the value to use as the ellipsis. If not specified, '...' will be used
         */
        ellide(finalLength: number, ellipsisLocation?: number, ellipsis?: string): string;
    }
}

/**
 * shortens a string to the specified length and includes ellipsis
 * @param finalLength the maximum length of final string including ellipsis
 * @param ellipsisLocation the location from which to ellide (EllipsisLocation.Beginning|EllipsisLocation.Middle|EllipsisLocation.End). Defaults to End
 * @param ellipsis the value to use as the ellipsis. If not specified, '...' will be used
 */
String.prototype.ellide = function(finalLength: number, ellipsisLocation?: number, ellipsis?: string): string {
    if (ellipsisLocation === undefined) {
        ellipsisLocation = 2;
    }
    if (ellipsis === undefined) {
        ellipsis = '...';
    }
    
    if (finalLength >= 5 && this.length > finalLength) {
        switch (ellipsisLocation) {
            case 0: // EllipsisLocation.beginning
                let shortenedStr: string = this.substring((this.length - finalLength) + ellipsis.length);
                return ellipsis + shortenedStr;
            case 1: // EllipsisLocation.middle
                let beginningStr: string = this.substring(0, this.length / 2);
                let endStr: string = this.substring(this.length / 2);
                let shortenedBeginningStr: string = new String(beginningStr).ellide((finalLength / 2) - (ellipsis.length / 2), 2, ''); // 2 = EllipsisLocation.end
                let shortenedEndStr: string = new String(endStr).ellide((finalLength / 2) - (ellipsis.length / 2), 0, ''); // 0 = EllipsisLocation.beginning
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
                let finalStr: string = shortenedBeginningStr +
                                ellipsis +
                                shortenedEndStr;
                return finalStr;
            case 2: // EllipsisLocation.end
            default:
                var shortStr = this.substring(0, (finalLength - ellipsis.length));
                return shortStr + ellipsis;
        }
    }
    return this; // no need to ellide so return original string
}