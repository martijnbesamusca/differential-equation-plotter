self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/mathjs/5.2.3/math.min.js');

const cmds = {
    'nullcline': nullcline,
    'solution': solution,
    'settings': set_settings
};

const settings = {
    width: 800,
    height: 600,
    minX: -4,
    maxX: 4,
    minY: -3,
    maxY: 3,
    dx: (x,y) => 0,
    dy: (x,y) => 0,
};


onmessage = function(e) {
    const cmd = e.data.cmd;
    console.log(cmd)
    let result = cmds[cmd](e.data);
    postMessage({cmd:cmd, result: result, id: e.data.id});
};

function nullcline(data) {
    const dx = _nullcline(data, 'dx', data.colors[0]);
    const dy = _nullcline(data, 'dy', data.colors[1]);
    return {dx: dx, dy:dy}
}

function _nullcline(data, name, color) {
    console.trace('nullcline');
    const width = settings.width;
    const height = settings.height;
    const maxX = settings.maxX;
    const minX = settings.minX;
    const maxY = settings.maxY;
    const minY = settings.minY;

    const r = (color & 0xff0000) >> 16;
    const g = (color & 0x00ff00) >> 8;
    const b = (color & 0x0000ff);

    const imgArr = new Uint8ClampedArray(height * width * 4);

    const pixel_dx = (maxX - minX) / width;
    const pixel_dy = (maxY - minY) / height;

    const is0 = (x)=> Math.abs(x) <= data.epsilon;
    const fn = settings[name];
    let i = 0;

    for(let py = 0; py < height; py++){
        let y = this.screenToGridY(py);
        for(let px = 0; px < width; px++){
            let x = this.screenToGridX(px);
            let vals = [fn(x,y), fn(x+pixel_dx,y), fn(x,y+pixel_dy), fn(x+pixel_dx,y+pixel_dy)];
            let sign = Math.sign(vals[0]);

            if(is0(vals[0]) || is0(vals[1]) || is0(vals[2]) || is0(vals[3]) ||
                Math.sign(vals[1]) !== sign || Math.sign(vals[2]) !== sign || Math.sign(vals[3]) !== sign){
                // debugger;
                imgArr[i] = r;
                imgArr[i+1] = g;
                imgArr[i+2] = b;
                imgArr[i+3] = 255;
            }
            i += 4;
        }
    }

    return new ImageData(imgArr, width, height);
}

function solution(data) {
    const start = data.start;
    const directions = [];
    const forwards = data.forwards;
    const backwards = data.backwards;
    const maxLength = data.maxLength;
    const precision = data.precision;
    const stepSize = data.step;

    if(forwards) directions.push(1);
    if(backwards) directions.push(-1);

    const polygons = [];

    for(let dir of directions){
        const polygon = [];

        let [x,y] = start;
        let step = 0;
        let xScreen = gridToScreenX(x);
        let yScreen = gridToScreenY(y);
        polygon.push(xScreen,yScreen);

        while(step < maxLength){
            for(let i = 0; i < precision; i++){
                const dx = settings.dx(x, y);
                const dy = settings.dy(x, y);
                const norm = Math.sqrt(dx**2 + dy**2);

                x += dir * stepSize * dx / (precision * norm);
                y += dir * stepSize * dy / (precision * norm);
            }

            xScreen = gridToScreenX(x);
            yScreen = gridToScreenY(y);

            polygon.push(xScreen,yScreen);

            step++;
        }

        polygons[polygons.length] = polygon;
    }

    console.log(polygons);
    return polygons;
}

function rescale(val, fromMin, fromMax, toMin, toMax) {
    return (val - fromMin) * (toMax - toMin) / (fromMax - fromMin) + toMin;
}

function screenToGridX(x){
    return  rescale(x, 0, settings.width, settings.minX, settings.maxX);
}

function screenToGridY(y){
    return rescale(y, settings.height, 0, settings.minY, settings.maxY);
}

function gridToScreenX(x){
    return rescale(x, settings.minX, settings.maxX, 0, settings.width);
}

function gridToScreenY(y){
    return rescale(y, settings.minY, settings.maxY, settings.height, 0);
}

function set_settings(data) {
    const key = data.key;
    const val = data.value;

    console.log(key, val);

    if(key === 'dxdy') {
        const dx = math.compile(val.x);
        const dy = math.compile(val.y);
        settings.dx = (x,y) => dx.eval({x:x, y:y});
        settings.dy = (x,y) => dy.eval({x:x, y:y});
    } else if(key === 'drdt'){
        const dr = math.compile(val.r);
        const dt = math.compile(val.t);
        console.log(val.r, val.t);

        settings.dx = (x, y) => {
            let [r, t] = [Math.sqrt(x**2 + y**2), Math.atan2(y,x)];
            const dr_val = dr.eval({r:r, θ:t, t:t});
            const dt_val = dt.eval({r:r, θ:t, t:t});
            return Math.cos(t)*dr_val - Math.sin(t)/r * dt_val;
        };

        settings.dy = (x, y) =>  {
            let [r, t] = [Math.sqrt(x**2 + y**2), Math.atan2(y,x)];
            const dr_val = dr.eval({r:r, θ:t, t:t});
            const dt_val = dt.eval({r:r, θ:t, t:t});
            return Math.sin(t)*dr_val + Math.cos(t)/r * dt_val;
        };
    }else {
        settings[key] = val;
    }
}
