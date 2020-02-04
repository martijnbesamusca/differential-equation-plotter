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
        this.normalFmt = new NumberFormat('en-IN', {
            minimumSignificantDigits: minSize,
            maximumSignificantDigits: maxSize,
            minimumIntegerDigits: 1,
            maximumFractionDigits: maxSize - 2,
        });
        this.exponentFmt = new NumberFormat(
            'en-IN',
            {
                // @ts-ignore ts has not implemented this yet
                notation: 'scientific',
                minimumSignificantDigits: minSize,
                maximumSignificantDigits: maxSize,
                minimumIntegerDigits: 1,
                maximumFractionDigits: maxSize - 1,
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
