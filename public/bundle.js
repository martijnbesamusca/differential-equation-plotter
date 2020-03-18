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
            this.conditions = {};
            for (const key of Object.keys(target)) {
                this.subscribers[key] = [];
                this.conditions[key] = [];
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
        addCondition(key, condition) {
            // this.conditions[key].push(condition());
        }
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

    /* DataType */
    const BYTE                           = 0x1400;
    const UNSIGNED_BYTE                  = 0x1401;
    const SHORT                          = 0x1402;
    const UNSIGNED_SHORT                 = 0x1403;
    const INT                            = 0x1404;
    const UNSIGNED_INT                   = 0x1405;
    const FLOAT                          = 0x1406;
    const UNSIGNED_SHORT_4_4_4_4       = 0x8033;
    const UNSIGNED_SHORT_5_5_5_1       = 0x8034;
    const UNSIGNED_SHORT_5_6_5         = 0x8363;
    const HALF_FLOAT                   = 0x140B;
    const UNSIGNED_INT_2_10_10_10_REV  = 0x8368;
    const UNSIGNED_INT_10F_11F_11F_REV = 0x8C3B;
    const UNSIGNED_INT_5_9_9_9_REV     = 0x8C3E;
    const FLOAT_32_UNSIGNED_INT_24_8_REV = 0x8DAD;
    const UNSIGNED_INT_24_8            = 0x84FA;

    const glTypeToTypedArray = {};
    {
      const tt = glTypeToTypedArray;
      tt[BYTE]                           = Int8Array;
      tt[UNSIGNED_BYTE]                  = Uint8Array;
      tt[SHORT]                          = Int16Array;
      tt[UNSIGNED_SHORT]                 = Uint16Array;
      tt[INT]                            = Int32Array;
      tt[UNSIGNED_INT]                   = Uint32Array;
      tt[FLOAT]                          = Float32Array;
      tt[UNSIGNED_SHORT_4_4_4_4]         = Uint16Array;
      tt[UNSIGNED_SHORT_5_5_5_1]         = Uint16Array;
      tt[UNSIGNED_SHORT_5_6_5]           = Uint16Array;
      tt[HALF_FLOAT]                     = Uint16Array;
      tt[UNSIGNED_INT_2_10_10_10_REV]    = Uint32Array;
      tt[UNSIGNED_INT_10F_11F_11F_REV]   = Uint32Array;
      tt[UNSIGNED_INT_5_9_9_9_REV]       = Uint32Array;
      tt[FLOAT_32_UNSIGNED_INT_24_8_REV] = Uint32Array;
      tt[UNSIGNED_INT_24_8]              = Uint32Array;
    }

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

    /**
     * Get the typed array constructor for a given GL type
     * @param {number} type the GL type. (eg: `gl.UNSIGNED_INT`)
     * @return {function} the constructor for a the corresponding typed array. (eg. `Uint32Array`).
     * @memberOf module:twgl/typedArray
     */
    function getTypedArrayTypeForGLType(type) {
      const CTOR = glTypeToTypedArray[type];
      if (!CTOR) {
        throw new Error('unknown gl type');
      }
      return CTOR;
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

    function isSampler(gl, t) {
      return typeof WebGLSampler !== 'undefined' && t instanceof WebGLSampler;
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

    /**
     * Sets the default attrib prefix
     *
     * When writing shaders I prefer to name attributes with `a_`, uniforms with `u_` and varyings with `v_`
     * as it makes it clear where they came from. But, when building geometry I prefer using un-prefixed names.
     *
     * In other words I'll create arrays of geometry like this
     *
     *     var arrays = {
     *       position: ...
     *       normal: ...
     *       texcoord: ...
     *     };
     *
     * But need those mapped to attributes and my attributes start with `a_`.
     *
     * @deprecated see {@link module:twgl.setDefaults}
     * @param {string} prefix prefix for attribs
     * @memberOf module:twgl/attributes
     */
    function setAttributePrefix(prefix) {
      defaults.attribPrefix = prefix;
    }

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

    /**
     * Gets a string for WebGL enum
     *
     * Note: Several enums are the same. Without more
     * context (which function) it's impossible to always
     * give the correct enum. As it is, for matching values
     * it gives all enums. Checking the WebGL2RenderingContext
     * that means
     *
     *      0     = ZERO | POINT | NONE | NO_ERROR
     *      1     = ONE | LINES | SYNC_FLUSH_COMMANDS_BIT
     *      32777 = BLEND_EQUATION_RGB | BLEND_EQUATION_RGB
     *      36662 = COPY_READ_BUFFER | COPY_READ_BUFFER_BINDING
     *      36663 = COPY_WRITE_BUFFER | COPY_WRITE_BUFFER_BINDING
     *      36006 = FRAMEBUFFER_BINDING | DRAW_FRAMEBUFFER_BINDING
     *
     * It's also not useful for bits really unless you pass in individual bits.
     * In other words
     *
     *     const bits = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT;
     *     twgl.glEnumToString(gl, bits);  // not going to work
     *
     * Note that some enums only exist on extensions. If you
     * want them to show up you need to pass the extension at least
     * once. For example
     *
     *     const ext = gl.getExtension('WEBGL_compressed_texture_s3tc');
     *     if (ext) {
     *        twgl.glEnumToString(ext, 0);  // just prime the function
     *
     *        ..later..
     *
     *        const internalFormat = ext.COMPRESSED_RGB_S3TC_DXT1_EXT;
     *        console.log(twgl.glEnumToString(gl, internalFormat));
     *
     * Notice I didn't have to pass the extension the second time. This means
     * you can have place that generically gets an enum for texture formats for example.
     * and as long as you primed the function with the extensions
     *
     * If you're using `twgl.addExtensionsToContext` to enable your extensions
     * then twgl will automatically get the extension's enums.
     *
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext or any extension object
     * @param {number} value the value of the enum you want to look up.
     * @return {string} enum string or hex value
     * @memberOf module:twgl
     * @function glEnumToString
     */
    const glEnumToString = (function() {
      const haveEnumsForType = {};
      const enums = {};

      function addEnums(gl) {
        const type = gl.constructor.name;
        if (!haveEnumsForType[type]) {
          for (const key in gl) {
            if (typeof gl[key] === 'number') {
              const existing = enums[gl[key]];
              enums[gl[key]] = existing ? `${existing} | ${key}` : key;
            }
          }
          haveEnumsForType[type] = true;
        }
      }

      return function glEnumToString(gl, value) {
        addEnums(gl);
        return enums[value] || ("0x" + value.toString(16));
      };
    }());

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
    const defaults$1 = {
      textureColor: new Uint8Array([128, 192, 255, 255]),
      textureOptions: {},
      crossOrigin: undefined,
    };
    const isArrayBuffer$1 = isArrayBuffer;

    // Should we make this on demand?
    let s_ctx;
    function getShared2DContext() {
      s_ctx = s_ctx ||
          ((typeof document !== 'undefined' && document.createElement)
            ? document.createElement("canvas").getContext("2d")
            : null);
      return s_ctx;
    }

    // NOTE: Chrome supports 2D canvas in a Worker (behind flag as of v64 but
    //       not only does Firefox NOT support it but Firefox freezes immediately
    //       if you try to create one instead of just returning null and continuing.
    //  : (global.OffscreenCanvas && (new global.OffscreenCanvas(1, 1)).getContext("2d"));  // OffscreenCanvas may not support 2d

    // NOTE: We can maybe remove some of the need for the 2d canvas. In WebGL2
    // we can use the various unpack settings. Otherwise we could try using
    // the ability of an ImageBitmap to be cut. Unfortunately cutting an ImageBitmap
    // is async and the current TWGL code expects a non-Async result though that
    // might not be a problem. ImageBitmap though is not available in Edge or Safari
    // as of 2018-01-02

    /* PixelFormat */
    const ALPHA                          = 0x1906;
    const RGB                            = 0x1907;
    const RGBA                           = 0x1908;
    const LUMINANCE                      = 0x1909;
    const LUMINANCE_ALPHA                = 0x190A;
    const DEPTH_COMPONENT                = 0x1902;
    const DEPTH_STENCIL                  = 0x84F9;

    /* TextureWrapMode */
    // const REPEAT                         = 0x2901;
    // const MIRRORED_REPEAT                = 0x8370;
    const CLAMP_TO_EDGE                  = 0x812f;

    /* TextureMagFilter */
    const NEAREST                        = 0x2600;
    const LINEAR                         = 0x2601;

    /* TextureMinFilter */
    // const NEAREST_MIPMAP_NEAREST         = 0x2700;
    // const LINEAR_MIPMAP_NEAREST          = 0x2701;
    // const NEAREST_MIPMAP_LINEAR          = 0x2702;
    // const LINEAR_MIPMAP_LINEAR           = 0x2703;

    /* Texture Target */
    const TEXTURE_2D                     = 0x0de1;
    const TEXTURE_CUBE_MAP               = 0x8513;
    const TEXTURE_3D                     = 0x806f;
    const TEXTURE_2D_ARRAY               = 0x8c1a;

    /* Cubemap Targets */
    const TEXTURE_CUBE_MAP_POSITIVE_X    = 0x8515;
    const TEXTURE_CUBE_MAP_NEGATIVE_X    = 0x8516;
    const TEXTURE_CUBE_MAP_POSITIVE_Y    = 0x8517;
    const TEXTURE_CUBE_MAP_NEGATIVE_Y    = 0x8518;
    const TEXTURE_CUBE_MAP_POSITIVE_Z    = 0x8519;
    const TEXTURE_CUBE_MAP_NEGATIVE_Z    = 0x851a;

    /* Texture Parameters */
    const TEXTURE_MIN_FILTER             = 0x2801;
    const TEXTURE_MAG_FILTER             = 0x2800;
    const TEXTURE_WRAP_S                 = 0x2802;
    const TEXTURE_WRAP_T                 = 0x2803;
    const TEXTURE_WRAP_R                 = 0x8072;
    const TEXTURE_MIN_LOD                = 0x813a;
    const TEXTURE_MAX_LOD                = 0x813b;
    const TEXTURE_BASE_LEVEL             = 0x813c;
    const TEXTURE_MAX_LEVEL              = 0x813d;


    /* Pixel store */
    const UNPACK_ALIGNMENT                   = 0x0cf5;
    const UNPACK_ROW_LENGTH                  = 0x0cf2;
    const UNPACK_IMAGE_HEIGHT                = 0x806e;
    const UNPACK_SKIP_PIXELS                 = 0x0cf4;
    const UNPACK_SKIP_ROWS                   = 0x0cf3;
    const UNPACK_SKIP_IMAGES                 = 0x806d;
    const UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
    const UNPACK_PREMULTIPLY_ALPHA_WEBGL     = 0x9241;
    const UNPACK_FLIP_Y_WEBGL                = 0x9240;

    const R8                           = 0x8229;
    const R8_SNORM                     = 0x8F94;
    const R16F                         = 0x822D;
    const R32F                         = 0x822E;
    const R8UI                         = 0x8232;
    const R8I                          = 0x8231;
    const RG16UI                       = 0x823A;
    const RG16I                        = 0x8239;
    const RG32UI                       = 0x823C;
    const RG32I                        = 0x823B;
    const RG8                          = 0x822B;
    const RG8_SNORM                    = 0x8F95;
    const RG16F                        = 0x822F;
    const RG32F                        = 0x8230;
    const RG8UI                        = 0x8238;
    const RG8I                         = 0x8237;
    const R16UI                        = 0x8234;
    const R16I                         = 0x8233;
    const R32UI                        = 0x8236;
    const R32I                         = 0x8235;
    const RGB8                         = 0x8051;
    const SRGB8                        = 0x8C41;
    const RGB565                       = 0x8D62;
    const RGB8_SNORM                   = 0x8F96;
    const R11F_G11F_B10F               = 0x8C3A;
    const RGB9_E5                      = 0x8C3D;
    const RGB16F                       = 0x881B;
    const RGB32F                       = 0x8815;
    const RGB8UI                       = 0x8D7D;
    const RGB8I                        = 0x8D8F;
    const RGB16UI                      = 0x8D77;
    const RGB16I                       = 0x8D89;
    const RGB32UI                      = 0x8D71;
    const RGB32I                       = 0x8D83;
    const RGBA8                        = 0x8058;
    const SRGB8_ALPHA8                 = 0x8C43;
    const RGBA8_SNORM                  = 0x8F97;
    const RGB5_A1                      = 0x8057;
    const RGBA4                        = 0x8056;
    const RGB10_A2                     = 0x8059;
    const RGBA16F                      = 0x881A;
    const RGBA32F                      = 0x8814;
    const RGBA8UI                      = 0x8D7C;
    const RGBA8I                       = 0x8D8E;
    const RGB10_A2UI                   = 0x906F;
    const RGBA16UI                     = 0x8D76;
    const RGBA16I                      = 0x8D88;
    const RGBA32I                      = 0x8D82;
    const RGBA32UI                     = 0x8D70;

    const DEPTH_COMPONENT16            = 0x81A5;
    const DEPTH_COMPONENT24            = 0x81A6;
    const DEPTH_COMPONENT32F           = 0x8CAC;
    const DEPTH32F_STENCIL8            = 0x8CAD;
    const DEPTH24_STENCIL8             = 0x88F0;

    /* DataType */
    const BYTE$2                         = 0x1400;
    const UNSIGNED_BYTE$2                = 0x1401;
    const SHORT$2                        = 0x1402;
    const UNSIGNED_SHORT$2               = 0x1403;
    const INT$2                          = 0x1404;
    const UNSIGNED_INT$2                 = 0x1405;
    const FLOAT$2                        = 0x1406;
    const UNSIGNED_SHORT_4_4_4_4$1       = 0x8033;
    const UNSIGNED_SHORT_5_5_5_1$1       = 0x8034;
    const UNSIGNED_SHORT_5_6_5$1         = 0x8363;
    const HALF_FLOAT$1                   = 0x140B;
    const HALF_FLOAT_OES               = 0x8D61;  // Thanks Khronos for making this different >:(
    const UNSIGNED_INT_2_10_10_10_REV$1  = 0x8368;
    const UNSIGNED_INT_10F_11F_11F_REV$1 = 0x8C3B;
    const UNSIGNED_INT_5_9_9_9_REV$1     = 0x8C3E;
    const FLOAT_32_UNSIGNED_INT_24_8_REV$1 = 0x8DAD;
    const UNSIGNED_INT_24_8$1            = 0x84FA;

    const RG                           = 0x8227;
    const RG_INTEGER                   = 0x8228;
    const RED                          = 0x1903;
    const RED_INTEGER                  = 0x8D94;
    const RGB_INTEGER                  = 0x8D98;
    const RGBA_INTEGER                 = 0x8D99;

    /**
     * @typedef {Object} TextureFormatDetails
     * @property {number} textureFormat format to pass texImage2D and similar functions.
     * @property {boolean} colorRenderable true if you can render to this format of texture.
     * @property {boolean} textureFilterable true if you can filter the texture, false if you can ony use `NEAREST`.
     * @property {number[]} type Array of possible types you can pass to texImage2D and similar function
     * @property {Object.<number,number>} bytesPerElementMap A map of types to bytes per element
     * @private
     */

    let s_textureInternalFormatInfo;
    function getTextureInternalFormatInfo(internalFormat) {
      if (!s_textureInternalFormatInfo) {
        // NOTE: these properties need unique names so we can let Uglify mangle the name.
        const t = {};
        // unsized formats
        t[ALPHA]              = { textureFormat: ALPHA,           colorRenderable: true,  textureFilterable: true,  bytesPerElement: [1, 2, 2, 4],        type: [UNSIGNED_BYTE$2, HALF_FLOAT$1, HALF_FLOAT_OES, FLOAT$2], };
        t[LUMINANCE]          = { textureFormat: LUMINANCE,       colorRenderable: true,  textureFilterable: true,  bytesPerElement: [1, 2, 2, 4],        type: [UNSIGNED_BYTE$2, HALF_FLOAT$1, HALF_FLOAT_OES, FLOAT$2], };
        t[LUMINANCE_ALPHA]    = { textureFormat: LUMINANCE_ALPHA, colorRenderable: true,  textureFilterable: true,  bytesPerElement: [2, 4, 4, 8],        type: [UNSIGNED_BYTE$2, HALF_FLOAT$1, HALF_FLOAT_OES, FLOAT$2], };
        t[RGB]                = { textureFormat: RGB,             colorRenderable: true,  textureFilterable: true,  bytesPerElement: [3, 6, 6, 12, 2],    type: [UNSIGNED_BYTE$2, HALF_FLOAT$1, HALF_FLOAT_OES, FLOAT$2, UNSIGNED_SHORT_5_6_5$1], };
        t[RGBA]               = { textureFormat: RGBA,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4, 8, 8, 16, 2, 2], type: [UNSIGNED_BYTE$2, HALF_FLOAT$1, HALF_FLOAT_OES, FLOAT$2, UNSIGNED_SHORT_4_4_4_4$1, UNSIGNED_SHORT_5_5_5_1$1], };

        // sized formats
        t[R8]                 = { textureFormat: RED,             colorRenderable: true,  textureFilterable: true,  bytesPerElement: [1],        type: [UNSIGNED_BYTE$2], };
        t[R8_SNORM]           = { textureFormat: RED,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [1],        type: [BYTE$2], };
        t[R16F]               = { textureFormat: RED,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [4, 2],     type: [FLOAT$2, HALF_FLOAT$1], };
        t[R32F]               = { textureFormat: RED,             colorRenderable: false, textureFilterable: false, bytesPerElement: [4],        type: [FLOAT$2], };
        t[R8UI]               = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [1],        type: [UNSIGNED_BYTE$2], };
        t[R8I]                = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [1],        type: [BYTE$2], };
        t[R16UI]              = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [2],        type: [UNSIGNED_SHORT$2], };
        t[R16I]               = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [2],        type: [SHORT$2], };
        t[R32UI]              = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_INT$2], };
        t[R32I]               = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [INT$2], };
        t[RG8]                = { textureFormat: RG,              colorRenderable: true,  textureFilterable: true,  bytesPerElement: [2],        type: [UNSIGNED_BYTE$2], };
        t[RG8_SNORM]          = { textureFormat: RG,              colorRenderable: false, textureFilterable: true,  bytesPerElement: [2],        type: [BYTE$2], };
        t[RG16F]              = { textureFormat: RG,              colorRenderable: false, textureFilterable: true,  bytesPerElement: [8, 4],     type: [FLOAT$2, HALF_FLOAT$1], };
        t[RG32F]              = { textureFormat: RG,              colorRenderable: false, textureFilterable: false, bytesPerElement: [8],        type: [FLOAT$2], };
        t[RG8UI]              = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [2],        type: [UNSIGNED_BYTE$2], };
        t[RG8I]               = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [2],        type: [BYTE$2], };
        t[RG16UI]             = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_SHORT$2], };
        t[RG16I]              = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [SHORT$2], };
        t[RG32UI]             = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [8],        type: [UNSIGNED_INT$2], };
        t[RG32I]              = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [8],        type: [INT$2], };
        t[RGB8]               = { textureFormat: RGB,             colorRenderable: true,  textureFilterable: true,  bytesPerElement: [3],        type: [UNSIGNED_BYTE$2], };
        t[SRGB8]              = { textureFormat: RGB,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [3],        type: [UNSIGNED_BYTE$2], };
        t[RGB565]             = { textureFormat: RGB,             colorRenderable: true,  textureFilterable: true,  bytesPerElement: [3, 2],     type: [UNSIGNED_BYTE$2, UNSIGNED_SHORT_5_6_5$1], };
        t[RGB8_SNORM]         = { textureFormat: RGB,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [3],        type: [BYTE$2], };
        t[R11F_G11F_B10F]     = { textureFormat: RGB,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [12, 6, 4], type: [FLOAT$2, HALF_FLOAT$1, UNSIGNED_INT_10F_11F_11F_REV$1], };
        t[RGB9_E5]            = { textureFormat: RGB,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [12, 6, 4], type: [FLOAT$2, HALF_FLOAT$1, UNSIGNED_INT_5_9_9_9_REV$1], };
        t[RGB16F]             = { textureFormat: RGB,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [12, 6],    type: [FLOAT$2, HALF_FLOAT$1], };
        t[RGB32F]             = { textureFormat: RGB,             colorRenderable: false, textureFilterable: false, bytesPerElement: [12],       type: [FLOAT$2], };
        t[RGB8UI]             = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [3],        type: [UNSIGNED_BYTE$2], };
        t[RGB8I]              = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [3],        type: [BYTE$2], };
        t[RGB16UI]            = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [6],        type: [UNSIGNED_SHORT$2], };
        t[RGB16I]             = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [6],        type: [SHORT$2], };
        t[RGB32UI]            = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [12],       type: [UNSIGNED_INT$2], };
        t[RGB32I]             = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [12],       type: [INT$2], };
        t[RGBA8]              = { textureFormat: RGBA,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4],        type: [UNSIGNED_BYTE$2], };
        t[SRGB8_ALPHA8]       = { textureFormat: RGBA,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4],        type: [UNSIGNED_BYTE$2], };
        t[RGBA8_SNORM]        = { textureFormat: RGBA,            colorRenderable: false, textureFilterable: true,  bytesPerElement: [4],        type: [BYTE$2], };
        t[RGB5_A1]            = { textureFormat: RGBA,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4, 2, 4],  type: [UNSIGNED_BYTE$2, UNSIGNED_SHORT_5_5_5_1$1, UNSIGNED_INT_2_10_10_10_REV$1], };
        t[RGBA4]              = { textureFormat: RGBA,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4, 2],     type: [UNSIGNED_BYTE$2, UNSIGNED_SHORT_4_4_4_4$1], };
        t[RGB10_A2]           = { textureFormat: RGBA,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4],        type: [UNSIGNED_INT_2_10_10_10_REV$1], };
        t[RGBA16F]            = { textureFormat: RGBA,            colorRenderable: false, textureFilterable: true,  bytesPerElement: [16, 8],    type: [FLOAT$2, HALF_FLOAT$1], };
        t[RGBA32F]            = { textureFormat: RGBA,            colorRenderable: false, textureFilterable: false, bytesPerElement: [16],       type: [FLOAT$2], };
        t[RGBA8UI]            = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_BYTE$2], };
        t[RGBA8I]             = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [BYTE$2], };
        t[RGB10_A2UI]         = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_INT_2_10_10_10_REV$1], };
        t[RGBA16UI]           = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [8],        type: [UNSIGNED_SHORT$2], };
        t[RGBA16I]            = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [8],        type: [SHORT$2], };
        t[RGBA32I]            = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [16],       type: [INT$2], };
        t[RGBA32UI]           = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [16],       type: [UNSIGNED_INT$2], };
        // Sized Internal
        t[DEPTH_COMPONENT16]  = { textureFormat: DEPTH_COMPONENT, colorRenderable: true,  textureFilterable: false, bytesPerElement: [2, 4],     type: [UNSIGNED_SHORT$2, UNSIGNED_INT$2], };
        t[DEPTH_COMPONENT24]  = { textureFormat: DEPTH_COMPONENT, colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_INT$2], };
        t[DEPTH_COMPONENT32F] = { textureFormat: DEPTH_COMPONENT, colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [FLOAT$2], };
        t[DEPTH24_STENCIL8]   = { textureFormat: DEPTH_STENCIL,   colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_INT_24_8$1], };
        t[DEPTH32F_STENCIL8]  = { textureFormat: DEPTH_STENCIL,   colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [FLOAT_32_UNSIGNED_INT_24_8_REV$1], };

        Object.keys(t).forEach(function(internalFormat) {
          const info = t[internalFormat];
          info.bytesPerElementMap = {};
          info.bytesPerElement.forEach(function(bytesPerElement, ndx) {
            const type = info.type[ndx];
            info.bytesPerElementMap[type] = bytesPerElement;
          });
        });
        s_textureInternalFormatInfo = t;
      }
      return s_textureInternalFormatInfo[internalFormat];
    }

    /**
     * Gets the number of bytes per element for a given internalFormat / type
     * @param {number} internalFormat The internalFormat parameter from texImage2D etc..
     * @param {number} type The type parameter for texImage2D etc..
     * @return {number} the number of bytes per element for the given internalFormat, type combo
     * @memberOf module:twgl/textures
     */
    function getBytesPerElementForInternalFormat(internalFormat, type) {
      const info = getTextureInternalFormatInfo(internalFormat);
      if (!info) {
        throw "unknown internal format";
      }
      const bytesPerElement = info.bytesPerElementMap[type];
      if (bytesPerElement === undefined) {
        throw "unknown internal format";
      }
      return bytesPerElement;
    }

    /**
     * Info related to a specific texture internalFormat as returned
     * from {@link module:twgl/textures.getFormatAndTypeForInternalFormat}.
     *
     * @typedef {Object} TextureFormatInfo
     * @property {number} format Format to pass to texImage2D and related functions
     * @property {number} type Type to pass to texImage2D and related functions
     * @memberOf module:twgl/textures
     */

    /**
     * Gets the format and type for a given internalFormat
     *
     * @param {number} internalFormat The internal format
     * @return {module:twgl/textures.TextureFormatInfo} the corresponding format and type,
     * @memberOf module:twgl/textures
     */
    function getFormatAndTypeForInternalFormat(internalFormat) {
      const info = getTextureInternalFormatInfo(internalFormat);
      if (!info) {
        throw "unknown internal format";
      }
      return {
        format: info.textureFormat,
        type: info.type[0],
      };
    }

    /**
     * Returns true if value is power of 2
     * @param {number} value number to check.
     * @return true if value is power of 2
     * @private
     */
    function isPowerOf2(value) {
      return (value & (value - 1)) === 0;
    }

    /**
     * Gets whether or not we can generate mips for the given
     * internal format.
     *
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @param {number} width The width parameter from texImage2D etc..
     * @param {number} height The height parameter from texImage2D etc..
     * @param {number} internalFormat The internalFormat parameter from texImage2D etc..
     * @return {boolean} true if we can generate mips
     * @memberOf module:twgl/textures
     */
    function canGenerateMipmap(gl, width, height, internalFormat) {
      if (!isWebGL2(gl)) {
        return isPowerOf2(width) && isPowerOf2(height);
      }
      const info = getTextureInternalFormatInfo(internalFormat);
      if (!info) {
        throw "unknown internal format";
      }
      return info.colorRenderable && info.textureFilterable;
    }

    /**
     * Gets whether or not we can generate mips for the given format
     * @param {number} internalFormat The internalFormat parameter from texImage2D etc..
     * @return {boolean} true if we can generate mips
     * @memberOf module:twgl/textures
     */
    function canFilter(internalFormat) {
      const info = getTextureInternalFormatInfo(internalFormat);
      if (!info) {
        throw "unknown internal format";
      }
      return info.textureFilterable;
    }

    /**
     * Gets the texture type for a given array type.
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @return {number} the gl texture type
     * @private
     */
    function getTextureTypeForArrayType(gl, src, defaultType) {
      if (isArrayBuffer$1(src)) {
        return getGLTypeForTypedArray(src);
      }
      return defaultType || UNSIGNED_BYTE$2;
    }

    function guessDimensions(gl, target, width, height, numElements) {
      if (numElements % 1 !== 0) {
        throw "can't guess dimensions";
      }
      if (!width && !height) {
        const size = Math.sqrt(numElements / (target === TEXTURE_CUBE_MAP ? 6 : 1));
        if (size % 1 === 0) {
          width = size;
          height = size;
        } else {
          width = numElements;
          height = 1;
        }
      } else if (!height) {
        height = numElements / width;
        if (height % 1) {
          throw "can't guess dimensions";
        }
      } else if (!width) {
        width = numElements / height;
        if (width % 1) {
          throw "can't guess dimensions";
        }
      }
      return {
        width: width,
        height: height,
      };
    }

    /**
     * A function to generate the source for a texture.
     * @callback TextureFunc
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext
     * @param {module:twgl.TextureOptions} options the texture options
     * @return {*} Returns any of the things documented for `src` for {@link module:twgl.TextureOptions}.
     * @memberOf module:twgl
     */

    /**
     * Texture options passed to most texture functions. Each function will use whatever options
     * are appropriate for its needs. This lets you pass the same options to all functions.
     *
     * Note: A `TexImageSource` is defined in the WebGL spec as a `HTMLImageElement`, `HTMLVideoElement`,
     * `HTMLCanvasElement`, `ImageBitmap`, or `ImageData`.
     *
     * @typedef {Object} TextureOptions
     * @property {number} [target] the type of texture `gl.TEXTURE_2D` or `gl.TEXTURE_CUBE_MAP`. Defaults to `gl.TEXTURE_2D`.
     * @property {number} [level] the mip level to affect. Defaults to 0. Note, if set auto will be considered false unless explicitly set to true.
     * @property {number} [width] the width of the texture. Only used if src is an array or typed array or null.
     * @property {number} [height] the height of a texture. Only used if src is an array or typed array or null.
     * @property {number} [depth] the depth of a texture. Only used if src is an array or type array or null and target is `TEXTURE_3D` .
     * @property {number} [min] the min filter setting (eg. `gl.LINEAR`). Defaults to `gl.NEAREST_MIPMAP_LINEAR`
     *     or if texture is not a power of 2 on both dimensions then defaults to `gl.LINEAR`.
     * @property {number} [mag] the mag filter setting (eg. `gl.LINEAR`). Defaults to `gl.LINEAR`
     * @property {number} [minMag] both the min and mag filter settings.
     * @property {number} [internalFormat] internal format for texture. Defaults to `gl.RGBA`
     * @property {number} [format] format for texture. Defaults to `gl.RGBA`.
     * @property {number} [type] type for texture. Defaults to `gl.UNSIGNED_BYTE` unless `src` is ArrayBufferView. If `src`
     *     is ArrayBufferView defaults to type that matches ArrayBufferView type.
     * @property {number} [wrap] Texture wrapping for both S and T (and R if TEXTURE_3D or WebGLSampler). Defaults to `gl.REPEAT` for 2D unless src is WebGL1 and src not npot and `gl.CLAMP_TO_EDGE` for cube
     * @property {number} [wrapS] Texture wrapping for S. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
     * @property {number} [wrapT] Texture wrapping for T. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
     * @property {number} [wrapR] Texture wrapping for R. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
     * @property {number} [minLod] TEXTURE_MIN_LOD setting
     * @property {number} [maxLod] TEXTURE_MAX_LOD setting
     * @property {number} [baseLevel] TEXTURE_BASE_LEVEL setting
     * @property {number} [maxLevel] TEXTURE_MAX_LEVEL setting
     * @property {number} [unpackAlignment] The `gl.UNPACK_ALIGNMENT` used when uploading an array. Defaults to 1.
     * @property {number[]|ArrayBufferView} [color] Color to initialize this texture with if loading an image asynchronously.
     *     The default use a blue 1x1 pixel texture. You can set another default by calling `twgl.setDefaults`
     *     or you can set an individual texture's initial color by setting this property. Example: `[1, .5, .5, 1]` = pink
     * @property {number} [premultiplyAlpha] Whether or not to premultiply alpha. Defaults to whatever the current setting is.
     *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
     *     the current setting for specific textures.
     * @property {number} [flipY] Whether or not to flip the texture vertically on upload. Defaults to whatever the current setting is.
     *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
     *     the current setting for specific textures.
     * @property {number} [colorspaceConversion] Whether or not to let the browser do colorspace conversion of the texture on upload. Defaults to whatever the current setting is.
     *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
     *     the current setting for specific textures.
     * @property {boolean} [auto] If `undefined` or `true`, in WebGL1, texture filtering is set automatically for non-power of 2 images and
     *    mips are generated for power of 2 images. In WebGL2 mips are generated if they can be. Note: if `level` is set above
     *    then then `auto` is assumed to be `false` unless explicity set to `true`.
     * @property {number[]} [cubeFaceOrder] The order that cube faces are pulled out of an img or set of images. The default is
     *
     *     [gl.TEXTURE_CUBE_MAP_POSITIVE_X,
     *      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
     *      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
     *      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
     *      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
     *      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
     *
     * @property {(number[]|ArrayBufferView|TexImageSource|TexImageSource[]|string|string[]|module:twgl.TextureFunc)} [src] source for texture
     *
     *    If `string` then it's assumed to be a URL to an image. The image will be downloaded async. A usable
     *    1x1 pixel texture will be returned immediately. The texture will be updated once the image has downloaded.
     *    If `target` is `gl.TEXTURE_CUBE_MAP` will attempt to divide image into 6 square pieces. 1x6, 6x1, 3x2, 2x3.
     *    The pieces will be uploaded in `cubeFaceOrder`
     *
     *    If `string[]` or `TexImageSource[]` and target is `gl.TEXTURE_CUBE_MAP` then it must have 6 entries, one for each face of a cube map.
     *
     *    If `string[]` or `TexImageSource[]` and target is `gl.TEXTURE_2D_ARRAY` then each entry is a slice of the a 2d array texture
     *    and will be scaled to the specified width and height OR to the size of the first image that loads.
     *
     *    If `TexImageSource` then it wil be used immediately to create the contents of the texture. Examples `HTMLImageElement`,
     *    `HTMLCanvasElement`, `HTMLVideoElement`.
     *
     *    If `number[]` or `ArrayBufferView` it's assumed to be data for a texture. If `width` or `height` is
     *    not specified it is guessed as follows. First the number of elements is computed by `src.length / numComponents`
     *    where `numComponents` is derived from `format`. If `target` is `gl.TEXTURE_CUBE_MAP` then `numElements` is divided
     *    by 6. Then
     *
     *    *   If neither `width` nor `height` are specified and `sqrt(numElements)` is an integer then width and height
     *        are set to `sqrt(numElements)`. Otherwise `width = numElements` and `height = 1`.
     *
     *    *   If only one of `width` or `height` is specified then the other equals `numElements / specifiedDimension`.
     *
     * If `number[]` will be converted to `type`.
     *
     * If `src` is a function it will be called with a `WebGLRenderingContext` and these options.
     * Whatever it returns is subject to these rules. So it can return a string url, an `HTMLElement`
     * an array etc...
     *
     * If `src` is undefined then an empty texture will be created of size `width` by `height`.
     *
     * @property {string} [crossOrigin] What to set the crossOrigin property of images when they are downloaded.
     *    default: undefined. Also see {@link module:twgl.setDefaults}.
     *
     * @memberOf module:twgl
     */

    // NOTE: While querying GL is considered slow it's not remotely as slow
    // as uploading a texture. On top of that you're unlikely to call this in
    // a perf critical loop. Even if upload a texture every frame that's unlikely
    // to be more than 1 or 2 textures a frame. In other words, the benefits of
    // making the API easy to use outweigh any supposed perf benefits
    //
    // Also note I get that having one global of these is bad practice.
    // As long as it's used correctly it means no garbage which probably
    // doesn't matter when dealing with textures but old habits die hard.
    const lastPackState = {};

    /**
     * Saves any packing state that will be set based on the options.
     * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @private
     */
    function savePackState(gl, options) {
      if (options.colorspaceConversion !== undefined) {
        lastPackState.colorspaceConversion = gl.getParameter(UNPACK_COLORSPACE_CONVERSION_WEBGL);
        gl.pixelStorei(UNPACK_COLORSPACE_CONVERSION_WEBGL, options.colorspaceConversion);
      }
      if (options.premultiplyAlpha !== undefined) {
        lastPackState.premultiplyAlpha = gl.getParameter(UNPACK_PREMULTIPLY_ALPHA_WEBGL);
        gl.pixelStorei(UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.premultiplyAlpha);
      }
      if (options.flipY !== undefined) {
        lastPackState.flipY = gl.getParameter(UNPACK_FLIP_Y_WEBGL);
        gl.pixelStorei(UNPACK_FLIP_Y_WEBGL, options.flipY);
      }
    }

    /**
     * Restores any packing state that was set based on the options.
     * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @private
     */
    function restorePackState(gl, options) {
      if (options.colorspaceConversion !== undefined) {
        gl.pixelStorei(UNPACK_COLORSPACE_CONVERSION_WEBGL, lastPackState.colorspaceConversion);
      }
      if (options.premultiplyAlpha !== undefined) {
        gl.pixelStorei(UNPACK_PREMULTIPLY_ALPHA_WEBGL, lastPackState.premultiplyAlpha);
      }
      if (options.flipY !== undefined) {
        gl.pixelStorei(UNPACK_FLIP_Y_WEBGL, lastPackState.flipY);
      }
    }

    /**
     * Saves state related to data size
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @private
     */
    function saveSkipState(gl) {
      lastPackState.unpackAlignment   = gl.getParameter(UNPACK_ALIGNMENT);
      if (isWebGL2(gl)) {
        lastPackState.unpackRowLength   = gl.getParameter(UNPACK_ROW_LENGTH);
        lastPackState.unpackImageHeight = gl.getParameter(UNPACK_IMAGE_HEIGHT);
        lastPackState.unpackSkipPixels  = gl.getParameter(UNPACK_SKIP_PIXELS);
        lastPackState.unpackSkipRows    = gl.getParameter(UNPACK_SKIP_ROWS);
        lastPackState.unpackSkipImages  = gl.getParameter(UNPACK_SKIP_IMAGES);
      }
    }

    /**
     * Restores state related to data size
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @private
     */
    function restoreSkipState(gl) {
      gl.pixelStorei(UNPACK_ALIGNMENT,    lastPackState.unpackAlignment);
      if (isWebGL2(gl)) {
        gl.pixelStorei(UNPACK_ROW_LENGTH,   lastPackState.unpackRowLength);
        gl.pixelStorei(UNPACK_IMAGE_HEIGHT, lastPackState.unpackImageHeight);
        gl.pixelStorei(UNPACK_SKIP_PIXELS,  lastPackState.unpackSkipPixels);
        gl.pixelStorei(UNPACK_SKIP_ROWS,    lastPackState.unpackSkipRows);
        gl.pixelStorei(UNPACK_SKIP_IMAGES,  lastPackState.unpackSkipImages);
      }
    }


    /**
     * Sets the parameters of a texture or sampler
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @param {number|WebGLSampler} target texture target or sampler
     * @param {function()} parameteriFn texParameteri or samplerParameteri fn
     * @param {WebGLTexture} tex the WebGLTexture to set parameters for
     * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
     *   This is often the same options you passed in when you created the texture.
     * @private
     */
    function setTextureSamplerParameters(gl, target, parameteriFn, options) {
      if (options.minMag) {
        parameteriFn.call(gl, target, TEXTURE_MIN_FILTER, options.minMag);
        parameteriFn.call(gl, target, TEXTURE_MAG_FILTER, options.minMag);
      }
      if (options.min) {
        parameteriFn.call(gl, target, TEXTURE_MIN_FILTER, options.min);
      }
      if (options.mag) {
        parameteriFn.call(gl, target, TEXTURE_MAG_FILTER, options.mag);
      }
      if (options.wrap) {
        parameteriFn.call(gl, target, TEXTURE_WRAP_S, options.wrap);
        parameteriFn.call(gl, target, TEXTURE_WRAP_T, options.wrap);
        if (target === TEXTURE_3D || isSampler(gl, target)) {
          parameteriFn.call(gl, target, TEXTURE_WRAP_R, options.wrap);
        }
      }
      if (options.wrapR) {
        parameteriFn.call(gl, target, TEXTURE_WRAP_R, options.wrapR);
      }
      if (options.wrapS) {
        parameteriFn.call(gl, target, TEXTURE_WRAP_S, options.wrapS);
      }
      if (options.wrapT) {
        parameteriFn.call(gl, target, TEXTURE_WRAP_T, options.wrapT);
      }
      if (options.minLod) {
        parameteriFn.call(gl, target, TEXTURE_MIN_LOD, options.minLod);
      }
      if (options.maxLod) {
        parameteriFn.call(gl, target, TEXTURE_MAX_LOD, options.maxLod);
      }
      if (options.baseLevel) {
        parameteriFn.call(gl, target, TEXTURE_BASE_LEVEL, options.baseLevel);
      }
      if (options.maxLevel) {
        parameteriFn.call(gl, target, TEXTURE_MAX_LEVEL, options.maxLevel);
      }
    }

    /**
     * Sets the texture parameters of a texture.
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @param {WebGLTexture} tex the WebGLTexture to set parameters for
     * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
     *   This is often the same options you passed in when you created the texture.
     * @memberOf module:twgl/textures
     */
    function setTextureParameters(gl, tex, options) {
      const target = options.target || TEXTURE_2D;
      gl.bindTexture(target, tex);
      setTextureSamplerParameters(gl, target, gl.texParameteri, options);
    }

    /**
     * Makes a 1x1 pixel
     * If no color is passed in uses the default color which can be set by calling `setDefaultTextureColor`.
     * @param {(number[]|ArrayBufferView)} [color] The color using 0-1 values
     * @return {Uint8Array} Unit8Array with color.
     * @private
     */
    function make1Pixel(color) {
      color = color || defaults$1.textureColor;
      if (isArrayBuffer$1(color)) {
        return color;
      }
      return new Uint8Array([color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255]);
    }

    /**
     * Sets filtering or generates mips for texture based on width or height
     * If width or height is not passed in uses `options.width` and//or `options.height`
     *
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @param {WebGLTexture} tex the WebGLTexture to set parameters for
     * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
     *   This is often the same options you passed in when you created the texture.
     * @param {number} [width] width of texture
     * @param {number} [height] height of texture
     * @param {number} [internalFormat] The internalFormat parameter from texImage2D etc..
     * @memberOf module:twgl/textures
     */
    function setTextureFilteringForSize(gl, tex, options, width, height, internalFormat) {
      options = options || defaults$1.textureOptions;
      internalFormat = internalFormat || RGBA;
      const target = options.target || TEXTURE_2D;
      width = width || options.width;
      height = height || options.height;
      gl.bindTexture(target, tex);
      if (canGenerateMipmap(gl, width, height, internalFormat)) {
        gl.generateMipmap(target);
      } else {
        const filtering = canFilter(internalFormat) ? LINEAR : NEAREST;
        gl.texParameteri(target, TEXTURE_MIN_FILTER, filtering);
        gl.texParameteri(target, TEXTURE_MAG_FILTER, filtering);
        gl.texParameteri(target, TEXTURE_WRAP_S, CLAMP_TO_EDGE);
        gl.texParameteri(target, TEXTURE_WRAP_T, CLAMP_TO_EDGE);
      }
    }

    function shouldAutomaticallySetTextureFilteringForSize(options) {
      return options.auto === true || (options.auto === undefined && options.level === undefined);
    }

    /**
     * Gets an array of cubemap face enums
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
     *   This is often the same options you passed in when you created the texture.
     * @return {number[]} cubemap face enums
     * @private
     */
    function getCubeFaceOrder(gl, options) {
      options = options || {};
      return options.cubeFaceOrder || [
          TEXTURE_CUBE_MAP_POSITIVE_X,
          TEXTURE_CUBE_MAP_NEGATIVE_X,
          TEXTURE_CUBE_MAP_POSITIVE_Y,
          TEXTURE_CUBE_MAP_NEGATIVE_Y,
          TEXTURE_CUBE_MAP_POSITIVE_Z,
          TEXTURE_CUBE_MAP_NEGATIVE_Z,
        ];
    }

    /**
     * @typedef {Object} FaceInfo
     * @property {number} face gl enum for texImage2D
     * @property {number} ndx face index (0 - 5) into source data
     * @ignore
     */

    /**
     * Gets an array of FaceInfos
     * There's a bug in some NVidia drivers that will crash the driver if
     * `gl.TEXTURE_CUBE_MAP_POSITIVE_X` is not uploaded first. So, we take
     * the user's desired order from his faces to WebGL and make sure we
     * do the faces in WebGL order
     *
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
     * @return {FaceInfo[]} cubemap face infos. Arguably the `face` property of each element is redundant but
     *    it's needed internally to sort the array of `ndx` properties by `face`.
     * @private
     */
    function getCubeFacesWithNdx(gl, options) {
      const faces = getCubeFaceOrder(gl, options);
      // work around bug in NVidia drivers. We have to upload the first face first else the driver crashes :(
      const facesWithNdx = faces.map(function(face, ndx) {
        return { face: face, ndx: ndx };
      });
      facesWithNdx.sort(function(a, b) {
        return a.face - b.face;
      });
      return facesWithNdx;
    }

    /**
     * Set a texture from the contents of an element. Will also set
     * texture filtering or generate mips based on the dimensions of the element
     * unless `options.auto === false`. If `target === gl.TEXTURE_CUBE_MAP` will
     * attempt to slice image into 1x6, 2x3, 3x2, or 6x1 images, one for each face.
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @param {WebGLTexture} tex the WebGLTexture to set parameters for
     * @param {HTMLElement} element a canvas, img, or video element.
     * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
     *   This is often the same options you passed in when you created the texture.
     * @memberOf module:twgl/textures
     * @kind function
     */
    function setTextureFromElement(gl, tex, element, options) {
      options = options || defaults$1.textureOptions;
      const target = options.target || TEXTURE_2D;
      const level = options.level || 0;
      let width = element.width;
      let height = element.height;
      const internalFormat = options.internalFormat || options.format || RGBA;
      const formatType = getFormatAndTypeForInternalFormat(internalFormat);
      const format = options.format || formatType.format;
      const type = options.type || formatType.type;
      savePackState(gl, options);
      gl.bindTexture(target, tex);
      if (target === TEXTURE_CUBE_MAP) {
        // guess the parts
        const imgWidth  = element.width;
        const imgHeight = element.height;
        let size;
        let slices;
        if (imgWidth / 6 === imgHeight) {
          // It's 6x1
          size = imgHeight;
          slices = [0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0];
        } else if (imgHeight / 6 === imgWidth) {
          // It's 1x6
          size = imgWidth;
          slices = [0, 0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5];
        } else if (imgWidth / 3 === imgHeight / 2) {
          // It's 3x2
          size = imgWidth / 3;
          slices = [0, 0, 1, 0, 2, 0, 0, 1, 1, 1, 2, 1];
        } else if (imgWidth / 2 === imgHeight / 3) {
          // It's 2x3
          size = imgWidth / 2;
          slices = [0, 0, 1, 0, 0, 1, 1, 1, 0, 2, 1, 2];
        } else {
          throw "can't figure out cube map from element: " + (element.src ? element.src : element.nodeName);
        }
        const ctx = getShared2DContext();
        if (ctx) {
          ctx.canvas.width = size;
          ctx.canvas.height = size;
          width = size;
          height = size;
          getCubeFacesWithNdx(gl, options).forEach(function(f) {
            const xOffset = slices[f.ndx * 2 + 0] * size;
            const yOffset = slices[f.ndx * 2 + 1] * size;
            ctx.drawImage(element, xOffset, yOffset, size, size, 0, 0, size, size);
            gl.texImage2D(f.face, level, internalFormat, format, type, ctx.canvas);
          });
          // Free up the canvas memory
          ctx.canvas.width = 1;
          ctx.canvas.height = 1;
        } else if (typeof createImageBitmap !== 'undefined') {
          // NOTE: It seems like we should prefer ImageBitmap because unlike canvas it's
          // note lossy? (alpha is not premultiplied? although I'm not sure what
          width = size;
          height = size;
          getCubeFacesWithNdx(gl, options).forEach(function(f) {
            const xOffset = slices[f.ndx * 2 + 0] * size;
            const yOffset = slices[f.ndx * 2 + 1] * size;
            // We can't easily use a default texture color here as it would have to match
            // the type across all faces where as with a 2D one there's only one face
            // so we're replacing everything all at once. It also has to be the correct size.
            // On the other hand we need all faces to be the same size so as one face loads
            // the rest match else the texture will be un-renderable.
            gl.texImage2D(f.face, level, internalFormat, size, size, 0, format, type, null);
            createImageBitmap(element, xOffset, yOffset, size, size, {
              premultiplyAlpha: 'none',
              colorSpaceConversion: 'none',
            })
            .then(function(imageBitmap) {
              savePackState(gl, options);
              gl.bindTexture(target, tex);
              gl.texImage2D(f.face, level, internalFormat, format, type, imageBitmap);
              restorePackState(gl, options);
              if (shouldAutomaticallySetTextureFilteringForSize(options)) {
                setTextureFilteringForSize(gl, tex, options, width, height, internalFormat);
              }
            });
          });
        }
      } else if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
        const smallest = Math.min(element.width, element.height);
        const largest = Math.max(element.width, element.height);
        const depth = largest / smallest;
        if (depth % 1 !== 0) {
          throw "can not compute 3D dimensions of element";
        }
        const xMult = element.width  === largest ? 1 : 0;
        const yMult = element.height === largest ? 1 : 0;
        saveSkipState(gl);
        gl.pixelStorei(UNPACK_ALIGNMENT, 1);
        gl.pixelStorei(UNPACK_ROW_LENGTH, element.width);
        gl.pixelStorei(UNPACK_IMAGE_HEIGHT, 0);
        gl.pixelStorei(UNPACK_SKIP_IMAGES, 0);
        gl.texImage3D(target, level, internalFormat, smallest, smallest, smallest, 0, format, type, null);
        for (let d = 0; d < depth; ++d) {
          const srcX = d * smallest * xMult;
          const srcY = d * smallest * yMult;
          gl.pixelStorei(UNPACK_SKIP_PIXELS, srcX);
          gl.pixelStorei(UNPACK_SKIP_ROWS, srcY);
          gl.texSubImage3D(target, level, 0, 0, d, smallest, smallest, 1, format, type, element);
        }
        restoreSkipState(gl);
      } else {
        gl.texImage2D(target, level, internalFormat, format, type, element);
      }
      restorePackState(gl, options);
      if (shouldAutomaticallySetTextureFilteringForSize(options)) {
        setTextureFilteringForSize(gl, tex, options, width, height, internalFormat);
      }
      setTextureParameters(gl, tex, options);
    }

    function noop() {
    }

    /**
     * Checks whether the url's origin is the same so that we can set the `crossOrigin`
     * @param {string} url url to image
     * @returns {boolean} true if the window's origin is the same as image's url
     * @private
     */
    function urlIsSameOrigin(url) {
      if (typeof document !== 'undefined') {
        // for IE really
        const a = document.createElement('a');
        a.href = url;
        return a.hostname === location.hostname &&
               a.port     === location.port &&
               a.protocol === location.protocol;
      } else {
        const localOrigin = (new URL(location.href)).origin;
        const urlOrigin = (new URL(url, location.href)).origin;
        return urlOrigin === localOrigin;
      }
    }

    function setToAnonymousIfUndefinedAndURLIsNotSameOrigin(url, crossOrigin) {
      return crossOrigin === undefined && !urlIsSameOrigin(url)
         ? 'anonymous'
         : crossOrigin;
    }

    /**
     * Loads an image
     * @param {string} url url to image
     * @param {string} crossOrigin
     * @param {function(err, img)} [callback] a callback that's passed an error and the image. The error will be non-null
     *     if there was an error
     * @return {HTMLImageElement} the image being loaded.
     * @private
     */
    function loadImage(url, crossOrigin, callback) {
      callback = callback || noop;
      let img;
      crossOrigin = crossOrigin !== undefined ? crossOrigin : defaults$1.crossOrigin;
      crossOrigin = setToAnonymousIfUndefinedAndURLIsNotSameOrigin(url, crossOrigin);
      if (typeof Image !== 'undefined') {
        img = new Image();
        if (crossOrigin !== undefined) {
          img.crossOrigin = crossOrigin;
        }

        const clearEventHandlers = function clearEventHandlers() {
          img.removeEventListener('error', onError);  // eslint-disable-line
          img.removeEventListener('load', onLoad);  // eslint-disable-line
          img = null;
        };

        const onError = function onError() {
          const msg = "couldn't load image: " + url;
          error(msg);
          callback(msg, img);
          clearEventHandlers();
        };

        const onLoad = function onLoad() {
          callback(null, img);
          clearEventHandlers();
        };

        img.addEventListener('error', onError);
        img.addEventListener('load', onLoad);
        img.src = url;
        return img;
      } else if (typeof ImageBitmap !== 'undefined') {
        let err;
        let bm;
        const cb = function cb() {
          callback(err, bm);
        };

        const options = {};
        if (crossOrigin) {
          options.mode = 'cors'; // TODO: not sure how to translate image.crossOrigin
        }
        fetch(url, options).then(function(response) {
          if (!response.ok) {
            throw response;
          }
          return response.blob();
        }).then(function(blob) {
          return createImageBitmap(blob, {
            premultiplyAlpha: 'none',
            colorSpaceConversion: 'none',
          });
        }).then(function(bitmap) {
          // not sure if this works. We don't want
          // to catch the user's error. So, call
          // the callback in a timeout so we're
          // not in this scope inside the promise.
          bm = bitmap;
          setTimeout(cb);
        }).catch(function(e) {
          err = e;
          setTimeout(cb);
        });
        img = null;
      }
      return img;
    }

    /**
     * check if object is a TexImageSource
     *
     * @param {Object} obj Object to test
     * @return {boolean} true if object is a TexImageSource
     * @private
     */
    function isTexImageSource(obj) {
      return (typeof ImageBitmap !== 'undefined' && obj instanceof ImageBitmap) ||
             (typeof ImageData !== 'undefined'  && obj instanceof ImageData) ||
             (typeof HTMLElement !== 'undefined'  && obj instanceof HTMLElement);
    }

    /**
     * if obj is an TexImageSource then just
     * uses it otherwise if obj is a string
     * then load it first.
     *
     * @param {string|TexImageSource} obj
     * @param {string} crossOrigin
     * @param {function(err, img)} [callback] a callback that's passed an error and the image. The error will be non-null
     *     if there was an error
     * @private
     */
    function loadAndUseImage(obj, crossOrigin, callback) {
      if (isTexImageSource(obj)) {
        setTimeout(function() {
          callback(null, obj);
        });
        return obj;
      }

      return loadImage(obj, crossOrigin, callback);
    }

    /**
     * Sets a texture to a 1x1 pixel color. If `options.color === false` is nothing happens. If it's not set
     * the default texture color is used which can be set by calling `setDefaultTextureColor`.
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @param {WebGLTexture} tex the WebGLTexture to set parameters for
     * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
     *   This is often the same options you passed in when you created the texture.
     * @memberOf module:twgl/textures
     */
    function setTextureTo1PixelColor(gl, tex, options) {
      options = options || defaults$1.textureOptions;
      const target = options.target || TEXTURE_2D;
      gl.bindTexture(target, tex);
      if (options.color === false) {
        return;
      }
      // Assume it's a URL
      // Put 1x1 pixels in texture. That makes it renderable immediately regardless of filtering.
      const color = make1Pixel(options.color);
      if (target === TEXTURE_CUBE_MAP) {
        for (let ii = 0; ii < 6; ++ii) {
          gl.texImage2D(TEXTURE_CUBE_MAP_POSITIVE_X + ii, 0, RGBA, 1, 1, 0, RGBA, UNSIGNED_BYTE$2, color);
        }
      } else if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
        gl.texImage3D(target, 0, RGBA, 1, 1, 1, 0, RGBA, UNSIGNED_BYTE$2, color);
      } else {
        gl.texImage2D(target, 0, RGBA, 1, 1, 0, RGBA, UNSIGNED_BYTE$2, color);
      }
    }

    /**
     * The src image(s) used to create a texture.
     *
     * When you call {@link module:twgl.createTexture} or {@link module:twgl.createTextures}
     * you can pass in urls for images to load into the textures. If it's a single url
     * then this will be a single HTMLImageElement. If it's an array of urls used for a cubemap
     * this will be a corresponding array of images for the cubemap.
     *
     * @typedef {HTMLImageElement|HTMLImageElement[]} TextureSrc
     * @memberOf module:twgl
     */

    /**
     * A callback for when an image finished downloading and been uploaded into a texture
     * @callback TextureReadyCallback
     * @param {*} err If truthy there was an error.
     * @param {WebGLTexture} texture the texture.
     * @param {module:twgl.TextureSrc} source image(s) used to as the src for the texture
     * @memberOf module:twgl
     */

    /**
     * A callback for when all images have finished downloading and been uploaded into their respective textures
     * @callback TexturesReadyCallback
     * @param {*} err If truthy there was an error.
     * @param {Object.<string, WebGLTexture>} textures the created textures by name. Same as returned by {@link module:twgl.createTextures}.
     * @param {Object.<string, module:twgl.TextureSrc>} sources the image(s) used for the texture by name.
     * @memberOf module:twgl
     */

    /**
     * A callback for when an image finished downloading and been uploaded into a texture
     * @callback CubemapReadyCallback
     * @param {*} err If truthy there was an error.
     * @param {WebGLTexture} tex the texture.
     * @param {HTMLImageElement[]} imgs the images for each face.
     * @memberOf module:twgl
     */

    /**
     * A callback for when an image finished downloading and been uploaded into a texture
     * @callback ThreeDReadyCallback
     * @param {*} err If truthy there was an error.
     * @param {WebGLTexture} tex the texture.
     * @param {HTMLImageElement[]} imgs the images for each slice.
     * @memberOf module:twgl
     */

    /**
     * Loads a texture from an image from a Url as specified in `options.src`
     * If `options.color !== false` will set the texture to a 1x1 pixel color so that the texture is
     * immediately useable. It will be updated with the contents of the image once the image has finished
     * downloading. Filtering options will be set as appropriate for image unless `options.auto === false`.
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @param {WebGLTexture} tex the WebGLTexture to set parameters for
     * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
     * @param {module:twgl.TextureReadyCallback} [callback] A function to be called when the image has finished loading. err will
     *    be non null if there was an error.
     * @return {HTMLImageElement} the image being downloaded.
     * @memberOf module:twgl/textures
     */
    function loadTextureFromUrl(gl, tex, options, callback) {
      callback = callback || noop;
      options = options || defaults$1.textureOptions;
      setTextureTo1PixelColor(gl, tex, options);
      // Because it's async we need to copy the options.
      options = Object.assign({}, options);
      const img = loadAndUseImage(options.src, options.crossOrigin, function(err, img) {
        if (err) {
          callback(err, tex, img);
        } else {
          setTextureFromElement(gl, tex, img, options);
          callback(null, tex, img);
        }
      });
      return img;
    }

    /**
     * Loads a cubemap from 6 urls or TexImageSources as specified in `options.src`. Will set the cubemap to a 1x1 pixel color
     * so that it is usable immediately unless `option.color === false`.
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @param {WebGLTexture} tex the WebGLTexture to set parameters for
     * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
     * @param {module:twgl.CubemapReadyCallback} [callback] A function to be called when all the images have finished loading. err will
     *    be non null if there was an error.
     * @memberOf module:twgl/textures
     */
    function loadCubemapFromUrls(gl, tex, options, callback) {
      callback = callback || noop;
      const urls = options.src;
      if (urls.length !== 6) {
        throw "there must be 6 urls for a cubemap";
      }
      const level = options.level || 0;
      const internalFormat = options.internalFormat || options.format || RGBA;
      const formatType = getFormatAndTypeForInternalFormat(internalFormat);
      const format = options.format || formatType.format;
      const type = options.type || UNSIGNED_BYTE$2;
      const target = options.target || TEXTURE_2D;
      if (target !== TEXTURE_CUBE_MAP) {
        throw "target must be TEXTURE_CUBE_MAP";
      }
      setTextureTo1PixelColor(gl, tex, options);
      // Because it's async we need to copy the options.
      options = Object.assign({}, options);
      let numToLoad = 6;
      const errors = [];
      const faces = getCubeFaceOrder(gl, options);
      let imgs;  // eslint-disable-line

      function uploadImg(faceTarget) {
        return function(err, img) {
          --numToLoad;
          if (err) {
            errors.push(err);
          } else {
            if (img.width !== img.height) {
              errors.push("cubemap face img is not a square: " + img.src);
            } else {
              savePackState(gl, options);
              gl.bindTexture(target, tex);

              // So assuming this is the first image we now have one face that's img sized
              // and 5 faces that are 1x1 pixel so size the other faces
              if (numToLoad === 5) {
                // use the default order
                getCubeFaceOrder().forEach(function(otherTarget) {
                  // Should we re-use the same face or a color?
                  gl.texImage2D(otherTarget, level, internalFormat, format, type, img);
                });
              } else {
                gl.texImage2D(faceTarget, level, internalFormat, format, type, img);
              }

              restorePackState(gl, options);
              if (shouldAutomaticallySetTextureFilteringForSize(options)) {
                gl.generateMipmap(target);
              }
            }
          }

          if (numToLoad === 0) {
            callback(errors.length ? errors : undefined, tex, imgs);
          }
        };
      }

      imgs = urls.map(function(url, ndx) {
        return loadAndUseImage(url, options.crossOrigin, uploadImg(faces[ndx]));
      });
    }

    /**
     * Loads a 2d array or 3d texture from urls OR TexImageSources as specified in `options.src`.
     * Will set the texture to a 1x1 pixel color
     * so that it is usable immediately unless `option.color === false`.
     *
     * If the width and height is not specified the width and height of the first
     * image loaded will be used. Note that since images are loaded async
     * which image downloads first is unknown.
     *
     * If an image is not the same size as the width and height it will be scaled
     * to that width and height.
     *
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @param {WebGLTexture} tex the WebGLTexture to set parameters for
     * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
     * @param {module:twgl.ThreeDReadyCallback} [callback] A function to be called when all the images have finished loading. err will
     *    be non null if there was an error.
     * @memberOf module:twgl/textures
     */
    function loadSlicesFromUrls(gl, tex, options, callback) {
      callback = callback || noop;
      const urls = options.src;
      const internalFormat = options.internalFormat || options.format || RGBA;
      const formatType = getFormatAndTypeForInternalFormat(internalFormat);
      const format = options.format || formatType.format;
      const type = options.type || UNSIGNED_BYTE$2;
      const target = options.target || TEXTURE_2D_ARRAY;
      if (target !== TEXTURE_3D && target !== TEXTURE_2D_ARRAY) {
        throw "target must be TEXTURE_3D or TEXTURE_2D_ARRAY";
      }
      setTextureTo1PixelColor(gl, tex, options);
      // Because it's async we need to copy the options.
      options = Object.assign({}, options);
      let numToLoad = urls.length;
      const errors = [];
      let imgs;  // eslint-disable-line
      const level = options.level || 0;
      let width = options.width;
      let height = options.height;
      const depth = urls.length;
      let firstImage = true;

      function uploadImg(slice) {
        return function(err, img) {
          --numToLoad;
          if (err) {
            errors.push(err);
          } else {
            savePackState(gl, options);
            gl.bindTexture(target, tex);

            if (firstImage) {
              firstImage = false;
              width = options.width || img.width;
              height = options.height || img.height;
              gl.texImage3D(target, level, internalFormat, width, height, depth, 0, format, type, null);

              // put it in every slice otherwise some slices will be 0,0,0,0
              for (let s = 0; s < depth; ++s) {
                gl.texSubImage3D(target, level, 0, 0, s, width, height, 1, format, type, img);
              }
            } else {
              let src = img;
              let ctx;
              if (img.width !== width || img.height !== height) {
                // Size the image to fix
                ctx = getShared2DContext();
                src = ctx.canvas;
                ctx.canvas.width = width;
                ctx.canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
              }

              gl.texSubImage3D(target, level, 0, 0, slice, width, height, 1, format, type, src);

              // free the canvas memory
              if (ctx && src === ctx.canvas) {
                ctx.canvas.width = 0;
                ctx.canvas.height = 0;
              }
            }

            restorePackState(gl, options);
            if (shouldAutomaticallySetTextureFilteringForSize(options)) {
              gl.generateMipmap(target);
            }
          }

          if (numToLoad === 0) {
            callback(errors.length ? errors : undefined, tex, imgs);
          }
        };
      }

      imgs = urls.map(function(url, ndx) {
        return loadAndUseImage(url, options.crossOrigin, uploadImg(ndx));
      });
    }

    /**
     * Sets a texture from an array or typed array. If the width or height is not provided will attempt to
     * guess the size. See {@link module:twgl.TextureOptions}.
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @param {WebGLTexture} tex the WebGLTexture to set parameters for
     * @param {(number[]|ArrayBufferView)} src An array or typed arry with texture data.
     * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
     *   This is often the same options you passed in when you created the texture.
     * @memberOf module:twgl/textures
     */
    function setTextureFromArray(gl, tex, src, options) {
      options = options || defaults$1.textureOptions;
      const target = options.target || TEXTURE_2D;
      gl.bindTexture(target, tex);
      let width = options.width;
      let height = options.height;
      let depth = options.depth;
      const level = options.level || 0;
      const internalFormat = options.internalFormat || options.format || RGBA;
      const formatType = getFormatAndTypeForInternalFormat(internalFormat);
      const format = options.format || formatType.format;
      const type = options.type || getTextureTypeForArrayType(gl, src, formatType.type);
      if (!isArrayBuffer$1(src)) {
        const Type = getTypedArrayTypeForGLType(type);
        src = new Type(src);
      } else if (src instanceof Uint8ClampedArray) {
        src = new Uint8Array(src.buffer);
      }

      const bytesPerElement = getBytesPerElementForInternalFormat(internalFormat, type);
      const numElements = src.byteLength / bytesPerElement;  // TODO: check UNPACK_ALIGNMENT?
      if (numElements % 1) {
        throw "length wrong size for format: " + glEnumToString(gl, format);
      }
      let dimensions;
      if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
        if (!width && !height && !depth) {
          const size = Math.cbrt(numElements);
          if (size % 1 !== 0) {
            throw "can't guess cube size of array of numElements: " + numElements;
          }
          width = size;
          height = size;
          depth = size;
        } else if (width && (!height || !depth)) {
          dimensions = guessDimensions(gl, target, height, depth, numElements / width);
          height = dimensions.width;
          depth = dimensions.height;
        } else if (height && (!width || !depth)) {
          dimensions = guessDimensions(gl, target, width, depth, numElements / height);
          width = dimensions.width;
          depth = dimensions.height;
        } else {
          dimensions = guessDimensions(gl, target, width, height, numElements / depth);
          width = dimensions.width;
          height = dimensions.height;
        }
      } else {
        dimensions = guessDimensions(gl, target, width, height, numElements);
        width = dimensions.width;
        height = dimensions.height;
      }
      saveSkipState(gl);
      gl.pixelStorei(UNPACK_ALIGNMENT, options.unpackAlignment || 1);
      savePackState(gl, options);
      if (target === TEXTURE_CUBE_MAP) {
        const elementsPerElement = bytesPerElement / src.BYTES_PER_ELEMENT;
        const faceSize = numElements / 6 * elementsPerElement;

        getCubeFacesWithNdx(gl, options).forEach(f => {
          const offset = faceSize * f.ndx;
          const data = src.subarray(offset, offset + faceSize);
          gl.texImage2D(f.face, level, internalFormat, width, height, 0, format, type, data);
        });
      } else if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
        gl.texImage3D(target, level, internalFormat, width, height, depth, 0, format, type, src);
      } else {
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, src);
      }
      restorePackState(gl, options);
      restoreSkipState(gl);
      return {
        width: width,
        height: height,
        depth: depth,
        type: type,
      };
    }

    /**
     * Sets a texture with no contents of a certain size. In other words calls `gl.texImage2D` with `null`.
     * You must set `options.width` and `options.height`.
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @param {WebGLTexture} tex the WebGLTexture to set parameters for
     * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
     * @memberOf module:twgl/textures
     */
    function setEmptyTexture(gl, tex, options) {
      const target = options.target || TEXTURE_2D;
      gl.bindTexture(target, tex);
      const level = options.level || 0;
      const internalFormat = options.internalFormat || options.format || RGBA;
      const formatType = getFormatAndTypeForInternalFormat(internalFormat);
      const format = options.format || formatType.format;
      const type = options.type || formatType.type;
      savePackState(gl, options);
      if (target === TEXTURE_CUBE_MAP) {
        for (let ii = 0; ii < 6; ++ii) {
          gl.texImage2D(TEXTURE_CUBE_MAP_POSITIVE_X + ii, level, internalFormat, options.width, options.height, 0, format, type, null);
        }
      } else if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
        gl.texImage3D(target, level, internalFormat, options.width, options.height, options.depth, 0, format, type, null);
      } else {
        gl.texImage2D(target, level, internalFormat, options.width, options.height, 0, format, type, null);
      }
      restorePackState(gl, options);
    }

    /**
     * Creates a texture based on the options passed in.
     * @param {WebGLRenderingContext} gl the WebGLRenderingContext
     * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
     * @param {module:twgl.TextureReadyCallback} [callback] A callback called when an image has been downloaded and uploaded to the texture.
     * @return {WebGLTexture} the created texture.
     * @memberOf module:twgl/textures
     */
    function createTexture(gl, options, callback) {
      callback = callback || noop;
      options = options || defaults$1.textureOptions;
      const tex = gl.createTexture();
      const target = options.target || TEXTURE_2D;
      let width  = options.width  || 1;
      let height = options.height || 1;
      const internalFormat = options.internalFormat || RGBA;
      gl.bindTexture(target, tex);
      if (target === TEXTURE_CUBE_MAP) {
        // this should have been the default for cubemaps :(
        gl.texParameteri(target, TEXTURE_WRAP_S, CLAMP_TO_EDGE);
        gl.texParameteri(target, TEXTURE_WRAP_T, CLAMP_TO_EDGE);
      }
      let src = options.src;
      if (src) {
        if (typeof src === "function") {
          src = src(gl, options);
        }
        if (typeof (src) === "string") {
          loadTextureFromUrl(gl, tex, options, callback);
        } else if (isArrayBuffer$1(src) ||
                   (Array.isArray(src) && (
                        typeof src[0] === 'number' ||
                        Array.isArray(src[0]) ||
                        isArrayBuffer$1(src[0]))
                   )
                  ) {
          const dimensions = setTextureFromArray(gl, tex, src, options);
          width  = dimensions.width;
          height = dimensions.height;
        } else if (Array.isArray(src) && (typeof (src[0]) === 'string' || isTexImageSource(src[0]))) {
          if (target === TEXTURE_CUBE_MAP) {
            loadCubemapFromUrls(gl, tex, options, callback);
          } else {
            loadSlicesFromUrls(gl, tex, options, callback);
          }
        } else if (isTexImageSource(src)) {
          setTextureFromElement(gl, tex, src, options);
          width  = src.width;
          height = src.height;
        } else {
          throw "unsupported src type";
        }
      } else {
        setEmptyTexture(gl, tex, options);
      }
      if (shouldAutomaticallySetTextureFilteringForSize(options)) {
        setTextureFilteringForSize(gl, tex, options, width, height, internalFormat);
      }
      setTextureParameters(gl, tex, options);
      return tex;
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

    const renderers = [];
    let gl;
    function init(canvas) {
        let gl_n = canvas.getContext('webgl2', { preserveDrawingBuffer: true });
        if (!gl_n) {
            console.warn('WebGL2 not supported: trying webgl v1');
            gl_n = canvas.getContext('webgl');
        }
        if (!gl_n) {
            console.error('Webgl is not supported');
            return;
        }
        gl = gl_n;
        gl.clearColor(1, 1, 1, 1);
        setAttributePrefix("a_");
        for (const renderer of renderers) {
            if (renderer === null)
                continue;
            renderer.init(gl);
        }
        requestAnimationFrame(draw);
    }
    function draw(time) {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        for (const renderer of renderers) {
            if (renderer === null)
                continue;
            renderer.draw(time);
        }
        requestAnimationFrame(draw);
    }
    function addRenderer(renderer) {
        if (gl === null) {
            console.error('RenderingContext not initialized: run init() first.');
            return -1;
        }
        renderer.init(gl);
        return renderers.push(renderer) - 1;
    }

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

    class TextureAtlas {
        constructor(chars, font, size) {
            this.properties = {};
            if (typeof chars === 'string') {
                chars = chars.split('');
            }
            this.chars = chars;
            this.font = font;
            this.size = size;
            this.initCanvas();
            this.buildProperties();
            for (const char of chars) {
                const { width, x } = this.properties[char];
                this.ctx.fillText(char, x, 0);
            }
            document.body.append(this.canvas);
        }
        initCanvas() {
            const canvas = document.createElement('canvas');
            canvas.height = this.size;
            const ctx = canvas.getContext('2d');
            if (!ctx)
                throw Error('No 2d canvas');
            this.canvas = canvas;
            this.ctx = ctx;
        }
        setStyle() {
            this.ctx.font = `${this.size}px ${this.font}`;
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'top';
            this.ctx.direction = 'ltr';
            this.ctx.fillStyle = '#000';
        }
        buildProperties() {
            let pos = 0;
            this.setStyle();
            for (const char of this.chars) {
                const info = this.ctx.measureText(char);
                this.properties[char] = {
                    width: info.width,
                    x: pos
                };
                pos += info.width;
            }
            this.canvas.width = pos;
            this.setStyle();
        }
        getCharProp(chr) {
            return this.properties[chr];
        }
        createTexture(gl) {
            const options = {
                target: gl.TEXTURE_2D,
                src: this.canvas
            };
            return new Promise(resolve => {
                createTexture(gl, options, resolve);
            });
        }
        createCoords(text) {
            const len = text.length;
            const position = new Float32Array(len * 2);
            const texcoords = new Float32Array(len * 2);
            const texWidth = this.canvas.width;
            const texHeight = this.canvas.height;
            let cursor = 0;
            for (let i = 0; i < len; i++) {
                const char = text[i];
                const info = this.properties[char];
                const texleft = info.x / texWidth;
                const texRight = texleft + info.width / texWidth;
                const texTop = 0;
                const texBottom = this.size / texHeight;
                const vertLeft = cursor;
                const vertRight = cursor + info.width;
                const vertTop = 0;
                const vertBottom = this.size;
                const offset = i * 12;
                // Top left
                position[offset] = vertLeft;
                position[offset + 1] = vertTop;
                texcoords[offset] = texleft;
                texcoords[offset + 1] = texTop;
                // Bottom right
                position[offset + 2] = vertRight;
                position[offset + 3] = vertBottom;
                texcoords[offset + 2] = texRight;
                texcoords[offset + 3] = texBottom;
                // bottom left
                position[offset + 4] = vertLeft;
                position[offset + 5] = vertBottom;
                texcoords[offset + 4] = texleft;
                texcoords[offset + 5] = texBottom;
                // Top left
                position[offset + 6] = vertLeft;
                position[offset + 7] = vertTop;
                texcoords[offset + 6] = texleft;
                texcoords[offset + 7] = texTop;
                // Bottom right
                position[offset + 8] = vertRight;
                position[offset + 9] = vertBottom;
                texcoords[offset + 8] = texRight;
                texcoords[offset + 9] = texBottom;
                // top right
                position[offset + 10] = vertRight;
                position[offset + 11] = vertTop;
                texcoords[offset + 10] = texRight;
                texcoords[offset + 11] = texTop;
            }
            return {
                arrays: {
                    position,
                    texcoords
                },
                numVertices: len * 2
            };
        }
        static async build() {
        }
    }

    var vs = "#version 300 es\r\n\r\nprecision mediump float;\r\n\r\nin vec2 a_position;\r\nin uint a_type;\r\n\r\nuniform vec2 resolution;\r\nuniform vec4 window;\r\nuniform int num_x;\r\nuniform int num_y;\r\nuniform vec4 tick_lim;\r\n\r\nflat out uint v_type;\r\n\r\n\r\nvec3 widths = vec3(2.0, 1.0, 0.8);\r\n\r\nvec2 get_line_v() {\r\n    vec2 pos = a_position;\r\n    pos.x /= resolution.x;\r\n    pos.x *= widths[a_type & uint(3)];\r\n    return pos;\r\n}\r\n\r\nvec2 get_line_h() {\r\n    vec2 pos = a_position;\r\n    pos.y /= resolution.y;\r\n    pos.y *= widths[a_type & uint(3)];\r\n    return pos;\r\n}\r\n\r\nfloat get_offset_v() {\r\n    float window_width = window[1] - window[0];\r\n    float window_height = window[3] - window[2];\r\n\r\n    float view_width = tick_lim[1] - tick_lim[0];\r\n    float spacing = view_width / float(num_x);\r\n    float offset = tick_lim[0] + spacing * float(gl_InstanceID);\r\n    offset = (offset - window[0]) / window_width * 2.;\r\n    offset -= 1.;\r\n    return offset;\r\n}\r\n\r\nfloat get_offset_h() {\r\n    float window_width = window[1] - window[0];\r\n    float window_height = window[3] - window[2];\r\n\r\n    float view_height = tick_lim[3] - tick_lim[2];\r\n    float spacing = view_height / float(num_y);\r\n    float offset = tick_lim[2] + spacing * float(gl_InstanceID - num_x);\r\n    offset = (offset - window[2]) / window_height * 2.;\r\n    offset -= 1.;\r\n    return offset;\r\n}\r\n\r\nvoid main() {\r\n    bool axis = a_type < uint(4);\r\n//    float offset = get_offset();\r\n    vec2 pos;\r\n    if(axis) {\r\n        pos = get_line_v();\r\n        pos.x += get_offset_v();\r\n    } else {\r\n        pos = get_line_h();\r\n        pos.y += get_offset_h();\r\n    }\r\n    gl_Position = vec4(pos, 0, 1);\r\n    v_type = a_type;\r\n}\r\n";

    var fs = "#version 300 es\r\n#define red vec4(1., 0., 0, 1.)\r\n#define blue vec4(0., 0., 1., 1.)\r\n#define gray vec4(0., 0., 0., .5)\r\n#define black vec4(0., 0., 0., 1.)\r\n\r\nprecision mediump float;\r\n\r\nuniform vec2 resolution; // width, height\r\nuniform vec4 window; // min_x, max_x, min_y, max_y\r\n\r\nflat in uint v_type;\r\n\r\nout vec4 o_color;\r\nvec4 colors[8] = vec4[8](red, black, gray, gray, blue, black, gray, gray);\r\n\r\nvoid main() {\r\n    highp vec2 pos = gl_FragCoord.xy;\r\n\r\n    o_color = colors[v_type];\r\n}\r\n";

    const square = new Float32Array([1, 1, -1, 1, -1, -1, -1, -1, 1, -1, 1, 1]);

    let gl$1;
    let programInfo;
    let bufferInfo;
    /*
     0-3: x, 4-7 : y
     + 0: axis
     + 1: major
     + 2: minor
     */
    const type_buffer = new Uint8Array(100); // TODO: Better max
    const arrays = {
        position: { data: square, numComponents: 2 },
        type: { data: type_buffer, numComponents: 1, divisor: 1 }
    };
    const uniforms = {
        resolution: new Float32Array([0, 0]),
        window: new Float32Array([0, 0, 0, 0]),
        num_x: 0,
        num_y: 0,
        tick_lim: new Float32Array([0, 0, 0, 0])
    };
    function init$1(glIn) {
        const atlas = new TextureAtlas('0123456789e.,', 'serif', 16);
        console.log(atlas);
        gl$1 = glIn;
        tickerX();
        settings.window.subscribe('min_x', (val) => {
            uniforms.window[0] = val;
            tickerX();
        });
        settings.window.subscribe('max_x', (val) => {
            uniforms.window[1] = val;
            tickerX();
        });
        console.log(uniforms);
        programInfo = createProgramInfo(gl$1, [vs, fs]);
        //init uniforms
        // twgl.setUniforms(programInfo, uniforms);
        bufferInfo = createBufferInfoFromArrays(gl$1, arrays);
        console.log(bufferInfo, gl$1.UNSIGNED_INT);
    }
    function draw$1(time) {
        uniforms.resolution[0] = gl$1.canvas.width;
        uniforms.resolution[1] = gl$1.canvas.height;
        uniforms.window[0] = settings.window.get('min_x');
        uniforms.window[1] = settings.window.get('max_x');
        uniforms.window[2] = settings.window.get('min_y');
        uniforms.window[3] = settings.window.get('max_y');
        gl$1.useProgram(programInfo.program);
        setBuffersAndAttributes(gl$1, programInfo, bufferInfo);
        setUniforms(programInfo, uniforms);
        drawBufferInfo(gl$1, bufferInfo, gl$1.TRIANGLES, bufferInfo.numElements, 0, uniforms.num_x + uniforms.num_y);
    }
    function destroy() {
    }
    function tickerX() {
        const tx = ticker(settings.window.get('min_x'), settings.window.get('max_x'));
        const ty = ticker(settings.window.get('min_y'), settings.window.get('max_y'));
        type_buffer.fill(1, 0, tx.num_tick);
        type_buffer.fill(5, tx.num_tick, tx.num_tick + ty.num_tick);
        if (tx.zero_tick)
            type_buffer[tx.zero_tick] = 0;
        if (ty.zero_tick)
            type_buffer[tx.num_tick + ty.zero_tick] = 4;
        console.log(type_buffer);
        if (bufferInfo != undefined) {
            setBuffersAndAttributes(gl$1, programInfo, bufferInfo);
        }
        uniforms.num_x = tx.num_tick;
        uniforms.num_y = ty.num_tick;
        uniforms.tick_lim[0] = tx.min_tick + tx.offset;
        uniforms.tick_lim[1] = tx.max_tick + tx.offset;
        uniforms.tick_lim[2] = ty.min_tick + ty.offset;
        uniforms.tick_lim[3] = ty.max_tick + ty.offset;
    }
    // inspired from matplotlib MaxNLocator
    function ticker(val_min, val_max) {
        // const desiredSteps = 10;
        const min_ticks = 9;
        const mean = (val_max + val_min) / 2;
        const offset = Math.sign(mean) * 10 ** (Math.floor(Math.log10(Math.abs(mean))));
        val_min -= offset;
        val_max -= offset;
        // const raw_step = (val_max - val_min) / desiredSteps;
        const steps = [100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1];
        for (const step of steps) {
            const min_tick = Math.ceil(val_min / step) * step;
            const max_tick = Math.floor(val_max / step) * step;
            const num_tick = (max_tick - min_tick) / step;
            if (num_tick >= min_ticks) {
                // type_buffer.fill(1);
                // console.log(type_buffer);
                let zero_tick = -1;
                if (min_tick <= 0 && max_tick >= 0) {
                    zero_tick = -Math.round(min_tick / step);
                }
                return { min_tick, max_tick, zero_tick, num_tick, step, offset };
            }
        }
        return { min_tick: 0, max_tick: 0, zero_tick: 0, num_tick: 0, step: 0, offset: 0 };
    }

    var gridRenderer = /*#__PURE__*/Object.freeze({
        __proto__: null,
        init: init$1,
        draw: draw$1,
        destroy: destroy
    });

    let gl$2;
    let programInfo$1;
    let bufferInfo$1;
    const NEEDED_CHARS = '0123456789e.,';
    const MAX_CHARS = 1000;
    let atlas;
    let texture;
    const offset = new Float32Array(MAX_CHARS * 2);
    const letter = new Int8Array(MAX_CHARS);
    const width = new Float32Array(MAX_CHARS);
    let freeIndex = 0;
    const arrays$1 = {
        positions: { data: square, numComponents: 2 },
        offset: { data: offset, numComponents: 2, divisor: 1 },
        letter: { data: letter, numComponents: 1, divisor: 1 },
        width: { data: width, numComponents: 1, divisor: 1 }
    };
    const uniforms$1 = {
        resolution: new Float32Array([0, 0]),
        atlas: undefined,
        height: 16,
    };
    function init$2(gl_in) {
        gl$2 = gl_in;
        atlas = new TextureAtlas(NEEDED_CHARS, 'Arial', uniforms$1.height);
        texture = atlas.createTexture(gl$2);
        uniforms$1.atlas = texture;
        programInfo$1 = createProgramInfo(gl$2, [vs, fs]);
        bufferInfo$1 = createBufferInfoFromArrays(gl$2, arrays$1);
    }
    function addTextBox(length, str = '', x = 0, y = 0) {
        const index = freeIndex;
        freeIndex += length;
        const textBox = {
            length,
            index,
            x,
            y
        };
        setText(str, textBox);
        return textBox;
    }
    function setText(text, textBox) {
        if (text.length > textBox.length) {
            throw Error('Text is to long');
        }
        let cursor = textBox.x;
        for (let i = 0; i < text.length; i++) {
            const chr = text[i];
            const prop = atlas.getCharProp(chr);
            offset[i * 2] = cursor;
            offset[i * 2 + 1] = textBox.y;
            letter[i] = prop.x;
            width[i] = prop.width;
            cursor += prop.width;
        }
        createBufferInfoFromArrays(gl$2, arrays$1, bufferInfo$1);
    }
    function draw$2(time) {
        uniforms$1.resolution[0] = gl$2.canvas.width;
        uniforms$1.resolution[1] = gl$2.canvas.height;
        console.log(bufferInfo$1);
        gl$2.useProgram(programInfo$1.program);
        setBuffersAndAttributes(gl$2, programInfo$1, bufferInfo$1);
        setUniforms(programInfo$1, uniforms$1);
        drawBufferInfo(gl$2, bufferInfo$1, gl$2.TRIANGLES, bufferInfo$1.numElements, 0, freeIndex);
        //
    }
    function destroy$1() {
    }

    var textRenderer = /*#__PURE__*/Object.freeze({
        __proto__: null,
        init: init$2,
        addTextBox: addTextBox,
        setText: setText,
        draw: draw$2,
        destroy: destroy$1
    });

    class PlotDisplay extends CustomElement {
        constructor() {
            super();
            this.canvas = this.refs.canvas;
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
            init(canvas);
            addRenderer(gridRenderer);
            addRenderer(textRenderer);
            const textBox = addTextBox(5, '01234');
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
                /*background-color: white;*/
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
