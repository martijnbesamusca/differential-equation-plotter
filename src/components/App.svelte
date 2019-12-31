<script lang="typescript">
    import Title from './Title.svelte';
    import Plot from './Plot.svelte';
    import ControlBar from './ControlBar.svelte';
    import Settings from './Settings.svelte';
    import Splitter from './splitter/Splitter.svelte';
    import Panel from './splitter/Panel.svelte';
</script>

<style>
    .main {
      height: 100vh;
    }
    .plotContainer {
      width: 100%;
      height: calc(100% - 1.2em);
    }
    .barContainer {
      height: 1.2em;
    }
</style>

<div class="main">
  <Splitter>
    <Panel minWidth="20em" size=7>
        <div class="plotContainer">
            <Plot />
        </div>
        <div class="barContainer">
            <ControlBar />
        </div>
    </Panel>
    <Panel minWidth="15em" size=2>
        <Title />
        <Settings />
    </Panel>
    </Splitter>
</div>
