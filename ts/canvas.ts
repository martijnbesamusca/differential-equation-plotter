(function () {
    const canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('canvas');
    const parent : HTMLElement = canvas.parentElement!;
    const resize = ()=>{
        const hRatio : number = parent.clientWidth / canvas.width;
        const vRatio : number = parent.clientHeight / canvas.height;
        const ratio : number = Math.min(hRatio, vRatio);

        canvas.style.width = canvas.width * ratio + 'px';
        canvas.style.height = canvas.height * ratio + 'px';
    };

    window.addEventListener('resize', resize);
    resize();
})();