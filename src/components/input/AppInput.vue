<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Store} from 'vuex';
import {get, omit} from 'lodash';
import {NormalizedScopedSlot} from 'vue/types/vnode';

export interface FunctionalRenderingContext {
    props: {[key: string]: string};
    children: Vue[];
    slots: {[key: string]: VNode[] | undefined};
    scopedSlots: {[key: string]: NormalizedScopedSlot | undefined};
    data: Record<string, any>;
    parent: Vue;
    listeners: Record<string, Function | Function[]>;
    injections: any;
}

const prefix = 'input_';

@Component({
    functional: true,
})
export default class AppInput extends Vue {

    public static createLabel(createElement: typeof Vue.prototype.$createElement, context): VNode {
        return createElement('label', {
            domProps: {
                innerHTML: context.props.label,
            },

            attrs: {
                for: prefix + context.props.varName,
            },
        });
    }

    public static createInput(createElement: typeof Vue.prototype.$createElement, context): VNode {
        return createElement('input', {
            on: {
                change(e: KeyboardEvent) {
                    if (!e.target.checkValidity()) {
                        return;
                    }

                    context.props.store.commit('changeValue',  {key: context.props.varName, val: e.target.value});
                },

            },

            domProps: {
                type: context.props.type,
                value: get(context.props.store.state.settings, context.props.varName),
                id: prefix + context.props.varName,
            },

            attrs: omit(context.data.attrs, ['label', 'varName', 'type', 'store']),
        });
    }

    public static createResetButton(createElement: typeof Vue.prototype.$createElement, context): VNode {
        return createElement('button', {
            on: {
                click(e: MouseEvent) {
                    if (!confirm(`Do you want to reset "${context.props.label}" to the default value?`)) {
                        return;
                    }
                    context.props.store.dispatch('resetValue', context.props.varName);
                    console.log('click');
                },
            },

            domProps: {
                title: 'Reset value',
            },
        }, '↶');
    }
    public label: string;
    public varName: string;
    public store: Store;

    public render(createElement: typeof Vue.prototype.$createElement, context: FunctionalRenderingContext): VNode[] {
        const label = AppInput.createLabel(createElement, context);
        const input = AppInput.createInput(createElement, context);
        const resetButton = AppInput.createResetButton(createElement, context);
        const inputWrapper = createElement('div', {class: 'inputWrapper' }, [input, resetButton]);

        return [label, inputWrapper];
    }
}
</script>
