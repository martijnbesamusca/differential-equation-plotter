<template>
    <div class="tabs">
        <ul class="menu">
            <li v-for="(tab, i) in tabs" class="menuItem" :class="{active: tab.activated}">a</li>
        </ul>
        <slot />
    </div>
</template>

<script>
    import {Component, Prop, Vue, Watch} from 'vue-property-decorator';

    @Component({})
    export default class AppTabs extends Vue {
        tabs = [];

        created() {
            this.tabs = this.$children;
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
