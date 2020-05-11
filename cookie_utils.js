const COOKIE_SEPARATOR = ";";

function parse_cookies() {
    let cookie = document.cookie;
    if (cookie == null || cookie.length < 1) return null;

    let raw_split_cookies = cookie.split(COOKIE_SEPARATOR);
    let cookies_obj = {};
    raw_split_cookies.forEach(raw_single_cookie => {
        raw_split_single_cookie = raw_single_cookie.split("=");
 
        cookies_obj[raw_split_single_cookie[0].trim()] = raw_split_single_cookie[1].trim();
    })

    return cookies_obj;
}


function set_cookies(cookie_obj) {
    if (cookie_obj == null) return null;

    // empty object, clear cookies
    if (cookie_obj == {}) return document.cookie = "";

    for (var key of Object.keys(cookie_obj)) {
        document.cookie = key + "=" + cookie_obj[key];
    }
}

function clear_cookies() {
    var cookies = document.cookie.split(COOKIE_SEPARATOR);

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

let cookies = parse_cookies();
