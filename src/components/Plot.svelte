<style>
  .plot {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  canvas {
    /*width: 100%;*/
    /*height: 200%;*/
    position: absolute;
    background-color: orange;
  }
</style>
<script lang="typescript">
  import { onMount } from 'svelte';
  let container: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let resizeObserver = new ResizeObserver(debounce(entries => {
    canvas.width = Math.floor(entries[0].contentRect.width);
    canvas.height = Math.floor(entries[0].contentRect.height);
  }, 100, false));

  onMount(async () => {
    resizeObserver.observe(container);
  });
  function debounce(func: Function, wait: number, immediate: boolean) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };
  // function debounce(func, wait) {
  //   let timeout;
  //   return function () {
  //     const cont = this;
  //     const args = arguments;
  //     clearTimeout(timeout);
  //     timeout = setTimeout(func.bind(cont, ...args), wait);
  //   }
  // }
</script>

<div class="plot" bind:this={container}>
  <canvas bind:this={canvas}></canvas>
</div>
