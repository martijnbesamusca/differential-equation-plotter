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
        grid-row-start: 1;
    }
    .handle::before {
        content: '';
        box-sizing: border-box;
        position: absolute;
        background-color: white;
        height: 3em;
        width: 0.8em;
        margin-left: -0.4em;
        border-radius: .4em;
        top: 50%;
        cursor: w-resize;
    }
</style>

<script lang="typescript">
    import { onMount } from 'svelte';
    import {handle, IHandle, UpdateEvent} from '/src/api/ui/handle'

    const RES = 1000;
    let splitter: HTMLDivElement;
    let total_width: number;
    let panels: HTMLDivElement[] = [];
    let handles: IHandle[] = [];
    let handlesElms: HTMLDivElement[] = [];
    let sizes: number[] = [];

    onMount(async () => {
        const splitter_rect = splitter.getBoundingClientRect();
        total_width = splitter_rect.width;
        panels = [...splitter.querySelectorAll('.panel')] as HTMLDivElement[];
        const column_count = panels.reduce((acc, val)=> acc + Number.parseInt(val.dataset.size), 0);
        const panel_size = Math.round(RES / column_count);
        sizes = panels.map(value => {
            const size = value.dataset.size;
            if(size === undefined) {
                console.warn('No size defined, setting size to zero');
                return 0;
            }
            return panel_size * Number.parseInt(size)
        });
        writeStyle();

        splitter.addEventListener('moved', (e: UpdateEvent) => {
            let sum = sizes.reduce((acc, cur, i) => {
                return i<e.handle.index ? acc + cur : acc
            }, 0);
            let sum_right = sum + sizes[e.handle.index] + sizes[e.handle.index + 1];
            const pos = e.pos/total_width*RES;
            sizes[e.handle.index] = pos - sum;
            sizes[e.handle.index + 1] = sum_right - pos;
            writeStyle();
        });

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
        splitter.style.gridTemplateColumns = sizes.reduce((acc, val) => `${acc} 1px ${val}fr`, '').substring(5);
    }
</script>

<div class="splitter" bind:this={splitter}>
    <slot />
    {#each handles as handleObj, i}
        <div class="handle" draggable="false" bind:this={handlesElms[i]} use:handle={handleObj}></div>
    {/each}
</div>
