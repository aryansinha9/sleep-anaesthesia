// Sleep Anaesthesia — shared nav, reveal, FAQ filtering. Footer + JSON-LD are static per page.
(() => {
  const MARK = `<img class="brand-mark" src="uploads/sleep-anaesthesia-logo.png" alt="Sleep Anaesthesia logo" />`;
  const MARK_LIGHT = `<img class="brand-mark" src="uploads/sleep-anaesthesia-logo-light.png" alt="Sleep Anaesthesia logo" />`;
  // Dental Clinics has a dropdown restoring the old sub-page wayfinding.
  const CLINIC_MENU = [
    ['clinics.html', 'General information'],
    ['general-anaesthesia.html', 'General anaesthesia'],
    ['general-anaesthesia.html#logistics', 'Logistics & site requirements'],
  ];
  const clinicPages = ['clinics.html', 'general-anaesthesia.html'];
  const page = document.body.dataset.page || '';

  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.innerHTML =
    `<a class="nav-brand" href="index.html">${MARK}<span>Sleep&nbsp;Anaesthesia</span></a>` +
    `<a href="index.html"${page === 'index.html' ? ` aria-current="page"` : ''}>Home</a>` +
    `<a href="patients.html"${page === 'patients.html' ? ` aria-current="page"` : ''}>Patients</a>` +
    `<div class="nav-drop">` +
      `<a href="clinics.html" class="nav-drop-trigger"${clinicPages.includes(page) ? ` aria-current="page"` : ''} aria-haspopup="true">Dental Clinics` +
        `<svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true" style="margin-left:5px;"><path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a>` +
      `<div class="nav-menu" role="menu">` +
        CLINIC_MENU.map(([href, label]) => `<a href="${href}" role="menuitem">${label}</a>`).join('') +
      `</div>` +
    `</div>` +
    `<a href="pricing.html"${page === 'pricing.html' ? ` aria-current="page"` : ''}>Pricing</a>` +
    `<a href="contact.html"${page === 'contact.html' ? ` aria-current="page"` : ''}>Contact</a>` +
    `<a class="btn btn-primary" href="contact.html">Contact us</a>` +
    `<button class="nav-burger" aria-label="Open menu" aria-expanded="false">` +
      `<span></span><span></span><span></span>` +
    `</button>`;
  document.body.prepend(nav);

  // mobile menu
  const mobile = document.createElement('div');
  mobile.className = 'mobile-menu';
  mobile.innerHTML =
    [['index.html', 'Home'], ['patients.html', 'Patients']].map(([h, l]) => `<a href="${h}"${h === page ? ` aria-current="page"` : ''}>${l}</a>`).join('') +
    `<span class="mm-group">Dental clinics</span>` +
    CLINIC_MENU.map(([h, l]) => `<a class="mm-sub" href="${h}">${l}</a>`).join('') +
    [['pricing.html', 'Pricing & payment plans'], ['contact.html', 'Contact'], ['portal.html', 'Dental portal']].map(([h, l]) => `<a href="${h}"${h === page ? ` aria-current="page"` : ''}>${l}</a>`).join('') +
    `<a class="btn btn-primary" href="contact.html" style="margin-top:10px;">Contact us</a>`;
  nav.appendChild(mobile);
  const burger = nav.querySelector('.nav-burger');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  mobile.addEventListener('click', (e) => { if (e.target.closest('a')) nav.classList.remove('menu-open'); });

  // Footer and structured data are static HTML in each page (see tools/build-static.py).

  // reveal on scroll — fail-safe: hidden state only applies once JS confirms,
  // in-view elements reveal immediately, and a timeout reveals everything
  // if IntersectionObserver never fires.
  const revealEls = [...document.querySelectorAll('.reveal')];
  if (revealEls.length && 'IntersectionObserver' in window) {
    document.body.classList.add('js-reveal');
    let fired = false;
    const io = new IntersectionObserver((es) => {
      fired = true;
      for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { threshold: 0.12 });
    for (const el of revealEls) {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) el.classList.add('in');
      else io.observe(el);
    }
    setTimeout(() => { if (!fired) revealEls.forEach((el) => el.classList.add('in')); }, 1200);
  }

  // FAQ: live search + category segmented filter.
  // Container: [data-faq]; search: [data-faq-search]; radios name=faqcat value=all|<cat>;
  // items: details.qa[data-cat]; count: [data-faq-count]; empty: .faq-empty.
  window.initFaq = (root) => {
    root = root || document;
    const items = [...root.querySelectorAll('details.qa')];
    const search = root.querySelector('[data-faq-search]');
    const count = root.querySelector('[data-faq-count]');
    const empty = root.querySelector('.faq-empty');
    const radios = [...root.querySelectorAll('input[name="faqcat"]')];
    const apply = () => {
      const q = (search?.value || '').trim().toLowerCase();
      const cat = radios.find((r) => r.checked)?.value || 'all';
      let shown = 0;
      for (const d of items) {
        const okCat = cat === 'all' || d.dataset.cat === cat;
        const okText = !q || d.textContent.toLowerCase().includes(q);
        const show = okCat && okText;
        d.style.display = show ? '' : 'none';
        if (show) shown++;
        if (q && show && q.length >= 3) d.open = true;
      }
      if (count) count.textContent = shown + ' of ' + items.length + ' questions';
      if (empty) empty.style.display = shown ? 'none' : 'block';
    };
    search?.addEventListener('input', apply);
    radios.forEach((r) => r.addEventListener('change', apply));
    apply();
  };
  document.querySelectorAll('[data-faq]').forEach((el) => window.initFaq(el));
})();
