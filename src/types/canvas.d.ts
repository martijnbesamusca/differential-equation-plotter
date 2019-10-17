interface HTMLCanvasElement {
    captureStream(frameRate?: Number): MediaStream;
}

interface MediaRecorderOptions {
    mimeType?: string;
    videoBitsPerSecond?: number;
    audioBitsPerSecond?: number;
    bitsPerSecond?: number;
}

declare class MediaRecorder extends EventTarget {
    readonly mimeType: string;
    readonly state: AnimationPlayState;
    readonly stream: MediaStream;
    ignoreMutedMedia: boolean;
    readonly videoBitsPerSecond: number;
    readonly audioBitsPerSecond: number;

    constructor(stream: MediaStream, options?: MediaRecorderOptions);

    pause(): void;
    requestData(): void;
    resume(): void;
    start(timeslice?: number): void;
    stop(): void;

    static isTypeSupported(mimeType: string): boolean;

    ondataavailable: ((event: any) => any) | null;
    onstart: ((event: any) => any) | null;
    onpause: ((event: Event) => any) | null;
    onresume: ((event: Event) => any) | null;
    onstop: ((event: Event) => any) | null;
    onerror: ((event: Event) => any) | null;
}
