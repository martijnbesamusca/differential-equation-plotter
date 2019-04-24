<template>
    <div class="panel" v-bind:class="{ active: isActive }">
        <h2 @click="isActive = !isActive">{{ title }}</h2>
        <div class="collapsible" ref="collapse">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";
    @Component()
    export default class AppInputPanel extends Vue{
        @Prop(String) title:string;
        isActive = true;
    }
</script>

<style scoped>
    .panel h2{
        cursor: pointer;
    }
    .panel label {
        display: block;
    }
    
    .collapsible {
        height: 0;
        overflow: hidden;
    }
    .active .collapsible {
        height: auto;
    }
</style>
