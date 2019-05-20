<template>
    <div class="equationMenu">
        <h2 id="equation_title">Equations</h2>
        <app-tabs>
            <app-tab title="cartesian" text="$$ \dot{x}, \dot{y} $$">
                <app-math-input label="$$\dot{x}=$$" class="mathInput" @input="dx = $event">{{ dx }}</app-math-input>
                <app-math-input label="$$\dot{y}=$$" class="mathInput" @input="dy = $event">{{ dy }}</app-math-input>
                <button class="applyButton" @click="enableCartesian">Apply</button>
            </app-tab>

            <app-tab  title="matrix" text="$$ \dot{\vec{x}} = A\vec{x} $$">
                <app-input-matrix label="$$ A= $$" class="matrix" v-model="A"/>
                <button class="applyButton" @click="enableMatrix">Apply</button>
            </app-tab>

            <app-tab  title="polar" text="$$ \dot{r}, \dot{\theta} $$">
                <span ref="polarNotice" id="polarNotice">
                    The variable $$ \theta $$ can be typed <br> both as $$ \theta $$ or as $$ t $$ for ease of typing.
                </span>
                <app-math-input label="$$\dot{r}=$$" class="mathInput" @input="dr = $event">{{ dr }}</app-math-input>
                <app-math-input label="$$\dot{\theta}=$$" class="mathInput" @input="dt = $event">{{ dt }}</app-math-input>
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
    import {ODETypes} from '@/store/modules/settings';
    import MathLive from 'mathlive';
    import {JSFunctionGen} from '@/api/MastonConvert';

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

        $refs: {
            polarNotice,
        };

        mounted() {
            MathLive.renderMathInElement(this.$refs.polarNotice);
        }

        enableMatrix() {
            this.$store.commit('changeValue', {key: 'ODEType', val: ODETypes.Matrix});
        }
        enableCartesian() {
            const mast = MathLive.latexToAST(this.$store.state.settings.dxString);

            console.log(mast);
            console.log(JSFunctionGen(mast, ['x', 'y']))
        }

        get dx(){
            return this.$store.state.settings.dxString;
        }

        set dx(mathfield) {
            this.$store.commit('changeValue', {key: 'dxString', val: mathfield.text('latex')});
        }

        get dy(){
            return this.$store.state.settings.dyString;
        }

        set dy(mathfield) {
            this.$store.commit('changeValue', {key: 'dyString', val: mathfield.text('latex')});
        }

        get dr(){
            return this.$store.state.settings.drString;
        }

        set dr(mathfield) {
            this.$store.commit('changeValue', {key: 'drString', val: mathfield.text('latex')});
        }

        get dt(){
            return this.$store.state.settings.dtString;
        }

        set dt(mathfield) {
            this.$store.commit('changeValue', {key: 'dtString', val: mathfield.text('latex')});
        }

        get A() {
            return this.$store.state.settings.AMatrix;
        }

        set A(value) {
            this.$store.commit('changeValue', {key: 'AMatrix', val: value});
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

    #polarNotice {
        display: inline-block;
        padding: 0 2em;
        margin-top: 1em;
        width: 100%;
        text-align: center;
    }
</style>
