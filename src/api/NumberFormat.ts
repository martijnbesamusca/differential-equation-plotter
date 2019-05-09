export default class NumberFormat {
    private maxLength: number;
    private decimalFormat: Intl.NumberFormat;

    constructor(maxLength: number) {
        this.maxLength = maxLength;
        this.decimalFormat = new Intl.NumberFormat(
            'en-US',
            {
                maximumSignificantDigits: maxLength,
            },
        );
    }

    public format(number: number) {
        let string = this.decimalFormat.format(number);
        if (string.length > this.maxLength) {
            string = number.toExponential(0);
        }
        return string;
    }
}
