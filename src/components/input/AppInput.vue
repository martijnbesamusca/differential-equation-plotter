<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import {VNode} from "vue";
    import {Store} from 'vuex';
    import {get, omit} from 'lodash';
    import {NormalizedScopedSlot} from "vue/types/vnode";

    export interface FunctionalRenderingContext {
        props: {[key:string]: string};
        children: Vue[];
        slots: {[key: string]: VNode[] | undefined};
        scopedSlots: {[key: string]: NormalizedScopedSlot | undefined};
        data: Record<string, any>;
        parent: Vue;
        listeners: Record<string, Function | Function[]>;
        injections: any;
    }

    @Component({
        functional: true
    })
    export default class AppInput extends Vue {
        public label: string;
        public varName: string;
        public store: Store;

        render(createElement: typeof Vue.prototype.$createElement, context: FunctionalRenderingContext): VNode[] {
            const prefix = 'input_';

            const label = createElement('label', {
                domProps: {
                    innerHTML: context.props.label,
                },

                attrs: {
                    for: prefix + context.props.varName,
                }
            });

            const input = createElement('input', {
                on: {
                    change(e: KeyboardEvent) {
                        if (!e.target.checkValidity()){
                            return;
                        }

                        context.props.store.commit('settings/changeValue',  {key: context.props.varName, val: e.target.value});
                    }
                },

                domProps: {
                    type: context.props.type,
                    value: get(context.props.store.state.settings, context.props.varName),
                    id: prefix + context.props.varName,
                },

                attrs: omit(context.data.attrs, ['label', 'varName', 'type', 'store']),
            });

            return [label, input]
        }

        static createLabel(createElement: typeof Vue.prototype.$createElement, context): VNode {
            return createElement('label', {
                domProps: {
                    innerHTML: context.props.label,
                },

                attrs: {
                    for: prefix + context.props.varName,
                }
            });
        }
    }
</script>

<style scoped>

</style>
