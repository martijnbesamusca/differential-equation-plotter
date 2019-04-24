<template>
    <div id="settings">
        <h1>Settings</h1>
        <app-input-panel title="hey">
            <app-input-group label="view" type="number"
                             :inputs="[
                             {label:'x min', key:'xmin', type: 'number'},
                             {label:'x max', key:'xmax', type: 'number'},
                             {label:'y min', key:'ymin', type: 'number'},
                             {label:'y max', key:'ymax', type: 'number'}
                             ]" :bind="this"/>
            <label>
                Speed <input type="number" v-model="speed" step="0.01">
            </label>
        </app-input-panel>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";
    import {cloneDeep} from 'lodash'
    import {IViewbox} from '@/store/modules/settings';
    import AppInputGroup from '@/components/input/AppInputGroup.vue';
    import AppInputPanel from '@/components/input/AppInputPanel.vue';

    @Component({
        components: {
            AppInputGroup,
            AppInputPanel,
        },
    })
    export default class AppSettingsMenu extends Vue {

        mounted(){
        }

        set xmin(num) { this.$store.commit('settings/changeViewBox', {key: {axis:'x', side: 'min'}, val: num}); }
        get xmin() { return this.$store.state.settings.viewbox.x.min; }
        set xmax(num) { this.$store.commit('settings/changeViewBox', {key: {axis:'x', side: 'max'}, val: num}); }
        get xmax() { return this.$store.state.settings.viewbox.x.max; }
        set ymin(num) { this.$store.commit('settings/changeViewBox', {key: {axis:'y', side: 'min'}, val: num}); }
        get ymin() { return this.$store.state.settings.viewbox.y.min; }
        set ymax(num) { this.$store.commit('settings/changeViewBox', {key: {axis:'y', side: 'max'}, val: num}); }
        get ymax() { return this.$store.state.settings.viewbox.y.max; }

        set speed(num) { this.$store.commit('settings/changeNumber', {key: 'speed', val: num}); }
        get speed() { return this.$store.state.settings.speed; }
    }
</script>

<style scoped lang="scss">
    @import "../style/mixins.scss";
    @import "../style/variables.scss";
    #settings {
        background-color: #333;
        height: 100vh;
        padding: 0 2em;
        grid-area: settings;
        color: #fff;
        overflow-y: auto;
    }


    #settings input {
        @extend %input;
    }

</style>
