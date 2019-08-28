<template>
  <div id="export_menu">
    <h1 id="settings_title">Export & Import</h1>

    <app-input-panel title="Store in browser">
      <button @click="openSaveModal">Save</button>
      <modal ref="saveModal">
        <template v-slot:title>
          <h1>Save in browser</h1>
        </template>
        <template v-slot:body>
          <div class="input-grid">
            <label for="save_name">Name</label>
            <input id="save_name" v-model="saveModalName" />

            <label for="save_settings">Save settings</label>
            <input
              type="checkbox"
              id="save_settings"
              v-model="saveModalSettings"
            />

            <label for="save_equations">Save equations</label>
            <input
              type="checkbox"
              id="save_equations"
              v-model="saveModalEquations"
            />
          </div>
        </template>
        <template v-slot:footer>
          <button @click="saveLocally" class="positive">Save</button>
          <button @click="closeSaveModal">Cancel</button>
        </template>
      </modal>

      <button @click="openLoadModal">Load</button>
      <modal ref="loadModal">
        <template v-slot:title>
          <h1>Load from browser</h1>
        </template>
        <template v-slot:body>
          <div class="input-grid column3">
            <template v-for="name in savesList">
              <div class="grid-start">{{ name }}</div>
              <button @click="load(name)" class="positive">load</button>
              <button @click="removeSave(name)" v-if="name !== 'default'">remove</button>
            </template>
          </div>
        </template>
        <template v-slot:footer>
          <button @click="closeLoadModal()">Cancel</button>
        </template>
      </modal>
    </app-input-panel>

    <app-input-panel title="Download & Upload">
      <label for="download_settings">Download settings</label>
      <input
              type="checkbox"
              id="download_settings"
              v-model="downloadSettings"
      />

      <label for="download_equations">Download equations</label>
      <input
              type="checkbox"
              id="download_equations"
              v-model="downloadEquations"
      />
      <button @click="downloadSave">Download</button>
      <button @click="uploadSave">Upload</button>
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
import Modal from "@/components/Modal.vue";
import {addSave, getSavesList, loadSave, removeSave} from "@/api/SaveDatabase";

interface File {
  text: Promise<string>;
}

@Component({
  components: {
    AppInputGroup,
    AppInputPanel,
    AppInput,
    Modal
  }
})
export default class AppExportMenu extends Vue {
  private imgType = "png";
  private videoType = "gif";

  private saveModalName = "my beautiful plot";
  private saveModalSettings = true;
  private saveModalEquations = true;

  private downloadSettings = true;
  private downloadEquations = true;

  private savesList: string[] = [];

  $refs!: {
    saveModal: any;
    loadModal: any;
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
  }

  private openLoadModal() {
    this.updateSavesList();
    this.$refs.loadModal.open();
  }
  private closeLoadModal() {
    this.$refs.loadModal.close();
  }

  private downloadSave() {
    const settings = this.getSettingsAndEquations(this.saveModalSettings, this.saveModalEquations);
    const blob = new Blob([JSON.stringify(settings, null, 2)]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date();
    const dateString = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + '_' + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();
    a.style.display = 'none';
    a.href = url;
    a.download =  'ODE-graph-' + dateString + '.json';
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }

  private uploadSave() {
    const input = document.createElement('input');
    input.addEventListener('change', ev => {
      const files = input.files;
      if (!files || files.length !== 1) return;
      const file = files[0];
      // @ts-ignore: bug in typescript missing method
      file.text().then((file: string) => {
        const newSettings = JSON.parse(file);
        for (const [key, val] of Object.entries(newSettings)) {
          this.$store.commit("changeValue", { key, val });
        }
      });
    });
    input.type = 'file';
    input.accept = '.json';
    input.click();
    input.remove();
  }

  private load(name: string) {
    loadSave(name).then(value => {
      for (const [key, val] of Object.entries(value)) {
        this.$store.commit("changeValue", { key, val });
      }
    });
    this.closeLoadModal();
  }
  private removeSave(name: string) {
    removeSave(name).then(()=> {
      this.updateSavesList();
    });
  }

  private saveLocally() {
    console.log(
      this.saveModalName,
      this.saveModalSettings,
      this.saveModalEquations
    );

    const settings = this.getSettingsAndEquations(this.downloadSettings, this.downloadEquations);

    addSave(this.saveModalName, settings)
      .then(() => {
        console.log("success");
      })
      .catch(reason => {
        console.warn(reason);
      });
    this.closeSaveModal();
  }

  private getSettingsAndEquations(enableSettings: boolean, enableEquations: boolean) {
    let settings = this.$store.state.settings;

    if (!enableSettings && !enableEquations) {
      return {};
    }

    if (!enableEquations) {
      const {
        dxString,
        dyString,
        drString,
        dtString,
        AMatrix,
        ODEType,
        ...copy
      } = settings;
      settings = copy;
    }

    if (!enableSettings) {
      const {
        dxString,
        dyString,
        drString,
        dtString,
        AMatrix,
        ODEType
      } = settings;
      settings = { dxString, dyString, drString, dtString, AMatrix, ODEType };
    }

    return settings;
  }

  private updateSavesList() {
    getSavesList().then(list => {
      console.log(list);
      this.savesList = list as string[];
    });
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

input {
  @extend %input;
  width: 100%;
  border-right-width: unset;
}
</style>
