const assert = require('assert')
const schema = require('../')

module.exports = () => {

    const SCHEMA = {
        type: 'object',
        props: {
            name: { type: 'string' },
            keyedArray: {
                type: 'array',
                key: 'name',
                item: {
                    type: 'object',
                    props: {
                        name: { type: 'string' },
                        age: { type: 'integer' },
                        country: {
                            type: 'object',
                            props: {
                                name: { type: 'string' },
                                population: { type: 'integer' }
                            }
                        }
                    }
                }
            },
            objectArray: {
                type: 'array',
                item: {
                    type: 'object',
                    props: {
                        name: { type: 'string' },
                        age: { type: 'integer' }
                    }
                }
            },
            primitiveArray: {
                type: 'array',
                item: { type: 'string' }
            }
        }
    }

    let people = {
        name: 'People',
        keyedArray: [{
            name: 'Roman',
            age: 27,
            country: {
                name: 'Mexico',
                population: 0
            }
        }, {
            name: 'Perez',
            age: 33,
            country: {
                name: 'Paprica',
                population: 100
            }
        }],
        objectArray: [{
            name: 'Foo',
            age: 123
        }, {
            name: 'Bar',
            age: 321
        }],
        primitiveArray: [
            'Foo',
            'Bar'
        ]
    }

    assert.deepEqual(people = schema.patch(people, {
        keyedArray: [{
            name: 'Roman',
            country: {
                population: 1000000
            }
        }, {
            name: 'Julia',
            age: 18,
            country: {
                name: 'Mexico',
                population: 1111111
            }
        }]
    }, SCHEMA), {
        name: 'People',
        keyedArray: [{
            name: 'Roman',
            age: 27,
            country: { name: 'Mexico', population: 1000000 }
        }, {
            name: 'Julia',
            age: 18,
            country: { name: 'Mexico', population: 1111111 }
        }],
        objectArray: [{
            name: 'Foo',
            age: 123
        }, {
            name: 'Bar',
            age: 321
        }],
        primitiveArray: [
            'Foo',
            'Bar'
        ]
    })

    assert.deepEqual(people = schema.patch(people, {
        objectArray: [{
            name: 'Baz',
            age: 444
        }]
    }, SCHEMA), {
        name: 'People',
        keyedArray: [{
            name: 'Roman',
            age: 27,
            country: { name: 'Mexico', population: 1000000 }
        }, {
            name: 'Julia',
            age: 18,
            country: { name: 'Mexico', population: 1111111 }
        }],
        objectArray: [{
            name: 'Baz',
            age: 444
        }],
        primitiveArray: [
            'Foo',
            'Bar'
        ]
    })

    assert.deepEqual(people = schema.patch(people, {
        primitiveArray: [
            'Foo',
            'Bar',
            'Baz'
        ]
    }, SCHEMA), {
        name: 'People',
        keyedArray: [{
            name: 'Roman',
            age: 27,
            country: { name: 'Mexico', population: 1000000 }
        }, {
            name: 'Julia',
            age: 18,
            country: { name: 'Mexico', population: 1111111 }
        }],
        objectArray: [{
            name: 'Baz',
            age: 444
        }],
        primitiveArray: [
            'Foo',
            'Bar',
            'Baz'
        ]
    })

    assert.deepEqual(people = schema.patch(people, {
        keyedArray: [{
            name: 'Roman',
            age: 37
        }, {
            name: 'Julia',
            age: 18,
            country: { name: 'Mexico', population: 1111111 }
        }, {
            name: 'Boom.js',
            age: 1,
            country: { name: 'Mexico', population: 1 }
        }],
        primitiveArray: [
            'a',
            'b',
            'c'
        ]
    }, SCHEMA), {
        name: 'People',
        keyedArray: [{
            name: 'Roman',
            age: 37,
            country: { name: 'Mexico', population: 1000000 }
        }, {
            name: 'Julia',
            age: 18,
            country: { name: 'Mexico', population: 1111111 }
        }, {
            name: 'Boom.js',
            age: 1,
            country: { name: 'Mexico', population: 1 }
        }],
        objectArray: [{
            name: 'Baz',
            age: 444
        }],
        primitiveArray: [
            'a',
            'b',
            'c'
        ]
    })
}