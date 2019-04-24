<template>
    <div id="plot">
        <svg id="svg" xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' :width="width" :height="height" viewPort='0 0 100 100'>
            <!-- put some content in here -->
            <rect x='0' y='0' width='100' height='100' fill='red'></rect>
        </svg>
        <canvas ref="plot" :width="width" :height="height"></canvas>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";
    import {State} from "vuex-class-component";
    import ParticleTest from "@/api/arrowCloud";
    import PlotRenderer from "@/api/plotRenderer";
    import {cloneDeep, throttle} from 'lodash'

    @Component({})
    export default class AppPlot extends Vue {
        $refs!: {
            plot: HTMLCanvasElement
        };
        @Prop(Number) width!: number;
        @Prop(Number) height!: number;

        private particleRenderer: PlotRenderer;

        private onResizeThrottled: (event?: Event) => null;

        mounted() {
            this.particleRenderer = new PlotRenderer(this.$refs.plot, cloneDeep(this.$store.state.settings));
            window.particleRenderer = this.particleRenderer;
            this.particleRenderer.render();

            this.onResizeThrottled = throttle(this.onResize, 100, {leading: false}) as (event?: Event) => null;
        }

        @Watch('width')
        onWidthChange() {
            this.onResizeThrottled()
        }

        @Watch('height')
        onWidthChange() {
            this.onResizeThrottled()
        }

        onResize() {
            this.particleRenderer.updateScreenSize();
        }

    }
</script>

<style scoped>
    #plot {
        grid-area: plot;
        height: 100%;
        width: 100%;
        overflow: hidden;
    }

    #plot canvas{
        height: 100%;
        width: 100%;
    }
    #svg {
        position: absolute;
        height: 100%;
        width: 100%;
    }
</style>
