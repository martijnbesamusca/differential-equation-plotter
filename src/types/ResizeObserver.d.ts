declare class ResizeObserver {
    constructor(callback: (entries: ResizeObserverEntry[], observer: ResizeObserver)=>void);
    disconnect(): void;
    observe(target: Element | SVGElement, options?: {box?: 'content-box'|'border-box'}): void;
    unobserve(target: Element | SVGElement): void;
}

declare class ResizeObserverEntry {
    readonly borderBoxSize: ResizeObserverBoxSize;
    readonly contentBoxSize: ResizeObserverBoxSize;
    readonly contentRect: DOMRectReadOnly;
    readonly target: Element | SVGElement;
}

declare class ResizeObserverBoxSize {
    blockSize: number;
    inlineSize: number;
}
