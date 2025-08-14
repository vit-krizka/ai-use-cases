'use strict';

/**
 * Inicializuje společné prvky všech stránek.
 * - Přepínání postranního menu na mobilu
 * - Zkopírování loga do patičky
 */
function initCommon() {
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');
  if (sidebar && menuBtn) {
    // Přepínání viditelnosti menu
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  const footerLogo = document.querySelector('.footer-logo');
  const logo = document.querySelector('.logo');
  if (footerLogo && logo) {
    // Stejné logo v hlavičce i patičce doplněné o text jako na dia.gov.cz
    footerLogo.innerHTML = logo.innerHTML;
    const logoText = document.createElement('span');
    logoText.className = 'logo-text';
    logoText.textContent = 'Digitální a informační agentura';
    footerLogo.appendChild(logoText);
  }
}

/**
 * Načte json s use casy a kategoriemi a vytvoří
 * obsah stránky i levé navigační menu.
 */
async function initCatalog() {
  const sidebar = document.getElementById('sidebar');
  const navList = document.getElementById('usecase-list');
  const main = document.querySelector('main');
  if (!sidebar || !navList || !main) return; // Jsme na jiné stránce

const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

  try {
    // Načtení dat paralelně
    const [casesRes, categoriesRes] = await Promise.all([
      fetch('use-cases.json'),
      fetch('categories.json'),
    ]);
    const useCases = await casesRes.json();
    const categories = await categoriesRes.json();

    const categoryDescriptions = new Map(categories.map((c) => [c.title, c.description]));

    // Mapování kategorií -> seznam use casů
    const categoryMap = new Map();
    categories.forEach((cat) => categoryMap.set(cat.title, []));
    const others = [];

    // Vytvoření sekcí pro jednotlivé use case
    useCases.forEach((uc) => {
  const idStr = uc.id.toString().padStart(2, '0');
  const sectionId = `usecase-${idStr}`;
  const section = document.createElement('section');
  section.id = sectionId;

      let title = uc['Název projektu'];
  if (isAdmin && uc['Garant']) {
    title += ` <span style="color: gray; font-weight: normal;">(${uc['Garant']})</span>`;
  }
  let html = `<h2>${title}</h2>`;

      html += '<table class="table-meta card">';

      html += `
      <tr>
      <td><span class="icon" aria-hidden="true">&#x1F3DB;&#xFE0E;</span></td>
      <td><b>Instituce</b></td>
      <td>${uc['Instituce'] || '-'}</td>
      </tr>
      <tr>
      <td><span class="icon" aria-hidden="true">&#x1F6E0;&#xFE0E;</span></td>
      <td><b>Dodavatel</b></td>
      <td>${uc['Dodavatel'] || '-'}</td>
      </tr>
      <tr>
      <td><span class="icon" aria-hidden="true">&#x1F4BC;&#xFE0E;</span></td>
      <td><b>Obor činnosti</b></td>
      <td>${uc['Obor činnosti'] || '-'}</td>
      </tr>`;

  const mainCategoryFull = uc['Hlavní kategorie use case'] || '-';
  const mainCategoryBase = mainCategoryFull.split('(')[0].trim();
  const categoryHtml = categoryDescriptions.has(mainCategoryBase)
    ? `<a href="#" class="category-link" data-category="${mainCategoryBase}">${mainCategoryFull}</a>`
    : mainCategoryFull;

      html += `
      <tr>
      <td><span class="icon" aria-hidden="true">&#x1F5C2;&#xFE0E;</span></td>
      <td><b>Kategorie use case</b></td>
      <td>${categoryHtml}</td>
      </tr>`;

      html += '</table>';




      if (uc['Krátký popis']) {
        html += `<div class="highlight">${uc['Krátký popis'].split('\n').map((p) => `<p>${p}</p>`).join('')}</div>`;
      }

      html += '<dl class="info-grid">';
      html += `<dt>Řešený problém</dt><dd>${uc['Řešený problém'] || '-'}</dd>`;
      html += '<dt>Použité AI technologie</dt><dd><ul>' +
        (uc['Typ umělé inteligence'] ? uc['Typ umělé inteligence'].split('\n').filter(Boolean).map((t) => `<li>${t}</li>`).join('') : '') +
        '</ul></dd>';
      html += '<dt>Očekávané dopady</dt><dd><ul>' +
        (uc['Očekávané dopady'] ? uc['Očekávané dopady'].split('\n').map((s) => `<li>${s}</li>`).join('') : '') +
        '</ul></dd>';
      html += `<dt>Vyhodnocení úspěšnosti</dt><dd>${uc['Vyhodnocení úspěšnosti'] || '-'}</dd>`;
      html += `<dt>Poučení pro příští projekty</dt><dd>${uc['Poučení pro příští projekty'] || '-'}</dd>`;
      html += '</dl>';

      const docLink = (() => {
  if (!uc['Zdroj']) return '-';

  // Rozdělíme URL podle čárky nebo nového řádku (podle potřeby)
  const urls = Array.isArray(uc['Zdroj']) ? uc['Zdroj'] : uc['Zdroj'].split(/[\n,]+/).map(s => s.trim()).filter(Boolean);

// Podobně pro Označení zdroje
  const labels = uc['Označení zdroje']
    ? (Array.isArray(uc['Označení zdroje'])
        ? uc['Označení zdroje']
        : uc['Označení zdroje'].split(/[\n,]+/).map(s => s.trim()))
    : [];

  return urls
    .map((url, i) => {
      // pokud je label na pozici i, použij ho, jinak použij url
      const label = labels[i] || url;
      return `<a href="${url}" target="_blank" rel="noopener">${label}</a>`;
    })
    .join('<br>');
})();

      html += '<div class="bottom-cards">';
      html += `<div class="card"><strong>Stav projektu</strong><span>${uc['Stav projektu'] || '-'}</span></div>`;
      html += `<div class="card"><strong>Zdroj</strong><span>${docLink}</span></div>`;
      if (isAdmin) {
        const contactInfo = uc['Informace o zdroji a kontaktní osoba']
          ? (() => {
              const parts = uc['Informace o zdroji a kontaktní osoba']
                .split('\\n')
                .map((s) => s.trim())
                .filter(Boolean);

              if (parts.length === 0) return '-';

              const linkPart = parts[parts.length - 1]; // poslední řádek = odkaz
              const textPart = parts.slice(0, -1).join('<br />'); // vše před tím = text

              const linkHtml =
                linkPart.startsWith('http://') || linkPart.startsWith('https://')
                  ? `<a href="${linkPart}" target="_blank" rel="noopener">${uc['Označení kontaktní osoby'] || linkPart}</a>`
                  : linkPart; // kdyby poslední řádek nebyl URL

              return `${textPart}${textPart && linkHtml ? '<br />' : ''}${linkHtml}`;
            })()
          : '<p>-</p>';
        html += `<div class="card"><strong>Kontaktní osoba</strong><span>${contactInfo}</span></div>`;
      }
      html += '</div>';
 
      section.innerHTML = html;
      main.appendChild(section);
 
      // Přiřazení use casu do kategorie podle hlavní kategorie
      const mainCat = (uc['Hlavní kategorie use case'] || '').trim();
 
      if (mainCat && categoryMap.has(mainCat)) {
        categoryMap.get(mainCat).push({ idStr, sectionId, title: uc['Název projektu'] });
      } else {
        others.push({ idStr, sectionId, title: uc['Název projektu'] });
      }
    });

    // Reakce na odkazy kategorií
    const popup = document.getElementById('category-popup');
    const popupTitle = popup?.querySelector('h3');
    const popupDesc = popup?.querySelector('p');
    const popupClose = popup?.querySelector('.popup-close');
    if (popup && popupTitle && popupDesc && popupClose) {
      const hidePopup = () => {
        popup.style.display = 'none';
      };
      popupClose.addEventListener('click', hidePopup);

      // Zavření při kliknutí mimo obsah
      popup.addEventListener('click', (e) => {
        if (e.target === popup) hidePopup();
      });
      document.addEventListener('click', (e) => {
        if (popup.style.display === 'flex' && !popup.contains(e.target)) hidePopup();
      });

      document.querySelectorAll('.category-link').forEach((link) => {
        const cat = link.getAttribute('data-category');
        const desc = categoryDescriptions.get(cat);
        const showPopup = (e) => {
          e.preventDefault();
          e.stopPropagation();
          popupTitle.textContent = cat;
          popupDesc.textContent = desc || '';
          popup.style.display = 'flex';
        };
        link.addEventListener('click', showPopup);
      });
    }

    // Vytvoření navigace z kategorií
    categories.forEach((cat) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'category-toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = `${cat.title}<span class="arrow">▶</span>`;
      li.appendChild(btn);

      const subUl = document.createElement('ul');
      subUl.className = 'subcategory';
      subUl.style.display = 'none';

      categoryMap.get(cat.title).forEach((data) => {
        const subLi = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${data.sectionId}`;
        a.textContent = `${data.title}`;
        subLi.appendChild(a);
        subUl.appendChild(subLi);
      });

      li.appendChild(subUl);
      navList.appendChild(li);

      // Otevírání a zavírání podkategorií
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        subUl.style.display = expanded ? 'none' : 'block';
      });
    });

    // Přidání zbytkové kategorie „Ostatní“, pokud je potřeba
    if (others.length > 0) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'category-toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = `Ostatní<span class="arrow">▶</span>`;
      li.appendChild(btn);

      const subUl = document.createElement('ul');
      subUl.className = 'subcategory';
      subUl.style.display = 'none';

      others.forEach((data) => {
        const subLi = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${data.sectionId}`;
        a.textContent = `${data.title}`;
        subLi.appendChild(a);
        subUl.appendChild(subLi);
      });

      li.appendChild(subUl);
      navList.appendChild(li);

      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        subUl.style.display = expanded ? 'none' : 'block';
      });
    }

    const navLinks = sidebar.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');

    // Zvýraznění aktivního odkazu
    const setActiveLink = (link) => {
      navLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
    };

    // Zobrazení příslušné sekce
    const showSection = (id) => {
      sections.forEach((s) => s.classList.remove('active'));
      const target = document.getElementById(id);
      if (target) target.classList.add('active');
    };

    // Aktivace sekce dle hash nebo první sekce
    const initialId = window.location.hash ? window.location.hash.substring(1) : sections[0].id;
    const initialLink = sidebar.querySelector(`a[href='#${initialId}']`);
    if (initialLink) {
      setActiveLink(initialLink);
      const sublist = initialLink.closest('ul.subcategory');
      if (sublist) {
        sublist.style.display = 'block';
        const toggle = sublist.previousElementSibling;
        if (toggle && toggle.classList.contains('category-toggle')) {
          toggle.setAttribute('aria-expanded', 'true');
        }
      }
    }
    showSection(initialId);

    // Reakce na kliknutí v navigaci
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = link.getAttribute('href').substring(1);
        setActiveLink(link);
        showSection(id);
        history.replaceState(null, '', `#${id}`);
        if (window.innerWidth <= 768) sidebar.classList.remove('open');
      });
    });
  } catch (e) {
    console.error('Chyba při načítání use casů:', e);
  }
}

/**
 * Jednoduchý informační banner s možností schování na 2 minuty.
 */
function initInfoBanner() {
  const POPUP_ID = 'ai-tip-popup';
  const SHOW_DELAY_MS = 30_000;          // 30 s po načtení
  const RESHOW_AFTER_CLOSE_MS = 180_000;  // 3 min po zavření
  const KEY_LAST_DISMISS = 'aiTipPopup:lastDismiss';
  const el = document.getElementById(POPUP_ID);
  if (!el) return;

  const closeBtn = el.querySelector('.popup-close');

  function now() { return Date.now(); }
  function lastDismissAt() {
    const n = Number(localStorage.getItem(KEY_LAST_DISMISS));
    return isNaN(n) ? 0 : n;
  }

  function canShow() {
    return now() - lastDismissAt() >= RESHOW_AFTER_CLOSE_MS;
  }

  function showPopup() {
    if (!canShow()) return;          // respektuj 3 min pauzu
    el.setAttribute('aria-hidden', 'false');
  }

  function hidePopup() {
    el.setAttribute('aria-hidden', 'true');
    localStorage.setItem(KEY_LAST_DISMISS, String(now()));
    clearTimeout(pendingTimer);

    // naplánovat znovu zobrazení popupu po RESHOW_AFTER_CLOSE_MS
    pendingTimer = setTimeout(showPopup, RESHOW_AFTER_CLOSE_MS);
  }

  closeBtn.addEventListener('click', hidePopup);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && el.getAttribute('aria-hidden') !== 'true') {
      hidePopup();
    }
  });

  let pendingTimer = setTimeout(showPopup, SHOW_DELAY_MS);

  if (!canShow()) {
    const msLeft = RESHOW_AFTER_CLOSE_MS - (now() - lastDismissAt());
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(showPopup, Math.max(msLeft, 1));
  }
}

// Start po načtení DOMu
document.addEventListener('DOMContentLoaded', () => {
   initCommon();
   initCatalog();
   initInfoBanner();
 });
