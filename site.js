// Sleep Anaesthesia — shared chrome (nav + footer), reveal, FAQ filtering.
(() => {
  const MARK = `<img class="brand-mark" src="uploads/Screenshot 2026-07-17 at 2.27.27 pm copy (2)-7da914ac.png" alt="Sleep Anaesthesia logo" />`;
  const MARK_LIGHT = `<img class="brand-mark" src="uploads/Screenshot 2026-07-17 at 2.27.27 pm copy (3).png" alt="Sleep Anaesthesia logo" />`;
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

  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `<div class="wrap">
    <div>
      <a class="nav-brand" href="index.html" style="display:inline-flex;align-items:center;gap:10px;font-family:var(--font-heading);font-weight:var(--font-heading-weight);font-size:18px;text-decoration:none;color:inherit;">${MARK_LIGHT}<span>Sleep Anaesthesia</span></a>
      <p class="about" style="margin-top:14px;">Up to 40% of people experience dental fear. Our team of qualified anaesthesiologists, assistants and nurses is here to enhance your dental experience.</p>
      <p class="about" style="margin-top:6px;">We now accept Afterpay, split your payment into 4 instalments.</p>
    </div>
    <div>
      <h4>Quick links</h4>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="patients.html">Patients</a></li>
        <li><a href="clinics.html">Dental clinics</a></li>
        <li><a href="general-anaesthesia.html">General anaesthesia</a></li>
        <li><a href="pricing.html">Pricing &amp; payment plans</a></li>
        <li><a href="portal.html">Dental portal</a></li>
      </ul>
    </div>
    <div>
      <h4>Contact</h4>
      <ul>
        <li><a href="tel:0485692397">Call — 0485 692 397</a></li>
        <li><a href="mailto:admin@sleepanaesthesia.com.au">admin@sleepanaesthesia.com.au</a></li>
        <li><a href="https://instagram.com/sleepanaesthesia" target="_blank" rel="noopener">Instagram — @sleepanaesthesia</a></li>
        <li><a href="contact.html">WhatsApp chat / enquiry</a></li>
      </ul>
    </div>
    <div class="legal"><span>© Sleep Anaesthesia — Brisbane · Gold Coast · Melbourne</span><span>ANZCA-accredited specialist anaesthetists</span></div>
  </div>`;
  document.body.appendChild(footer);

  // Structured data: MedicalBusiness sitewide + FAQPage/BreadcrumbList where relevant.
  const BASE = 'https://sleepanaesthesia.com.au/';
  const addLd = (obj) => {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  };
  addLd({
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': BASE + '#organization',
    name: 'Sleep Anaesthesia',
    url: BASE,
    logo: BASE + 'uploads/Screenshot 2026-07-17 at 2.27.27 pm copy (2)-7da914ac.png',
    telephone: '+61 485 692 397',
    email: 'admin@sleepanaesthesia.com.au',
    description: 'Mobile IV sedation and general anaesthesia services for dental clinics, delivered by ANZCA-accredited specialist anaesthetists with hospital-grade equipment.',
    medicalSpecialty: 'Anesthesia',
    areaServed: ['Brisbane', 'Gold Coast', 'Melbourne CBD', 'South East Melbourne'],
    sameAs: ['https://instagram.com/sleepanaesthesia'],
  });
  if (page && page !== 'index.html') {
    const names = { 'patients.html': 'Patients', 'clinics.html': 'Dental Clinics', 'general-anaesthesia.html': 'General Anaesthesia', 'pricing.html': 'Pricing & Payment Plans', 'contact.html': 'Contact', 'portal.html': 'Dental Portal' };
    addLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: names[page] || document.title, item: BASE + page },
      ],
    });
  }
  const qas = [...document.querySelectorAll('details.qa:not(.rate)')];
  if (qas.length) {
    addLd({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: qas.map((d) => {
        const s = d.querySelector('summary').cloneNode(true);
        s.querySelectorAll('.qa-cat, .qa-mark').forEach((n) => n.remove());
        return {
          '@type': 'Question',
          name: s.textContent.trim(),
          acceptedAnswer: { '@type': 'Answer', text: d.querySelector('.qa-body').textContent.trim() },
        };
      }),
    });
  }

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
