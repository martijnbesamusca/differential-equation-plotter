<template>
    <div class="modular-panes layout-default" :style="style">
        <slot />
    </div>
</template>

<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    @Component({
        components: {
        },
    })
    export default class ModularPanes extends Vue {
        @Prop(String) readonly direction: string | undefined;

        get style () {
            return {
                flexDirection: this.direction,
            }
        }

        public mounted() {
            for (const vnode of this.$slots.default) {
                const elm:HTMLElement = <HTMLElement>vnode.elm;
                console.log('min-width', elm.style.getPropertyValue('min-width'));

                if (this.direction === 'row') {
                    elm.style.removeProperty('min-height')
                } else if (this.direction === 'column') {
                    elm.style.removeProperty('min-width')
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .modular-panes {
        display: flex;
        flex-wrap: nowrap;
        align-items: stretch;
        align-content: stretch;

        flex-basis: 0;
        flex-shrink: 1;
    }

    .layout {
        /*&-default {*/
            /*grid-template-areas:*/
                    /*'plot title'*/
                    /*'plot settings';*/
        /*}*/
        /*&-default-mirrored {*/
            /*grid-template-areas:*/
                    /*'title plot'*/
                    /*'settings plot';*/
        /*}*/
        /*&-mobile {*/
            /*grid-template-areas:*/
                    /*'title'*/
                    /*'plot'*/
                    /*'settings';*/
        /*}*/
    }
</style>
