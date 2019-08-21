declare module "mathlive" {
  export function latexToAST(latex: string): object;
  export function latexToMarkup(
    text: string,
    displayMode: string,
    format?: string
  ): string;
  export function latexToMathML(latex: string, options: object): string;
  export function makeMathField(
    element: HTMLElement | string,
    config?: IMathFieldConfig
  ): IMathField;
  export function pauseReadAloud(): void;
  export function playReadAloud(token: string, count: number | null): void;
  export function readAloud(
    element: HTMLElement,
    text: string,
    config: object
  ): void;
  export function readAloudStatus(): "ready" | "playing" | "paused";
  export function renderMathInDocument(options?: object): void;
  export function renderMathInElement(
    element: HTMLElement | string,
    options?: object
  ): void;
  export function resumeReadAloud(): void;

  export interface Maston {
    [key: string]: any;
  }

  export interface IMathField {
    [option: string]: any;
  }

  export interface IMathFieldConfig {
    horizontalSpacingScale?: number;
    [option: string]: any;
  }
}
