
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var DoDeP = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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

    /* src\components\Title.svelte generated by Svelte v3.16.4 */

    function create_fragment(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");

    			div.innerHTML = `<h1 class="svelte-ntgioo">DoDeP</h1> 
    <h2 class="svelte-ntgioo">a Dynamic ODE Plotter</h2> 
    <h3 class="svelte-ntgioo">by Martijn Besamusca</h3>`;

    			attr(div, "class", "title svelte-ntgioo");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    class Title extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment, safe_not_equal, {});
    	}
    }

    /* src\components\Plot.svelte generated by Svelte v3.16.4 */

    function create_fragment$1(ctx) {
    	let div;
    	let canvas_1;

    	return {
    		c() {
    			div = element("div");
    			canvas_1 = element("canvas");
    			attr(canvas_1, "class", "svelte-170a5ye");
    			attr(div, "class", "plot svelte-170a5ye");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, canvas_1);
    			/*canvas_1_binding*/ ctx[3](canvas_1);
    			/*div_binding*/ ctx[4](div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			/*canvas_1_binding*/ ctx[3](null);
    			/*div_binding*/ ctx[4](null);
    		}
    	};
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

    	let resizeObserver = new ResizeObserver(debounce(entries => {
    			$$invalidate(1, canvas.width = Math.floor(entries[0].contentRect.width), canvas);
    			$$invalidate(1, canvas.height = Math.floor(entries[0].contentRect.height), canvas);
    		}),
    	1000);

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

    	return [container, canvas, resizeObserver, canvas_1_binding, div_binding];
    }

    class Plot extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment$1, safe_not_equal, {});
    	}
    }

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var numberFormatter = createCommonjsModule(function (module, exports) {
    exports.__esModule = true;
    var NumberFormat = Intl.NumberFormat;
    var NumberFormatter = /** @class */ (function () {
        function NumberFormatter(minSize, maxSize) {
            this.maxSize = maxSize;
            this.minNumber = Math.max(-(Math.pow(10, maxSize)), Number.MIN_SAFE_INTEGER);
            this.maxNumber = Math.min(Math.pow(10, (maxSize + 1)), Number.MAX_SAFE_INTEGER);
            this.normalFmt = new NumberFormat('us', {
                minimumSignificantDigits: minSize
            });
            this.exponentFmt = new NumberFormat('us', {
                // style: '',
                minimumSignificantDigits: minSize,
                maximumSignificantDigits: maxSize
            });
        }
        NumberFormatter.prototype.format = function (num) {
            // Calculate normal size
            if (num > this.minNumber && num < this.maxNumber) {
                return this.normalFmt.format(num);
            }
            return this.exponentFmt.format(num);
        };
        return NumberFormatter;
    }());
    exports["default"] = NumberFormatter;
    });

    var NumberFormatter = unwrapExports(numberFormatter);

    /* src\components\ControlBar.svelte generated by Svelte v3.16.4 */

    function create_fragment$2(ctx) {
    	let div2;
    	let div0;
    	let t4;
    	let div1;

    	return {
    		c() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = `x: ${/*fmt*/ ctx[0].format(x)}, y: ${/*fmt*/ ctx[0].format(y)}`;
    			t4 = space();
    			div1 = element("div");
    			div1.textContent = "> ||";
    			attr(div0, "class", "left svelte-71d4f");
    			attr(div1, "class", "right");
    			attr(div2, "class", "bar svelte-71d4f");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div2, t4);
    			append(div2, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div2);
    		}
    	};
    }

    let x = 0;
    let y = 0;

    function instance$1($$self) {
    	const fmt = new NumberFormatter(5, 5);
    	return [fmt];
    }

    class ControlBar extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, {});
    	}
    }

    /* src\components\Tabs.svelte generated by Svelte v3.16.4 */

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

    	return {
    		c() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			attr(div0, "class", "navItemIcon svelte-1y0oxou");
    			attr(div1, "class", "navItemText svelte-1y0oxou");
    			attr(div2, "class", "navItem svelte-1y0oxou");
    			dispose = listen(div2, "click", /*openTab*/ ctx[1].bind(this, /*i*/ ctx[4]));
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, t0);
    			append(div2, t1);
    			append(div2, div1);
    			append(div1, t2);
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			dispose();
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	let div9;
    	let nav;
    	let t0;
    	let div2;
    	let t4;
    	let div5;
    	let t8;
    	let div8;
    	let each_value = /*tabs*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div9 = element("div");
    			nav = element("nav");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div2 = element("div");

    			div2.innerHTML = `<div class="navItemIcon svelte-1y0oxou">=</div> 
      <div class="navItemText svelte-1y0oxou">Equations</div>`;

    			t4 = space();
    			div5 = element("div");

    			div5.innerHTML = `<div class="navItemIcon svelte-1y0oxou">*</div> 
      <div class="navItemText svelte-1y0oxou">Settings</div>`;

    			t8 = space();
    			div8 = element("div");

    			div8.innerHTML = `<div class="navItemIcon svelte-1y0oxou">@</div> 
      <div class="navItemText svelte-1y0oxou">File</div>`;

    			attr(div2, "class", "navItem svelte-1y0oxou");
    			attr(div5, "class", "navItem svelte-1y0oxou");
    			attr(div8, "class", "navItem svelte-1y0oxou");
    			attr(nav, "class", "nav svelte-1y0oxou");
    			attr(div9, "class", "tabs svelte-1y0oxou");
    		},
    		m(target, anchor) {
    			insert(target, div9, anchor);
    			append(div9, nav);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(nav, null);
    			}

    			append(nav, t0);
    			append(nav, div2);
    			append(nav, t4);
    			append(nav, div5);
    			append(nav, t8);
    			append(nav, div8);
    		},
    		p(ctx, dirty) {
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
    		d(detaching) {
    			if (detaching) detach(div9);
    			destroy_each(each_blocks, detaching);
    		}
    	};
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

    	return [tabs, openTab];
    }

    class Tabs extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, {});
    	}
    }

    /* src\components\Settings.svelte generated by Svelte v3.16.4 */

    function create_default_slot(ctx) {
    	return { c: noop, m: noop, d: noop };
    }

    function create_fragment$4(ctx) {
    	let current;

    	const tabs = new Tabs({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(tabs.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(tabs, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const tabs_changes = {};

    			if (dirty[0] & /*$$scope*/ 1) {
    				tabs_changes.$$scope = { dirty, ctx };
    			}

    			tabs.$set(tabs_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(tabs.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(tabs, detaching);
    		}
    	};
    }

    class Settings extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment$4, safe_not_equal, {});
    	}
    }

    var handle_1 = createCommonjsModule(function (module, exports) {
    exports.__esModule = true;
    var updateEvent = new Event('moved');
    var eventOptions = {
        passive: true
    };
    function handle(node, _a) {
        var index = _a.index, leftPanel = _a.leftPanel, rightPanel = _a.rightPanel;
        var rectLeft = leftPanel.getBoundingClientRect();
        var rectRight = rightPanel.getBoundingClientRect();
        node.style.left = rectLeft.right + 'px';
        leftPanel.style.gridColumnStart = index * 2 + 1 + '';
        node.style.gridColumnStart = index * 2 + 2 + '';
        rightPanel.style.gridColumnStart = index * 2 + 3 + '';
        node.addEventListener('pointerdown', function (event) {
            event.preventDefault();
            window.addEventListener('pointermove', moveListener, eventOptions);
            window.addEventListener('pointerup', upListener);
        });
        function moveListener(event) {
            // const pos = Math.min(Math.max(rectLeft.left, event.x), rectRight.right);
            var pos = event.x;
            rectLeft = leftPanel.getBoundingClientRect();
            rectRight = rightPanel.getBoundingClientRect();
            if (pos >= rectRight.right || pos <= rectLeft.left) {
                return false;
            }
            updateEvent.pos = pos;
            updateEvent.handle = { index: index, leftPanel: leftPanel, rightPanel: rightPanel };
            node.parentNode.dispatchEvent(updateEvent);
        }
        function upListener(event) {
            event.preventDefault();
            window.removeEventListener('pointermove', moveListener);
            window.removeEventListener('pointerup', upListener);
        }
    }
    exports.handle = handle;
    });

    unwrapExports(handle_1);
    var handle_2 = handle_1.handle;

    /* src\components\splitter\Splitter.svelte generated by Svelte v3.16.4 */

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

    	return {
    		c() {
    			div = element("div");
    			attr(div, "class", "handle svelte-7q1eh4");
    			attr(div, "draggable", "false");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			assign_div();
    			handle_action = handle_2.call(null, div, /*handleObj*/ ctx[11]) || ({});
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (i !== /*i*/ ctx[13]) {
    				unassign_div();
    				i = /*i*/ ctx[13];
    				assign_div();
    			}

    			if (is_function(handle_action.update) && dirty[0] & /*handles*/ 2) handle_action.update.call(null, /*handleObj*/ ctx[11]);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			unassign_div();
    			if (handle_action && is_function(handle_action.destroy)) handle_action.destroy();
    		}
    	};
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

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", "splitter svelte-7q1eh4");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append(div, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			/*div_binding_1*/ ctx[10](div);
    			current = true;
    		},
    		p(ctx, dirty) {
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
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    			destroy_each(each_blocks, detaching);
    			/*div_binding_1*/ ctx[10](null);
    		}
    	};
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

    class Splitter extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$5, safe_not_equal, {});
    	}
    }

    /* src\components\splitter\Panel.svelte generated by Svelte v3.16.4 */

    function create_fragment$6(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr(div, "class", "panel svelte-evvaga");
    			set_style(div, "min-width", /*minWidth*/ ctx[1]);
    			attr(div, "data-size", /*size*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty[0] & /*$$scope*/ 4) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null));
    			}

    			if (!current || dirty[0] & /*minWidth*/ 2) {
    				set_style(div, "min-width", /*minWidth*/ ctx[1]);
    			}

    			if (!current || dirty[0] & /*size*/ 1) {
    				attr(div, "data-size", /*size*/ ctx[0]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { size = 1 } = $$props;
    	let { minWidth = "2em" } = $$props;
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("minWidth" in $$props) $$invalidate(1, minWidth = $$props.minWidth);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	return [size, minWidth, $$scope, $$slots];
    }

    class Panel extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$4, create_fragment$6, safe_not_equal, { size: 0, minWidth: 1 });
    	}
    }

    /* src\components\App.svelte generated by Svelte v3.16.4 */

    function create_default_slot_2(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let current;
    	const plot = new Plot({});
    	const controlbar = new ControlBar({});

    	return {
    		c() {
    			div0 = element("div");
    			create_component(plot.$$.fragment);
    			t = space();
    			div1 = element("div");
    			create_component(controlbar.$$.fragment);
    			attr(div0, "class", "plotContainer svelte-1tpqk9o");
    			attr(div1, "class", "barContainer svelte-1tpqk9o");
    		},
    		m(target, anchor) {
    			insert(target, div0, anchor);
    			mount_component(plot, div0, null);
    			insert(target, t, anchor);
    			insert(target, div1, anchor);
    			mount_component(controlbar, div1, null);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(plot.$$.fragment, local);
    			transition_in(controlbar.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(plot.$$.fragment, local);
    			transition_out(controlbar.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div0);
    			destroy_component(plot);
    			if (detaching) detach(t);
    			if (detaching) detach(div1);
    			destroy_component(controlbar);
    		}
    	};
    }

    // (32:4) <Panel minWidth="15em" size=2>
    function create_default_slot_1(ctx) {
    	let t;
    	let current;
    	const title = new Title({});
    	const settings = new Settings({});

    	return {
    		c() {
    			create_component(title.$$.fragment);
    			t = space();
    			create_component(settings.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(title, target, anchor);
    			insert(target, t, anchor);
    			mount_component(settings, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			transition_in(settings.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(title.$$.fragment, local);
    			transition_out(settings.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(title, detaching);
    			if (detaching) detach(t);
    			destroy_component(settings, detaching);
    		}
    	};
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
    			}
    		});

    	const panel1 = new Panel({
    			props: {
    				minWidth: "15em",
    				size: "2",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(panel0.$$.fragment);
    			t = space();
    			create_component(panel1.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(panel0, target, anchor);
    			insert(target, t, anchor);
    			mount_component(panel1, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
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
    		i(local) {
    			if (current) return;
    			transition_in(panel0.$$.fragment, local);
    			transition_in(panel1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(panel0.$$.fragment, local);
    			transition_out(panel1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(panel0, detaching);
    			if (detaching) detach(t);
    			destroy_component(panel1, detaching);
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	let div;
    	let current;

    	const splitter = new Splitter({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			create_component(splitter.$$.fragment);
    			attr(div, "class", "main svelte-1tpqk9o");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(splitter, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const splitter_changes = {};

    			if (dirty[0] & /*$$scope*/ 1) {
    				splitter_changes.$$scope = { dirty, ctx };
    			}

    			splitter.$set(splitter_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(splitter.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(splitter.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(splitter);
    		}
    	};
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment$7, safe_not_equal, {});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'Hello'
        }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
