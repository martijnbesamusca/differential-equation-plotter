<template>
  <app-tabs id="sideBar">
    <app-tab title="functions" text="$$ \dot{\large{x}} $$">
      <app-equation-menu />
    </app-tab>

    <app-tab title="settings" icon="settings">
      <app-settings-menu />
    </app-tab>

    <app-tab title="export/import" icon="save_alt">
      <AppExportMenu />
    </app-tab>
  </app-tabs>
</template>

<script>
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import SettingsIcon from "vue-material-design-icons/Settings.vue";
import AppSettingsMenu from "@/components/AppSettingsMenu.vue";
import AppExportMenu from "@/components/AppExportMenu.vue";
import AppTabs from "@/components/AppTabs.vue";
import AppTab from "@/components/AppTab.vue";
import AppEquationMenu from "./AppEquationMenu.vue";

@Component({
  components: {
    AppSettingsMenu,
    AppExportMenu,
    SettingsIcon,
    AppTabs,
    AppTab,
    AppEquationMenu
  }
})
export default class AppSideBar extends Vue {
  get activeTab() {
    return this.$store.state.settings.ODEType;
  }
}
</script>

<style scoped>
#sideBar {
  background-color: #333;
  color: #fff;
  grid-area: side;
  height: 100%;
  overflow-y: auto;
}
</style>
