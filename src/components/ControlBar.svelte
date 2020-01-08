<script lang="typescript">
  import NumberFormatter from "../../api/ui/numberFormatter";

  let x = 0;
  let y = 0;
  const fmt = new NumberFormatter(5, 5)
</script>

<style>
    .bar {
      background-color: #333333;
      height: 1em;
      padding: 0 .5em;
      display: grid;
      grid-template-columns: 1fr auto;
    }
    .left{

    }
</style>

<div class="bar">
  <div class="left">x: {fmt.format(x)}, y: {fmt.format(y)}</div>
  <div class="right">&gt; ||</div>
</div>
