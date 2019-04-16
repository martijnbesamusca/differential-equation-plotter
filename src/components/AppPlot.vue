<template>
    <canvas id="plot" ref="plot" :width="width" :height="height"></canvas>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import {State} from "vuex-class-component";
    import ParticleRenderer from "@/api/particleRenderer";
    import {cloneDeep, throttle} from 'lodash'

    @Component({})
    export default class AppPlot extends Vue {
        $refs!: {
            plot: HTMLCanvasElement
        };
        @Prop(Number) width!: number;
        @Prop(Number) height!: number;

        private particleRenderer: ParticleRenderer;

        private onResizeThrottled: (event: Event) => null;

        mounted() {
            console.log(cloneDeep(this.$store.state.settings));
            this.particleRenderer = new ParticleRenderer(this.$refs.plot, cloneDeep(this.$store.state.settings));
            window.particleRenderer = this.particleRenderer;
            this.particleRenderer.animate();

            this.onResizeThrottled = throttle(this.onResize, 500, {leading: false}) as (event: Event) => null;
            window.addEventListener('resize', this.onResizeThrottled)
        }

        onResize() {
            this.particleRenderer.updateScreenSize();
        }

    }
</script>

<style scoped>
    #plot {
        position: absolute;
        top: 0;
        left: 0;
    }
</style>
