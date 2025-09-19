'use strict';

let openMobileMenu = () => {};
let closeMobileMenu = () => {};

/** ======================
 *  Společné prvky stránek
 *  ====================== */
function initCommon() {
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileCatalogToggle = mobileMenu?.querySelector('.mobile-menu__item--catalog .mobile-menu__toggle');
  const mobileCatalogList = document.getElementById('mobile-catalog-list');

  if (menuBtn && mobileMenu) {
    const panel = mobileMenu.querySelector('.mobile-menu__panel');
    const closeTriggers = mobileMenu.querySelectorAll('[data-mobile-menu-close]');
    const menuLinks = mobileMenu.querySelectorAll('.mobile-menu__list a');

    const isOpen = () => mobileMenu.getAttribute('aria-hidden') === 'false';

    const baseCloseMobileMenu = () => {
      mobileMenu.setAttribute('aria-hidden', 'true');
      menuBtn.setAttribute('aria-expanded', 'false');
    };

    openMobileMenu = () => {
      mobileMenu.setAttribute('aria-hidden', 'false');
      menuBtn.setAttribute('aria-expanded', 'true');
    };

    closeMobileMenu = baseCloseMobileMenu;

    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.addEventListener('click', () => {
      if (isOpen()) closeMobileMenu();
      else openMobileMenu();
    });

    closeTriggers.forEach(el => el.addEventListener('click', () => closeMobileMenu()));
    menuLinks.forEach(link => link.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeMobileMenu();
    }));

    document.addEventListener('click', event => {
      if (!isOpen() || !panel) return;
      if (!panel.contains(event.target) && !menuBtn.contains(event.target)) closeMobileMenu();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && isOpen()) {
        closeMobileMenu();
        menuBtn.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && isOpen()) closeMobileMenu();
    });
  }

  if (mobileCatalogToggle && mobileCatalogList && mobileMenu) {
    const mobileCatalogLink = mobileMenu.querySelector('.mobile-menu__item--catalog > .mobile-menu__row > a');

    const collapseNestedMobileLists = () => {
      const nestedToggles = mobileCatalogList.querySelectorAll('.mobile-menu__category-toggle[aria-expanded="true"]');
      nestedToggles.forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
      mobileCatalogList
        .querySelectorAll('.mobile-menu__submenu')
        .forEach(sublist => {
          if (sublist === mobileCatalogList) return;
          sublist.hidden = true;
          sublist.classList.remove('mobile-menu__submenu--open');
        });
    };

    const setCatalogExpanded = shouldExpand => {
      mobileCatalogToggle.setAttribute('aria-expanded', String(shouldExpand));
      mobileCatalogList.hidden = !shouldExpand;
      mobileCatalogList.classList.toggle('mobile-menu__submenu--open', shouldExpand);
      if (!shouldExpand) collapseNestedMobileLists();
    };

    setCatalogExpanded(false);

    mobileCatalogToggle.addEventListener('click', () => {
      const expanded = mobileCatalogToggle.getAttribute('aria-expanded') === 'true';
      setCatalogExpanded(!expanded);
    });

    if (mobileCatalogLink) {
      mobileCatalogLink.addEventListener('click', event => {
        const expanded = mobileCatalogToggle.getAttribute('aria-expanded') === 'true';
        if (!expanded) {
          event.preventDefault();
          setCatalogExpanded(true);
        }
      });
    }

    const originalClose = closeMobileMenu;
    closeMobileMenu = () => {
      originalClose();
      setCatalogExpanded(false);
    };
  }
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
 *  Počítadlo use casů
 *  ====================== */
function initUsecaseCounter() {
  const counter = document.querySelector('.usecase-counter');
  if (!counter) return;

  const valueEl = counter.querySelector('[data-counter-value]');
  const targetValue = Number(counter.dataset.target);
  if (!valueEl || !Number.isFinite(targetValue)) return;

  const format = value => new Intl.NumberFormat('cs-CZ').format(Math.round(value));
  const prefersReducedMotion = typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealFinalValue = () => {
    valueEl.textContent = format(targetValue);
    counter.classList.add('usecase-counter--active');
  };

  if (prefersReducedMotion) {
    revealFinalValue();
    return;
  }

  let hasAnimated = false;

  const animate = () => {
    if (hasAnimated) return;
    hasAnimated = true;
    counter.classList.add('usecase-counter--active');

    const duration = 2000;
    const startValue = 0;
    const startTime = performance.now();

    const step = now => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (targetValue - startValue) * eased;
      valueEl.textContent = format(current);
      if (progress < 1) requestAnimationFrame(step);
      else valueEl.textContent = format(targetValue);
    };

    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });

    observer.observe(counter);
  } else {
    animate();
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
  const desktopNav = document.getElementById('usecase-list');
  const mobileNav = document.getElementById('mobile-catalog-list');
  if (!desktopNav && !mobileNav) return;

  const main = document.querySelector('main');
  const isCatalogPage = document.body.id === 'project-page';
  const navTargets = [];
  if (desktopNav) navTargets.push({ element: desktopNav, variant: 'desktop' });
  if (mobileNav) navTargets.push({ element: mobileNav, variant: 'mobile' });

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

    if (isCatalogPage && main) {
      useCases.forEach(uc => {
        const { section, category, idStr, title, sectionId } = createUseCaseSection(uc, categoryDescriptions);
        main.appendChild(section);
        if (categoryMap.has(category)) categoryMap.get(category).push({ idStr, sectionId, title });
        else others.push({ idStr, sectionId, title });
      });
    } else {
      useCases.forEach(uc => {
        const category = uc['Hlavní kategorie use case']?.trim() || 'Ostatní';
        const idStr = uc.id.toString().padStart(2, '0');
        const sectionId = `usecase-${idStr}`;
        const title = uc['Název projektu'];
        if (categoryMap.has(category)) categoryMap.get(category).push({ idStr, sectionId, title });
        else others.push({ idStr, sectionId, title });
      });
    }

    // --- Kód pro popup kategorií ---
    const categoryPopup = document.getElementById('category-popup');
    if (categoryPopup) {
      const popupTitle = categoryPopup.querySelector('h3');
      const popupText = categoryPopup.querySelector('p');
      const popupClose = categoryPopup.querySelector('.popup-close');

      // zavření křížkem
      popupClose.addEventListener('click', () => {
        categoryPopup.setAttribute('aria-hidden', 'true');
      });

      // zavření kliknutím mimo obsah
      categoryPopup.addEventListener('click', (e) => {
        if (e.target === categoryPopup) {
          categoryPopup.setAttribute('aria-hidden', 'true');
        }
      });

      // otevření popupu po kliknutí na kategorii
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

    const buildCategoryNav = (catTitle, items, variant) => {
      if (!items.length) return null;
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-expanded', 'false');
      if (variant === 'desktop') btn.className = 'category-toggle';
      else btn.className = 'mobile-menu__category-toggle';
      btn.innerHTML = `${catTitle}<span class="arrow" aria-hidden="true">▶</span>`;
      li.appendChild(btn);

      const subUl = document.createElement('ul');
      if (variant === 'desktop') {
        subUl.className = 'subcategory';
      } else {
        subUl.className = 'mobile-menu__submenu';
        subUl.hidden = true;
      }

      items.forEach(item => {
        const subLi = document.createElement('li');
        const a = document.createElement('a');
        const href = isCatalogPage ? `#${item.sectionId}` : `project.html#${item.sectionId}`;
        a.href = href;
        a.textContent = item.title;
        subLi.appendChild(a);
        subUl.appendChild(subLi);
      });

      li.appendChild(subUl);

      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const nextExpanded = !expanded;
        btn.setAttribute('aria-expanded', String(nextExpanded));
        if (variant === 'mobile') {
          subUl.hidden = !nextExpanded;
          subUl.classList.toggle('mobile-menu__submenu--open', nextExpanded);
        }
      });

      return li;
    };

    navTargets.forEach(({ element, variant }) => {
      element.innerHTML = '';
      categories.forEach(cat => {
        const list = buildCategoryNav(cat.title, categoryMap.get(cat.title) || [], variant);
        if (list) element.appendChild(list);
      });
      if (others.length) {
        const list = buildCategoryNav('Ostatní', others, variant);
        if (list) element.appendChild(list);
      }
    });

    const sections = isCatalogPage && main ? Array.from(main.querySelectorAll('section')) : [];
    const navLinks = Array.from(document.querySelectorAll('#usecase-list a[href^="#"], #mobile-catalog-list a[href^="#"]'));

    const setActiveLink = link => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const sublist = link.parentElement?.parentElement;
      const toggle = sublist?.previousElementSibling;
      if (toggle instanceof HTMLElement) {
        toggle.setAttribute('aria-expanded', 'true');
        if (toggle.classList.contains('mobile-menu__category-toggle') && sublist instanceof HTMLElement) {
          sublist.hidden = false;
          sublist.classList.add('mobile-menu__submenu--open');
        }
      }
    };

    const showSection = id => {
      if (!isCatalogPage || !id) return;
      sections.forEach(s => s.classList.remove('active'));
      const target = document.getElementById(id);
      if (target) {
        target.classList.add('active');
        target.scrollIntoView();
      }
    };

    if (isCatalogPage && sections.length) {
      const initialId = window.location.hash ? window.location.hash.substring(1) : sections[0].id;
      const initialLink = document.querySelector(`#usecase-list a[href='#${initialId}'], #mobile-catalog-list a[href='#${initialId}']`);
      if (initialLink) setActiveLink(initialLink);
      showSection(initialId);

      navLinks.forEach(link => link.addEventListener('click', e => {
        e.preventDefault();
        const id = link.getAttribute('href').substring(1);
        setActiveLink(link);
        showSection(id);
        history.replaceState(null, '', `#${id}`);
        if (window.innerWidth <= 768) closeMobileMenu();
      }));

      window.addEventListener('hashchange', () => {
        const targetId = window.location.hash ? window.location.hash.substring(1) : sections[0]?.id;
        if (!targetId) return;
        const targetLink = document.querySelector(`#usecase-list a[href='#${targetId}']`);
        if (targetLink) targetLink.dispatchEvent(new Event('click', { bubbles: true }));
      });
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
  initUsecaseCounter();
});
