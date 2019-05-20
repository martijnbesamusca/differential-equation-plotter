<template>
    <div class="matrix">
        <span ref="label" class="matrixLabel">{{ label }}</span>
        <input type="number" class="matrixInput mat11" v-model.number="value[0]" @input="input">
        <input type="number" class="matrixInput mat12" v-model.number="value[1]" @input="input">
        <input type="number" class="matrixInput mat21" v-model.number="value[2]" @input="input">
        <input type="number" class="matrixInput mat22" v-model.number="value[3]" @input="input">
    </div>

</template>

<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import MathLive from 'mathlive';

    @Component
    export default class AppInputMatrix extends Vue{
        @Prop(String) label: string;
        @Prop({default: [2, -2, 2, 1]}) value: Number[4];

        $refs: {
            label: HTMLSpanElement,
        };

        mounted() {
            MathLive.renderMathInElement(this.$refs.label);
        }

        input(){
            this.$emit('input', this.value)
        }
    };
</script>

<style scoped lang="scss">
    @import "../../style/mixins.scss";
    @import "../../style/variables.scss";

    .matrix {
        margin: 0 1em;
        display: grid;
        grid-template-areas:
                'label mat11 mat12'
                'label mat21 mat22';
    }

    .matrixLabel {
        grid-area: label;
        place-self: center;
        margin-right: 0.5em;
    }

    .matrixInput {
        @extend %input;
        width: 100%;
        border-radius: 0;
    }

    .mat11 {
        grid-area: mat11;
        border-top-left-radius: $input-radius;
    }
    .mat12 {
        grid-area: mat12;
        border-top-right-radius: $input-radius;
    }
    .mat21 {
        grid-area: mat21;
        border-bottom-left-radius: $input-radius;
    }
    .mat22 {
        grid-area: mat22;
        border-bottom-right-radius: $input-radius;
    }
</style>
