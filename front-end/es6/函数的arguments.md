### JavaScript arguments 理解

1. 什么是 arguments
MDN 上解释：

arguments 是一个类数组对象。代表传给一个function的参数列表。
我们先用一个例子直观了解下 JavaScript 中的 arguments 长什么样子。
```
function printArgs() {
    console.log(arguments);
}
printArgs("A", "a", 0, { foo: "Hello, arguments" });
```
执行结果是：
```
["A", "a", 0, Object]
```
乍一看，结果是个数组，但并不是真正的数组，所以说 arguments 是一个类数组的对象（想了解真正数组与类数组对象的区别可以一直翻到最后）。

再看看 arguments 表示的内容，其表示了函数执行时传入函数的所有参数。在上面的例子中，代表了传入 `printArgs` 函数中的四个参数，可以分别用 `arguments[0]`、 `arguments[1]`... 来获取单个的参数。


2. arguments 操作
2.1 arguments length

arguments 是个类数组对象，其包含一个 `length` 属性，可以用 `arguments.length` 来获得传入函数的参数个数。
```
function func() {
    console.log("The number of parameters is " + arguments.length);
}

func();
func(1, 2);
func(1, 2, 3);
```
执行结果如下：
```
The number of parameters is 0
The number of parameters is 2
The number of parameters is 3
```
2.2 arguments 转数组

通常使用下面的方法来将 arguments 转换成数组：
```
Array.prototype.slice.call(arguments);
```
还有一个更简短的写法：
```
[].slice.call(arguments);
```
在这里，只是简单地调用了空数组的 slice 方法，而没有从 Array 的原型层面调用。

为什么上面两种方法可以转换呢？

首先，slice 方法得到的结果是一个数组，参数便是 arguments。事实上，满足一定条件的对象都能被 slice 方法转换成数组。看个例子：
```
const obj = { 0: "A", 1: "B", length: 2 };
const result = [].slice.call(obj);
console.log(Array.isArray(result), result);
```
执行结果是：
```
true ["A", "B"]
```
从上面例子可以看出，条件就是： 1) 属性为 0，1，2...；2） 具有 length 属性；

另外，有一个需要注意的地方就是，不能将函数的 arguments 泄露或者传递出去。什么意思呢？看下面的几个泄露 arguments 的例子：
```
// Leaking arguments example1:
function getArgs() {
    return arguments;
}

// Leaking arguments example2:
function getArgs() {
    const args = [].slice.call(arguments);
    return args;
}

// Leaking arguments example3:
function getArgs() {
    const args = arguments;
    return function() {
        return args;
    };
}
```
上面的做法就直接将函数的 arguments 对象泄露出去了，最终的结果就是 V8 引擎将会跳过优化，导致相当大的性能损失。

你可以这么做：
```
function getArgs() {
    const args = new Array(arguments.length);
    for(let i = 0; i < args.length; ++i) {
        args[i] = arguments[i];
    }
    return args;
}
```
那就很好奇了，我们每次使用 arguments 时通常第一步都会将其转换为数组，同时 arguments 使用不当还容易导致性能损失，那么为什么不将 arguments 直接设计成数组对象呢？

这需要从这门语言的一开始说起。arguments 在语言的早期就引入了，当时的 Array 对象具有 4 个方法： toString、 join、 reverse 和 sort。arguments 继承于 Object 的很大原因是不需要这四个方法。而现在，Array 添加了很多强大的方法，比如 forEach、map、filter 等等。那为什么现在不在新的版本里让 arguments 重新继承自 Array呢？其实 ES5 的草案中就包含这一点，但为了向前兼容，最终还是被委员会否决了。


2.3 修改 arguments 值

在严格模式与非严格模式下，修改函数参数值表现的结果不一样。看下面的两个例子：
```
function foo(a) {
    "use strict";
    console.log(a, arguments[0]);
    a = 10;
    console.log(a, arguments[0]);
    arguments[0] = 20;
    console.log(a, arguments[0]);
}
foo(1);
```
输出：
```
1 1
10 1
10 20
```
另一个非严格模式的例子：
```
function foo(a) {
    console.log(a, arguments[0]);
    a = 10;
    console.log(a, arguments[0]);
    arguments[0] = 20;
    console.log(a, arguments[0]);
}
foo(1);
```
输出结果为：
```
1 1
10 10
20 20
```
从上面的两个例子中可以看出，在严格模式下，函数中的参数与 arguments 对象没有联系，修改一个值不会改变另一个值。而在非严格模式下，两个会互相影响。


2.4 将参数从一个函数传递到另一个函数

下面是将参数从一个函数传递到另一个函数的推荐做法。
```
function foo() {
    bar.apply(this, arguments);
}
function bar(a, b, c) {
    // logic
}
```
2.5 arguments 与重载

很多语言中都有重载，但 JavaScript 中没有。先看个例子：
```
function add(num1, num2) {
    console.log("Method one");
    return num1 + num2;
}

function add(num1, num2, num3) {
    console.log("Method two");
    return num1 + num2 + num3;
}

add(1, 2);
add(1, 2, 3);
```
执行结果为：
```
Method two
Method two
```
所以，JavaScript 中，函数并没有根据参数的不同而产生不同的调用。

是不是 JavaScript 中就没有重载了呢？并不是，我们可以利用 arguments 模拟重载。还是上面的例子。
```
function add(num1, num2, num3) {
    if (arguments.length === 2) {
        console.log("Result is " + (num1 + num2));
    }
    else if (arguments.length === 3) {
        console.log("Result is " + (num1 + num2 + num3));
    }
}

add(1, 2);
add(1, 2, 3)
```
执行结果如下：
```
Result is 3
Result is 6
```
3. ES6 中的 arguments
3.1 扩展操作符

直接上栗子：
```
function func() {
    console.log(...arguments);
}

func(1, 2, 3);
```
执行结果是：
```
1 2 3
```
简洁地讲，扩展操作符可以将 arguments 展开成独立的参数。


3.2 Rest 参数

还是上栗子：
```
function func(firstArg, ...restArgs) {
    console.log(Array.isArray(restArgs));
    console.log(firstArg, restArgs);
}
	
func(1, 2, 3);
```
执行结果是：
```
true
1 [2, 3]
```
从上面的结果可以看出，Rest 参数表示除了明确指定剩下的参数集合，类型是 Array。


3.3 默认参数

栗子：
```
function func(firstArg = 0, secondArg = 1) {
    console.log(arguments[0], arguments[1]);
    console.log(firstArg, secondArg);
}

func(99);
```
执行结果是：
```
99 undefined
99 1
```
可见，默认参数对 arguments 没有影响，arguments 还是仅仅表示调用函数时所传入的所有参数。


3.4 arguments 转数组

`Array.from()` 是个非常推荐的方法，其可以将所有类数组对象转换成数组。


4. 数组与类数组对象
数组具有一个基本特征：索引。这是一般对象所没有的。
```
const obj = { 0: "a", 1: "b" };
const arr = [ "a", "b" ];
```
我们利用 `obj[0]`、`arr[0]` 都能取得自己想要的数据，但取得数据的方式确实不同的。`obj[0]` 是利用对象的键值对存取数据，而 `arr[0]` 却是利用数组的索引。事实上，Object 与 Array 的唯一区别就是 Object 的属性是 string，而 Array 的索引是 number。

下面看看类数组对象。

伪数组的特性就是长得像数组，包含一组数据以及拥有一个 length 属性，但是没有任何 Array 的方法。再具体的说，length 属性是个非负整数，上限是 JavaScript 中能精确表达的最大数字；另外，类数组对象的 length 值无法自动改变。

如何自己创建一个类数组对象？
```
function Foo() {}
Foo.prototype = Object.create(Array.prototype);

const foo = new Foo();
foo.push('A');
console.log(foo, foo.length);
console.log("foo is an array? " + Array.isArray(foo));
```
执行结果是：
```
["A"] 1
foo is an array? false
```
也就是说 Foo 的实例拥有 Array 的所有方法，但类型不是 Array。

如果不需要 Array 的所有方法，只需要部分怎么办呢？
```
function Bar() {}
Bar.prototype.push = Array.prototype.push;

const bar = new Bar();
bar.push('A');
bar.push('B');
console.log(bar);
```
执行结果是：
```
Bar {0: "A", 1: "B", length: 2}
```
