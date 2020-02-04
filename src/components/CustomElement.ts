export abstract class CustomElement extends HTMLElement {
    // protected shadowRoot: ShadowRoot;
    protected refs: {[key: string] : Element};

    protected constructor() {
        super();
        this.refs = {};
        this.attachShadow({mode: 'open'});
        this.shadowRoot!.appendChild(this.render());
        this.defineRef();
    }

    connectedCallback() {
        this.dispatchEvent(connectedEvent);
    }


    private defineRef() {
        const bound = this.shadowRoot!.querySelectorAll('[ref]');
        bound.forEach(elm => {
            const name = elm.getAttribute('ref');
            if(!name) return;
            elm.removeAttribute('ref');
            this.refs[name] = elm;
        })
    }

    abstract render(): DocumentFragment;
}

export const connectedEvent  = new Event('connected');

export function html(strings: TemplateStringsArray, ...expr: string[]): DocumentFragment {
    let string = strings.reduce((acc, val)=> acc + expr.shift() + (val || ''));
    const container = document.createElement('template');
    container.innerHTML = string;
    return container.content;
}
