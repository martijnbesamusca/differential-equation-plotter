<template>
    <div id="app">
        <modular-panes direction="vertical">
            <modular-pane :size=".8"><app-plot/></modular-pane>
            <modular-pane :size=".2" minSize="20em" id="sidebarpane">
                <app-title-bar id="titlebar"/>
                <app-side-bar id="sidebar"/>
            </modular-pane>
        </modular-panes>
    </div>
</template>

<script lang="ts">
import {Component, Vue, Watch} from 'vue-property-decorator';
import AppPlot from './components/AppPlot.vue';
import AppSideBar from './components/AppSideBar.vue';
import AppTitleBar from './components/AppTitleBar.vue';
import ModularPanes from './components/ModularPanes'
import ModularPane from './components/ModularPane'
// import { Multipane, MultipaneResizer } from 'vue-multipane';

@Component({
    components: {
        ModularPanes,
        ModularPane,
        AppPlot,
        AppSideBar,
        AppTitleBar,
    },
})
export default class App extends Vue {
    private canvasHeight: number;
    private canvasWidth: number;

    public mounted() {
    }
}
</script>

<style lang="scss">
    @import url('https://fonts.googleapis.com/css?family=Open+Sans');
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

    body, html {
        padding: 0;
        margin: 0;
        overflow: hidden;
        height: 100%;
        font-family: 'Open Sans', sans-serif;
    }

    *{
        box-sizing: border-box;
    }

    #app {
        width: 100vw;
        height: 100vh;
    }

    #sidebarpane {
        display: flex;
        flex-direction: column;
        background-color: #333333;
        color: #fff
    }
    #titlebar {
        flex-grow: 0;
    }
    #sidebar {
        flex-basis: 0;
        flex-grow: 1;
    }

</style>

<style>
    @import "style/mathlive.core.css";
    @import "style/mathlive.css";
    .multipane.layout-v .multipane-resizer {
        margin: 0; left: 0; /* reset default styling */
        width: 15px;
        background: blue;
    }

    .multipane.layout-h .multipane-resizer {
        margin: 0; top: 0; /* reset default styling */
        height: 15px;
        background: blue;
    }
</style>
