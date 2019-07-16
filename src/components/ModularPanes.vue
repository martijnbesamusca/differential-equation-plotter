<template>
    <div class="modular-panes" :class="'modular-panes-' + direction" :style="style">
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
        public activeResizingElms: VNode[] = null;

        @Prop(String) readonly direction: string | undefined;

        get style () {
            return {
                flexDirection: this.direction,
            }
        }

        addHandlers () {
            for (let i = 0; i < this.$slots.default.length - 1; i++) {
                const vnodePrev = this.$slots.default[i];
                const vnodeNext = this.$slots.default[i + 1];

                const handler = document.createElement('div');
                handler.classList.add('handler');

                handler.addEventListener('mousedown', (e) => {
                    this.activeResizingElms = [vnodePrev, vnodeNext];
                    e.preventDefault()
                });
                addEventListener('mousemove', (e) => {
                    if(!this.activeResizingElms) return;
                    e.preventDefault();
                    // let x = (e.pageX - this.$el.offsetLeft) / this.$el.clientWidth;
                    let delta = e.movementX / this.$el.clientWidth;
                    this.activeResizingElms[0].componentInstance.$data.width += delta;
                    this.activeResizingElms[1].componentInstance.$data.width -= delta;
                    console.log(delta)
                });
                addEventListener('mouseup', (e) => {
                    this.activeResizingElms = null
                });

                this.$el.insertBefore(handler, vnodeNext.elm);
            }
        }

        public mounted() {
            this.addHandlers();
        }
    }
</script>

<style scoped lang="scss">
    .modular-panes {
        height: 100%;
        width: 100%;
        display: flex;
    }
</style>

<style lang="scss">
    .modular-panes {
        .handler {
            display: block;
            height: 100vh;
            width: 6px;
            background-color: #ccc;
            border: 1px solid #000;
            border-top-width: 0;
            border-bottom-width: 0;
            &:before {
                content: '';
                position: absolute;
                margin-left: -3px;
                width: 6px;
                height: 100%;
            }
        }

        &-horizontal .handler {
            cursor: n-resize;
        }

        &-vertical .handler {
            cursor: e-resize;
        }
    }
</style>
