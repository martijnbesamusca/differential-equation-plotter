import AppPlot from "@/components/AppPlot.vue";
import PlotRenderer from "@/api/PlotRenderer";

interface plotState {
  fullscreen: boolean;
  playing: boolean;
  plot: PlotRenderer | null;
}

const state: plotState = {
  fullscreen: false,
  playing: true,
  plot: null
};

const mutations = {
  setPlot(state: plotState, plot: PlotRenderer) {
    state.plot = plot;
  },

  setFullscreen(state: plotState, fullscreen: boolean) {
    state.fullscreen = fullscreen;
  },

  setPlaying(state: plotState, playing: boolean) {
    state.playing = playing;
  }
};

const actions = {
  playOrPause(context: object) {
    context.commit("setPlaying", !context.state.playing);
  },

  initPlot(context: object, plot: PlotRenderer) {
    context.commit("setPlot", plot);
  },

  requestFullscreen(context: object) {
    if (!context.state.plot) return;
    const isFullscreen = context.state.fullscreen;
    if (isFullscreen) return document.exitFullscreen();
    return context.state.plot!.canvas.parentElement!.parentElement!.requestFullscreen();
  }
};

const getters = {};

export default {
  state,
  mutations,
  actions,
  getters
};
