<template>
    <div id="settings">
        <h1 id="settings_title">Settings</h1>
        <app-input-panel title="window">
            <app-input-group title="view">
                <app-input label="x min" varName="viewbox.x.min" type="number" :store="this.$store" :max="this.$store.state.settings.viewbox.x.max - 0.001"/>
                <app-input label="x max" varName="viewbox.x.max" type="number" :store="this.$store"/>
                <app-input label="y min" varName="viewbox.y.min" type="number" :store="this.$store"/>
                <app-input label="y max" varName="viewbox.y.max" type="number" :store="this.$store"/>
            </app-input-group>
        </app-input-panel>
        <app-input-panel title="arrows">
            <app-input-number label="Number of arrows" varName="arrowAmount" type="number" :store="this.$store" :max="this.maxNumArrow"/>
            <app-input-number label="Speed" varName="speed" type="number" :store="this.$store" step="0.1"/>
            <app-input-number label="Maximal age" varName="arrowMaxAge" type="number" :store="this.$store" step="1"/>
            <app-input-number label="Size" varName="arrowSize" type="number" :store="this.$store" min="1.0" step="0.1"/>
            <app-input label="Color" varName="arrowColor" type="color" :store="this.$store"/>
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

@Component({
    components: {
        AppInput,
        AppInputNumber,
        AppInputGroup,
        AppInputPanel,
    },
})
export default class AppSettingsMenu extends Vue {
    private maxNumArrow = ArrowCloud.MAX_NUM_ARROWS;
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
        font-size: 2.5em;
        text-align: center;
        border-bottom: #666 3px solid;
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
