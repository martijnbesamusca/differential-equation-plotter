<template>
    <div id="app_control_bar" :class="{collapse: fullscreen}">
        <span>x: {{ cursorX.toPrecision(3) }}, y: {{ cursorY.toPrecision(3) }}</span>

        <span class="spacer"></span>

        <i class="material-icons" id="refresh">refresh</i>

        <i class="material-icons" @click="playOrPause" v-if="playing">pause</i>
        <i class="material-icons" @click="playOrPause" v-else>play_arrow</i>

        <i class="material-icons" @click="openFullscreen" v-if="fullscreen">fullscreen_exit</i>
        <i class="material-icons" @click="openFullscreen" v-else>fullscreen</i>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import NumberFormat from "@/api/NumberFormat";

@Component({})
export default class AppControlBar extends Vue {
  private cursorX = 0.0;
  private cursorY = 0.0;

  get playing() {
    return this.$store.state.plot.playing;
  }

  get fullscreen() {
    return this.$store.state.plot.fullscreen;
  }

  private openFullscreen() {
    this.$store.dispatch("requestFullscreen");
    // document.getElementById('plot').requestFullscreen();
  }
  private playOrPause() {
    this.$store.dispatch("playOrPause");
  }

  public mounted() {
    const viewbox = this.$store.state.settings.viewbox;
    const canvas = <HTMLCanvasElement>document.getElementById("canvas");
    canvas.addEventListener("mousemove", e => {
      const { width, height } = canvas.getBoundingClientRect();
      this.cursorX =
        viewbox.x.min + (e.offsetX / width) * (viewbox.x.max - viewbox.x.min);
      this.cursorY =
        viewbox.y.max - (e.offsetY / height) * (viewbox.y.max - viewbox.y.min);
    });
  }
}
</script>

<style scoped lang="scss">

     #app_control_bar {
         background-color: #333;
         color: #fff;
         height: 2em;
         line-height: 2em;
         display: flex;
         padding: 0 0.5em;
         overflow-y: hidden;

         &.collapse {
             position: fixed;
             bottom: 0;
             width: 100%;
             z-index: 10;
             background-color: transparent;
             color: black;
             font-weight: 700;
             text-shadow: rgba(black, 0.8) 0 0 .5em;
         }
     }

     #app_control_bar .material-icons {
         line-height: unset;
         font-size: 1.5em;
         align-self: flex-end;
         cursor: pointer;
     }

    #app_control_bar .spacer {
        flex-grow: 1;
    }

    #refresh {
        transform: rotate(0deg);
        transition: transform 1s;
        &:active {
            transition: transform 0s;
            transform: rotate(-360deg);
        }
    }
</style>
