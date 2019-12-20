export interface IHandle {
    leftPanel: Element;
    rightPanel: Element;
}

const updateEvent = new Event('moved');

export function handle(node: HTMLDivElement, {leftPanel, rightPanel}: IHandle) {
    const rectLeft = leftPanel.getBoundingClientRect();
    const rectRight = rightPanel.getBoundingClientRect();

    node.style.left = rectLeft.right + 'px';

    node.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        window.addEventListener('pointermove', moveListener);
        window.addEventListener('pointerup', upListener);
    });

    function moveListener (event: PointerEvent) {
        const pos = Math.min(Math.max(rectLeft.left, event.x), rectRight.right);
        node.style.left = pos + 'px';
        node.dispatchEvent(updateEvent);
    }

    function upListener () {
        window.removeEventListener('pointermove', moveListener);
        window.removeEventListener('pointerup', upListener);
    }
}
