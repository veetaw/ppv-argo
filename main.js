// init material shit
const input_fields = [].map.call(document.querySelectorAll('.mdc-text-field'), el => { return mdc.textField.MDCTextField.attachTo(el) })
const snackbar = mdc.snackbar.MDCSnackbar.attachTo(document.querySelector('.mdc-snackbar'));


function is_logged() {
    return cookies != null && cookies["logged_in"] == "true";
}

function on_login_button_click() {
    var data = [];
    input_fields.forEach(element => {
        if (element.value == "" || element.value == undefined) {
            element.valid = false;
            snackbar.labelText = "Inserisci tutti i campi";
            snackbar.open();
        } else {
            data.push(element.value);
        }
    });

    login_data = {
        "school_code": data[0],
        "username": data[1],
        "password": data[2]
    }

    verify_headers(success => {
        if (!success) {
            snackbar.labelText = "Bho non va";
            snackbar.open();
        } else {
            partial_login(login_data, response => {
                if (response == null) {
                    snackbar.labelText = "Login non riuscito";
                    snackbar.open();
                } else {
                    login_data["token"] = response;
                    complete_login(login_data, response => {
                        if (response == null) {
                            snackbar.labelText = "Login non riuscito";
                            snackbar.open();
                        } else {
                            login_data["x-prg-scheda"] = response["x-prg-scheda"];
                            login_data["x-prg-scuola"] = response["x-prg-scuola"];
                            login_data["x-prg-alunno"] = response["x-prg-alunno"];

                            login_data["password"] = "";
                            login_data["logged_in"] = true;
                            set_cookies(login_data);

                            window.location.reload(true);
                        }
                    });
                }
            });
        }
    });


}

function on_bacheca_button_click() {
    credentials = parse_cookies();

    get_bacheca(credentials, dati => {
        if (dati != null) {
            var list = document.createElement("ul");
            list.className = "mdc-list";

            dati.forEach(dato => {
                var item = document.createElement("li");
                item.className = "mdc-list-item";

                item.innerHTML = "<span class=\"mdc-list-item__text\">" + dato["desMessaggio"] + "</span>";

                list.appendChild(item);
            });
            document.getElementById("all_ppv").style.visibility = "visible";
            document.getElementById("all_compiti").appendChild(list);
        }
    });
}

function on_ppv_button_click() {
    credentials = parse_cookies();

    // run 2 times just to be sure
    for (let i = 0; i <= 1; i++) {
        get_bacheca(credentials, dati => {
            if (dati != null) {
                dati.forEach(dato => {
                    if (dato["presaVisione"]) {
                        // skip
                    } else {
                        if (dato.get_link_url() != null) {
                            request("GET", dato.get_link_url(), "", {}, {}, _ => { }, _ => { });
                        }

                        if (dato["link"] != null) {
                            request("GET", dato["link"], "", {}, {}, _ => { }, _ => { });
                        }
                        presa_visione(credentials, dato, true, response => { });
                    }

                    if (dato["richiediAd"]) {
                        presa_visione(credentials, dato, false, response => { });
                    }

                });
            }
        });
    }

}


function on_logout_button_click() {
    clear_cookies();
    window.location.reload(true);
}


if (is_logged()) {
    document.getElementById("login_form").style.visibility = "hidden";
    document.getElementById("all_compiti").style.visibility = "visible";
}