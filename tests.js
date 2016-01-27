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
  describe('named functions', function(){
    it('have their ast bodies stored in a global object', function(){
      var bodies = {};
      var interp = new Interpreter(
        `function foo(){ return a; }; var abc = 17;`,
        undefined, undefined, bodies);
      assert.property(interp, 'userFunctionBodies');
      assert.property(interp.userFunctionBodies, 'foo');
      assert.notProperty(Interpreter.UserFunctionBodies, 'abc');
    });
    it('always look up their asts in the global scope', function(){
    });
  });
  describe('functions', function(){
    it('can be invoked in a different interpreter than where they were defined', function(){
    });
    it('still work as expected wrt typeof checks and interpreter isa checks', function(){
    });
    it('are not affected by changes in the environments of the functions from which they were copied', function(){
      // (check that deepcopies work)
    });
    it('still look up their bodies on each invocation', function(){
    });
    it('update a global table each time they are called', function(){
    });
    it('know what source code they correspond to even after being copied', function(){
    });
  });
  describe('asts', function(){
    it('can be diffed to find what function bodies have changed', function(){
      // change to number of arguments counts as a change to the surrouding body
      // see dal segno for logic
    });
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
    assert.isDefined(acorn.walk);
    assert.isDefined(Interpreter);
  });
});

// main thing to test is deepcopy protecting copies of functions from each other
