var app = (function (NumberFormatter, handle) {
    'use strict';

    NumberFormatter = NumberFormatter && NumberFormatter.hasOwnProperty('default') ? NumberFormatter['default'] : NumberFormatter;

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty) {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return lets;
        }
        return $$scope.dirty;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            $$.fragment && $$.fragment.p($$.ctx, $$.dirty);
            $$.dirty = [-1];
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src\components\Title.svelte generated by Svelte v3.16.4 */

    const file = "src\\components\\Title.svelte";

    function create_fragment(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let h2;
    	let t3;
    	let h3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "DoDeP";
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "a Dynamic ODE Plotter";
    			t3 = space();
    			h3 = element("h3");
    			h3.textContent = "by Martijn Besamusca";
    			attr_dev(h1, "class", "svelte-ntgioo");
    			add_location(h1, file, 21, 4, 313);
    			attr_dev(h2, "class", "svelte-ntgioo");
    			add_location(h2, file, 22, 4, 333);
    			attr_dev(h3, "class", "svelte-ntgioo");
    			add_location(h3, file, 23, 4, 369);
    			attr_dev(div, "class", "title svelte-ntgioo");
    			add_location(div, file, 20, 0, 288);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, h2);
    			append_dev(div, t3);
    			append_dev(div, h3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Title extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\components\Plot.svelte generated by Svelte v3.16.4 */
    const file$1 = "src\\components\\Plot.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let canvas_1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			canvas_1 = element("canvas");
    			attr_dev(canvas_1, "class", "svelte-170a5ye");
    			add_location(canvas_1, file$1, 52, 2, 1365);
    			attr_dev(div, "class", "plot svelte-170a5ye");
    			add_location(div, file$1, 51, 0, 1321);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, canvas_1);
    			/*canvas_1_binding*/ ctx[3](canvas_1);
    			/*div_binding*/ ctx[4](div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*canvas_1_binding*/ ctx[3](null);
    			/*div_binding*/ ctx[4](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function debounce(func, wait, immediate) {
    	var timeout;

    	return function () {
    		var context = this, args = arguments;

    		var later = function () {
    			timeout = null;
    			if (!immediate) func.apply(context, args);
    		};

    		var callNow = immediate && !timeout;
    		clearTimeout(timeout);
    		timeout = setTimeout(later, wait);
    		if (callNow) func.apply(context, args);
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let container;
    	let canvas;

    	let resizeObserver = new ResizeObserver(debounce(
    			entries => {
    				$$invalidate(1, canvas.width = Math.floor(entries[0].contentRect.width), canvas);
    				$$invalidate(1, canvas.height = Math.floor(entries[0].contentRect.height), canvas);
    			},
    			100,
    			false
    		));

    	onMount(async () => {
    		resizeObserver.observe(container);
    	});

    	

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, canvas = $$value);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, container = $$value);
    		});
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("canvas" in $$props) $$invalidate(1, canvas = $$props.canvas);
    		if ("resizeObserver" in $$props) resizeObserver = $$props.resizeObserver;
    	};

    	return [container, canvas, resizeObserver, canvas_1_binding, div_binding];
    }

    class Plot extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Plot",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\components\ControlBar.svelte generated by Svelte v3.16.4 */
    const file$2 = "src\\components\\ControlBar.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let div0;
    	let t4;
    	let div1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = `x: ${/*fmt*/ ctx[2].format(/*x*/ ctx[0])}, y: ${/*fmt*/ ctx[2].format(/*y*/ ctx[1])}`;
    			t4 = space();
    			div1 = element("div");
    			div1.textContent = "> ||";
    			attr_dev(div0, "class", "left svelte-71d4f");
    			add_location(div0, file$2, 20, 2, 380);
    			attr_dev(div1, "class", "right");
    			add_location(div1, file$2, 21, 2, 446);
    			attr_dev(div2, "class", "bar svelte-71d4f");
    			add_location(div2, file$2, 19, 0, 359);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self) {
    	let x = 0;
    	let y = 0;
    	const fmt = new NumberFormatter(5, 5);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    	};

    	return [x, y, fmt];
    }

    class ControlBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ControlBar",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Tabs.svelte generated by Svelte v3.16.4 */

    const file$3 = "src\\components\\Tabs.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (51:6) {#each tabs as tab, i}
    function create_each_block(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*tab*/ ctx[2].icon + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*tab*/ ctx[2].label + "";
    	let t2;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			attr_dev(div0, "class", "navItemIcon svelte-1y0oxou");
    			add_location(div0, file$3, 52, 10, 984);
    			attr_dev(div1, "class", "navItemText svelte-1y0oxou");
    			add_location(div1, file$3, 53, 10, 1037);
    			attr_dev(div2, "class", "navItem svelte-1y0oxou");
    			add_location(div2, file$3, 51, 8, 918);
    			dispose = listen_dev(div2, "click", /*openTab*/ ctx[1].bind(this, /*i*/ ctx[4]), false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(51:6) {#each tabs as tab, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div9;
    	let nav;
    	let t0;
    	let div2;
    	let div0;
    	let t2;
    	let div1;
    	let t4;
    	let div5;
    	let div3;
    	let t6;
    	let div4;
    	let t8;
    	let div8;
    	let div6;
    	let t10;
    	let div7;
    	let each_value = /*tabs*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			nav = element("nav");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "=";
    			t2 = space();
    			div1 = element("div");
    			div1.textContent = "Equations";
    			t4 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div3.textContent = "*";
    			t6 = space();
    			div4 = element("div");
    			div4.textContent = "Settings";
    			t8 = space();
    			div8 = element("div");
    			div6 = element("div");
    			div6.textContent = "@";
    			t10 = space();
    			div7 = element("div");
    			div7.textContent = "File";
    			attr_dev(div0, "class", "navItemIcon svelte-1y0oxou");
    			add_location(div0, file$3, 57, 6, 1145);
    			attr_dev(div1, "class", "navItemText svelte-1y0oxou");
    			add_location(div1, file$3, 58, 6, 1185);
    			attr_dev(div2, "class", "navItem svelte-1y0oxou");
    			add_location(div2, file$3, 56, 4, 1116);
    			attr_dev(div3, "class", "navItemIcon svelte-1y0oxou");
    			add_location(div3, file$3, 61, 6, 1272);
    			attr_dev(div4, "class", "navItemText svelte-1y0oxou");
    			add_location(div4, file$3, 62, 6, 1312);
    			attr_dev(div5, "class", "navItem svelte-1y0oxou");
    			add_location(div5, file$3, 60, 4, 1243);
    			attr_dev(div6, "class", "navItemIcon svelte-1y0oxou");
    			add_location(div6, file$3, 65, 6, 1398);
    			attr_dev(div7, "class", "navItemText svelte-1y0oxou");
    			add_location(div7, file$3, 66, 6, 1438);
    			attr_dev(div8, "class", "navItem svelte-1y0oxou");
    			add_location(div8, file$3, 64, 4, 1369);
    			attr_dev(nav, "class", "nav svelte-1y0oxou");
    			add_location(nav, file$3, 49, 2, 861);
    			attr_dev(div9, "class", "tabs svelte-1y0oxou");
    			add_location(div9, file$3, 48, 0, 839);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, nav);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(nav, null);
    			}

    			append_dev(nav, t0);
    			append_dev(nav, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(nav, t4);
    			append_dev(nav, div5);
    			append_dev(div5, div3);
    			append_dev(div5, t6);
    			append_dev(div5, div4);
    			append_dev(nav, t8);
    			append_dev(nav, div8);
    			append_dev(div8, div6);
    			append_dev(div8, t10);
    			append_dev(div8, div7);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openTab, tabs*/ 3) {
    				each_value = /*tabs*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(nav, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self) {
    	const tabs = [
    		{
    			label: "Equations",
    			icon: "=",
    			tabElm: null
    		}
    	];

    	function openTab(index) {
    		console.log(`Clicked ${tabs[index].label}`);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		
    	};

    	return [tabs, openTab];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\Settings.svelte generated by Svelte v3.16.4 */

    // (10:0) <Tabs>
    function create_default_slot(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(10:0) <Tabs>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current;

    	const tabs = new Tabs({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tabs.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabs, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tabs_changes = {};

    			if (dirty[0] & /*$$scope*/ 1) {
    				tabs_changes.$$scope = { dirty, ctx };
    			}

    			tabs.$set(tabs_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabs, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\splitter\Splitter.svelte generated by Svelte v3.16.4 */
    const file$4 = "src\\components\\splitter\\Splitter.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (81:4) {#each handles as handleObj, i}
    function create_each_block$1(ctx) {
    	let div;
    	let i = /*i*/ ctx[13];
    	let handle_action;
    	const assign_div = () => /*div_binding*/ ctx[9](div, i);
    	const unassign_div = () => /*div_binding*/ ctx[9](null, i);

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "handle svelte-7q1eh4");
    			attr_dev(div, "draggable", "false");
    			add_location(div, file$4, 81, 8, 2484);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			assign_div();
    			handle_action = handle.handle.call(null, div, /*handleObj*/ ctx[11]) || ({});
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (i !== /*i*/ ctx[13]) {
    				unassign_div();
    				i = /*i*/ ctx[13];
    				assign_div();
    			}

    			if (is_function(handle_action.update) && dirty[0] & /*handles*/ 2) handle_action.update.call(null, /*handleObj*/ ctx[11]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			unassign_div();
    			if (handle_action && is_function(handle_action.destroy)) handle_action.destroy();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(81:4) {#each handles as handleObj, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let t;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);
    	let each_value = /*handles*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "splitter svelte-7q1eh4");
    			add_location(div, file$4, 78, 0, 2380);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(div, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			/*div_binding_1*/ ctx[10](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty[0] & /*$$scope*/ 128) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[7], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null));
    			}

    			if (dirty[0] & /*handlesElms, handles*/ 6) {
    				each_value = /*handles*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			destroy_each(each_blocks, detaching);
    			/*div_binding_1*/ ctx[10](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const RES = 1000;

    function instance$3($$self, $$props, $$invalidate) {
    	let splitter;
    	let total_width;
    	let panels = [];
    	let handles = [];
    	let handlesElms = [];
    	let sizes = [];

    	onMount(async () => {
    		const splitter_rect = splitter.getBoundingClientRect();
    		total_width = splitter_rect.width;
    		panels = [...splitter.querySelectorAll(".panel")];
    		const column_count = panels.reduce((acc, val) => acc + Number.parseInt(val.dataset.size), 0);
    		const panel_size = Math.round(RES / column_count);

    		sizes = panels.map(value => {
    			const size = value.dataset.size;

    			if (size === undefined) {
    				console.warn("No size defined, setting size to zero");
    				return 0;
    			}

    			return panel_size * Number.parseInt(size);
    		});

    		writeStyle();

    		splitter.addEventListener("moved", e => {
    			let sum = sizes.reduce(
    				(acc, cur, i) => {
    					return i < e.handle.index ? acc + cur : acc;
    				},
    				0
    			);

    			let sum_right = sum + sizes[e.handle.index] + sizes[e.handle.index + 1];
    			const pos = e.pos / total_width * RES;
    			sizes[e.handle.index] = pos - sum;
    			sizes[e.handle.index + 1] = sum_right - pos;
    			writeStyle();
    		});

    		for (let i = 0; i < panels.length - 1; i++) {
    			$$invalidate(1, handles = [
    				...handles,
    				{
    					index: i,
    					leftPanel: panels[i],
    					rightPanel: panels[i + 1]
    				}
    			]);
    		}
    	});

    	function writeStyle() {
    		$$invalidate(0, splitter.style.gridTemplateColumns = sizes.reduce((acc, val) => `${acc} 1px ${val}fr`, "").substring(5), splitter);
    	}

    	let { $$slots = {}, $$scope } = $$props;

    	function div_binding($$value, i) {
    		if (handlesElms[i] === $$value) return;

    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			handlesElms[i] = $$value;
    			$$invalidate(2, handlesElms);
    		});
    	}

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, splitter = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("splitter" in $$props) $$invalidate(0, splitter = $$props.splitter);
    		if ("total_width" in $$props) total_width = $$props.total_width;
    		if ("panels" in $$props) panels = $$props.panels;
    		if ("handles" in $$props) $$invalidate(1, handles = $$props.handles);
    		if ("handlesElms" in $$props) $$invalidate(2, handlesElms = $$props.handlesElms);
    		if ("sizes" in $$props) sizes = $$props.sizes;
    	};

    	return [
    		splitter,
    		handles,
    		handlesElms,
    		total_width,
    		panels,
    		sizes,
    		writeStyle,
    		$$scope,
    		$$slots,
    		div_binding,
    		div_binding_1
    	];
    }

    class Splitter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Splitter",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\splitter\Panel.svelte generated by Svelte v3.16.4 */

    const file$5 = "src\\components\\splitter\\Panel.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "panel svelte-evvaga");
    			set_style(div, "min-width", /*minWidth*/ ctx[1]);
    			attr_dev(div, "data-size", /*size*/ ctx[0]);
    			add_location(div, file$5, 13, 0, 285);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty[0] & /*$$scope*/ 4) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null));
    			}

    			if (!current || dirty[0] & /*minWidth*/ 2) {
    				set_style(div, "min-width", /*minWidth*/ ctx[1]);
    			}

    			if (!current || dirty[0] & /*size*/ 1) {
    				attr_dev(div, "data-size", /*size*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { size = 1 } = $$props;
    	let { minWidth = "2em" } = $$props;
    	const writable_props = ["size", "minWidth"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Panel> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("minWidth" in $$props) $$invalidate(1, minWidth = $$props.minWidth);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { size, minWidth };
    	};

    	$$self.$inject_state = $$props => {
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("minWidth" in $$props) $$invalidate(1, minWidth = $$props.minWidth);
    	};

    	return [size, minWidth, $$scope, $$slots];
    }

    class Panel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$6, safe_not_equal, { size: 0, minWidth: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Panel",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get size() {
    		throw new Error("<Panel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Panel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minWidth() {
    		throw new Error("<Panel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minWidth(value) {
    		throw new Error("<Panel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\App.svelte generated by Svelte v3.16.4 */
    const file$6 = "src\\components\\App.svelte";

    // (24:4) <Panel minWidth="20em" size=7>
    function create_default_slot_2(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let current;
    	const plot = new Plot({ $$inline: true });
    	const controlbar = new ControlBar({ $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(plot.$$.fragment);
    			t = space();
    			div1 = element("div");
    			create_component(controlbar.$$.fragment);
    			attr_dev(div0, "class", "plotContainer svelte-1tpqk9o");
    			add_location(div0, file$6, 24, 8, 574);
    			attr_dev(div1, "class", "barContainer svelte-1tpqk9o");
    			add_location(div1, file$6, 27, 8, 649);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(plot, div0, null);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(controlbar, div1, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(plot.$$.fragment, local);
    			transition_in(controlbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(plot.$$.fragment, local);
    			transition_out(controlbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(plot);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			destroy_component(controlbar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(24:4) <Panel minWidth=\\\"20em\\\" size=7>",
    		ctx
    	});

    	return block;
    }

    // (32:4) <Panel minWidth="15em" size=2>
    function create_default_slot_1(ctx) {
    	let t;
    	let current;
    	const title = new Title({ $$inline: true });
    	const settings = new Settings({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(title.$$.fragment);
    			t = space();
    			create_component(settings.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(title, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(settings, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			transition_in(settings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			transition_out(settings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(title, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(settings, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(32:4) <Panel minWidth=\\\"15em\\\" size=2>",
    		ctx
    	});

    	return block;
    }

    // (23:2) <Splitter>
    function create_default_slot$1(ctx) {
    	let t;
    	let current;

    	const panel0 = new Panel({
    			props: {
    				minWidth: "20em",
    				size: "7",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const panel1 = new Panel({
    			props: {
    				minWidth: "15em",
    				size: "2",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(panel0.$$.fragment);
    			t = space();
    			create_component(panel1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(panel0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(panel1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const panel0_changes = {};

    			if (dirty[0] & /*$$scope*/ 1) {
    				panel0_changes.$$scope = { dirty, ctx };
    			}

    			panel0.$set(panel0_changes);
    			const panel1_changes = {};

    			if (dirty[0] & /*$$scope*/ 1) {
    				panel1_changes.$$scope = { dirty, ctx };
    			}

    			panel1.$set(panel1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(panel0.$$.fragment, local);
    			transition_in(panel1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(panel0.$$.fragment, local);
    			transition_out(panel1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(panel0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(panel1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(23:2) <Splitter>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let current;

    	const splitter = new Splitter({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(splitter.$$.fragment);
    			attr_dev(div, "class", "main svelte-1tpqk9o");
    			add_location(div, file$6, 21, 0, 496);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(splitter, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const splitter_changes = {};

    			if (dirty[0] & /*$$scope*/ 1) {
    				splitter_changes.$$scope = { dirty, ctx };
    			}

    			splitter.$set(splitter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(splitter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(splitter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(splitter);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

}(NumberFormatter, handle));
//# sourceMappingURL=bundle.js.map
