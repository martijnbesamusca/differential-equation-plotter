export interface IHandle {
    index: number;
    leftPanel: Element;
    rightPanel: Element;
}

const updateEvent = new Event('moved');

export function handle(node: HTMLDivElement, {index, leftPanel, rightPanel}: IHandle) {
    const rectLeft = leftPanel.getBoundingClientRect();
    const rectRight = rightPanel.getBoundingClientRect();
    node.style.left = rectLeft.right + 'px';
    console.log(node.style)
    node.style.gridColumnStart = index * 2 + 1 + '';

    node.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        window.addEventListener('pointermove', moveListener);
        window.addEventListener('pointerup', upListener);
    });

    function moveListener (event: PointerEvent) {
        const pos = Math.min(Math.max(rectLeft.left, event.x), rectRight.right);
        node.style.left = pos + 'px';
        node.dispatchEvent(updateEvent);
        console.log(node.style)
    }

    function upListener () {
        window.removeEventListener('pointermove', moveListener);
        window.removeEventListener('pointerup', upListener);
    }
}
