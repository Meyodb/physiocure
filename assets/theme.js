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
      item.setAttribute('data-open', open ? 'false' : 'true');
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
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
});
