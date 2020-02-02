import {CustomElement, html} from './CustomElement';

export default class TitleSection  extends CustomElement {
    constructor() {
        super();
    }

    render() {
        return html`
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
        `
    }
}

customElements.define('title-section', TitleSection);
