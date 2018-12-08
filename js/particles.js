'use strict';
class DiffGrid {
    constructor(options){
        this.tick = 0;

        this.requestStop = true;
        this.frozen = false;
        this.recording = false;
        this.setOptions(options);
        this.makeRenderer();
        this.makeGrid();


        this.stage.addChild(this.background);
        this.stage.addChild(this.backgroundText);
        this.stage.addChild(this.sprites);
        this.stage.addChild(this.solutions);
        this.stage.addChild(this.nullclines);

        this.drawBinded = this.draw.bind(this);
    }

    fullscreen(){
        this.options.parentElm.querySelector('canvas').requestFullscreen();
    }

    makeGif(button) {
        console.log(button);
        this.recording = true;
        this.record_button = button;
        this.record_button.textContent = 'Recording...';
        this.record_button.setAttribute("disabled", "disabled");

        this.frame_count = 0;
        this.resetGrid();

        this.gif = new GIF({
            workers: 4,
            workerScript: 'js/gif.worker.js',
            background: '#ffffff'
        });

        this.gif.on('finished', function(blob) {
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = window.URL.createObjectURL(blob);
            a.download = 'my-differential-equation.gif';
            a.click();
            window.URL.revokeObjectURL(a.href);
            a.remove();

            scene.record_button.textContent = 'Download gif';
            scene.record_button.removeAttribute("disabled");
        });
    }

    endGif(){
        this.recording = false;
        this.record_button.textContent = 'Processing...';
        this.gif.render();
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
                maxY: 3,
                gridResX: 1,
                gridResY: 1,
            },
            dot: {
                step: 0.01,
                size: 1.0,
                density: 0.05,
                color: 0x00FF44,
                color_random: true,
                maxAge: 1000,
                normalize: true,
                age_random: true,
                loop_back: true
            },
            path: {
                length: 15,
                precision: 100,
                width: 2,
                color: 0xFF6633,
                color_random: false,
                forwards: true,
                backwards: true,

            },
            nullclines: {
                enableX: false,
                enableY: false,
                colorX: 0x0044FF,
                colorY: 0xEE22FF,
                tolerance: 3
            },
            gif: {
                length: 300,
                skip: 1
            },
            parentElm: document.getElementById('canvas'),
        };
        this.options = Object.assign(defaultOptions, options);

        this.backgroundTextStyle = {
            fill: 0x333333,
            fontSize: 14,
        };
    }

    makeRenderer() {
        this.renderer = PIXI.autoDetectRenderer(800, 600, {transparent: false,
            autoResize: false,
            backgroundColor: 0xffffff});
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

        this.nullclines = new PIXI.Graphics();

        this.updateBackground();
    }

    updateBackground() {
        this.background.clear();
        this.backgroundText.removeChildren();

        let stepX = this.options.screen.gridResX;
        let stepY = this.options.screen.gridResY;

        for(let i = Math.floor(this.options.screen.minX/stepX)*stepX; i <= Math.ceil(this.options.screen.maxX/stepX)*stepX; i+=stepX){
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
                text.y = this.options.screen.height - text.height - 2.;
            }
            this.backgroundText.addChild(text);
            // this.background.text(x,this.options.height/2, ''+i)
        }

        for(let i = Math.floor(this.options.screen.minY/stepY)*stepY; i <= Math.ceil(this.options.screen.maxY/stepY)*stepY; i+=stepY){
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
            this.backgroundText.addChild(text);
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

        const amount = Math.round(((this.options.screen.maxY - this.options.screen.minY- step.y) / step.y) *
            ((this.options.screen.maxX - this.options.screen.minX - step.x) / step.x));

        if (amount > 10000) {
            if(confirm('You are about to spawn more than 10000 arrows.\n Want to reset the arrow density?')){
                localStorage.removeItem('dot.density');
                localStorage.removeItem('screen.minX');
                localStorage.removeItem('screen.minY');
                localStorage.removeItem('screen.maxX');
                localStorage.removeItem('screen.maxY');
                localStorage.removeItem('screen.width');
                localStorage.removeItem('screen.height');
                debugger;
                location.reload();
            }
        }

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
        console.log(amount, this.dots.length);
    }

    start() {
        if(!this.hasOwnProperty('dx') || !this.hasOwnProperty('dy')) {
            Logger.error('Dx or Dy is not set.');
            return;
        }

        if(this.requestStop){
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
            return;
        }

        if(this.frozen){
            this.renderer.render(this.stage);
            requestAnimationFrame(this.drawBinded);
            return;
        }

        this.move();

        this.tick++;
        this.renderer.render(this.stage);
        if(this.recording){
            if(this.frame_count> this.options.gif.length){
                this.endGif();
            }else if(this.frame_count > 0 && this.frame_count % (this.options.gif.skip+1) === 0)
                this.gif.addFrame(scene.renderer.view , {delay:0.03, copy:true});
            this.frame_count += 1;
        }

        requestAnimationFrame(this.drawBinded);
    }

    move(){
        for (let i = 0; i < this.dots.length; i++) {
            const dot = this.dots[i];

            const dx = this.dx(dot.grid.x, dot.grid.y);
            const dy = this.dy(dot.grid.x, dot.grid.y);
            let norm = 1;

            if(this.options.dot.normalize) {
                norm = Math.sqrt(dx**2 + dy**2);
            }

            dot.grid.x += dx * this.options.dot.step / norm;
            dot.grid.y += dy * this.options.dot.step / norm;

            if (this.options.dot.age_random){
                dot.age += math.random(0.5, 1.5);
            } else {
                dot.age += 1;
            }

            let dxScreen = dot.position.x;
            let dyScreen = dot.position.y;
            dot.position.x = this.gridToScreenX(dot.grid.x);
            dot.position.y = this.gridToScreenY(dot.grid.y);
            dxScreen -= dot.position.x;
            dyScreen -= dot.position.y;

            dot.age += 1;

            const isOutside = dot.grid.x > this.options.screen.maxX  || dot.grid.x < this.options.screen.minX ||
                dot.grid.y > this.options.screen.maxY || dot.grid.y < this.options.screen.minY;
            const isOld = this.options.dot.maxAge === 0 ||
                this.options.dot.maxAge >= 0 && Math.random() <= 1/this.options.dot.maxAge;


            dot.rotation = Math.atan2(-dyScreen,-dxScreen);

            if ((isOutside && this.options.dot.loop_back) || isOld){
                this.resetDot(dot);
            }
        }
    }

    resetDot(dot){
        const x = this.options.dot.maxAge === 0 ? dot.start.x : math.random(this.options.screen.minX, this.options.screen.maxX);
        const y = this.options.dot.maxAge === 0 ? dot.start.y : math.random(this.options.screen.minY, this.options.screen.maxY);

        dot.grid.x = x;
        dot.grid.y = y;
        dot.age = 0;
        dot.position.x = this.gridToScreenX(dot.grid.x);
        dot.position.y = this.gridToScreenY(dot.grid.y);
        dot.rotation = Math.atan2(-this.dy(x,y), this.dx(x,y));

    }


    static rescale(val, fromMin, fromMax, toMin, toMax) {
        return (val - fromMin) * (toMax - toMin) / (fromMax - fromMin) + toMin;
    }

    addSolution(x,y) {
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
        this.resetGrid();
    }

    //comment from Jim: not enough comments.
    _drawNullcline(fn, col){
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.options.screen.width;
        canvas.height = this.options.screen.height;
        const data = new Uint8ClampedArray(this.options.screen.height * this.options.screen.width * 4);


        const r = (col & 0xff0000) >> 16;
        const g = (col & 0x00ff00) >> 8;
        const b = (col & 0x0000ff);

        // console.log(r,g,b)

        const dx = (this.options.screen.maxX - this.options.screen.minX) / this.options.screen.width;
        const dy = (this.options.screen.maxY - this.options.screen.minY) / this.options.screen.height;
        const epsilon = Number.EPSILON * this.options.nullclines.tolerance;
        console.log(epsilon)
        const is0 = (x)=> Math.abs(x) <= epsilon;
        let i = 0;
        for(let y = this.options.screen.maxY; y > this.options.screen.minY-dy; y-=dy){
            for(let x = this.options.screen.minX; x < this.options.screen.maxX - dx; x+=dx){
                // debugger;
                let vals = [fn(x,y), fn(x+dx,y), fn(x,y+dy), fn(x+dx,y+dy)];
                let sign = Math.sign(vals[0]);

                if(is0(vals[0]) || is0(vals[1]) || is0(vals[2]) || is0(vals[3]) ||
                    Math.sign(vals[1]) !== sign || Math.sign(vals[2]) !== sign || Math.sign(vals[3]) !== sign){
                    // debugger;
                    data[i] = r;
                    data[i+1] = g;
                    data[i+2] = b;
                    data[i+3] = 255;
                }
                i += 4;
            }
        }

        const imgdata = new ImageData(data, this.options.screen.width, this.options.screen.height);
        ctx.putImageData(imgdata, 0, 0);

        return PIXI.Texture.fromCanvas(canvas);
    }



    drawNullcline() {
        this.nullclines.removeChildren();
        const textureX = this._drawNullcline(this.dx, this.options.nullclines.colorX);
        const textureY = this._drawNullcline(this.dy, this.options.nullclines.colorY);


        this.nullclineX = new PIXI.Sprite(textureX);
        this.nullclineY = new PIXI.Sprite(textureY);
        this.nullclineX.visible = this.options.nullclines.enableX;
        this.nullclineY.visible = this.options.nullclines.enableY;
        this.nullclines.addChild(this.nullclineX);
        this.nullclines.addChild(this.nullclineY);
    }

    resetNullcline() {
        if(this.options.nullclines.enableX || this.options.nullclines.enableY) {
            this.drawNullcline();
        }
    }

    setDxDy(dx, dy) {
        this.dx = dx;
        this.dy = dy;
        this.resetSolutions();

        this.resetNullcline();
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
        this.resetNullcline();
    }

    getRandomColor(hex){
        let [h,s,l] = Color.hexToHsl(hex);
        h += math.random(-0.15,0.15);
        s += math.random(-0.1,0.1);
        l += math.random(-0.2,0.2);

        h = (h+1)%1;
        s = Math.min(1, Math.max(0 , s));
        l = Math.min(1, Math.max(0 , l));

        return Color.hslToHex(h,s,l);
    }

    updateOption(elm) {
        const id = elm.dataset.name;
        const section = elm.dataset.section;
        if(section === 'screen') {
            if (id === 'width' || id === 'height') {
                this.options.screen[id] = parseInt(elm.value);
                this.renderer.resize(this.options.screen.width, this.options.screen.height);
            } else {
                this.options.screen[id] = parseFloat(elm.value);
            }

            this.updateBackground();
            this.resetSolutions();
            this.resetGrid();
            this.resetNullcline();

        } else if(section === 'dot') {
            if(id === 'size' || id === 'step'){
                this.options.dot[id] = parseFloat(elm.value);
            } else if(id === 'maxAge' || id === 'color'){
                this.options.dot[id] = parseInt(elm.value.replace('#', '0x'));
            } else if (id === 'color_random' || id === 'normalize' || id === 'loop_back') {
                this.options.dot[id] = elm.checked;
            }else if (id === 'age_random') {
                this.options.dot[id] = elm.checked;
                if (this.options.dot.maxAge>=0){
                    this.dots.forEach(dot => {
                        dot.age = this.options.dot.maxAge + 1;
                    })
                }
            } else if (id === 'density') {
                this.options.dot[id] = parseFloat(elm.value);
                this.resetGrid();
            } else {
                Logger.error('Unknown id ', id);
            }

            if (id !== 'maxAge') {
                this.dots.forEach(dot => {
                    let col = this.options.dot.color;
                    if (this.options.dot.color_random) col = this.getRandomColor(col);
                    dot.scale.set(this.options.dot.size);
                    dot.tint = col;
                });
            }
        } else if(section === 'path') {
            if (id === 'length' || id === 'color' || id === 'width' || id==='precision') {
                this.options.path[id] = parseInt(elm.value.replace('#', '0x'));
            } else if (id === 'color_random' || id === 'forwards' || id === 'backwards') {
                this.options.path[id] = elm.checked;
            } else {
                Logger.error('Unknown id ', id);
            }
        } else if(section === 'gif'){
            this.options.gif[id] = parseInt(elm.value);
        } else if(section === 'nullclines'){
            if(id === 'colorX' || id === 'colorY'){
                this.options.nullclines[id] = parseInt(elm.value.replace('#', '0x'));
                this.resetNullcline();
            } else if(id === 'enableX' || id === 'enableY') {
                this.options.nullclines[id] = elm.checked;
                if(this.nullclines.children.length === 0){
                    this.resetNullcline();
                }
                if(this.nullclineX !== undefined)
                    this.nullclineX.visible = this.options.nullclines.enableX;
                if(this.nullclineY !== undefined)
                    this.nullclineY.visible = this.options.nullclines.enableY;
            } else if(id === 'tolerance') {
                this.options.nullclines[id] = parseFloat(elm.value);
                this.resetNullcline();
            } else {
                Logger.error('Unknown id ', id);
            }
        }
    }
}
