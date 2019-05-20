const constants = {
    e: Math.E,
    ℯ: Math.E,
    ⅇ: Math.E,
    π:  Math.PI,
    τ: 2 * Math.PI,
}

function MastonToJSFunction(maston: Maston, variables: string[] = ['x', 'y']) {
    return Function(...variables, 'return ' + JSFunctionGen(maston, variables));
}
function JSFunctionGen(maston: Maston, variables: string[]): string {
    let f = '';

    if (maston.num !== undefined) {
        f = Number.parseFloat(maston.num).toString();
    } else if (maston.sym !== undefined) {
        if (maston.sym === 'e') {
            f = Math.E.toString();
        } else if (maston.sym === 'π') {
            f = Math.PI.toString();
        } else if (maston.sym === 'τ') {
            f = (2 * Math.PI).toString();
        } else {
            if (!variables.includes(maston.sym)) {
                console.error(`Variable "${maston.sym}" is not defined in the equation, only ${variables.join(', ')} are allowed.`);
            }

            f = maston.sym;
        }
    } else if (maston.fn !== undefined) {
        let args = maston.arg.map((arg:Maston) => JSFunctionGen(arg, variables));

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
        } else if (maston.fn === 'signum') {
            f = 'Math.sign(' + args[0] + ')';
        } else if (maston.fn === 'exponential') {
            f = 'Math.exp(' + args[0] + ')';
        } else if (maston.fn === 'power') {
            f = `Math.pow(${args[0]}, ${args[1]})`;
        } else if (maston.fn === 'square root') {
            f = 'Math.sqrt(' + args[0] + ')';
        } else if (maston.fn === 'root') {
            f = `Math.pow(${args[0]}', 1/${args[1]})`;
        } else if (maston.fn === 'natural log') {
            f = `Math.log(${args[0]})`;
        } else if (maston.fn === 'logarithm') {
            f = `Math.log(${args[0]}) / Math.log(${args[1]})`;
        }
    }

    if (maston.sup) {
        f = `Math.pow(${f}, ${JSFunctionGen(maston.sup, variables)})`;
    }

    return f;
}

export {MastonToJSFunction, JSFunctionGen};
