<template>
    <div>
        <app-plot v-if="paneType === 'plot'"/>
        <app-title-bar v-if="paneType === 'bar'"></app-title-bar>
        <app-side-bar></app-side-bar>
    </div>
</template>

<script lang="ts">
    import {Component, Vue, Watch} from 'vue-property-decorator';
    import AppPlot from 'AppPlot.vue';
    import AppSideBar from 'AppSideBar.vue';
    import AppTitleBar from 'AppTitleBar.vue';

    @Component({
        components: {
            AppPlot,
            AppSideBar,
            AppTitleBar,
        },
    })
    export default class ModularPane extends Vue {
        public paneType = null;

        public mounted() {
        }
    }
</script>

<style scoped>

</style>
