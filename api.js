const ENDPOINT = 'https://www.portaleargo.it/famiglia/api/rest';

const VERIFY_HEADERS = {
    'x-version': '2.1.0',
    'X-Requested-With': 'XMLHttpRequest',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7'
};

var login_headers = {
    'x-version': '2.1.0',
    'x-key-app': 'ax6542sdru3217t4eesd9',
    'x-produttore-software': 'ARGO Software s.r.l. - Ragusa',
    'X-Requested-With': 'XMLHttpRequest',
    'x-app-code': 'APF',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
    'x-pwd': '',
    'x-auth-token': '',
    'x-cod-min': '',
    'x-user-id': ''
};

let full_headers = {
    'x-version': '2.1.0',
    'x-max-return-record': '100',
    'x-key-app': 'ax6542sdru3217t4eesd9',
    'x-produttore-software': 'ARGO Software s.r.l. - Ragusa',
    'X-Requested-With': 'XMLHttpRequest',
    'x-app-code': 'APF',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
    'x-prg-scheda': '0',
    'x-auth-token': '',
    'x-cod-min': '',
    'x-prg-scuola': '0',
    'x-prg-alunno': '0'
};


function verify_headers(callback) {
    request("GET", ENDPOINT, "/verifica", VERIFY_HEADERS, { '_dc': Date().getTime }, response => {
        if (JSON.parse(response)["success"] == "true") {
            callback.apply(this, [true]);
        } else {
            callback.apply(this, [false]);
        }
    }, _ => { callback.apply(this, [false]); });
}

function partial_login(credentials, callback) {
    login_headers["x-cod-min"] = credentials["school_code"];
    login_headers["x-user-id"] = credentials["username"];
    login_headers["x-pwd"] = credentials["password"];

    request("GET", ENDPOINT, "/login", login_headers, { '_dc': Date().getTime }, response => {
        callback.apply(this, [JSON.parse(response)["token"]]);
    }, error => {
        callback.apply(this, [null]);
    });

}

function complete_login(credentials, callback) {
    full_headers["x-auth-token"] = credentials["token"];
    full_headers["x-cod-min"] = credentials["school_code"];
    full_headers["x-user-id"] = credentials["username"];

    request("GET", ENDPOINT, "/schede", full_headers, { '_dc': Date().getTime }, response => {
        let _json = JSON.parse(response);
        var resp = {
            "x-prg-scheda": _json[0]["prgScheda"],
            "x-prg-scuola": _json[0]["prgScuola"],
            "x-prg-alunno": _json[0]["prgAlunno"]
        }
        callback.apply(this, [resp]);
    }, error => {
        callback.apply(this, [null]);
    });
}

function get_bacheca(credentials, callback) {
    full_headers["x-auth-token"] = credentials["token"];
    full_headers["x-cod-min"] = credentials["school_code"];
    full_headers["x-user-id"] = credentials["username"];
    full_headers["x-prg-scheda"] = credentials["x-prg-scheda"];
    full_headers["x-prg-scuola"] = credentials["x-prg-scuola"];
    full_headers["x-prg-alunno"] = credentials["x-prg-alunno"];

    request("GET", ENDPOINT, "/bachecanuova", full_headers, { 'page': 1, 'start': 0, 'limit': 25 }, response => {
        let _json = JSON.parse(response);
        var dati = [];
        _json["dati"].forEach(element => {
            dati.push({
                "data": element["datGiorno"],
                "prgMessaggio": element["prgMessaggio"],
                "desOggetto": element["desOggetto"],
                "presaVisione": element["presaVisione"],
                "desMessaggio": element["desMessaggio"],
                "richiediAd": element["richiediAd"],
                "richiediPv": element["richiediPv"],
                "link": element["desUrl"],
                get_link_url: function () {
                    if (element["allegati"].length != 0) {
                        return get_url(credentials, 1, element["prgMessaggio"]);
                    } else {
                        return null;
                    }
                }
            });
        });
        if (dati != null) callback.apply(this, [dati]);
    }, error => {
        callback.apply(this, [null]);
    })
}

function presa_visione(credentials, oggetto_bacheca, value, callback) {
    full_headers["x-auth-token"] = credentials["token"];
    full_headers["x-cod-min"] = credentials["school_code"];
    full_headers["x-user-id"] = credentials["username"];
    full_headers["x-prg-scheda"] = credentials["x-prg-scheda"];
    full_headers["x-prg-scuola"] = credentials["x-prg-scuola"];
    full_headers["x-prg-alunno"] = credentials["x-prg-alunno"];

    request("POST", ENDPOINT, "/presavisionebachecanuova", full_headers,
        {
            'presaVisione': value,
            'prgMessaggio': oggetto_bacheca["prgMessaggio"],
        },
        response => {
            callback.apply(this, [response]);
        }, error => {
            callback.apply(this, [null]);
        });

}

function request(method, url, path, headers, body, callback, on_error) {
    var http_request = new XMLHttpRequest();
    http_request.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            callback.apply(this, [this.responseText]);
        } else {
            on_error.apply(this, [this.status]);
        }
    }

    http_request.open(method, url + path);
    for (var key of Object.keys(headers)) {
        http_request.setRequestHeader(key, headers[key]);
    }
    if (method == "POST") {
        http_request.setRequestHeader("Content-type", "application/json");
        http_request.send(JSON.stringify(body));
    } else {
        http_request.send(body);
    }
}

function get_url(credentials, prgAllegato, prgMessaggio) {
    full_headers["x-auth-token"] = credentials["token"];
    full_headers["x-cod-min"] = credentials["school_code"];

    return ENDPOINT + "/messaggiobachecanuova?id=" +
        credentials["school_code"].toUpperCase().padStart(10, 'F') +
        'II'.padStart(5, 'E') +
        prgAllegato.toString().padStart(5, '0') +
        prgMessaggio.toString().padStart(10, '0') +
        credentials["token"].replace(/-/g, '') +
        full_headers['x-key-app'];
}
