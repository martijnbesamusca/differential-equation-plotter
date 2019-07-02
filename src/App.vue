<template>
    <div id="app">
        <modular-panes direction="row">
            <modular-pane :size="10">
                <app-plot/>
            </modular-pane>

            <modular-pane :size="5" min-size="20em">
                <modular-panes direction="column">

                    <modular-pane :size="1">
                        <app-title-bar/>
                    </modular-pane>

                    <modular-pane :size=4>
                        <app-side-bar/>
                    </modular-pane>

                </modular-panes>
            </modular-pane>
        </modular-panes>
    </div>
</template>

<script lang="ts">
import {Component, Vue, Watch} from 'vue-property-decorator';
import AppPlot from './components/AppPlot.vue';
import AppSideBar from './components/AppSideBar.vue';
import AppTitleBar from './components/AppTitleBar.vue';
import ModularPanes from "@/components/ModularPanes.vue";
import ModularPane from "@/components/ModularPane.vue";

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
    }

    *{
        box-sizing: border-box;
    }

    #app {
        width: 100vw;
        height: 100vh;
    }
</style>

<style>
    @import "style/mathlive.core.css";
    @import "style/mathlive.css";
</style>
