import {CustomElement, html} from './CustomElement';
import settings from '../api/store/settings'

export default class SettingBar extends CustomElement {
    constructor() {
        super();
    }

    makeInput(section: string, key: string, name: string, type: string='text') {
        const id = `${section}_${key}`;
        this.addEventListener('connected', () => {
            // debugger;
            // @ts-ignore
            settings[section].bindTo(key, this.refs[id] as HTMLInputElement);
        });
        return `<label for="${id}">${name}</label><div class="input"><input id="${id}" type="${type}" ref="${id}"/><div class="reset"></div></div>`
    }

    render() {
        const test = 'testing';
        return html`
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
        `
    }
}

customElements.define('setting-bar', SettingBar);
