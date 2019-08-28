<template>
  <div :style="style" class="pane">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  components: {}
})
export default class ModularPane extends Vue {
  @Prop(String) readonly paneName: string | undefined;
  @Prop(Number) readonly size: number | undefined;
  @Prop(String) readonly minSize: string | undefined;
  @Prop(String) readonly maxSize: string | undefined;

  public paneType = null; // vertical - horizontal
  public width = this.size;

  get style() {
    return {
      "--pane-width": 100 * this.width + "%",
      minWidth: this.minSize,
      minHeight: this.minSize,
      maxWidth: this.maxSize,
      maxHeight: this.maxSize
    };
  }

  public mounted() {}
}
</script>

<style scoped lang="scss">
.pane {
  --pane-width: 0;
  width: var(--pane-width);
  will-change: width;
  height: 100%;
  display: inline-block;
  &:first-child,
  &:last-child {
    width: calc(var(--pane-width) - 1px);
  }
}
</style>
