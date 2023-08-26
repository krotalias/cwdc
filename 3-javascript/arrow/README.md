# <div align="center"> {@link https://blog.kevinchisholm.com/javascript/difference-between-scope-and-context/ SCOPE X CONTEXT}</div>

## {@link https://developer.mozilla.org/en-US/docs/Glossary/Scope Scope} in JavaScript

{@link https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/README.md Scope}
has to do with the the visibility of variables.
In JavaScript, scope is achieved through the use of functions.<br>
When you use the keyword “var” inside of a function,
the variable that you are initializing is private to the function,
and cannot be seen outside of that function.<br>
But if there are functions inside of this function,
then those “inner” functions can “see” that variable,
and that variable is said to be “in-scope”.

-   Functions can “see” variables that are declared inside of them.
-   They can also “see” any that are declared outside of them,
-   but never those declared inside of functions that are nested in that function.
-   This is scope in JavaScript.

## {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this Context} in JavaScript

Context is related to objects. It refers to the object to which a function belongs.<br>
When you use the JavaScript “this” keyword, it refers to the object to which function belongs.

-   If the object “foo” has a method called “bar”, when the JavaScript keyword “this”
    is used inside of “bar”, it refers to “foo”.
-   If the function “bar” were executed in the global scope,
    then “this” refers to the window object (except in strict mode).

In most cases, the value of "this" is determined by how a function is called (runtime binding).<br>
It can't be set by assignment during execution, and it may be different each time the function is called.

The {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind bind()}
method can set the value of a function's "this" regardless of how it's called.<br>
On the other hand, {@link article arrow} functions don't provide their own "this" binding
(it retains the "this" value of the enclosing lexical context).

The keyword "this" is misunderstood in “borrowed methods”:

-   when a {@link user variable} is set to a method that uses "this";
-   when the function using "this" is a {@link Person callback} function and;
-   when "this" is in a {@link players closure} (in a internal function).

It is important to keep in mind that by using the JavaScript
{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call call()} or
{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply apply()} methods,
you can alter the context within which a function is executed.

-   This, in-turn, changes the meaning of “this” inside of that function when it is executed.

## {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures Closures} in JavaScript

A function that references bindings from local scopes around it is called a
{@link https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch7.md closure}.<br>
Closure means that an inner function always has access to the variables and parameters of its outer function,
even after the outer function has returned.

The inner function can access the variables of the enclosing function due to closures in JavaScript.<br>
As a consequence, the inner function preserves the scope chain of the enclosing function at the time
the enclosing function was executed, and thus can access the enclosing function’s variables.

In other words, the function defined in the <a href="/cwdc/3-javascript/closure/closure.html">closure</a>
‘remembers’ the environment in which it was created:

-   We must have a nested function (function inside a function).
-   The nested function must refer to a value defined in the enclosing function.
-   The enclosing function must return the nested function.

## {@link https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object_prototypes Prototypes} in JavaScript

<a href="/cs336/examples/javascript/javascript_notes2.pdf#page=6">Prototypes</a>
are the mechanism by which JavaScript objects inherit features from one another.<br>
Every object in JavaScript has a built-in property, which is called its prototype.

The prototype is itself an object, so the prototype will have its own prototype,
making what's called a prototype chain.<br>
The chain ends when we reach a prototype that has null for its own prototype.

When you try to access a property of an object:

-   if the property can't be found in the object itself, the prototype is searched for the property.
-   If the property still can't be found, then the prototype's prototype is searched,
-   and so on until either the property is found, or the end of the chain is reached,
    -   in which case undefined is returned.

## Usage

All the scripts here are meant to be run using {@link https://nodejs.dev/en/ Node.js}:

-   node article.js
-   node article2.js
-   node bob.js
-   node controller.js
-   node data.js
-   node person.js
-   node players.js
-   node players2.js
-   node sumNumber.js
