<template>
    <label class="groupLabel">
        <span class="groupTitle">{{ title }}</span>
        <slot ref="slot"></slot>
    </label>
</template>

<script lang="ts">
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";
    import AppSettingsMenu from '@/components/AppSettingsMenu.vue';
    import {VNode} from "vue";

    @Component()
    export default class AppInputGroup extends Vue{
        @Prop(String) title:string;
    }
</script>

<style scoped lang="scss">
    @import "../../style/variables.scss";
    @import "../../style/mixins.scss";

    .groupLabel {
        display: grid !important;
        grid-template-columns: auto auto auto;
        margin-bottom: 0.5em;

        .groupTitle {
            grid-column: 1;
            text-align: right;
        }

        label {
            grid-column: 2;
        }

        input {
            @extend %input;
            grid-column: 3;
            border-radius: 0 !important;
            margin: 0 !important;
            &:first-of-type{
                border-radius: $input-radius $input-radius 0 0 !important;
            }
            &:last-of-type{
                border-radius: 0 0 $input-radius $input-radius !important;
            }
        }
    }
</style>
