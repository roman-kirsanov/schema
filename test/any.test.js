const assert = require('assert')
const schema = require('../')

module.exports = () => {

    assert.doesNotThrow(() => schema.assert(true,       { type: 'any' }));
    assert.doesNotThrow(() => schema.assert(1,          { type: 'any' }));
    assert.doesNotThrow(() => schema.assert('123',      { type: 'any' }));
    assert.doesNotThrow(() => schema.assert({ a: 'b' }, { type: 'any' }));
    assert.doesNotThrow(() => schema.assert(1,          { type: 'any', equal: 1 }));
    assert.doesNotThrow(() => schema.assert('123',      { type: 'any', oneOf: ['123'] }));
    assert.doesNotThrow(() => schema.assert(undefined,  { type: 'any', optional: true }));
    assert.doesNotThrow(() => schema.assert(null,       { type: 'any', nullable: true }));

    assert.throws(() => schema.assert(1,          { type: 'any', equal: '1' }));
    assert.throws(() => schema.assert('123',      { type: 'any', oneOf: ['abc', 123] }));
    assert.throws(() => schema.assert(undefined,  { type: 'any' }));
    assert.throws(() => schema.assert(null,       { type: 'any' }));
}