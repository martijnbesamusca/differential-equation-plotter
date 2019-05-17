<template>
    <div class="equationMenu">
        <h2 id="equation_title">Equations</h2>
        <app-tabs>
            <app-tab title="cartesian" text="$$ \dot{x}, \dot{y} $$">
                <app-math-input label="$$\dot{x}=$$" class="mathInput" />
                <app-math-input label="$$\dot{y}=$$" class="mathInput" />
                <button class="applyButton">Apply</button>
            </app-tab>

            <app-tab  title="matrix" text="$$ \dot{\vec{x}} = A\vec{x} $$">
                <app-input-matrix label="$$ A= $$" class="matrix"/>
                <button class="applyButton">Apply</button>
            </app-tab>

            <app-tab  title="polar" text="$$ \dot{r}, \dot{\theta} $$">
                <app-math-input label="$$\dot{r}=$$" class="mathInput"></app-math-input>
                <app-math-input label="$$\dot{\theta}=$$" class="mathInput"></app-math-input>
                <button class="applyButton">Apply</button>
            </app-tab>
        </app-tabs>
    </div>
</template>

<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import AppMathInput from "@/components/input/AppMathInput.vue";
    import AppInputMatrix from "@/components/input/AppInputMatrix.vue";
    import AppTabs from "@/components/AppTabs.vue";
    import AppTab from "@/components/AppTab.vue";

    @Component({
        components: {
            AppMathInput,
            AppInputMatrix,
            AppTabs,
            AppTab,
        }
    })
    export default class AppEquationMenu extends Vue {
        formula: string = '';

        mounted() {
        }
    };
</script>

<style scoped lang="scss">
    @import "../style/mixins.scss";
    @import "../style/variables.scss";

    .mathInput {
        padding: 0 1em;
        margin-top: 1em;
    }

    #equation_title {
        padding: 0.5em 0;
        margin: 0;
        font-size: 1.5em;
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
        border-radius: .25em;
        cursor: pointer;
        font-size: 1em;

        &:active {
            background-color: darken($accent-color, 10%);
        }
     }

    .matrix {
        margin-top: 1em;
    }
</style>
