"use strict";
class DiffGrid {
    constructor(options){
        this.tick = 0;

        this.requestStop = false;
        this.frozen = false;
        this.setOptions(options);
        this.makeRenderer();
        this.makeGrid();

        this.stage.addChild(this.background);
        this.stage.addChild(this.backgroundText);
        this.stage.addChild(this.sprites);
        this.stage.addChild(this.solutions);

        this.drawBinded = this.draw.bind(this);
    }

    gridToScreenX(x){
        return DiffGrid.rescale(x, this.options.screen.minX, this.options.screen.maxX, 0, this.options.screen.width);
    }

    gridToScreenY(y){
        return DiffGrid.rescale(y, this.options.screen.minY, this.options.screen.maxY, this.options.screen.height, 0);
    }

    setOptions(options){
        const defaultOptions = {
            screen: {
                width: 800,
                height: 600,
                minX: -4,
                maxX: 4,
                minY: -3,
                maxY: 3
            },
            dot: {
                step: 0.01,
                size: 1.0,
                density: 0.05,
                color: 0x00FF44,
                color_random: true,
                maxAge: 1000,
                normalize_speed: true
            },
            path: {
                length: 10,
                precision: 100,
                width: 2,
                color: 0xFF6633,
                color_random: false,
                forwards: true,
                backwards: true,
            },
            parentElm: document.getElementById('canvas'),
        };
        this.options = Object.assign(defaultOptions, options);

        this.backgroundTextStyle = {
            fill: 0x333333,
            fontSize: 14,
        }
    }

    makeRenderer() {
        this.renderer = PIXI.autoDetectRenderer(800, 600, {transparent: true, autoResize: false});
        this.stage = new PIXI.Container();
        this.options.parentElm.appendChild(this.renderer.view);

        const numParticles = this.options.screen.width * this.options.screen.height * this.options.dot.density;

        this.sprites = new PIXI.particles.ParticleContainer(numParticles, {
            scale: true,
            position: true,
            rotation: true,
            uvs: false,
            tint: true,
        }, 10, true);

        this.solutions = new PIXI.Graphics();
        // this.solutions.nativeLines = true; // Sad fix
        this.solutions.lineStyle(this.options.path.width, this.solutions.color);

        this.background = new PIXI.Graphics();
        this.backgroundText = new PIXI.Container();

        this.updateBackground();
    }

    updateBackground() {
        this.background.clear();
        this.backgroundText.removeChildren();

        for(let i = this.options.screen.minX; i <= this.options.screen.maxX; i++){
            let x = this.gridToScreenX(i);
            if(i===0) {
                this.background.lineStyle(2, 0x333333);
            } else {
                this.background.lineStyle(1, 0x999999);
            }
            this.background.moveTo(x, 0);
            this.background.lineTo(x, this.options.screen.height);

            const text = new PIXI.Text(i.toString(), this.backgroundTextStyle);
            text.x = x - text.width - 2;
            if(this.options.screen.minY <= 0 && this.options.screen.maxY >= 0) {
                text.y = this.gridToScreenY(0) + 2;
            } else {
                text.y = this.options.screen.height - text.height - 2.
            }
            this.backgroundText.addChild(text)
            // this.background.text(x,this.options.height/2, ''+i)
        }

        for(let i = this.options.screen.minY; i <= this.options.screen.maxY; i++){
            let y = this.gridToScreenY(i);
            if(i===0) {
                this.background.lineStyle(2, 0x333333);
            } else {
                this.background.lineStyle(1, 0x999999);
            }
            this.background.moveTo(0, y);
            this.background.lineTo(this.options.screen.width, y);

            const text = new PIXI.Text(i.toString(), this.backgroundTextStyle);
            if(this.options.screen.minX <= 0 && this.options.screen.maxX >= 0) {
                text.x = this.gridToScreenX(0) - text.width - 2;
            } else {
                text.x = 2;
            }
            text.y = y + 2;
            this.backgroundText.addChild(text)
        }
    }

    resetGrid() {
        this.sprites.removeChildren();
        this.dots = [];
        this.makeGrid();
    }

    makeGrid() {
        this.dots = [];
        const step = {
            x: (this.options.screen.maxX - this.options.screen.minX) / (this.options.screen.width  * this.options.dot.density),
            y: (this.options.screen.maxY - this.options.screen.minY) / (this.options.screen.height * this.options.dot.density)
        };

        for(let y = this.options.screen.minY+step.y; y < this.options.screen.maxY; y += step.y) {
            for (let x = this.options.screen.minX+step.x; x < this.options.screen.maxX; x += step.x) {
                const dot = new PIXI.Sprite.fromImage('sprites/arrow16.png');

                let col = this.options.dot.color;
                if (this.options.dot.color_random) col = this.getRandomColor(col);
                dot.tint = col;
                dot.anchor.set(0.5);
                dot.scale.set(this.options.dot.size);

                // grid
                dot.grid = {
                    x: x,
                    y: y
                };

                dot.start = {x: dot.grid.x, y: dot.grid.y};
                dot.age = 0;
                dot.rotation = 0;

                this.dots.push(dot);
                this.sprites.addChild(dot);
            }
        }
    }

    start() {
        if(!this.hasOwnProperty('dx') || !this.hasOwnProperty('dy')) {
            console.error('Dx or Dy is not set.');
            return;
        }

        if(!this.frozen || this.requestStop){
            this.requestStop = false;
            requestAnimationFrame(this.drawBinded);
        }

        this.frozen = false;

    }

    stop(){
        this.requestStop = true;
    }

    freeze() {
        this.frozen = true;
    }

    draw(){
        if(this.requestStop) {
            return
        }

        if(this.frozen){
            this.renderer.render(this.stage);
            requestAnimationFrame(this.drawBinded)
            return;
        }

        for (let i = 0; i < this.dots.length; i++) {
            const dot = this.dots[i];

            const dx = this.dx(dot.grid.x, dot.grid.y);
            const dy = this.dy(dot.grid.x, dot.grid.y);
            let norm = 1;

            if(this.options.dot.normalize_speed) {
                norm = Math.sqrt(dx**2 + dy**2);
            }

            dot.grid.x += dx * this.options.dot.step / norm;
            dot.grid.y += dy * this.options.dot.step / norm;

            dot.age += 10*Math.random();

            if (dot.grid.x > this.options.screen.maxX  || dot.grid.x < this.options.screen.minX ||
                dot.grid.y > this.options.screen.maxY || dot.grid.y < this.options.screen.minY ||
                (this.options.dot.maxAge >= 0 && dot.age > this.options.dot.maxAge)) {
                dot.grid.x = dot.start.x;
                dot.grid.y = dot.start.y;
                dot.age = 0;
                // dots.pop(i)
            }

            let dxScreen = dot.position.x;
            let dyScreen = dot.position.y;
            dot.position.x = this.gridToScreenX(dot.grid.x);
            dot.position.y = this.gridToScreenY(dot.grid.y);
            dxScreen -= dot.position.x;
            dyScreen -= dot.position.y;

            dot.rotation = Math.atan2(-dyScreen,-dxScreen);
        }

        this.tick++;
        this.renderer.render(this.stage);
        requestAnimationFrame(this.drawBinded);
    }

    static rescale(val, fromMin, fromMax, toMin, toMax) {
        return (val - fromMin) * (toMax - toMin) / (fromMax - fromMin) + toMin;
    }

    addSolution(x,y) {
        // const res = 4;
        // x = Math.round(x*res) / res;
        // y = Math.round(y*res) / res;

        let start = [x,y];

        let directions = [];
        if(this.options.path.forwards) directions.push(1);
        if(this.options.path.backwards) directions.push(-1);

        const maxLength = this.options.path.length / this.options.dot.step;

        let col = this.options.path.color;
        if(this.options.path.color_random) col = this.getRandomColor(col);

        this.solutions.lineStyle(this.options.path.width, col);

        for(let dir of directions){
            [x,y] = start;
            let step = 0;
            let xScreen = this.gridToScreenX(x);
            let yScreen = this.gridToScreenY(y);
            this.solutions.moveTo(xScreen,yScreen);

            while(step < maxLength){
                for(let i = 0; i < this.options.path.precision; i++){
                    const dx = this.dx(x, y);
                    const dy = this.dy(x, y);
                    const norm = Math.sqrt(dx**2 + dy**2);

                    x += dir * this.options.dot.step * dx / (this.options.path.precision * norm);
                    y += dir * this.options.dot.step * dy / (this.options.path.precision * norm);
                }

                xScreen = this.gridToScreenX(x);
                yScreen = this.gridToScreenY(y);

                this.solutions.lineTo(xScreen, yScreen);

                step++;
            }
        }
    }

    resetSolutions(){
        this.solutions.clear();
        this.solutions.lineStyle(this.options.path.width, this.options.path.color);

    }

    setDxDy(dx, dy) {
        this.dx = dx;
        this.dy = dy;
        this.resetSolutions()
    }

    setMatrix(mat){
        this.dx = (x, y) => mat[0][0] * x + mat[0][1] * y;
        this.dy = (x, y) => mat[1][0] * x + mat[1][1] * y;
        this.resetSolutions()
    }

    setPolar(dr, dtheta){
        const toPolar = (x, y) => [Math.sqrt(x**2 + y**2), Math.atan2(y,x)];
        this.dx = (x, y) => {
            let [r, t] = toPolar(x, y);
            const dr_val = dr(r,t);
            const dt_val = dtheta(r,t);
            return Math.cos(t)*dr_val - Math.sin(t)/r * dt_val;
        };
        this.dy = (x, y) =>  {
            let [r, t] = toPolar(x,y);
            const dr_val = dr(r,t);
            const dt_val = dtheta(r,t);
            return Math.sin(t)*dr_val + Math.cos(t)/r * dt_val;
        };
        this.resetSolutions()
    }

    getRandomColor(hex){
        let [h,s,l] = hexToHsl(hex);
        h += math.random(-0.15,0.15);
        s += math.random(-0.1,0.1);
        l += math.random(-0.2,0.2);

        h = (h+1)%1;
        s = Math.min(1, Math.max(0 , s));
        l = Math.min(1, Math.max(0 , l));

        return hslToHex(h,s,l);
    }

    updateOption(elm) {
        let id = elm.dataset.option;

        if(id === 'width' || id === 'height') {
            this.options.screen[id] = parseInt(elm.value);
            this.renderer.resize(this.options.screen.width, this.options.screen.height);
            this.updateBackground();
            this.resetSolutions();
            this.resetGrid();
        } else if(id.startsWith('screen_')) {
            id = id.replace('screen_', '');
            this.options.screen[id] = parseFloat(elm.value);
            this.updateBackground();
            this.resetSolutions();
            this.resetGrid();
        } else if(id === 'density'){
            this.options.screen[id] = parseInt(elm.value);
            this.resetGrid();
        } else if(id.startsWith('dot_')) {
            id = id.replace('dot_', '');

            if(id === 'size' || id === 'step'){
                this.options.dot[id] = parseFloat(elm.value);
            } else if(id === 'maxAge' || id === 'color'){
                this.options.dot[id] = parseInt(elm.value.replace('#', '0x'));
            } else if (id === 'color_random' || id === 'normalize_speed') {
                this.options.dot[id] = elm.checked;
            }else if (id === 'density') {
                this.options.dot[id] = parseFloat(elm.value);
                this.resetGrid();
            } else {
                console.error('Unknown id ', id)
            }

            if (id !== 'maxAge') {
                this.dots.forEach(dot => {
                    let col = this.options.dot.color;
                    if (this.options.dot.color_random) col = this.getRandomColor(col);
                    dot.scale.set(this.options.dot.size);
                    dot.tint = col;
                })
            }
        } else if(id.startsWith('path_')) {
            id = id.replace('path_', '');

            if (id === 'length' || id === 'color' || id === 'width' || id==='precision') {
                this.options.path[id] = parseInt(elm.value.replace('#', '0x'));
            } else if (id === 'color_random' || id === 'forwards' || id === 'backwards') {
                this.options.path[id] = elm.checked;
            } else {
                console.error('Unknown id ', id)
            }
        }
    }
}
