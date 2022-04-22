const assert = require('assert')
const schema = require('../')

module.exports = () => {

    assert.doesNotThrow(() => schema.assert(123,        { type: 'number' }));
    assert.doesNotThrow(() => schema.assert(4.5,        { type: 'number' }));
    assert.doesNotThrow(() => schema.assert(7,          { type: 'number', minValue: 7 }));
    assert.doesNotThrow(() => schema.assert(9,          { type: 'number', minValue: 8 }));
    assert.doesNotThrow(() => schema.assert(7,          { type: 'number', minValue: 7, maxValue: 7 }));
    assert.doesNotThrow(() => schema.assert(8.5,        { type: 'number', minValue: 8, maxValue: 9 }));
    assert.doesNotThrow(() => schema.assert(123.55,     { type: 'number', equal: 123.55 }));
    assert.doesNotThrow(() => schema.assert(321,        { type: 'number', oneOf: [123, 321] }));
    assert.doesNotThrow(() => schema.assert(undefined,  { type: 'number', optional: true }));
    assert.doesNotThrow(() => schema.assert(null,       { type: 'number', nullable: true }));

    assert.throws(() => schema.assert(undefined,    { type: 'number' }));
    assert.throws(() => schema.assert(null,         { type: 'number' }));
    assert.throws(() => schema.assert({ a: 'b' },   { type: 'number' }));
    assert.throws(() => schema.assert('123',        { type: 'number' }));
    assert.throws(() => schema.assert(true,         { type: 'number' }));
    assert.throws(() => schema.assert(6,            { type: 'number', minValue: 7 }));
    assert.throws(() => schema.assert(7.999,        { type: 'number', minValue: 8 }));
    assert.throws(() => schema.assert(6,            { type: 'number', minValue: 7, maxValue: 7 }));
    assert.throws(() => schema.assert(9.001,        { type: 'number', minValue: 8, maxValue: 9 }));
    assert.throws(() => schema.assert(123.551,      { type: 'number', equal: 123.55 }));
    assert.throws(() => schema.assert(322,          { type: 'number', oneOf: [123, 321] }));
    assert.throws(() => schema.assert(undefined,    { type: 'number' }));
    assert.throws(() => schema.assert(null,         { type: 'number' }));
}