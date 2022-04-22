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

export const isSet = <T>(value: T): value is NonNullable<T> => (value !== null && value !== undefined);

export const isNotSet = (value: any): value is (null | undefined) => (value === null || value === undefined);

export const isEmpty = (value: any): value is (null | undefined | '') => (value === null || value === undefined || value === '');

export const isNonEmpty = (value: any): value is string => (isString(value) && value !== '');

export const ifNotSet = <T>(value: T, value2: NonNullable<T>): NonNullable<T> => isSet(value) ? value : value2;

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

export const isDeepEqual = (value: any, value2: any): boolean => {
    if (value === value2) {
        return true;
    }
    if (isCyclic(value)) {
        return false;
    }
    if (isCyclic(value2)) {
        return false;
    }
    const proc = (value: any, value2: any) => {
        if (value === value2) {
            return true;
        }
        if ((value === undefined)
        || (value === null)) {
            return false;
        } else if (isObject(value)) {
            if (isObject(value2)) {
                const ents = Object.entries(value);
                const ents2 = Object.entries(value2);
                if (ents.length === ents2.length) {
                    for (let i = 0; i < ents.length; i++) {
                        const [ prop, val ] = ents[i];
                        const [ prop2, val2 ] = ents2[i];
                        if (prop !== prop2) {
                            return false;
                        }
                        if (proc(val, val2) === false) {
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
        } else if (isArray(value)) {
            if (isArray(value2)) {
                if (value.length === value2.length) {
                    for (let i = 0; i < value.length; i++) {
                        if (proc(value[i], value2[i]) === false) {
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
            return (value === value2);
        }
    }
    return proc(value, value2);
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
    readonly props?: {
        readonly [K in keyof Required<T>]: Schema<T[K]>;
    },
    readonly entry?: Schema<any>;
    readonly arbitrary?: boolean;
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

export type Schema<T = any> =
    T extends Function ? (SchemaFunction | SchemaAny) :
    T extends any[] ? (SchemaArray<T> | SchemaTuple<T> | SchemaAny) :
    T extends object ? (SchemaObject<T> | SchemaAny) :
    T extends string ? (SchemaString | SchemaAny) :
    T extends number ? (SchemaNumber | SchemaAny) :
    T extends boolean ? (SchemaBoolean | SchemaAny) :
    never;

export type DiffBase<T> = {
    readonly action: 'add';
    readonly newValue: (T | null);
} | {
    readonly action: 'modify';
    readonly oldValue: (T | null);
    readonly newValue: (T | null);
} | {
    readonly action: 'unset';
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

export type DiffObject = DiffBase<any> & {
    readonly type: 'object';
    readonly schema: SchemaObject<any>;
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
    readonly fallback?: true;
}

export const validate = <T>(value: (T | null | undefined), schema: Schema<T>, options?: ValidateOptions): Issue[] => {
    const proc = (obj: any, prop: (string | number), schema: Schema<T>, path: string): Issue[] => {
        if ((obj[prop] !== null) && (obj[prop] !== undefined)) {
            let ret: Issue[] = [];
            if (schema.type === 'string') {
                if (isString(obj[prop])) {
                    if ((schema.allowEmpty !== true) && (obj[prop] === '')) {
                        ret = [ ...ret, { path, message: 'empty string is not allowed' } ];
                    }
                    if (isSet(schema.minLength) && (obj[prop].length < schema.minLength)) {
                        ret = [ ...ret, { path, message: `string length is less than ${schema.minLength}` } ];
                    }
                    if (isSet(schema.maxLength) && (obj[prop].length > schema.maxLength)) {
                        ret = [ ...ret, { path, message: `string length is greater than ${schema.maxLength}` } ];
                    }
                    if (isSet(schema.matches) && !schema.matches.test(obj[prop])) {
                        ret = [ ...ret, { path, message: `string does not match regexp "${schema.matches.toString()}"` } ];
                    }
                    if (isSet(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not equal to ${schema.equal}` } ];
                    }
                    if (isSet(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` } ];
                    }
                    if (isSet(schema.validate)) {
                        ret = [ ...ret, ...schema.validate(obj[prop]).map(i => ({ ...i, path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })) ];
                    }
                } else {
                    ret = [{ path, message: 'value is not a string' }];
                }
            } else if ((schema.type === 'number') || schema.type === 'integer') {
                const name = ((schema.type === 'number') ? 'a number' : 'an integer');
                const isType = ((schema.type === 'number') ? isNumber : isInteger);
                if (isType(obj[prop])) {
                    if (isSet(schema.minValue) && (obj[prop] < schema.minValue)) {
                        ret = [ ...ret, { path, message: `value is less than ${schema.minValue}` } ];
                    }
                    if (isSet(schema.maxValue) && (obj[prop] > schema.maxValue)) {
                        ret = [ ...ret, { path, message: `value is greater than ${schema.maxValue}` } ];
                    }
                    if (isSet(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not equal to ${schema.equal}` } ];
                    }
                    if (isSet(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` } ];
                    }
                    if (isSet(schema.validate)) {
                        ret = [ ...ret, ...schema.validate(obj[prop]).map(i => ({ ...i, path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })) ];
                    }
                } else {
                    ret = [{ path, message: 'value is not ' + name }];
                }
            } else if (schema.type === 'object') {
                if (isObject(obj[prop])) {
                    const objProps = Object.entries(obj[prop]);
                    const schProps = Object.entries(schema.props ?? {});
                    const arbitrary = schema.arbitrary ?? (isSet(schema.props) === false);
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
                    if (isSet(schema.entry)) {
                        for (const [ propName ] of objProps) {
                            ret = [ ...ret, ...proc(obj[prop], propName, (schema.entry as any), `${path}.${propName}`) ];
                        }
                    }
                    if (isSet(schema.equal) && !isDeepEqual(schema.equal, obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not equal to expected object` } ];
                    }
                    if (isSet(schema.oneOf) && !schema.oneOf.some(i => isDeepEqual(i, obj[prop]))) {
                        ret = [ ...ret, { path, message: `value is not one of expected objects` } ];
                    }
                    if (isSet(schema.validate)) {
                        ret = [ ...ret, ...schema.validate(obj[prop]).map(i => ({ ...i, path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })) ];
                    }
                } else {
                    ret = [{ path, message: 'value is not an object' }];
                }
            } else if (schema.type === 'tuple') {
                if (isArray(obj[prop])) {
                    if (isSet(schema.oneOf) && !schema.oneOf.some(i => isDeepEqual(i, obj[prop]))) {
                        ret = [ ...ret, { path, message: `value is not one of expected tuples` } ];
                    }
                    if (isSet(schema.equal) && !isDeepEqual(schema.equal, obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not equal to expected tuple` } ];
                    }
                    if (obj[prop].length !== schema.items.length) {
                        ret = [ ...ret, { path, message: 'wrong number of items in tuple' } ];
                    }
                    for (let i = 0; i < schema.items.length; i++) {
                        ret = [ ...ret, ...proc(obj[prop], i, schema.items[i], `${path}[${i}]`) ];
                    }
                    if (isSet(schema.validate)) {
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
                    if (isSet(schema.minLength) && (obj[prop].length < schema.minLength)) {
                        ret = [ ...ret, { path, message: `array length is less than ${schema.minLength}` } ];
                    }
                    if (isSet(schema.maxLength) && (obj[prop].length > schema.maxLength)) {
                        ret = [ ...ret, { path, message: `array length is greater than ${schema.maxLength}` } ];
                    }
                    if (isSet(schema.oneOf) && !schema.oneOf.some(i => isDeepEqual(i, obj[prop])) ) {
                        ret = [ ...ret, { path, message: `value is not one of expected arrays` } ];
                    }
                    if (isSet(schema.equal) && !isDeepEqual(schema.equal, obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not equal to expected array` } ];
                    }
                    if (isSet(schema.item)) {
                        for (let i = 0; i < obj[prop].length; i++) {
                            ret = [ ...ret, ...proc(obj[prop], i, schema.item, `${path}[${i}]`) ]
                        }
                    }
                    if (isSet(schema.validate)) {
                        ret = [ ...ret, ...schema.validate(obj[prop]).map(i => ({ ...i, path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })) ];
                    }
                } else {
                    ret = [{ path, message: 'value is not an array' }];
                }
            } else if (schema.type === 'boolean') {
                if (isBool(obj[prop])) {
                    if (isSet(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not equal to ${schema.equal}` } ];
                    }
                    if (isSet(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` } ];
                    }
                    if (isSet(schema.validate)) {
                        ret = [ ...ret, ...schema.validate(obj[prop]).map(i => ({ ...i, path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })) ];
                    }
                } else {
                    ret = [{ path, message: 'value is not a boolean' }];
                }
            } else if (schema.type === 'function') {
                if (isFunction(obj[prop])) {
                    if (isSet(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not equal to ${schema.equal}` } ];
                    }
                    if (isSet(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [ ...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` } ];
                    }
                    if (isSet(schema.validate)) {
                        ret = [ ...ret, ...schema.validate(obj[prop]).map(i => ({ ...i, path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })) ];
                    }
                } else {
                    ret = [{ path, message: 'value is not a function' }];
                }
            } else if (schema.type === 'any') {
                if (isSet(schema.equal) && (schema.equal !== obj[prop])) {
                    ret = [ ...ret, { path, message: `value is not equal to ${schema.equal}` } ];
                }
                if (isSet(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                    ret = [ ...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` } ];
                }
                if (isSet(schema.validate)) {
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
                    if (schema.fallback && (options?.fallback === true)) {
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

export const compare = <T>(src: any, dst: any, schema: Schema<any>, options?: CompareOptions): (Diff | undefined) => {
    const proc = (src: any, dst: any, schema: Schema<any>): (Diff | undefined) => {
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
                        action: 'unset',
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
                if (isSet(diff)) {
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
                        action: 'unset',
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
                        action: 'unset',
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
            if (isSet(schema.item)) {
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
                                action: 'unset',
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
                    if (isSet(schema.key)) {
                        const __key = schema.key;
                        for (const srcItem of srcArr) {
                            const dstItem = dstArr.find((i: any) => i[__key] === srcItem[__key]);
                            const diff = proc(srcItem, dstItem, schema.item);
                            if (isSet(diff)) {
                                diffs.push(diff);
                            }
                        }
                        for (const dstItem of dstArr) {
                            if (!srcArr.some((i: any) => i[__key] === dstItem[__key])) {
                                const diff = proc(undefined, dstItem, schema.item);
                                if (isSet(diff)) {
                                    diffs.push(diff);
                                }
                            }
                        }
                    } else {
                        const max = Math.max(srcArr.length, dstArr.length);
                        for (let i = 0; i < max; i++) {
                            const diff = proc(srcArr[i], dstArr[i], schema.item);
                            if (isSet(diff)) {
                                diffs.push(diff);
                            }
                        }
                    }
                } else if (schema.item.type === 'array') {
                    const max = Math.max(srcArr.length, dstArr.length);
                    for (let i = 0; i < max; i++) {
                        const diff = proc(srcArr[i], dstArr[i], schema.item);
                        if (isSet(diff)) {
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
                                action: 'unset',
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

export const assert = <T>(value: (T | undefined | null), schema: Schema<T>, options?: ValidateOptions): T => {
    const value_ = ((value === undefined) ? (options?.fallback === true ? schema.fallback : undefined) : value);
    const issues = validate(value_, schema, options);
    if (issues.length > 0) {
        throw new Error(`assertion failed: ${issues.map(({ path, message }) => `${path.length > 0 ? `${path}: ` : ''}${message}`).join(', ')}`);
    } else {
        return value_;
    }
}

export const INTEGER_RGEXP: RegExp = /^-?\d+$/
export const NUMBER_REGEXP: RegExp = /^-?\d*(\.\d+)?$/
export const POSITIVE_INTEGER_RGEXP: RegExp = /^\d+$/
export const POSITIVE_NUMBER_REGEXP: RegExp = /^\d*(\.\d+)?$/
export const NEGATIVE_INTEGER_RGEXP: RegExp = /^-\d+$/
export const NEGATIVE_NUMBER_REGEXP: RegExp = /^-\d*(\.\d+)?$/
export const DATETIME_REGEXP: RegExp = /^[+-]?\d{4}-[01]\d-[0-3]\d(T[0-2]\d:[0-5]\d?(:[0-5]\d(\.\d+)?)?([+-][0-2]\d:[0-5]\d)?Z?)?$/
export const EMAIL_REGEXP: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export const URL_REGEXP: RegExp = /^(?:http|https):\/\/[A-Za-z0-9\-]{0,63}(\.[A-Za-z0-9\-]{0,63})+(:\d{1,4})?\/*(\/*[A-Za-z0-9\-._]+\/*)*(\?.*)?(#.*)?$/
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