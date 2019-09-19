const tests = {
    simple: {
        dx: 'x',
        dy: 'y'
    },
    translationUp: {
        dx: 'x',
        dy: 'y-1'
    },
    translationDown: {
        dx: 'x',
        dy: 'y+1'
    },
    translationLeft: {
        dx: 'x+1',
        dy: 'y'
    },
    translationRight: {
        dx: 'x-1',
        dy: 'y'
    },

    sinAndCos: {
        dx: String.raw`\sin(x)`,
        dy: String.raw`\cos(y)`,
        minX: -2*Math.PI,
        maxX: 2*Math.PI,
        minY: -Math.PI,
        maxY: Math.PI,
    },
};

for(const test of Object.values(tests)) {
    test.minX = -5;
    test.maxX = 5;
    test.minY = -3;
    test.maxY = 3;
}

module.exports =  tests;
