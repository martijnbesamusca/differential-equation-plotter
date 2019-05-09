<template>
    <label class="groupLabel">
        <span class="groupTitle">{{ title }}</span>
        <slot ref="slot"></slot>
    </label>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator';

@Component()
export default class AppInputGroup extends Vue {
    @Prop(String) public title: string;
}
</script>

<style scoped lang="scss">
    @import "../../style/variables.scss";
    @import "../../style/mixins.scss";

    .groupLabel {
        grid-column: 1 / 3;
        display: grid !important;
        grid-template-columns: max-content max-content 1fr;
        grid-column-gap: 0.5em;
        margin-bottom: 0.5em;

        .groupTitle {
            grid-column: 1;
            text-align: right;
        }

        label {
            grid-column: 2;
        }

        .inputWrapper {
            grid-column: 3;
            input {
                border-radius: 0 !important;
            }

            button {
                border-radius: 0 !important;
            }

            &:first-of-type {
                input {
                    border-radius: $input-radius 0 0 0 !important;
                }

                button {
                    border-radius: 0 $input-radius 0 0 !important;
                }
            }
            &:last-of-type {
                input {
                    border-radius: 0 0 0 $input-radius !important;
                }

                button {
                    border-radius: 0 0 $input-radius 0 !important;
                }
            }
        }

        input {
            border-radius: 0 !important;
            margin: 0 !important;
        }

        button {
            @extend %resetbutton;
        }
    }
</style>
