<template>
    <div id="app_control_bar">
        <span>x: 0.000, y: 0.000</span>
        <span class="spacer"></span>
        <i class="material-icons">refresh</i>
        <i class="material-icons">play_arrow</i>
        <i class="material-icons">fullscreen</i>
    </div>
</template>

<script>
    export default {
        name: 'AppControlBar'
    };
</script>

<style scoped lang="scss">
     #app_control_bar {
         background-color: #333;
         color: #fff;
         height: 2em;
         line-height: 2em;
         display: flex;
         padding: 0 0.5em;
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
</style>
