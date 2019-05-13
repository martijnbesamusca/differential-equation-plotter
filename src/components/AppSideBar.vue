<template>
    <div id="sideBar">
        <div id="titleBox">
            <h1 id="title">$$d \text{ODE} p$$</h1>
            <h2 id="subtitle">A dynamic ODE plotter</h2>
            <h2 id="author">by Martijn Besamusca</h2>
        </div>
        <app-tabs>
            <app-tab title="functions" icon="functions">
                <div> 1 </div>
            </app-tab>
            <app-tab title="settings" icon="menu">
                <div> 2 </div>
            </app-tab>
            <app-tab title="export/import" icon="save-alt">
                <div> 3 </div>
            </app-tab>
        </app-tabs>
        <app-settings-menu />
    </div>
</template>

<script>
    import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
    import AppSettingsMenu from '@/components/AppSettingsMenu.vue';
    import AppTabs from '@/components/AppTabs.vue';
    import AppTab from '@/components/AppTab.vue';
    import MathLive from 'mathlive';
    import SettingsIcon from "vue-material-design-icons/Settings.vue"

    @Component({
        components: {
            AppSettingsMenu,
            SettingsIcon,
            AppTabs,
            AppTab,
        },
    })
    export default class AppSideBar extends Vue{
        mounted() {
            const title = document.getElementById('title');
            MathLive.renderMathInElement(title);
        }
    }
</script>

<style scoped>
    #sideBar {
        background-color: #333;
        color: #fff;
        grid-area: settings;
        height: 100vh;
        overflow-y: auto;
    }

    #titleBox{
        background-color: #111;
        padding: 1em 0;
    }

    #title {
        text-align: center;
        margin: 0;
        font-size: 3em;
    }

    #subtitle, #author {
        text-align: center;
        margin: 0;
        font-size: 1.2em;
    }
</style>
