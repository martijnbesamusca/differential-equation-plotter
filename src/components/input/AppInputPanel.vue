<template>
    <div class="panel" v-bind:class="{ active: isActive }">
        <h2 @click="isActive = !isActive"><span id="triangle">▼</span>{{ title | capitalize }}</h2>
        <div class="collapsible" ref="collapse">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";
    @Component({
        filters: {
            capitalize(value: string) {
                if (!value) return '';
                value = value.toString();
                return value.charAt(0).toUpperCase() + value.slice(1);
            }
        }
    })
    export default class AppInputPanel extends Vue{
        @Prop(String) title:string;
        isActive = true;


    }
</script>

<style scoped>
    .panel h2{
        cursor: pointer;
        padding: 0.5em 1em;
        margin: 0;
    }
    .panel label {
        display: block;
    }

    #triangle {
        display: inline-block;
        transform: rotate(-90deg);
        transition: transform 200ms;
        margin-right: 0.25em;
    }
    .active #triangle {
        transform: rotate(0deg);
    }

    .collapsible {
        display: grid;
        grid-template-columns: auto auto;
        grid-row-gap: 0.1em;
        padding: 0 2em;
        background-color: #222;
        height: 0;
        overflow: hidden;
        transition: padding 200ms;
        box-shadow:
                inset 0px 11px 8px -10px rgba(0, 0, 0, 0.5),
                inset 0px -11px 8px -10px rgba(0, 0, 0, 0.5);
    }
    .active .collapsible {
        height: auto;
        padding: 1em 2em;
    }
</style>
