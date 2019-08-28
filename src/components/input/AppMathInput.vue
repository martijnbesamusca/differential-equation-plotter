<template>
  <div class="mathinput">
    <div class="mathfieldLabel" ref="label">{{ label }}</div>
    <div class="mathfield" :id="id" ref="mathfield"><slot></slot></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import MathLive from "mathlive";
import * as mathlive from "mathlive";

@Component
export default class AppMathInput extends Vue {
  @Prop({ default: "" }) public id: string;
  @Prop({ default: "" }) public label: string;
  @Prop({ default: "" }) public value: string;
  @Prop({ default: () => {} }) public config: object;

  public $refs: {
    mathfield: HTMLDivElement;
    label: HTMLDivElement;
  };

  public mounted() {
    MathLive.makeMathField(this.$refs.mathfield, {
      virtualKeyboardMode: "off",
      onFocus: (mathfield: mathlive.IMathField) => {
        this.$refs.mathfield.classList.add("focus");
        this.$emit("focus", mathfield);
      },

      onBlur: (mathfield: mathlive.IMathField) => {
        this.$refs.mathfield.classList.remove("focus");
        this.$emit("focus", mathfield);
      },

      onKeystroke: (
        mathfield: mathlive.IMathField,
        keystroke: string,
        ev: Event
      ) => {
        this.$emit("focus", ev);
        return true;
      },

      onContentDidChange: (mathfield: mathlive.IMathField) => {
        this.$emit("input", mathfield);
        return true;
      }
    });
    MathLive.renderMathInElement(this.$refs.label);
  }
}
</script>

<style scoped lang="scss">
@import "../../style/mixins.scss";
@import "../../style/variables.scss";

.mathfieldLabel {
  display: inline-block;
  margin-right: 0.5em;
}

.mathfield {
  @extend %input;
  width: calc(100% - 2.5em);
  display: inline-block;
  background-color: white;
  color: #000;
  height: auto;
  cursor: text;

  &.focus {
    border-color: $accent-color;
  }
}
</style>
<style>
@import "/src/style/mathlive.core.css";
@import "/src/style/mathlive.css";
</style>
