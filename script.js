'use strict';

/** ======================
 *  Společné prvky stránek
 *  ====================== */
function initCommon() {
  const menuBtn = document.getElementById('menuBtn');
  const mobileNav = document.getElementById('mobile-nav');

  if (menuBtn && mobileNav) {
    const setNavState = (open) => {
      mobileNav.classList.toggle('open', open);
      mobileNav.setAttribute('aria-hidden', String(!open));
      menuBtn.setAttribute('aria-expanded', String(open));
    };

    setNavState(false);

    menuBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.contains('open');
      setNavState(!isOpen);
    });

    document.addEventListener('click', (e) => {
      if (
        window.innerWidth <= 768 &&
        mobileNav.classList.contains('open') &&
        !mobileNav.contains(e.target) &&
        !menuBtn.contains(e.target)
      ) {
        setNavState(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        setNavState(false);
        menuBtn.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) setNavState(false);
    });

    mobileNav.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) setNavState(false);
    });
  }
}

function setupDisclosure(button, target) {
  if (!button || !target) return;
  button.setAttribute('aria-expanded', button.getAttribute('aria-expanded') || 'false');
  if (!target.hasAttribute('hidden')) target.hidden = true;

  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    target.hidden = expanded;
  });
}

/** ======================
 *  Popup / informační banner
 *  ====================== */
function initInfoBanner() {
  const POPUP_ID = 'ai-tip-popup';
  const SHOW_DELAY_MS = 3000;
  const RESHOW_AFTER_CLOSE_MS = 180000;
  const KEY_LAST_DISMISS = 'aiTipPopup:lastDismiss';
  const el = document.getElementById(POPUP_ID);
  if (!el) return;

  const closeBtn = el.querySelector('.popup-close');

  const now = () => Date.now();
  const lastDismissAt = () => Number(localStorage.getItem(KEY_LAST_DISMISS)) || 0;
  const canShow = () => now() - lastDismissAt() >= RESHOW_AFTER_CLOSE_MS;

  let pendingTimer;

  const showPopup = () => {
    if (!canShow()) return;
    el.setAttribute('aria-hidden', 'false');
  };

  const hidePopup = () => {
    el.setAttribute('aria-hidden', 'true');
    localStorage.setItem(KEY_LAST_DISMISS, String(now()));
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(showPopup, RESHOW_AFTER_CLOSE_MS);
  };

  if (closeBtn) closeBtn.addEventListener('click', hidePopup);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && el.getAttribute('aria-hidden') !== 'true') hidePopup();
  });

  if (canShow()) {
    pendingTimer = setTimeout(showPopup, SHOW_DELAY_MS);
  } else {
    const msLeft = RESHOW_AFTER_CLOSE_MS - (now() - lastDismissAt());
    pendingTimer = setTimeout(showPopup, Math.max(msLeft, 1));
  }
}

/** ======================
 *  Pomocné funkce pro katalog
 *  ====================== */
function createUseCaseSection(uc, categoryDescriptions) {
  const idStr = uc.id.toString().padStart(2, '0');
  const sectionId = `usecase-${idStr}`;
  const section = document.createElement('section');
  section.id = sectionId;

  let title = uc['Název projektu'];

  let html = `<h2><span class="download-btn-guard"></span>${title}</h2><table class="table-meta card">
    <tbody>
      <tr><td><img src="icons/buildings.svg" alt="Instituce" class="table-icon" width="16" height="16"></td><th scope="row">Instituce</th><td>${uc['Instituce'] || '—'}</td></tr>
      <tr><td><img src="icons/contact-plus.svg" alt="Dodavatel" class="table-icon" width="16" height="16"></td><th scope="row">Dodavatel</th><td>${uc['Dodavatel'] || '—'}</td></tr>
      <tr><td><img src="icons/edit-box.svg" alt="Obor" class="table-icon" width="16" height="16"></td><th scope="row">Obor činnosti</th><td>${uc['Obor činnosti'] || '—'}</td></tr>
      <tr><td><img src="icons/flag.svg" alt="Kategorie" class="table-icon" width="16" height="16"></td><th scope="row">Kategorie use case</th><td>${
      categoryDescriptions.has(uc['Hlavní kategorie use case']?.split('(')[0].trim())
        ? `<a href="#" class="category-link" data-category="${uc['Hlavní kategorie use case'].split('(')[0].trim()}">${uc['Hlavní kategorie use case']}</a>`
        : uc['Hlavní kategorie use case'] || '—'
      }</td></tr>
    </tbody>
  </table>`;

  if (uc['Krátký popis']) {
    html += `<div class="highlight">${uc['Krátký popis'].split('\n').map(p => `<p>${p}</p>`).join('')}</div>`;
  }

  html += `<dl class="info-grid">
    <dt>Řešený problém</dt><dd>${uc['Řešený problém'] || '—'}</dd>
    <dt>Použité AI technologie</dt><dd><ul>${(uc['Typ umělé inteligence'] || '').split('\n').filter(Boolean).map(t => `<li>${t}</li>`).join('')}</ul></dd>
    <dt>Očekávané dopady</dt><dd><ul>${(uc['Očekávané dopady'] || '').split('\n').filter(Boolean).map(s => `<li>${s}</li>`).join('')}</ul></dd>
    <dt>Vyhodnocení úspěšnosti</dt><dd>${uc['Vyhodnocení úspěšnosti'] || '—'}</dd>
    <dt>Poučení pro příští projekty</dt><dd>${uc['Poučení pro příští projekty'] || '—'}</dd>
  </dl>`;

  // Zdroje
  const docLink = (() => {
    if (!uc['Zdroj']) return '—';
    const urls = Array.isArray(uc['Zdroj']) ? uc['Zdroj'] : uc['Zdroj'].split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    const labels = uc['Označení zdroje'] ? (Array.isArray(uc['Označení zdroje']) ? uc['Označení zdroje'] : uc['Označení zdroje'].split(/[\n,]+/).map(s => s.trim())) : [];
    return urls.map((url, i) => `<a href="${url}" target="_blank" rel="noopener">${labels[i] || url}</a>`).join('<br>');
  })();

  html += `<div class="bottom-cards">
    <div class="card"><strong>Stav projektu</strong><span>${uc['Stav projektu'] || '—'}</span></div>
    <div class="card"><strong>Zdroj</strong><span>${docLink}</span></div>`;

  html += '</div>';
  section.innerHTML = html;

  return { section, category: uc['Hlavní kategorie use case']?.trim() || 'Ostatní', idStr, title: uc['Název projektu'], sectionId };
}

/** ======================
 *  Navigace a katalog
 *  ====================== */
async function initCatalog() {
  const sidebar = document.getElementById('sidebar');
  const navList = document.getElementById('usecase-list');
  const main = document.querySelector('main');
  const mobileCatalogList = document.getElementById('mobile-catalog-list');
  const mobileCatalogToggle = document.querySelector('[data-toggle="mobile-catalog-list"]');
  const isProjectPage = document.body.id === 'project-page';

  const needsDesktopCatalog = Boolean(sidebar && navList && main && isProjectPage);
  const needsMobileCatalog = Boolean(mobileCatalogList);
  if (!needsDesktopCatalog && !needsMobileCatalog) return;

  try {
    const [casesRes, categoriesRes] = await Promise.all([
      fetch('use-cases.json'),
      fetch('categories.json')
    ]);
    const useCases = await casesRes.json();
    const categories = await categoriesRes.json();

    const categoryDescriptions = new Map(categories.map(c => [c.title, c.description]));
    const categoryMap = new Map(categories.map(c => [c.title, []]));
    const others = [];

    useCases.forEach(uc => {
      const { section, category, idStr, title, sectionId } = createUseCaseSection(uc, categoryDescriptions);
      if (needsDesktopCatalog) main.appendChild(section);
      const entry = { idStr, sectionId, title };
      if (categoryMap.has(category)) categoryMap.get(category).push(entry);
      else others.push(entry);
    });

    if (needsDesktopCatalog) {
      const categoryPopup = document.getElementById('category-popup');
      if (categoryPopup) {
        const popupTitle = categoryPopup.querySelector('h3');
        const popupText = categoryPopup.querySelector('p');
        const popupClose = categoryPopup.querySelector('.popup-close');

        if (popupClose) {
          popupClose.addEventListener('click', () => {
            categoryPopup.setAttribute('aria-hidden', 'true');
          });
        }

        categoryPopup.addEventListener('click', (e) => {
          if (e.target === categoryPopup) {
            categoryPopup.setAttribute('aria-hidden', 'true');
          }
        });

        const categoryLinks = document.querySelectorAll('.category-link');
        categoryLinks.forEach(link => {
          link.addEventListener('click', e => {
            e.preventDefault();
            const cat = link.dataset.category;
            popupTitle.textContent = link.textContent;
            popupText.textContent = categoryDescriptions.get(cat) || '';
            categoryPopup.setAttribute('aria-hidden', 'false');
          });
        });
      }

      const buildCategoryNav = (catTitle, items) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = 'category-toggle';
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = `${catTitle}<span class="arrow" aria-hidden="true">▶</span>`;
        li.appendChild(btn);

        const subUl = document.createElement('ul');
        subUl.className = 'subcategory';
        items.forEach(item => {
          const subLi = document.createElement('li');
          const a = document.createElement('a');
          a.href = `#${item.sectionId}`;
          a.textContent = item.title;
          subLi.appendChild(a);
          subUl.appendChild(subLi);
        });
        li.appendChild(subUl);

        btn.addEventListener('click', () => {
          const expanded = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', String(!expanded));
        });

        return li;
      };

      categories.forEach(cat => {
        const items = categoryMap.get(cat.title) || [];
        navList.appendChild(buildCategoryNav(cat.title, items));
      });
      if (others.length) navList.appendChild(buildCategoryNav('Ostatní', others));

      const navLinks = sidebar.querySelectorAll('nav a');
      const sections = main.querySelectorAll('section');

      const setActiveLink = link => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const sublist = link.closest('ul.subcategory');
        if (sublist) {
          const toggle = sublist.previousElementSibling;
          if (toggle?.classList.contains('category-toggle')) toggle.setAttribute('aria-expanded', 'true');
        }
      };

      const showSection = id => {
        sections.forEach(s => s.classList.remove('active'));
        const target = document.getElementById(id);
        if (target) {
          target.classList.add('active');
          target.scrollIntoView();
        }
      };

      const handleHashChange = () => {
        const targetId = window.location.hash ? window.location.hash.substring(1) : sections[0]?.id;
        if (!targetId) return;
        const targetLink = sidebar.querySelector(`a[href='#${targetId}']`);
        if (targetLink) setActiveLink(targetLink);
        showSection(targetId);
      };

      handleHashChange();

      navLinks.forEach(link => link.addEventListener('click', e => {
        e.preventDefault();
        const id = link.getAttribute('href').substring(1);
        setActiveLink(link);
        showSection(id);
        history.replaceState(null, '', `#${id}`);
      }));

      window.addEventListener('hashchange', handleHashChange);
    }

    if (needsMobileCatalog) {
      mobileCatalogList.innerHTML = '';
      const slugify = (str) => str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const linkBase = isProjectPage ? '#' : 'project.html#';
      mobileCatalogList.hidden = true;

      const buildMobileCategory = (catTitle, items) => {
        if (!items.length) return null;
        const li = document.createElement('li');
        li.className = 'mobile-nav__submenu-item';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mobile-nav__submenu-toggle';
        btn.setAttribute('aria-expanded', 'false');

        const label = document.createElement('span');
        label.textContent = catTitle;
        const chevron = document.createElement('span');
        chevron.className = 'mobile-nav__chevron';
        chevron.setAttribute('aria-hidden', 'true');
        chevron.textContent = '▸';
        btn.append(label, chevron);

        const subUl = document.createElement('ul');
        subUl.className = 'mobile-nav__submenu';
        subUl.hidden = true;
        const subId = `mobile-cat-${slugify(catTitle)}-${items[0].idStr}`;
        subUl.id = subId;
        btn.setAttribute('aria-controls', subId);

        items.forEach(item => {
          const caseLi = document.createElement('li');
          caseLi.className = 'mobile-nav__submenu-item';
          const caseLink = document.createElement('a');
          caseLink.href = `${linkBase}${item.sectionId}`;
          caseLink.textContent = item.title;
          caseLi.appendChild(caseLink);
          subUl.appendChild(caseLi);
        });

        li.append(btn, subUl);
        setupDisclosure(btn, subUl);
        return li;
      };

      categories.forEach(cat => {
        const items = categoryMap.get(cat.title) || [];
        const node = buildMobileCategory(cat.title, items);
        if (node) mobileCatalogList.appendChild(node);
      });
      if (others.length) {
        const node = buildMobileCategory('Ostatní', others);
        if (node) mobileCatalogList.appendChild(node);
      }

      if (mobileCatalogToggle) {
        setupDisclosure(mobileCatalogToggle, mobileCatalogList);
      }
    }
  } catch (e) {
    console.error('Chyba při načítání use casů:', e);
  }
}

/** ======================
 *  Start po načtení DOMu
 *  ====================== */
document.addEventListener('DOMContentLoaded', () => {
  initCommon();
  initCatalog();
  initInfoBanner();
});
