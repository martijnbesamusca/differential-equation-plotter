<template>
    <div id="export_menu">
        <h1 id="settings_title">Export & Import</h1>

        <app-input-panel title="Save & Load">
            <button class="width2">Save all settings & equations</button>
            <button>Save all settings & active equations</button>
            <button>Save all settings</button>
            <button class="width2">Load</button>
        </app-input-panel>

        <app-input-panel title="Download & Upload">
            <button class="width2">Download all settings & equations</button>
            <button>Download all settings & active equations</button>
            <button>Download all settings</button>
            <button class="width2">Upload</button>
        </app-input-panel>

        <app-input-panel title="Download image">
            <label for="imgtype">File type</label>
            <select id="imgtype" v-model="imgType">
                <option>png</option>
                <option>jpg</option>
                <option>pdf</option>
                <option>svg</option>
            </select>
            <button class="width2" @click="downloadImage">Download</button>
        </app-input-panel>

        <app-input-panel title="Download video">
            <label for="videotype">File type</label>
            <select id="videotype" v-model="videoType">
                <option>gif</option>
                <option>mp4</option>
                <option>webm</option>
            </select>
            <button class="width2" @click="downloadVideo">Download</button>
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
        private imgType = 'png';
        private videoType = 'gif';

        private downloadImage() {
            console.log('Downloading image as ' + this.imgType);
        }

        private downloadVideo() {
            console.log('Downloading video as ' + this.videoType);
        }
    }
</script>

<style scoped lang="scss">
    @import "../style/variables.scss";
    @import "../style/mixins.scss";

    #export_menu {
        background-color: #333;
    }

    #export_menu select {
        @extend %input;
        width: 100%;
    }
    #export_menu button {
         -webkit-appearance: none;
         width: 100%;
         padding: 0.5em 1em;
         border: 0.15em solid #555;
         outline: none;
         border-radius: $input-radius;
         background-color: #333;
         color: #fff;
         cursor: pointer;
         text-transform: none;
         transition: border-color 200ms;
         
         &:hover {
             border-color: #31c14b;
         }

         &.width2 {
             grid-column: 1 / span 2;
         }
     }
</style>
