/**
 * PhysioCure Mono — interactions légères
 */
document.documentElement.classList.remove('no-js');

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-faq-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('[data-faq-item]');
      if (!item) return;
      const open = item.getAttribute('data-open') === 'true';
      const next = !open;
      item.setAttribute('data-open', next ? 'true' : 'false');
      btn.setAttribute('aria-expanded', next ? 'true' : 'false');
    });
  });

  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-main-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', (!expanded).toString());
      nav.classList.toggle('is-open', !expanded);
      document.body.classList.toggle('nav-open', !expanded);
    });
  }

  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const variantSelect = document.querySelector('[data-main-variant-select]');
  if (variantSelect) {
    variantSelect.addEventListener('change', () => {
      const opt = variantSelect.selectedOptions[0];
      const url = opt && opt.dataset.url;
      if (url) window.location.href = url;
    });
  }

  const syncStickyProductBar = (radio) => {
    const bar = document.querySelector('[data-product-sticky-bar]');
    if (!bar || !radio) return;
    const fmt = bar.getAttribute('data-save-label-fmt') || '';
    const priceRoot = bar.querySelector('[data-sticky-prices]');
    const current = bar.querySelector('[data-sticky-current]');
    const compare = bar.querySelector('[data-sticky-compare]');
    const badge = bar.querySelector('[data-sticky-save-badge]');
    const thumb = bar.querySelector('img.product-sticky-bar__thumb');
    const stickyBtn = bar.querySelector('[data-sticky-submit]');

    if (current) current.textContent = radio.getAttribute('data-sticky-price') || '';

    const cmp = radio.getAttribute('data-sticky-compare') || '';
    if (compare) {
      if (cmp) {
        compare.textContent = cmp;
        compare.removeAttribute('hidden');
      } else {
        compare.textContent = '';
        compare.setAttribute('hidden', '');
      }
    }

    const pct = parseInt(radio.getAttribute('data-sticky-save-pct') || '0', 10) || 0;
    if (badge) {
      if (pct > 0 && fmt) {
        badge.textContent = fmt.split('___PCT___').join(String(pct));
        badge.removeAttribute('hidden');
      } else {
        badge.textContent = '';
        badge.setAttribute('hidden', '');
      }
    }

    if (priceRoot) {
      priceRoot.classList.toggle('price--on-sale', Boolean(cmp || pct > 0));
    }

    const imgUrl = radio.getAttribute('data-sticky-image');
    if (thumb && imgUrl) {
      thumb.src = imgUrl;
    }

    const available = radio.getAttribute('data-variant-available') === 'true';
    if (stickyBtn) {
      stickyBtn.disabled = !available;
      const custom = stickyBtn.dataset.labelCustom;
      const la = stickyBtn.dataset.labelAvailable;
      const ls = stickyBtn.dataset.labelSold;
      stickyBtn.textContent = available ? custom || la || '' : ls || '';
    }
  };

  const packWrap = document.querySelector('[data-product-pack-form]');
  if (packWrap) {
    const hiddenId = packWrap.querySelector('[data-variant-input]');
    const submitBtn = packWrap.querySelector('[data-pack-submit]');
    const qtyInput = packWrap.querySelector('[data-pack-qty-input]');
    const qtyMode = Boolean(packWrap.querySelector('[data-pack-qty-mode]'));
    const radios = qtyMode
      ? packWrap.querySelectorAll('[data-pack-qty-radio]')
      : packWrap.querySelectorAll('[data-pack-variant-radio]');

    const applyPack = (radio) => {
      if (!radio || !radio.checked) return;
      if (qtyMode && qtyInput) {
        qtyInput.value = radio.value;
      } else if (hiddenId) {
        hiddenId.value = radio.value;
      }
      const available = radio.getAttribute('data-variant-available') === 'true';
      if (submitBtn) {
        submitBtn.disabled = !available;
        const la = submitBtn.getAttribute('data-label-available');
        const ls = submitBtn.getAttribute('data-label-sold');
        if (la && ls) submitBtn.textContent = available ? la : ls;
      }
      packWrap.querySelectorAll('[data-pack-card]').forEach((card) => {
        const input = card.querySelector('[data-pack-qty-radio], [data-pack-variant-radio]');
        card.classList.toggle('is-selected', Boolean(input && input.checked));
      });
      syncStickyProductBar(radio);
      if (!qtyMode) {
        try {
          const base = window.location.pathname;
          window.history.replaceState({}, '', `${base}?variant=${encodeURIComponent(radio.value)}`);
        } catch (_) {
          /* ignore */
        }
      }
    };

    radios.forEach((radio) => {
      radio.addEventListener('change', () => applyPack(radio));
    });
    const initial = packWrap.querySelector(
      qtyMode ? '[data-pack-qty-radio]:checked' : '[data-pack-variant-radio]:checked'
    );
    if (initial) applyPack(initial);
  }

  const stickyBar = document.querySelector('[data-product-sticky-bar]');
  const stickySentinel = document.querySelector('[data-product-sticky-sentinel]');
  if (stickyBar && stickySentinel && typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver(
      ([entry]) => {
        const show = entry && !entry.isIntersecting;
        stickyBar.toggleAttribute('hidden', !show);
        document.body.classList.toggle('product-sticky-bar-on', Boolean(show));
      },
      { root: null, threshold: 0, rootMargin: '0px' }
    );
    io.observe(stickySentinel);
  }

  document.querySelector('[data-sticky-submit]')?.addEventListener('click', () => {
    const mainBtn = document.querySelector('#MainProduct button[type="submit"][name="add"]');
    if (mainBtn && !mainBtn.disabled) mainBtn.click();
  });

  const galleryRoot = document.querySelector('[data-product-gallery]');
  if (galleryRoot) {
    const mainBtn = galleryRoot.querySelector('[data-lightbox-open]');
    const mainImg = galleryRoot.querySelector('.product-neuro-gallery__img');
    const dialog = galleryRoot.querySelector('[data-product-lightbox]');
    const lightboxImg = galleryRoot.querySelector('[data-lightbox-img]');
    const thumbs = galleryRoot.querySelectorAll('[data-gallery-thumb]');

    const openLightbox = (src, alt) => {
      if (!dialog || !lightboxImg || !src) return;
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    };

    const closeLightbox = () => {
      if (dialog && typeof dialog.close === 'function') dialog.close();
    };

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const src = thumb.dataset.fullSrc;
        const alt = thumb.querySelector('img')?.getAttribute('alt') || '';
        const type = thumb.dataset.mediaType || 'image';
        thumbs.forEach((t) => t.classList.remove('is-active'));
        thumb.classList.add('is-active');
        if (type === 'image' && mainImg && src) {
          mainImg.src = src;
          mainImg.removeAttribute('srcset');
          mainImg.alt = alt;
        }
        openLightbox(src, alt);
      });
    });

    if (mainBtn && mainImg && lightboxImg) {
      mainBtn.addEventListener('click', (e) => {
        if (e.target.closest('video, model-viewer, iframe')) return;
        const src = mainImg.currentSrc || mainImg.src;
        openLightbox(src, mainImg.alt || '');
      });
    }

    galleryRoot.querySelector('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
    dialog?.addEventListener('click', (e) => {
      if (e.target === dialog) closeLightbox();
    });
    dialog?.addEventListener('cancel', (e) => {
      e.preventDefault();
      closeLightbox();
    });
  }
});
