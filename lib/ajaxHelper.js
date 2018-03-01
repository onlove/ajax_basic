/**
 * @file ajaxHelper.js
 */

(function () {
    //为了防止重复加载
    if (this.x) {
        return;
    }

    var x = this.x = {};

    x.$http = function (opt) {

    };

    var isType = function (type) {
        return function (obj) {
            return Object.prototype.toString.call(obj) == '[object '+ type +']'
        }
    };

    var util = {
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
        init: function () {
            this.each(['String', 'Object', 'Number', 'Array', 'Function'], function(item) {
                util['is' + item] = isType(item);
            })
        }
    }
})();

