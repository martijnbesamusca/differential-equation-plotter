<template>
    <div id="app">
        <app-plot ref="plot"></app-plot>
        <app-title-bar></app-title-bar>
        <app-side-bar></app-side-bar>
    </div>
</template>

<script lang="ts">
import {Component, Vue, Watch} from 'vue-property-decorator';
import AppPlot from './components/AppPlot.vue';
import AppSideBar from './components/AppSideBar.vue';
import AppTitleBar from './components/AppTitleBar.vue';

@Component({
    components: {
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
    }

    *{
        box-sizing: border-box;
    }

    #app {
        display: grid;
        width: 100%;
        font-family: 'Open Sans', sans-serif;
        height: 100%;
        grid-template-areas:  "plot title"
        "plot side";
        grid-template-columns: 1fr 25em;
        grid-template-rows: min-content 1fr;
        overflow: hidden;
    }
</style>

<style>
    @import "style/mathlive.core.css";
    @import "style/mathlive.css";
</style>
