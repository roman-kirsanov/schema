const assert = require('assert')
const schema = require('../')

module.exports = () => {
    const OBJ1 = { a: 'b' }
    const OBJ2 = { __proto__: OBJ1, b: 'c' };
    assert(schema.isPrototypeOf(OBJ1, {}) === false);
    assert(schema.isPrototypeOf(OBJ2, {}) === false);
    assert(schema.isPrototypeOf(OBJ1, OBJ2) === false);
    assert(schema.isPrototypeOf(OBJ2, OBJ1) === true);
    assert(schema.isPrototypeOf({}, Object) === false);

    assert(schema.isPromise(new Promise(r => setTimeout(r, 1000))) === true);
    assert(schema.isPromise(1) === false);
    assert(schema.isPromise('1') === false);
    assert(schema.isPromise({ a: 'b' }) === false);
    assert(schema.isPromise({}) === false);

    assert(schema.isObject({}) === true);
    assert(schema.isObject({ a: 'b' }) === true);
    assert(schema.isObject(new Date()) === false);
    assert(schema.isObject('1') === false);
    assert(schema.isObject(123) === false);

    assert(schema.isArray([]) === true);
    assert(schema.isArray([1,2,3]) === true);
    assert(schema.isArray(new Array()) === true);
    assert(schema.isArray('1') === false);
    assert(schema.isArray(123) === false);
    assert(schema.isArray({}) === false);

    assert(schema.isFunction(() => {}) === true);
    assert(schema.isFunction(async () => {}) === true);
    assert(schema.isFunction((() => () => {})()) === true);
    assert(schema.isFunction('1') === false);
    assert(schema.isFunction(123) === false);
    assert(schema.isFunction({}) === false);

    assert(schema.isString('') === true);
    assert(schema.isString('123') === true);
    assert(schema.isString(new String(123)) === true);
    assert(schema.isString(true) === false);
    assert(schema.isString(123) === false);
    assert(schema.isString({}) === false);

    assert(schema.isNumber(1) === true);
    assert(schema.isNumber(1.23) === true);
    assert(schema.isNumber(new Number(123)) === true);
    assert(schema.isNumber(true) === false);
    assert(schema.isNumber('123') === false);
    assert(schema.isNumber({}) === false);

    assert(schema.isInteger(1) === true);
    assert(schema.isInteger(12) === true);
    assert(schema.isInteger(new Number('123')) === true);
    assert(schema.isInteger(true) === false);
    assert(schema.isInteger('123') === false);
    assert(schema.isInteger({}) === false);
    assert(schema.isInteger(1.23) === false);
    assert(schema.isInteger(33.004) === false);

    assert(schema.isDate(new Date()) === true);
    assert(schema.isDate(true) === false);
    assert(schema.isDate('123') === false);
    assert(schema.isDate({}) === false);

    assert(schema.isBool(true) === true);
    assert(schema.isBool(false) === true);
    assert(schema.isBool(new Boolean('a')) === true);
    assert(schema.isBool(123) === false);
    assert(schema.isBool('123') === false);
    assert(schema.isBool({}) === false);

    assert(schema.isSet(null) === false);
    assert(schema.isSet(undefined) === false);
    assert(schema.isSet(0) === true);
    assert(schema.isSet('123') === true);
    assert(schema.isSet(123) === true);
    assert(schema.isSet({}) === true);

    assert(schema.isNotSet(null) === true);
    assert(schema.isNotSet(undefined) === true);
    assert(schema.isNotSet(0) === false);
    assert(schema.isNotSet('123') === false);
    assert(schema.isNotSet(123) === false);
    assert(schema.isNotSet({}) === false);

    assert(schema.isEmpty(null) === true);
    assert(schema.isEmpty(undefined) === true);
    assert(schema.isEmpty('') === true);
    assert(schema.isEmpty('123') === false);
    assert(schema.isEmpty(0) === false);
    assert(schema.isEmpty(123) === false);
    assert(schema.isEmpty({}) === false);

    assert(schema.isNonEmpty('123') === true);
    assert(schema.isNonEmpty(null) === false);
    assert(schema.isNonEmpty(undefined) === false);
    assert(schema.isNonEmpty('') === false);
    assert(schema.isNonEmpty(0) === false);
    assert(schema.isNonEmpty(123) === false);
    assert(schema.isNonEmpty({}) === false);

    assert(schema.ifNotSet(null, '1') === '1');
    assert(schema.ifNotSet(undefined, 123) === 123);
    assert(schema.ifNotSet(0, 1) === 0);
    assert(schema.ifNotSet('123', 123) === '123');
    assert(schema.ifNotSet(123, '123') === 123);

    assert(schema.ifEmpty(null, 1) === 1);
    assert(schema.ifEmpty(undefined, '123') === '123');
    assert(schema.ifEmpty('', '123') === '123');
    assert(schema.ifEmpty('123', 123) === '123');
    assert(schema.ifEmpty(123, '123') === '123');

    const OBJ3 = { a: 'b' }
    const OBJ4 = { a: 'b', c: OBJ3 };
    const OBJ5 = { a: 'b' }; OBJ5.c = { d: OBJ5 };
    assert(schema.isCyclic(OBJ3) === false);
    assert(schema.isCyclic(OBJ4) === false);
    assert(schema.isCyclic(OBJ5) === true);

    const OBJ10 = { a: 'b', c: 'd' };
    const OBJ11 = { a: 'b', c: 'd' };
    const OBJ12 = { c: 'd', a: 'b' };
    const OBJ13 = [1, 2, 3];
    const OBJ14 = [1, 2, 3];
    const OBJ15 = [1, 2, 3, { a: 'b' }];
    const OBJ16 = [1, 2, 3, { a: 'b' }];
    const OBJ17 = [1, 2, 3, { a: 'b', x: [4, 5, 6] }];
    const OBJ18 = [1, 2, 3, { a: 'b', x: [4, 5, 6] }];
    const OBJ19 = [1, 2, 3, { a: 'b', x: [4, 6, 5] }];
    assert(schema.isDeepEqual(OBJ10, OBJ11) === true);
    assert(schema.isDeepEqual(OBJ11, OBJ12) === false);
    assert(schema.isDeepEqual(OBJ12, OBJ13) === false);
    assert(schema.isDeepEqual(OBJ13, OBJ14) === true);
    assert(schema.isDeepEqual(OBJ14, OBJ15) === false);
    assert(schema.isDeepEqual(OBJ15, OBJ16) === true);
    assert(schema.isDeepEqual(OBJ16, OBJ17) === false);
    assert(schema.isDeepEqual(OBJ17, OBJ18) === true);
    assert(schema.isDeepEqual(OBJ18, OBJ19) === false);
}