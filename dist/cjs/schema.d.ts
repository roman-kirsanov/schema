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
export declare const isSet: <T>(value: T) => value is NonNullable<T>;
export declare const isNotSet: (value: any) => value is null | undefined;
export declare const isEmpty: (value: any) => value is "" | null | undefined;
export declare const isNonEmpty: (value: any) => value is string;
export declare const ifNotSet: <T>(value: T, value2: NonNullable<T>) => NonNullable<T>;
export declare const ifEmpty: (value: any, value2: string) => string;
export declare const isCyclic: (value: any) => boolean;
export declare const isDeepEqual: (value: any, value2: any) => boolean;
export declare type SchemaBase<T> = {
    readonly optional?: boolean;
    readonly nullable?: boolean;
    readonly fallback?: (T | null);
    readonly equal?: T;
    readonly oneOf?: T[];
    readonly validate?: (obj: T) => Issue[];
};
export declare type SchemaString = SchemaBase<string> & {
    readonly type: 'string';
    readonly allowEmpty?: boolean;
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly matches?: RegExp;
};
export declare type SchemaNumber = SchemaBase<number> & {
    readonly type: ('number' | 'integer');
    readonly minValue?: number;
    readonly maxValue?: number;
};
export declare type SchemaBoolean = SchemaBase<boolean> & {
    readonly type: 'boolean';
};
export declare type SchemaObject<T extends object> = SchemaBase<T> & {
    readonly type: 'object';
    readonly entry?: Schema<any>;
} & ({
    readonly arbitrary?: boolean;
    readonly props?: {
        readonly [K in keyof Required<T>]: Schema<T[K]>;
    };
} | {
    readonly arbitrary: false;
    readonly props?: {
        readonly [K in keyof Required<T>]: Schema<T[K]>;
    };
} | {
    readonly arbitrary: true;
    readonly props?: {
        readonly [K in keyof Partial<T>]: Schema<T[K]>;
    };
});
export declare type SchemaArray<T extends unknown[]> = SchemaBase<T> & {
    readonly type: 'array';
    readonly item?: Schema<T[0]>;
    readonly key?: string;
    readonly allowEmpty?: boolean;
    readonly minLength?: number;
    readonly maxLength?: number;
};
declare type Wrap<T> = T extends [infer Head, ...infer Tail] ? [Schema<Head>, ...Wrap<Tail>] : T;
export declare type SchemaTuple<T extends unknown[]> = SchemaBase<[...T]> & {
    readonly type: 'tuple';
    readonly items: Wrap<T>;
};
export declare type SchemaFunction = SchemaBase<Function> & {
    readonly type: 'function';
};
export declare type SchemaAny = SchemaBase<any> & {
    readonly type: 'any';
};
export declare type Schema<T = any> = (T extends Function ? SchemaFunction : T extends any[] ? (SchemaArray<T> | SchemaTuple<T>) : T extends object ? SchemaObject<T> : T extends string ? SchemaString : T extends number ? SchemaNumber : T extends boolean ? SchemaBoolean : SchemaAny) | SchemaAny;
export declare type DiffBase<T> = {
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
export declare type DiffString = DiffBase<string> & {
    readonly type: 'string';
    readonly schema: SchemaString;
};
export declare type DiffNumber = DiffBase<number> & {
    readonly type: ('number' | 'integer');
    readonly schema: SchemaNumber;
};
export declare type DiffBoolean = DiffBase<boolean> & {
    readonly type: 'boolean';
    readonly schema: SchemaBoolean;
};
export declare type DiffFunction = DiffBase<Function> & {
    readonly type: 'function';
    readonly schema: SchemaFunction;
};
export declare type DiffAny = DiffBase<any> & {
    readonly type: 'any';
    readonly schema: SchemaAny;
};
export declare type DiffObject = DiffBase<any> & {
    readonly type: 'object';
    readonly schema: SchemaObject<any>;
} & {
    readonly props: {
        readonly [key: string]: Diff;
    };
};
export declare type DiffTuple = DiffBase<any[]> & {
    readonly type: 'tuple';
    readonly schema: SchemaTuple<any[]>;
} & {
    readonly items: (Diff | undefined)[];
};
export declare type DiffArray = DiffBase<any[]> & {
    readonly type: 'array';
    readonly schema: SchemaArray<any[]>;
} & {
    readonly items: (Diff | undefined)[];
};
export declare type Diff = (DiffString | DiffNumber | DiffBoolean | DiffAny | DiffFunction | DiffObject | DiffTuple | DiffArray);
export declare type Issue = {
    readonly path: string;
    readonly message: string;
};
export declare type ValidateOptions = {
    readonly partial?: boolean;
    readonly fallback?: boolean;
};
export declare const validate: <T>(value: T | null | undefined, schema: Schema<T>, options?: ValidateOptions | undefined) => Issue[];
export declare type CompareOptions = {
    readonly srcPartial?: boolean;
    readonly dstPartial?: boolean;
};
export declare const compare: <T>(src: any, dst: any, schema: Schema<any>, options?: CompareOptions | undefined) => (Diff | undefined);
export declare type AssertOptions = ValidateOptions & {
    readonly description?: string;
};
export declare const assert: <T>(value: T | null | undefined, schema: Schema<T>, options?: AssertOptions | undefined) => T;
export declare const INTEGER_RGEXP: RegExp;
export declare const NUMBER_REGEXP: RegExp;
export declare const POSITIVE_INTEGER_RGEXP: RegExp;
export declare const POSITIVE_NUMBER_REGEXP: RegExp;
export declare const NEGATIVE_INTEGER_RGEXP: RegExp;
export declare const NEGATIVE_NUMBER_REGEXP: RegExp;
export declare const ISO_DATE_REGEXP: RegExp;
export declare const ISO_DATE_HHMM_REGEXP: RegExp;
export declare const ISO_DATE_HHMMSS_REGEXP: RegExp;
export declare const DATETIME_REGEXP: RegExp;
export declare const EMAIL_REGEXP: RegExp;
export declare const URL_REGEXP: RegExp;
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
