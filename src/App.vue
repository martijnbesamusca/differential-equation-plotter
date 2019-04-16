<template>
  <div id="app">
    <app-plot :height="canvasHeight" :width="canvasWidth"></app-plot>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import AppPlot from './components/AppPlot.vue';

@Component({
  components: {
    AppPlot,
  },
})
export default class App extends Vue {
  canvasHeight = window.innerHeight;
  canvasWidth = window.innerWidth;

  mounted(){
    window.addEventListener('resize', ()=>{
      this.canvasHeight = window.innerHeight;
      this.canvasWidth = window.innerWidth;
    })
  }
}
</script>

<style lang="scss">
  body, html {
    padding: 0;
    margin: 0;
  }

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
</style>
