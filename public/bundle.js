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
        connectedCallback() {
            this.dispatchEvent(connectedEvent);
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
    const connectedEvent = new Event('connected');
    function html(strings, ...expr) {
        let string = strings.reduce((acc, val) => acc + expr.shift() + (val || ''));
        const container = document.createElement('template');
        container.innerHTML = string;
        return container.content;
    }

    class Store {
        constructor(target) {
            this.initial = Object.assign({}, target);
            this.vals = Object.assign({}, target);
            this.binds = {};
            this.subscribers = {};
            for (const key of Object.keys(target)) {
                this.subscribers[key] = [];
            }
        }
        bindTo(key, elm) {
            this.binds[key] = elm;
            elm.addEventListener('change', () => {
                let val = elm.value;
                if (elm.type === 'number') {
                    val = Number.parseFloat(val);
                }
                else if (elm.type === 'checkbox') {
                    val = elm.checked;
                }
                this._set(key, val);
            });
            this.set(key, this.get(key));
        }
        // unbind(key: keyof State) {
        //     this.binds[key] = undefined;
        // }
        set(key, val) {
            if (this.binds[key]) {
                this.binds[key].value = val;
            }
            else {
                this._set(key, val);
            }
        }
        _set(key, val) {
            this.vals[key] = val;
            for (const cb of this.subscribers[key]) {
                cb(val);
            }
        }
        get(key) {
            return this.vals[key];
        }
        subscribe(key, callback) {
            this.subscribers[key].push(callback);
        }
    }

    const state = {
        mouse_x: 0,
        mouse_y: 0,
        canvas_width: 0,
        canvas_height: 0,
        paused: false,
    };
    var state$1 = new Store(state);

    class PlotDisplay extends CustomElement {
        constructor() {
            super();
            this.canvas = this.refs.canvas;
            const resizeObserver = new ResizeObserver(entries => {
                const { width, height } = entries[0].contentRect;
                this.canvas.width = width;
                this.canvas.height = height;
                state$1.set("canvas_width", width);
                state$1.set("canvas_height", height);
            });
            resizeObserver.observe(this);
            this.canvas.addEventListener('pointermove', e => {
                state$1.set('mouse_x', e.offsetX);
                state$1.set('mouse_y', e.offsetY);
            });
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
            this.normalFmt = new NumberFormat('en-IN', {
                minimumSignificantDigits: minSize,
                maximumSignificantDigits: maxSize,
                minimumIntegerDigits: 1,
                maximumFractionDigits: maxSize - 2,
            });
            this.exponentFmt = new NumberFormat('en-IN', {
                // @ts-ignore ts has not implemented this yet
                notation: 'scientific',
                minimumSignificantDigits: minSize,
                maximumSignificantDigits: maxSize,
                minimumIntegerDigits: 1,
                maximumFractionDigits: maxSize - 1,
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

    const window = new Store({
        min_x: -5,
        max_x: 5,
        min_y: -3,
        max_y: 3,
        perp_lock: true
    });
    var settings = {
        window
    };

    function rescale(v, minOrg, maxOrg, minDest, maxDest) {
        const norm = (v - minOrg) / (maxOrg - minOrg);
        return minDest + (maxDest - minDest) * norm;
    }
    var Axis;
    (function (Axis) {
        Axis[Axis["x"] = 0] = "x";
        Axis[Axis["y"] = 1] = "y";
    })(Axis || (Axis = {}));
    function screenToGrid(v, axis) {
        const minGrid = (axis === Axis.x ? settings.window.get('min_x') : settings.window.get('max_y'));
        const maxGrid = (axis === Axis.x ? settings.window.get('max_x') : settings.window.get('min_y'));
        const maxScreen = (axis === Axis.x ? state$1.get('canvas_width') : state$1.get('canvas_height'));
        return rescale(v, 0, maxScreen, minGrid, maxGrid);
    }

    class ControlBar extends CustomElement {
        constructor() {
            super();
            this._x = 0;
            this._y = 0;
            this.x = 0;
            this.y = 0;
            state$1.subscribe('mouse_x', val => this.x = screenToGrid(val, Axis.x));
            state$1.subscribe('mouse_y', val => this.y = screenToGrid(val, Axis.y));
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
        makeInput(section, key, name, type = 'text') {
            const id = `${section}_${key}`;
            this.addEventListener('connected', () => {
                // debugger;
                // @ts-ignore
                settings[section].bindTo(key, this.refs[id]);
            });
            return `<label for="${id}">${name}</label><div class="input"><input id="${id}" type="${type}" ref="${id}"/><div class="reset"></div></div>`;
        }
        render() {
            const test = 'testing';
            return html `
            <div class="bar">
            <h2>Settings</h2>
            <foldable-panel>
              <h3 slot="title">Window</h3>
              <div class="input_container">  
              ${this.makeInput('window', 'min_x', 'min x', 'number')}
              ${this.makeInput('window', 'max_x', 'max x', 'number')}
              ${this.makeInput('window', 'min_y', 'min y', 'number')}
              ${this.makeInput('window', 'max_y', 'max y', 'number')}
              </div>
            </foldable-panel>
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
            this.closed = false;
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
                transition: padding cubic-bezier(0.175, 0.885, 0.32, 1.275) 200ms;
                display: block;
              }
              .closed ::slotted(div) {
                height: 0 !important;
                padding: 0 1em !important;
                overflow: hidden;
              }
            </style>
        `;
        }
    }
    customElements.define('foldable-panel', FoldablePanel);

}());
//# sourceMappingURL=bundle.js.map
