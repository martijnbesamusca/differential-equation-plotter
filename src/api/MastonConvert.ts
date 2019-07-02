const constants: { [key: string]: number; } = {
    e: Math.E,
    ℯ: Math.E,
    ⅇ: Math.E,
    π: Math.PI,
    τ: 2 * Math.PI,
};

const functions: { [key: string]: string; } = {
    signum: 'Math.sign',
    exp: 'Math.exp',
    pow: 'Math.pow',
    sqrt: 'Math.sqrt',
    // root
    abs: 'Math.abs',
    min: 'Math.min',
    max: 'Math.max',
    floor: 'Math.floor',
    ceiling: 'Math.ceil',
    // gcd:,
    // compose
    mod: '%',
    cos: 'Math.cos',
    sin: 'Math.sin',
    tan: 'Math.tan',
    cotangent: '1 / Math.tan',
    sec: '1 / Math.cos',
    csc: '1 / Math.sin',
    acos: 'Math.acos',
    asin: 'Math.asin',
    atan: 'Math.atan',
    arccot: 'Math.PI / 2 - Math.atan',
    arcsec: 'Math.PI / 2 - Math.atan',
    arccsc: 'Math.PI / 2 - Math.atan',
    tanh: 'Math.tanh',
};

function MastonToJSFunction(maston: Maston, variables: string[] = ['x', 'y']) {
    try {
        return Function(...variables, 'return ' + JSFunctionGen(maston, variables)) as (x: number, y: number) => number;
    } catch (e) {
        throw e;
    }
}

function JSFunctionGen(maston: Maston, variables: string[]): string {
    let f = '';

    if (maston === undefined) { return ''; }

    if (typeof maston === 'number' || maston.num !== undefined) {
        const num = typeof maston === 'number' ? maston : maston.num;
        f = Number.parseFloat(num).toString();
    } else if (typeof maston === 'string' || maston.sym !== undefined) {
        let sym = typeof maston === 'string' ? maston : maston.sym;

        if (sym === 'θ' || sym === 'ϑ') {
            sym = 't';
        }

        if (constants[sym]) {
            f = constants[sym].toString();
        } else {
            if (!variables.includes(sym)) {
                // console.error(`Variable "${sym}" is not defined in the equation, only ${variables.join(', ')} are allowed.`);
                throw new Error(`Variable "${sym}" is not defined in the equation, only ${variables.join(', ')} are allowed.`);
            }

            f = maston.sym;
        }
    } else if (maston.fn !== undefined) {
        const args = maston.arg.map((arg: Maston) => JSFunctionGen(arg, variables));

        if (maston.fn === 'add') {
            f = args.join(') + (');
            f = '(' + f + ')';
        } else if (maston.fn === 'multiply') {
            f = args.join(') * (');
            f = '(' + f + ')';
        }  else if (maston.fn === 'subtract') {
            f = args[0] + '-' + args[1];
            f = '(' + f + ')';
        } else if (maston.fn === 'divide') {
            f = args[0] + '/' + args[1];
            f = '(' + f + ')';
        } else if (maston.fn === 'negate') {
            f = args[0] + '-' + args[1];
            f = '(' + f + ')';
        } else if (maston.fn === 'root') {
            f = `Math.pow(${args[0]}', 1/${args[1]})`;
        } else if (maston.fn === 'ln') {
            f = `Math.log(${args[0]})`;
        } else if (maston.fn === 'log') {
            const base = maston.sub ? JSFunctionGen(maston.sub, variables) : args[1];
            f = `Math.log(${args[0]}) / Math.log(${base})`;
        } else if (functions[maston.fn]) {
            f = functions[maston.fn] + '(' + args.join(', ') + ')';
        }
    }

    if (maston.sup) {
        f = `Math.pow(${f}, ${JSFunctionGen(maston.sup, variables)})`;
    }

    return f;
}

export {MastonToJSFunction, JSFunctionGen};
