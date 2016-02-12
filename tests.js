'use strict';
/* globals Interpreter */
/* globals acorn */
/* globals deepcopy */

/*
 * Tests functionality added by me@ballingt.com, does not test
 * preexisting functionality of https://github.com/NeilFraser/JS-Interpreter
 */

var chai = require('chai');
var assert = chai.assert;

require('./interpreter.js'); // introduces global Interpreter object

function TestingUserFunctionBodies(){
  this.bodies = {};
}
TestingUserFunctionBodies.prototype.getBody = function(name){
  return this.bodies[name];
};
TestingUserFunctionBodies.prototype.saveBody = function(name, body){
  this.bodies[name] = body;
};

describe('testing environment', function(){
  it('has globals', function(){
    assert.isDefined(acorn);
    assert.isDefined(acorn.walk);
    assert.isDefined(deepcopy);
    assert.isDefined(Interpreter);
    assert.isDefined(TestingUserFunctionBodies);
  });
});

function makeWaitAndReady(){
  var isReady = false;
  function initWait(interpreter, scope){
    function wait(){
      return function(){ return isReady; };
    }
    wait.finish = function(){
      return 17;
    };
    interpreter.setProperty(scope, 'wait',
                            interpreter.createAsyncFunction(wait));
  }
  function ready(){
    isReady = true;
  }
  return {initWait:initWait, ready:ready};
}

describe('async function', function(){
  it('pauses interpreter', function(){
    var f = makeWaitAndReady();
    var interp = new Interpreter('1; var a = wait(); 2;', f.initWait);
    assert.isTrue(interp.run());
    assert.equal(interp.value, 1);
    assert.equal(interp.paused_, true);
    f.ready();
    assert.equal(interp.paused_, true);
    assert.isTrue(interp.step());
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
      var bodies = new TestingUserFunctionBodies();
      var interp = new Interpreter(
        `function foo(){ return 1; };
        wait()`,
        undefined, undefined, bodies);
      assert.property(interp, 'userFunctionBodies');
      assert.property(interp.userFunctionBodies.bodies, 'foo');
      assert.notProperty(interp.userFunctionBodies.bodies, 'abc');
    });
    it('always look up their asts in the global scope', function(){
      var bodies = new TestingUserFunctionBodies();
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
      assert.property(interp.userFunctionBodies.bodies, 'foo');
      assert.notProperty(interp.userFunctionBodies.bodies, 'abc');

      assert.isTrue(interp.run()); // should be paused
      assert.equal(interp.value, 1);
      interp.userFunctionBodies.bodies.foo.body[0].argument.value = 2;
      assert.isTrue(interp.run());
      f.ready();
      assert.isFalse(interp.run());
      assert.equal(interp.value, 2);
    });
  });
  describe('snapshots', function(){
    it('are not affected by changes in the environments', function(){
      var f = makeWaitAndReady();
      var interp1 = new Interpreter(
        `var abc = 17;
         wait();
         abc = 2;
         abc = 2;
         `,
        f.initWait);
      assert.isTrue(interp1.run());
      var interp2 = interp1.copy();
      assert.isTrue(interp2.run());
      f.ready();
      for (var i=0; i < 11; i++){
        assert.isTrue(interp1.step());
      }
      assert.equal(interp1.getScope().properties.abc.data, 2);
      assert.equal(interp2.getScope().properties.abc.data, 17);
    });
    //it('are not affected by builtins being modified', function(){});
    it('still look up their bodies on each invocation', function(){
    });
    it('update a global table each time they are called', function(){
    });
    it('know what source code they correspond to even after being copied', function(){
    });
  });
  describe('forked interpreters', function(){
    it('can exec', function(){
      // adds a new stack frame that runs a function then dies
      var a = 0;
      var b = 0;
      var funcForExec;
      var interp2;
      var interp1 = new Interpreter(`
        function foo(){
          incrementB();
          bar();
        }
        function bar(){
          incrementB();
        }
        forkAndExec(foo);
        incrementA();
        `,
        function(interp, scope){
          interp.setProperty(scope, 'incrementA', interp.createNativeFunction(function(){ a += 1; }));
          interp.setProperty(scope, 'incrementB', interp.createNativeFunction(function(){ b += 1; }));
          interp.setProperty(scope, 'forkAndExec', interp.createNativeFunction(function(func){
            interp2 = interp.copy();
            funcForExec = func;
          }));
        } , undefined, new TestingUserFunctionBodies());
      assert.isFalse(interp1.run());
      assert.equal(a, 1);
      assert.equal(b, 0);

      interp2.exec(funcForExec);
      assert.isFalse(interp2.run());

      assert.equal(a, 1);
      assert.equal(b, 2);
    });
  });
  //TODO test that it's really a copy of the function in the new interp
  // (not implemented yet I believe

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
  });
});

// main thing to test is deepcopy protecting copies of functions from each other
