(function () {
    'use strict';

    class CustomElement extends HTMLElement {
        constructor() {
            super();
            this.refs = {};
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(this.render());
            this.defineRef();
        }
        defineRef() {
            const bound = this.shadowRoot.querySelectorAll('[ref]');
            bound.forEach(elm => {
                const name = elm.getAttribute('ref');
                if (!name)
                    return;
                elm.removeAttribute('ref');
                this.refs[name] = elm;
            });
        }
    }
    function html(strings, ...expr) {
        let string = strings.reduce((acc, val) => acc + expr.pop() + (val || ''));
        const container = document.createElement('template');
        container.innerHTML = string;
        return container.content;
    }

    class PlotDisplay extends CustomElement {
        constructor() {
            super();
            this.canvas = this.refs.canvas;
            const resizeObserver = new ResizeObserver(entries => {
                const { width, height } = entries[0].contentRect;
                this.canvas.width = width;
                this.canvas.height = height;
            });
            resizeObserver.observe(this);
        }
        render() {
            return html `
            <canvas ref="canvas"></canvas>
            <style>
              :host {
                display: block;
                height:100%;
              }
              canvas {
                display:block;
                position:absolute;
                background-color: white;
              }
            </style>
        `;
        }
    }
    customElements.define('plot-display', PlotDisplay);

    var NumberFormat = Intl.NumberFormat;
    class NumberFormatter {
        constructor(minSize, maxSize) {
            this.maxSize = maxSize;
            this.minNumber = Math.max(-(10 ** maxSize), Number.MIN_SAFE_INTEGER);
            this.maxNumber = Math.min(10 ** (maxSize + 1), Number.MAX_SAFE_INTEGER);
            this.normalFmt = new NumberFormat('us', {
                minimumSignificantDigits: minSize
            });
            this.exponentFmt = new NumberFormat('us', {
                // style: '',
                minimumSignificantDigits: minSize,
                maximumSignificantDigits: maxSize
            });
        }
        format(num) {
            // Calculate normal size
            if (num > this.minNumber && num < this.maxNumber) {
                return this.normalFmt.format(num);
            }
            return this.exponentFmt.format(num);
        }
    }

    class ControlBar extends CustomElement {
        constructor() {
            super();
            this._x = 0;
            this._y = 0;
            this.x = 0;
            this.y = 0;
        }
        set x(val) {
            this._x = val;
            this.refs.x.textContent = ControlBar.formatter.format(val);
        }
        get x() {
            return this._x;
        }
        set y(val) {
            this._y = val;
            this.refs.y.textContent = ControlBar.formatter.format(val);
        }
        get y() {
            return this._y;
        }
        render() {
            return html `
            <div class="bar">
              <div class="left">
                  <div class="item">x: <span ref="x"></span></div>         
                  <div class="item">y: <span ref="y"></span></div>
              </div>
              <div>
                <div>full screen</div>
              </div>
            </div>
            
            <style>
              :host {
                display: block;
                height:100%;
              }
              .bar {
                display: grid;
                grid-template-columns: 1fr auto;
                line-height: 2em;
                padding: 0 1em;
              }
              .bar div{
                display: inline-block;
              }
              .item {
                padding: 0 .5em;
              }
            </style>
        `;
        }
    }
    ControlBar.formatter = new NumberFormatter(5, 5);
    customElements.define('control-bar', ControlBar);

    class SettingBar extends CustomElement {
        constructor() {
            super();
        }
        render() {
            const test = 'testing';
            return html `
            <div class="bar">
            <h2>Settings</h2>
            <foldable-panel>
              <h3 slot="title">test subject</h3>
              <div class="input_container">  
                <label>${test}</label>
                <div class="input"><input /><div class="reset"></div></div>
              </div>
            </foldable-panel>
            <foldable-panel>
              <h3 slot="title">test subject</h3>
              
              <div class="input_container">  
                <label>${test}</label>
                <div class="input"><input /><div class="reset"></div></div>
              </div>
            </foldable-panel>
            
            <style>
              .bar {
                overflow: auto;
              }
              h2 {
                text-align: center;
                margin: .5em 0;
                font-size: 1.8em;
              }
              .input_container{
                display: grid;
                grid-template-columns: auto auto;
                grid-gap: 1em;
                justify-items: stretch;
                padding: 1em 1em;
              }
              label{
              }
              input{
                display: inline-block;
                padding: 0.2em;
                border-radius: 0.2em 0 0 .2em;
                border: 2px #6cf028 solid;
                border-right-width: 0;
              }
              .input {
                display: grid;
                grid-template-columns: auto auto;
              }
              .reset {
                display: inline-block;
                width: 1.2em;
                padding: 0.2em;
                background-color: #303030;
                border-radius: 0 .2em .2em 0;
                cursor: pointer;
                border: 2px #6cf028 solid;
              }
              h3 {
                display: block;
                text-align: center;
                margin: 0;
                padding: 0;
              }
            </style>
        `;
        }
    }
    customElements.define('setting-bar', SettingBar);

    class TitleSection extends CustomElement {
        constructor() {
            super();
        }
        render() {
            return html `
            <h1>DoDeP</h1>
            <h2>Dynamic Ordinary Differential Equation Plotter</h2>
            <h3>By Martijn Besamusca</h3>
            <style>
              :host {
                padding: 1em 0;
                display: block;
              }
              h1 {
                text-align: center;
                font-size: 3em;
                margin: 0;
              }
              h2 {
                text-align: center;
                font-size: 1em;
                margin: 0;
                padding: 0 .5em;
              }
              h3 {
                text-align: right;
                font-size: .8em;
                margin: .5em 0 0 0;
                font-weight: lighter;
                padding: 0 .5em;
             
              }
              
            </style>
        `;
        }
    }
    customElements.define('title-section', TitleSection);

    class FoldablePanel extends CustomElement {
        constructor() {
            super();
            this.closed = true;
            this.refs.title.addEventListener('click', e => {
                this.toggle();
            });
        }
        toggle() {
            this.closed = !this.closed;
            if (this.closed) {
                this.refs.panel.classList.add('closed');
            }
            else {
                this.refs.panel.classList.remove('closed');
            }
        }
        render() {
            return html `
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
                transition: all ease 200ms;
                display: block;
              }
              .closed ::slotted(div) {
                height: 0 !important;
                padding: 0 !important;
                overflow: hidden;
              }
            </style>
        `;
        }
    }
    customElements.define('foldable-panel', FoldablePanel);

}());
//# sourceMappingURL=bundle.js.map
