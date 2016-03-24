JS-Interpreter with hot-swappable functions
===========================================

This is a fork of https://github.com/NeilFraser/JS-Interpreter
to make changes necessary for a live editing environment similar
to https://github.com/thomasballinger/dalsegno. Among these changes:

* Named function lookup occurs in a scope global to all interpreters for user-defined
  functions. Each time a function is looked up and found to be in this global
  function scope, the updated AST is used.
* A record of when a function was last looked up by any interpreter is kept.
* The interpreter state can be copied to create a snapshot
* Interpreters can "Fork and exec" to create a new interpreter
  with a copy of the old interpreter state but running a new function
* AST diffing is used to determine which functions have changed when
  the user edits the source.
* Code run in every interpreter highlights the user-entered source in an
  editor.
* It is not allowed for two user-defined functions to have the same name.

Some of the above functionality exists in https://github.com/thomasballinger/shiplang

I'm interested in other JavaScript-in-JavaScript implementations.
I'd be happy with ES3 like this implementation. I'm also intersted in
other limitations that would make sharing state between interpreters safe
like preventing the addition of properties to the Array builtin.
