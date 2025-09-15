const vybraneKlice = ["Název projektu", "Stav projektu", "Obor činnosti"];

function vycistiObor(obor) {
    if (typeof obor === "string" && obor.startsWith("Jiné:")) {
        return "Jiné";
    }
    return obor;
}

function vykresliTabulku(data, klice) {
    const tabulka = document.createElement("table");
    tabulka.id = "table-overview";

    const hlavicka = tabulka.insertRow();
    klice.forEach(klic => {
        const th = document.createElement("th");
        th.textContent = klic;
        hlavicka.appendChild(th);
    });

    const sortedData = Array.from(data).sort(
        (a, b) => a["Název projektu"].localeCompare(b["Název projektu"], "cs")
    );
    sortedData.forEach(objekt => {
        const radek = tabulka.insertRow();

        // Nastavení datových atributů
        radek.setAttribute("data-show", "true");

        klice.forEach(klic => {
            const td = document.createElement("td");
            let hodnota = objekt[klic] ?? "";
            if (klic === "Název projektu" && objekt["id"]) {
                const a = document.createElement("a");
                a.href = `project.html#usecase-${String(objekt["id"]).padStart(2, "0")}`;
                a.textContent = hodnota;
                td.appendChild(a);
            } else {
              if (klic === "Obor činnosti") {
                 hodnota = vycistiObor(hodnota);
                }
                td.textContent = hodnota;
            }
            radek.appendChild(td);
        });
    });

    const container = document.getElementById("table-overview-container");
    container.appendChild(tabulka);
}

function vytvorFiltry(stavy, obory) {
    const container = document.getElementById("table-overview-container");

    function vytvorSelectFiltr(id, label, options) {
        const labelElement = document.createElement("label");
        labelElement.setAttribute("for", id);
        labelElement.textContent = `${label}:`;

        const selectElement = document.createElement("select");
        selectElement.id = id;

        const optionStavAll = document.createElement("option");
        optionStavAll.value = "";
        optionStavAll.textContent = "Vše";
        selectElement.appendChild(optionStavAll);

        const sortedOptions = Array.from(options).sort((a, b) => a.localeCompare(b, "cs"));
        sortedOptions.forEach(option => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
        selectElement.addEventListener("change", aplikujFiltr);

        const containerElement = document.createElement("div");
        containerElement.append(labelElement, selectElement)
        return containerElement;
    }

    function vytvorInputFiltr(id, label, placeholder = "") {
        const labelElement = document.createElement("label");
        labelElement.setAttribute("for", id);
        labelElement.textContent = `${label}:`;

        const inputElement = document.createElement("input");
        inputElement.type = "text";
        inputElement.id = id;
        inputElement.placeholder = placeholder;
        inputElement.addEventListener("input", aplikujFiltr);

        const containerElement = document.createElement("div");
        containerElement.append(labelElement, inputElement)
        return containerElement;
    }

    const filtrDiv = document.createElement("div");
    filtrDiv.id = "filtr-container";

    [
        vytvorInputFiltr('filtr-nazev', "Název projektu", "Hledat…"),
        vytvorSelectFiltr("filtr-stav", "Stav projektu", stavy),
        vytvorSelectFiltr("filtr-obor", "Obor činnosti", obory)
    ].forEach(element => {
        filtrDiv.appendChild(element);
    });

    container.appendChild(filtrDiv);
}

function aplikujFiltr() {
    const vybranyStav = document.getElementById("filtr-stav").value;
    const vybranyObor = document.getElementById("filtr-obor").value;
    const hledanyNazev = document.getElementById("filtr-nazev").value.toLowerCase();

    const tabulka = document.querySelector("table#table-overview ");
    if (!tabulka) return;

    const hlavicka = tabulka.querySelector("tr");
    const ths = Array.from(hlavicka.querySelectorAll("th"));

    // Zjistit indexy sloupců podle názvu
    const indexNazev = ths.findIndex(th => th.textContent.trim() === "Název projektu");
    const indexStav = ths.findIndex(th => th.textContent.trim() === "Stav projektu");
    const indexObor = ths.findIndex(th => th.textContent.trim() === "Obor činnosti");

    const radky = tabulka.querySelectorAll("tr");

    radky.forEach((radek, index) => {
        if (index === 0) return; // přeskočit záhlaví

        const td = radek.querySelectorAll("td");
        const nazev = td[indexNazev]?.textContent.toLowerCase() ?? "";
        const stav = td[indexStav]?.textContent ?? "";
        const obor = td[indexObor]?.textContent ?? "";

        const stavOK = vybranyStav === "" || stav === vybranyStav;
        const oborOK = vybranyObor === "" || obor === vybranyObor;
        const nazevOK = hledanyNazev === "" || nazev.includes(hledanyNazev);

        radek.setAttribute("data-show", String(stavOK && oborOK && nazevOK));
    });
}

function nactiData() {
    fetch("use-cases.json")
        .then(response => {
            if (!response.ok) throw new Error("Nepodařilo se načíst JSON.");
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                console.warn("JSON je prázdný – tabulka ani filtry se nevypisují.");
                return;
            }

            const stavySet = new Set();
            const oborySet = new Set();
            data.forEach(objekt => {
                if (objekt["Stav projektu"]) stavySet.add(objekt["Stav projektu"]);
                if (objekt["Obor činnosti"]) oborySet.add(vycistiObor(objekt["Obor činnosti"]));
            });

            vytvorFiltry(stavySet, oborySet);
            vykresliTabulku(data, vybraneKlice);
        })
        .catch(error => console.error("Chyba při načítání dat:", error));
}

nactiData();
