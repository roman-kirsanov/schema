const assert = require('assert')
const schema = require('../')

module.exports = () => {

    assert.doesNotThrow(() => schema.assert('abc',      { type: 'string' }));
    assert.doesNotThrow(() => schema.assert(' ',        { type: 'string' }));
    assert.doesNotThrow(() => schema.assert('string1',  { type: 'string', minLength: 7 }));
    assert.doesNotThrow(() => schema.assert('string 2', { type: 'string', minLength: 8 }));
    assert.doesNotThrow(() => schema.assert(' ',        { type: 'string', minLength: 1 }));
    assert.doesNotThrow(() => schema.assert('string1',  { type: 'string', minLength: 7, maxLength: 7 }));
    assert.doesNotThrow(() => schema.assert('string 2', { type: 'string', minLength: 8, maxLength: 9 }));
    assert.doesNotThrow(() => schema.assert(' ',        { type: 'string', minLength: 1, maxLength: 1 }));
    assert.doesNotThrow(() => schema.assert('abc',      { type: 'string', equal: 'abc' }));
    assert.doesNotThrow(() => schema.assert('xyz',      { type: 'string', oneOf: ['abc', 'xyz'] }));
    assert.doesNotThrow(() => schema.assert('abc',      { type: 'string', matches: /abc/ }));
    assert.doesNotThrow(() => schema.assert('123',      { type: 'string', matches: /\d+/ }));
    assert.doesNotThrow(() => schema.assert('',         { type: 'string', allowEmpty: true }));
    assert.doesNotThrow(() => schema.assert(undefined,  { type: 'string', optional: true }));
    assert.doesNotThrow(() => schema.assert(null,       { type: 'string', nullable: true }));

    assert.throws(() => schema.assert(undefined,    { type: 'string' }));
    assert.throws(() => schema.assert(null,         { type: 'string' }));
    assert.throws(() => schema.assert({ a: 'b' },   { type: 'string' }));
    assert.throws(() => schema.assert(123,          { type: 'string' }));
    assert.throws(() => schema.assert(true,         { type: 'string' }));
    assert.throws(() => schema.assert('string',     { type: 'string', minLength: 7 }));
    assert.throws(() => schema.assert(' ',          { type: 'string', minLength: 2 }));
    assert.throws(() => schema.assert('string',     { type: 'string', minLength: 7, maxLength: 7 }));
    assert.throws(() => schema.assert('string 234', { type: 'string', minLength: 8, maxLength: 9 }));
    assert.throws(() => schema.assert(' ',          { type: 'string', minLength: 2, maxLength: 3 }));
    assert.throws(() => schema.assert('abc',        { type: 'string', equal: 'xyz' }));
    assert.throws(() => schema.assert('xyz',        { type: 'string', oneOf: ['abc', 'def'] }));
    assert.throws(() => schema.assert('abc',        { type: 'string', matches: /xyz/ }));
    assert.throws(() => schema.assert('',           { type: 'string' }));
    assert.throws(() => schema.assert(undefined,    { type: 'string' }));
    assert.throws(() => schema.assert(null,         { type: 'string' }));
}