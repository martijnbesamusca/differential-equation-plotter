import Store from './store';

const state = {
    mouse_x: 0,
    mouse_y: 0,

    canvas_width: 0,
    canvas_height: 0,

    paused: false,
};

export default new Store(state);
