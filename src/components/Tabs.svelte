<script>
    const tabs = [
      {
        label: 'Equations',
        icon: '=',
        tabElm: null,
      },
    ];

  function openTab(index) {
      console.log(`Clicked ${tabs[index].label}`)
  }
</script>

<style>
  .tabs{

  }
  .nav {
    display: grid;
    grid-template-columns: auto auto auto;
    background-color: #151515;
    padding: .5em 0;
  }
  .navItem {
    display: inline-block;
    text-align: center;
    cursor: pointer;
  }

  .navItemIcon {
    display: inline-block;
  }

  .navItemText {
    display: inline-block;
    transform: scaleX(0);
    transform-origin: left;
    width: 0;
    overflow: hidden;
    transition: transform ease 0.5s,
        width ease 0.5s;
  }
  .navItem:hover .navItemText {
    transform: scaleX(1);
    width: auto;
  }
</style>
<div class="tabs">
  <nav class="nav">
      {#each tabs as tab, i}
        <div class="navItem" on:click={openTab.bind(this, i)}>
          <div class="navItemIcon">{tab.icon}</div>
          <div class="navItemText">{tab.label}</div>
        </div>
      {/each}
    <div class="navItem">
      <div class="navItemIcon">=</div>
      <div class="navItemText">Equations</div>
    </div>
    <div class="navItem">
      <div class="navItemIcon">*</div>
      <div class="navItemText">Settings</div>
    </div>
    <div class="navItem">
      <div class="navItemIcon">@</div>
      <div class="navItemText">File</div>
    </div>
  </nav>
</div>
