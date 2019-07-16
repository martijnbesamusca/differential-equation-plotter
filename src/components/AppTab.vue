<template>
    <div class="tab" v-show="activated" :class="{activated: activated}">
        <slot/>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue, Watch} from 'vue-property-decorator';

    @Component({})
    export default class AppTab extends Vue {
        public activated = false;
        @Prop(String) public icon: string;
        @Prop(String) public text: string;
        @Prop(String) public title: string;
    }
</script>

<style scoped lang="scss">
    .tab {
        height: 100%;
        overflow-y: auto;
    }
</style>
