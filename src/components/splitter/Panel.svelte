<style>
    .panel {
        height: 100%;
        /*width: calc(var(--pane-width) - 1px);*/
        background-color: #333333;
        /*border: 1px orangered solid;*/
    }
</style>

<script lang="typescript">
    export let size: number = 1;
    export let minWidth: string = '2em';
</script>

<div class="panel" style="min-width:{minWidth}" data-size="{size}">
    <slot/>
</div>
