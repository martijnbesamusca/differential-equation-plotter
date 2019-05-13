<template>
    <div class="tabs">
        <ul class="menu">
            <li v-for="(tab, i) in tabs"
                class="menuItem"
                :class="{active: tab.activated}"
                @click="activate(tab)"
                :title="tab.$data.title">
                {{ Object.keys(tab) }} -
                <i class="material-icons"> {{ tab.icon }} </i>
            </li>
        </ul>
        <slot />
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
    import AppTab from '@/components/AppTab.vue';

    @Component({})
    export default class AppTabs extends Vue {
        tabs: AppTab[] = [];

        created() {
            this.tabs = this.$children as AppTab[];
        }

        activate(tab: AppTab) {
            for(let t of this.tabs) {
                t.activated = false;
            }
            tab.activated = true;
        }
    }
</script>

<style scoped>
.tabs .menu {
    list-style: none;
}

.tabs .menuItem {
    display: inline-block;
}
</style>
