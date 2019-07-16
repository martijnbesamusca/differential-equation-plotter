<template>
    <div id="settings">
        <h1 id="settings_title">Settings</h1>
        <app-input-panel title="window">
            <app-input-group title="view">
                <app-input-number label="x min" varName="viewbox.x.min" :store="this.$store" :max="this.$store.state.settings.viewbox.x.max - delta" :step="delta"/>
                <app-input-number label="x max" varName="viewbox.x.max" :store="this.$store" :min="this.$store.state.settings.viewbox.x.min + delta" :step="delta"/>
                <app-input-number label="y min" varName="viewbox.y.min" :store="this.$store" :max="this.$store.state.settings.viewbox.y.max - delta" :step="delta"/>
                <app-input-number label="y max" varName="viewbox.y.max" :store="this.$store" :min="this.$store.state.settings.viewbox.y.min + delta" :step="delta"/>
            </app-input-group>
            <app-input label="Keep aspect ratio" type="checkbox" varName="keepAspectRatio" :store="this.$store" :checked="this.$store.state.settings.keepAspectRatio"/>
        </app-input-panel>
        <app-input-panel title="arrows">
            <app-input-number label="Number of arrows" varName="arrowAmount" type="number" :store="this.$store" :max="this.maxNumArrow"/>
            <app-input-number label="Speed" varName="speed" type="number" :store="this.$store" step="0.1"/>
            <app-input label="Normalize speed" type="checkbox" varName="normalizeSpeed" :store="this.$store" :checked="this.$store.state.settings.normalizeSpeed"/>
            <app-input-number label="Maximal age" varName="arrowMaxAge" type="number" :store="this.$store" step="1" min="10"/>
            <app-input label="Random max age" type="checkbox" varName="arrowRandomizeMaxAge" :store="this.$store" :checked="this.$store.state.settings.arrowRandomizeMaxAge"/>
            <app-input-number label="Size" varName="arrowSize" type="number" :store="this.$store" min="1.0" step="0.1"/>
            <app-input label="Color" varName="arrowColor" type="color" :store="this.$store"/>
            <app-input label="Randomize color" type="checkbox" varName="arrowRandomColor" :store="this.$store" :checked="this.$store.state.settings.arrowRandomColor"/>
            <label for="methodAprox">approximation method</label>
            <select id="methodAprox" v-model.number="approxModel">
                <option value=0>Euler</option>
                <optgroup label="Runge-Kutta">
                    <option value=1>Second order</option>
                    <option value=2>Fourth order</option>
                </optgroup>
            </select>
        </app-input-panel>

        <app-input-panel title="Solutions">
            <app-input-number label="Step size" varName="solutionStepSize" :store="this.$store" min="0.001" step="any"/>
            <app-input-number label="Sub steps" varName="solutionSubSteps" :store="this.$store" min="0" step="1"/>
            <app-input-number label="Length" varName="solutionLength" :store="this.$store" min="1" step="1"/>
            <app-input-number label="Width" varName="solutionWidth" :store="this.$store" min="0"/>
            <app-input label="Color" varName="solutionColor" type="color" :store="this.$store"/>
            <label for="solutionMethodAprox">approximation method</label>
            <select id="solutionMethodAprox" v-model.number="solutionMethodApprox">
                <option value=0>Euler</option>
                <optgroup label="Runge-Kutta">
                    <option value=1>Second order</option>
                    <option value=2>Fourth order</option>
                </optgroup>
            </select>
        </app-input-panel>

        <app-input-panel title="Nullclines">
            <app-input-group title="x nullcline">
                <app-input label="enable" type="checkbox" varName="keepAspectRatio" :store="this.$store" :checked="this.$store.state.settings.keepAspectRatio"/>
                <app-input label="color" varName="arrowColor" type="color" :store="this.$store"/>
            </app-input-group>

            <app-input-group title="y nullcline">
                <app-input label="enable" type="checkbox" varName="keepAspectRatio" :store="this.$store" :checked="this.$store.state.settings.keepAspectRatio"/>
                <app-input label="color" varName="arrowColor" type="color" :store="this.$store"/>
            </app-input-group>
        </app-input-panel>


    </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
import AppInputGroup from '@/components/input/AppInputGroup.vue';
import AppInputPanel from '@/components/input/AppInputPanel.vue';
import AppInput from '@/components/input/AppInput.vue';
import ArrowCloud from '@/api/ArrowCloud';
import AppInputNumber from '@/components/input/AppInputNumber.vue';
import AppInputSwitch from '@/components/input/AppInputSwitch.vue';
import {ODEAprox} from '@/store/modules/settings';

@Component({
    components: {
        AppInput,
        AppInputNumber,
        AppInputSwitch,
        AppInputGroup,
        AppInputPanel,
    },
})
export default class AppSettingsMenu extends Vue {
    private maxNumArrow = ArrowCloud.MAX_NUM_ARROWS;
    private delta = 0.001;

    get approxModel() {
        return this.$store.state.settings.ODEAproxmethod;
    }
    set approxModel(value: number) {
        return this.$store.commit('changeValue', {key: 'ODEAproxmethod', val: value});
    }

    get solutionMethodApprox() {
        return this.$store.state.settings.solutionODEApproxMethod;
    }
    set solutionMethodApprox(value: number) {
        return this.$store.commit('changeValue', {key: 'solutionODEApproxMethod', val: value});
    }
}
</script>

<style lang="scss">
    @import "../style/mixins.scss";
    @import "../style/variables.scss";
    #settings {
        background-color: #333;
        color: #fff;
    }

    #settings_title {
        padding: 0.5em 0;
        margin: 0;
        font-size: 2em;
        text-align: center;
        border-bottom: #666 3px solid;
        background-color: #222;
    }

    #settings label {
    }

    #settings input {
        @extend %input;

        &[type="color"] {
            padding: 0;
            &::-webkit-color-swatch-wrapper {
                padding: 0;
            }
        }
    }

    #settings .inputWrapper {
        display : flex;
        input {
            border-radius: $input-radius 0 0 $input-radius;
        }

        button {
            @extend %resetbutton;
            border-radius: 0 $input-radius $input-radius 0;
        }
    }

</style>
