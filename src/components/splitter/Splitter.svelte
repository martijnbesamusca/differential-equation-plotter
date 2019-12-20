<style>
    .splitter {
        height: 100%;
        width: 100%;
        display: grid;
    }
    .handle {
        /*position: absolute;*/
        display: block;
        background-color: white;
        width: 100%;
        height: 100%;
        /*margin-left: -1px;*/
        box-shadow: 0 0 0.5em 0 black;
    }
    /*.handle::before {*/
    /*    content: '';*/
    /*    box-sizing: border-box;*/
    /*    display: block;*/
    /*    position: relative;*/
    /*    top: calc(50% - 2.5em);*/
    /*    background-color: white;*/
    /*    width: 1em;*/
    /*    height: 5em;*/
    /*    margin-left: -0.5em;*/
    /*    border-radius: 0.5em;*/
    /*    cursor: w-resize;*/
    /*    box-shadow: 0 0 0.5em 0 black;*/
    /*}*/
</style>

<script lang="typescript">
    import { onMount } from 'svelte';
    import {handle, IHandle} from '../../api/ui/handle'

    let splitter: HTMLDivElement;
    let total_width: number;
    let panels: HTMLDivElement[] = [];
    let handles: IHandle[] = [];
    let handlesElms: HTMLDivElement[] = [];
    let sizes: number[] = [];
    
    onMount(async () => {
        const splitter_rect = splitter.getBoundingClientRect();
        total_width = splitter_rect.width;
        panels = [...splitter.children] as HTMLDivElement[];
        const panel_size = Math.round(total_width / panels.length);
        sizes = panels.map(value => {
            const size = value.dataset.size;
            if(size === undefined) {
                console.warn('No size defined, setting size to zero');
                return 0;
            }
            return panel_size * Number.parseInt(size)
        });
        writeStyle();

        for(let i = 0; i < panels.length-1; i++) {
            handles = [ ...handles,
            {
                index: i,
                leftPanel: panels[i],
                rightPanel: panels[i+1]
            }]
        }
    });

    function writeStyle() {
        console.log(sizes);
        console.log(sizes.reduce((acc, val) => `${acc} 1px ${val}`, '').substring(5))
        splitter.style.gridTemplateColumns = sizes.reduce((acc, val) => `${acc} 1px ${val}fr`, '').substring(5);
    }

    function update() {
        sizes = [];
        let total_left = 0;
        for(const handleElm of handlesElms) {
            const left = Number.parseInt(handleElm.style.left);
            const size = left - total_left;
            sizes.push(left - total_left);
            total_left += size;
        }
        sizes.push(total_width - total_left);
        writeStyle();
    }
</script>

<div class="splitter" bind:this={splitter}>
    <slot />
    {#each handles as handleObj, i}
        <div class="handle" draggable="false" bind:this={handlesElms[i]} use:handle={handleObj}></div>
    {/each}
</div>
