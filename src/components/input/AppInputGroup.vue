<template>
    <label class="groupLabel">
        <span>{{ label }}</span>
        <template v-for="input in inputs">
            <label class="subLabel" :for="generateId(label, input.key)">{{ input.label }}</label>
            <input :id="generateId(label, input.key)" v-model="bind[input.key]" :type="input.type">
        </template>
    </label>
</template>

<script lang="ts">
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";
    import AppSettingsMenu from '@/components/AppSettingsMenu.vue';

    interface IInput{
        name:string,
        key:string;
        type:string;
    }

    @Component()
    export default class AppInputGroup {
        @Prop(String) label:string;
        @Prop(Array) inputs: IInput[];
        @Prop(AppSettingsMenu) bind: AppSettingsMenu;

        onInput(key: string){
            this.bind[key] = key;
        }

        generateId(label: string, subLabel:string){
            label = label.replace(' ', '_');
            subLabel = subLabel.replace(' ', '_');
            return `${label}.${subLabel}`
        }
    }
</script>

<style scoped lang="scss">
    @import "../../style/variables.scss";
    @import "../../style/mixins.scss";

    .groupLabel {
        display: grid !important;
        /*grid-template-columns: auto max-content 50%;*/
        grid-template-columns: auto auto auto;
        grid-column-gap: 0.5em;
        margin-bottom: 0.5em;

        span {
            grid-column: 1;
            text-align: right;
        }

        .subLabel {
            grid-column: 2;
        }
        input {
            @extend %input;
            grid-column: 3;
            border-radius: 0;
            margin: 0;
            &:first-of-type{
                border-radius: $input-radius $input-radius 0 0;
            }
            &:last-of-type{
                border-radius: 0 0 $input-radius $input-radius;
            }
        }
    }
</style>
