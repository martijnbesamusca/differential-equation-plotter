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
    }
</style>

<Splitter class="main">
    <Panel minWidth="20em" size=5>
        <Plot />
        <ControlBar />
    </Panel>
    <Panel size=1>
        <Title />
        <Settings />
    </Panel>
    <Panel size=1>
        <Title />
        <Settings />
    </Panel>
</Splitter>
