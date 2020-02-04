(function () {
    'use strict';

    class CustomElement extends HTMLElement {
        constructor() {
            super();
            this.refs = {};
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(this.render());
            this.defineRef();
        }
        connectedCallback() {
            this.dispatchEvent(connectedEvent);
        }
        defineRef() {
            const bound = this.shadowRoot.querySelectorAll('[ref]');
            bound.forEach(elm => {
                const name = elm.getAttribute('ref');
                if (!name)
                    return;
                elm.removeAttribute('ref');
                this.refs[name] = elm;
            });
        }
    }
    const connectedEvent = new Event('connected');
    function html(strings, ...expr) {
        let string = strings.reduce((acc, val) => acc + expr.shift() + (val || ''));
        const container = document.createElement('template');
        container.innerHTML = string;
        return container.content;
    }

    class Store {
        constructor(target) {
            this.initial = Object.assign({}, target);
            this.vals = Object.assign({}, target);
            this.binds = {};
            this.subscribers = {};
            for (const key of Object.keys(target)) {
                this.subscribers[key] = [];
            }
        }
        bindTo(key, elm) {
            this.binds[key] = elm;
            elm.addEventListener('change', () => {
                let val = elm.value;
                if (elm.type === 'number') {
                    val = Number.parseFloat(val);
                }
                else if (elm.type === 'checkbox') {
                    val = elm.checked;
                }
                this._set(key, val);
            });
            this.set(key, this.get(key));
        }
        // unbind(key: keyof State) {
        //     this.binds[key] = undefined;
        // }
        set(key, val) {
            if (this.binds[key]) {
                this.binds[key].value = val;
            }
            else {
                this._set(key, val);
            }
        }
        _set(key, val) {
            this.vals[key] = val;
            for (const cb of this.subscribers[key]) {
                cb(val);
            }
        }
        get(key) {
            return this.vals[key];
        }
        subscribe(key, callback) {
            this.subscribers[key].push(callback);
        }
    }

    const state = {
        mouse_x: 0,
        mouse_y: 0,
        canvas_width: 0,
        canvas_height: 0,
        paused: false,
    };
    var state$1 = new Store(state);

    const window = new Store({
        min_x: -5,
        max_x: 5,
        min_y: -3,
        max_y: 3,
        perp_lock: true
    });
    var settings = {
        window
    };

    const vert_line_length = 12;
    function vert_line(vertices, startX, endX, width, index_offset = 0) {
        // Triangle 1
        vertices[index_offset] = startX + width / 2;
        vertices[index_offset + 1] = settings.window.get('min_y');
        vertices[index_offset + 2] = startX + width / 2;
        vertices[index_offset + 3] = settings.window.get('max_y');
        vertices[index_offset + 4] = startX - width / 2;
        vertices[index_offset + 5] = settings.window.get('min_y');
        // Triangle 2
        vertices[index_offset + 6] = startX + width / 2;
        vertices[index_offset + 7] = settings.window.get('max_y');
        vertices[index_offset + 8] = startX + width / 2;
        vertices[index_offset + 9] = settings.window.get('max_y');
        vertices[index_offset + 10] = startX - width / 2;
        vertices[index_offset + 11] = settings.window.get('min_y');
    }

    /* @license twgl.js 4.14.2 Copyright (c) 2015, Gregg Tavares All Rights Reserved.
    Available via the MIT license.
    see: http://github.com/greggman/twgl.js for details */
    /*
     * Copyright 2019 Gregg Tavares
     *
     * Permission is hereby granted, free of charge, to any person obtaining a
     * copy of this software and associated documentation files (the "Software"),
     * to deal in the Software without restriction, including without limitation
     * the rights to use, copy, modify, merge, publish, distribute, sublicense,
     * and/or sell copies of the Software, and to permit persons to whom the
     * Software is furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
     * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
     * DEALINGS IN THE SOFTWARE.
     */

    /**
     *
     * Vec3 math math functions.
     *
     * Almost all functions take an optional `dst` argument. If it is not passed in the
     * functions will create a new Vec3. In other words you can do this
     *
     *     var v = v3.cross(v1, v2);  // Creates a new Vec3 with the cross product of v1 x v2.
     *
     * or
     *
     *     var v = v3.create();
     *     v3.cross(v1, v2, v);  // Puts the cross product of v1 x v2 in v
     *
     * The first style is often easier but depending on where it's used it generates garbage where
     * as there is almost never allocation with the second style.
     *
     * It is always save to pass any vector as the destination. So for example
     *
     *     v3.cross(v1, v2, v1);  // Puts the cross product of v1 x v2 in v1
     *
     * @module twgl/v3
     */

    let VecType = Float32Array;

    /**
     * Creates a vec3; may be called with x, y, z to set initial values.
     * @param {number} [x] Initial x value.
     * @param {number} [y] Initial y value.
     * @param {number} [z] Initial z value.
     * @return {module:twgl/v3.Vec3} the created vector
     * @memberOf module:twgl/v3
     */
    function create(x, y, z) {
      const dst = new VecType(3);
      if (x) {
        dst[0] = x;
      }
      if (y) {
        dst[1] = y;
      }
      if (z) {
        dst[2] = z;
      }
      return dst;
    }

    /**
     * Subtracts two vectors.
     * @param {module:twgl/v3.Vec3} a Operand vector.
     * @param {module:twgl/v3.Vec3} b Operand vector.
     * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {module:twgl/v3.Vec3} A vector that is the difference of a and b.
     * @memberOf module:twgl/v3
     */
    function subtract(a, b, dst) {
      dst = dst || new VecType(3);

      dst[0] = a[0] - b[0];
      dst[1] = a[1] - b[1];
      dst[2] = a[2] - b[2];

      return dst;
    }

    /**
     * Computes the cross product of two vectors; assumes both vectors have
     * three entries.
     * @param {module:twgl/v3.Vec3} a Operand vector.
     * @param {module:twgl/v3.Vec3} b Operand vector.
     * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {module:twgl/v3.Vec3} The vector of a cross b.
     * @memberOf module:twgl/v3
     */
    function cross(a, b, dst) {
      dst = dst || new VecType(3);

      const t1 = a[2] * b[0] - a[0] * b[2];
      const t2 = a[0] * b[1] - a[1] * b[0];
      dst[0] = a[1] * b[2] - a[2] * b[1];
      dst[1] = t1;
      dst[2] = t2;

      return dst;
    }

    /**
     * Divides a vector by its Euclidean length and returns the quotient.
     * @param {module:twgl/v3.Vec3} a The vector.
     * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {module:twgl/v3.Vec3} The normalized vector.
     * @memberOf module:twgl/v3
     */
    function normalize(a, dst) {
      dst = dst || new VecType(3);

      const lenSq = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
      const len = Math.sqrt(lenSq);
      if (len > 0.00001) {
        dst[0] = a[0] / len;
        dst[1] = a[1] / len;
        dst[2] = a[2] / len;
      } else {
        dst[0] = 0;
        dst[1] = 0;
        dst[2] = 0;
      }

      return dst;
    }

    /*
     * Copyright 2019 Gregg Tavares
     *
     * Permission is hereby granted, free of charge, to any person obtaining a
     * copy of this software and associated documentation files (the "Software"),
     * to deal in the Software without restriction, including without limitation
     * the rights to use, copy, modify, merge, publish, distribute, sublicense,
     * and/or sell copies of the Software, and to permit persons to whom the
     * Software is furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
     * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
     * DEALINGS IN THE SOFTWARE.
     */

    /**
     * 4x4 Matrix math math functions.
     *
     * Almost all functions take an optional `dst` argument. If it is not passed in the
     * functions will create a new matrix. In other words you can do this
     *
     *     const mat = m4.translation([1, 2, 3]);  // Creates a new translation matrix
     *
     * or
     *
     *     const mat = m4.create();
     *     m4.translation([1, 2, 3], mat);  // Puts translation matrix in mat.
     *
     * The first style is often easier but depending on where it's used it generates garbage where
     * as there is almost never allocation with the second style.
     *
     * It is always save to pass any matrix as the destination. So for example
     *
     *     const mat = m4.identity();
     *     const trans = m4.translation([1, 2, 3]);
     *     m4.multiply(mat, trans, mat);  // Multiplies mat * trans and puts result in mat.
     *
     * @module twgl/m4
     */
    let MatType = Float32Array;

    /**
     * A JavaScript array with 16 values or a Float32Array with 16 values.
     * When created by the library will create the default type which is `Float32Array`
     * but can be set by calling {@link module:twgl/m4.setDefaultType}.
     * @typedef {(number[]|Float32Array)} Mat4
     * @memberOf module:twgl/m4
     */

    /**
     * Sets the type this library creates for a Mat4
     * @param {constructor} ctor the constructor for the type. Either `Float32Array` or `Array`
     * @return {constructor} previous constructor for Mat4
     * @memberOf module:twgl/m4
     */
    function setDefaultType$1(ctor) {
      const oldType = MatType;
      MatType = ctor;
      return oldType;
    }

    /**
     * Negates a matrix.
     * @param {module:twgl/m4.Mat4} m The matrix.
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} -m.
     * @memberOf module:twgl/m4
     */
    function negate$1(m, dst) {
      dst = dst || new MatType(16);

      dst[ 0] = -m[ 0];
      dst[ 1] = -m[ 1];
      dst[ 2] = -m[ 2];
      dst[ 3] = -m[ 3];
      dst[ 4] = -m[ 4];
      dst[ 5] = -m[ 5];
      dst[ 6] = -m[ 6];
      dst[ 7] = -m[ 7];
      dst[ 8] = -m[ 8];
      dst[ 9] = -m[ 9];
      dst[10] = -m[10];
      dst[11] = -m[11];
      dst[12] = -m[12];
      dst[13] = -m[13];
      dst[14] = -m[14];
      dst[15] = -m[15];

      return dst;
    }

    /**
     * Copies a matrix.
     * @param {module:twgl/m4.Mat4} m The matrix.
     * @param {module:twgl/m4.Mat4} [dst] The matrix. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} A copy of m.
     * @memberOf module:twgl/m4
     */
    function copy$1(m, dst) {
      dst = dst || new MatType(16);

      dst[ 0] = m[ 0];
      dst[ 1] = m[ 1];
      dst[ 2] = m[ 2];
      dst[ 3] = m[ 3];
      dst[ 4] = m[ 4];
      dst[ 5] = m[ 5];
      dst[ 6] = m[ 6];
      dst[ 7] = m[ 7];
      dst[ 8] = m[ 8];
      dst[ 9] = m[ 9];
      dst[10] = m[10];
      dst[11] = m[11];
      dst[12] = m[12];
      dst[13] = m[13];
      dst[14] = m[14];
      dst[15] = m[15];

      return dst;
    }

    /**
     * Creates an n-by-n identity matrix.
     *
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} An n-by-n identity matrix.
     * @memberOf module:twgl/m4
     */
    function identity(dst) {
      dst = dst || new MatType(16);

      dst[ 0] = 1;
      dst[ 1] = 0;
      dst[ 2] = 0;
      dst[ 3] = 0;
      dst[ 4] = 0;
      dst[ 5] = 1;
      dst[ 6] = 0;
      dst[ 7] = 0;
      dst[ 8] = 0;
      dst[ 9] = 0;
      dst[10] = 1;
      dst[11] = 0;
      dst[12] = 0;
      dst[13] = 0;
      dst[14] = 0;
      dst[15] = 1;

      return dst;
    }

    /**
     * Takes the transpose of a matrix.
     * @param {module:twgl/m4.Mat4} m The matrix.
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The transpose of m.
     * @memberOf module:twgl/m4
     */
     function transpose(m, dst) {
      dst = dst || new MatType(16);
      if (dst === m) {
        let t;

        t = m[1];
        m[1] = m[4];
        m[4] = t;

        t = m[2];
        m[2] = m[8];
        m[8] = t;

        t = m[3];
        m[3] = m[12];
        m[12] = t;

        t = m[6];
        m[6] = m[9];
        m[9] = t;

        t = m[7];
        m[7] = m[13];
        m[13] = t;

        t = m[11];
        m[11] = m[14];
        m[14] = t;
        return dst;
      }

      const m00 = m[0 * 4 + 0];
      const m01 = m[0 * 4 + 1];
      const m02 = m[0 * 4 + 2];
      const m03 = m[0 * 4 + 3];
      const m10 = m[1 * 4 + 0];
      const m11 = m[1 * 4 + 1];
      const m12 = m[1 * 4 + 2];
      const m13 = m[1 * 4 + 3];
      const m20 = m[2 * 4 + 0];
      const m21 = m[2 * 4 + 1];
      const m22 = m[2 * 4 + 2];
      const m23 = m[2 * 4 + 3];
      const m30 = m[3 * 4 + 0];
      const m31 = m[3 * 4 + 1];
      const m32 = m[3 * 4 + 2];
      const m33 = m[3 * 4 + 3];

      dst[ 0] = m00;
      dst[ 1] = m10;
      dst[ 2] = m20;
      dst[ 3] = m30;
      dst[ 4] = m01;
      dst[ 5] = m11;
      dst[ 6] = m21;
      dst[ 7] = m31;
      dst[ 8] = m02;
      dst[ 9] = m12;
      dst[10] = m22;
      dst[11] = m32;
      dst[12] = m03;
      dst[13] = m13;
      dst[14] = m23;
      dst[15] = m33;

      return dst;
    }

    /**
     * Computes the inverse of a 4-by-4 matrix.
     * @param {module:twgl/m4.Mat4} m The matrix.
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The inverse of m.
     * @memberOf module:twgl/m4
     */
    function inverse(m, dst) {
      dst = dst || new MatType(16);

      const m00 = m[0 * 4 + 0];
      const m01 = m[0 * 4 + 1];
      const m02 = m[0 * 4 + 2];
      const m03 = m[0 * 4 + 3];
      const m10 = m[1 * 4 + 0];
      const m11 = m[1 * 4 + 1];
      const m12 = m[1 * 4 + 2];
      const m13 = m[1 * 4 + 3];
      const m20 = m[2 * 4 + 0];
      const m21 = m[2 * 4 + 1];
      const m22 = m[2 * 4 + 2];
      const m23 = m[2 * 4 + 3];
      const m30 = m[3 * 4 + 0];
      const m31 = m[3 * 4 + 1];
      const m32 = m[3 * 4 + 2];
      const m33 = m[3 * 4 + 3];
      const tmp_0  = m22 * m33;
      const tmp_1  = m32 * m23;
      const tmp_2  = m12 * m33;
      const tmp_3  = m32 * m13;
      const tmp_4  = m12 * m23;
      const tmp_5  = m22 * m13;
      const tmp_6  = m02 * m33;
      const tmp_7  = m32 * m03;
      const tmp_8  = m02 * m23;
      const tmp_9  = m22 * m03;
      const tmp_10 = m02 * m13;
      const tmp_11 = m12 * m03;
      const tmp_12 = m20 * m31;
      const tmp_13 = m30 * m21;
      const tmp_14 = m10 * m31;
      const tmp_15 = m30 * m11;
      const tmp_16 = m10 * m21;
      const tmp_17 = m20 * m11;
      const tmp_18 = m00 * m31;
      const tmp_19 = m30 * m01;
      const tmp_20 = m00 * m21;
      const tmp_21 = m20 * m01;
      const tmp_22 = m00 * m11;
      const tmp_23 = m10 * m01;

      const t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
          (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
      const t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
          (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
      const t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
          (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
      const t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
          (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

      const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

      dst[ 0] = d * t0;
      dst[ 1] = d * t1;
      dst[ 2] = d * t2;
      dst[ 3] = d * t3;
      dst[ 4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
              (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
      dst[ 5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
              (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
      dst[ 6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
              (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
      dst[ 7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
              (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
      dst[ 8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
              (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
      dst[ 9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
              (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
      dst[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
              (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
      dst[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
              (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
      dst[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
              (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
      dst[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
              (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
      dst[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
              (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
      dst[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
              (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));

      return dst;
    }

    /**
     * Multiplies two 4-by-4 matrices with a on the left and b on the right
     * @param {module:twgl/m4.Mat4} a The matrix on the left.
     * @param {module:twgl/m4.Mat4} b The matrix on the right.
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The matrix product of a and b.
     * @memberOf module:twgl/m4
     */
    function multiply$1(a, b, dst) {
      dst = dst || new MatType(16);

      const a00 = a[0];
      const a01 = a[1];
      const a02 = a[2];
      const a03 = a[3];
      const a10 = a[ 4 + 0];
      const a11 = a[ 4 + 1];
      const a12 = a[ 4 + 2];
      const a13 = a[ 4 + 3];
      const a20 = a[ 8 + 0];
      const a21 = a[ 8 + 1];
      const a22 = a[ 8 + 2];
      const a23 = a[ 8 + 3];
      const a30 = a[12 + 0];
      const a31 = a[12 + 1];
      const a32 = a[12 + 2];
      const a33 = a[12 + 3];
      const b00 = b[0];
      const b01 = b[1];
      const b02 = b[2];
      const b03 = b[3];
      const b10 = b[ 4 + 0];
      const b11 = b[ 4 + 1];
      const b12 = b[ 4 + 2];
      const b13 = b[ 4 + 3];
      const b20 = b[ 8 + 0];
      const b21 = b[ 8 + 1];
      const b22 = b[ 8 + 2];
      const b23 = b[ 8 + 3];
      const b30 = b[12 + 0];
      const b31 = b[12 + 1];
      const b32 = b[12 + 2];
      const b33 = b[12 + 3];

      dst[ 0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
      dst[ 1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
      dst[ 2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
      dst[ 3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
      dst[ 4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
      dst[ 5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
      dst[ 6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
      dst[ 7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
      dst[ 8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
      dst[ 9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
      dst[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
      dst[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
      dst[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
      dst[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
      dst[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
      dst[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;

      return dst;
    }

    /**
     * Sets the translation component of a 4-by-4 matrix to the given
     * vector.
     * @param {module:twgl/m4.Mat4} a The matrix.
     * @param {module:twgl/v3.Vec3} v The vector.
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The matrix with translation set.
     * @memberOf module:twgl/m4
     */
    function setTranslation(a, v, dst) {
      dst = dst || identity();
      if (a !== dst) {
        dst[ 0] = a[ 0];
        dst[ 1] = a[ 1];
        dst[ 2] = a[ 2];
        dst[ 3] = a[ 3];
        dst[ 4] = a[ 4];
        dst[ 5] = a[ 5];
        dst[ 6] = a[ 6];
        dst[ 7] = a[ 7];
        dst[ 8] = a[ 8];
        dst[ 9] = a[ 9];
        dst[10] = a[10];
        dst[11] = a[11];
      }
      dst[12] = v[0];
      dst[13] = v[1];
      dst[14] = v[2];
      dst[15] = 1;
      return dst;
    }

    /**
     * Returns the translation component of a 4-by-4 matrix as a vector with 3
     * entries.
     * @param {module:twgl/m4.Mat4} m The matrix.
     * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not passed a new one is created.
     * @return {module:twgl/v3.Vec3} The translation component of m.
     * @memberOf module:twgl/m4
     */
    function getTranslation(m, dst) {
      dst = dst || create();
      dst[0] = m[12];
      dst[1] = m[13];
      dst[2] = m[14];
      return dst;
    }

    /**
     * Returns an axis of a 4x4 matrix as a vector with 3 entries
     * @param {module:twgl/m4.Mat4} m The matrix.
     * @param {number} axis The axis 0 = x, 1 = y, 2 = z;
     * @return {module:twgl/v3.Vec3} [dst] vector.
     * @return {module:twgl/v3.Vec3} The axis component of m.
     * @memberOf module:twgl/m4
     */
    function getAxis(m, axis, dst) {
      dst = dst || create();
      const off = axis * 4;
      dst[0] = m[off + 0];
      dst[1] = m[off + 1];
      dst[2] = m[off + 2];
      return dst;
    }

    /**
     * Sets an axis of a 4x4 matrix as a vector with 3 entries
     * @param {module:twgl/m4.Mat4} m The matrix.
     * @param {module:twgl/v3.Vec3} v the axis vector
     * @param {number} axis The axis  0 = x, 1 = y, 2 = z;
     * @param {module:twgl/m4.Mat4} [dst] The matrix to set. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The matrix with axis set.
     * @memberOf module:twgl/m4
     */
    function setAxis(a, v, axis, dst) {
      if (dst !== a) {
        dst = copy$1(a, dst);
      }
      const off = axis * 4;
      dst[off + 0] = v[0];
      dst[off + 1] = v[1];
      dst[off + 2] = v[2];
      return dst;
    }

    /**
     * Computes a 4-by-4 perspective transformation matrix given the angular height
     * of the frustum, the aspect ratio, and the near and far clipping planes.  The
     * arguments define a frustum extending in the negative z direction.  The given
     * angle is the vertical angle of the frustum, and the horizontal angle is
     * determined to produce the given aspect ratio.  The arguments near and far are
     * the distances to the near and far clipping planes.  Note that near and far
     * are not z coordinates, but rather they are distances along the negative
     * z-axis.  The matrix generated sends the viewing frustum to the unit box.
     * We assume a unit box extending from -1 to 1 in the x and y dimensions and
     * from 0 to 1 in the z dimension.
     * @param {number} fieldOfViewYInRadians The camera angle from top to bottom (in radians).
     * @param {number} aspect The aspect ratio width / height.
     * @param {number} zNear The depth (negative z coordinate)
     *     of the near clipping plane.
     * @param {number} zFar The depth (negative z coordinate)
     *     of the far clipping plane.
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The perspective matrix.
     * @memberOf module:twgl/m4
     */
    function perspective(fieldOfViewYInRadians, aspect, zNear, zFar, dst) {
      dst = dst || new MatType(16);

      const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewYInRadians);
      const rangeInv = 1.0 / (zNear - zFar);

      dst[0]  = f / aspect;
      dst[1]  = 0;
      dst[2]  = 0;
      dst[3]  = 0;

      dst[4]  = 0;
      dst[5]  = f;
      dst[6]  = 0;
      dst[7]  = 0;

      dst[8]  = 0;
      dst[9]  = 0;
      dst[10] = (zNear + zFar) * rangeInv;
      dst[11] = -1;

      dst[12] = 0;
      dst[13] = 0;
      dst[14] = zNear * zFar * rangeInv * 2;
      dst[15] = 0;

      return dst;
    }

    /**
     * Computes a 4-by-4 orthogonal transformation matrix given the left, right,
     * bottom, and top dimensions of the near clipping plane as well as the
     * near and far clipping plane distances.
     * @param {number} left Left side of the near clipping plane viewport.
     * @param {number} right Right side of the near clipping plane viewport.
     * @param {number} bottom Bottom of the near clipping plane viewport.
     * @param {number} top Top of the near clipping plane viewport.
     * @param {number} near The depth (negative z coordinate)
     *     of the near clipping plane.
     * @param {number} far The depth (negative z coordinate)
     *     of the far clipping plane.
     * @param {module:twgl/m4.Mat4} [dst] Output matrix. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The perspective matrix.
     * @memberOf module:twgl/m4
     */
    function ortho(left, right, bottom, top, near, far, dst) {
      dst = dst || new MatType(16);

      dst[0]  = 2 / (right - left);
      dst[1]  = 0;
      dst[2]  = 0;
      dst[3]  = 0;

      dst[4]  = 0;
      dst[5]  = 2 / (top - bottom);
      dst[6]  = 0;
      dst[7]  = 0;

      dst[8]  = 0;
      dst[9]  = 0;
      dst[10] = 2 / (near - far);
      dst[11] = 0;

      dst[12] = (right + left) / (left - right);
      dst[13] = (top + bottom) / (bottom - top);
      dst[14] = (far + near) / (near - far);
      dst[15] = 1;

      return dst;
    }

    /**
     * Computes a 4-by-4 perspective transformation matrix given the left, right,
     * top, bottom, near and far clipping planes. The arguments define a frustum
     * extending in the negative z direction. The arguments near and far are the
     * distances to the near and far clipping planes. Note that near and far are not
     * z coordinates, but rather they are distances along the negative z-axis. The
     * matrix generated sends the viewing frustum to the unit box. We assume a unit
     * box extending from -1 to 1 in the x and y dimensions and from 0 to 1 in the z
     * dimension.
     * @param {number} left The x coordinate of the left plane of the box.
     * @param {number} right The x coordinate of the right plane of the box.
     * @param {number} bottom The y coordinate of the bottom plane of the box.
     * @param {number} top The y coordinate of the right plane of the box.
     * @param {number} near The negative z coordinate of the near plane of the box.
     * @param {number} far The negative z coordinate of the far plane of the box.
     * @param {module:twgl/m4.Mat4} [dst] Output matrix. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The perspective projection matrix.
     * @memberOf module:twgl/m4
     */
    function frustum(left, right, bottom, top, near, far, dst) {
      dst = dst || new MatType(16);

      const dx = (right - left);
      const dy = (top - bottom);
      const dz = (near - far);

      dst[ 0] = 2 * near / dx;
      dst[ 1] = 0;
      dst[ 2] = 0;
      dst[ 3] = 0;
      dst[ 4] = 0;
      dst[ 5] = 2 * near / dy;
      dst[ 6] = 0;
      dst[ 7] = 0;
      dst[ 8] = (left + right) / dx;
      dst[ 9] = (top + bottom) / dy;
      dst[10] = far / dz;
      dst[11] = -1;
      dst[12] = 0;
      dst[13] = 0;
      dst[14] = near * far / dz;
      dst[15] = 0;

      return dst;
    }

    let xAxis;
    let yAxis;
    let zAxis;

    /**
     * Computes a 4-by-4 look-at transformation.
     *
     * This is a matrix which positions the camera itself. If you want
     * a view matrix (a matrix which moves things in front of the camera)
     * take the inverse of this.
     *
     * @param {module:twgl/v3.Vec3} eye The position of the eye.
     * @param {module:twgl/v3.Vec3} target The position meant to be viewed.
     * @param {module:twgl/v3.Vec3} up A vector pointing up.
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The look-at matrix.
     * @memberOf module:twgl/m4
     */
    function lookAt(eye, target, up, dst) {
      dst = dst || new MatType(16);

      xAxis = xAxis || create();
      yAxis = yAxis || create();
      zAxis = zAxis || create();

      normalize(
          subtract(eye, target, zAxis), zAxis);
      normalize(cross(up, zAxis, xAxis), xAxis);
      normalize(cross(zAxis, xAxis, yAxis), yAxis);

      dst[ 0] = xAxis[0];
      dst[ 1] = xAxis[1];
      dst[ 2] = xAxis[2];
      dst[ 3] = 0;
      dst[ 4] = yAxis[0];
      dst[ 5] = yAxis[1];
      dst[ 6] = yAxis[2];
      dst[ 7] = 0;
      dst[ 8] = zAxis[0];
      dst[ 9] = zAxis[1];
      dst[10] = zAxis[2];
      dst[11] = 0;
      dst[12] = eye[0];
      dst[13] = eye[1];
      dst[14] = eye[2];
      dst[15] = 1;

      return dst;
    }

    /**
     * Creates a 4-by-4 matrix which translates by the given vector v.
     * @param {module:twgl/v3.Vec3} v The vector by
     *     which to translate.
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The translation matrix.
     * @memberOf module:twgl/m4
     */
    function translation(v, dst) {
      dst = dst || new MatType(16);

      dst[ 0] = 1;
      dst[ 1] = 0;
      dst[ 2] = 0;
      dst[ 3] = 0;
      dst[ 4] = 0;
      dst[ 5] = 1;
      dst[ 6] = 0;
      dst[ 7] = 0;
      dst[ 8] = 0;
      dst[ 9] = 0;
      dst[10] = 1;
      dst[11] = 0;
      dst[12] = v[0];
      dst[13] = v[1];
      dst[14] = v[2];
      dst[15] = 1;
      return dst;
    }

    /**
     * Translates the given 4-by-4 matrix by the given vector v.
     * @param {module:twgl/m4.Mat4} m The matrix.
     * @param {module:twgl/v3.Vec3} v The vector by
     *     which to translate.
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The translated matrix.
     * @memberOf module:twgl/m4
     */
    function translate(m, v, dst) {
      dst = dst || new MatType(16);

      const v0 = v[0];
      const v1 = v[1];
      const v2 = v[2];
      const m00 = m[0];
      const m01 = m[1];
      const m02 = m[2];
      const m03 = m[3];
      const m10 = m[1 * 4 + 0];
      const m11 = m[1 * 4 + 1];
      const m12 = m[1 * 4 + 2];
      const m13 = m[1 * 4 + 3];
      const m20 = m[2 * 4 + 0];
      const m21 = m[2 * 4 + 1];
      const m22 = m[2 * 4 + 2];
      const m23 = m[2 * 4 + 3];
      const m30 = m[3 * 4 + 0];
      const m31 = m[3 * 4 + 1];
      const m32 = m[3 * 4 + 2];
      const m33 = m[3 * 4 + 3];

      if (m !== dst) {
        dst[ 0] = m00;
        dst[ 1] = m01;
        dst[ 2] = m02;
        dst[ 3] = m03;
        dst[ 4] = m10;
        dst[ 5] = m11;
        dst[ 6] = m12;
        dst[ 7] = m13;
        dst[ 8] = m20;
        dst[ 9] = m21;
        dst[10] = m22;
        dst[11] = m23;
      }

      dst[12] = m00 * v0 + m10 * v1 + m20 * v2 + m30;
      dst[13] = m01 * v0 + m11 * v1 + m21 * v2 + m31;
      dst[14] = m02 * v0 + m12 * v1 + m22 * v2 + m32;
      dst[15] = m03 * v0 + m13 * v1 + m23 * v2 + m33;

      return dst;
    }

    /**
     * Creates a 4-by-4 matrix which rotates around the x-axis by the given angle.
     * @param {number} angleInRadians The angle by which to rotate (in radians).
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The rotation matrix.
     * @memberOf module:twgl/m4
     */
    function rotationX(angleInRadians, dst) {
      dst = dst || new MatType(16);

      const c = Math.cos(angleInRadians);
      const s = Math.sin(angleInRadians);

      dst[ 0] = 1;
      dst[ 1] = 0;
      dst[ 2] = 0;
      dst[ 3] = 0;
      dst[ 4] = 0;
      dst[ 5] = c;
      dst[ 6] = s;
      dst[ 7] = 0;
      dst[ 8] = 0;
      dst[ 9] = -s;
      dst[10] = c;
      dst[11] = 0;
      dst[12] = 0;
      dst[13] = 0;
      dst[14] = 0;
      dst[15] = 1;

      return dst;
    }

    /**
     * Rotates the given 4-by-4 matrix around the x-axis by the given
     * angle.
     * @param {module:twgl/m4.Mat4} m The matrix.
     * @param {number} angleInRadians The angle by which to rotate (in radians).
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The rotated matrix.
     * @memberOf module:twgl/m4
     */
    function rotateX(m, angleInRadians, dst) {
      dst = dst || new MatType(16);

      const m10 = m[4];
      const m11 = m[5];
      const m12 = m[6];
      const m13 = m[7];
      const m20 = m[8];
      const m21 = m[9];
      const m22 = m[10];
      const m23 = m[11];
      const c = Math.cos(angleInRadians);
      const s = Math.sin(angleInRadians);

      dst[4]  = c * m10 + s * m20;
      dst[5]  = c * m11 + s * m21;
      dst[6]  = c * m12 + s * m22;
      dst[7]  = c * m13 + s * m23;
      dst[8]  = c * m20 - s * m10;
      dst[9]  = c * m21 - s * m11;
      dst[10] = c * m22 - s * m12;
      dst[11] = c * m23 - s * m13;

      if (m !== dst) {
        dst[ 0] = m[ 0];
        dst[ 1] = m[ 1];
        dst[ 2] = m[ 2];
        dst[ 3] = m[ 3];
        dst[12] = m[12];
        dst[13] = m[13];
        dst[14] = m[14];
        dst[15] = m[15];
      }

      return dst;
    }

    /**
     * Creates a 4-by-4 matrix which rotates around the y-axis by the given angle.
     * @param {number} angleInRadians The angle by which to rotate (in radians).
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The rotation matrix.
     * @memberOf module:twgl/m4
     */
    function rotationY(angleInRadians, dst) {
      dst = dst || new MatType(16);

      const c = Math.cos(angleInRadians);
      const s = Math.sin(angleInRadians);

      dst[ 0] = c;
      dst[ 1] = 0;
      dst[ 2] = -s;
      dst[ 3] = 0;
      dst[ 4] = 0;
      dst[ 5] = 1;
      dst[ 6] = 0;
      dst[ 7] = 0;
      dst[ 8] = s;
      dst[ 9] = 0;
      dst[10] = c;
      dst[11] = 0;
      dst[12] = 0;
      dst[13] = 0;
      dst[14] = 0;
      dst[15] = 1;

      return dst;
    }

    /**
     * Rotates the given 4-by-4 matrix around the y-axis by the given
     * angle.
     * @param {module:twgl/m4.Mat4} m The matrix.
     * @param {number} angleInRadians The angle by which to rotate (in radians).
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The rotated matrix.
     * @memberOf module:twgl/m4
     */
    function rotateY(m, angleInRadians, dst) {
      dst = dst || new MatType(16);

      const m00 = m[0 * 4 + 0];
      const m01 = m[0 * 4 + 1];
      const m02 = m[0 * 4 + 2];
      const m03 = m[0 * 4 + 3];
      const m20 = m[2 * 4 + 0];
      const m21 = m[2 * 4 + 1];
      const m22 = m[2 * 4 + 2];
      const m23 = m[2 * 4 + 3];
      const c = Math.cos(angleInRadians);
      const s = Math.sin(angleInRadians);

      dst[ 0] = c * m00 - s * m20;
      dst[ 1] = c * m01 - s * m21;
      dst[ 2] = c * m02 - s * m22;
      dst[ 3] = c * m03 - s * m23;
      dst[ 8] = c * m20 + s * m00;
      dst[ 9] = c * m21 + s * m01;
      dst[10] = c * m22 + s * m02;
      dst[11] = c * m23 + s * m03;

      if (m !== dst) {
        dst[ 4] = m[ 4];
        dst[ 5] = m[ 5];
        dst[ 6] = m[ 6];
        dst[ 7] = m[ 7];
        dst[12] = m[12];
        dst[13] = m[13];
        dst[14] = m[14];
        dst[15] = m[15];
      }

      return dst;
    }

    /**
     * Creates a 4-by-4 matrix which rotates around the z-axis by the given angle.
     * @param {number} angleInRadians The angle by which to rotate (in radians).
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The rotation matrix.
     * @memberOf module:twgl/m4
     */
    function rotationZ(angleInRadians, dst) {
      dst = dst || new MatType(16);

      const c = Math.cos(angleInRadians);
      const s = Math.sin(angleInRadians);

      dst[ 0] = c;
      dst[ 1] = s;
      dst[ 2] = 0;
      dst[ 3] = 0;
      dst[ 4] = -s;
      dst[ 5] = c;
      dst[ 6] = 0;
      dst[ 7] = 0;
      dst[ 8] = 0;
      dst[ 9] = 0;
      dst[10] = 1;
      dst[11] = 0;
      dst[12] = 0;
      dst[13] = 0;
      dst[14] = 0;
      dst[15] = 1;

      return dst;
    }

    /**
     * Rotates the given 4-by-4 matrix around the z-axis by the given
     * angle.
     * @param {module:twgl/m4.Mat4} m The matrix.
     * @param {number} angleInRadians The angle by which to rotate (in radians).
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The rotated matrix.
     * @memberOf module:twgl/m4
     */
    function rotateZ(m, angleInRadians, dst) {
      dst = dst || new MatType(16);

      const m00 = m[0 * 4 + 0];
      const m01 = m[0 * 4 + 1];
      const m02 = m[0 * 4 + 2];
      const m03 = m[0 * 4 + 3];
      const m10 = m[1 * 4 + 0];
      const m11 = m[1 * 4 + 1];
      const m12 = m[1 * 4 + 2];
      const m13 = m[1 * 4 + 3];
      const c = Math.cos(angleInRadians);
      const s = Math.sin(angleInRadians);

      dst[ 0] = c * m00 + s * m10;
      dst[ 1] = c * m01 + s * m11;
      dst[ 2] = c * m02 + s * m12;
      dst[ 3] = c * m03 + s * m13;
      dst[ 4] = c * m10 - s * m00;
      dst[ 5] = c * m11 - s * m01;
      dst[ 6] = c * m12 - s * m02;
      dst[ 7] = c * m13 - s * m03;

      if (m !== dst) {
        dst[ 8] = m[ 8];
        dst[ 9] = m[ 9];
        dst[10] = m[10];
        dst[11] = m[11];
        dst[12] = m[12];
        dst[13] = m[13];
        dst[14] = m[14];
        dst[15] = m[15];
      }

      return dst;
    }

    /**
     * Creates a 4-by-4 matrix which rotates around the given axis by the given
     * angle.
     * @param {module:twgl/v3.Vec3} axis The axis
     *     about which to rotate.
     * @param {number} angleInRadians The angle by which to rotate (in radians).
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} A matrix which rotates angle radians
     *     around the axis.
     * @memberOf module:twgl/m4
     */
    function axisRotation(axis, angleInRadians, dst) {
      dst = dst || new MatType(16);

      let x = axis[0];
      let y = axis[1];
      let z = axis[2];
      const n = Math.sqrt(x * x + y * y + z * z);
      x /= n;
      y /= n;
      z /= n;
      const xx = x * x;
      const yy = y * y;
      const zz = z * z;
      const c = Math.cos(angleInRadians);
      const s = Math.sin(angleInRadians);
      const oneMinusCosine = 1 - c;

      dst[ 0] = xx + (1 - xx) * c;
      dst[ 1] = x * y * oneMinusCosine + z * s;
      dst[ 2] = x * z * oneMinusCosine - y * s;
      dst[ 3] = 0;
      dst[ 4] = x * y * oneMinusCosine - z * s;
      dst[ 5] = yy + (1 - yy) * c;
      dst[ 6] = y * z * oneMinusCosine + x * s;
      dst[ 7] = 0;
      dst[ 8] = x * z * oneMinusCosine + y * s;
      dst[ 9] = y * z * oneMinusCosine - x * s;
      dst[10] = zz + (1 - zz) * c;
      dst[11] = 0;
      dst[12] = 0;
      dst[13] = 0;
      dst[14] = 0;
      dst[15] = 1;

      return dst;
    }

    /**
     * Rotates the given 4-by-4 matrix around the given axis by the
     * given angle.
     * @param {module:twgl/m4.Mat4} m The matrix.
     * @param {module:twgl/v3.Vec3} axis The axis
     *     about which to rotate.
     * @param {number} angleInRadians The angle by which to rotate (in radians).
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The rotated matrix.
     * @memberOf module:twgl/m4
     */
    function axisRotate(m, axis, angleInRadians, dst) {
      dst = dst || new MatType(16);

      let x = axis[0];
      let y = axis[1];
      let z = axis[2];
      const n = Math.sqrt(x * x + y * y + z * z);
      x /= n;
      y /= n;
      z /= n;
      const xx = x * x;
      const yy = y * y;
      const zz = z * z;
      const c = Math.cos(angleInRadians);
      const s = Math.sin(angleInRadians);
      const oneMinusCosine = 1 - c;

      const r00 = xx + (1 - xx) * c;
      const r01 = x * y * oneMinusCosine + z * s;
      const r02 = x * z * oneMinusCosine - y * s;
      const r10 = x * y * oneMinusCosine - z * s;
      const r11 = yy + (1 - yy) * c;
      const r12 = y * z * oneMinusCosine + x * s;
      const r20 = x * z * oneMinusCosine + y * s;
      const r21 = y * z * oneMinusCosine - x * s;
      const r22 = zz + (1 - zz) * c;

      const m00 = m[0];
      const m01 = m[1];
      const m02 = m[2];
      const m03 = m[3];
      const m10 = m[4];
      const m11 = m[5];
      const m12 = m[6];
      const m13 = m[7];
      const m20 = m[8];
      const m21 = m[9];
      const m22 = m[10];
      const m23 = m[11];

      dst[ 0] = r00 * m00 + r01 * m10 + r02 * m20;
      dst[ 1] = r00 * m01 + r01 * m11 + r02 * m21;
      dst[ 2] = r00 * m02 + r01 * m12 + r02 * m22;
      dst[ 3] = r00 * m03 + r01 * m13 + r02 * m23;
      dst[ 4] = r10 * m00 + r11 * m10 + r12 * m20;
      dst[ 5] = r10 * m01 + r11 * m11 + r12 * m21;
      dst[ 6] = r10 * m02 + r11 * m12 + r12 * m22;
      dst[ 7] = r10 * m03 + r11 * m13 + r12 * m23;
      dst[ 8] = r20 * m00 + r21 * m10 + r22 * m20;
      dst[ 9] = r20 * m01 + r21 * m11 + r22 * m21;
      dst[10] = r20 * m02 + r21 * m12 + r22 * m22;
      dst[11] = r20 * m03 + r21 * m13 + r22 * m23;

      if (m !== dst) {
        dst[12] = m[12];
        dst[13] = m[13];
        dst[14] = m[14];
        dst[15] = m[15];
      }

      return dst;
    }

    /**
     * Creates a 4-by-4 matrix which scales in each dimension by an amount given by
     * the corresponding entry in the given vector; assumes the vector has three
     * entries.
     * @param {module:twgl/v3.Vec3} v A vector of
     *     three entries specifying the factor by which to scale in each dimension.
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The scaling matrix.
     * @memberOf module:twgl/m4
     */
    function scaling(v, dst) {
      dst = dst || new MatType(16);

      dst[ 0] = v[0];
      dst[ 1] = 0;
      dst[ 2] = 0;
      dst[ 3] = 0;
      dst[ 4] = 0;
      dst[ 5] = v[1];
      dst[ 6] = 0;
      dst[ 7] = 0;
      dst[ 8] = 0;
      dst[ 9] = 0;
      dst[10] = v[2];
      dst[11] = 0;
      dst[12] = 0;
      dst[13] = 0;
      dst[14] = 0;
      dst[15] = 1;

      return dst;
    }

    /**
     * Scales the given 4-by-4 matrix in each dimension by an amount
     * given by the corresponding entry in the given vector; assumes the vector has
     * three entries.
     * @param {module:twgl/m4.Mat4} m The matrix to be modified.
     * @param {module:twgl/v3.Vec3} v A vector of three entries specifying the
     *     factor by which to scale in each dimension.
     * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {module:twgl/m4.Mat4} The scaled matrix.
     * @memberOf module:twgl/m4
     */
    function scale(m, v, dst) {
      dst = dst || new MatType(16);

      const v0 = v[0];
      const v1 = v[1];
      const v2 = v[2];

      dst[ 0] = v0 * m[0 * 4 + 0];
      dst[ 1] = v0 * m[0 * 4 + 1];
      dst[ 2] = v0 * m[0 * 4 + 2];
      dst[ 3] = v0 * m[0 * 4 + 3];
      dst[ 4] = v1 * m[1 * 4 + 0];
      dst[ 5] = v1 * m[1 * 4 + 1];
      dst[ 6] = v1 * m[1 * 4 + 2];
      dst[ 7] = v1 * m[1 * 4 + 3];
      dst[ 8] = v2 * m[2 * 4 + 0];
      dst[ 9] = v2 * m[2 * 4 + 1];
      dst[10] = v2 * m[2 * 4 + 2];
      dst[11] = v2 * m[2 * 4 + 3];

      if (m !== dst) {
        dst[12] = m[12];
        dst[13] = m[13];
        dst[14] = m[14];
        dst[15] = m[15];
      }

      return dst;
    }

    /**
     * Takes a 4-by-4 matrix and a vector with 3 entries,
     * interprets the vector as a point, transforms that point by the matrix, and
     * returns the result as a vector with 3 entries.
     * @param {module:twgl/m4.Mat4} m The matrix.
     * @param {module:twgl/v3.Vec3} v The point.
     * @param {module:twgl/v3.Vec3} [dst] optional vec3 to store result. If not passed a new one is created.
     * @return {module:twgl/v3.Vec3} The transformed point.
     * @memberOf module:twgl/m4
     */
    function transformPoint(m, v, dst) {
      dst = dst || create();
      const v0 = v[0];
      const v1 = v[1];
      const v2 = v[2];
      const d = v0 * m[0 * 4 + 3] + v1 * m[1 * 4 + 3] + v2 * m[2 * 4 + 3] + m[3 * 4 + 3];

      dst[0] = (v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0] + m[3 * 4 + 0]) / d;
      dst[1] = (v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1] + m[3 * 4 + 1]) / d;
      dst[2] = (v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2] + m[3 * 4 + 2]) / d;

      return dst;
    }

    /**
     * Takes a 4-by-4 matrix and a vector with 3 entries, interprets the vector as a
     * direction, transforms that direction by the matrix, and returns the result;
     * assumes the transformation of 3-dimensional space represented by the matrix
     * is parallel-preserving, i.e. any combination of rotation, scaling and
     * translation, but not a perspective distortion. Returns a vector with 3
     * entries.
     * @param {module:twgl/m4.Mat4} m The matrix.
     * @param {module:twgl/v3.Vec3} v The direction.
     * @param {module:twgl/v3.Vec3} [dst] optional Vec3 to store result. If not passed a new one is created.
     * @return {module:twgl/v3.Vec3} The transformed direction.
     * @memberOf module:twgl/m4
     */
    function transformDirection(m, v, dst) {
      dst = dst || create();

      const v0 = v[0];
      const v1 = v[1];
      const v2 = v[2];

      dst[0] = v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0];
      dst[1] = v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1];
      dst[2] = v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2];

      return dst;
    }

    /**
     * Takes a 4-by-4 matrix m and a vector v with 3 entries, interprets the vector
     * as a normal to a surface, and computes a vector which is normal upon
     * transforming that surface by the matrix. The effect of this function is the
     * same as transforming v (as a direction) by the inverse-transpose of m.  This
     * function assumes the transformation of 3-dimensional space represented by the
     * matrix is parallel-preserving, i.e. any combination of rotation, scaling and
     * translation, but not a perspective distortion.  Returns a vector with 3
     * entries.
     * @param {module:twgl/m4.Mat4} m The matrix.
     * @param {module:twgl/v3.Vec3} v The normal.
     * @param {module:twgl/v3.Vec3} [dst] The direction. If not passed a new one is created.
     * @return {module:twgl/v3.Vec3} The transformed normal.
     * @memberOf module:twgl/m4
     */
    function transformNormal(m, v, dst) {
      dst = dst || create();
      const mi = inverse(m);
      const v0 = v[0];
      const v1 = v[1];
      const v2 = v[2];

      dst[0] = v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2];
      dst[1] = v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2];
      dst[2] = v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2];

      return dst;
    }

    var m4 = /*#__PURE__*/Object.freeze({
      __proto__: null,
      axisRotate: axisRotate,
      axisRotation: axisRotation,
      copy: copy$1,
      frustum: frustum,
      getAxis: getAxis,
      getTranslation: getTranslation,
      identity: identity,
      inverse: inverse,
      lookAt: lookAt,
      multiply: multiply$1,
      negate: negate$1,
      ortho: ortho,
      perspective: perspective,
      rotateX: rotateX,
      rotateY: rotateY,
      rotateZ: rotateZ,
      rotationX: rotationX,
      rotationY: rotationY,
      rotationZ: rotationZ,
      scale: scale,
      scaling: scaling,
      setAxis: setAxis,
      setDefaultType: setDefaultType$1,
      setTranslation: setTranslation,
      transformDirection: transformDirection,
      transformNormal: transformNormal,
      transformPoint: transformPoint,
      translate: translate,
      translation: translation,
      transpose: transpose
    });

    /*
     * Copyright 2019 Gregg Tavares
     *
     * Permission is hereby granted, free of charge, to any person obtaining a
     * copy of this software and associated documentation files (the "Software"),
     * to deal in the Software without restriction, including without limitation
     * the rights to use, copy, modify, merge, publish, distribute, sublicense,
     * and/or sell copies of the Software, and to permit persons to whom the
     * Software is furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
     * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
     * DEALINGS IN THE SOFTWARE.
     */

    /* DataType */
    const BYTE                           = 0x1400;
    const UNSIGNED_BYTE                  = 0x1401;
    const SHORT                          = 0x1402;
    const UNSIGNED_SHORT                 = 0x1403;
    const INT                            = 0x1404;
    const UNSIGNED_INT                   = 0x1405;
    const FLOAT                          = 0x1406;

    /**
     * Get the GL type for a typedArray
     * @param {ArrayBufferView} typedArray a typedArray
     * @return {number} the GL type for array. For example pass in an `Int8Array` and `gl.BYTE` will
     *   be returned. Pass in a `Uint32Array` and `gl.UNSIGNED_INT` will be returned
     * @memberOf module:twgl/typedArray
     */
    function getGLTypeForTypedArray(typedArray) {
      if (typedArray instanceof Int8Array)         { return BYTE; }           // eslint-disable-line
      if (typedArray instanceof Uint8Array)        { return UNSIGNED_BYTE; }  // eslint-disable-line
      if (typedArray instanceof Uint8ClampedArray) { return UNSIGNED_BYTE; }  // eslint-disable-line
      if (typedArray instanceof Int16Array)        { return SHORT; }          // eslint-disable-line
      if (typedArray instanceof Uint16Array)       { return UNSIGNED_SHORT; } // eslint-disable-line
      if (typedArray instanceof Int32Array)        { return INT; }            // eslint-disable-line
      if (typedArray instanceof Uint32Array)       { return UNSIGNED_INT; }   // eslint-disable-line
      if (typedArray instanceof Float32Array)      { return FLOAT; }          // eslint-disable-line
      throw new Error('unsupported typed array type');
    }

    /**
     * Get the GL type for a typedArray type
     * @param {ArrayBufferView} typedArrayType a typedArray constructor
     * @return {number} the GL type for type. For example pass in `Int8Array` and `gl.BYTE` will
     *   be returned. Pass in `Uint32Array` and `gl.UNSIGNED_INT` will be returned
     * @memberOf module:twgl/typedArray
     */
    function getGLTypeForTypedArrayType(typedArrayType) {
      if (typedArrayType === Int8Array)         { return BYTE; }           // eslint-disable-line
      if (typedArrayType === Uint8Array)        { return UNSIGNED_BYTE; }  // eslint-disable-line
      if (typedArrayType === Uint8ClampedArray) { return UNSIGNED_BYTE; }  // eslint-disable-line
      if (typedArrayType === Int16Array)        { return SHORT; }          // eslint-disable-line
      if (typedArrayType === Uint16Array)       { return UNSIGNED_SHORT; } // eslint-disable-line
      if (typedArrayType === Int32Array)        { return INT; }            // eslint-disable-line
      if (typedArrayType === Uint32Array)       { return UNSIGNED_INT; }   // eslint-disable-line
      if (typedArrayType === Float32Array)      { return FLOAT; }          // eslint-disable-line
      throw new Error('unsupported typed array type');
    }

    const isArrayBuffer = typeof SharedArrayBuffer !== 'undefined'
      ? function isArrayBufferOrSharedArrayBuffer(a) {
        return a && a.buffer && (a.buffer instanceof ArrayBuffer || a.buffer instanceof SharedArrayBuffer);
      }
      : function isArrayBuffer(a) {
        return a && a.buffer && a.buffer instanceof ArrayBuffer;
      };

    function error(...args) {
      console.error(...args);
    }

    function isBuffer(gl, t) {
      return typeof WebGLBuffer !== 'undefined' && t instanceof WebGLBuffer;
    }

    function isShader(gl, t) {
      return typeof WebGLShader !== 'undefined' && t instanceof WebGLShader;
    }

    function isTexture(gl, t) {
      return typeof WebGLTexture !== 'undefined' && t instanceof WebGLTexture;
    }

    /*
     * Copyright 2019 Gregg Tavares
     *
     * Permission is hereby granted, free of charge, to any person obtaining a
     * copy of this software and associated documentation files (the "Software"),
     * to deal in the Software without restriction, including without limitation
     * the rights to use, copy, modify, merge, publish, distribute, sublicense,
     * and/or sell copies of the Software, and to permit persons to whom the
     * Software is furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
     * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
     * DEALINGS IN THE SOFTWARE.
     */

    const STATIC_DRAW                  = 0x88e4;
    const ARRAY_BUFFER                 = 0x8892;
    const ELEMENT_ARRAY_BUFFER         = 0x8893;
    const BUFFER_SIZE                  = 0x8764;

    const BYTE$1                         = 0x1400;
    const UNSIGNED_BYTE$1                = 0x1401;
    const SHORT$1                        = 0x1402;
    const UNSIGNED_SHORT$1               = 0x1403;
    const INT$1                          = 0x1404;
    const UNSIGNED_INT$1                 = 0x1405;
    const FLOAT$1                        = 0x1406;
    const defaults = {
      attribPrefix: "",
    };

    function setBufferFromTypedArray(gl, type, buffer, array, drawType) {
      gl.bindBuffer(type, buffer);
      gl.bufferData(type, array, drawType || STATIC_DRAW);
    }

    /**
     * Given typed array creates a WebGLBuffer and copies the typed array
     * into it.
     *
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext
     * @param {ArrayBuffer|SharedArrayBuffer|ArrayBufferView|WebGLBuffer} typedArray the typed array. Note: If a WebGLBuffer is passed in it will just be returned. No action will be taken
     * @param {number} [type] the GL bind type for the buffer. Default = `gl.ARRAY_BUFFER`.
     * @param {number} [drawType] the GL draw type for the buffer. Default = 'gl.STATIC_DRAW`.
     * @return {WebGLBuffer} the created WebGLBuffer
     * @memberOf module:twgl/attributes
     */
    function createBufferFromTypedArray(gl, typedArray, type, drawType) {
      if (isBuffer(gl, typedArray)) {
        return typedArray;
      }
      type = type || ARRAY_BUFFER;
      const buffer = gl.createBuffer();
      setBufferFromTypedArray(gl, type, buffer, typedArray, drawType);
      return buffer;
    }

    function isIndices(name) {
      return name === "indices";
    }

    // This is really just a guess. Though I can't really imagine using
    // anything else? Maybe for some compression?
    function getNormalizationForTypedArray(typedArray) {
      if (typedArray instanceof Int8Array)    { return true; }  // eslint-disable-line
      if (typedArray instanceof Uint8Array)   { return true; }  // eslint-disable-line
      return false;
    }

    // This is really just a guess. Though I can't really imagine using
    // anything else? Maybe for some compression?
    function getNormalizationForTypedArrayType(typedArrayType) {
      if (typedArrayType === Int8Array)    { return true; }  // eslint-disable-line
      if (typedArrayType === Uint8Array)   { return true; }  // eslint-disable-line
      return false;
    }

    function getArray(array) {
      return array.length ? array : array.data;
    }

    const texcoordRE = /coord|texture/i;
    const colorRE = /color|colour/i;

    function guessNumComponentsFromName(name, length) {
      let numComponents;
      if (texcoordRE.test(name)) {
        numComponents = 2;
      } else if (colorRE.test(name)) {
        numComponents = 4;
      } else {
        numComponents = 3;  // position, normals, indices ...
      }

      if (length % numComponents > 0) {
        throw new Error(`Can not guess numComponents for attribute '${name}'. Tried ${numComponents} but ${length} values is not evenly divisible by ${numComponents}. You should specify it.`);
      }

      return numComponents;
    }

    function getNumComponents(array, arrayName) {
      return array.numComponents || array.size || guessNumComponentsFromName(arrayName, getArray(array).length);
    }

    function makeTypedArray(array, name) {
      if (isArrayBuffer(array)) {
        return array;
      }

      if (isArrayBuffer(array.data)) {
        return array.data;
      }

      if (Array.isArray(array)) {
        array = {
          data: array,
        };
      }

      let Type = array.type;
      if (!Type) {
        if (isIndices(name)) {
          Type = Uint16Array;
        } else {
          Type = Float32Array;
        }
      }
      return new Type(array.data);
    }

    /**
     * The info for an attribute. This is effectively just the arguments to `gl.vertexAttribPointer` plus the WebGLBuffer
     * for the attribute.
     *
     * @typedef {Object} AttribInfo
     * @property {number[]|ArrayBufferView} [value] a constant value for the attribute. Note: if this is set the attribute will be
     *    disabled and set to this constant value and all other values will be ignored.
     * @property {number} [numComponents] the number of components for this attribute.
     * @property {number} [size] synonym for `numComponents`.
     * @property {number} [type] the type of the attribute (eg. `gl.FLOAT`, `gl.UNSIGNED_BYTE`, etc...) Default = `gl.FLOAT`
     * @property {boolean} [normalize] whether or not to normalize the data. Default = false
     * @property {number} [offset] offset into buffer in bytes. Default = 0
     * @property {number} [stride] the stride in bytes per element. Default = 0
     * @property {number} [divisor] the divisor in instances. Default = undefined. Note: undefined = don't call gl.vertexAttribDivisor
     *    where as anything else = do call it with this value
     * @property {WebGLBuffer} buffer the buffer that contains the data for this attribute
     * @property {number} [drawType] the draw type passed to gl.bufferData. Default = gl.STATIC_DRAW
     * @memberOf module:twgl
     */

    /**
     * Use this type of array spec when TWGL can't guess the type or number of components of an array
     * @typedef {Object} FullArraySpec
     * @property {number[]|ArrayBufferView} [value] a constant value for the attribute. Note: if this is set the attribute will be
     *    disabled and set to this constant value and all other values will be ignored.
     * @property {(number|number[]|ArrayBufferView)} data The data of the array. A number alone becomes the number of elements of type.
     * @property {number} [numComponents] number of components for `vertexAttribPointer`. Default is based on the name of the array.
     *    If `coord` is in the name assumes `numComponents = 2`.
     *    If `color` is in the name assumes `numComponents = 4`.
     *    otherwise assumes `numComponents = 3`
     * @property {constructor} [type] type. This is only used if `data` is a JavaScript array. It is the constructor for the typedarray. (eg. `Uint8Array`).
     * For example if you want colors in a `Uint8Array` you might have a `FullArraySpec` like `{ type: Uint8Array, data: [255,0,255,255, ...], }`.
     * @property {number} [size] synonym for `numComponents`.
     * @property {boolean} [normalize] normalize for `vertexAttribPointer`. Default is true if type is `Int8Array` or `Uint8Array` otherwise false.
     * @property {number} [stride] stride for `vertexAttribPointer`. Default = 0
     * @property {number} [offset] offset for `vertexAttribPointer`. Default = 0
     * @property {number} [divisor] divisor for `vertexAttribDivisor`. Default = undefined. Note: undefined = don't call gl.vertexAttribDivisor
     *    where as anything else = do call it with this value
     * @property {string} [attrib] name of attribute this array maps to. Defaults to same name as array prefixed by the default attribPrefix.
     * @property {string} [name] synonym for `attrib`.
     * @property {string} [attribName] synonym for `attrib`.
     * @property {WebGLBuffer} [buffer] Buffer to use for this attribute. This lets you use your own buffer
     *    but you will need to supply `numComponents` and `type`. You can effectively pass an `AttribInfo`
     *    to provide this. Example:
     *
     *         const bufferInfo1 = twgl.createBufferInfoFromArrays(gl, {
     *           position: [1, 2, 3, ... ],
     *         });
     *         const bufferInfo2 = twgl.createBufferInfoFromArrays(gl, {
     *           position: bufferInfo1.attribs.position,  // use the same buffer from bufferInfo1
     *         });
     *
     * @memberOf module:twgl
     */

    /**
     * An individual array in {@link module:twgl.Arrays}
     *
     * When passed to {@link module:twgl.createBufferInfoFromArrays} if an ArraySpec is `number[]` or `ArrayBufferView`
     * the types will be guessed based on the name. `indices` will be `Uint16Array`, everything else will
     * be `Float32Array`. If an ArraySpec is a number it's the number of floats for an empty (zeroed) buffer.
     *
     * @typedef {(number|number[]|ArrayBufferView|module:twgl.FullArraySpec)} ArraySpec
     * @memberOf module:twgl
     */

    /**
     * This is a JavaScript object of arrays by name. The names should match your shader's attributes. If your
     * attributes have a common prefix you can specify it by calling {@link module:twgl.setAttributePrefix}.
     *
     *     Bare JavaScript Arrays
     *
     *         var arrays = {
     *            position: [-1, 1, 0],
     *            normal: [0, 1, 0],
     *            ...
     *         }
     *
     *     Bare TypedArrays
     *
     *         var arrays = {
     *            position: new Float32Array([-1, 1, 0]),
     *            color: new Uint8Array([255, 128, 64, 255]),
     *            ...
     *         }
     *
     * *   Will guess at `numComponents` if not specified based on name.
     *
     *     If `coord` is in the name assumes `numComponents = 2`
     *
     *     If `color` is in the name assumes `numComponents = 4`
     *
     *     otherwise assumes `numComponents = 3`
     *
     * Objects with various fields. See {@link module:twgl.FullArraySpec}.
     *
     *     var arrays = {
     *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
     *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
     *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
     *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
     *     };
     *
     * @typedef {Object.<string, module:twgl.ArraySpec>} Arrays
     * @memberOf module:twgl
     */


    /**
     * Creates a set of attribute data and WebGLBuffers from set of arrays
     *
     * Given
     *
     *      var arrays = {
     *        position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
     *        texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
     *        normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
     *        color:    { numComponents: 4, data: [255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255], type: Uint8Array, },
     *        indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
     *      };
     *
     * returns something like
     *
     *      var attribs = {
     *        position: { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
     *        texcoord: { numComponents: 2, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
     *        normal:   { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
     *        color:    { numComponents: 4, type: gl.UNSIGNED_BYTE, normalize: true,  buffer: WebGLBuffer, },
     *      };
     *
     * notes:
     *
     * *   Arrays can take various forms
     *
     *     Bare JavaScript Arrays
     *
     *         var arrays = {
     *            position: [-1, 1, 0],
     *            normal: [0, 1, 0],
     *            ...
     *         }
     *
     *     Bare TypedArrays
     *
     *         var arrays = {
     *            position: new Float32Array([-1, 1, 0]),
     *            color: new Uint8Array([255, 128, 64, 255]),
     *            ...
     *         }
     *
     * *   Will guess at `numComponents` if not specified based on name.
     *
     *     If `coord` is in the name assumes `numComponents = 2`
     *
     *     If `color` is in the name assumes `numComponents = 4`
     *
     *     otherwise assumes `numComponents = 3`
     *
     * @param {WebGLRenderingContext} gl The webgl rendering context.
     * @param {module:twgl.Arrays} arrays The arrays
     * @param {module:twgl.BufferInfo} [srcBufferInfo] a BufferInfo to copy from
     *   This lets you share buffers. Any arrays you supply will override
     *   the buffers from srcBufferInfo.
     * @return {Object.<string, module:twgl.AttribInfo>} the attribs
     * @memberOf module:twgl/attributes
     */
    function createAttribsFromArrays(gl, arrays) {
      const attribs = {};
      Object.keys(arrays).forEach(function(arrayName) {
        if (!isIndices(arrayName)) {
          const array = arrays[arrayName];
          const attribName = array.attrib || array.name || array.attribName || (defaults.attribPrefix + arrayName);
          if (array.value) {
            if (!Array.isArray(array.value) && !isArrayBuffer(array.value)) {
              throw new Error('array.value is not array or typedarray');
            }
            attribs[attribName] = {
              value: array.value,
            };
          } else {
            let buffer;
            let type;
            let normalization;
            let numComponents;
            if (array.buffer && array.buffer instanceof WebGLBuffer) {
              buffer = array.buffer;
              numComponents = array.numComponents || array.size;
              type = array.type;
              normalization = array.normalize;
            } else if (typeof array === "number" || typeof array.data === "number") {
              const numValues = array.data || array;
              const arrayType = array.type || Float32Array;
              const numBytes = numValues * arrayType.BYTES_PER_ELEMENT;
              type = getGLTypeForTypedArrayType(arrayType);
              normalization = array.normalize !== undefined ? array.normalize : getNormalizationForTypedArrayType(arrayType);
              numComponents = array.numComponents || array.size || guessNumComponentsFromName(arrayName, numValues);
              buffer = gl.createBuffer();
              gl.bindBuffer(ARRAY_BUFFER, buffer);
              gl.bufferData(ARRAY_BUFFER, numBytes, array.drawType || STATIC_DRAW);
            } else {
              const typedArray = makeTypedArray(array, arrayName);
              buffer = createBufferFromTypedArray(gl, typedArray, undefined, array.drawType);
              type = getGLTypeForTypedArray(typedArray);
              normalization = array.normalize !== undefined ? array.normalize : getNormalizationForTypedArray(typedArray);
              numComponents = getNumComponents(array, arrayName);
            }
            attribs[attribName] = {
              buffer:        buffer,
              numComponents: numComponents,
              type:          type,
              normalize:     normalization,
              stride:        array.stride || 0,
              offset:        array.offset || 0,
              divisor:       array.divisor === undefined ? undefined : array.divisor,
              drawType:      array.drawType,
            };
          }
        }
      });
      gl.bindBuffer(ARRAY_BUFFER, null);
      return attribs;
    }

    function getBytesPerValueForGLType(gl, type) {
      if (type === BYTE$1)           return 1;  // eslint-disable-line
      if (type === UNSIGNED_BYTE$1)  return 1;  // eslint-disable-line
      if (type === SHORT$1)          return 2;  // eslint-disable-line
      if (type === UNSIGNED_SHORT$1) return 2;  // eslint-disable-line
      if (type === INT$1)            return 4;  // eslint-disable-line
      if (type === UNSIGNED_INT$1)   return 4;  // eslint-disable-line
      if (type === FLOAT$1)          return 4;  // eslint-disable-line
      return 0;
    }

    // Tries to get the number of elements from a set of arrays.
    const positionKeys = ['position', 'positions', 'a_position'];

    function getNumElementsFromAttributes(gl, attribs) {
      let key;
      let ii;
      for (ii = 0; ii < positionKeys.length; ++ii) {
        key = positionKeys[ii];
        if (key in attribs) {
          break;
        }
        key = defaults.attribPrefix + key;
        if (key in attribs) {
          break;
        }
      }
      if (ii === positionKeys.length) {
        key = Object.keys(attribs)[0];
      }
      const attrib = attribs[key];
      gl.bindBuffer(ARRAY_BUFFER, attrib.buffer);
      const numBytes = gl.getBufferParameter(ARRAY_BUFFER, BUFFER_SIZE);
      gl.bindBuffer(ARRAY_BUFFER, null);

      const bytesPerValue = getBytesPerValueForGLType(gl, attrib.type);
      const totalElements = numBytes / bytesPerValue;
      const numComponents = attrib.numComponents || attrib.size;
      // TODO: check stride
      const numElements = totalElements / numComponents;
      if (numElements % 1 !== 0) {
        throw new Error(`numComponents ${numComponents} not correct for length ${length}`);
      }
      return numElements;
    }

    /**
     * @typedef {Object} BufferInfo
     * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
     * @property {number} [elementType] The type of indices `UNSIGNED_BYTE`, `UNSIGNED_SHORT` etc..
     * @property {WebGLBuffer} [indices] The indices `ELEMENT_ARRAY_BUFFER` if any indices exist.
     * @property {Object.<string, module:twgl.AttribInfo>} [attribs] The attribs appropriate to call `setAttributes`
     * @memberOf module:twgl
     */

    /**
     * Creates a BufferInfo from an object of arrays.
     *
     * This can be passed to {@link module:twgl.setBuffersAndAttributes} and to
     * {@link module:twgl:drawBufferInfo}.
     *
     * Given an object like
     *
     *     var arrays = {
     *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
     *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
     *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
     *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
     *     };
     *
     *  Creates an BufferInfo like this
     *
     *     bufferInfo = {
     *       numElements: 4,        // or whatever the number of elements is
     *       indices: WebGLBuffer,  // this property will not exist if there are no indices
     *       attribs: {
     *         position: { buffer: WebGLBuffer, numComponents: 3, },
     *         normal:   { buffer: WebGLBuffer, numComponents: 3, },
     *         texcoord: { buffer: WebGLBuffer, numComponents: 2, },
     *       },
     *     };
     *
     *  The properties of arrays can be JavaScript arrays in which case the number of components
     *  will be guessed.
     *
     *     var arrays = {
     *        position: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0],
     *        texcoord: [0, 0, 0, 1, 1, 0, 1, 1],
     *        normal:   [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
     *        indices:  [0, 1, 2, 1, 2, 3],
     *     };
     *
     *  They can also be TypedArrays
     *
     *     var arrays = {
     *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
     *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
     *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
     *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
     *     };
     *
     *  Or AugmentedTypedArrays
     *
     *     var positions = createAugmentedTypedArray(3, 4);
     *     var texcoords = createAugmentedTypedArray(2, 4);
     *     var normals   = createAugmentedTypedArray(3, 4);
     *     var indices   = createAugmentedTypedArray(3, 2, Uint16Array);
     *
     *     positions.push([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]);
     *     texcoords.push([0, 0, 0, 1, 1, 0, 1, 1]);
     *     normals.push([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
     *     indices.push([0, 1, 2, 1, 2, 3]);
     *
     *     var arrays = {
     *        position: positions,
     *        texcoord: texcoords,
     *        normal:   normals,
     *        indices:  indices,
     *     };
     *
     * For the last example it is equivalent to
     *
     *     var bufferInfo = {
     *       attribs: {
     *         position: { numComponents: 3, buffer: gl.createBuffer(), },
     *         texcoord: { numComponents: 2, buffer: gl.createBuffer(), },
     *         normal: { numComponents: 3, buffer: gl.createBuffer(), },
     *       },
     *       indices: gl.createBuffer(),
     *       numElements: 6,
     *     };
     *
     *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.position.buffer);
     *     gl.bufferData(gl.ARRAY_BUFFER, arrays.position, gl.STATIC_DRAW);
     *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.texcoord.buffer);
     *     gl.bufferData(gl.ARRAY_BUFFER, arrays.texcoord, gl.STATIC_DRAW);
     *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.normal.buffer);
     *     gl.bufferData(gl.ARRAY_BUFFER, arrays.normal, gl.STATIC_DRAW);
     *     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices);
     *     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indices, gl.STATIC_DRAW);
     *
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext
     * @param {module:twgl.Arrays} arrays Your data
     * @param {module:twgl.BufferInfo} [srcBufferInfo] An existing
     *        buffer info to start from. WebGLBuffers etc specified
     *        in the srcBufferInfo will be used in a new BufferInfo
     *        with any arrays specified overriding the ones in
     *        srcBufferInfo.
     * @return {module:twgl.BufferInfo} A BufferInfo
     * @memberOf module:twgl/attributes
     */
    function createBufferInfoFromArrays(gl, arrays, srcBufferInfo) {
      const newAttribs = createAttribsFromArrays(gl, arrays);
      const bufferInfo = Object.assign({}, srcBufferInfo ? srcBufferInfo : {});
      bufferInfo.attribs = Object.assign({}, srcBufferInfo ? srcBufferInfo.attribs : {}, newAttribs);
      const indices = arrays.indices;
      if (indices) {
        const newIndices = makeTypedArray(indices, "indices");
        bufferInfo.indices = createBufferFromTypedArray(gl, newIndices, ELEMENT_ARRAY_BUFFER);
        bufferInfo.numElements = newIndices.length;
        bufferInfo.elementType = getGLTypeForTypedArray(newIndices);
      } else if (!bufferInfo.numElements) {
        bufferInfo.numElements = getNumElementsFromAttributes(gl, bufferInfo.attribs);
      }

      return bufferInfo;
    }

    /*
     * Copyright 2019 Gregg Tavares
     *
     * Permission is hereby granted, free of charge, to any person obtaining a
     * copy of this software and associated documentation files (the "Software"),
     * to deal in the Software without restriction, including without limitation
     * the rights to use, copy, modify, merge, publish, distribute, sublicense,
     * and/or sell copies of the Software, and to permit persons to whom the
     * Software is furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
     * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
     * DEALINGS IN THE SOFTWARE.
     */

    /**
     * Gets the gl version as a number
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext
     * @return {number} version of gl
     * @private
     */
    //function getVersionAsNumber(gl) {
    //  return parseFloat(gl.getParameter(gl.VERSION).substr(6));
    //}

    /**
     * Check if context is WebGL 2.0
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext
     * @return {bool} true if it's WebGL 2.0
     * @memberOf module:twgl
     */
    function isWebGL2(gl) {
      // This is the correct check but it's slow
      //  return gl.getParameter(gl.VERSION).indexOf("WebGL 2.0") === 0;
      // This might also be the correct check but I'm assuming it's slow-ish
      // return gl instanceof WebGL2RenderingContext;
      return !!gl.texStorage2D;
    }

    /*
     * Copyright 2019 Gregg Tavares
     *
     * Permission is hereby granted, free of charge, to any person obtaining a
     * copy of this software and associated documentation files (the "Software"),
     * to deal in the Software without restriction, including without limitation
     * the rights to use, copy, modify, merge, publish, distribute, sublicense,
     * and/or sell copies of the Software, and to permit persons to whom the
     * Software is furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
     * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
     * DEALINGS IN THE SOFTWARE.
     */

    /**
     * Low level shader program related functions
     *
     * You should generally not need to use these functions. They are provided
     * for those cases where you're doing something out of the ordinary
     * and you need lower level access.
     *
     * For backward compatibility they are available at both `twgl.programs` and `twgl`
     * itself
     *
     * See {@link module:twgl} for core functions
     *
     * @module twgl/programs
     */

    const error$1 = error;
    function getElementById(id) {
      return (typeof document !== 'undefined' && document.getElementById)
          ? document.getElementById(id)
          : null;
    }

    const TEXTURE0                       = 0x84c0;

    const ARRAY_BUFFER$1                   = 0x8892;
    const ELEMENT_ARRAY_BUFFER$1           = 0x8893;

    const COMPILE_STATUS                 = 0x8b81;
    const LINK_STATUS                    = 0x8b82;
    const FRAGMENT_SHADER                = 0x8b30;
    const VERTEX_SHADER                  = 0x8b31;
    const SEPARATE_ATTRIBS               = 0x8c8d;

    const ACTIVE_UNIFORMS                = 0x8b86;
    const ACTIVE_ATTRIBUTES              = 0x8b89;
    const TRANSFORM_FEEDBACK_VARYINGS    = 0x8c83;
    const ACTIVE_UNIFORM_BLOCKS          = 0x8a36;
    const UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER   = 0x8a44;
    const UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER = 0x8a46;
    const UNIFORM_BLOCK_DATA_SIZE                     = 0x8a40;
    const UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES        = 0x8a43;

    const FLOAT$3                         = 0x1406;
    const FLOAT_VEC2                    = 0x8B50;
    const FLOAT_VEC3                    = 0x8B51;
    const FLOAT_VEC4                    = 0x8B52;
    const INT$3                           = 0x1404;
    const INT_VEC2                      = 0x8B53;
    const INT_VEC3                      = 0x8B54;
    const INT_VEC4                      = 0x8B55;
    const BOOL                          = 0x8B56;
    const BOOL_VEC2                     = 0x8B57;
    const BOOL_VEC3                     = 0x8B58;
    const BOOL_VEC4                     = 0x8B59;
    const FLOAT_MAT2                    = 0x8B5A;
    const FLOAT_MAT3                    = 0x8B5B;
    const FLOAT_MAT4                    = 0x8B5C;
    const SAMPLER_2D                    = 0x8B5E;
    const SAMPLER_CUBE                  = 0x8B60;
    const SAMPLER_3D                    = 0x8B5F;
    const SAMPLER_2D_SHADOW             = 0x8B62;
    const FLOAT_MAT2x3                  = 0x8B65;
    const FLOAT_MAT2x4                  = 0x8B66;
    const FLOAT_MAT3x2                  = 0x8B67;
    const FLOAT_MAT3x4                  = 0x8B68;
    const FLOAT_MAT4x2                  = 0x8B69;
    const FLOAT_MAT4x3                  = 0x8B6A;
    const SAMPLER_2D_ARRAY              = 0x8DC1;
    const SAMPLER_2D_ARRAY_SHADOW       = 0x8DC4;
    const SAMPLER_CUBE_SHADOW           = 0x8DC5;
    const UNSIGNED_INT$3                  = 0x1405;
    const UNSIGNED_INT_VEC2             = 0x8DC6;
    const UNSIGNED_INT_VEC3             = 0x8DC7;
    const UNSIGNED_INT_VEC4             = 0x8DC8;
    const INT_SAMPLER_2D                = 0x8DCA;
    const INT_SAMPLER_3D                = 0x8DCB;
    const INT_SAMPLER_CUBE              = 0x8DCC;
    const INT_SAMPLER_2D_ARRAY          = 0x8DCF;
    const UNSIGNED_INT_SAMPLER_2D       = 0x8DD2;
    const UNSIGNED_INT_SAMPLER_3D       = 0x8DD3;
    const UNSIGNED_INT_SAMPLER_CUBE     = 0x8DD4;
    const UNSIGNED_INT_SAMPLER_2D_ARRAY = 0x8DD7;

    const TEXTURE_2D$1                    = 0x0DE1;
    const TEXTURE_CUBE_MAP$1              = 0x8513;
    const TEXTURE_3D$1                    = 0x806F;
    const TEXTURE_2D_ARRAY$1              = 0x8C1A;

    const typeMap = {};

    /**
     * Returns the corresponding bind point for a given sampler type
     */
    function getBindPointForSamplerType(gl, type) {
      return typeMap[type].bindPoint;
    }

    // This kind of sucks! If you could compose functions as in `var fn = gl[name];`
    // this code could be a lot smaller but that is sadly really slow (T_T)

    function floatSetter(gl, location) {
      return function(v) {
        gl.uniform1f(location, v);
      };
    }

    function floatArraySetter(gl, location) {
      return function(v) {
        gl.uniform1fv(location, v);
      };
    }

    function floatVec2Setter(gl, location) {
      return function(v) {
        gl.uniform2fv(location, v);
      };
    }

    function floatVec3Setter(gl, location) {
      return function(v) {
        gl.uniform3fv(location, v);
      };
    }

    function floatVec4Setter(gl, location) {
      return function(v) {
        gl.uniform4fv(location, v);
      };
    }

    function intSetter(gl, location) {
      return function(v) {
        gl.uniform1i(location, v);
      };
    }

    function intArraySetter(gl, location) {
      return function(v) {
        gl.uniform1iv(location, v);
      };
    }

    function intVec2Setter(gl, location) {
      return function(v) {
        gl.uniform2iv(location, v);
      };
    }

    function intVec3Setter(gl, location) {
      return function(v) {
        gl.uniform3iv(location, v);
      };
    }

    function intVec4Setter(gl, location) {
      return function(v) {
        gl.uniform4iv(location, v);
      };
    }

    function uintSetter(gl, location) {
      return function(v) {
        gl.uniform1ui(location, v);
      };
    }

    function uintArraySetter(gl, location) {
      return function(v) {
        gl.uniform1uiv(location, v);
      };
    }

    function uintVec2Setter(gl, location) {
      return function(v) {
        gl.uniform2uiv(location, v);
      };
    }

    function uintVec3Setter(gl, location) {
      return function(v) {
        gl.uniform3uiv(location, v);
      };
    }

    function uintVec4Setter(gl, location) {
      return function(v) {
        gl.uniform4uiv(location, v);
      };
    }

    function floatMat2Setter(gl, location) {
      return function(v) {
        gl.uniformMatrix2fv(location, false, v);
      };
    }

    function floatMat3Setter(gl, location) {
      return function(v) {
        gl.uniformMatrix3fv(location, false, v);
      };
    }

    function floatMat4Setter(gl, location) {
      return function(v) {
        gl.uniformMatrix4fv(location, false, v);
      };
    }

    function floatMat23Setter(gl, location) {
      return function(v) {
        gl.uniformMatrix2x3fv(location, false, v);
      };
    }

    function floatMat32Setter(gl, location) {
      return function(v) {
        gl.uniformMatrix3x2fv(location, false, v);
      };
    }

    function floatMat24Setter(gl, location) {
      return function(v) {
        gl.uniformMatrix2x4fv(location, false, v);
      };
    }

    function floatMat42Setter(gl, location) {
      return function(v) {
        gl.uniformMatrix4x2fv(location, false, v);
      };
    }

    function floatMat34Setter(gl, location) {
      return function(v) {
        gl.uniformMatrix3x4fv(location, false, v);
      };
    }

    function floatMat43Setter(gl, location) {
      return function(v) {
        gl.uniformMatrix4x3fv(location, false, v);
      };
    }

    function samplerSetter(gl, type, unit, location) {
      const bindPoint = getBindPointForSamplerType(gl, type);
      return isWebGL2(gl) ? function(textureOrPair) {
        let texture;
        let sampler;
        if (isTexture(gl, textureOrPair)) {
          texture = textureOrPair;
          sampler = null;
        } else {
          texture = textureOrPair.texture;
          sampler = textureOrPair.sampler;
        }
        gl.uniform1i(location, unit);
        gl.activeTexture(TEXTURE0 + unit);
        gl.bindTexture(bindPoint, texture);
        gl.bindSampler(unit, sampler);
      } : function(texture) {
        gl.uniform1i(location, unit);
        gl.activeTexture(TEXTURE0 + unit);
        gl.bindTexture(bindPoint, texture);
      };
    }

    function samplerArraySetter(gl, type, unit, location, size) {
      const bindPoint = getBindPointForSamplerType(gl, type);
      const units = new Int32Array(size);
      for (let ii = 0; ii < size; ++ii) {
        units[ii] = unit + ii;
      }

      return isWebGL2(gl) ? function(textures) {
        gl.uniform1iv(location, units);
        textures.forEach(function(textureOrPair, index) {
          gl.activeTexture(TEXTURE0 + units[index]);
          let texture;
          let sampler;
          if (isTexture(gl, textureOrPair)) {
            texture = textureOrPair;
            sampler = null;
          } else {
            texture = textureOrPair.texture;
            sampler = textureOrPair.sampler;
          }
          gl.bindSampler(unit, sampler);
          gl.bindTexture(bindPoint, texture);
        });
      } : function(textures) {
        gl.uniform1iv(location, units);
        textures.forEach(function(texture, index) {
          gl.activeTexture(TEXTURE0 + units[index]);
          gl.bindTexture(bindPoint, texture);
        });
      };
    }

    typeMap[FLOAT$3]                         = { Type: Float32Array, size:  4, setter: floatSetter,      arraySetter: floatArraySetter, };
    typeMap[FLOAT_VEC2]                    = { Type: Float32Array, size:  8, setter: floatVec2Setter,  };
    typeMap[FLOAT_VEC3]                    = { Type: Float32Array, size: 12, setter: floatVec3Setter,  };
    typeMap[FLOAT_VEC4]                    = { Type: Float32Array, size: 16, setter: floatVec4Setter,  };
    typeMap[INT$3]                           = { Type: Int32Array,   size:  4, setter: intSetter,        arraySetter: intArraySetter, };
    typeMap[INT_VEC2]                      = { Type: Int32Array,   size:  8, setter: intVec2Setter,    };
    typeMap[INT_VEC3]                      = { Type: Int32Array,   size: 12, setter: intVec3Setter,    };
    typeMap[INT_VEC4]                      = { Type: Int32Array,   size: 16, setter: intVec4Setter,    };
    typeMap[UNSIGNED_INT$3]                  = { Type: Uint32Array,  size:  4, setter: uintSetter,       arraySetter: uintArraySetter, };
    typeMap[UNSIGNED_INT_VEC2]             = { Type: Uint32Array,  size:  8, setter: uintVec2Setter,   };
    typeMap[UNSIGNED_INT_VEC3]             = { Type: Uint32Array,  size: 12, setter: uintVec3Setter,   };
    typeMap[UNSIGNED_INT_VEC4]             = { Type: Uint32Array,  size: 16, setter: uintVec4Setter,   };
    typeMap[BOOL]                          = { Type: Uint32Array,  size:  4, setter: intSetter,        arraySetter: intArraySetter, };
    typeMap[BOOL_VEC2]                     = { Type: Uint32Array,  size:  8, setter: intVec2Setter,    };
    typeMap[BOOL_VEC3]                     = { Type: Uint32Array,  size: 12, setter: intVec3Setter,    };
    typeMap[BOOL_VEC4]                     = { Type: Uint32Array,  size: 16, setter: intVec4Setter,    };
    typeMap[FLOAT_MAT2]                    = { Type: Float32Array, size: 16, setter: floatMat2Setter,  };
    typeMap[FLOAT_MAT3]                    = { Type: Float32Array, size: 36, setter: floatMat3Setter,  };
    typeMap[FLOAT_MAT4]                    = { Type: Float32Array, size: 64, setter: floatMat4Setter,  };
    typeMap[FLOAT_MAT2x3]                  = { Type: Float32Array, size: 24, setter: floatMat23Setter, };
    typeMap[FLOAT_MAT2x4]                  = { Type: Float32Array, size: 32, setter: floatMat24Setter, };
    typeMap[FLOAT_MAT3x2]                  = { Type: Float32Array, size: 24, setter: floatMat32Setter, };
    typeMap[FLOAT_MAT3x4]                  = { Type: Float32Array, size: 48, setter: floatMat34Setter, };
    typeMap[FLOAT_MAT4x2]                  = { Type: Float32Array, size: 32, setter: floatMat42Setter, };
    typeMap[FLOAT_MAT4x3]                  = { Type: Float32Array, size: 48, setter: floatMat43Setter, };
    typeMap[SAMPLER_2D]                    = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D$1,       };
    typeMap[SAMPLER_CUBE]                  = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP$1, };
    typeMap[SAMPLER_3D]                    = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D$1,       };
    typeMap[SAMPLER_2D_SHADOW]             = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D$1,       };
    typeMap[SAMPLER_2D_ARRAY]              = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY$1, };
    typeMap[SAMPLER_2D_ARRAY_SHADOW]       = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY$1, };
    typeMap[SAMPLER_CUBE_SHADOW]           = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP$1, };
    typeMap[INT_SAMPLER_2D]                = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D$1,       };
    typeMap[INT_SAMPLER_3D]                = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D$1,       };
    typeMap[INT_SAMPLER_CUBE]              = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP$1, };
    typeMap[INT_SAMPLER_2D_ARRAY]          = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY$1, };
    typeMap[UNSIGNED_INT_SAMPLER_2D]       = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D$1,       };
    typeMap[UNSIGNED_INT_SAMPLER_3D]       = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D$1,       };
    typeMap[UNSIGNED_INT_SAMPLER_CUBE]     = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP$1, };
    typeMap[UNSIGNED_INT_SAMPLER_2D_ARRAY] = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY$1, };

    function floatAttribSetter(gl, index) {
      return function(b) {
        if (b.value) {
          gl.disableVertexAttribArray(index);
          switch (b.value.length) {
            case 4:
              gl.vertexAttrib4fv(index, b.value);
              break;
            case 3:
              gl.vertexAttrib3fv(index, b.value);
              break;
            case 2:
              gl.vertexAttrib2fv(index, b.value);
              break;
            case 1:
              gl.vertexAttrib1fv(index, b.value);
              break;
            default:
              throw new Error('the length of a float constant value must be between 1 and 4!');
          }
        } else {
          gl.bindBuffer(ARRAY_BUFFER$1, b.buffer);
          gl.enableVertexAttribArray(index);
          gl.vertexAttribPointer(
              index, b.numComponents || b.size, b.type || FLOAT$3, b.normalize || false, b.stride || 0, b.offset || 0);
          if (b.divisor !== undefined) {
            gl.vertexAttribDivisor(index, b.divisor);
          }
        }
      };
    }

    function intAttribSetter(gl, index) {
      return function(b) {
        if (b.value) {
          gl.disableVertexAttribArray(index);
          if (b.value.length === 4) {
            gl.vertexAttrib4iv(index, b.value);
          } else {
            throw new Error('The length of an integer constant value must be 4!');
          }
        } else {
          gl.bindBuffer(ARRAY_BUFFER$1, b.buffer);
          gl.enableVertexAttribArray(index);
          gl.vertexAttribIPointer(
              index, b.numComponents || b.size, b.type || INT$3, b.stride || 0, b.offset || 0);
          if (b.divisor !== undefined) {
            gl.vertexAttribDivisor(index, b.divisor);
          }
        }
      };
    }

    function uintAttribSetter(gl, index) {
      return function(b) {
        if (b.value) {
          gl.disableVertexAttribArray(index);
          if (b.value.length === 4) {
            gl.vertexAttrib4uiv(index, b.value);
          } else {
            throw new Error('The length of an unsigned integer constant value must be 4!');
          }
        } else {
          gl.bindBuffer(ARRAY_BUFFER$1, b.buffer);
          gl.enableVertexAttribArray(index);
          gl.vertexAttribIPointer(
              index, b.numComponents || b.size, b.type || UNSIGNED_INT$3, b.stride || 0, b.offset || 0);
          if (b.divisor !== undefined) {
            gl.vertexAttribDivisor(index, b.divisor);
          }
        }
      };
    }

    function matAttribSetter(gl, index, typeInfo) {
      const defaultSize = typeInfo.size;
      const count = typeInfo.count;

      return function(b) {
        gl.bindBuffer(ARRAY_BUFFER$1, b.buffer);
        const numComponents = b.size || b.numComponents || defaultSize;
        const size = numComponents / count;
        const type = b.type || FLOAT$3;
        const typeInfo = typeMap[type];
        const stride = typeInfo.size * numComponents;
        const normalize = b.normalize || false;
        const offset = b.offset || 0;
        const rowOffset = stride / count;
        for (let i = 0; i < count; ++i) {
          gl.enableVertexAttribArray(index + i);
          gl.vertexAttribPointer(
              index + i, size, type, normalize, stride, offset + rowOffset * i);
          if (b.divisor !== undefined) {
            gl.vertexAttribDivisor(index + i, b.divisor);
          }
        }
      };
    }



    const attrTypeMap = {};
    attrTypeMap[FLOAT$3]             = { size:  4, setter: floatAttribSetter, };
    attrTypeMap[FLOAT_VEC2]        = { size:  8, setter: floatAttribSetter, };
    attrTypeMap[FLOAT_VEC3]        = { size: 12, setter: floatAttribSetter, };
    attrTypeMap[FLOAT_VEC4]        = { size: 16, setter: floatAttribSetter, };
    attrTypeMap[INT$3]               = { size:  4, setter: intAttribSetter,   };
    attrTypeMap[INT_VEC2]          = { size:  8, setter: intAttribSetter,   };
    attrTypeMap[INT_VEC3]          = { size: 12, setter: intAttribSetter,   };
    attrTypeMap[INT_VEC4]          = { size: 16, setter: intAttribSetter,   };
    attrTypeMap[UNSIGNED_INT$3]      = { size:  4, setter: uintAttribSetter,  };
    attrTypeMap[UNSIGNED_INT_VEC2] = { size:  8, setter: uintAttribSetter,  };
    attrTypeMap[UNSIGNED_INT_VEC3] = { size: 12, setter: uintAttribSetter,  };
    attrTypeMap[UNSIGNED_INT_VEC4] = { size: 16, setter: uintAttribSetter,  };
    attrTypeMap[BOOL]              = { size:  4, setter: intAttribSetter,   };
    attrTypeMap[BOOL_VEC2]         = { size:  8, setter: intAttribSetter,   };
    attrTypeMap[BOOL_VEC3]         = { size: 12, setter: intAttribSetter,   };
    attrTypeMap[BOOL_VEC4]         = { size: 16, setter: intAttribSetter,   };
    attrTypeMap[FLOAT_MAT2]        = { size:  4, setter: matAttribSetter,   count: 2, };
    attrTypeMap[FLOAT_MAT3]        = { size:  9, setter: matAttribSetter,   count: 3, };
    attrTypeMap[FLOAT_MAT4]        = { size: 16, setter: matAttribSetter,   count: 4, };

    /**
     * Error Callback
     * @callback ErrorCallback
     * @param {string} msg error message.
     * @param {number} [lineOffset] amount to add to line number
     * @memberOf module:twgl
     */

    function addLineNumbers(src, lineOffset) {
      lineOffset = lineOffset || 0;
      ++lineOffset;

      return src.split("\n").map(function(line, ndx) {
        return (ndx + lineOffset) + ": " + line;
      }).join("\n");
    }

    const spaceRE = /^[ \t]*\n/;

    /**
     * Loads a shader.
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
     * @param {string} shaderSource The shader source.
     * @param {number} shaderType The type of shader.
     * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors.
     * @return {WebGLShader} The created shader.
     * @private
     */
    function loadShader(gl, shaderSource, shaderType, opt_errorCallback) {
      const errFn = opt_errorCallback || error$1;
      // Create the shader object
      const shader = gl.createShader(shaderType);

      // Remove the first end of line because WebGL 2.0 requires
      // #version 300 es
      // as the first line. No whitespace allowed before that line
      // so
      //
      // <script>
      // #version 300 es
      // </script>
      //
      // Has one line before it which is invalid according to GLSL ES 3.00
      //
      let lineOffset = 0;
      if (spaceRE.test(shaderSource)) {
        lineOffset = 1;
        shaderSource = shaderSource.replace(spaceRE, '');
      }

      // Load the shader source
      gl.shaderSource(shader, shaderSource);

      // Compile the shader
      gl.compileShader(shader);

      // Check the compile status
      const compiled = gl.getShaderParameter(shader, COMPILE_STATUS);
      if (!compiled) {
        // Something went wrong during compilation; get the error
        const lastError = gl.getShaderInfoLog(shader);
        errFn(addLineNumbers(shaderSource, lineOffset) + "\n*** Error compiling shader: " + lastError);
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    /**
     * @typedef {Object} ProgramOptions
     * @property {function(string)} [errorCallback] callback for errors
     * @property {Object.<string,number>} [attribLocations] a attribute name to location map
     * @property {(module:twgl.BufferInfo|Object.<string,module:twgl.AttribInfo>|string[])} [transformFeedbackVaryings] If passed
     *   a BufferInfo will use the attribs names inside. If passed an object of AttribInfos will use the names from that object. Otherwise
     *   you can pass an array of names.
     * @property {number} [transformFeedbackMode] the mode to pass `gl.transformFeedbackVaryings`. Defaults to `SEPARATE_ATTRIBS`.
     * @memberOf module:twgl
     */

    /**
     * Gets the program options based on all these optional arguments
     * @param {module:twgl.ProgramOptions|string[]} [opt_attribs] Options for the program or an array of attribs names. Locations will be assigned by index if not passed in
     * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
     * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
     *        on error. If you want something else pass an callback. It's passed an error message.
     * @return {module:twgl.ProgramOptions} an instance of ProgramOptions based on the arguments passed in
     * @private
     */
    function getProgramOptions(opt_attribs, opt_locations, opt_errorCallback) {
      let transformFeedbackVaryings;
      let transformFeedbackMode;
      if (typeof opt_locations === 'function') {
        opt_errorCallback = opt_locations;
        opt_locations = undefined;
      }
      if (typeof opt_attribs === 'function') {
        opt_errorCallback = opt_attribs;
        opt_attribs = undefined;
      } else if (opt_attribs && !Array.isArray(opt_attribs)) {
        // If we have an errorCallback we can just return this object
        // Otherwise we need to construct one with default errorCallback
        if (opt_attribs.errorCallback) {
          return opt_attribs;
        }
        const opt = opt_attribs;
        opt_errorCallback = opt.errorCallback;
        opt_attribs = opt.attribLocations;
        transformFeedbackVaryings = opt.transformFeedbackVaryings;
        transformFeedbackMode = opt.transformFeedbackMode;
      }

      const options = {
        errorCallback: opt_errorCallback || error$1,
        transformFeedbackVaryings: transformFeedbackVaryings,
        transformFeedbackMode: transformFeedbackMode,
      };

      if (opt_attribs) {
        let attribLocations = {};
        if (Array.isArray(opt_attribs)) {
          opt_attribs.forEach(function(attrib,  ndx) {
            attribLocations[attrib] = opt_locations ? opt_locations[ndx] : ndx;
          });
        } else {
          attribLocations = opt_attribs;
        }
        options.attribLocations = attribLocations;
      }

      return options;
    }

    const defaultShaderType = [
      "VERTEX_SHADER",
      "FRAGMENT_SHADER",
    ];

    function getShaderTypeFromScriptType(gl, scriptType) {
      if (scriptType.indexOf("frag") >= 0) {
        return FRAGMENT_SHADER;
      } else if (scriptType.indexOf("vert") >= 0) {
        return VERTEX_SHADER;
      }
      return undefined;
    }

    function deleteShaders(gl, shaders) {
      shaders.forEach(function(shader) {
        gl.deleteShader(shader);
      });
    }

    /**
     * Creates a program, attaches (and/or compiles) shaders, binds attrib locations, links the
     * program and calls useProgram.
     *
     * NOTE: There are 4 signatures for this function
     *
     *     twgl.createProgram(gl, [vs, fs], options);
     *     twgl.createProgram(gl, [vs, fs], opt_errFunc);
     *     twgl.createProgram(gl, [vs, fs], opt_attribs, opt_errFunc);
     *     twgl.createProgram(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
     * @param {WebGLShader[]|string[]} shaders The shaders to attach, or element ids for their source, or strings that contain their source
     * @param {module:twgl.ProgramOptions|string[]|module:twgl.ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
     * @param {number[]} [opt_locations|module:twgl.ErrorCallback] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
     * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
     *        on error. If you want something else pass an callback. It's passed an error message.
     * @return {WebGLProgram?} the created program or null if error.
     * @memberOf module:twgl/programs
     */
    function createProgram(
        gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
      const progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
      const realShaders = [];
      const newShaders = [];
      for (let ndx = 0; ndx < shaders.length; ++ndx) {
        let shader = shaders[ndx];
        if (typeof (shader) === 'string') {
          const elem = getElementById(shader);
          const src = elem ? elem.text : shader;
          let type = gl[defaultShaderType[ndx]];
          if (elem && elem.type) {
            type = getShaderTypeFromScriptType(gl, elem.type) || type;
          }
          shader = loadShader(gl, src, type, progOptions.errorCallback);
          newShaders.push(shader);
        }
        if (isShader(gl, shader)) {
          realShaders.push(shader);
        }
      }

      if (realShaders.length !== shaders.length) {
        progOptions.errorCallback("not enough shaders for program");
        deleteShaders(gl, newShaders);
        return null;
      }

      const program = gl.createProgram();
      realShaders.forEach(function(shader) {
        gl.attachShader(program, shader);
      });
      if (progOptions.attribLocations) {
        Object.keys(progOptions.attribLocations).forEach(function(attrib) {
          gl.bindAttribLocation(program, progOptions.attribLocations[attrib], attrib);
        });
      }
      let varyings = progOptions.transformFeedbackVaryings;
      if (varyings) {
        if (varyings.attribs) {
          varyings = varyings.attribs;
        }
        if (!Array.isArray(varyings)) {
          varyings = Object.keys(varyings);
        }
        gl.transformFeedbackVaryings(program, varyings, progOptions.transformFeedbackMode || SEPARATE_ATTRIBS);
      }
      gl.linkProgram(program);

      // Check the link status
      const linked = gl.getProgramParameter(program, LINK_STATUS);
      if (!linked) {
        // something went wrong with the link
        const lastError = gl.getProgramInfoLog(program);
        progOptions.errorCallback("Error in program linking:" + lastError);

        gl.deleteProgram(program);
        deleteShaders(gl, newShaders);
        return null;
      }
      return program;
    }

    /**
     * Creates a program from 2 sources.
     *
     * NOTE: There are 4 signatures for this function
     *
     *     twgl.createProgramFromSource(gl, [vs, fs], opt_options);
     *     twgl.createProgramFromSource(gl, [vs, fs], opt_errFunc);
     *     twgl.createProgramFromSource(gl, [vs, fs], opt_attribs, opt_errFunc);
     *     twgl.createProgramFromSource(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext
     *        to use.
     * @param {string[]} shaderSources Array of sources for the
     *        shaders. The first is assumed to be the vertex shader,
     *        the second the fragment shader.
     * @param {module:twgl.ProgramOptions|string[]|module:twgl.ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
     * @param {number[]} [opt_locations|module:twgl.ErrorCallback] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
     * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
     *        on error. If you want something else pass an callback. It's passed an error message.
     * @return {WebGLProgram?} the created program or null if error.
     * @memberOf module:twgl/programs
     */
    function createProgramFromSources(
        gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
      const progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
      const shaders = [];
      for (let ii = 0; ii < shaderSources.length; ++ii) {
        const shader = loadShader(
            gl, shaderSources[ii], gl[defaultShaderType[ii]], progOptions.errorCallback);
        if (!shader) {
          return null;
        }
        shaders.push(shader);
      }
      return createProgram(gl, shaders, progOptions);
    }

    /**
     * Returns true if attribute/uniform is a reserved/built in
     *
     * It makes no sense to me why GL returns these because it's
     * illegal to call `gl.getUniformLocation` and `gl.getAttribLocation`
     * with names that start with `gl_` (and `webgl_` in WebGL)
     *
     * I can only assume they are there because they might count
     * when computing the number of uniforms/attributes used when you want to
     * know if you are near the limit. That doesn't really make sense
     * to me but the fact that these get returned are in the spec.
     *
     * @param {WebGLActiveInfo} info As returned from `gl.getActiveUniform` or
     *    `gl.getActiveAttrib`.
     * @return {bool} true if it's reserved
     * @private
     */
    function isBuiltIn(info) {
      const name = info.name;
      return name.startsWith("gl_") || name.startsWith("webgl_");
    }

    /**
     * Creates setter functions for all uniforms of a shader
     * program.
     *
     * @see {@link module:twgl.setUniforms}
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
     * @param {WebGLProgram} program the program to create setters for.
     * @returns {Object.<string, function>} an object with a setter by name for each uniform
     * @memberOf module:twgl/programs
     */
    function createUniformSetters(gl, program) {
      let textureUnit = 0;

      /**
       * Creates a setter for a uniform of the given program with it's
       * location embedded in the setter.
       * @param {WebGLProgram} program
       * @param {WebGLUniformInfo} uniformInfo
       * @returns {function} the created setter.
       */
      function createUniformSetter(program, uniformInfo) {
        const location = gl.getUniformLocation(program, uniformInfo.name);
        const isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === "[0]");
        const type = uniformInfo.type;
        const typeInfo = typeMap[type];
        if (!typeInfo) {
          throw new Error(`unknown type: 0x${type.toString(16)}`); // we should never get here.
        }
        let setter;
        if (typeInfo.bindPoint) {
          // it's a sampler
          const unit = textureUnit;
          textureUnit += uniformInfo.size;
          if (isArray) {
            setter = typeInfo.arraySetter(gl, type, unit, location, uniformInfo.size);
          } else {
            setter = typeInfo.setter(gl, type, unit, location, uniformInfo.size);
          }
        } else {
          if (typeInfo.arraySetter && isArray) {
            setter = typeInfo.arraySetter(gl, location);
          } else {
            setter = typeInfo.setter(gl, location);
          }
        }
        setter.location = location;
        return setter;
      }

      const uniformSetters = { };
      const numUniforms = gl.getProgramParameter(program, ACTIVE_UNIFORMS);

      for (let ii = 0; ii < numUniforms; ++ii) {
        const uniformInfo = gl.getActiveUniform(program, ii);
        if (isBuiltIn(uniformInfo)) {
            continue;
        }
        let name = uniformInfo.name;
        // remove the array suffix.
        if (name.substr(-3) === "[0]") {
          name = name.substr(0, name.length - 3);
        }
        const setter = createUniformSetter(program, uniformInfo);
        uniformSetters[name] = setter;
      }
      return uniformSetters;
    }

    /**
     * @typedef {Object} TransformFeedbackInfo
     * @property {number} index index of transform feedback
     * @property {number} type GL type
     * @property {number} size 1 - 4
     * @memberOf module:twgl
     */

    /**
     * Create TransformFeedbackInfo for passing to bindTransformFeedbackInfo.
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
     * @param {WebGLProgram} program an existing WebGLProgram.
     * @return {Object<string, module:twgl.TransformFeedbackInfo>}
     * @memberOf module:twgl
     */
    function createTransformFeedbackInfo(gl, program) {
      const info = {};
      const numVaryings = gl.getProgramParameter(program, TRANSFORM_FEEDBACK_VARYINGS);
      for (let ii = 0; ii < numVaryings; ++ii) {
        const varying = gl.getTransformFeedbackVarying(program, ii);
        info[varying.name] = {
          index: ii,
          type: varying.type,
          size: varying.size,
        };
      }
      return info;
    }

    /**
     * @typedef {Object} UniformData
     * @property {number} type The WebGL type enum for this uniform
     * @property {number} size The number of elements for this uniform
     * @property {number} blockNdx The block index this uniform appears in
     * @property {number} offset The byte offset in the block for this uniform's value
     * @memberOf module:twgl
     */

    /**
     * The specification for one UniformBlockObject
     *
     * @typedef {Object} BlockSpec
     * @property {number} index The index of the block.
     * @property {number} size The size in bytes needed for the block
     * @property {number[]} uniformIndices The indices of the uniforms used by the block. These indices
     *    correspond to entries in a UniformData array in the {@link module:twgl.UniformBlockSpec}.
     * @property {bool} usedByVertexShader Self explanatory
     * @property {bool} usedByFragmentShader Self explanatory
     * @property {bool} used Self explanatory
     * @memberOf module:twgl
     */

    /**
     * A `UniformBlockSpec` represents the data needed to create and bind
     * UniformBlockObjects for a given program
     *
     * @typedef {Object} UniformBlockSpec
     * @property {Object.<string, module:twgl.BlockSpec> blockSpecs The BlockSpec for each block by block name
     * @property {UniformData[]} uniformData An array of data for each uniform by uniform index.
     * @memberOf module:twgl
     */

    /**
     * Creates a UniformBlockSpec for the given program.
     *
     * A UniformBlockSpec represents the data needed to create and bind
     * UniformBlockObjects
     *
     * @param {WebGL2RenderingContext} gl A WebGL2 Rendering Context
     * @param {WebGLProgram} program A WebGLProgram for a successfully linked program
     * @return {module:twgl.UniformBlockSpec} The created UniformBlockSpec
     * @memberOf module:twgl/programs
     */
    function createUniformBlockSpecFromProgram(gl, program) {
      const numUniforms = gl.getProgramParameter(program, ACTIVE_UNIFORMS);
      const uniformData = [];
      const uniformIndices = [];

      for (let ii = 0; ii < numUniforms; ++ii) {
        uniformIndices.push(ii);
        uniformData.push({});
        const uniformInfo = gl.getActiveUniform(program, ii);
        if (isBuiltIn(uniformInfo)) {
          break;
        }
        // REMOVE [0]?
        uniformData[ii].name = uniformInfo.name;
      }

      [
        [ "UNIFORM_TYPE", "type" ],
        [ "UNIFORM_SIZE", "size" ],  // num elements
        [ "UNIFORM_BLOCK_INDEX", "blockNdx" ],
        [ "UNIFORM_OFFSET", "offset", ],
      ].forEach(function(pair) {
        const pname = pair[0];
        const key = pair[1];
        gl.getActiveUniforms(program, uniformIndices, gl[pname]).forEach(function(value, ndx) {
          uniformData[ndx][key] = value;
        });
      });

      const blockSpecs = {};

      const numUniformBlocks = gl.getProgramParameter(program, ACTIVE_UNIFORM_BLOCKS);
      for (let ii = 0; ii < numUniformBlocks; ++ii) {
        const name = gl.getActiveUniformBlockName(program, ii);
        const blockSpec = {
          index: ii,
          usedByVertexShader: gl.getActiveUniformBlockParameter(program, ii, UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER),
          usedByFragmentShader: gl.getActiveUniformBlockParameter(program, ii, UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER),
          size: gl.getActiveUniformBlockParameter(program, ii, UNIFORM_BLOCK_DATA_SIZE),
          uniformIndices: gl.getActiveUniformBlockParameter(program, ii, UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES),
        };
        blockSpec.used = blockSpec.usedByVertexShader || blockSpec.usedByFragmentShader;
        blockSpecs[name] = blockSpec;
      }

      return {
        blockSpecs: blockSpecs,
        uniformData: uniformData,
      };
    }

    /**
     * Set uniforms and binds related textures.
     *
     * example:
     *
     *     const programInfo = createProgramInfo(
     *         gl, ["some-vs", "some-fs"]);
     *
     *     const tex1 = gl.createTexture();
     *     const tex2 = gl.createTexture();
     *
     *     ... assume we setup the textures with data ...
     *
     *     const uniforms = {
     *       u_someSampler: tex1,
     *       u_someOtherSampler: tex2,
     *       u_someColor: [1,0,0,1],
     *       u_somePosition: [0,1,1],
     *       u_someMatrix: [
     *         1,0,0,0,
     *         0,1,0,0,
     *         0,0,1,0,
     *         0,0,0,0,
     *       ],
     *     };
     *
     *     gl.useProgram(program);
     *
     * This will automatically bind the textures AND set the
     * uniforms.
     *
     *     twgl.setUniforms(programInfo, uniforms);
     *
     * For the example above it is equivalent to
     *
     *     var texUnit = 0;
     *     gl.activeTexture(gl.TEXTURE0 + texUnit);
     *     gl.bindTexture(gl.TEXTURE_2D, tex1);
     *     gl.uniform1i(u_someSamplerLocation, texUnit++);
     *     gl.activeTexture(gl.TEXTURE0 + texUnit);
     *     gl.bindTexture(gl.TEXTURE_2D, tex2);
     *     gl.uniform1i(u_someSamplerLocation, texUnit++);
     *     gl.uniform4fv(u_someColorLocation, [1, 0, 0, 1]);
     *     gl.uniform3fv(u_somePositionLocation, [0, 1, 1]);
     *     gl.uniformMatrix4fv(u_someMatrix, false, [
     *         1,0,0,0,
     *         0,1,0,0,
     *         0,0,1,0,
     *         0,0,0,0,
     *       ]);
     *
     * Note it is perfectly reasonable to call `setUniforms` multiple times. For example
     *
     *     const uniforms = {
     *       u_someSampler: tex1,
     *       u_someOtherSampler: tex2,
     *     };
     *
     *     const moreUniforms {
     *       u_someColor: [1,0,0,1],
     *       u_somePosition: [0,1,1],
     *       u_someMatrix: [
     *         1,0,0,0,
     *         0,1,0,0,
     *         0,0,1,0,
     *         0,0,0,0,
     *       ],
     *     };
     *
     *     twgl.setUniforms(programInfo, uniforms);
     *     twgl.setUniforms(programInfo, moreUniforms);
     *
     * You can also add WebGLSamplers to uniform samplers as in
     *
     *     const uniforms = {
     *       u_someSampler: {
     *         texture: someWebGLTexture,
     *         sampler: someWebGLSampler,
     *       },
     *     };
     *
     * In which case both the sampler and texture will be bound to the
     * same unit.
     *
     * @param {(module:twgl.ProgramInfo|Object.<string, function>)} setters a `ProgramInfo` as returned from `createProgramInfo` or the setters returned from
     *        `createUniformSetters`.
     * @param {Object.<string, ?>} values an object with values for the
     *        uniforms.
     *   You can pass multiple objects by putting them in an array or by calling with more arguments.For example
     *
     *     const sharedUniforms = {
     *       u_fogNear: 10,
     *       u_projection: ...
     *       ...
     *     };
     *
     *     const localUniforms = {
     *       u_world: ...
     *       u_diffuseColor: ...
     *     };
     *
     *     twgl.setUniforms(programInfo, sharedUniforms, localUniforms);
     *
     *     // is the same as
     *
     *     twgl.setUniforms(programInfo, [sharedUniforms, localUniforms]);
     *
     *     // is the same as
     *
     *     twgl.setUniforms(programInfo, sharedUniforms);
     *     twgl.setUniforms(programInfo, localUniforms};
     *
     * @memberOf module:twgl/programs
     */
    function setUniforms(setters, values) {  // eslint-disable-line
      const actualSetters = setters.uniformSetters || setters;
      const numArgs = arguments.length;
      for (let aNdx = 1; aNdx < numArgs; ++aNdx) {
        const values = arguments[aNdx];
        if (Array.isArray(values)) {
          const numValues = values.length;
          for (let ii = 0; ii < numValues; ++ii) {
            setUniforms(actualSetters, values[ii]);
          }
        } else {
          for (const name in values) {
            const setter = actualSetters[name];
            if (setter) {
              setter(values[name]);
            }
          }
        }
      }
    }

    /**
     * Creates setter functions for all attributes of a shader
     * program. You can pass this to {@link module:twgl.setBuffersAndAttributes} to set all your buffers and attributes.
     *
     * @see {@link module:twgl.setAttributes} for example
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
     * @param {WebGLProgram} program the program to create setters for.
     * @return {Object.<string, function>} an object with a setter for each attribute by name.
     * @memberOf module:twgl/programs
     */
    function createAttributeSetters(gl, program) {
      const attribSetters = {
      };

      const numAttribs = gl.getProgramParameter(program, ACTIVE_ATTRIBUTES);
      for (let ii = 0; ii < numAttribs; ++ii) {
        const attribInfo = gl.getActiveAttrib(program, ii);
        if (isBuiltIn(attribInfo)) {
            continue;
        }
        const index = gl.getAttribLocation(program, attribInfo.name);
        const typeInfo = attrTypeMap[attribInfo.type];
        const setter = typeInfo.setter(gl, index, typeInfo);
        setter.location = index;
        attribSetters[attribInfo.name] = setter;
      }

      return attribSetters;
    }

    /**
     * Sets attributes and binds buffers (deprecated... use {@link module:twgl.setBuffersAndAttributes})
     *
     * Example:
     *
     *     const program = createProgramFromScripts(
     *         gl, ["some-vs", "some-fs");
     *
     *     const attribSetters = createAttributeSetters(program);
     *
     *     const positionBuffer = gl.createBuffer();
     *     const texcoordBuffer = gl.createBuffer();
     *
     *     const attribs = {
     *       a_position: {buffer: positionBuffer, numComponents: 3},
     *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
     *     };
     *
     *     gl.useProgram(program);
     *
     * This will automatically bind the buffers AND set the
     * attributes.
     *
     *     setAttributes(attribSetters, attribs);
     *
     * Properties of attribs. For each attrib you can add
     * properties:
     *
     * *   type: the type of data in the buffer. Default = gl.FLOAT
     * *   normalize: whether or not to normalize the data. Default = false
     * *   stride: the stride. Default = 0
     * *   offset: offset into the buffer. Default = 0
     * *   divisor: the divisor for instances. Default = undefined
     *
     * For example if you had 3 value float positions, 2 value
     * float texcoord and 4 value uint8 colors you'd setup your
     * attribs like this
     *
     *     const attribs = {
     *       a_position: {buffer: positionBuffer, numComponents: 3},
     *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
     *       a_color: {
     *         buffer: colorBuffer,
     *         numComponents: 4,
     *         type: gl.UNSIGNED_BYTE,
     *         normalize: true,
     *       },
     *     };
     *
     * @param {Object.<string, function>} setters Attribute setters as returned from createAttributeSetters
     * @param {Object.<string, module:twgl.AttribInfo>} buffers AttribInfos mapped by attribute name.
     * @memberOf module:twgl/programs
     * @deprecated use {@link module:twgl.setBuffersAndAttributes}
     */
    function setAttributes(setters, buffers) {
      for (const name in buffers) {
        const setter = setters[name];
        if (setter) {
          setter(buffers[name]);
        }
      }
    }

    /**
     * Sets attributes and buffers including the `ELEMENT_ARRAY_BUFFER` if appropriate
     *
     * Example:
     *
     *     const programInfo = createProgramInfo(
     *         gl, ["some-vs", "some-fs");
     *
     *     const arrays = {
     *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
     *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
     *     };
     *
     *     const bufferInfo = createBufferInfoFromArrays(gl, arrays);
     *
     *     gl.useProgram(programInfo.program);
     *
     * This will automatically bind the buffers AND set the
     * attributes.
     *
     *     setBuffersAndAttributes(gl, programInfo, bufferInfo);
     *
     * For the example above it is equivalent to
     *
     *     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
     *     gl.enableVertexAttribArray(a_positionLocation);
     *     gl.vertexAttribPointer(a_positionLocation, 3, gl.FLOAT, false, 0, 0);
     *     gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
     *     gl.enableVertexAttribArray(a_texcoordLocation);
     *     gl.vertexAttribPointer(a_texcoordLocation, 4, gl.FLOAT, false, 0, 0);
     *
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
     * @param {(module:twgl.ProgramInfo|Object.<string, function>)} setters A `ProgramInfo` as returned from {@link module:twgl.createProgramInfo} or Attribute setters as returned from {@link module:twgl.createAttributeSetters}
     * @param {(module:twgl.BufferInfo|module:twgl.VertexArrayInfo)} buffers a `BufferInfo` as returned from {@link module:twgl.createBufferInfoFromArrays}.
     *   or a `VertexArrayInfo` as returned from {@link module:twgl.createVertexArrayInfo}
     * @memberOf module:twgl/programs
     */
    function setBuffersAndAttributes(gl, programInfo, buffers) {
      if (buffers.vertexArrayObject) {
        gl.bindVertexArray(buffers.vertexArrayObject);
      } else {
        setAttributes(programInfo.attribSetters || programInfo, buffers.attribs);
        if (buffers.indices) {
          gl.bindBuffer(ELEMENT_ARRAY_BUFFER$1, buffers.indices);
        }
      }
    }

    /**
     * @typedef {Object} ProgramInfo
     * @property {WebGLProgram} program A shader program
     * @property {Object<string, function>} uniformSetters object of setters as returned from createUniformSetters,
     * @property {Object<string, function>} attribSetters object of setters as returned from createAttribSetters,
     * @property {module:twgl.UniformBlockSpec} [uniformBlockSpace] a uniform block spec for making UniformBlockInfos with createUniformBlockInfo etc..
     * @property {Object<string, module:twgl.TransformFeedbackInfo>} [transformFeedbackInfo] info for transform feedbacks
     * @memberOf module:twgl
     */

    /**
     * Creates a ProgramInfo from an existing program.
     *
     * A ProgramInfo contains
     *
     *     programInfo = {
     *        program: WebGLProgram,
     *        uniformSetters: object of setters as returned from createUniformSetters,
     *        attribSetters: object of setters as returned from createAttribSetters,
     *     }
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext
     *        to use.
     * @param {WebGLProgram} program an existing WebGLProgram.
     * @return {module:twgl.ProgramInfo} The created ProgramInfo.
     * @memberOf module:twgl/programs
     */
    function createProgramInfoFromProgram(gl, program) {
      const uniformSetters = createUniformSetters(gl, program);
      const attribSetters = createAttributeSetters(gl, program);
      const programInfo = {
        program: program,
        uniformSetters: uniformSetters,
        attribSetters: attribSetters,
      };

      if (isWebGL2(gl)) {
        programInfo.uniformBlockSpec = createUniformBlockSpecFromProgram(gl, program);
        programInfo.transformFeedbackInfo = createTransformFeedbackInfo(gl, program);
      }

      return programInfo;
    }

    /**
     * Creates a ProgramInfo from 2 sources.
     *
     * A ProgramInfo contains
     *
     *     programInfo = {
     *        program: WebGLProgram,
     *        uniformSetters: object of setters as returned from createUniformSetters,
     *        attribSetters: object of setters as returned from createAttribSetters,
     *     }
     *
     * NOTE: There are 4 signatures for this function
     *
     *     twgl.createProgramInfo(gl, [vs, fs], options);
     *     twgl.createProgramInfo(gl, [vs, fs], opt_errFunc);
     *     twgl.createProgramInfo(gl, [vs, fs], opt_attribs, opt_errFunc);
     *     twgl.createProgramInfo(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext
     *        to use.
     * @param {string[]} shaderSources Array of sources for the
     *        shaders or ids. The first is assumed to be the vertex shader,
     *        the second the fragment shader.
     * @param {module:twgl.ProgramOptions|string[]|module:twgl.ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
     * @param {number[]} [opt_locations|module:twgl.ErrorCallback] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
     * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
     *        on error. If you want something else pass an callback. It's passed an error message.
     * @return {module:twgl.ProgramInfo?} The created ProgramInfo or null if it failed to link or compile
     * @memberOf module:twgl/programs
     */
    function createProgramInfo(
        gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
      const progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
      let good = true;
      shaderSources = shaderSources.map(function(source) {
        // Lets assume if there is no \n it's an id
        if (source.indexOf("\n") < 0) {
          const script = getElementById(source);
          if (!script) {
            progOptions.errorCallback("no element with id: " + source);
            good = false;
          } else {
            source = script.text;
          }
        }
        return source;
      });
      if (!good) {
        return null;
      }
      const program = createProgramFromSources(gl, shaderSources, progOptions);
      if (!program) {
        return null;
      }
      return createProgramInfoFromProgram(gl, program);
    }

    /*
     * Copyright 2019 Gregg Tavares
     *
     * Permission is hereby granted, free of charge, to any person obtaining a
     * copy of this software and associated documentation files (the "Software"),
     * to deal in the Software without restriction, including without limitation
     * the rights to use, copy, modify, merge, publish, distribute, sublicense,
     * and/or sell copies of the Software, and to permit persons to whom the
     * Software is furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
     * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
     * DEALINGS IN THE SOFTWARE.
     */

    const TRIANGLES                      = 0x0004;
    const UNSIGNED_SHORT$3                 = 0x1403;

    /**
     * Drawing related functions
     *
     * For backward compatibility they are available at both `twgl.draw` and `twgl`
     * itself
     *
     * See {@link module:twgl} for core functions
     *
     * @module twgl/draw
     */

    /**
     * Calls `gl.drawElements` or `gl.drawArrays`, whichever is appropriate
     *
     * normally you'd call `gl.drawElements` or `gl.drawArrays` yourself
     * but calling this means if you switch from indexed data to non-indexed
     * data you don't have to remember to update your draw call.
     *
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext
     * @param {(module:twgl.BufferInfo|module:twgl.VertexArrayInfo)} bufferInfo A BufferInfo as returned from {@link module:twgl.createBufferInfoFromArrays} or
     *   a VertexArrayInfo as returned from {@link module:twgl.createVertexArrayInfo}
     * @param {number} [type] eg (gl.TRIANGLES, gl.LINES, gl.POINTS, gl.TRIANGLE_STRIP, ...). Defaults to `gl.TRIANGLES`
     * @param {number} [count] An optional count. Defaults to bufferInfo.numElements
     * @param {number} [offset] An optional offset. Defaults to 0.
     * @param {number} [instanceCount] An optional instanceCount. if set then `drawArraysInstanced` or `drawElementsInstanced` will be called
     * @memberOf module:twgl/draw
     */
    function drawBufferInfo(gl, bufferInfo, type, count, offset, instanceCount) {
      type = type === undefined ? TRIANGLES : type;
      const indices = bufferInfo.indices;
      const elementType = bufferInfo.elementType;
      const numElements = count === undefined ? bufferInfo.numElements : count;
      offset = offset === undefined ? 0 : offset;
      if (elementType || indices) {
        if (instanceCount !== undefined) {
          gl.drawElementsInstanced(type, numElements, elementType === undefined ? UNSIGNED_SHORT$3 : bufferInfo.elementType, offset, instanceCount);
        } else {
          gl.drawElements(type, numElements, elementType === undefined ? UNSIGNED_SHORT$3 : bufferInfo.elementType, offset);
        }
      } else {
        if (instanceCount !== undefined) {
          gl.drawArraysInstanced(type, offset, numElements, instanceCount);
        } else {
          gl.drawArrays(type, offset, numElements);
        }
      }
    }

    var gridVert = "#version 300 es\r\n\r\nin vec2 a_position;\r\n\r\nuniform mat4 u_camera;\r\nuniform mat4 u_screen;\r\n\r\nvoid main() {\r\n    gl_Position =  vec4(a_position, 0, 1) * u_camera * u_screen;\r\n}\r\n";

    var gridFrag = "#version 300 es\r\n\r\nprecision mediump float;\r\n\r\nout vec4 o_color;\r\n\r\nvoid main() {\r\n    o_color = vec4(1, 0, 0, 1);  // red\r\n}\r\n";

    class GridDisplay {
        constructor(gl) {
            this.resX = 10;
            this.resY = 10;
            this.type = GridType.cartesian;
            this.gl = gl;
            this.programInfo = createProgramInfo(gl, [gridVert, gridFrag]);
            // @ts-ignore
            this.uniforms = { u_screen: null, u_camera: null };
            this.updateVertices();
            this.updateUniform();
        }
        updateVertices() {
            const vertices = new Float32Array(vert_line_length);
            vert_line(vertices, 0, 0, 3, 0);
            console.log(vertices);
            const arrays = {
                position: { numComponents: 2, data: vertices }
            };
            this.bufferInfo = createBufferInfoFromArrays(this.gl, arrays);
        }
        updateUniform() {
            this.uniforms.u_screen = m4.ortho(-this.gl.canvas.width / 2, this.gl.canvas.width / 2, -this.gl.canvas.height / 2, this.gl.canvas.height / 2, -1, 1);
            this.uniforms.u_camera = m4.ortho(settings.window.get('min_x'), settings.window.get('max_x'), settings.window.get('min_y'), settings.window.get('max_y'), -1, 1);
        }
        draw() {
            if (!this.bufferInfo)
                return;
            this.gl.useProgram(this.programInfo.program);
            setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
            setUniforms(this.programInfo, this.uniforms);
            drawBufferInfo(this.gl, this.bufferInfo, this.gl.TRIANGLES);
        }
        draw_webgl(ctx) {
        }
        draw_webgl2(ctx) {
        }
    }
    var Version;
    (function (Version) {
        Version[Version["WebGL"] = 0] = "WebGL";
        Version[Version["WebGL2"] = 1] = "WebGL2";
    })(Version || (Version = {}));
    var GridType;
    (function (GridType) {
        GridType[GridType["cartesian"] = 0] = "cartesian";
        GridType[GridType["polar"] = 1] = "polar";
    })(GridType || (GridType = {}));

    class PlotDisplay extends CustomElement {
        constructor() {
            super();
            this.canvas = this.refs.canvas;
            this.gridDisp = null;
            const resizeObserver = new ResizeObserver(entries => {
                const { width, height } = entries[0].contentRect;
                this.canvas.width = width;
                this.canvas.height = height;
                state$1.set("canvas_width", width);
                state$1.set("canvas_height", height);
            });
            resizeObserver.observe(this);
            this.canvas.addEventListener('pointermove', e => {
                state$1.set('mouse_x', e.offsetX);
                state$1.set('mouse_y', e.offsetY);
            });
        }
        connectedCallback() {
            super.connectedCallback();
            const canvas = this.refs.canvas;
            let gl = canvas.getContext('webgl2');
            if (!gl) {
                console.log('Trying webgl v1');
                gl = canvas.getContext('webgl');
            }
            if (!gl) {
                console.error('Webgl is not supported');
                return;
            }
            this.gridDisp = new GridDisplay(gl);
            requestAnimationFrame(this.draw.bind(this));
        }
        draw() {
            requestAnimationFrame(this.draw.bind(this));
            this.gridDisp.draw();
        }
        render() {
            return html `
            <canvas ref="canvas"></canvas>
            <style>
              :host {
                display: block;
                height:100%;
              }
              canvas {
                display:block;
                position:absolute;
                background-color: white;
              }
            </style>
        `;
        }
    }
    customElements.define('plot-display', PlotDisplay);

    var NumberFormat = Intl.NumberFormat;
    class NumberFormatter {
        constructor(minSize, maxSize) {
            this.maxSize = maxSize;
            this.minNumber = Math.max(-(10 ** maxSize), Number.MIN_SAFE_INTEGER);
            this.maxNumber = Math.min(10 ** (maxSize + 1), Number.MAX_SAFE_INTEGER);
            this.normalFmt = new NumberFormat('en-IN', {
                minimumSignificantDigits: minSize,
                maximumSignificantDigits: maxSize,
                minimumIntegerDigits: 1,
                maximumFractionDigits: maxSize - 2,
            });
            this.exponentFmt = new NumberFormat('en-IN', {
                // @ts-ignore ts has not implemented this yet
                notation: 'scientific',
                minimumSignificantDigits: minSize,
                maximumSignificantDigits: maxSize,
                minimumIntegerDigits: 1,
                maximumFractionDigits: maxSize - 1,
            });
        }
        format(num) {
            // Calculate normal size
            if (num > this.minNumber && num < this.maxNumber) {
                return this.normalFmt.format(num);
            }
            return this.exponentFmt.format(num);
        }
    }

    function rescale(v, minOrg, maxOrg, minDest, maxDest) {
        const norm = (v - minOrg) / (maxOrg - minOrg);
        return minDest + (maxDest - minDest) * norm;
    }
    var Axis;
    (function (Axis) {
        Axis[Axis["x"] = 0] = "x";
        Axis[Axis["y"] = 1] = "y";
    })(Axis || (Axis = {}));
    function screenToGrid(v, axis) {
        const minGrid = (axis === Axis.x ? settings.window.get('min_x') : settings.window.get('max_y'));
        const maxGrid = (axis === Axis.x ? settings.window.get('max_x') : settings.window.get('min_y'));
        const maxScreen = (axis === Axis.x ? state$1.get('canvas_width') : state$1.get('canvas_height'));
        return rescale(v, 0, maxScreen, minGrid, maxGrid);
    }

    class ControlBar extends CustomElement {
        constructor() {
            super();
            this._x = 0;
            this._y = 0;
            this.x = 0;
            this.y = 0;
            state$1.subscribe('mouse_x', val => this.x = screenToGrid(val, Axis.x));
            state$1.subscribe('mouse_y', val => this.y = screenToGrid(val, Axis.y));
        }
        set x(val) {
            this._x = val;
            this.refs.x.textContent = ControlBar.formatter.format(val);
        }
        get x() {
            return this._x;
        }
        set y(val) {
            this._y = val;
            this.refs.y.textContent = ControlBar.formatter.format(val);
        }
        get y() {
            return this._y;
        }
        render() {
            return html `
            <div class="bar">
              <div class="left">
                  <div class="item">x: <span ref="x"></span></div>         
                  <div class="item">y: <span ref="y"></span></div>
              </div>
              <div>
                <div>full screen</div>
              </div>
            </div>
            
            <style>
              :host {
                display: block;
                height:100%;
              }
              .bar {
                display: grid;
                grid-template-columns: 1fr auto;
                line-height: 2em;
                padding: 0 1em;
              }
              .bar div{
                display: inline-block;
              }
              .item {
                padding: 0 .5em;
              }
            </style>
        `;
        }
    }
    ControlBar.formatter = new NumberFormatter(5, 5);
    customElements.define('control-bar', ControlBar);

    class SettingBar extends CustomElement {
        constructor() {
            super();
        }
        makeInput(section, key, name, type = 'text') {
            const id = `${section}_${key}`;
            this.addEventListener('connected', () => {
                // debugger;
                // @ts-ignore
                settings[section].bindTo(key, this.refs[id]);
            });
            return `<label for="${id}">${name}</label><div class="input"><input id="${id}" type="${type}" ref="${id}"/><div class="reset"></div></div>`;
        }
        render() {
            const test = 'testing';
            return html `
            <div class="bar">
            <h2>Settings</h2>
            <foldable-panel>
              <h3 slot="title">Window</h3>
              <div class="input_container">  
              ${this.makeInput('window', 'min_x', 'min x', 'number')}
              ${this.makeInput('window', 'max_x', 'max x', 'number')}
              ${this.makeInput('window', 'min_y', 'min y', 'number')}
              ${this.makeInput('window', 'max_y', 'max y', 'number')}
              </div>
            </foldable-panel>
            <foldable-panel>
              <h3 slot="title">test subject</h3>
              
              <div class="input_container">  
                <label>${test}</label>
                <div class="input"><input /><div class="reset"></div></div>
              </div>
            </foldable-panel>
            <foldable-panel>
              <h3 slot="title">test subject</h3>
              
              <div class="input_container">  
                <label>${test}</label>
                <div class="input"><input /><div class="reset"></div></div>
              </div>
            </foldable-panel>
            
            <style>
              .bar {
                overflow: auto;
              }
              h2 {
                text-align: center;
                margin: .5em 0;
                font-size: 1.8em;
              }
              .input_container{
                display: grid;
                grid-template-columns: auto auto;
                grid-gap: 1em;
                justify-items: stretch;
                padding: 1em 1em;
              }
              label{
              }
              input{
                display: inline-block;
                padding: 0.2em;
                border-radius: 0.2em 0 0 .2em;
                border: 2px #6cf028 solid;
                border-right-width: 0;
              }
              .input {
                display: grid;
                grid-template-columns: auto auto;
              }
              .reset {
                display: inline-block;
                width: 1.2em;
                padding: 0.2em;
                background-color: #303030;
                border-radius: 0 .2em .2em 0;
                cursor: pointer;
                border: 2px #6cf028 solid;
              }
              h3 {
                display: block;
                text-align: center;
                margin: 0;
                padding: 0;
              }
            </style>
        `;
        }
    }
    customElements.define('setting-bar', SettingBar);

    class TitleSection extends CustomElement {
        constructor() {
            super();
        }
        render() {
            return html `
            <h1>DoDeP</h1>
            <h2>Dynamic Ordinary Differential Equation Plotter</h2>
            <h3>By Martijn Besamusca</h3>
            <style>
              :host {
                padding: 1em 0;
                display: block;
              }
              h1 {
                text-align: center;
                font-size: 3em;
                margin: 0;
              }
              h2 {
                text-align: center;
                font-size: 1em;
                margin: 0;
                padding: 0 .5em;
              }
              h3 {
                text-align: right;
                font-size: .8em;
                margin: .5em 0 0 0;
                font-weight: lighter;
                padding: 0 .5em;
             
              }
              
            </style>
        `;
        }
    }
    customElements.define('title-section', TitleSection);

    class FoldablePanel extends CustomElement {
        constructor() {
            super();
            this.closed = false;
            this.refs.title.addEventListener('click', e => {
                this.toggle();
            });
        }
        toggle() {
            this.closed = !this.closed;
            if (this.closed) {
                this.refs.panel.classList.add('closed');
            }
            else {
                this.refs.panel.classList.remove('closed');
            }
        }
        render() {
            return html `
            <div class="panel" ref="panel">
              <div class="title" ref="title">
                <div class="arrow"></div>
                <slot name="title"></slot>
              </div>
              <slot class="content"></slot>
            </div>
            
            <style>
              .title {
                display: grid;
                grid-template-columns: auto 1fr;
                align-items: center;
                margin: 0;
                padding: .5em 1em;
                background-color: #303030;
                cursor: pointer;
              }
              .arrow {
                display: inline-block;
                width: .7em;
                height: .7em;
                border: 3px white solid;
                border-left-width: 0;
                border-top-width: 0;
                transform: rotate(45deg);
                transition: transform ease 200ms;
              }
              .closed .arrow {
                transform: rotate(-45deg);
              }
              ::slotted(h3) {
                display: inline-block;
              }
              ::slotted(div) {
                padding: .5em 1em;
                height: auto;
                transform-origin: top center;
                transition: padding cubic-bezier(0.175, 0.885, 0.32, 1.275) 200ms;
                display: block;
              }
              .closed ::slotted(div) {
                height: 0 !important;
                padding: 0 1em !important;
                overflow: hidden;
              }
            </style>
        `;
        }
    }
    customElements.define('foldable-panel', FoldablePanel);

}());
//# sourceMappingURL=bundle.js.map
