// import * as opentype from 'opentype.js'

const opentype = require('opentype.js');
async function generate() {
    const font = await opentype.load('fonts/arial.ttf');
    const path = font.getPath('0', 0, 0, 100);
}

function pathLength(path) {
    let start = {x: 0, y: 0};
    let prev = {x: 0, y: 0};

    path.reduce((len, cmd) => {
        let cur_len = 0;
        if(cmd.type === 'M') {
            start.x =  cmd.x;
            start.y = cmd.y;
            cur_len = 0;
        } else if(cmd.type === 'L') {
            cur_len = Math.sqrt((cmd.x-prev.x)**2 + (cmd.x-prev.x)**2);
        } else if(cmd.type === 'C') {
            cur_len = 0;
        } else if(cmd.type === 'Q') {
            cur_len = 0;
        } else if(cmd.type === 'Z') {
            cur_len = 0;
        }

        prev.x = cmd.x;
        prev.y = cmd.y;
        return len + cur_len;
    }, 0)
}


function pathLength(path) {
    let start = {x: 0, y: 0};
    let prev = {x: 0, y: 0};
    const points = [];

    for (const cmd of path) {
        if(cmd.type === 'M') {
            start.x =  cmd.x;
            start.y = cmd.y;
        } else if(cmd.type === 'L') {
        } else if(cmd.type === 'C') {
        } else if(cmd.type === 'Q') {
        } else if(cmd.type === 'Z') {
        }

        prev.x = cmd.x;
        prev.y = cmd.y;
    }
}


opentype.load('fonts/arial.ttf', (err, font) => {
    if (err) {
        console.error('Font could not be loaded:');
        console.error(err);
        return;
    }
    const path = font.getPath('0', 0, 0, 100);

    console.log(path);
});

// generate();
