function paramsArray(obj, prefix, q) {
    if (!(q instanceof Array)) q = [];
    if (!prefix) prefix = '';

    if (obj instanceof Array) {
        for (var i = 0; i < obj.length; i++) {
            paramsArray(obj[i], prefix + '[]', q);
        }
    } else if (typeof obj === 'object') {
        for (var key in obj) {
            paramsArray(obj[key], prefix.length ? prefix + '[' + key + ']' : key, q);
        }
    } else if (typeof obj !== 'function' && typeof obj !== 'undefined') {
        q.push([prefix, obj]);
    }

    return q;
}

module.exports = function parameterize(obj) {
    return paramsArray(obj).map(function(a) {
        return a[0] + '=' + encodeURIComponent(a[1]);
    }).join('&');
};
