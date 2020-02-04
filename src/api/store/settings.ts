import Store from './store';

const window = new Store({
    min_x: -5,
    max_x: 5,
    min_y: -3,
    max_y: 3,
    perp_lock: true
});

export default {
    window
}
