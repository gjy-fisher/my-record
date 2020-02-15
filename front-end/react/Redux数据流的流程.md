# Redux流程分析与实现
---
## 概述 
随着应用程序单页面需求的越来越复杂，应用状态的管理也变得越来越混乱，而Redux的就是为解决这一问题而出现的。在一个大型的应用程序中，应用的状态不仅包括从服务器获取的数据，还包括本地创建的数据，以及反应本地UI状态的数据，而Redux正是为解决这一复杂问题而存在的。

redux作为一种单向数据流的实现，配合react非常好用，尤其是在项目比较大，逻辑比较复杂的时候，单项数据流的思想能使数据的流向、变化都能得到清晰的控制，并且能很好的划分业务逻辑和视图逻辑。下图是redux的基本运作的流程。

![](./statics/6.png)

如上图所示，该图展示了Redux框架数据的基本工作流程。简单来说，首先由view dispatch拦截action，然后执行对应reducer并更新到store中，最终views会根据store数据的改变执行界面的刷新渲染操作。
同时，作为一款应用状态管理框架，为了让应用的状态管理不再错综复杂，使用Redux时应遵循三大基本原则，否则应用程序很容易出现难以察觉的问题。这三大原则包括：
* 单一数据源
整个应用的State被存储在一个状态树中，且只存在于唯一的Store中。
* State是只读的
对于Redux来说，任何时候都不能直接修改state，唯一改变state的方法就是通过触发action来间接的修改。而这一看似繁琐的状态修改方式实际上反映了Rudux状态管理流程的核心思想，并因此保证了大型应用中状态的有效管理。
* 应用状态的改变通过纯函数来完成
Redux使用纯函数方式来执行状态的修改，Action表明了修改状态值的意图，而真正执行状态修改的则是Reducer。且Reducer必须是一个纯函数，当Reducer接收到Action时，Action并不能直接修改State的值，而是通过创建一个新的状态对象来返回修改的状态。
### redux的三大元素
和Flux框架不同，Redux框架主要由Action、Reducer和Store三大元素组成。
#### Action
Action是一个普通的JavaScript对象，其中的type属性是必须的，用来表示Action的名称，type一般被定义为普通的字符串常量。为了方便管理，一般通过action creator来创建action，action creator是一个返回action的函数。
在Redux中，State的变化会导致View的变化，而State状态的改变是通过接触View来触发具体的Action动作的，根据View触发产生的Action动作的不同，就会产生不同的State结果。可以定义一个函数来生成不同的Action，这个函数就被称为action creator。例如：
```
const ADD_TODO = '添加事件 TODO';

function addTodo(text) {
  return {
    type: ADD_TODO,
    text
  }
}

const action = addTodo('Learn Redux');
```
复制代码上面代码中，addTodo就是一个action creator。但当应用程序的规模越来越大时，建议使用单独的模块或文件来存放action。
#### Reducer
当Store收到action以后，必须返回一个新的State才能触发View的变化，State计算的过程即被称为Reducer。Reducer本质上是一个函数，它接受Action和当前State作为参数，并返回一个新的State。格式如下：
```
const reducer = function (state, action) {
  // ...
  return new_state;
};
```
复制代码为了保持reducer函数的纯净，请不要在reducer中执行如下的一些操作：
* 修改传入参数；
* 执行有副作用的操作，如API请求和路由跳转；
* 调用非纯函数，如 Date.now() 或 Math.random()
对于Reducer来说，整个应用的初始状态就可以直接作为State的默认值。例如：
```
const defaultState = 0;
const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'ADD':
      return state + action.payload;
    default: 
      return state;
  }
};
//手动调用
const state = reducer(1, {
  type: 'ADD',
  payload: 2
});
```
复制代码不过，在实际使用过程中，reducer函数并不需要像上面那样进行手动调用，Store的store.dispatch方法会触发Reducer的自动执行。为此，只需要在生成Store的时候将Reducer传入createStore方法即可。例如：
```
import { createStore } from 'redux';
const store = createStore(reducer);
```
复制代码在上面的代码中，createStore函数接受Reducer作为参数，该函数返回一个新的Store，以后每当store.dispatch发送过来一个新的Action，就会自动调用Reducer得到新的State。
#### Store
Store就是数据保存的地方，可以把它看成一个容器，整个应用中只能有一个Store。同时，Store还具有将Action和Reducers联系在一起的作用。Store具有以下的一些功能：
* 维持应用的 state；
* 提供getState()方法获取state；
* 提供dispatch(action)方法更新state；
* 通过subscribe(listener)注册监听器;
* 通过subscribe(listener)返回的函数注销监听器。
根据已有的Reducer来创建Store是一件非常容易的事情，例如Redux提供的createStore函数可以很方便的创建一个新的Store。
```
import { createStore } from 'redux'
import todoApp from './reducers'
// 使用createStore函数创建Store
let store = createStore(todoApp)
```
复制代码其中，createStore函数的第二个参数是可选的，该参数用于设置state的初始状态。而这对于开发同构应用时非常有用的，可以让服务器端redux应用的state与客户端的state保持一致，并用于本地数据初始化。
```
let store = createStore(todoApp, window.STATE_FROM_SERVER)
```
复制代码Store对象包含所有数据，如果想得到某个时刻的数据，则需要利用state来获取。例如：
```
import { createStore } from 'redux';
const store = createStore(fn);
//利用store.getState()获取state
const state = store.getState();
```
复制代码Redux规定，一个state只能对应一个view，只要state相同得到的view就相同，这也是Redux框架的重要特性之一。
到此，关于Redux的运作流程就非常的清晰了，下面总结下Redux的运作流程。

1. 当用户触摸界面时，调用store.dispatch(action)捕捉具体的action动作。
2. 然后Redux的store自动调用reducer函数，store传递两个参数给reducer函数：当前state和收到的action。其中，reducer函数必须是一个纯函数，该函数会返回一个新的state。
3. 根reducer会把多个子reducer的返回结果合并成最终的应用状态，在这一过程中，可以使用Redux提供的combineReducers方法。使用combineReducers方法时，action会传递给每个子的reducer进行处理，在子reducer处理后会将结果返回给根reducer合并成最终的应用状态。
4. store调用store.subscribe(listener)监听state的变化，state一旦发生改变就会触发store的更新，最终view会根据store数据的更新刷新界面。

### Redux实现
#### 创建store
store就是redux的一个数据中心，简单的理解就是我们所有的数据都会存放在里面，然后在界面上使用时，从中取出对应的数据。因此首先我们要创建一个这样的store，可以通过redux提供的createStore方法来创建。
```
export default function createStore(reducer, preloadedState, enhancer) {
  ...
  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}
```
复制代码可以看到createStore有三个参数，返回一个对象，里面有我们常用的方法，下面一一来看一下。
getState
getState用于获取当前的状态，格式如下：
```
function getState() {
    return currentState
  }
  ```
复制代码Redux内部通过currentState变量保存当前store，变量初始值即我们调用时传进来的preloadedState，getState()就是返回这个变量。
subscribe
代码本身也不难，就是通过nextListeners数组保存所有的回调函数，外部调用subscribe时，会将传入的listener插入到nextListeners数组中，并返回unsubscribe函数，通过此函数可以删除nextListeners中对应的回调。以下是该函数的具体实现：
```
var currentListeners = []
var nextListeners = currentListeners

function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()        //生成一个新的数组
    }
 }

function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }

    var isSubscribed = true

    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      var index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
 }
```
复制代码可以发现，上面的源码使用currentListeners和nextListeners两个数组来保存，主要原因是在dispatch函数中会遍历nextListeners，这时候可能会客户可能会继续调用subscribe插入listener，为了保证遍历时nextListeners不变化，需要一个临时的数组保存。
dispatch
当view dispatch一个action后，就会调用此action对应的reducer，下面是它的源码：
```
function dispatch(action) {  
  ...
  try {
      isDispatching = true
      currentState = currentReducer(currentState, action)  //调用reducer处理
    } finally {
      isDispatching = false
    }

    var listeners = currentListeners = nextListeners
    for (var i = 0; i < listeners.length; i++) {                   
      var listener = listeners[i]
      listener()
    }
  ...
}
```
复制代码从上面的源码可以发现，dispatch函数在调用了currentReducer以后，遍历nextListeners数组，回调所有通过subscribe注册的函数，这样在每次store数据更新，组件就能立即获取到最新的数据。
replaceReducer
replaceReducer是切换当前的reducer，虽然代码只有几行，但是在用到时功能非常强大，它能够实现代码热更新的功能，即在代码中根据不同的情况，对同一action调用不同的reducer，从而得到不同的数据。
```
function replaceReducer(nextReducer) {
 if (typeof nextReducer !== 'function') {
    throw new Error('Expected the nextReducer to be a function.')
  }

  currentReducer = nextReducer
  dispatch({ type: ActionTypes.REPLACE })
  }
  ```
复制代码bindActionCreators
bindActionCreators方法的目的就是简化action的分发，我们在触发一个action时，最基本的调用是dispatch(action(param))。这样需要在每个调用的地方都写dispatch，非常麻烦。bindActionCreators就是将action封装了一层，返回一个封装过的对象，此后我们要出发action时直接调用action(param)就可以了。
react-redux
redux作为一个通用的状态管理库，它不只针对react，还可以作用于其它的像vue等。因此react要想完美的应用redux，还需要封装一层，react-redux就是此作用。react-redux库相对简单些，它提供了一个react组件Provider和一个方法connect。下面是react-redux最简单的写法：
```
import { Provider } from 'react-redux';     // 引入 react-redux

……
render(
    <Provider store={store}>
        <Sample />
    </Provider>,
    document.getElementById('app'),
);
```
复制代码connect方法复杂点，它返回一个函数，此函数的功能是创建一个connect组件包在WrappedComponent组件外面，connect组件复制了WrappedComponent组件的所有属性，并通过redux的subscribe方法注册监听，当store数据变化后，connect就会更新state，然后通过mapStateToProps方法选取需要的state，如果此部分state更新了，connect的render方法就会返回新的组件。
```
export default function connect(mapStateToProps, mapDispatchToProps, mergeProps, options = {}) {
  ...
  return function wrapWithConnect(WrappedComponent) {
    ...
  }
}
```