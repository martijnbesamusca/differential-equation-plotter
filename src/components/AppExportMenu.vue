<template>
    <div id="export_menu">
        <h1 id="settings_title">Export & Import</h1>
        <app-input-panel title="Save & Load">
            <button>Save all settings & equations.</button>
            <button>Save all settings & active equations.</button>
            <button>Save all settings.</button>
            <button>Load</button>
        </app-input-panel>
        <app-input-panel title="Download & Upload">
            <button>Download all settings & equations.</button>
            <button>Download all settings & active equations.</button>
            <button>Download all settings.</button>
            <button>Upload</button>
        </app-input-panel>
        <app-input-panel title="Download image">
            <label for="imgtype">File type</label>
            <select id="imgtype">
                <option>png</option>
                <option>jpg</option>
                <option>pdf</option>
                <option>svg</option>
            </select>
            <button>Download</button>
        </app-input-panel>
        <app-input-panel title="Download video">
            <label for="videotype">File type</label>
            <select id="videotype">
                <option>gif</option>
                <option>mp4</option>
                <option>webm</option>
            </select>
            <button>Download</button>
        </app-input-panel>
    </div>
</template>

<script lang="ts">
    import {Component, Vue, Watch} from 'vue-property-decorator';
    import AppInputGroup from "./input/AppInputGroup.vue";
    import AppInputPanel from "@/components/input/AppInputPanel.vue";
    import AppInput from "@/components/input/AppInput.vue";

    @Component({
        components: {
            AppInputGroup,
            AppInputPanel,
            AppInput,
        },
    })
    export default class AppExportMenu extends Vue {
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

<style scoped lang="scss">
    @import "../style/variables.scss";

     #export_menu button {
         -webkit-appearance: none;
         width: 100%;
         padding: 0.3em 0.5em;
         border: 0.15em solid #555;
         outline: none;
         border-radius: $input-radius;
         border-right-width: 0;
         background-color: #333;
         color: #fff;
         cursor: pointer;
         text-transform: none;
     }
</style>
