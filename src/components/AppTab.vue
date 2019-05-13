<template>
    <div v-if="activated">
        <slot/>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue, Watch} from 'vue-property-decorator';

    @Component({})
    export default class AppTabs extends Vue {
        public activated = false;
        public icon: Vue;
        title = '';
    }
</script>

<style scoped>

</style>
