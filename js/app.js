'use strict';
(() => {
  const data = window.PRODUCTS_DATA;
  const products = data.product_categories.flatMap(category => category.products);
  const params = new URLSearchParams(location.search);
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  const solutionsTrigger = document.getElementById('solutions-trigger');
  const solutionsMenu = document.getElementById('solutions-menu');
  const themeToggle = document.getElementById('theme-toggle');
  const themeRoot = document.documentElement;
  const mobileNav = matchMedia('(max-width: 900px)');
  const setTheme = (theme, persist = true) => {
    const dark = theme === 'dark';
    if (themeRoot) themeRoot.dataset.theme = dark ? 'dark' : 'light';
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(dark));
      themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      const icon = themeToggle.querySelector('.theme-toggle-icon');
      if (icon) {
        icon.innerHTML = dark
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
      }
      const label = themeToggle.querySelector('.theme-toggle-label');
      if (label) label.remove();
    }
    document.querySelector?.('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b141b' : '#f5f3ed');
    if (persist) {
      try { localStorage.setItem('jhanvi-theme', dark ? 'dark' : 'light'); } catch (error) { /* Storage may be unavailable in private contexts. */ }
    }
  };
  setTheme(themeRoot?.dataset?.theme || 'light', false);
  themeToggle?.addEventListener('click', () => {
    setTheme(themeRoot?.dataset?.theme === 'dark' ? 'light' : 'dark');
  });
  toggle.hidden = false;
  const setSolutionsMenu = open => {
    if (!solutionsTrigger || !solutionsMenu) return;
    solutionsTrigger.setAttribute('aria-expanded', String(open));
    solutionsMenu.classList.toggle('is-open', open);
  };
  const closeMenu = (restoreFocus = false) => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    setSolutionsMenu(false);
    if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && solutionsTrigger?.getAttribute('aria-expanded') === 'true') {
      setSolutionsMenu(false);
      solutionsTrigger.focus();
    } else if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.header')) closeMenu();
  });
  nav.addEventListener('focusout', event => {
    if (event.relatedTarget && !nav.contains(event.relatedTarget) && event.relatedTarget !== toggle) closeMenu();
  });
  matchMedia('(min-width: 901px)').addEventListener('change', () => closeMenu());
  if (solutionsTrigger && solutionsMenu) {
    solutionsTrigger.addEventListener('click', event => {
      if (!mobileNav.matches) return;
      const open = solutionsTrigger.getAttribute('aria-expanded') !== 'true';
      if (open) event.preventDefault();
      setSolutionsMenu(open);
    });
    solutionsTrigger.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      setSolutionsMenu(true);
      solutionsMenu.querySelector('a')?.focus();
    });
  }
  if (location.pathname.endsWith('/product-detail.html')) {
    const requested = products.find(product => product.id === params.get('id'));
    if (requested) location.replace('products/' + requested.id + '.html');
  }
  const search = document.getElementById('product-search');
  if (search) {
    const cards = [...document.querySelectorAll('#product-grid .product-card')];
    const buttons = [...document.querySelectorAll('[data-filter]')];
    const validCategories = new Set(['all', ...data.product_categories.map(category => category.id)]);
    let category = validCategories.has(params.get('category')) ? params.get('category') : 'all';
    search.value = params.get('q') || '';
    const reset = document.getElementById('reset-filters');
    const filter = (updateUrl = true) => {
      const term = search.value.trim().toLocaleLowerCase();
      let count = 0;
      cards.forEach(card => {
        const match = (category === 'all' || card.dataset.category === category) && card.dataset.search.toLocaleLowerCase().includes(term);
        card.hidden = !match;
        if (match) count++;
      });
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
      document.getElementById('result-count').textContent = `${count} ${count === 1 ? 'solution' : 'solutions'}${category === 'all' && !term ? ' · 8 core systems + PPGI' : ''}`;
      document.getElementById('no-results').hidden = count > 0;
      reset.hidden = category === 'all' && !term;
      if (updateUrl) {
        const url = new URL(location.href);
        category === 'all' ? url.searchParams.delete('category') : url.searchParams.set('category', category);
        term ? url.searchParams.set('q', search.value.trim()) : url.searchParams.delete('q');
        history.replaceState(null, '', url);
      }
    };
    buttons.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; filter(); }));
    search.addEventListener('input', () => filter());
    reset.addEventListener('click', () => { category = 'all'; search.value = ''; filter(); search.focus(); });
    addEventListener('popstate', () => {
      const current = new URLSearchParams(location.search);
      category = validCategories.has(current.get('category')) ? current.get('category') : 'all';
      search.value = current.get('q') || '';
      filter(false);
    });
    filter(false);
  }
  const form = document.getElementById('rfq-form');
  if (form) {
    form.querySelectorAll('button[type="submit"]').forEach(button => { button.disabled = false; });
    const selected = products.find(product => product.id === params.get('product'));
    const precast = data.precast_items.find(item => item.id === params.get('precast'));
    const project = data.projects.find(item => item.name === params.get('project'));
    if (selected) form.elements.scope.value = selected.id;
    if (precast) {
      form.elements.scope.value = 'precast-jersey-barriers';
      form.elements.message.value = 'Precast requirement: ' + precast.name + '\n';
    }
    if (project) {
      form.elements.scope.value = 'multiple';
      form.elements.message.value = 'We would like to discuss a scope similar to ' + project.scope + '.\n';
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      for (const input of form.querySelectorAll('input[required]:not([type="checkbox"]), textarea[required]')) {
        input.setCustomValidity(input.value.trim() ? '' : 'Please complete this field.');
      }
      if (!form.reportValidity()) return;
      const values = new FormData(form);
      const value = key => String(values.get(key) || '').trim();
      const system = form.elements.scope.selectedOptions[0].textContent;
      const message = [
        'Project enquiry | Jhanvi Enterprises',
        'Name: ' + value('name'), 'Company: ' + value('company'),
        'Email: ' + value('email'), 'Phone: ' + value('phone'),
        'System / scope: ' + system, 'Site location: ' + value('location'),
        'Quantity / dimensions: ' + (value('quantity') || 'To be discussed'),
        'Target timeline: ' + (value('timeline') || 'To be discussed'),
        'Documents available: ' + value('documents'),
        '', 'Requirements:', value('message'),
        '', 'I agree to be contacted by Jhanvi Enterprises regarding this enquiry.'
      ].join('\n');
      const channel = event.submitter?.value || 'whatsapp';
      const href = channel === 'email'
        ? 'mailto:info@jhanvienterprises.co.in?subject=' + encodeURIComponent('Project enquiry — ' + system) + '&body=' + encodeURIComponent(message)
        : 'https://wa.me/918328014122?text=' + encodeURIComponent(message);
      const dispatch = document.getElementById('dispatch-link');
      dispatch.href = href;
      dispatch.textContent = channel === 'email' ? 'Open prepared email ↗' : 'Open prepared WhatsApp message ↗';
      document.getElementById('dispatch-fallback').hidden = false;
      document.getElementById('form-status').textContent = 'Your enquiry is prepared. Review it, attach any files, and press Send in ' + (channel === 'email' ? 'your email app.' : 'WhatsApp.');
      if (channel === 'email') location.href = href;
      else window.open(href, '_blank', 'noopener,noreferrer');
    });
    form.addEventListener('input', event => {
      if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity('');
      document.getElementById('form-status').textContent = '';
      document.getElementById('dispatch-fallback').hidden = true;
    });
  }

  // Product Portfolio Rolling Carousel
  const carouselTrack = document.getElementById('product-carousel-track');
  if (carouselTrack) {
    let isStopped = false;
    let isPaused = false;
    let isVisible = false;
    let rafId = null;
    const speed = 0.8;

    const stopAutoScroll = () => {
      if (!isStopped) {
        isStopped = true;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    };

    const startScroll = () => {
      if (!isStopped && !isPaused && isVisible && !rafId && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        rafId = requestAnimationFrame(step);
      }
    };

    const pauseScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    carouselTrack.addEventListener('touchstart', stopAutoScroll, { passive: true });
    carouselTrack.addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch' || event.pointerType === 'pen') {
        stopAutoScroll();
      }
    }, { passive: true });
    carouselTrack.addEventListener('wheel', stopAutoScroll, { passive: true });

    carouselTrack.addEventListener('mouseenter', () => { isPaused = true; pauseScroll(); });
    carouselTrack.addEventListener('mouseleave', () => { isPaused = false; startScroll(); });
    carouselTrack.addEventListener('focusin', () => { isPaused = true; pauseScroll(); });
    carouselTrack.addEventListener('focusout', () => { isPaused = false; startScroll(); });

    const step = () => {
      if (!isStopped && !isPaused && isVisible) {
        carouselTrack.scrollLeft += speed;
        const cardsCount = carouselTrack.children.length;
        if (cardsCount > 1) {
          const halfIndex = Math.floor(cardsCount / 2);
          const loopPoint = carouselTrack.children[halfIndex].offsetLeft - carouselTrack.children[0].offsetLeft;
          if (loopPoint > 0 && carouselTrack.scrollLeft >= loopPoint) {
            carouselTrack.scrollLeft -= loopPoint;
          }
        }
      }
      if (!isStopped && isVisible) {
        rafId = requestAnimationFrame(step);
      } else {
        rafId = null;
      }
    };

    if (typeof IntersectionObserver !== 'undefined') {
      const carouselObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            startScroll();
          } else {
            pauseScroll();
          }
        });
      }, { rootMargin: '120px' });
      carouselObserver.observe(carouselTrack);
    } else {
      isVisible = true;
      startScroll();
    }
  }

  // Partner Logo Marquee: pause animation off-screen to conserve CPU/resources
  const logoMarquee = document.querySelector?.('.logo-marquee');
  if (logoMarquee && typeof IntersectionObserver !== 'undefined') {
    const marqueeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        logoMarquee.classList.toggle('is-paused', !entry.isIntersecting);
      });
    }, { rootMargin: '150px' });
    marqueeObserver.observe(logoMarquee);
  }
})();

