<template>
    <div id="export_menu">
        <h1 id="settings_title">Export & Import</h1>

        <app-input-panel title="Store online">
            <button @click="openSaveModal">Save</button>

            <modal ref="saveModal">
                <template v-slot:title>
                    <h1>Save locally</h1>
                </template>
                <template v-slot:body>
                    <div class="input-grid">
                        <label for="save_name">Name</label>
                        <input  id="save_name" v-model="saveModalName"/>

                        <label for="save_settings">Save settings</label>
                        <input type="checkbox" id="save_settings" v-model="saveModalSettings">

                        <label for="save_equations">Save equations</label>
                        <input type="checkbox" id="save_equations" v-model="saveModalEquations">
                    </div>
                </template>
                <template v-slot:footer>
                    <div class="footer">
                        <button @click="saveLocally" class="positive">Save</button>
                        <button @click="closeSaveModal()">Cancel</button>
                    </div>
                </template>
            </modal>

            <button>Load</button>
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
import { Component, Vue, Watch } from "vue-property-decorator";
import AppInputGroup from "./input/AppInputGroup.vue";
import AppInputPanel from "@/components/input/AppInputPanel.vue";
import AppInput from "@/components/input/AppInput.vue";
import Modal from '@/components/Modal.vue';
import {addSave} from '@/api/SaveDatabase';

@Component({
  components: {
    AppInputGroup,
    AppInputPanel,
    AppInput,
    Modal,
  }
})
export default class AppExportMenu extends Vue {
  private imgType = "png";
  private videoType = "gif";

  private saveModalName = "my beautiful plot";
  private saveModalSettings = true;
  private saveModalEquations = true;

  $refs!: {
      saveModal: Modal
  };

  private downloadImage() {
    console.log("Downloading image as " + this.imgType);
  }

  private downloadVideo() {
    console.log("Downloading video as " + this.videoType);
  }
  private openSaveModal() {
    this.$refs.saveModal.open();
  }
  private closeSaveModal() {
      this.$refs.saveModal.close();
    // this.$refs.saveModal.close();
  }

  private saveLocally() {
      console.log(this.saveModalName, this.saveModalSettings,this.saveModalEquations);
      addSave(this.saveModalName, {test: 'HEYO'}).then(()=> {
          console.log('success');
      }).catch(reason => {
          console.warn(reason);
      });
      this.closeSaveModal();
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
        border-right-width: inherit;
    }

    #export_menu button {
        @extend %button;
     }
</style>
