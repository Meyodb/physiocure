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

  const packWrap = document.querySelector('[data-product-pack-form]');
  if (packWrap) {
    const hiddenId = packWrap.querySelector('[data-variant-input]');
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
      const buyNowBtn = packWrap.querySelector('[data-buy-now]');
      if (buyNowBtn) {
        buyNowBtn.disabled = !available;
      }
      packWrap.querySelectorAll('[data-pack-card]').forEach((card) => {
        const input = card.querySelector('[data-pack-qty-radio], [data-pack-variant-radio]');
        card.classList.toggle('is-selected', Boolean(input && input.checked));
      });
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

  const mainProduct = document.querySelector('#MainProduct[data-cart-add-url]');
  if (mainProduct) {
    const cartAddUrl = mainProduct.getAttribute('data-cart-add-url') || '/cart/add.js';
    const cartClearUrl = cartAddUrl.replace('add.js', 'clear.js');
    let checkoutRoot = mainProduct.getAttribute('data-shop-checkout-root') || '/';
    if (checkoutRoot === '/') checkoutRoot = '';
    else checkoutRoot = checkoutRoot.replace(/\/$/, '');
    const checkoutUrl = checkoutRoot ? `${checkoutRoot}/checkout` : '/checkout';
    const loadingLabel = mainProduct.getAttribute('data-buy-now-loading') || '…';
    const errorLabel = mainProduct.getAttribute('data-buy-now-error') || 'Error';

    mainProduct.querySelectorAll('[data-buy-now]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (btn.disabled) return;
        const form = btn.closest('form');
        if (!form) return;
        const idEl = form.querySelector('[name="id"]');
        const qtyEl = form.querySelector('[name="quantity"]');
        const id = idEl ? parseInt(idEl.value, 10) : NaN;
        const qtyRaw = qtyEl ? parseInt(qtyEl.value, 10) : 1;
        const qty = Number.isFinite(qtyRaw) && qtyRaw >= 1 ? qtyRaw : 1;
        if (!Number.isFinite(id) || id < 1) return;

        const origText = btn.textContent;
        btn.disabled = true;
        btn.textContent = loadingLabel;
        try {
          const clearRes = await fetch(cartClearUrl, {
            method: 'POST',
            headers: { Accept: 'application/json' },
          });
          if (!clearRes.ok) {
            throw new Error(errorLabel);
          }

          const res = await fetch(cartAddUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ items: [{ id, quantity: qty }] }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            const msg =
              (data && (data.description || data.message)) ||
              (typeof data === 'string' ? data : '') ||
              errorLabel;
            throw new Error(msg);
          }
          window.location.href = checkoutUrl;
        } catch (e) {
          btn.disabled = false;
          btn.textContent = origText;
          window.alert(typeof e.message === 'string' ? e.message : errorLabel);
        }
      });
    });
  }

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
