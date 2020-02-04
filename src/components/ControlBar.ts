import {html, CustomElement} from './CustomElement'
import NumberFormatter from '../api/ui/numberFormatter';
import state from "../api/store/state";
import {screenToGrid, Axis} from "../api/grid";

export default class ControlBar extends CustomElement {
    private _x = 0;
    private _y = 0;
    static formatter = new NumberFormatter(5, 5);

    constructor() {
        super();
        this.x = 0;
        this.y = 0;

        state.subscribe('mouse_x', val => this.x = screenToGrid(val, Axis.x));
        state.subscribe('mouse_y', val => this.y = screenToGrid(val, Axis.y));
    }

    set x(val: number) {
        this._x = val;
        this.refs.x.textContent = ControlBar.formatter.format(val);
    }
    get x() {
        return this._x;
    }
    set y(val: number) {
        this._y = val;
        this.refs.y.textContent = ControlBar.formatter.format(val);
    }
    get y() {
        return this._y;
    }

    render() {
        return html`
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

customElements.define('control-bar', ControlBar);
