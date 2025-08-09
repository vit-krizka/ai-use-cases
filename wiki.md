# Co znamená *AI use case*
Use case popisuje konkrétní nasazení umělé inteligence ve veřejném sektoru – tj. kdo je garantem, jaký problém řeší, jaký typ AI je využit a v jakém stavu realizace se projekt nachází. Smyslem katalogu je shromažďovat ověřené příklady použití, aby se z nich dalo vycházet při plánování dalších projektů.

# Struktura dat o use casu
Každý záznam je uložen v souboru `use-cases.json` a obsahuje zejména tato pole:

- `id` – unikátní identifikátor  
- `Garant` – osoba odpovědná za projekt  
- `Název projektu`  
- `Typ umělé inteligence`  
- `Hlavní kategorie use case`  
- `Krátký popis` a `Řešený problém`  
- `Instituce` a případně `Dodavatel`  
- `Stav projektu` (např. pilot, produkce)  
- `Očekávané dopady`, `Vyhodnocení úspěšnosti`, `Poučení pro příští projekty`  
- `Zdroj`, `Označení zdroje`, `Informace o zdroji a kontaktní osoba`  
- `Obor činnosti`, `Kategorie use case`  
- pomocné pole `Sloupec1` (pokud je potřeba další interní údaj)

# Kategorizace use cases
Use cases jsou řazeny do tematických skupin, které se zobrazují i na webové stránce katalogu. Seznam kategorií je definován v souboru `categories.json`. 

Při generování levého menu se u každého záznamu bere v potaz pole **`Hlavní kategorie use case`**. Podle jeho hodnoty se use case přiřadí do odpovídající kategorie v menu. Pokud hodnota `Hlavní kategorie use case` neodpovídá žádné kategorii uvedené v `categories.json`, zařadí se use case automaticky do zbytkové kategorie **„Ostatní“**.

Aktuální seznam kategorií:

1. Analýza audiovizuálních dat  
2. Generování obsahu a chatboti úředníků  
3. Komunikace a klientský servis (chatboti pro veřejnost)  
4. Monitoring, bezpečnost a dohled  
5. Optimalizace úředních procesů  
6. Predikce a automatizované rozhodování

# Jaká data o use casu sbíráme
Pro každý projekt je vhodné vyplnit všechny výše uvedené atributy. Kromě základního popisu a stavu realizace se zaměřujeme také na:

- konkrétní problém, který AI řeší, a očekávané přínosy,
- použitou technologii (např. RPA, hluboké učení, LLM),
- kontaktní osobu a zdroj informací pro ověření,
- poučení nebo doporučení, která mohou pomoci dalším institucím.

Takto strukturovaná data umožňují jednotné vyhledávání, porovnávání projektů a sdílení zkušeností v rámci veřejné správy.

