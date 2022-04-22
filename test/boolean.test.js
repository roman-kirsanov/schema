const assert = require('assert')
const schema = require('../')

module.exports = () => {

    assert.doesNotThrow(() => schema.assert(true,       { type: 'boolean' }));
    assert.doesNotThrow(() => schema.assert(false,      { type: 'boolean' }));
    assert.doesNotThrow(() => schema.assert(false,      { type: 'boolean', equal: false }));
    assert.doesNotThrow(() => schema.assert(true,       { type: 'boolean', oneOf: [true, false] }));
    assert.doesNotThrow(() => schema.assert(undefined,  { type: 'boolean', optional: true }));
    assert.doesNotThrow(() => schema.assert(null,       { type: 'boolean', nullable: true }));

    assert.throws(() => schema.assert(undefined,  { type: 'boolean' }));
    assert.throws(() => schema.assert(null,       { type: 'boolean' }));
    assert.throws(() => schema.assert({ a: 'b' }, { type: 'boolean' }));
    assert.throws(() => schema.assert('123',      { type: 'boolean' }));
    assert.throws(() => schema.assert(123,        { type: 'boolean' }));
    assert.throws(() => schema.assert(true,       { type: 'boolean', equal: false }));
    assert.throws(() => schema.assert(false,      { type: 'boolean', oneOf: [true] }));
    assert.throws(() => schema.assert(undefined,  { type: 'boolean' }));
    assert.throws(() => schema.assert(null,       { type: 'boolean' }));
}