// import MathLive from './lib/mathlive.js';
declare var MathLive: any;
declare var MASTON: any;

interface IMathFieldConfig{
    onFocus: (mathfield: any) => any,
    onBlur: (mathfield: any) => any,
    onContentDidChange: (mathfield: any) => any,
}

class equationMathField {
    cfg : IMathFieldConfig = {
        onFocus: equationMathField.toggleFocus,
        onBlur: equationMathField.toggleFocus,
        onContentDidChange: equationMathField.onContentDidChange
    };

    mathfield: any;
    mathJax: any;

    constructor(id: string) {
        this.mathfield = MathLive.makeMathField(id, this.cfg);
        this.mathfield.boundTo = this;
        this.mathfield.element.classList.remove('focus');
    }

    static toggleFocus(mathfield: any){
        // debugger;
        if (mathfield.element.querySelector('textarea') === document.activeElement) {
            mathfield.element.classList.add('focus');
        } else {
            mathfield.element.classList.remove('focus');
        }
    }

    static onContentDidChange(mathfield: any) {
        try {
            const ast = MathLive.latexToAST(mathfield.latex());
            mathfield.boundTo.mathJax = mastonToMathjs(ast, {});
            console.log(mathfield.boundTo.mathJax);
        } catch(e) {
            console.log(e);
        }
    }
}

/* Making mathfield */

const dxMathField = new equationMathField('mathfield-dx');
const dyMathField = new equationMathField('mathfield-dy');

const mat11MathField = new equationMathField('mathfield-mat11');
const mat12MathField = new equationMathField('mathfield-mat12');
const mat21MathField = new equationMathField('mathfield-mat21');
const mat22MathField = new equationMathField('mathfield-mat22');

const drMathField = new equationMathField('mathfield-dr');
const dtMathField = new equationMathField('mathfield-dt');

/* Tabs */
const applyDxDy = document.getElementById( 'apply-dxdy')!;
const applyA = document.getElementById( 'apply-A')!;
const applyDrDt = document.getElementById( 'apply-drdt')!;

applyDxDy.addEventListener('click', ()=>{
    console.log('dx', dxMathField.mathJax);
    console.log('dy', dyMathField.mathJax);
});

applyA.addEventListener('click', ()=>{
    console.log('mat11', mat11MathField.mathJax);
    console.log('mat12', mat12MathField.mathJax);
    console.log('mat21', mat21MathField.mathJax);
    console.log('mat22', mat22MathField.mathJax);
});

applyDrDt.addEventListener('click', ()=>{
    console.log('dr', drMathField.mathJax);
    console.log('dt', dtMathField.mathJax);
});

/* MathLive to Mathjax */
function applySuperscriptAsPower(mjs: any, maston: any, config: object) {
    let result = mjs;
    if (typeof maston === 'object' && maston.sup !== undefined) {
        result = new math.expression.node.FunctionNode(
            'pow', [result, mastonToMathjs(maston.sup, config)]);
    }
    return result;
}
function getMathjsArgs(maston: any, config: object) : any[] {
    let result = [];
    if (Array.isArray(maston.arg)) {
        for (let index = 0; index < maston.arg.length; index++) {
            result.push(mastonToMathjs(maston.arg[index], config));
        }
    } else {
        result = [mastonToMathjs(maston.arg, config)];
    }
    return result;
}
/**
 * Return an array of arguments, with the sub if present as the last argument.
 */
function getMathjsArgsWithSub(maston:any, config: object): any {
    const result = getMathjsArgs(maston, config);
    if (maston.sub !== undefined) {
        result.push(mastonToMathjs(maston.sub, config));
    }
    return result;
}

/**
 * Return a mathjs node tree corresponding to the MASTON object
 * @param {Object} ast
 */
function mastonToMathjs(maston:any, config: any): any {
    let result;
    if (maston === undefined) return undefined;
    if (typeof maston === 'number' || maston.num !== undefined) {
        let n = typeof maston === 'number' ? maston : maston.num;
        // Convert to BigNum if required
        if (config.number === 'BigNumber') n = math.bignumber(n);
        result = new math.expression.node.ConstantNode(n);
        // Apply the superscript as an operation
        result = applySuperscriptAsPower(result, maston, config);
    } else if (typeof maston === 'string' || maston.sym !== undefined) {
        const BUILT_IN_CONSTANTS:  {[key: string]: any; }  = {
            'π':        math.pi,
            '\u03c4':   math.tau,         // GREEK SMALL LETTER TAU
            '\u212f':   math.e,           // ℯ SCRIPT SMALL E
            '\u2147':   math.e,           // ⅇ DOUBLE-STRUCK ITALIC SMALL E
            'e':        math.e,
            '\u03d5':   math.phi,         //  GREEK SMALL LETTER PHI
            '\u2148':   math.i,           // ⅈ DOUBLE-STRUCK ITALIC SMALL I
            '\u2149':   math.i,           // ⅉ DOUBLE-STRUCK ITALIC SMALL J
            'i':        math.i,           //
        };
        const symbol = typeof maston === 'string' ? maston : maston.sym;
        if (BUILT_IN_CONSTANTS[symbol]) {
            result = new math.expression.node.ConstantNode(BUILT_IN_CONSTANTS[symbol]);
        } else {
            // TODO whitelist characters.
            result = new math.expression.node.SymbolNode(maston);
            // result = new math.expression.node.SymbolNode(MASTON.asSymbol(maston));
        }
        result = applySuperscriptAsPower(result, maston, config);
    } else if (maston.op !== undefined) {
        if (maston.lhs !== undefined && maston.rhs !== undefined) {
            const OPERATOR_FUNCTIONS: {[key: string]: string} = {
                '+':    'add',
                '-':    'subtract',
                '*':    'multiply',
                '/':    'divide',
                // '.*': 'dotMultiply',
                // './': 'dotDivide',
                '%': 'mod',
                'mod': 'mod'
            };
            const args = [mastonToMathjs(maston.lhs, config), mastonToMathjs(maston.rhs, config)];
            result = new math.expression.node.OperatorNode(
                maston.op, OPERATOR_FUNCTIONS[maston.op], args);
        } else if (maston.rhs !== undefined) {
            const UNARY_OPERATOR_FUNCTIONS: {[key: string]: string} = {
                '-': 'unaryMinus',
                '+': 'unaryPlus',
                // '~': 'bitNot',
                // 'not': 'not'
            };
            result = new math.expression.node.OperatorNode(
                maston.op, UNARY_OPERATOR_FUNCTIONS[maston.op],
                [mastonToMathjs(maston.rhs, config)]);
        }

    } else if (maston.fn) {
        if (maston.fn === 'log' ||
            (maston.fn === 'ln' && maston.fn.sub !== undefined)) {
            result = new math.expression.node.FunctionNode(
                'log', getMathjsArgsWithSub(maston, config));

        } else if (maston.fn === 'lb') {
            const args = getMathjsArgs(maston, config);
            args.push(new math.expression.node.ConstantNode(math.bignumber(2)));
            result = new math.expression.node.FunctionNode('log', args);
        } else if (maston.fn === 'lg') {
            result = new math.expression.node.FunctionNode(
                new math.expression.node.SymbolNode('log10'),
                getMathjsArgs(maston, config));
        } else {
            const FUNCTIONS: {[key: string]: string} = {
                '+':    'add',
                '-':    'subtract',
                '*':    'multiply',
                '/':    'divide',
                'randomReal':       'random',
                'randomInteger':    'randomInt',
                'Gamma':            'gamma',
                'Re':               're',
                'Im':               'im',
                'binom':            'composition',
                'ucorner':          'ceil',
                'lcorner':          'floor',
                'arccos':           'acos',
                'arcsin':           'asin',
                'arctan':           'atan',
                'arcosh':           'acosh',
                'arsinh': '         asinh'
            };
            const fnName  = FUNCTIONS[maston.fn] || maston.fn;
            result = new math.expression.node.FunctionNode(
                fnName, getMathjsArgs(maston, config));
        }
    } else if (maston.group) {
        result = applySuperscriptAsPower(
            mastonToMathjs(maston.group, config), maston, config);
    }
    return result;
}

