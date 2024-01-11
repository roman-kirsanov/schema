"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODERATE_PASSWORD_REGEXP = exports.COMPLEX_PASSWORD_REGEXP = exports.USERNAME_REGEXP = exports.WIN32_PATH_REGEXP = exports.UNIX_PATH_REGEXP = exports.PATH_REGEXP = exports.NAME_REGEXP = exports.SLUG_REGEXP = exports.IPV6_REGEXP = exports.IPV4_REGEXP = exports.UUID_REGEXP = exports.URL_REGEXP = exports.EMAIL_REGEXP = exports.DATETIME_REGEXP = exports.NEGATIVE_NUMBER_REGEXP = exports.NEGATIVE_INTEGER_REGEXP = exports.POSITIVE_NUMBER_REGEXP = exports.POSITIVE_INTEGER_REGEXP = exports.NUMBER_REGEXP = exports.INTEGER_REGEXP = exports.patch = exports.assert = exports.compare = exports.validate = exports.isDeepEqual = exports.isCyclic = exports.ifEmpty = exports.ifNotAssigned = exports.isNonEmpty = exports.isEmpty = exports.isNotAssigned = exports.isAssigned = exports.isPrimitive = exports.isSet = exports.isMap = exports.isBool = exports.isDate = exports.isInteger = exports.isNumber = exports.isString = exports.isFunction = exports.isArray = exports.isObject = exports.isPromise = exports.isPrototypeOf = void 0;
const isPrototypeOf = (value, proto) => {
    if (!value || !proto)
        return false;
    let next = value.__proto__;
    while (next && next !== Object) {
        if (next === proto)
            return true;
        next = next.__proto__;
    }
    return false;
};
exports.isPrototypeOf = isPrototypeOf;
const isPromise = (value) => (toString.call(value) === '[object Promise]');
exports.isPromise = isPromise;
const isObject = (value) => (toString.call(value) === '[object Object]');
exports.isObject = isObject;
const isArray = (value) => Array.isArray(value);
exports.isArray = isArray;
const isFunction = (value) => ((toString.call(value) === '[object Function]') || (toString.call(value) === '[object AsyncFunction]'));
exports.isFunction = isFunction;
const isString = (value) => (toString.call(value) === '[object String]');
exports.isString = isString;
const isNumber = (value) => ((toString.call(value) === '[object Number]') && Number.isFinite(value.valueOf()) && (value !== Number.POSITIVE_INFINITY) && (value !== Number.NEGATIVE_INFINITY));
exports.isNumber = isNumber;
const isInteger = (value) => ((0, exports.isNumber)(value) && Number.isInteger(value.valueOf()));
exports.isInteger = isInteger;
const isDate = (value) => (toString.call(value) === '[object Date]');
exports.isDate = isDate;
const isBool = (value) => (toString.call(value) === '[object Boolean]');
exports.isBool = isBool;
const isMap = (value) => (toString.call(value) === '[object Map]');
exports.isMap = isMap;
const isSet = (value) => (toString.call(value) === '[object Set]');
exports.isSet = isSet;
const isPrimitive = (value) => ((0, exports.isString)(value) || (0, exports.isNumber)(value) || (0, exports.isBool)(value));
exports.isPrimitive = isPrimitive;
const isAssigned = (value) => (value !== null && value !== undefined);
exports.isAssigned = isAssigned;
const isNotAssigned = (value) => (value === null || value === undefined);
exports.isNotAssigned = isNotAssigned;
const isEmpty = (value) => (value === null || value === undefined || value === '');
exports.isEmpty = isEmpty;
const isNonEmpty = (value) => ((0, exports.isString)(value) && value !== '');
exports.isNonEmpty = isNonEmpty;
const ifNotAssigned = (value, value2) => (0, exports.isAssigned)(value) ? value : value2;
exports.ifNotAssigned = ifNotAssigned;
const ifEmpty = (value, value2) => (0, exports.isNonEmpty)(value) ? value : value2;
exports.ifEmpty = ifEmpty;
const isCyclic = (value) => {
    // This is the only right approach as the whole thing is eventually about serializing data to JSON back and forth...
    try {
        JSON.stringify(value);
        return false;
    }
    catch (e) {
        return true;
    }
};
exports.isCyclic = isCyclic;
const isDeepEqual = (value1, value2) => {
    if (value1 === value2) {
        return true;
    }
    if ((0, exports.isCyclic)(value1)) {
        return false;
    }
    if ((0, exports.isCyclic)(value2)) {
        return false;
    }
    const proc = (value1, value2) => {
        if (value1 === value2) {
            return true;
        }
        if ((value1 === undefined)
            || (value1 === null)) {
            return false;
        }
        else if ((0, exports.isSet)(value1)) {
            if ((0, exports.isSet)(value2)) {
                const ents1 = [...value1.values()];
                const ents2 = [...value2.values()];
                if (ents1.length === ents2.length) {
                    for (let i = 0; i < ents1.length; i++) {
                        if (ents1[i] !== ents2[i]) {
                            return false;
                        }
                    }
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else if ((0, exports.isMap)(value1) || (0, exports.isObject)(value1)) {
            const [ents1, ents2, sameType] = (() => {
                if ((0, exports.isMap)(value1) && (0, exports.isMap)(value2)) {
                    return [
                        [...value1.entries()],
                        [...value2.entries()],
                        true
                    ];
                }
                else if ((0, exports.isObject)(value1) && (0, exports.isObject)(value2)) {
                    return [
                        Object.entries(value1),
                        Object.entries(value2),
                        true
                    ];
                }
                else {
                    return [[], [], false];
                }
            })();
            if (sameType) {
                if (ents1.length === ents2.length) {
                    for (let i = 0; i < ents1.length; i++) {
                        const [prop1, val1] = ents1[i];
                        const [prop2, val2] = ents2[i];
                        if (prop1 !== prop2) {
                            return false;
                        }
                        if (proc(val1, val2) === false) {
                            return false;
                        }
                    }
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else if ((0, exports.isArray)(value1)) {
            if ((0, exports.isArray)(value2)) {
                if (value1.length === value2.length) {
                    for (let i = 0; i < value1.length; i++) {
                        if (proc(value1[i], value2[i]) === false) {
                            return false;
                        }
                    }
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            return (value1 === value2);
        }
    };
    return proc(value1, value2);
};
exports.isDeepEqual = isDeepEqual;
const validate = (value, schema, options) => {
    const proc = (obj, prop, schema, path) => {
        var _a, _b;
        if ((obj[prop] !== null) && (obj[prop] !== undefined)) {
            let ret = [];
            if (schema.type === 'string') {
                if ((0, exports.isString)(obj[prop])) {
                    if ((schema.allowEmpty !== true) && (obj[prop] === '')) {
                        ret = [...ret, { path, message: 'empty string is not allowed' }];
                    }
                    if ((0, exports.isAssigned)(schema.minLength) && (obj[prop].length < schema.minLength)) {
                        ret = [...ret, { path, message: `string length is less than ${schema.minLength}` }];
                    }
                    if ((0, exports.isAssigned)(schema.maxLength) && (obj[prop].length > schema.maxLength)) {
                        ret = [...ret, { path, message: `string length is greater than ${schema.maxLength}` }];
                    }
                    if ((0, exports.isAssigned)(schema.startsWith) && !obj[prop].startsWith(schema.startsWith)) {
                        ret = [...ret, { path, message: `string does not start with "${schema.startsWith}"` }];
                    }
                    if ((0, exports.isAssigned)(schema.endsWith) && !obj[prop].endsWith(schema.endsWith)) {
                        ret = [...ret, { path, message: `string does not end with "${schema.endsWith}"` }];
                    }
                    if ((0, exports.isAssigned)(schema.matches) && !schema.matches.test(obj[prop])) {
                        ret = [...ret, { path, message: `string does not match regexp "${schema.matches.toString()}"` }];
                    }
                    if ((0, exports.isAssigned)(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to ${schema.equal}` }];
                    }
                    if ((0, exports.isAssigned)(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` }];
                    }
                    if ((0, exports.isAssigned)(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: ((0, exports.isNonEmpty)(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not a string' }];
                }
            }
            else if ((schema.type === 'number') || schema.type === 'integer') {
                const name = ((schema.type === 'number') ? 'a number' : 'an integer');
                const isType = ((schema.type === 'number') ? exports.isNumber : exports.isInteger);
                if (isType(obj[prop])) {
                    if ((0, exports.isAssigned)(schema.minValue) && (obj[prop] < schema.minValue)) {
                        ret = [...ret, { path, message: `value is less than ${schema.minValue}` }];
                    }
                    if ((0, exports.isAssigned)(schema.maxValue) && (obj[prop] > schema.maxValue)) {
                        ret = [...ret, { path, message: `value is greater than ${schema.maxValue}` }];
                    }
                    if ((0, exports.isAssigned)(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to ${schema.equal}` }];
                    }
                    if ((0, exports.isAssigned)(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` }];
                    }
                    if ((0, exports.isAssigned)(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: ((0, exports.isNonEmpty)(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not ' + name }];
                }
            }
            else if (schema.type === 'object') {
                if ((0, exports.isObject)(obj[prop])) {
                    const objProps = Object.entries(obj[prop]);
                    const schProps = Object.entries((_a = schema.props) !== null && _a !== void 0 ? _a : {});
                    const arbitrary = (_b = schema.arbitrary) !== null && _b !== void 0 ? _b : ((0, exports.isAssigned)(schema.props) === false);
                    for (const [propName, propSchema] of schProps) {
                        ret = [...ret, ...proc(obj[prop], propName, propSchema, `${path}.${propName}`)];
                    }
                    if (arbitrary === false) {
                        for (const [propName] of objProps) {
                            if (schProps.some(([pn]) => pn === propName)) {
                                continue;
                            }
                            else {
                                ret = [...ret, { path, message: `arbitrary property "${propName}" is not allowed` }];
                            }
                        }
                    }
                    if ((0, exports.isAssigned)(schema.entry)) {
                        for (const [propName] of objProps) {
                            ret = [...ret, ...proc(obj[prop], propName, schema.entry, `${path}.${propName}`)];
                        }
                    }
                    if ((0, exports.isAssigned)(schema.equal) && !(0, exports.isDeepEqual)(schema.equal, obj[prop])) {
                        ret = [...ret, { path, message: 'value is not equal to expected object' }];
                    }
                    if ((0, exports.isAssigned)(schema.oneOf) && !schema.oneOf.some(i => (0, exports.isDeepEqual)(i, obj[prop]))) {
                        ret = [...ret, { path, message: 'value is not one of expected objects' }];
                    }
                    if ((0, exports.isAssigned)(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: ((0, exports.isNonEmpty)(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not an object' }];
                }
            }
            else if (schema.type === 'tuple') {
                if ((0, exports.isArray)(obj[prop])) {
                    if ((0, exports.isAssigned)(schema.oneOf) && !schema.oneOf.some(i => (0, exports.isDeepEqual)(i, obj[prop]))) {
                        ret = [...ret, { path, message: `value is not one of expected tuples` }];
                    }
                    if ((0, exports.isAssigned)(schema.equal) && !(0, exports.isDeepEqual)(schema.equal, obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to expected tuple` }];
                    }
                    if (obj[prop].length !== schema.items.length) {
                        ret = [...ret, { path, message: 'wrong number of items in tuple' }];
                    }
                    for (let i = 0; i < schema.items.length; i++) {
                        ret = [...ret, ...proc(obj[prop], i, schema.items[i], `${path}[${i}]`)];
                    }
                    if ((0, exports.isAssigned)(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: ((0, exports.isNonEmpty)(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not a tuple' }];
                }
            }
            else if (schema.type === 'array') {
                if ((0, exports.isArray)(obj[prop])) {
                    if ((schema.allowEmpty !== true) && (obj[prop].length === 0)) {
                        ret = [...ret, { path, message: 'empty array is not allowed' }];
                    }
                    if ((0, exports.isAssigned)(schema.minLength) && (obj[prop].length < schema.minLength)) {
                        ret = [...ret, { path, message: `array length is less than ${schema.minLength}` }];
                    }
                    if ((0, exports.isAssigned)(schema.maxLength) && (obj[prop].length > schema.maxLength)) {
                        ret = [...ret, { path, message: `array length is greater than ${schema.maxLength}` }];
                    }
                    if ((0, exports.isAssigned)(schema.oneOf) && !schema.oneOf.some(i => (0, exports.isDeepEqual)(i, obj[prop]))) {
                        ret = [...ret, { path, message: `value is not one of expected arrays` }];
                    }
                    if ((0, exports.isAssigned)(schema.equal) && !(0, exports.isDeepEqual)(schema.equal, obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to expected array` }];
                    }
                    if ((0, exports.isAssigned)(schema.item)) {
                        for (let i = 0; i < obj[prop].length; i++) {
                            ret = [...ret, ...proc(obj[prop], i, schema.item, `${path}[${i}]`)];
                        }
                    }
                    if ((0, exports.isAssigned)(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: ((0, exports.isNonEmpty)(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not an array' }];
                }
            }
            else if (schema.type === 'boolean') {
                if ((0, exports.isBool)(obj[prop])) {
                    if ((0, exports.isAssigned)(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to ${schema.equal}` }];
                    }
                    if ((0, exports.isAssigned)(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` }];
                    }
                    if ((0, exports.isAssigned)(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: ((0, exports.isNonEmpty)(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not a boolean' }];
                }
            }
            else if (schema.type === 'function') {
                if ((0, exports.isFunction)(obj[prop])) {
                    if ((0, exports.isAssigned)(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to ${schema.equal}` }];
                    }
                    if ((0, exports.isAssigned)(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` }];
                    }
                    if ((0, exports.isAssigned)(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: ((0, exports.isNonEmpty)(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not a function' }];
                }
            }
            else if (schema.type === 'any') {
                if ((0, exports.isAssigned)(schema.equal) && (schema.equal !== obj[prop])) {
                    ret = [...ret, { path, message: `value is not equal to ${schema.equal}` }];
                }
                if ((0, exports.isAssigned)(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                    ret = [...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` }];
                }
                if ((0, exports.isAssigned)(schema.validate)) {
                    ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: ((0, exports.isNonEmpty)(path) ? `${path}.${i.path}` : i.path) })))];
                }
            }
            return ret;
        }
        else {
            if (obj[prop] === null) {
                if (schema.nullable === true) {
                    return [];
                }
                else {
                    return [{ path, message: 'value can\'t be null' }];
                }
            }
            else if (obj[prop] === undefined) {
                if ((schema.optional === true)
                    || ((options === null || options === void 0 ? void 0 : options.partial) === true)) {
                    return [];
                }
                else {
                    if ((0, exports.isAssigned)(schema.fallback) && ((options === null || options === void 0 ? void 0 : options.fallback) !== false)) {
                        obj[prop] = schema.fallback;
                        return proc(obj, prop, schema, path);
                    }
                    else {
                        return [{ path, message: 'value can\'t be undefined' }];
                    }
                }
            }
            return [];
        }
    };
    return proc({ root: value }, 'root', schema, '');
};
exports.validate = validate;
const compare = (src, dst, schema, options) => {
    const proc = (src, dst, schema) => {
        var _a;
        if ((schema.type === 'string')
            || (schema.type === 'number')
            || (schema.type === 'integer')
            || (schema.type === 'boolean')
            || (schema.type === 'function')
            || (schema.type === 'any')) {
            if (src === dst) {
                return undefined;
            }
            else if (src === undefined) {
                if ((options === null || options === void 0 ? void 0 : options.srcPartial) !== true) {
                    return {
                        type: schema.type,
                        schema: schema,
                        action: 'add',
                        newValue: dst,
                    };
                }
                else {
                    return undefined;
                }
            }
            else if (dst === undefined) {
                if ((options === null || options === void 0 ? void 0 : options.dstPartial) !== true) {
                    return {
                        type: schema.type,
                        schema: schema,
                        action: 'delete',
                        oldValue: src,
                    };
                }
                else {
                    return undefined;
                }
            }
            else {
                return {
                    type: schema.type,
                    schema: schema,
                    action: 'modify',
                    oldValue: src,
                    newValue: dst
                };
            }
        }
        else if (schema.type === 'object') {
            const diffs = {};
            const srcObj = (src !== null && src !== void 0 ? src : {});
            const dstObj = (dst !== null && dst !== void 0 ? dst : {});
            for (const [propName, propSchema] of Object.entries((_a = schema.props) !== null && _a !== void 0 ? _a : {})) {
                const diff = proc(srcObj[propName], dstObj[propName], propSchema);
                if ((0, exports.isAssigned)(diff)) {
                    diffs[propName] = diff;
                }
            }
            if (src === undefined) {
                if ((options === null || options === void 0 ? void 0 : options.srcPartial) !== true) {
                    return {
                        type: 'object',
                        schema: schema,
                        action: 'add',
                        newValue: dst,
                        props: diffs
                    };
                }
                else {
                    return undefined;
                }
            }
            else if (dst === undefined) {
                if ((options === null || options === void 0 ? void 0 : options.dstPartial) !== true) {
                    return {
                        type: 'object',
                        schema: schema,
                        action: 'delete',
                        oldValue: src,
                        props: diffs
                    };
                }
                else {
                    return undefined;
                }
            }
            else {
                if (Object.keys(diffs).length > 0) {
                    return {
                        type: 'object',
                        schema: schema,
                        action: 'modify',
                        oldValue: src,
                        newValue: dst,
                        props: diffs
                    };
                }
                else {
                    return undefined;
                }
            }
        }
        else if (schema.type === 'tuple') {
            const diffs = [];
            const srcTpl = (src !== null && src !== void 0 ? src : []);
            const dstTpl = (dst !== null && dst !== void 0 ? dst : []);
            for (let i = 0; i < schema.items.length; i++) {
                diffs.push(proc(srcTpl[i], dstTpl[i], schema.items[i]));
            }
            if (src === undefined) {
                if ((options === null || options === void 0 ? void 0 : options.srcPartial) !== true) {
                    return {
                        type: 'tuple',
                        schema: schema,
                        action: 'add',
                        newValue: dst,
                        items: diffs
                    };
                }
                else {
                    return undefined;
                }
            }
            else if (dst === undefined) {
                if ((options === null || options === void 0 ? void 0 : options.dstPartial) !== true) {
                    return {
                        type: 'tuple',
                        schema: schema,
                        action: 'delete',
                        oldValue: src,
                        items: diffs
                    };
                }
                else {
                    return undefined;
                }
            }
            else {
                if (Object.keys(diffs).length > 0) {
                    return {
                        type: 'tuple',
                        schema: schema,
                        action: 'modify',
                        oldValue: src,
                        newValue: dst,
                        items: diffs
                    };
                }
                else {
                    return undefined;
                }
            }
        }
        else if (schema.type === 'array') {
            const diffs = [];
            const srcArr = (src !== null && src !== void 0 ? src : []);
            const dstArr = (dst !== null && dst !== void 0 ? dst : []);
            if ((0, exports.isAssigned)(schema.item)) {
                if ((schema.item.type === 'string')
                    || (schema.item.type === 'number')
                    || (schema.item.type === 'integer')
                    || (schema.item.type === 'boolean')
                    || (schema.item.type === 'function')
                    || (schema.item.type === 'any')) {
                    for (const srcItem of srcArr) {
                        if (!dstArr.some((i) => i === srcItem)) {
                            diffs.push({
                                type: schema.item.type,
                                schema: schema.item,
                                action: 'delete',
                                oldValue: srcItem
                            });
                        }
                    }
                    for (const dstItem of dstArr) {
                        if (!srcArr.some((i) => i === dstItem)) {
                            diffs.push({
                                type: schema.item.type,
                                schema: schema.item,
                                action: 'add',
                                newValue: dstItem
                            });
                        }
                    }
                }
                else if (schema.item.type === 'object') {
                    if ((0, exports.isAssigned)(schema.key)) {
                        const __key = schema.key;
                        for (const srcItem of srcArr) {
                            const dstItem = dstArr.find((i) => i[__key] === srcItem[__key]);
                            const diff = proc(srcItem, dstItem, schema.item);
                            if ((0, exports.isAssigned)(diff)) {
                                diffs.push(diff);
                            }
                        }
                        for (const dstItem of dstArr) {
                            if (!srcArr.some((i) => i[__key] === dstItem[__key])) {
                                const diff = proc(undefined, dstItem, schema.item);
                                if ((0, exports.isAssigned)(diff)) {
                                    diffs.push(diff);
                                }
                            }
                        }
                    }
                    else {
                        const max = Math.max(srcArr.length, dstArr.length);
                        for (let i = 0; i < max; i++) {
                            const diff = proc(srcArr[i], dstArr[i], schema.item);
                            if ((0, exports.isAssigned)(diff)) {
                                diffs.push(diff);
                            }
                        }
                    }
                }
                else if (schema.item.type === 'array') {
                    const max = Math.max(srcArr.length, dstArr.length);
                    for (let i = 0; i < max; i++) {
                        const diff = proc(srcArr[i], dstArr[i], schema.item);
                        if ((0, exports.isAssigned)(diff)) {
                            diffs.push(diff);
                        }
                    }
                }
                if (diffs.length > 0) {
                    if (src === undefined) {
                        if ((options === null || options === void 0 ? void 0 : options.srcPartial) !== true) {
                            return {
                                type: schema.type,
                                schema: schema,
                                action: 'add',
                                newValue: dst,
                                items: diffs
                            };
                        }
                        else {
                            return undefined;
                        }
                    }
                    else if (dst === undefined) {
                        if ((options === null || options === void 0 ? void 0 : options.dstPartial) !== true) {
                            return {
                                type: schema.type,
                                schema: schema,
                                action: 'delete',
                                oldValue: src,
                                items: diffs
                            };
                        }
                        else {
                            return undefined;
                        }
                    }
                    else {
                        return {
                            type: schema.type,
                            schema: schema,
                            action: 'modify',
                            oldValue: src,
                            newValue: dst,
                            items: diffs
                        };
                    }
                }
                else {
                    return undefined;
                }
            }
            else {
                return undefined;
            }
        }
        else {
            return undefined;
        }
    };
    return proc(src, dst, schema);
};
exports.compare = compare;
const assert = (value, schema, options) => {
    const value_ = ((value === undefined) ? ((options === null || options === void 0 ? void 0 : options.fallback) === true ? schema.fallback : undefined) : value);
    const issues = (0, exports.validate)(value_, schema, options);
    if (issues.length > 0) {
        throw new Error(`${(options === null || options === void 0 ? void 0 : options.description) ? `${options.description} ` : ''}assertion failed: ${issues.map(({ path, message }) => `${path.length > 0 ? `${path}: ` : ''}${message}`).join(', ')}`);
    }
    else {
        return value_;
    }
};
exports.assert = assert;
const patch = (target, patch, schema, options) => {
    try {
        if ((0, exports.isObject)(target) === false) {
            throw new Error('Target must be an object');
        }
        if ((0, exports.isObject)(patch) === false) {
            throw new Error('Patch must be an object');
        }
        const clonedTarget = (() => {
            try {
                return JSON.parse(JSON.stringify(target));
            }
            catch (e) {
                throw new Error(`Failed to clone target: ${e.message}`);
            }
        })();
        const targetValid = (() => {
            try {
                return (0, exports.assert)(clonedTarget, schema, options);
            }
            catch (e) {
                throw new Error(`Failed to validate target object: ${e.message}`);
            }
        })();
        const patchValid = (() => {
            try {
                return (0, exports.assert)(patch, schema, Object.assign(Object.assign({}, options), { partial: true }));
            }
            catch (e) {
                throw new Error(`Failed to validate patch object: ${e.message}`);
            }
        })();
        const assignPrimitive = (target, key, patch) => {
            if ((patch !== null)
                && (patch !== undefined)) {
                if ((target[key] !== null)
                    && (target[key] !== undefined)) {
                    if (typeof patch === typeof target[key]) {
                        target[key] = patch;
                    }
                    else {
                        throw new Error('Object shape mismatch');
                    }
                }
                else {
                    target[key] = patch;
                }
            }
            else {
                target[key] = patch;
            }
        };
        const assignArray = (target, patch, schema) => {
            var _a;
            if (((_a = schema === null || schema === void 0 ? void 0 : schema.item) === null || _a === void 0 ? void 0 : _a.type) === 'object') {
                const key = schema === null || schema === void 0 ? void 0 : schema.key;
                if (key) {
                    const newTarget = [];
                    for (const patchItem of patch) {
                        const targetItem = target.find(i => i[key] === patchItem[key]);
                        if (targetItem) {
                            assignObject(targetItem, patchItem, schema === null || schema === void 0 ? void 0 : schema.item);
                            newTarget.push(targetItem);
                        }
                        else {
                            newTarget.push(JSON.parse(JSON.stringify(patchItem)));
                        }
                    }
                    target.splice(0, target.length, ...newTarget);
                }
                else {
                    const newTarget = [];
                    for (let i = 0; i < patch.length; i++) {
                        const patchItem = patch[i];
                        const targetItem = target[i];
                        if (targetItem) {
                            assignObject(targetItem, patchItem);
                            newTarget.push(targetItem);
                        }
                        else {
                            newTarget.push(JSON.parse(JSON.stringify(patchItem)));
                        }
                    }
                    target.splice(0, target.length, ...newTarget);
                }
            }
            else {
                target.splice(0, target.length, ...JSON.parse(JSON.stringify(patch)));
            }
        };
        const assignObject = (target, patch, schema) => {
            var _a, _b, _c;
            for (const [key, patchValue] of Object.entries(patch)) {
                const patchSchema = (_a = schema === null || schema === void 0 ? void 0 : schema.props) === null || _a === void 0 ? void 0 : _a[key];
                if ((0, exports.isObject)(patchValue)) {
                    (_b = target[key]) !== null && _b !== void 0 ? _b : (target[key] = {});
                    if ((0, exports.isObject)(target[key])) {
                        assignObject(target[key], patchValue, (((patchSchema === null || patchSchema === void 0 ? void 0 : patchSchema.type) === 'object')
                            ? patchSchema
                            : undefined));
                    }
                    else {
                        throw new Error('Object shape mismatch');
                    }
                }
                else if ((0, exports.isArray)(patchValue)) {
                    (_c = target[key]) !== null && _c !== void 0 ? _c : (target[key] = []);
                    if ((0, exports.isArray)(target[key])) {
                        assignArray(target[key], patchValue, (((patchSchema === null || patchSchema === void 0 ? void 0 : patchSchema.type) === 'array')
                            ? patchSchema
                            : undefined));
                    }
                    else {
                        throw new Error('Object shape mismatch');
                    }
                }
                else {
                    assignPrimitive(target, key, patchValue);
                }
            }
        };
        assignObject(clonedTarget, patchValid, schema);
        try {
            return (0, exports.assert)(targetValid, schema, options);
        }
        catch (e) {
            throw new Error(`Failed to validate resulting object: ${e.message}`);
        }
    }
    catch (e) {
        throw new Error(`Failed to patch object: ${e.message}`);
    }
};
exports.patch = patch;
exports.INTEGER_REGEXP = /^-?\d+$/;
exports.NUMBER_REGEXP = /^-?\d*(\.\d+)?$/;
exports.POSITIVE_INTEGER_REGEXP = /^\d+$/;
exports.POSITIVE_NUMBER_REGEXP = /^\d*(\.\d+)?$/;
exports.NEGATIVE_INTEGER_REGEXP = /^-\d+$/;
exports.NEGATIVE_NUMBER_REGEXP = /^-\d*(\.\d+)?$/;
exports.DATETIME_REGEXP = /^[+-]?\d{4}-[01]\d-[0-3]\d(T[0-2]\d:[0-5]\d?(:[0-5]\d(\.\d+)?)?([+-][0-2]\d:[0-5]\d)?Z?)?$/;
exports.EMAIL_REGEXP = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
exports.URL_REGEXP = /^((https?|ftp):)?\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
exports.UUID_REGEXP = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
exports.IPV4_REGEXP = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
exports.IPV6_REGEXP = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
exports.SLUG_REGEXP = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
exports.NAME_REGEXP = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;
exports.PATH_REGEXP = /^((\/|\\|\/\/)?[a-z0-9 _@\-^!#$%&+={}.\/\\\[\]]+)+(\.[a-z]+)?$/;
exports.UNIX_PATH_REGEXP = /^((\/)?[a-z0-9 _@\-^!#$%&+={}.\/]+)+(\.[a-z]+)?$/;
exports.WIN32_PATH_REGEXP = /^((\\|\\\\)?[a-z0-9 _@\-^!#$%&+={}.\\\[\]]+)+(\.[a-z]+)?$/;
exports.USERNAME_REGEXP = /^[a-z0-9_-]{3,16}$/;
// Should have 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character and be at least 8 characters long...
exports.COMPLEX_PASSWORD_REGEXP = /^(?=(.*[0-9]))(?=.*[\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}$/;
// Should have 1 lowercase letter, 1 uppercase letter, 1 number, and be at least 8 characters long...
exports.MODERATE_PASSWORD_REGEXP = /^(?=(.*[0-9]))((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.{8,}$/;
