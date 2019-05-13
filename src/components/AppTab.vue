<template>
    <div>
        <slot/>
    </div>
</template>

<script>
    import {Component, Prop, Vue, Watch} from 'vue-property-decorator';

    @Component({})
    export default class AppTabs extends Vue {
        activated = false;
        icon = '';
    }
</script>

<style scoped>

</style>
