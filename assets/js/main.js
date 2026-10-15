(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* header shadow */
  const header = $('[data-header]');
  const onScroll = () => header && header.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* hamburger */
  const menuBtn = $('[data-menu]');
  const gnav = $('#gnav');
  const setMenu = (open) => {
    if (!menuBtn) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('.sr-only').textContent = open ? 'メニューを閉じる' : 'メニューを開く';
    gnav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  gnav?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width: 1100px)').addEventListener('change', () => setMenu(false));

  /* toast */
  const toast = document.createElement('div');
  toast.className = 'toast'; toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg; toast.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('is-on'), 3200);
  };

  /* デモでリンク先が未確定のもの（既存の教材ページ・LINE 友だち追加・指定の YouTube 動画） */
  $$('[data-pending]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    showToast(a.dataset.pending || '制作サンプルのため、リンク先は確定後に設定します。');
  }));

  /* design notes: URL に ?notes が付いているときだけ、メモと切り替えボタンを出す */
  /* 複数ページなので、?notes で開いているあいだはサイト内リンクにも ?notes を引き継ぐ */
  const toggle = $('[data-note-toggle]');
  if (toggle && new URLSearchParams(location.search).has('notes')) {
    const setNotes = (on) => {
      document.body.classList.toggle('show-notes', on);
      toggle.setAttribute('aria-pressed', String(on));
      toggle.lastChild.textContent = on ? '制作メモを隠す' : '制作メモを表示';
    };
    toggle.hidden = false;
    setNotes(true);
    toggle.addEventListener('click', () => setNotes(!document.body.classList.contains('show-notes')));
    $$('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href || /^(https?:|mailto:|tel:|#)/.test(href)) return;
      const [path, hash] = href.split('#');
      a.setAttribute('href', path + (path.includes('?') ? '&' : '?') + 'notes' + (hash ? '#' + hash : ''));
    });
    const form = $('[data-demo-form]');
    if (form) form.dataset.notes = '1';
  }

  /* 体験入園フォーム: ワクチン接種回数が足りないときは、その場で案内する */
  const vac = $('[data-vaccine]');
  const vacWarn = $('[data-vaccine-warn]');
  if (vac && vacWarn) {
    const sync = () => vacWarn.classList.toggle('is-on', vac.value === '0' || vac.value === '1');
    vac.addEventListener('change', sync); sync();
  }

  /* demo form: 入力内容はどこにも送らず、送信完了画面へ */
  $('[data-demo-form]')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    if (vac && (vac.value === '0' || vac.value === '1')) {
      vac.focus(); showToast('体験入園はワクチン2回目の接種後からご利用いただけます。');
      return;
    }
    location.href = 'thanks' + (f.dataset.notes ? '?notes' : '');
  });

  /* 体験入園フォームが画面にあるあいだ・ヒーローの CTA が見えているあいだは、下部固定 CTA を隠す */
  const spCta = $('.sp-cta');
  const watch = $$('[data-hide-spcta]');
  if (spCta && watch.length && 'IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)));
      spCta.classList.toggle('is-hidden', seen.size > 0);
    }, { threshold: 0.05 });
    watch.forEach((el) => io.observe(el));
  }

  /* reveal on scroll */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('js');
    const targets = $$('.head, .duo-card, .line-box, .media, .step, .qa, .point, .learn__item, .feature-list li, .post-card, .price-card, .staff__card, .gallery figure');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    targets.forEach((el, i) => {
      if (el.getBoundingClientRect().top < innerHeight) return;
      el.classList.add('rv');
      el.style.transitionDelay = `${(i % 3) * 70}ms`;
      io.observe(el);
    });
  }
})();
