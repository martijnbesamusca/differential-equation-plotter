<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { VNode } from "vue";
import { Store } from "vuex";
import { get, omit } from "lodash";
import settings, { IViewbox } from "@/store/modules/settings";
import AppInput, {
  FunctionalRenderingContext
} from "@/components/input/AppInput.vue";

const prefix = "input_";

@Component({
  functional: true
})
export default class AppInputNumber extends AppInput {
  public static createInput(
    createElement: typeof Vue.prototype.$createElement,
    context
  ): VNode {
    return createElement("input", {
      on: {
        change(e: Event) {
          if (e.target.hasAttribute("max")) {
            e.target.value = Math.min(
              e.target.value,
              Number.parseFloat(e.target.getAttribute("max"))
            );
          }

          if (e.target.hasAttribute("min")) {
            e.target.value = Math.max(
              e.target.value,
              Number.parseFloat(e.target.getAttribute("min"))
            );
          }

          if (!e.target.checkValidity()) {
            e.target.reportValidity();
            return;
          }

          context.props.store.commit("changeValue", {
            key: context.props.varName,
            val: e.target.value
          });
        }
      },

      domProps: {
        type: "number",
        value: get(context.props.store.state.settings, context.props.varName),
        id: prefix + context.props.varName
      },

      attrs: omit(context.data.attrs, ["label", "varName", "type", "store"])
    });
  }
  public render(
    createElement: typeof Vue.prototype.$createElement,
    context: FunctionalRenderingContext
  ): VNode[] {
    const label = AppInput.createLabel(createElement, context);
    const input = AppInputNumber.createInput(createElement, context);
    const resetButton = AppInput.createResetButton(createElement, context);
    const inputWrapper = createElement("div", { class: "inputWrapper" }, [
      input,
      resetButton
    ]);

    return [label, inputWrapper];
  }
}
</script>

<style scoped></style>
