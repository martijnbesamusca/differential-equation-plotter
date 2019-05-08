<script lang="ts">
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";
    import settings, {IViewbox} from '@/store/modules/settings';
    import {VNode} from "vue";
    import {Store} from 'vuex';
    import {get, omit} from 'lodash';
    import AppInput, {FunctionalRenderingContext} from "@/components/input/AppInput.vue";

    @Component({
        functional: true
    })
    export default class AppInputNumber extends AppInput {
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

                        if(e.target.hasAttribute('max')) {
                            e.target.value = Math.min(e.target.value, Number.parseFloat(e.target.getAttribute('max')));
                        }

                        if(e.target.hasAttribute('min')) {
                            e.target.value = Math.max(e.target.value, Number.parseFloat(e.target.getAttribute('min')));
                        }

                        if (!e.target.checkValidity()){
                            return;
                        }

                        context.props.store.commit('settings/changeValue',  {key: context.props.varName, val: e.target.value});
                    },
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

    }
</script>

<style scoped>

</style>
