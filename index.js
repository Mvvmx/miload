(function () {
  var ai = {};
  ai.version = '0.2.29';
  ai.debug = true;
  var slice = [].slice;
  ai.noop = function () {}
  ai.now = function(){
    return new Date().getTime();
  }
  ai.benchmark = function(start){
    var log = console.info || ai.noop;
    var time = (start instanceof Date) ? start.getTime() : start;
    ai.debug && log('run: ' + (ai.now() - time) + ' ms');
  }
  ai.queue = function (funcs) {
    (function next() {
      if (funcs.length > 0) {
        var f = funcs.shift();
        f.handle.apply(f.context || {}, [next].concat(slice.call(arguments, 0)));
      }
    })();
  }
  ai.forEach = function (arr, fn, scope) {
    if(arr.forEach){
      arr.forEach(fn, scope);
    } else {
      for (var i = 0,l = arr.length; i < l; i++) {
        var o = arr[i];
        fn.call(scope, o, i, arr)
      }
    }
  }
  ai.pluck = function (arr, key) {
    return arr.map(function (item) {
      return item[key];
    })
  }

  ai.defaults = function (obj, defaults) {
    if (typeof obj === 'undefined') {
      return defaults;
    } else {
      return obj;
    }
  }
  
  ai.grep = function (elems, callback, invert) {
    var callbackInverse,
      matches = [],
      i = 0,
      length = elems.length,
      callbackExpect = !invert;
    // Go through the array, only saving the items
    // that pass the validator function
    for (; i < length; i++) {
      callbackInverse = !callback(elems[i], i);
      if (callbackInverse !== callbackExpect) {
        matches.push(elems[i]);
      }
    }
    return matches;
  }
  ai.uniqBy = function (arr, iteratee) {
    if (typeof iteratee != 'function') {
      var name = iteratee;
      iteratee = function (v, k, arr) {
        for (var i = 0, len = arr.length; i < len; i++) {
          if (arr[i][name] == v[name]) {
            return i == k;
          }
        }
        return false;
      }
    }
    arr = ai.grep(arr, function (v, k) {
      return iteratee(v, k, arr)
    })
    return arr;
  }
  ai.clone = function (obj) {
    return ai.extend(true, {}, obj);
  }

  ai.typeof = function(obj, name){
    return (obj).toString().slice(8, -1).toLowerCase() === name;
  }
  ai.isFunction = function (obj) {
    return typeof obj === 'function';
  }
  ai.isArray = function (value) {
    return !!(value && !!value.unshift);
  }
  ai.isPlainObject = function (obj) {
    return ai.typeof(obj, 'object');
  }
  /**
   * jQuery extend()
   * @return {Object} 
   */
  ai.extend = function () {
    var options, name, src, copy, copyIsArray, clone,
      target = arguments[0] || {},
      i = 1,
      length = arguments.length,
      deep = false;
    // Handle a deep copy situation
    if (typeof target === 'boolean') {
      deep = target;
      // Skip the boolean and the target
      target = arguments[i] || {};
      i++;
    }
    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== 'object' && !ai.isFunction(target)) {
      target = {};
    }
    // Extend ai itself if only one argument is passed
    if (i === length) {
      target = this;
      i--;
    }
    for (; i < length; i++) {
      // Only deal with non-null/undefined values
      if ((options = arguments[i]) != null) {
        // Extend the base object
        for (name in options) {
          src = target[name];
          copy = options[name];
          // Prevent never-ending loop
          if (target === copy) {
            continue;
          }
          // Recurse if we're merging plain objects or arrays
          if (deep && copy && (ai.isPlainObject(copy) || (copyIsArray = ai.isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && ai.isArray(src) ? src : [];
            } else {
              clone = src && ai.isPlainObject(src) ? src : {};
            }
            // Never move original objects, clone them
            target[name] = ai.extend(deep, clone, copy);
            // Don't bring in undefined values
          } else if (copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }
    // Return the modified object
    return target;
  }

  /**
   * simple Deferred
   */
  ai.Deferred = function(){
    var obj = {};
    return {
      done: function(fn){
        obj.done = fn;
        return this;
      },
      fail: function(fn){
        obj.fail = fn;
        return this;
      },
      resolve: function(){
        obj.done && obj.done();
        obj.done = null;
      },
      reject: function(){
        obj.fail && obj.fail();
        obj.fail = null;
      }
    }
  }

  ai.loadCSS = function (src, id) {
    if (!src) return;
    if (ai.loadCSS._css[src]) return;
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    if (id) link.id = id;
    link.href = getUrlSuffix(src);
    link.rel = 'stylesheet';
    link.type = 'text/css';
    head.appendChild(link);
    ai.loadCSS._css[src] = { loaded: true };
    return link;
  }
  ai.loadCSS._css = {};

  ai.loadText = function (url, callback) {
    var text = '';
    var xmlhttp = null;
    if (window.XMLHttpRequest) {
      xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
    }
    xmlhttp.onreadystatechange = state_Change;
    url = getUrlSuffix(url);
    xmlhttp.open('GET', url, true);
    xmlhttp.send(null);

    function state_Change() {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          text = xmlhttp.responseText;
          callback(text);
        }
      }
    }
  }

  ai.loadJS = function (src, callback) {
    var doCallback;
    if (!src) return;

    if (typeof callback == 'function') {
      var state = ai.loadJS._js[src];
      if (!state) {
        state = ai.loadJS._js[src] = { create: false, loaded: false, callbacks: [] };
      }
      if (state.loaded) {
        setTimeout(function () {
          callback();
        }, 1);
        return;
      } else {
        state.callbacks.push(callback);
        if (state.create) return;
      }
      state.create = true;
      var head = document.getElementsByTagName('head')[0];
      var js = document.createElement('script');
      js.src = getUrlSuffix(src);
      js.type = 'text/javascript';
      doCallback = function () {
        for (var i = 0; i < state.callbacks.length; i++) {
          var fn = state.callbacks[i];
          if (fn) fn();
        }
        state.callbacks.length = 0;
      }

      if (document.all) {
        js.onreadystatechange = function () {
          if (js.readyState == 'loaded' || js.readyState == 'complete') {
            doCallback();
            state.loaded = true;
          }
        }
      } else {
        js.onload = function () {
          doCallback();
          state.loaded = true;
        }
      }
      head.appendChild(js);

      return js;
    }
  }
  ai.loadJS._js = {};

  ai.usePlugin = (function () {
    var _plugins = {}
    return {
      register: function (name, fn) {
        if (typeof name == 'object') {
          _plugins = ai.extend(_plugins, name);
        } else {
          _plugins[name]['exec'] = fn;
        }

      },
      getFn: function (name) {
        return _plugins[name] && _plugins[name]['exec'];
      }
    }
  })();

  ai.usePlugin.register({
    css: {
      exec: function (path, callback) {
        ai.loadCSS(path);
        callback();
      },
      cache: function () { }
    },
    text: {
      exec: function (path, callback) {
        ai.loadText(path, function (text) {
          callback(text);
        });
      },
      cache: function(){}
    }
  })

  ai._config = {};
  var config_defaults = {
    alias: {},
    paths: {},
    deps: {},
    urlArgs: ''
  };
  ai._config = ai.extend(ai._config, config_defaults);
  var use_suffix = ai._config.urlArgs;
  var use_alias = ai._config.alias;
  var use_paths = ai._config.paths;
  var use_deps = ai._config.deps;

  ai.config = function (options) {
    ai._config = ai.extend({}, config_defaults, options);
    use_suffix = ai._config.urlArgs;
    use_alias = ai._config.alias;
    use_paths = ai._config.paths;
    use_deps = ai._config.deps;
  }

  var getUrlSuffix = function (url) {
    if (ai.isFunction(use_suffix)) {
      return use_suffix(url);
    } else {
      return url + use_suffix;
    }
  }

  var mapDependencies = function (mods, master) {
    var tmp = [];
    ai.forEach(mods, function (item) {
      if (item.name) {
        tmp.push(item)
      } else {
        tmp.push({
          name: item,
          master: master
        })
      }
    })
    return tmp
  }

  // simple dependency
  // mark `master` dependency, 
  // in order to use in callback function
  var parseDependencies = function (mods, master) {
    master = ai.defaults(master, true);
    var deps = [];
    mods = mapDependencies(mods, master);
    ai.forEach(mods, function(item){
      var cd = use_deps[item.name];
      if (cd && cd.length) {
        deps = deps.concat(cd);
      }
    })
    if (deps.length) {
      var dds = parseDependencies(deps, false);
      mods = dds.concat(mods);
    }
    return ai.uniqBy(mods, 'name');
  }

  var parsePaths = function (mods) {
    for (var i in use_paths) {
      for (var j = 0; j < mods.length; j++) {
        if (mods[j].name == i) {
          mods[j].name = use_paths[i];
        }
      }
    }
    return mods;
  }

  var useParsePathAlias = function (item) {
    var name = item.split('/')[0];
    var path = use_alias[name];
    if (path) {
      item = path + item.replace(name, '');
    }
    return item;
  }

  var useParsePlainInfo = function (item) {
    var name = item.name;
    var type = '',
      path;
    var matched = name.match(/^(\w+)!/);
    if (matched) {
      type = matched[1];
      path = useParsePathAlias(name.replace(matched[0], ''));
    } else {
      type = 'js';
      if (!/\.js$/.test(name)) {
        name = name + '.js';
      }
      path = useParsePathAlias(name);
    }

    return ai.extend({
      type: type,
      path: path
    }, item);
  }

  ai.parseUsePath = useParsePathAlias;

  // dependencies

  /**
   * ai.use load js module, support use_alias
   * @param  {String|Array}   module   Module js
   * @param  {Function} callback After module loaded callback
   */
  
  var contexts = {
  }; // 队列交叉
  var contextUID = 0;
  ai.use = function (module, callback) {
    contexts[contextUID] = {};
    ai.nativeUse(module, callback, contexts[contextUID]);
    contextUID++;
  }

  ai.nativeUse = function(module, callback, context){
    callback || (callback = ai.noop);
    if (!module || !callback) {
      return;
    }
    if (typeof module == 'string') {
      module = [module];
    }
    module = parseDependencies(module);
    module = parsePaths(module);
    var queues = [];
    var args = [];
    ai.forEach(module, function (item, index) {
      var info = useParsePlainInfo(item);
      var handleProcess, getProcessFn;
      getProcessFn = ai.usePlugin.getFn(info.type);

      switch (typeof getProcessFn) {
        case 'function':
          handleProcess = function (next) {
            getProcessFn(info.path, function (text) {
              var scope = ai._getExport(context, info.name);
              if (text) {
                scope.exp = text;
                args.push(scope);
              }
              scope.loading = false; // loaded
              scope.done = true;
              next();
            })
          }
          break;
        default:
          handleProcess = function (next) {
            ai.loadJS(info.path, function () {
              var scope = ai._getExport(context, info.name);
              scope.loading = false; // loaded
              if (info.master) {
                args.push(scope);
              }
              if (scope.done) {
                next();
              } else {
                scope.defer.done(function () {
                  next();
                  scope.done = true;
                })
              }
            })
          }
      }
      queues.push({
        handle: function (next) {
          var exp = ai.clone(info);
          delete exp.master;
          exp.loading = true;
          exp.done = false;
          ai._setExport(context, exp.name, exp);
          handleProcess(next);
        }
      })
    })

    queues.push({
      handle: function () {
        callback.context = context;
        callback.apply(null, ai.pluck(args, 'exp'));
      }
    })
    ai.queue(queues);
  }
  /**
   * @scope
   *   name {String}
   *   path {String}
   *   type {String}
   *   loading {Boolean}
   *   defer {promise}
   *   defer.done {Boolean}
   *   defer.resolve {promise}
   *   exp {Object}
   * @type {Object}
   */
  ai._exports = {};

  var isOldExport = function (itor) {
    var tmp = [];
    for (var i in ai._exports) {
      if (ai._exports[i].type == 'js' && ai._exports[i] != itor && !ai._exports[i].done && !ai._exports[i].exp) {
        tmp.push(ai._exports[i]);
      }
    }
    for (var i = 0; i < tmp.length; i++) {
      if (tmp[i].timeStamp > itor.timeStamp) {
        return false;
      }
    }
    return true;
  }
  var cacheExports = function (name, exp, done) {
    var expResolve = function(itor, exp, done){
      if (itor.loading || isOldExport(itor)) {

        ai._modifyExport(itor, {
          exp: exp,
          loading: false,
          done: done ? true : false
        });
        itor.defer.resolve();
        // itor.exp = exp;
        // itor.loading = false;
        // if (done) {
        //   itor.done = true;
          
        // }
        return true;
      }
    }
    if (name) { // if exist name, check if this resource exists
      if(!ai._exports[name]){
          var info = ai.clone(useParsePlainInfo({name: name}));
          info.exp = exp;
          info.loading = false;
          info.done = true;
          ai._setExport(info.name, info);
          var itor = ai._getExport(info.name);
          itor.defer.resolve();
      } else {
        return expResolve(name, ai._exports[name], exp, done);
      }
    } else {
      ai._loopExport(function(itor){
        if (itor.type == 'js') {
          if(expResolve(itor, exp, done) === true){
            return false;
          }
        }
      });
    }
  }

  ai._setExportUid = 0;
  ai._exportModifyLock = false;
  ai._setExport = function (context, name, value) {
    if(typeof context == 'string'){
      value = name;
      name = context;
      context = ai._exports;
    }
    context[name] || (context[name] = value);
    context[name].timeStamp = ai.now() + (++ai._setExportUid);
    context[name].defer = ai.Deferred();
  }

  ai._getExport = function (context, name) {
    if(typeof context == 'string'){
      name = context;
      context = ai._exports;
    }
    return context[name] || {};
  }
  ai._modifyExport = function(item, obj){
    mini.extend(item, obj);
    return item;
  }
  ai._loopExport = function(context, fn){
    if(typeof context == 'function'){
      fn = context;
      context = ai._exports;
    }
    for(var i in context){
      if(fn.call(null, context[i]) === false){
        break;
      }
    }
  }

  var commentRegExp = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/mg,
    cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;

  function commentReplace(match, singlePrefix) {
    return singlePrefix || '';
  }

  ai.define = function (name, deps, callback) {
    var node, context;
    //Allow for anonymous modules
    if (typeof name !== 'string') {
      //Adjust args appropriately
      callback = deps;
      deps = name;
      name = null;
    }

    //This module may not have dependencies
    if (!ai.isArray(deps)) {
      callback = deps;
      deps = null;
    }

    //If no name, and callback is a function, then figure out if it a
    //CommonJS thing with dependencies.
    if (!deps && ai.isFunction(callback)) {
      cacheExports(name, callback(), true);
    }

    var oldcallback = callback;
    var callback = function () {
      var args = slice.call(arguments, 0);
      cacheExports(name, oldcallback.apply(null, args), true);
    }
    ai.nativeUse(deps, callback);
  }

  window.define = ai.define;
  window.mini = ai;

})(window)