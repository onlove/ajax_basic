/**
 * @file ajaxHelper.js
 */
/*
* 1.保护内部变量，不受外部修改
* */
(function () {
    //为了防止重复加载
    if (this.x) {
        return;
    }

    //给window声明一个x变得为一个对象
    var x = this.x = {};

    //默认参数配置项
    var settings = {
        //请求路径
        url: '',
        //http方法
        type: '',
        //发送给服务器的数据
        data: {},
        //是否走缓存
        cache: false,
        //自定义头信息
        header: {},
        //是否异步
        async: true,
        //用户名
        username: undefined,
        //密码
        password: undefined,
        //服务器响应的类型
        dataType: 'text',
        //成功调用函数
        success: function () {},
        //错误调用函数
        error: function () {},
        //超时毫秒, 为0时代码不走超时逻辑
        timeout: 500,
        //success和error函数里的上下文对象
        context: window
    };

    //节省
    x.$http = function (opt) {
        if (!util.isObject(opt)) {
            throw new Error('参数必须是一个对象')
        }
        //生成新的参数参数列表
        //为了防止修改默认参数列表和用户传进来的参数
        var _opt = {};
        for (var n in settings) {
            if (!settings.hasOwnProperty(n)) continue;
            _opt[n] = opt[n] || settings[n];
        }

        //获取ajax实例
        var xhr = util.getXHR();

        //判断http方法是否合法
        if (!/^(get|post|head|delete|put|options)$/ig.test(_opt.type)) {
            throw new Error('http方法不合法');
        }

        //encodeURIComponent 把参数转义为URI的格式
        //encodeURI 把参数转义为URI的格式,但是url里头的组件不转义 (?#:@/)
        //如果用户输入的data是一个对象，那么就把这个对象转换为URI格式的字符串
        if (util.isObject(_opt.data)) {
            var arr = [];
            for(n in _opt.data) {
                if (!_opt.data.hasOwnProperty(n)) continue;
                arr.push(encodeURIComponent(n)+ '=' + encodeURIComponent(_opt.data));
            }
            _opt.data = arr.join('&');
        }

        //因为get系需要把data拼接到url后面，需要判断有没有"?"
        if (/^(get|delete|head)&/.test(_opt.type) && _opt.data) {
            //if (/\?/.test(_opt.url)) {
            //    _opt.url += '&' + _opt.data;
            //} else {
            //    _opt.url += '?' + _opt.data;
            //}
            _opt.url += (/\?/.test(_opt.url) ? '&' : '?') + _opt.data;
            _opt.data = null;
        }

        if (_opt.cache === false) {
            var random = (Math.random() * 0xffffff | 0).toString(36);
            _opt.url += (/\?/.test(_opt.url) ? '&' : '?') + '_=' + random;
        }
        //建立http连接
        xhr.open(_opt.type, _opt.url, _opt.async, _opt.username, _opt.password);

        //注册监听状态的函数
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && /^2\d{2}$/.test(xhr.status)) {
                var txt = xhr.responseText;
                //判断用户参数dataType是否为json
                if (_opt.dataType.toUpperCase() === 'JSON') {
                    try {
                        //如果响应主体不是有效的json字符串
                        txt = util.jsonParse(txt);
                    }catch(e) {
                        _opt.error(e);
                        //报错之后，后续不需要执行，所以就return;
                        return;
                    }
                }
                //执行成功逻辑
                _opt.success(txt);
            }
        };

        //处理超时逻辑
        if (util.isNumber(_opt.timeout) && _opt.timeout > 0) {
            if ('timeout' in xhr) {
                //标准浏览器 毫秒数
                xhr.timeout = _opt.timeout;
                //超时执行函数
                xhr.ontimeout = function () {
                    _opt.error();
                }
            }else {
                //兼容低版本ie
                setTimeout(function () {
                    //超时时间已到，状态还没有为4,强制终止
                    if (xhr.readyState !== 4) {
                        //强制终止
                        xhr.abort();
                    }
                }, _opt.timeout)
            }
        }

        //因为在上头get系已经处理了data为null
        //发送http请求
        xhr.send(_opt.data);
    };

    //利用闭包实现判断对象逻辑
    var isType = function (type) {
        return function (obj) {
            return Object.prototype.toString.call(obj) == '[object '+ type +']'
        }
    };

    var util = {
        //利用惰性函数实现获取当前浏览器最合适的ajax对象
        getXHR: (function () {
            var list = [
                function () {
                    return new XMLHttpRequest()
                },function () {
                    return new ActiveXObject('Microsoft.XMLHTTP')
                },function () {
                    return new ActiveXObject('Msxml2.XMLHTTP')
                },function () {
                    return new ActiveXObject('Msxml3.XMLHTTP')
                }], xhr = null;
            while (xhr = list.shift()) {
                try{
                    break;
                }catch(e) {
                    xhr = null;
                    continue;
                }
            }
            if (xhr !== null) {
                return xhr;
            }
            throw new ReferenceError('浏览器不支持此功能');
        })(),
        //利用惰性函数实现循环逻辑
        each: (function () {
            if ([].forEach) {
                return function (list, callback, context) {
                    [].forEach.call(list, callback, context)
                }
            }
            return function (list, callback, context) {
                for (var i = 0, l = list.length; i < l; i++) {
                    callback.call(context, list[i], i, list);
                }
            }
        })(),
        //给util对象动态添加属性
        init: function () {
            this.each(['String', 'Object', 'Number', 'Array', 'Function'], function(item) {
                util['is' + item] = isType(item);
            })
        },
        jsonParse: (function () {
            if (window.JSON) {
                return function (str) {
                    return JSON.parse(str);
                }
            }
            //兼容ie6、7
            return function (str) {
                //return eval('('+ str +')')
                return new Function('return ' + str)();
            }
        })()
    };
    util.init();
})();

