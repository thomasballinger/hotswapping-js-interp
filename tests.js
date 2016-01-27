'use strict';
/* globals Interpreter */
/* globals acorn */

var chai = require('chai');
var assert = chai.assert;

require('./interpreter.js'); // introduces global Interpreter object

describe('JS interpreter', function(){
  it('runs', function(){
    var interp = new Interpreter('1 + 1;');
    assert.isFalse(interp.run());
    assert.equal(interp.value, 2);
  });
  describe('user-defined functions', function(){
    it('can be extracted', function(){
      var finalScopeProps;
      var interp = new Interpreter(
        `function foo(){}; var a = 1;`,
        undefined,
        function(s){ finalScopeProps = s; });
      assert.isFalse(interp.run());
      assert.property(finalScopeProps, 'a');
      assert.property(finalScopeProps, 'foo');
    });
    it('can be identified', function(){
      var finalScopeProps;
      var interp = new Interpreter(
        `function foo(){ return a; }; var a = 1;`,
        undefined,
        function(s){ finalScopeProps = s; });
      assert.isFalse(interp.run());
      var newFuncs = interp.findNewFunctions(finalScopeProps);
      assert.notProperty(newFuncs, 'a');
      assert.property(newFuncs, 'foo');
    });
  });
});

describe('testing environment', function(){
  it('has globals', function(){
    assert.isDefined(acorn);
    assert.isDefined(Interpreter);
  });
});

// main thing to test is deepcopy protecting copies of functions from each other
