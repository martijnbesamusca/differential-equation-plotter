<template>
    <div class="background" v-show="opened" @click.self="close">
        <div class="modal">
            <slot name="title"></slot>
            <slot name="body"></slot>
            <slot name="footer" class="footer">
                <button @click="close">Close</button>
            </slot>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from "vue-property-decorator";
    import AppInputGroup from "./input/AppInputGroup.vue";
    import AppInputPanel from "@/components/input/AppInputPanel.vue";
    import AppInput from "@/components/input/AppInput.vue";

    @Component({
        components: {
        }
    })
    export default class Modal extends Vue {
        private opened = false;
        toggle () {
            this.opened = !this.opened;
        }
        open () {
            this.opened = true;
        }
        close () {
            this.opened = false;
        }
    }
</script>

<style scoped lang="scss">
    @import "../style/variables.scss";
    @import "../style/mixins.scss";
    .background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(#111, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }

    .footer {
        margin-top: 1em;
        display: flex;
        button {
            margin-left: 1em;
            &:first-child {
                margin-left: 0;
            }
        }
    }

    .modal {
        background: #333;
        /*color: #111;*/
        filter: unset;
        border-radius: 0.5em;
        box-shadow: 0.1em 0.1em 1em 0.1em;
        flex-direction: column;
        padding: 1em;
        display: flex;

        button {
            @extend %button;
        }

        input {
            @extend %input;
            width: 100%;
            border-right-width: unset;
        }
    }

    .input-grid {
        display: grid;
        grid-template-columns: auto auto;
        grid-gap: 0.5em 1em;
    }

</style>
