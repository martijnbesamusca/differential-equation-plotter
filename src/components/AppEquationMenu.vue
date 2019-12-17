<template>
  <div class="equationMenu">
    <h2 id="equation_title">Equations</h2>
    <app-tabs ref="tabs">
      <app-tab
        title="cartesian"
        text="$$ \dot{x}, \dot{y} $$"
        ref="tabCartesian"
      >
        <app-math-input
          label="$$\dot{x}=$$"
          class="mathInput"
          @input="dx = $event"
          >{{ dx }}</app-math-input
        >
        <app-math-input
          label="$$\dot{y}=$$"
          class="mathInput"
          @input="dy = $event"
          >{{ dy }}</app-math-input
        >
        <button class="applyButton" @click="enableCartesian">Apply</button>
      </app-tab>

      <app-tab
        title="matrix"
        text="$$ \dot{\vec{x}} = A\vec{x} $$"
        ref="tabMatrix"
      >
        <app-input-matrix label="$$ A= $$" class="matrix" v-model="A" />
        <button class="applyButton" @click="enableMatrix">Apply</button>
      </app-tab>

      <app-tab title="polar" text="$$ \dot{r}, \dot{\theta} $$" ref="tabPolar">
        <span ref="polarNotice" id="polarNotice">
          The variable $$ \theta $$ can be typed <br />
          both as $$ \theta $$ or as $$ t $$ for ease of typing.
        </span>
        <app-math-input
          label="$$\dot{r}=$$"
          class="mathInput"
          @input="dr = $event"
          >{{ dr }}</app-math-input
        >
        <app-math-input
          label="$$\dot{\theta}=$$"
          class="mathInput"
          @input="dt = $event"
          >{{ dt }}</app-math-input
        >
        <button class="applyButton" @click="enablePolar">Apply</button>
      </app-tab>
    </app-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import MathLive from "mathlive";
import AppMathInput from "@/components/input/AppMathInput.vue";
import AppInputMatrix from "@/components/input/AppInputMatrix.vue";
import AppTabs from "@/components/AppTabs.vue";
import AppTab from "@/components/AppTab.vue";
import { ODETypes } from "@/store/modules/settings";
import { JSFunctionGen } from "@/api/MastonConvert";

@Component({
  components: {
    AppMathInput,
    AppInputMatrix,
    AppTabs,
    AppTab
  }
})
export default class AppEquationMenu extends Vue {
  public formula: string = "";

  public $refs: {
    polarNotice;
  };

  public mounted() {
    MathLive.renderMathInElement(this.$refs.polarNotice);

    switch (this.$store.state.settings.ODEType) {
      case ODETypes.Matrix:
        this.$refs.tabs.activate(this.$refs.tabMatrix);
        break;
      case ODETypes.Cartesian:
        this.$refs.tabs.activate(this.$refs.tabCartesian);
        break;
      case ODETypes.Polar:
        this.$refs.tabs.activate(this.$refs.tabPolar);
        break;
    }
  }

  public enableMatrix() {
    this.$store.commit("changeValue", { key: "ODEType", val: ODETypes.Matrix });
  }

  public enableCartesian() {
    this.$store.commit("changeValue", {
      key: "ODEType",
      val: ODETypes.Cartesian
    });
  }

  public enablePolar() {
    this.$store.commit("changeValue", { key: "ODEType", val: ODETypes.Polar });
  }

  get dx() {
    return this.$store.state.settings.dxString;
  }

  set dx(mathfield) {
    this.$store.commit("changeValue", {
      key: "dxString",
      val: mathfield.text("latex")
    });
  }

  get dy() {
    return this.$store.state.settings.dyString;
  }

  set dy(mathfield) {
    this.$store.commit("changeValue", {
      key: "dyString",
      val: mathfield.text("latex")
    });
  }

  get dr() {
    return this.$store.state.settings.drString;
  }

  set dr(mathfield) {
    this.$store.commit("changeValue", {
      key: "drString",
      val: mathfield.text("latex")
    });
  }

  get dt() {
    return this.$store.state.settings.dtString;
  }

  set dt(mathfield) {
    this.$store.commit("changeValue", {
      key: "dtString",
      val: mathfield.text("latex")
    });
  }

  get A() {
    return this.$store.state.settings.AMatrix;
  }

  set A(value) {
    this.$store.commit("changeValue", { key: "AMatrix", val: value });
  }
}
</script>

<style scoped lang="scss">
@import "../style/mixins.scss";
@import "../style/variables.scss";

.equationMenu {
  background-color: #333;
}

.mathInput {
  padding: 0 1em;
  margin-top: 1em;
}

#equation_title {
  padding: 0.5em 0;
  margin: 0;
  font-size: 2em;
  text-align: center;
  border-bottom: #666 3px solid;
  background-color: #222;
}

.applyButton {
  display: block;
  appearance: none;
  border: none;
  background-color: $accent-color;
  color: #fff;
  margin: 1em;
  padding: 1em;
  width: calc(100% - 2em);
  border-radius: 0.25em;
  cursor: pointer;
  font-size: 1em;

  &:active {
    background-color: darken($accent-color, 10%);
  }
}

.matrix {
  margin-top: 1em;
}

#polarNotice {
  display: inline-block;
  padding: 0 2em;
  margin-top: 1em;
  width: 100%;
  text-align: center;
}
</style>
