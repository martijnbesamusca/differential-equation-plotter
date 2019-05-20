declare const MathLive: mathlive.IMathLive;
declare const MASTON: object;

interface Maston {
    [key: string]: any;
}

declare namespace mathlive {

    export interface IMathLive {
        latexToAST(latex: string) : object,
        latexToMarkup(text: string, displayMode: string, format?: string) : string,
        latexToMathML(latex: string, options: object) : string,
        makeMathField(element: HTMLElement | string, config?: IMathFieldConfig): IMathField,
        pauseReadAloud(): void,
        playReadAloud(token: string, count: number | null) : void,
        readAloud(element: HTMLElement, text: string, config: object): void,
        readAloudStatus(): 'ready' | 'playing' | 'paused',
        renderMathInDocument(options?: object): void,
        renderMathInElement(element: HTMLElement | string, options?: object): void,
        resumeReadAloud(): void,

    }

    export interface IMathField {
        [option: string] : any
    }

    export interface IMathFieldConfig {
        horizontalSpacingScale? : number,
        [option: string] : any
    }
}
