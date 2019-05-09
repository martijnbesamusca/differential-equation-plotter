<template>
    <div id="app">
        <app-plot ref="plot"></app-plot>
        <app-settings-menu></app-settings-menu>
    </div>
</template>

<script lang="ts">
import {Component, Vue, Watch} from 'vue-property-decorator';
import AppPlot from './components/AppPlot.vue';
import AppSettingsMenu from '@/components/AppSettingsMenu.vue';

@Component({
    components: {
        AppPlot,
        AppSettingsMenu,
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
        grid-template-areas:  "plot settings"
        "plot settings";
        grid-template-columns: 1fr max-content;
        overflow: hidden;
    }
</style>
