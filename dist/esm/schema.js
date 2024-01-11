export const isPrototypeOf = (value, proto) => {
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
export const isPromise = (value) => (toString.call(value) === '[object Promise]');
export const isObject = (value) => (toString.call(value) === '[object Object]');
export const isArray = (value) => Array.isArray(value);
export const isFunction = (value) => ((toString.call(value) === '[object Function]') || (toString.call(value) === '[object AsyncFunction]'));
export const isString = (value) => (toString.call(value) === '[object String]');
export const isNumber = (value) => ((toString.call(value) === '[object Number]') && Number.isFinite(value.valueOf()) && (value !== Number.POSITIVE_INFINITY) && (value !== Number.NEGATIVE_INFINITY));
export const isInteger = (value) => (isNumber(value) && Number.isInteger(value.valueOf()));
export const isDate = (value) => (toString.call(value) === '[object Date]');
export const isBool = (value) => (toString.call(value) === '[object Boolean]');
export const isMap = (value) => (toString.call(value) === '[object Map]');
export const isSet = (value) => (toString.call(value) === '[object Set]');
export const isPrimitive = (value) => (isString(value) || isNumber(value) || isBool(value));
export const isAssigned = (value) => (value !== null && value !== undefined);
export const isNotAssigned = (value) => (value === null || value === undefined);
export const isEmpty = (value) => (value === null || value === undefined || value === '');
export const isNonEmpty = (value) => (isString(value) && value !== '');
export const ifNotAssigned = (value, value2) => isAssigned(value) ? value : value2;
export const ifEmpty = (value, value2) => isNonEmpty(value) ? value : value2;
export const isCyclic = (value) => {
    // This is the only right approach as the whole thing is eventually about serializing data to JSON back and forth...
    try {
        JSON.stringify(value);
        return false;
    }
    catch (e) {
        return true;
    }
};
export const isDeepEqual = (value1, value2) => {
    if (value1 === value2) {
        return true;
    }
    if (isCyclic(value1)) {
        return false;
    }
    if (isCyclic(value2)) {
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
        else if (isSet(value1)) {
            if (isSet(value2)) {
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
        else if (isMap(value1) || isObject(value1)) {
            const [ents1, ents2, sameType] = (() => {
                if (isMap(value1) && isMap(value2)) {
                    return [
                        [...value1.entries()],
                        [...value2.entries()],
                        true
                    ];
                }
                else if (isObject(value1) && isObject(value2)) {
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
        else if (isArray(value1)) {
            if (isArray(value2)) {
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
export const validate = (value, schema, options) => {
    const proc = (obj, prop, schema, path) => {
        var _a, _b;
        if ((obj[prop] !== null) && (obj[prop] !== undefined)) {
            let ret = [];
            if (schema.type === 'string') {
                if (isString(obj[prop])) {
                    if ((schema.allowEmpty !== true) && (obj[prop] === '')) {
                        ret = [...ret, { path, message: 'empty string is not allowed' }];
                    }
                    if (isAssigned(schema.minLength) && (obj[prop].length < schema.minLength)) {
                        ret = [...ret, { path, message: `string length is less than ${schema.minLength}` }];
                    }
                    if (isAssigned(schema.maxLength) && (obj[prop].length > schema.maxLength)) {
                        ret = [...ret, { path, message: `string length is greater than ${schema.maxLength}` }];
                    }
                    if (isAssigned(schema.startsWith) && !obj[prop].startsWith(schema.startsWith)) {
                        ret = [...ret, { path, message: `string does not start with "${schema.startsWith}"` }];
                    }
                    if (isAssigned(schema.endsWith) && !obj[prop].endsWith(schema.endsWith)) {
                        ret = [...ret, { path, message: `string does not end with "${schema.endsWith}"` }];
                    }
                    if (isAssigned(schema.matches) && !schema.matches.test(obj[prop])) {
                        ret = [...ret, { path, message: `string does not match regexp "${schema.matches.toString()}"` }];
                    }
                    if (isAssigned(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to ${schema.equal}` }];
                    }
                    if (isAssigned(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` }];
                    }
                    if (isAssigned(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not a string' }];
                }
            }
            else if ((schema.type === 'number') || schema.type === 'integer') {
                const name = ((schema.type === 'number') ? 'a number' : 'an integer');
                const isType = ((schema.type === 'number') ? isNumber : isInteger);
                if (isType(obj[prop])) {
                    if (isAssigned(schema.minValue) && (obj[prop] < schema.minValue)) {
                        ret = [...ret, { path, message: `value is less than ${schema.minValue}` }];
                    }
                    if (isAssigned(schema.maxValue) && (obj[prop] > schema.maxValue)) {
                        ret = [...ret, { path, message: `value is greater than ${schema.maxValue}` }];
                    }
                    if (isAssigned(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to ${schema.equal}` }];
                    }
                    if (isAssigned(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` }];
                    }
                    if (isAssigned(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not ' + name }];
                }
            }
            else if (schema.type === 'object') {
                if (isObject(obj[prop])) {
                    const objProps = Object.entries(obj[prop]);
                    const schProps = Object.entries((_a = schema.props) !== null && _a !== void 0 ? _a : {});
                    const arbitrary = (_b = schema.arbitrary) !== null && _b !== void 0 ? _b : (isAssigned(schema.props) === false);
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
                    if (isAssigned(schema.entry)) {
                        for (const [propName] of objProps) {
                            ret = [...ret, ...proc(obj[prop], propName, schema.entry, `${path}.${propName}`)];
                        }
                    }
                    if (isAssigned(schema.equal) && !isDeepEqual(schema.equal, obj[prop])) {
                        ret = [...ret, { path, message: 'value is not equal to expected object' }];
                    }
                    if (isAssigned(schema.oneOf) && !schema.oneOf.some(i => isDeepEqual(i, obj[prop]))) {
                        ret = [...ret, { path, message: 'value is not one of expected objects' }];
                    }
                    if (isAssigned(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not an object' }];
                }
            }
            else if (schema.type === 'tuple') {
                if (isArray(obj[prop])) {
                    if (isAssigned(schema.oneOf) && !schema.oneOf.some(i => isDeepEqual(i, obj[prop]))) {
                        ret = [...ret, { path, message: `value is not one of expected tuples` }];
                    }
                    if (isAssigned(schema.equal) && !isDeepEqual(schema.equal, obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to expected tuple` }];
                    }
                    if (obj[prop].length !== schema.items.length) {
                        ret = [...ret, { path, message: 'wrong number of items in tuple' }];
                    }
                    for (let i = 0; i < schema.items.length; i++) {
                        ret = [...ret, ...proc(obj[prop], i, schema.items[i], `${path}[${i}]`)];
                    }
                    if (isAssigned(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not a tuple' }];
                }
            }
            else if (schema.type === 'array') {
                if (isArray(obj[prop])) {
                    if ((schema.allowEmpty !== true) && (obj[prop].length === 0)) {
                        ret = [...ret, { path, message: 'empty array is not allowed' }];
                    }
                    if (isAssigned(schema.minLength) && (obj[prop].length < schema.minLength)) {
                        ret = [...ret, { path, message: `array length is less than ${schema.minLength}` }];
                    }
                    if (isAssigned(schema.maxLength) && (obj[prop].length > schema.maxLength)) {
                        ret = [...ret, { path, message: `array length is greater than ${schema.maxLength}` }];
                    }
                    if (isAssigned(schema.oneOf) && !schema.oneOf.some(i => isDeepEqual(i, obj[prop]))) {
                        ret = [...ret, { path, message: `value is not one of expected arrays` }];
                    }
                    if (isAssigned(schema.equal) && !isDeepEqual(schema.equal, obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to expected array` }];
                    }
                    if (isAssigned(schema.item)) {
                        for (let i = 0; i < obj[prop].length; i++) {
                            ret = [...ret, ...proc(obj[prop], i, schema.item, `${path}[${i}]`)];
                        }
                    }
                    if (isAssigned(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not an array' }];
                }
            }
            else if (schema.type === 'boolean') {
                if (isBool(obj[prop])) {
                    if (isAssigned(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to ${schema.equal}` }];
                    }
                    if (isAssigned(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` }];
                    }
                    if (isAssigned(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not a boolean' }];
                }
            }
            else if (schema.type === 'function') {
                if (isFunction(obj[prop])) {
                    if (isAssigned(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to ${schema.equal}` }];
                    }
                    if (isAssigned(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` }];
                    }
                    if (isAssigned(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not a function' }];
                }
            }
            else if (schema.type === 'any') {
                if (isAssigned(schema.equal) && (schema.equal !== obj[prop])) {
                    ret = [...ret, { path, message: `value is not equal to ${schema.equal}` }];
                }
                if (isAssigned(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                    ret = [...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` }];
                }
                if (isAssigned(schema.validate)) {
                    ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })))];
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
                    if (isAssigned(schema.fallback) && ((options === null || options === void 0 ? void 0 : options.fallback) !== false)) {
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
export const compare = (src, dst, schema, options) => {
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
                if (isAssigned(diff)) {
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
            if (isAssigned(schema.item)) {
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
                    if (isAssigned(schema.key)) {
                        const __key = schema.key;
                        for (const srcItem of srcArr) {
                            const dstItem = dstArr.find((i) => i[__key] === srcItem[__key]);
                            const diff = proc(srcItem, dstItem, schema.item);
                            if (isAssigned(diff)) {
                                diffs.push(diff);
                            }
                        }
                        for (const dstItem of dstArr) {
                            if (!srcArr.some((i) => i[__key] === dstItem[__key])) {
                                const diff = proc(undefined, dstItem, schema.item);
                                if (isAssigned(diff)) {
                                    diffs.push(diff);
                                }
                            }
                        }
                    }
                    else {
                        const max = Math.max(srcArr.length, dstArr.length);
                        for (let i = 0; i < max; i++) {
                            const diff = proc(srcArr[i], dstArr[i], schema.item);
                            if (isAssigned(diff)) {
                                diffs.push(diff);
                            }
                        }
                    }
                }
                else if (schema.item.type === 'array') {
                    const max = Math.max(srcArr.length, dstArr.length);
                    for (let i = 0; i < max; i++) {
                        const diff = proc(srcArr[i], dstArr[i], schema.item);
                        if (isAssigned(diff)) {
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
export const assert = (value, schema, options) => {
    const value_ = ((value === undefined) ? ((options === null || options === void 0 ? void 0 : options.fallback) === true ? schema.fallback : undefined) : value);
    const issues = validate(value_, schema, options);
    if (issues.length > 0) {
        throw new Error(`${(options === null || options === void 0 ? void 0 : options.description) ? `${options.description} ` : ''}assertion failed: ${issues.map(({ path, message }) => `${path.length > 0 ? `${path}: ` : ''}${message}`).join(', ')}`);
    }
    else {
        return value_;
    }
};
export const patch = (target, patch, schema, options) => {
    try {
        if (isObject(target) === false) {
            throw new Error('Target must be an object');
        }
        if (isObject(patch) === false) {
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
                return assert(clonedTarget, schema, options);
            }
            catch (e) {
                throw new Error(`Failed to validate target object: ${e.message}`);
            }
        })();
        const patchValid = (() => {
            try {
                return assert(patch, schema, Object.assign(Object.assign({}, options), { partial: true }));
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
                if (isObject(patchValue)) {
                    (_b = target[key]) !== null && _b !== void 0 ? _b : (target[key] = {});
                    if (isObject(target[key])) {
                        assignObject(target[key], patchValue, (((patchSchema === null || patchSchema === void 0 ? void 0 : patchSchema.type) === 'object')
                            ? patchSchema
                            : undefined));
                    }
                    else {
                        throw new Error('Object shape mismatch');
                    }
                }
                else if (isArray(patchValue)) {
                    (_c = target[key]) !== null && _c !== void 0 ? _c : (target[key] = []);
                    if (isArray(target[key])) {
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
            return assert(targetValid, schema, options);
        }
        catch (e) {
            throw new Error(`Failed to validate resulting object: ${e.message}`);
        }
    }
    catch (e) {
        throw new Error(`Failed to patch object: ${e.message}`);
    }
};
export const INTEGER_REGEXP = /^-?\d+$/;
export const NUMBER_REGEXP = /^-?\d*(\.\d+)?$/;
export const POSITIVE_INTEGER_REGEXP = /^\d+$/;
export const POSITIVE_NUMBER_REGEXP = /^\d*(\.\d+)?$/;
export const NEGATIVE_INTEGER_REGEXP = /^-\d+$/;
export const NEGATIVE_NUMBER_REGEXP = /^-\d*(\.\d+)?$/;
export const DATETIME_REGEXP = /^[+-]?\d{4}-[01]\d-[0-3]\d(T[0-2]\d:[0-5]\d?(:[0-5]\d(\.\d+)?)?([+-][0-2]\d:[0-5]\d)?Z?)?$/;
export const EMAIL_REGEXP = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
export const URL_REGEXP = /^((https?|ftp):)?\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
export const UUID_REGEXP = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
export const IPV4_REGEXP = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
export const IPV6_REGEXP = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
export const SLUG_REGEXP = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const NAME_REGEXP = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;
export const PATH_REGEXP = /^((\/|\\|\/\/)?[a-z0-9 _@\-^!#$%&+={}.\/\\\[\]]+)+(\.[a-z]+)?$/;
export const UNIX_PATH_REGEXP = /^((\/)?[a-z0-9 _@\-^!#$%&+={}.\/]+)+(\.[a-z]+)?$/;
export const WIN32_PATH_REGEXP = /^((\\|\\\\)?[a-z0-9 _@\-^!#$%&+={}.\\\[\]]+)+(\.[a-z]+)?$/;
export const USERNAME_REGEXP = /^[a-z0-9_-]{3,16}$/;
// Should have 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character and be at least 8 characters long...
export const COMPLEX_PASSWORD_REGEXP = /^(?=(.*[0-9]))(?=.*[\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}$/;
// Should have 1 lowercase letter, 1 uppercase letter, 1 number, and be at least 8 characters long...
export const MODERATE_PASSWORD_REGEXP = /^(?=(.*[0-9]))((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.{8,}$/;
