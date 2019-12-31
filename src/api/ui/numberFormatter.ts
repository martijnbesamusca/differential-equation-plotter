import NumberFormat = Intl.NumberFormat;

export default class NumberFormatter {
    maxSize: number;
    maxNumber: number;
    minNumber: number;
    normalFmt: NumberFormat;
    exponentFmt: NumberFormat;

    constructor(minSize: number, maxSize: number) {
        this.maxSize = maxSize;
        this.minNumber = Math.max(-(10**maxSize), Number.MIN_SAFE_INTEGER);
        this.maxNumber = Math.min(10**(maxSize+1), Number.MAX_SAFE_INTEGER);
        this.normalFmt = new NumberFormat('us', {
            minimumSignificantDigits: minSize
        });
        this.exponentFmt = new NumberFormat(
            'us',
            {
                // style: '',
                minimumSignificantDigits: minSize,
                maximumSignificantDigits: maxSize
            }
        );

    }

    format(num: number): string {
        // Calculate normal size
        if(num > this.minNumber && num < this.maxNumber) {
            return this.normalFmt.format(num);
        }
        return this.exponentFmt.format(num);
    }
}
