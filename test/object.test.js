const assert = require('assert')
const schema = require('../')

module.exports = () => {

    const OBJ1 = { a: 'b' };
    const OBJ2 = new Date();
    const OBJ3 = { a: 'b', c: [1, 2], d: { e: 'f' } };

    assert.doesNotThrow(() => schema.assert(OBJ1,               { type: 'object' }));
    assert.doesNotThrow(() => schema.assert({},                 { type: 'object' }));
    assert.doesNotThrow(() => schema.assert({},                 { type: 'object', props: {} }));
    assert.doesNotThrow(() => schema.assert({},                 { type: 'object', props: { a: { type: 'string', optional: true } } }));
    assert.doesNotThrow(() => schema.assert({ a: 'b' },         { type: 'object', props: { a: { type: 'string' } } }));
    assert.doesNotThrow(() => schema.assert({ a: 'b', c: 'd' }, { type: 'object', props: { a: { type: 'string' } }, arbitrary: true }));
    assert.doesNotThrow(() => schema.assert(OBJ3,               { type: 'object', equal: { a: 'b', c: [1, 2], d: { e: 'f' } } }));
    assert.doesNotThrow(() => schema.assert(OBJ1,               { type: 'object', oneOf: [{ c: 'd' }, { a: 'b' }] }));
    assert.doesNotThrow(() => schema.assert(undefined,          { type: 'object', optional: true }));
    assert.doesNotThrow(() => schema.assert(null,               { type: 'object', nullable: true }));

    assert.throws(() => schema.assert(OBJ2,               { type: 'object' }));
    assert.throws(() => schema.assert({ a: 'b' },         { type: 'object', props: {} }));
    assert.throws(() => schema.assert({},                 { type: 'object', props: { a: { type: 'string' } } }));
    assert.throws(() => schema.assert({ a: 'b', c: 'd' }, { type: 'object', props: { a: { type: 'string' } } }));
    assert.throws(() => schema.assert(OBJ3,               { type: 'object', equal: { a: 'b', c: [2, 1], d: { e: 'x' } } }));
    assert.throws(() => schema.assert(OBJ1,               { type: 'object', oneOf: [{ b: 'd' }, { a: 'c' }] }));
    assert.throws(() => schema.assert(undefined,          { type: 'object' }));
    assert.throws(() => schema.assert(null,               { type: 'object' }));
}