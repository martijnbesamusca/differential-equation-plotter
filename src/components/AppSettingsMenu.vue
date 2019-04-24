<template>
    <div id="settings">
        <h1>Settings</h1>
        <app-input-panel title="hey">
            <app-input-group title="view">
                <label for="x_min">x min</label><input id="x_min" ref="x_min" type="number" :max="xmax" v-model="xmin">
                <label for="x_min">x max</label><input id="x_max" ref="x_max" type="number" :min="xmin" v-model="xmax">
                <label for="y_min">y min</label><input id="y_min" ref="y_min" type="number" :max="ymax" v-model="ymin">
                <label for="y_min">y max</label><input id="y_max" ref="y_max" type="number" :min="ymin" v-model="ymax">
            </app-input-group>

            <label>Speed<input type="number" v-model="speed" step="0.01"></label>

        </app-input-panel>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";
    import {cloneDeep} from 'lodash'
    import {IViewbox} from '@/store/modules/settings';
    import AppInputGroup from '@/components/input/AppInputGroup.vue';
    import AppInputPanel from '@/components/input/AppInputPanel.vue';
    import AppInputGroup2 from "@/components/input/AppInputGroup2.vue";

    @Component({
        components: {
            AppInputGroup,
            AppInputPanel,
        },
    })
    export default class AppSettingsMenu extends Vue {
        private settingsHandler = {
            menu: this,
            get(obj, prop) {
                return this.menu.$store.state.settings[prop];
            },
            set(obj, prop, value) {
                debugger;
                this.$store.commit('settings/changeNumber', {key: prop, val: value})
            },
        } as ProxyHandler;
        private settings: {[key: string]: any} =  new Proxy({}, this.settingsHandler);

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


    #settings label {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-column-gap: 0.5em;
    }
    #settings input {
        @extend %input;
        width: auto;
    }

</style>
