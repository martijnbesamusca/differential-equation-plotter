export interface IHandle {
    index: number;
    leftPanel: HTMLDivElement;
    rightPanel: HTMLDivElement;
}
export interface UpdateEvent extends Event{
    pos?: number;
    handle?: IHandle;
}
interface EventListenerOptions {
    capture?: boolean;
    once?: boolean;
    passive?: boolean;
}
const updateEvent: UpdateEvent = new Event('moved');
const eventOptions: EventListenerOptions = {
    passive: true
};
export function handle(node: HTMLDivElement, {index, leftPanel, rightPanel}: IHandle) {
    let rectLeft = leftPanel.getBoundingClientRect();
    let rectRight = rightPanel.getBoundingClientRect();
    node.style.left = rectLeft.right + 'px';
    leftPanel.style.gridColumnStart = index * 2 + 1 + '';
    node.style.gridColumnStart = index * 2 + 2 + '';
    rightPanel.style.gridColumnStart = index * 2 + 3 + '';

    node.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        window.addEventListener('pointermove', moveListener, eventOptions);
        window.addEventListener('pointerup', upListener);
    });

    function moveListener (event: PointerEvent) {
        // const pos = Math.min(Math.max(rectLeft.left, event.x), rectRight.right);
        const pos = event.x;
        rectLeft = leftPanel.getBoundingClientRect();
        rectRight = rightPanel.getBoundingClientRect();
        if(pos >= rectRight.right || pos <= rectLeft.left) {
            return false;
        }

        updateEvent.pos = pos;
        updateEvent.handle = {index, leftPanel, rightPanel};
        node.parentNode.dispatchEvent(updateEvent);
    }

    function upListener (event: Event) {
        event.preventDefault();
        window.removeEventListener('pointermove', moveListener);
        window.removeEventListener('pointerup', upListener);
    }
}
