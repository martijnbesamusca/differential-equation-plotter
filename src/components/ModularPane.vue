<template>
    <div>
        <div>hey</div>
        <slot></slot>
        <!--<app-plot v-if="paneType === 'plot'"/>-->
        <!--<app-title-bar v-if="paneType === 'bar'"></app-title-bar>-->
        <!--<app-side-bar></app-side-bar>-->
    </div>
</template>

<script lang="ts">
    import {Component, Vue, Watch} from 'vue-property-decorator';

    @Component({
        components: {
        },
    })
    export default class ModularPane extends Vue {
        public paneType = null; // vertical - horizontal

        public mounted() {
        }
    }
</script>

<style scoped>

</style>
