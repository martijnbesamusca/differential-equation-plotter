<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import settings, { IViewbox } from "@/store/modules/settings";
import { VNode } from "vue";
import { Store } from "vuex";
import { get, omit } from "lodash";
import AppInput, {
  FunctionalRenderingContext
} from "@/components/input/AppInput.vue";
import AppInputMatrix from "@/components/input/AppInputMatrix.vue";

const prefix = "input_";

@Component({
  functional: true
})
export default class AppInputSwitch extends AppInput {
  public static createInput(
    createElement: typeof Vue.prototype.$createElement,
    context
  ): VNode {
    return createElement(AppInputMatrix);
    //     return createElement('div', {
    //         on: {
    //             click(e: Event) {
    //                 console.log(context)
    //                 context.props.context = !context.props.context;
    //                 context.props.store.commit('changeValue',  {key: context.props.varName, val: context.props.checked});
    //             },
    //         },
    //
    //         props: {
    //             checked: false,
    //         },
    //
    //         domProps: {
    //             type: context.props.type,
    //             value: get(context.props.store.state.settings, context.props.varName),
    //             id: prefix + context.props.varName,
    //         },
    //
    //         class: {
    //             switch: true,
    //             checked: context.props.context,
    //         },
    //
    //         attrs: omit(context.data.attrs, ['label', 'varName', 'type', 'store']),
    //     });
  }

  public render(
    createElement: typeof Vue.prototype.$createElement,
    context: FunctionalRenderingContext
  ): VNode[] {
    const label = AppInput.createLabel(createElement, context);
    const input = AppInputSwitch.createInput(createElement, context);
    const resetButton = AppInput.createResetButton(createElement, context);
    const inputWrapper = createElement("div", { class: "inputWrapper" }, [
      input,
      resetButton
    ]);

    return [label, inputWrapper];
  }
}
</script>

<style scoped lang="scss">
    .switch {
        width: 2em;
        background-color: #ccc;
        &.checked {
            background-color: #33f;
        }
    }
</style>
