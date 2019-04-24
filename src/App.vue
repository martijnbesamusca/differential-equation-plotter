<template>
  <div id="app">
    <app-plot :height="canvasHeight" :width="canvasWidth" ref="plot"></app-plot>
    <app-settings-menu></app-settings-menu>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import AppPlot from './components/AppPlot.vue';
import AppSettingsMenu from '@/components/AppSettingsMenu.vue';

@Component({
  components: {
    AppPlot,
    AppSettingsMenu
  },
})
export default class App extends Vue {
  canvasHeight = window.innerHeight;
  canvasWidth = window.innerWidth;

  mounted(){
    window.addEventListener('resize', () => {
      this.canvasHeight = document.getElementById('plot').offsetHeight;
      this.canvasWidth = document.getElementById('plot').offsetWidth;
    })
  }
}
</script>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=Open+Sans');
  body, html {
    padding: 0;
    margin: 0;
    height: 100%
  }

  *{
    box-sizing: border-box;
  }

  #app {
    display: grid;
    width: 100%;
    font-family: 'Open Sans', sans-serif;
    min-height: 100%;
    grid-template-areas:  "plot settings"
                          "plot settings";
  }
</style>
