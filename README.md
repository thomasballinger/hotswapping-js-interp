JS-Interpreter with hot-swappable functions
===========================================

This is a fork of https://github.com/NeilFraser/JS-Interpreter
to make changes necessary for a live editing environment similar
to https://github.com/thomasballinger/dalsegno with additional
changes relevants sharing these changes betwen many interpreters.

This entails the following changes:

* Use a function lookup scope global to all interpreters for user-defined
  functions. Each time a function is looked up and found to be in this global
  function scope, the updated AST is used.
* Keep a record of when functions were looked up in this way by all
  interpreters.
* Deep-copy of interpreter state for making snapshots
* AST diffing to determine which functions have changed when
  the user edits the source.
* Code run in every interpreter highlights the user-entered source in an
  editor.
* Prevent two user-defined functions from having the same name.

Once these changes are made I might turn them into monkey-patches on the
original interpreter but forking now for easier development.
