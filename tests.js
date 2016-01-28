'use strict';
/* globals Interpreter */
/* globals acorn */

/*
 * Tests functionality added by me@ballingt.com, does not test
 * preexisting functionality of https://github.com/NeilFraser/JS-Interpreter
 */

var chai = require('chai');
var assert = chai.assert;

require('./interpreter.js'); // introduces global Interpreter object

describe('testing environment', function(){
  it('has globals', function(){
    assert.isDefined(acorn);
    assert.isDefined(acorn.walk);
    assert.isDefined(Interpreter);
  });
});

function makeWaitAndReady(){
  var callWhenReady;
  function initWait(interpreter, scope){
    function wait(callback){
      callWhenReady = callback;
    }
    interpreter.setProperty(scope, 'wait',
                            interpreter.createAsyncFunction(wait));
  }
  function ready(){
    callWhenReady('hello');
  }
  return {initWait:initWait, ready:ready};
}

describe('async function', function(){
  it('pauses interpreter', function(){
    var f = makeWaitAndReady();
    var interp = new Interpreter('1; wait(); 2;', f.initWait);
    assert.isTrue(interp.run());
    assert.equal(interp.value, 1);
    assert.equal(interp.paused_, true);
    f.ready();
    assert.equal(interp.paused_, false);
    assert.isFalse(interp.run());
    assert.equal(interp.value, 2);
  });
});

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
        `function foo(){ return 1; };
        wait()`,
        undefined, undefined, bodies);
      assert.property(interp, 'userFunctionBodies');
      assert.property(interp.userFunctionBodies, 'foo');
      assert.notProperty(interp.userFunctionBodies, 'abc');
    });
    it('always look up their asts in the global scope', function(){
      var bodies = {};
      var f = makeWaitAndReady();
      var interp = new Interpreter(
        `function foo(){ return 1; };
         var abc = 17;
         foo();
         wait();
         foo();
         `,
        f.initWait, undefined, bodies);
      assert.property(interp, 'userFunctionBodies');
      assert.property(interp.userFunctionBodies, 'foo');
      assert.notProperty(interp.userFunctionBodies, 'abc');

      assert.isTrue(interp.run()); // should be paused
      assert.equal(interp.value, 1);
      interp.userFunctionBodies.foo.body[0].argument.value = 2;
      assert.isTrue(interp.run());
      f.ready();
      assert.isFalse(interp.run());
      assert.equal(interp.value, 2);
    });
  });
  describe('snapshots', function(){
    it('are not affected by changes in the environments', function(){
      // (check that deepcopies work)
    });
    //it('are not affected by builtins being modified', function(){});
    it('still look up their bodies on each invocation', function(){
    });
    it('update a global table each time they are called', function(){
    });
    it('know what source code they correspond to even after being copied', function(){
    });
  });
  describe('asts', function(){
    it('can be diffed to find which function bodies have changed', function(){
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

// main thing to test is deepcopy protecting copies of functions from each other
