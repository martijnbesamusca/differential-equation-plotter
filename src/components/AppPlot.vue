<template>
    <div id="plot">
        <svg id="svg" preserveAspectRatio="none" ref="grid" xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 100 100'>
            <defs>
                <filter id="backdrop">
                    <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="dilated"/>
                    <feColorMatrix in="dilated" type="matrix" values="-1 0 0 0 1
                                                              0 -1 0 0 1
                                                              0 0 -1 0 1
                                                              0 0 0 1 0"/>
                    <feComposite in="SourceGraphic"/>
                </filter>
            </defs>
            <!-- put some content in here -->
        </svg>
        <canvas ref="plot" id="canvas"></canvas>
    </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
import {State} from 'vuex-class-component';
import PlotRenderer from '@/api/PlotRenderer';
import {cloneDeep, throttle} from 'lodash';

@Component({})
export default class AppPlot extends Vue {
    public $refs!: {
        plot: HTMLCanvasElement
        grid: SVGElement,
    };

    private particleRenderer: PlotRenderer;

    private onResizeThrottled: (event?: Event) => null;

    public mounted() {
        this.particleRenderer = new PlotRenderer(this.$refs.plot, this.$refs.grid, cloneDeep(this.$store.state.settings));
        window.particleRenderer = this.particleRenderer;

        this.onResize();
        this.particleRenderer.render();

        this.onResizeThrottled = throttle(this.onResize, 100, {leading: false}) as (event?: Event) => null;
        addEventListener('resize', this.onResizeThrottled);

        setTimeout(() => this.onResize(), 1000);
    }

    public onResize() {
        if (!this.$el || !this.$refs.plot) {
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
        position: relative;;
    }

    #plot canvas{
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 1;
    }
    #svg {
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 2;
        pointer-events: none;
    }
</style>

<style lang="scss">
    .solution {
        stroke: var(--solution-color, black);
        stroke-width: var(--solution-width);
        fill: transparent;
    }

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
        fill: #333;
        filter: url('#backdrop');

        &.text_horizontal {
            text-anchor: end;

        }
        &.text_vertical {
            text-anchor: middle;

            &.text_zero {
                display: none;
            }
        }
        &.text_border {
            text-anchor: start;
        }
    }
</style>
