<template>
    <div id="plot">
        <svg id="svg" preserveAspectRatio="none" ref="grid" xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 100 100'>
            <!-- put some content in here -->
        </svg>
        <canvas ref="plot"></canvas>
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
            grid: SVGElement
        };

        private particleRenderer: PlotRenderer;

        private onResizeThrottled: (event?: Event) => null;

        mounted() {
            this.particleRenderer = new PlotRenderer(this.$refs.plot, this.$refs.grid, cloneDeep(this.$store.state.settings));
            window.particleRenderer = this.particleRenderer;

            this.onResize();
            this.particleRenderer.render();

            this.onResizeThrottled = throttle(this.onResize, 100, {leading: false}) as (event?: Event) => null;
            addEventListener('resize', this.onResizeThrottled);

            this.onResize();
        }

        onResize() {
            if(!this.$el || !this.$refs.plot) {
                return;
            }

            const width = this.$el.clientWidth;
            const height = this.$el.clientHeight;
            this.$refs.plot.setAttribute('width', `${width}`);
            this.$refs.plot.setAttribute('height',  `${height}`);
            this.$refs.grid.setAttribute('width', `${width}`);
            this.$refs.grid.setAttribute('height',  `${height}`);
            this.particleRenderer.updateScreenSize();
        }
    }
</script>

<style lang="scss" scoped>
    #plot {
        grid-area: plot;
        height: 100vh;
        width: 100%;
        overflow: hidden;
    }

    #plot canvas{
        height: 100%;
        width: 100%;
    }
    #svg {
        position: absolute;
    }
</style>

<style lang="scss">
    .line_grid{
        stroke: #333;
        stroke-width: 1;
        opacity: 0.3;
    }

    .line_extra {
        stroke: black;
        stroke-width: 2;
        opacity: 0.5;
    }

    .line_axis{
        stroke-width: 3;
        opacity: 1;
        &.line_vertical {
            stroke: blue;
        }
        &.line_horizontal {
            stroke: red;
        }
    }

    .text_grid {
        font: bold 1em sans-serif;
    }
</style>
