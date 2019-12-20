<style>
    .panel {
        height: 100%;
        /*width: calc(var(--pane-width) - 1px);*/
        background-color: #333333;
        border: 1px orangered solid;
    }
</style>

<script lang="typescript">
    import { onMount } from 'svelte';
    export let size: number = 1;
    export let minWidth: string = 'none';
    let panel;
    let parentWidth: number;
    let width = '50%';
    onMount(async () => {

        $: {
            parentWidth = panel.parentElement.getBoundingClientRect().width;
            width = panel.parentElement.getBoundingClientRect().width / 2 + 'px';
            console.log(panel.parentElement.getBoundingClientRect().width)
        }
    });

</script>

<div class="panel" bind:this={panel} style="min-width: {minWidth}">
    <slot/>
</div>
