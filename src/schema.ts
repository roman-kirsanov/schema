declare function toString(obj: any): any;

export const isPrototypeOf = (value: any, proto: any) => {
	if (!value || !proto) return false;
	let next = value.__proto__;
	while (next && next !== Object) {
		if (next === proto) return true;
		next = next.__proto__;
	}
	return false;
}

export const isPromise = (value: any): value is Promise<any> => (toString.call(value) === '[object Promise]');

export const isObject = (value: any): value is Object => (toString.call(value) === '[object Object]');

export const isArray = (value: any): value is Array<any> => Array.isArray(value);

export const isFunction = (value: any): value is Function => ((toString.call(value) === '[object Function]') || (toString.call(value) === '[object AsyncFunction]'));

export const isString = (value: any): value is string => (toString.call(value) === '[object String]');

export const isNumber = (value: any): value is number => ((toString.call(value) === '[object Number]') && Number.isFinite(value.valueOf()) && (value !== Number.POSITIVE_INFINITY) && (value !== Number.NEGATIVE_INFINITY));

export const isInteger = (value: any): value is number => (isNumber(value) && Number.isInteger(value.valueOf()));

export const isDate = (value: any): value is Date => (toString.call(value) === '[object Date]');

export const isBool = (value: any): value is boolean => (toString.call(value) === '[object Boolean]');

export const isMap = (value: any): value is Map<any, any> => (toString.call(value) === '[object Map]');

export const isSet = (value: any): value is Set<any> => (toString.call(value) === '[object Set]');

export const isPrimitive = (value: any): value is string | number | boolean => (isString(value) || isNumber(value) || isBool(value));

export const isAssigned = <T>(value: T): value is NonNullable<T> => (value !== null && value !== undefined);

export const isNotAssigned = (value: any): value is (null | undefined) => (value === null || value === undefined);

export const isEmpty = (value: any): value is (null | undefined | '') => (value === null || value === undefined || value === '');

export const isNonEmpty = (value: any): value is string => (isString(value) && value !== '');

export const ifNotAssigned = <T>(value: T, value2: NonNullable<T>): NonNullable<T> => isAssigned(value) ? value : value2;

export const ifEmpty = (value: any, value2: string): string => isNonEmpty(value) ? value : value2;

export const isCyclic = (value: any): boolean => {
    // This is the only right approach as the whole thing is eventually about serializing data to JSON back and forth...
    try {
        JSON.stringify(value);
        return false;
    } catch (e) {
        return true;
    }
}

export const isDeepEqual = (value1: any, value2: any): boolean => {
    if (value1 === value2) {
        return true;
    }
    if (isCyclic(value1)) {
        return false;
    }
    if (isCyclic(value2)) {
        return false;
    }
    const proc = (value1: any, value2: any) => {
        if (value1 === value2) {
            return true;
        }
        if ((value1 === undefined)
        || (value1 === null)) {
            return false;
        } else if (isSet(value1)) {
            if (isSet(value2)) {
                const ents1 = [ ...value1.values() ];
                const ents2 = [ ...value2.values() ];
                if (ents1.length === ents2.length) {
                    for (let i = 0; i < ents1.length; i++) {
                        if (ents1[i] !== ents2[i]) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else if (isMap(value1) || isObject(value1)) {
            const [ ents1, ents2, sameType ] = (() => {
                if (isMap(value1) && isMap(value2)) {
                    return [
                        [ ...value1.entries() ],
                        [ ...value2.entries() ],
                        true
                    ];
                } else if (isObject(value1) && isObject(value2)) {
                    return [
                        Object.entries(value1),
                        Object.entries(value2),
                        true
                    ];
                } else {
                    return [ [], [], false ];
                }
            })();
            if (sameType) {
                if (ents1.length === ents2.length) {
                    for (let i = 0; i < ents1.length; i++) {
                        const [ prop1, val1 ] = ents1[i];
                        const [ prop2, val2 ] = ents2[i];
                        if (prop1 !== prop2) {
                            return false;
                        }
                        if (proc(val1, val2) === false) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else if (isArray(value1)) {
            if (isArray(value2)) {
                if (value1.length === value2.length) {
                    for (let i = 0; i < value1.length; i++) {
                        if (proc(value1[i], value2[i]) === false) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return (value1 === value2);
        }
    }
    return proc(value1, value2);
}

export type DeepPartial<T> = {
    [K in keyof T]?: DeepPartial<T[K]>;
}

export type SchemaBase<T> = {
    readonly optional?: boolean;
    readonly nullable?: boolean;
    readonly fallback?: (T | null);
    readonly equal?: T;
    readonly oneOf?: T[];
    readonly validate?: (obj: T) => Issue[];
}

export type SchemaString = SchemaBase<string> & {
    readonly type: 'string';
    readonly allowEmpty?: boolean;
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly startsWith?: string;
    readonly endsWith?: string;
    readonly matches?: RegExp;
}

export type SchemaNumber = SchemaBase<number> & {
    readonly type: ('number' | 'integer');
    readonly minValue?: number;
    readonly maxValue?: number;
}

export type SchemaBoolean = SchemaBase<boolean> & {
    readonly type: 'boolean';
}

export type SchemaObject<T extends object> = SchemaBase<T> & {
    readonly type: 'object';
    readonly entry?: Schema<any>;
    readonly arbitrary?: boolean;
    readonly props?: {
        readonly [K in keyof Required<T>]: Schema<T[K]>;
    }
}

export type SchemaArray<T extends unknown[]> = SchemaBase<T> & {
    readonly type: 'array';
    readonly item?: Schema<T[0]>;
    readonly key?: string;
    readonly allowEmpty?: boolean;
    readonly minLength?: number;
    readonly maxLength?: number;
}

type Wrap<T> = T extends [ infer Head, ...infer Tail ] ? [ Schema<Head>, ...Wrap<Tail> ] : T;

export type SchemaTuple<T extends unknown[]> = SchemaBase<[ ...T ]> & {
    readonly type: 'tuple';
    readonly items: Wrap<T>;
}

export type SchemaFunction = SchemaBase<Function> & {
    readonly type: 'function';
}

export type SchemaAny = SchemaBase<any> & {
    readonly type: 'any';
}

export type Schema<T> = (
    T extends Function ? SchemaFunction :
    T extends any[] ? (SchemaArray<T> | SchemaTuple<T>) :
    T extends object ? SchemaObject<T> :
    T extends string ? SchemaString :
    T extends number ? SchemaNumber :
    T extends boolean ? SchemaBoolean :
    SchemaAny
);

export type AnySchema = (
    SchemaFunction | SchemaArray<any[]> |
    SchemaTuple<any[]> | SchemaObject<object> |
    SchemaString | SchemaNumber |
    SchemaBoolean | SchemaAny
);

export type SchemaDataType<T> = T extends Schema<infer TT> ? TT : unknown;

export type DiffBase<T> = {
    readonly action: 'add';
    readonly newValue: (T | null);
} | {
    readonly action: 'modify';
    readonly oldValue: (T | null);
    readonly newValue: (T | null);
} | {
    readonly action: 'delete';
    readonly oldValue: (T | null);
}

export type DiffString = DiffBase<string> & {
    readonly type: 'string';
    readonly schema: SchemaString;
}

export type DiffNumber = DiffBase<number> & {
    readonly type: ('number' | 'integer');
    readonly schema: SchemaNumber;
}

export type DiffBoolean = DiffBase<boolean> & {
    readonly type: 'boolean';
    readonly schema: SchemaBoolean;
}

export type DiffFunction = DiffBase<Function> & {
    readonly type: 'function';
    readonly schema: SchemaFunction;
}

export type DiffAny = DiffBase<any> & {
    readonly type: 'any';
    readonly schema: SchemaAny;
}

export type DiffObject = DiffBase<object> & {
    readonly type: 'object';
    readonly schema: SchemaObject<object>;
} & {
    readonly props: {
        readonly [key: string]: Diff;
    }
}

export type DiffTuple = DiffBase<any[]> & {
    readonly type: 'tuple';
    readonly schema: SchemaTuple<any[]>;
} & {
    readonly items: (Diff | undefined)[];
}

export type DiffArray = DiffBase<any[]> & {
    readonly type: 'array';
    readonly schema: SchemaArray<any[]>;
} & {
    readonly items: (Diff | undefined)[];
}

export type Diff = (DiffString | DiffNumber | DiffBoolean | DiffAny | DiffFunction | DiffObject | DiffTuple | DiffArray);

export type Issue = {
    readonly path: string;
    readonly message: string;
}

export type ValidateOptions = {
    readonly partial?: boolean;
    readonly fallback?: boolean;
}

export const validate = (value: any, schema: AnySchema, options?: ValidateOptions): Issue[] => {
    const proc = (obj: any, prop: (string | number), schema: AnySchema, path: string): Issue[] => {
        if ((obj[prop] !== null) && (obj[prop] !== undefined)) {
            let ret: Issue[] = [];
            if (schema.type === 'string') {
                if (isString(obj[prop])) {
                    if ((schema.allowEmpty !== true) && (obj[prop] === '')) {
                        ret = [ ...ret, { path, message: 'empty string is not allowed' } ];
                    }
                    if (isAssigned(schema.minLength) && (obj[prop].length < schema.minLength)) {
                        ret = [ ...ret, { path, message: `string length is less than ${schema.minLength}` } ];
                    }
                    if (isAssigned(schema.maxLength) && (obj[prop].length > schema.maxLength)) {
                        ret = [ ...ret, { path, message: `string length is greater than ${schema.maxLength}` } ];
                    }
                    if (isAssigned(schema.startsWith) && !obj[prop].startsWith(schema.startsWith)) {
                        ret = [ ...ret, { path, message: `string does not start with "${schema.startsWith}"` } ];
                    }
                    if (isAssigned(schema.endsWith) && !obj[prop].endsWith(schema.endsWith)) {
                        ret = [ ...ret, { path, message: `string does not end with "${schema.endsWith}"` } ];
                    }
                    if (isAssigned(schema.matches) && !schema.matches.test(obj[prop])) {
                        ret = [ ...ret, { path, message: `string does not match regexp "${schema.matches.toString()}"` } ];
                    }
                    if (isAssigned(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not equal to ${schema.equal}` } ];
                    }
                    if (isAssigned(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` } ];
                    }
                    if (isAssigned(schema.validate)) {
                        ret = [ ...ret, ...schema.validate(obj[prop]).map(i => ({ ...i, path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })) ];
                    }
                } else {
                    ret = [{ path, message: 'value is not a string' }];
                }
            } else if ((schema.type === 'number') || schema.type === 'integer') {
                const name = ((schema.type === 'number') ? 'a number' : 'an integer');
                const isType = ((schema.type === 'number') ? isNumber : isInteger);
                if (isType(obj[prop])) {
                    if (isAssigned(schema.minValue) && (obj[prop] < schema.minValue)) {
                        ret = [ ...ret, { path, message: `value is less than ${schema.minValue}` } ];
                    }
                    if (isAssigned(schema.maxValue) && (obj[prop] > schema.maxValue)) {
                        ret = [ ...ret, { path, message: `value is greater than ${schema.maxValue}` } ];
                    }
                    if (isAssigned(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not equal to ${schema.equal}` } ];
                    }
                    if (isAssigned(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` } ];
                    }
                    if (isAssigned(schema.validate)) {
                        ret = [ ...ret, ...schema.validate(obj[prop]).map(i => ({ ...i, path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })) ];
                    }
                } else {
                    ret = [{ path, message: 'value is not ' + name }];
                }
            } else if (schema.type === 'object') {
                if (isObject(obj[prop])) {
                    const objProps = Object.entries(obj[prop]);
                    const schProps = Object.entries(schema.props ?? {});
                    const arbitrary = schema.arbitrary ?? (isAssigned(schema.props) === false);
                    for (const [ propName, propSchema ] of schProps) {
                        ret = [ ...ret, ...proc(obj[prop], propName, (propSchema as any), `${path}.${propName}`) ];
                    }
                    if (arbitrary === false) {
                        for (const [ propName ] of objProps) {
                            if (schProps.some(([ pn ]) => pn === propName)) {
                                continue;
                            } else {
                                ret = [ ...ret, { path, message: `arbitrary property "${propName}" is not allowed` } ]
                            }
                        }
                    }
                    if (isAssigned(schema.entry)) {
                        for (const [ propName ] of objProps) {
                            ret = [ ...ret, ...proc(obj[prop], propName, (schema.entry as any), `${path}.${propName}`) ];
                        }
                    }
                    if (isAssigned(schema.equal) && !isDeepEqual(schema.equal, obj[prop])) {
                        ret = [ ...ret, { path, message: 'value is not equal to expected object' } ];
                    }
                    if (isAssigned(schema.oneOf) && !schema.oneOf.some(i => isDeepEqual(i, obj[prop]))) {
                        ret = [ ...ret, { path, message: 'value is not one of expected objects' } ];
                    }
                    if (isAssigned(schema.validate)) {
                        ret = [ ...ret, ...schema.validate(obj[prop]).map(i => ({ ...i, path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })) ];
                    }
                } else {
                    ret = [{ path, message: 'value is not an object' }];
                }
            } else if (schema.type === 'tuple') {
                if (isArray(obj[prop])) {
                    if (isAssigned(schema.oneOf) && !schema.oneOf.some(i => isDeepEqual(i, obj[prop]))) {
                        ret = [ ...ret, { path, message: `value is not one of expected tuples` } ];
                    }
                    if (isAssigned(schema.equal) && !isDeepEqual(schema.equal, obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not equal to expected tuple` } ];
                    }
                    if (obj[prop].length !== schema.items.length) {
                        ret = [ ...ret, { path, message: 'wrong number of items in tuple' } ];
                    }
                    for (let i = 0; i < schema.items.length; i++) {
                        ret = [ ...ret, ...proc(obj[prop], i, schema.items[i], `${path}[${i}]`) ];
                    }
                    if (isAssigned(schema.validate)) {
                        ret = [ ...ret, ...schema.validate(obj[prop]).map(i => ({ ...i, path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })) ];
                    }
                } else {
                    ret = [{ path, message: 'value is not a tuple' }];
                }
            } else if (schema.type === 'array') {
                if (isArray(obj[prop])) {
                    if ((schema.allowEmpty !== true) && (obj[prop].length === 0)) {
                        ret = [ ...ret, { path, message: 'empty array is not allowed' } ];
                    }
                    if (isAssigned(schema.minLength) && (obj[prop].length < schema.minLength)) {
                        ret = [ ...ret, { path, message: `array length is less than ${schema.minLength}` } ];
                    }
                    if (isAssigned(schema.maxLength) && (obj[prop].length > schema.maxLength)) {
                        ret = [ ...ret, { path, message: `array length is greater than ${schema.maxLength}` } ];
                    }
                    if (isAssigned(schema.oneOf) && !schema.oneOf.some(i => isDeepEqual(i, obj[prop])) ) {
                        ret = [ ...ret, { path, message: `value is not one of expected arrays` } ];
                    }
                    if (isAssigned(schema.equal) && !isDeepEqual(schema.equal, obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not equal to expected array` } ];
                    }
                    if (isAssigned(schema.item)) {
                        for (let i = 0; i < obj[prop].length; i++) {
                            ret = [ ...ret, ...proc(obj[prop], i, schema.item, `${path}[${i}]`) ]
                        }
                    }
                    if (isAssigned(schema.validate)) {
                        ret = [ ...ret, ...schema.validate(obj[prop]).map(i => ({ ...i, path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })) ];
                    }
                } else {
                    ret = [{ path, message: 'value is not an array' }];
                }
            } else if (schema.type === 'boolean') {
                if (isBool(obj[prop])) {
                    if (isAssigned(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not equal to ${schema.equal}` } ];
                    }
                    if (isAssigned(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` } ];
                    }
                    if (isAssigned(schema.validate)) {
                        ret = [ ...ret, ...schema.validate(obj[prop]).map(i => ({ ...i, path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })) ];
                    }
                } else {
                    ret = [{ path, message: 'value is not a boolean' }];
                }
            } else if (schema.type === 'function') {
                if (isFunction(obj[prop])) {
                    if (isAssigned(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not equal to ${schema.equal}` } ];
                    }
                    if (isAssigned(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` } ];
                    }
                    if (isAssigned(schema.validate)) {
                        ret = [ ...ret, ...schema.validate(obj[prop]).map(i => ({ ...i, path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })) ];
                    }
                } else {
                    ret = [{ path, message: 'value is not a function' }];
                }
            } else if (schema.type === 'any') {
                if (isAssigned(schema.equal) && (schema.equal !== obj[prop])) {
                    ret = [ ...ret, { path, message: `value is not equal to ${schema.equal}` } ];
                }
                if (isAssigned(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                    ret = [ ...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` } ];
                }
                if (isAssigned(schema.validate)) {
                    ret = [ ...ret, ...schema.validate(obj[prop]).map(i => ({ ...i, path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })) ];
                }
            }
            return ret;
        } else {
            if (obj[prop] === null) {
                if (schema.nullable === true) {
                    return [];
                } else {
                    return [{ path, message: 'value can\'t be null' }];
                }
            } else if (obj[prop] === undefined) {
                if ((schema.optional === true)
                || (options?.partial === true)) {
                    return [];
                } else {
                    if (isAssigned(schema.fallback) && (options?.fallback !== false)) {
                        obj[prop] = schema.fallback;
                        return proc(obj, prop, schema, path);
                    } else {
                        return [{ path, message: 'value can\'t be undefined' }];
                    }
                }
            }
            return [];
        }
    }
    return proc({ root: value }, 'root', schema, '');
}

export type CompareOptions = {
    readonly srcPartial?: boolean;
    readonly dstPartial?: boolean;
}

export const compare = (src: any, dst: any, schema: AnySchema, options?: CompareOptions): (Diff | undefined) => {
    const proc = <T>(src: any, dst: any, schema: AnySchema): (Diff | undefined) => {
        if ((schema.type === 'string')
        || (schema.type === 'number')
        || (schema.type === 'integer')
        || (schema.type === 'boolean')
        || (schema.type === 'function')
        || (schema.type === 'any')) {
            if (src === dst) {
                return undefined;
            } else if (src === undefined) {
                if (options?.srcPartial !== true) {
                    return <Diff>{
                        type: schema.type,
                        schema: schema,
                        action: 'add',
                        newValue: dst,
                    };
                } else {
                    return undefined;
                }
            } else if (dst === undefined) {
                if (options?.dstPartial !== true) {
                    return <Diff>{
                        type: schema.type,
                        schema: schema,
                        action: 'delete',
                        oldValue: src,
                    };
                } else {
                    return undefined;
                }
            } else {
                return <Diff>{
                    type: schema.type,
                    schema: schema,
                    action: 'modify',
                    oldValue: src,
                    newValue: dst
                }
            }
        } else if (schema.type === 'object') {
            const diffs: { [key: string]: Diff; } = {};
            const srcObj = (src ?? {});
            const dstObj = (dst ?? {});
            for (const [ propName, propSchema ] of Object.entries(schema.props ?? {})) {
                const diff = proc(srcObj[propName], dstObj[propName], propSchema);
                if (isAssigned(diff)) {
                    diffs[propName] = diff;
                }
            }
            if (src === undefined) {
                if (options?.srcPartial !== true) {
                    return {
                        type: 'object',
                        schema: schema,
                        action: 'add',
                        newValue: dst,
                        props: diffs
                    }
                } else {
                    return undefined;
                }
            } else if (dst === undefined) {
                if (options?.dstPartial !== true) {
                    return {
                        type: 'object',
                        schema: schema,
                        action: 'delete',
                        oldValue: src,
                        props: diffs
                    }
                } else {
                    return undefined;
                }
            } else {
                if (Object.keys(diffs).length > 0) {
                    return {
                        type: 'object',
                        schema: schema,
                        action: 'modify',
                        oldValue: src,
                        newValue: dst,
                        props: diffs
                    }
                } else {
                    return undefined;
                }
            }
        } else if (schema.type === 'tuple') {
            const diffs: (Diff | undefined)[] = [];
            const srcTpl = (src ?? []);
            const dstTpl = (dst ?? []);
            for (let i = 0; i < schema.items.length; i++) {
                diffs.push(
                    proc(srcTpl[i], dstTpl[i], schema.items[i])
                );
            }
            if (src === undefined) {
                if (options?.srcPartial !== true) {
                    return {
                        type: 'tuple',
                        schema: schema,
                        action: 'add',
                        newValue: dst,
                        items: diffs
                    }
                } else {
                    return undefined;
                }
            } else if (dst === undefined) {
                if (options?.dstPartial !== true) {
                    return {
                        type: 'tuple',
                        schema: schema,
                        action: 'delete',
                        oldValue: src,
                        items: diffs
                    }
                } else {
                    return undefined;
                }
            } else {
                if (Object.keys(diffs).length > 0) {
                    return {
                        type: 'tuple',
                        schema: schema,
                        action: 'modify',
                        oldValue: src,
                        newValue: dst,
                        items: diffs
                    }
                } else {
                    return undefined;
                }
            }
        } else if (schema.type === 'array') {
            const diffs: Diff[] = [];
            const srcArr = (src ?? []);
            const dstArr = (dst ?? []);
            if (isAssigned(schema.item)) {
                if ((schema.item.type === 'string')
                || (schema.item.type === 'number')
                || (schema.item.type === 'integer')
                || (schema.item.type === 'boolean')
                || (schema.item.type === 'function')
                || (schema.item.type === 'any')) {
                    for (const srcItem of srcArr) {
                        if (!dstArr.some((i: any) => i === srcItem)) {
                            diffs.push(<Diff>{
                                type: schema.item.type,
                                schema: schema.item,
                                action: 'delete',
                                oldValue: srcItem
                            });
                        }
                    }
                    for (const dstItem of dstArr) {
                        if (!srcArr.some((i: any) => i === dstItem)) {
                            diffs.push(<Diff>{
                                type: schema.item.type,
                                schema: schema.item,
                                action: 'add',
                                newValue: dstItem
                            });
                        }
                    }
                } else if (schema.item.type === 'object') {
                    if (isAssigned(schema.key)) {
                        const __key = schema.key;
                        for (const srcItem of srcArr) {
                            const dstItem = dstArr.find((i: any) => i[__key] === srcItem[__key]);
                            const diff = proc(srcItem, dstItem, schema.item);
                            if (isAssigned(diff)) {
                                diffs.push(diff);
                            }
                        }
                        for (const dstItem of dstArr) {
                            if (!srcArr.some((i: any) => i[__key] === dstItem[__key])) {
                                const diff = proc(undefined, dstItem, schema.item);
                                if (isAssigned(diff)) {
                                    diffs.push(diff);
                                }
                            }
                        }
                    } else {
                        const max = Math.max(srcArr.length, dstArr.length);
                        for (let i = 0; i < max; i++) {
                            const diff = proc(srcArr[i], dstArr[i], schema.item);
                            if (isAssigned(diff)) {
                                diffs.push(diff);
                            }
                        }
                    }
                } else if (schema.item.type === 'array') {
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
                        if (options?.srcPartial !== true) {
                            return <Diff>{
                                type: schema.type,
                                schema: schema,
                                action: 'add',
                                newValue: dst,
                                items: diffs
                            }
                        } else {
                            return undefined;
                        }
                    } else if (dst === undefined) {
                        if (options?.dstPartial !== true) {
                            return <Diff>{
                                type: schema.type,
                                schema: schema,
                                action: 'delete',
                                oldValue: src,
                                items: diffs
                            }
                        } else {
                            return undefined;
                        }
                    } else {
                        return <Diff>{
                            type: schema.type,
                            schema: schema,
                            action: 'modify',
                            oldValue: src,
                            newValue: dst,
                            items: diffs
                        }
                    }
                } else {
                    return undefined;
                }
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }
    return proc(src, dst, schema);
}

export type AssertOptions = ValidateOptions & {
    readonly description?: string;
}

export const assert = <T>(value: T | undefined | null, schema: Schema<T>, options?: AssertOptions): T => {
    const value_ = ((value === undefined) ? (options?.fallback === true ? schema.fallback : undefined) : value);
    const issues = validate(value_, schema, options);
    if (issues.length > 0) {
        throw new Error(`${options?.description ? `${options.description} ` : ''}assertion failed: ${issues.map(({ path, message }) => `${path.length > 0 ? `${path}: ` : ''}${message}`).join(', ')}`);
    } else {
        return value_;
    }
}

export type PatchOptions = AssertOptions & {

}

export const patch = <T extends object>(target: (T | undefined | null), patch: (DeepPartial<T> | undefined | null), schema: Schema<T>, options?: PatchOptions): T => {
    try {
        if (isObject(target) === false) {
            throw new Error('Target must be an object');
        }
        if (isObject(patch) === false) {
            throw new Error('Patch must be an object');
        }

        const clonedTarget: T = (() => {
            try {
                return JSON.parse(JSON.stringify(target));
            } catch (e) {
                throw new Error(`Failed to clone target: ${e.message}`);
            }
        })();
        const targetValid = (() => {
            try {
                return assert(clonedTarget, schema, options);
            } catch (e) {
                throw new Error(`Failed to validate target object: ${e.message}`);
            }
        })();
        const patchValid = (() => {
            try {
                return assert(patch, schema, { ...options, partial: true });
            } catch (e) {
                throw new Error(`Failed to validate patch object: ${e.message}`);
            }
        })();

        const assignPrimitive = (target: any, key: string, patch: any) => {
            if ((patch !== null)
            && (patch !== undefined)) {
                if ((target[key] !== null)
                && (target[key] !== undefined)) {
                    if (typeof patch === typeof target[key]) {
                        target[key] = patch;
                    } else {
                        throw new Error('Object shape mismatch');
                    }
                } else {
                    target[key] = patch;
                }
            } else {
                target[key] = patch;
            }
        }

        const assignArray = (target: any[], patch: any[], schema?: SchemaArray<any[]>) => {
            if (schema?.item?.type === 'object') {
                const key = schema?.key;
                if (key) {
                    const newTarget: any[] = [];
                    for (const patchItem of patch) {
                        const targetItem = target.find(i => i[key] === patchItem[key]);
                        if (targetItem) {
                            assignObject(targetItem, patchItem, schema?.item);
                            newTarget.push(targetItem);
                        } else {
                            newTarget.push(JSON.parse(JSON.stringify(patchItem)));
                        }
                    }
                    target.splice(0, target.length, ...newTarget);
                } else {
                    const newTarget: any[] = [];
                    for (let i = 0; i < patch.length; i++) {
                        const patchItem = patch[i];
                        const targetItem = target[i];
                        if (targetItem) {
                            assignObject(targetItem, patchItem);
                            newTarget.push(targetItem);
                        } else {
                            newTarget.push(JSON.parse(JSON.stringify(patchItem)));
                        }
                    }
                    target.splice(0, target.length, ...newTarget);
                }
            } else {
                target.splice(0, target.length, ...JSON.parse(JSON.stringify(patch)));
            }
        }

        const assignObject = (target: any, patch: any, schema?: SchemaObject<object>) => {
            for (const [ key, patchValue ] of Object.entries(patch)) {
                const patchSchema = (schema?.props as any)?.[key];
                if (isObject(patchValue)) {
                    target[key] ??= {};
                    if (isObject(target[key])) {
                        assignObject(
                            target[key],
                            patchValue,
                            ((patchSchema?.type === 'object')
                                ? patchSchema
                                : undefined)
                        );
                    } else {
                        throw new Error('Object shape mismatch');
                    }
                } else if (isArray(patchValue)) {
                    target[key] ??= [];
                    if (isArray(target[key])) {
                        assignArray(
                            target[key],
                            patchValue,
                            ((patchSchema?.type === 'array')
                                ? patchSchema
                                : undefined)
                        );
                    } else {
                        throw new Error('Object shape mismatch');
                    }
                } else {
                    assignPrimitive(target, key, patchValue);
                }
            }
        }

        assignObject(clonedTarget, patchValid, schema as SchemaObject<T>);

        try {
            return assert(targetValid, schema, options);
        } catch (e) {
            throw new Error(`Failed to validate resulting object: ${e.message}`);
        }
    } catch (e) {
        throw new Error(`Failed to patch object: ${e.message}`);
    }
}

export const INTEGER_REGEXP: RegExp = /^-?\d+$/
export const NUMBER_REGEXP: RegExp = /^-?\d*(\.\d+)?$/
export const POSITIVE_INTEGER_REGEXP: RegExp = /^\d+$/
export const POSITIVE_NUMBER_REGEXP: RegExp = /^\d*(\.\d+)?$/
export const NEGATIVE_INTEGER_REGEXP: RegExp = /^-\d+$/
export const NEGATIVE_NUMBER_REGEXP: RegExp = /^-\d*(\.\d+)?$/
export const DATETIME_REGEXP: RegExp = /^[+-]?\d{4}-[01]\d-[0-3]\d(T[0-2]\d:[0-5]\d?(:[0-5]\d(\.\d+)?)?([+-][0-2]\d:[0-5]\d)?Z?)?$/
export const EMAIL_REGEXP: RegExp = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
export const URL_REGEXP: RegExp = /^((https?|ftp):)?\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
export const UUID_REGEXP: RegExp = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
export const IPV4_REGEXP: RegExp = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
export const IPV6_REGEXP: RegExp = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
export const SLUG_REGEXP: RegExp = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const NAME_REGEXP: RegExp = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/
export const PATH_REGEXP: RegExp = /^((\/|\\|\/\/)?[a-z0-9 _@\-^!#$%&+={}.\/\\\[\]]+)+(\.[a-z]+)?$/
export const UNIX_PATH_REGEXP: RegExp = /^((\/)?[a-z0-9 _@\-^!#$%&+={}.\/]+)+(\.[a-z]+)?$/
export const WIN32_PATH_REGEXP: RegExp = /^((\\|\\\\)?[a-z0-9 _@\-^!#$%&+={}.\\\[\]]+)+(\.[a-z]+)?$/
export const USERNAME_REGEXP: RegExp = /^[a-z0-9_-]{3,16}$/
// Should have 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character and be at least 8 characters long...
export const COMPLEX_PASSWORD_REGEXP: RegExp = /^(?=(.*[0-9]))(?=.*[\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}$/
// Should have 1 lowercase letter, 1 uppercase letter, 1 number, and be at least 8 characters long...
export const MODERATE_PASSWORD_REGEXP: RegExp = /^(?=(.*[0-9]))((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.{8,}$/