var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var wasm;
var heap = new Array(32).fill(undefined);
heap.push(undefined, null, true, false);
function getObject(idx) { return heap[idx]; }
var heap_next = heap.length;
function dropObject(idx) {
    if (idx < 36)
        return;
    heap[idx] = heap_next;
    heap_next = idx;
}
function takeObject(idx) {
    var ret = getObject(idx);
    dropObject(idx);
    return ret;
}
function isLikeNone(x) {
    return x === undefined || x === null;
}
var cachedFloat64Memory0 = new Float64Array();
function getFloat64Memory0() {
    if (cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}
var cachedInt32Memory0 = new Int32Array();
function getInt32Memory0() {
    if (cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}
var WASM_VECTOR_LEN = 0;
var cachedUint8Memory0 = new Uint8Array();
function getUint8Memory0() {
    if (cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}
var cachedTextEncoder = new TextEncoder('utf-8');
var encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
    }
    : function (arg, view) {
        var buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    });
function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        var buf = cachedTextEncoder.encode(arg);
        var ptr_1 = malloc(buf.length);
        getUint8Memory0().subarray(ptr_1, ptr_1 + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr_1;
    }
    var len = arg.length;
    var ptr = malloc(len);
    var mem = getUint8Memory0();
    var offset = 0;
    for (; offset < len; offset++) {
        var code = arg.charCodeAt(offset);
        if (code > 0x7F)
            break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        var view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        var ret = encodeString(arg, view);
        offset += ret.written;
    }
    WASM_VECTOR_LEN = offset;
    return ptr;
}
function addHeapObject(obj) {
    if (heap_next === heap.length)
        heap.push(heap.length + 1);
    var idx = heap_next;
    heap_next = heap[idx];
    heap[idx] = obj;
    return idx;
}
var cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
function debugString(val) {
    // primitive types
    var type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return "".concat(val);
    }
    if (type == 'string') {
        return "\"".concat(val, "\"");
    }
    if (type == 'symbol') {
        var description = val.description;
        if (description == null) {
            return 'Symbol';
        }
        else {
            return "Symbol(".concat(description, ")");
        }
    }
    if (type == 'function') {
        var name_1 = val.name;
        if (typeof name_1 == 'string' && name_1.length > 0) {
            return "Function(".concat(name_1, ")");
        }
        else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        var length_1 = val.length;
        var debug = '[';
        if (length_1 > 0) {
            debug += debugString(val[0]);
        }
        for (var i = 1; i < length_1; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    var builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    var className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    }
    else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        }
        catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return "".concat(val.name, ": ").concat(val.message, "\n").concat(val.stack);
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}
var cachedUint32Memory0 = new Uint32Array();
function getUint32Memory0() {
    if (cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}
function passArrayJsValueToWasm0(array, malloc) {
    var ptr = malloc(array.length * 4);
    var mem = getUint32Memory0();
    for (var i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}
var cachedFloat32Memory0 = new Float32Array();
function getFloat32Memory0() {
    if (cachedFloat32Memory0.byteLength === 0) {
        cachedFloat32Memory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32Memory0;
}
function getArrayF32FromWasm0(ptr, len) {
    return getFloat32Memory0().subarray(ptr / 4, ptr / 4 + len);
}
/**
* @param {number} tone
* @param {number} base
* @param {any[]} mods
* @returns {Float32Array}
*/
export function play(tone, base, mods) {
    try {
        var retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        var ptr0 = passArrayJsValueToWasm0(mods, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.play(retptr, tone, base, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v1 = getArrayF32FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 4);
        return v1;
    }
    finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}
function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
* @param {number} tone
* @param {number} base
* @param {any[]} mods
* @returns {Uint8Array}
*/
export function draw(tone, base, mods) {
    try {
        var retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        var ptr0 = passArrayJsValueToWasm0(mods, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.draw(retptr, tone, base, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v1 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v1;
    }
    finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}
/**
* @returns {Uint8Array}
*/
export function draw_oscillator() {
    try {
        var retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.draw_oscillator(retptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v0 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v0;
    }
    finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}
/**
* @param {number} shape
* @param {number} freq
* @returns {Uint8Array}
*/
export function draw_lfo(shape, freq) {
    try {
        var retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.draw_lfo(retptr, shape, freq);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v0 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v0;
    }
    finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}
function load(module, imports) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1, bytes, instance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(typeof Response === 'function' && module instanceof Response)) return [3 /*break*/, 7];
                    if (!(typeof WebAssembly.instantiateStreaming === 'function')) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, WebAssembly.instantiateStreaming(module, imports)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    e_1 = _a.sent();
                    if (module.headers.get('Content-Type') != 'application/wasm') {
                        console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e_1);
                    }
                    else {
                        throw e_1;
                    }
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, module.arrayBuffer()];
                case 5:
                    bytes = _a.sent();
                    return [4 /*yield*/, WebAssembly.instantiate(bytes, imports)];
                case 6: return [2 /*return*/, _a.sent()];
                case 7: return [4 /*yield*/, WebAssembly.instantiate(module, imports)];
                case 8:
                    instance = _a.sent();
                    if (instance instanceof WebAssembly.Instance) {
                        return [2 /*return*/, { instance: instance, module: module }];
                    }
                    else {
                        return [2 /*return*/, instance];
                    }
                    _a.label = 9;
                case 9: return [2 /*return*/];
            }
        });
    });
}
function getImports() {
    var imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_is_object = function (arg0) {
        var val = getObject(arg0);
        var ret = typeof (val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbindgen_is_null = function (arg0) {
        var ret = getObject(arg0) === null;
        return ret;
    };
    imports.wbg.__wbindgen_is_undefined = function (arg0) {
        var ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_boolean_get = function (arg0) {
        var v = getObject(arg0);
        var ret = typeof (v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_number_get = function (arg0, arg1) {
        var obj = getObject(arg1);
        var ret = typeof (obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbindgen_string_get = function (arg0, arg1) {
        var obj = getObject(arg1);
        var ret = typeof (obj) === 'string' ? obj : undefined;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_object_clone_ref = function (arg0) {
        var ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_2268d91a19a98b92 = function (arg0, arg1) {
        var ret = getObject(arg0)[takeObject(arg1)];
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_e5e48f4762c5610b = function (arg0) {
        var result;
        try {
            result = getObject(arg0) instanceof ArrayBuffer;
        }
        catch (_a) {
            result = false;
        }
        var ret = result;
        return ret;
    };
    imports.wbg.__wbg_new_8d2af00bc1e329ee = function (arg0, arg1) {
        var ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_isSafeInteger_dfa0593e8d7ac35a = function (arg0) {
        var ret = Number.isSafeInteger(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_buffer_3f3d764d4747d564 = function (arg0) {
        var ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_8c3f0052272a457a = function (arg0) {
        var ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_83db9690f9353e79 = function (arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_length_9e1ae1900cb0fbd5 = function (arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_971eeda69eb75003 = function (arg0) {
        var result;
        try {
            result = getObject(arg0) instanceof Uint8Array;
        }
        catch (_a) {
            result = false;
        }
        var ret = result;
        return ret;
    };
    imports.wbg.__wbindgen_debug_string = function (arg0, arg1) {
        var ret = debugString(getObject(arg1));
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_throw = function (arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function () {
        var ret = wasm.memory;
        return addHeapObject(ret);
    };
    return imports;
}
function initMemory(imports, maybe_memory) {
}
function finalizeInit(instance, module) {
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    cachedFloat32Memory0 = new Float32Array();
    cachedFloat64Memory0 = new Float64Array();
    cachedInt32Memory0 = new Int32Array();
    cachedUint32Memory0 = new Uint32Array();
    cachedUint8Memory0 = new Uint8Array();
    return wasm;
}
function initSync(module) {
    var imports = getImports();
    initMemory(imports);
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    var instance = new WebAssembly.Instance(module, imports);
    return finalizeInit(instance, module);
}
function init(input) {
    return __awaiter(this, void 0, void 0, function () {
        var imports, _a, instance, module, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (typeof input === 'undefined') {
                        input = new URL('rsound_wasm_synth_bg.wasm', import.meta.url);
                    }
                    imports = getImports();
                    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
                        input = fetch(input);
                    }
                    initMemory(imports);
                    _b = load;
                    return [4 /*yield*/, input];
                case 1: return [4 /*yield*/, _b.apply(void 0, [_c.sent(), imports])];
                case 2:
                    _a = _c.sent(), instance = _a.instance, module = _a.module;
                    return [2 /*return*/, finalizeInit(instance, module)];
            }
        });
    });
}
export { initSync };
export default init;
