'use strict';
var chai = require('chai');
var assert = chai.assert;

require('./interpreter.js'); // introduces global Interpreter object

describe('JS interpreter', function(){
  describe('something', function(){
    it('do simple stuff', function(){
      assert.isDefined(Interpreter);
      assert.isTrue(1 + 1 === 2);
    });
  });
});

// main thing to test is deepcopy protecting copies of functions from each other
