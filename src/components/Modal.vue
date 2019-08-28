<template>
  <div class="background" v-show="opened" @click.self="close">
    <div class="modal">
      <div class="header">
        <slot name="title"></slot>
      </div>
      <div class="body">
        <slot name="body"></slot>
      </div>
      <div class="footer">
        <slot name="footer" class="footer">
          <button @click="close">Close</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import AppInputGroup from "./input/AppInputGroup.vue";
import AppInputPanel from "@/components/input/AppInputPanel.vue";
import AppInput from "@/components/input/AppInput.vue";

@Component({
  components: {}
})
export default class Modal extends Vue {
  private opened = false;
  public toggle() {
    this.opened = !this.opened;
  }
  public open() {
    this.opened = true;
  }
  public close() {
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
  padding: 1em;
}

.body {
  margin-top: 1.5em;
  padding: 0 2em;
  line-height: 2em;
}

.header {
  background-color: #222;
  padding: 0 1em;
  box-shadow: 0 4px 2px -2px rgba(#000, 0.5);
}

.footer {
  margin-top: 1em;
  padding: 1em;
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
  box-shadow: 0.1em 0.1em 1em 0.1em #000;
  flex-direction: column;
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

  &.column3 {
    grid-template-columns: auto auto auto;
  }
  .grid-start {
    grid-column-start: 1;
  }
}
</style>
