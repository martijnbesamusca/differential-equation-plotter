<template>
    <div id="titleBox">
        <h1 id="title" ref="title">$$d \text{ODE} p$$</h1>
        <h2 id="subtitle">A dynamic ODE plotter</h2>
        <h2 id="author">by Martijn Besamusca</h2>
    </div>
</template>

<script>
    import {Component, Vue, Watch} from 'vue-property-decorator';
    import MathLive from 'mathlive';

    @Component()
    export default class AppTitleBar extends Vue {
        mounted() {
            MathLive.renderMathInElement(this.$refs.title);
        }
    };
</script>

<style scoped>
    #titleBox{
        grid-area: title;
        background-color: #111;
        padding: 1em 0;
        color: #fff;
    }

    #title {
        text-align: center;
        margin: 0;
        font-size: 3em;
    }

    #subtitle, #author {
        text-align: center;
        margin: 0;
        font-size: 1.2em;
    }

    #author {
        font-size: 1em;
    }
</style>
