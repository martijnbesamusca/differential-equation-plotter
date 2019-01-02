"use strict";
(function () {
    const canvas = document.getElementById('canvas');
    const parent = canvas.parentElement;
    const resize = () => {
        const hRatio = parent.clientWidth / canvas.width;
        const vRatio = parent.clientHeight / canvas.height;
        const ratio = Math.min(hRatio, vRatio);
        canvas.style.width = canvas.width * ratio + 'px';
        canvas.style.height = canvas.height * ratio + 'px';
    };
    window.addEventListener('resize', resize);
    resize();
})();
