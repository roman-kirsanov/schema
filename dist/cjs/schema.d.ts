export declare const isPrototypeOf: (value: any, proto: any) => boolean;
export declare const isPromise: (value: any) => value is Promise<any>;
export declare const isObject: (value: any) => value is Object;
export declare const isArray: (value: any) => value is any[];
export declare const isFunction: (value: any) => value is Function;
export declare const isString: (value: any) => value is string;
export declare const isNumber: (value: any) => value is number;
export declare const isInteger: (value: any) => value is number;
export declare const isDate: (value: any) => value is Date;
export declare const isBool: (value: any) => value is boolean;
export declare const isMap: (value: any) => value is Map<any, any>;
export declare const isSet: (value: any) => value is Set<any>;
export declare const isPrimitive: (value: any) => value is string | number | boolean;
export declare const isAssigned: <T>(value: T) => value is NonNullable<T>;
export declare const isNotAssigned: (value: any) => value is null | undefined;
export declare const isEmpty: (value: any) => value is "" | null | undefined;
export declare const isNonEmpty: (value: any) => value is string;
export declare const ifNotAssigned: <T>(value: T, value2: NonNullable<T>) => NonNullable<T>;
export declare const ifEmpty: (value: any, value2: string) => string;
export declare const isCyclic: (value: any) => boolean;
export declare const isDeepEqual: (value1: any, value2: any) => boolean;
export type DeepPartial<T> = {
    [K in keyof T]?: DeepPartial<T[K]>;
};
export type SchemaBase<T> = {
    readonly optional?: boolean;
    readonly nullable?: boolean;
    readonly fallback?: (T | null);
    readonly equal?: T;
    readonly oneOf?: T[];
    readonly validate?: (obj: T) => Issue[];
};
export type SchemaString = SchemaBase<string> & {
    readonly type: 'string';
    readonly allowEmpty?: boolean;
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly startsWith?: string;
    readonly endsWith?: string;
    readonly matches?: RegExp;
};
export type SchemaNumber = SchemaBase<number> & {
    readonly type: ('number' | 'integer');
    readonly minValue?: number;
    readonly maxValue?: number;
};
export type SchemaBoolean = SchemaBase<boolean> & {
    readonly type: 'boolean';
};
export type SchemaObject<T extends object> = SchemaBase<T> & {
    readonly type: 'object';
    readonly entry?: Schema<any>;
    readonly arbitrary?: boolean;
    readonly props?: {
        readonly [K in keyof Required<T>]: Schema<T[K]>;
    };
};
export type SchemaArray<T extends unknown[]> = SchemaBase<T> & {
    readonly type: 'array';
    readonly item?: Schema<T[0]>;
    readonly key?: string;
    readonly allowEmpty?: boolean;
    readonly minLength?: number;
    readonly maxLength?: number;
};
type Wrap<T> = T extends [infer Head, ...infer Tail] ? [Schema<Head>, ...Wrap<Tail>] : T;
export type SchemaTuple<T extends unknown[]> = SchemaBase<[...T]> & {
    readonly type: 'tuple';
    readonly items: Wrap<T>;
};
export type SchemaFunction = SchemaBase<Function> & {
    readonly type: 'function';
};
export type SchemaAny = SchemaBase<any> & {
    readonly type: 'any';
};
export type Schema<T> = (T extends Function ? SchemaFunction : T extends any[] ? (SchemaArray<T> | SchemaTuple<T>) : T extends object ? SchemaObject<T> : T extends string ? SchemaString : T extends number ? SchemaNumber : T extends boolean ? SchemaBoolean : SchemaAny);
export type AnySchema = (SchemaFunction | SchemaArray<any[]> | SchemaTuple<any[]> | SchemaObject<object> | SchemaString | SchemaNumber | SchemaBoolean | SchemaAny);
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
};
export type DiffString = DiffBase<string> & {
    readonly type: 'string';
    readonly schema: SchemaString;
};
export type DiffNumber = DiffBase<number> & {
    readonly type: ('number' | 'integer');
    readonly schema: SchemaNumber;
};
export type DiffBoolean = DiffBase<boolean> & {
    readonly type: 'boolean';
    readonly schema: SchemaBoolean;
};
export type DiffFunction = DiffBase<Function> & {
    readonly type: 'function';
    readonly schema: SchemaFunction;
};
export type DiffAny = DiffBase<any> & {
    readonly type: 'any';
    readonly schema: SchemaAny;
};
export type DiffObject = DiffBase<object> & {
    readonly type: 'object';
    readonly schema: SchemaObject<object>;
} & {
    readonly props: {
        readonly [key: string]: Diff;
    };
};
export type DiffTuple = DiffBase<any[]> & {
    readonly type: 'tuple';
    readonly schema: SchemaTuple<any[]>;
} & {
    readonly items: (Diff | undefined)[];
};
export type DiffArray = DiffBase<any[]> & {
    readonly type: 'array';
    readonly schema: SchemaArray<any[]>;
} & {
    readonly items: (Diff | undefined)[];
};
export type Diff = (DiffString | DiffNumber | DiffBoolean | DiffAny | DiffFunction | DiffObject | DiffTuple | DiffArray);
export type Issue = {
    readonly path: string;
    readonly message: string;
};
export type ValidateOptions = {
    readonly partial?: boolean;
    readonly fallback?: boolean;
};
export declare const validate: (value: any, schema: AnySchema, options?: ValidateOptions) => Issue[];
export type CompareOptions = {
    readonly srcPartial?: boolean;
    readonly dstPartial?: boolean;
};
export declare const compare: (src: any, dst: any, schema: AnySchema, options?: CompareOptions) => (Diff | undefined);
export type AssertOptions = ValidateOptions & {
    readonly description?: string;
};
export declare const assert: <T>(value: T | null | undefined, schema: Schema<T>, options?: AssertOptions) => T;
export type PatchOptions = AssertOptions & {};
export declare const patch: <T extends object>(target: T | null | undefined, patch: DeepPartial<T> | null | undefined, schema: Schema<T>, options?: PatchOptions) => T;
export declare const deepOptional: <T>(schema: Schema<T>) => Schema<DeepPartial<T>>;
export declare const INTEGER_REGEXP: RegExp;
export declare const NUMBER_REGEXP: RegExp;
export declare const POSITIVE_INTEGER_REGEXP: RegExp;
export declare const POSITIVE_NUMBER_REGEXP: RegExp;
export declare const NEGATIVE_INTEGER_REGEXP: RegExp;
export declare const NEGATIVE_NUMBER_REGEXP: RegExp;
export declare const DATETIME_REGEXP: RegExp;
export declare const EMAIL_REGEXP: RegExp;
export declare const URL_REGEXP: RegExp;
export declare const UUID_REGEXP: RegExp;
export declare const IPV4_REGEXP: RegExp;
export declare const IPV6_REGEXP: RegExp;
export declare const SLUG_REGEXP: RegExp;
export declare const NAME_REGEXP: RegExp;
export declare const PATH_REGEXP: RegExp;
export declare const UNIX_PATH_REGEXP: RegExp;
export declare const WIN32_PATH_REGEXP: RegExp;
export declare const USERNAME_REGEXP: RegExp;
export declare const COMPLEX_PASSWORD_REGEXP: RegExp;
export declare const MODERATE_PASSWORD_REGEXP: RegExp;
export {};
