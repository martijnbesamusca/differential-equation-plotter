<template>
    <div :style="style" class="pane">
        <slot></slot>
    </div>
</template>

<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';

    @Component({
        components: {
        },
    })
    export default class ModularPane extends Vue {
        @Prop(String) readonly paneName: string | undefined;
        @Prop(Number) readonly size: number | undefined;
        @Prop(String) readonly minSize: string | undefined;

        public paneType = null; // vertical - horizontal

        get style () {
            const style =  {
                flexGrow: this.size,
                minWidth: this.minSize,
                minHeight: this.minSize,
            };
            return style
        }

        public mounted() {
        }
    }
</script>

<style scoped>
.pane {
    flex-basis: 0;
    flex-shrink: 1;
}
</style>
