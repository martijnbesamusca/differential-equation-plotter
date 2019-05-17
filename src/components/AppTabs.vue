<template>
    <div class="tabs">
        <ul class="menu">
            <li v-for="(tab, i) in tabs"
                class="menuItem"
                :class="{active: tab.activated}"
                @click="activate(tab)"
                :title="tab.$props.title">
                <i ref="icon" v-if="tab.$props.icon" class="material-icons">{{ tab.$props.icon }}</i>
                <span ref="text" v-if="tab.$props.text" class="">{{ tab.$props.text }}</span>
            </li>
        </ul>
        <slot />
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
    import AppTab from '@/components/AppTab.vue';
    import MathLive from 'mathlive';

    @Component({})
    export default class AppTabs extends Vue {
        tabs: AppTab[] = [];

        created() {
            this.tabs = this.$children as AppTab[];
        }

        mounted() {
            const activatedTab = this.tabs.find((tab)=> tab.activated) || this.tabs[0];

            this.activate(activatedTab);
        }

        updated() {
            console.log('updated', this.$refs);

            const texts = this.$refs.text || [];
            for(let text of texts) {
                MathLive.renderMathInElement(text);
            }
        }

        activate(tab: AppTab) {
            for(let t of this.tabs) {
                t.activated = false;
            }
            tab.activated = true;
        }
    }
</script>

<style>
    .menuItem .ML__base {
        cursor: inherit;
    }
</style>

<style scoped lang="scss">
.tabs .menu {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: space-evenly;
}

.tabs .menuItem {
    display: inline-block;
    cursor: pointer;
    flex: 1;
    padding: 0.5em 0;
    text-align: center;
    border-bottom: 2px solid #151515;

    &.active {
        border-bottom: 2px solid white;
    }
}
</style>
