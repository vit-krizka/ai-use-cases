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

    data.forEach(objekt => {
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
            vykresliTabulku(data, vybraneKlice);
        })
        .catch(error => console.error("Chyba při načítání dat:", error));
}

nactiData();
