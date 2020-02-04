import {CustomElement, html} from './CustomElement';

export default class FoldablePanel extends CustomElement {
    private closed = false;
    constructor() {
        super();
        this.refs.title.addEventListener('click', e => {
            this.toggle()
        })
    }

    toggle() {
        this.closed = !this.closed;
        if (this.closed) {
            this.refs.panel.classList.add('closed')
        } else {
            this.refs.panel.classList.remove('closed')
        }
    }

    render() {
        return html`
            <div class="panel" ref="panel">
              <div class="title" ref="title">
                <div class="arrow"></div>
                <slot name="title"></slot>
              </div>
              <slot class="content"></slot>
            </div>
            
            <style>
              .title {
                display: grid;
                grid-template-columns: auto 1fr;
                align-items: center;
                margin: 0;
                padding: .5em 1em;
                background-color: #303030;
                cursor: pointer;
              }
              .arrow {
                display: inline-block;
                width: .7em;
                height: .7em;
                border: 3px white solid;
                border-left-width: 0;
                border-top-width: 0;
                transform: rotate(45deg);
                transition: transform ease 200ms;
              }
              .closed .arrow {
                transform: rotate(-45deg);
              }
              ::slotted(h3) {
                display: inline-block;
              }
              ::slotted(div) {
                padding: .5em 1em;
                height: auto;
                transform-origin: top center;
                transition: padding cubic-bezier(0.175, 0.885, 0.32, 1.275) 200ms;
                display: block;
              }
              .closed ::slotted(div) {
                height: 0 !important;
                padding: 0 1em !important;
                overflow: hidden;
              }
            </style>
        `
    }
}

customElements.define('foldable-panel', FoldablePanel);
