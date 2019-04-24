<template>
    <canvas id="plot" ref="plot" :width="width" :height="height"></canvas>
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
    }
</style>
