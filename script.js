// Default products used as fallback when server is not running
let PRODUCTS = [
  {id:1, name:'Classic Latte',     cat:'coffee',    tag:'popular', price:2.75, desc:'Smooth espresso with steamed milk.',      img:'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=700&q=85'},
  {id:2, name:'Iced Americano',    cat:'coffee',               price:2.25, desc:'Bold espresso over ice and cold water.',   img:'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=85'},
  {id:3, name:'Caramel Macchiato', cat:'signature', tag:'new',  price:3.50, desc:'Espresso, milk, vanilla and caramel.',    img:'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=85'},
  {id:4, name:'Mocha Frappe',      cat:'signature',            price:3.95, desc:'Chocolate coffee blend with cream.',       img:'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=700&q=85'},
  {id:5, name:'Butter Croissant',  cat:'bakery',    tag:'fresh',price:1.75, desc:'Flaky, warm, buttery pastry.',            img:'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=85'},
  {id:6, name:'Cinnamon Roll',     cat:'bakery',               price:2.25, desc:'Soft roll with cinnamon glaze.',           img:'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=700&q=85'},
  {id:7, name:'Matcha Latte',      cat:'signature', tag:'new',  price:3.25, desc:'Creamy Japanese matcha with milk.',       img:'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=700&q=85'},
  {id:8, name:'Espresso Shot',     cat:'coffee',               price:1.80, desc:'Rich, strong, and aromatic.',             img:'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=700&q=85'}
];

// Load live products from server (overwrites defaults if server is running)
fetch('/api/products')
  .then(r => r.ok ? r.json() : null)
  .then(data => { if (data && data.length) { PRODUCTS = data; renderGrid(); } })
  .catch(() => {});

const money = n => '$' + n.toFixed(2);
const cart = [];

// Read ?cat= param so menu.html?cat=coffee pre-selects the right filter
const urlParams = new URLSearchParams(window.location.search);
let currentFilter = urlParams.get('cat') || 'all';

// ── Menu grid (menu.html only) ───────────────────────────────────────────────
const grid = document.getElementById('grid');

function renderGrid() {
  if (!grid) return;
  const list = PRODUCTS.filter(p => currentFilter === 'all' || p.cat === currentFilter);
  grid.innerHTML = list.map(p => `
    <article class="card">
      <div class="card__img">
        ${p.tag ? `<span class="badge">${p.tag}</span>` : ''}
        <img src="${p.img}" alt="${p.name}">
        <button class="add" data-id="${p.id}">Add to cart</button>
      </div>
      <div class="card__body">
        <div class="card__name">${p.name}</div>
        <div class="card__desc">${p.desc}</div>
        <div class="price">${money(p.price)}</div>
      </div>
    </article>
  `).join('');
}

function syncFilterButtons() {
  document.querySelectorAll('#filters button').forEach(b =>
    b.classList.toggle('active', b.dataset.filter === currentFilter)
  );
}

if (grid) {
  renderGrid();
  syncFilterButtons();

  document.getElementById('filters')?.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    currentFilter = b.dataset.filter;
    syncFilterButtons();
    renderGrid();
  });

  grid.addEventListener('click', e => {
    const b = e.target.closest('.add');
    if (!b) return;
    addToCart(+b.dataset.id);
    toast('Added to cart');
  });
}

// ── Cart ─────────────────────────────────────────────────────────────────────
function addToCart(id) {
  const f = cart.find(i => i.id === id);
  if (f) f.qty++;
  else cart.push({ id, qty: 1 });
  renderCart();
}

function renderCart() {
  const wrap = document.getElementById('cartItems');
  if (!wrap) return;

  if (!cart.length) {
    wrap.innerHTML = '<div class="empty">Your cart is empty.</div>';
  } else {
    wrap.innerHTML = cart.map((it, i) => {
      const p = PRODUCTS.find(x => x.id === it.id);
      return `
        <div class="citem">
          <img src="${p.img}" alt="${p.name}">
          <div class="citem__body">
            <div class="citem__name">${p.name}</div>
            <div class="citem__meta">${money(p.price)} each</div>
            <div class="qty">
              <button data-act="dec" data-i="${i}">−</button>
              <span>${it.qty}</span>
              <button data-act="inc" data-i="${i}">+</button>
            </div>
            <button class="remove" data-act="rm" data-i="${i}">Remove</button>
          </div>
          <b>${money(p.price * it.qty)}</b>
        </div>
      `;
    }).join('');
  }

  const total = cart.reduce((s, it) => s + PRODUCTS.find(p => p.id === it.id).price * it.qty, 0);
  const count = cart.reduce((s, it) => s + it.qty, 0);
  document.getElementById('cartTotal') && (document.getElementById('cartTotal').textContent = money(total));
  document.getElementById('cartCount') && (document.getElementById('cartCount').textContent = count);
}

document.getElementById('cartItems')?.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  const i = +b.dataset.i;
  if (b.dataset.act === 'inc') cart[i].qty++;
  if (b.dataset.act === 'dec') cart[i].qty = Math.max(1, cart[i].qty - 1);
  if (b.dataset.act === 'rm') cart.splice(i, 1);
  renderCart();
});

const drawer  = document.getElementById('drawer');
const overlay = document.getElementById('overlay');

function openCart()  { drawer?.classList.add('open');    overlay?.classList.add('open'); }
function closeCart() { drawer?.classList.remove('open'); overlay?.classList.remove('open'); }

document.getElementById('openCart')?.addEventListener('click', openCart);
document.getElementById('closeCart')?.addEventListener('click', closeCart);
overlay?.addEventListener('click', closeCart);
document.getElementById('checkout')?.addEventListener('click', openCheckoutModal);

// ── Checkout modal ────────────────────────────────────────────────────────────
const coOverlay = document.getElementById('coOverlay');

function openCheckoutModal() {
  if (!cart.length) return toast('Your cart is empty');
  if (!coOverlay) return;

  const total = cart.reduce((s, it) => {
    const p = PRODUCTS.find(x => x.id === it.id);
    return s + (p ? p.price * it.qty : 0);
  }, 0);

  document.getElementById('coSummary').innerHTML =
    cart.map(it => {
      const p = PRODUCTS.find(x => x.id === it.id);
      if (!p) return '';
      return `<div class="co-item">
        <span><span class="co-item__name">${p.name}</span><span class="co-item__qty">×${it.qty}</span></span>
        <span>${money(p.price * it.qty)}</span>
      </div>`;
    }).join('');

  document.getElementById('coTotal').textContent = money(total);
  document.getElementById('coStep1').style.display = 'block';
  document.getElementById('coStep2').style.display = 'none';
  document.getElementById('coName').value = '';
  document.getElementById('coPhone').value = '';
  document.getElementById('coEmail').value = '';
  document.getElementById('coAddress').value = '';
  coOverlay.classList.add('open');
}

function closeCheckoutModal() {
  coOverlay?.classList.remove('open');
}

document.getElementById('coClose')?.addEventListener('click', closeCheckoutModal);
coOverlay?.addEventListener('click', e => { if (e.target === coOverlay) closeCheckoutModal(); });

document.getElementById('coPlace')?.addEventListener('click', () => {
  const name    = document.getElementById('coName')?.value.trim();
  const phone   = document.getElementById('coPhone')?.value.trim();
  const email   = document.getElementById('coEmail')?.value.trim();
  const address = document.getElementById('coAddress')?.value.trim();

  if (!name)                         return toast('Please enter your name');
  if (!phone)                        return toast('Please enter your phone number');
  if (!email || !email.includes('@')) return toast('Please enter a valid email');
  if (!address)                      return toast('Please enter your delivery address');

  const orderId = '#KR-' + Math.floor(Math.random() * 90000 + 10000);
  const total   = cart.reduce((s, it) => {
    const p = PRODUCTS.find(x => x.id === it.id);
    return s + (p ? p.price * it.qty : 0);
  }, 0);

  const order = {
    id: orderId, name, phone, email, address,
    items: cart.map(it => ({ id: it.id, qty: it.qty })),
    total, status: 'pending', time: new Date().toISOString()
  };

  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  }).catch(() => {});

  const step1 = document.getElementById('coStep1');
  const step2 = document.getElementById('coStep2');
  if (step1) step1.style.display = 'none';
  if (step2) step2.style.display = 'block';
  const nameEl = document.getElementById('coNameDisplay');
  const numEl  = document.getElementById('coOrderNum');
  if (nameEl) nameEl.textContent = name;
  if (numEl)  numEl.textContent  = orderId;

  cart.length = 0;
  renderCart();
});

document.getElementById('coDone')?.addEventListener('click', () => {
  closeCheckoutModal();
  closeCart();
});

// ── Search ────────────────────────────────────────────────────────────────────
const searchOverlay = document.getElementById('searchOverlay');
const searchInput   = document.getElementById('searchInput');

function openSearch() {
  searchOverlay?.classList.add('open');
  setTimeout(() => searchInput?.focus(), 40);
  renderSearch('');
}

function closeSearch() {
  searchOverlay?.classList.remove('open');
  if (searchInput) searchInput.value = '';
}

function renderSearch(query) {
  const results = document.getElementById('searchResults');
  if (!results) return;
  const q = query.trim().toLowerCase();
  const list = q
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.cat.toLowerCase().includes(q)
      )
    : PRODUCTS;

  if (!list.length) {
    results.innerHTML = `<div class="search-empty">No results for "<strong>${query}</strong>"</div>`;
    return;
  }

  const hint = q ? '' : '<div class="search-hint">All items</div>';
  results.innerHTML = hint + list.map(p => `
    <div class="search-item">
      <img src="${p.img}" alt="${p.name}">
      <div class="search-item__info">
        <div class="search-item__name">${p.name}</div>
        <div class="search-item__desc">${p.desc}</div>
        <div class="search-item__price">${money(p.price)}</div>
      </div>
      <button class="search-item__add" data-id="${p.id}">Add</button>
    </div>
  `).join('');
}

document.getElementById('openSearch')?.addEventListener('click', openSearch);
document.getElementById('closeSearch')?.addEventListener('click', closeSearch);
searchOverlay?.addEventListener('click', e => { if (e.target === searchOverlay) closeSearch(); });
searchInput?.addEventListener('input', e => renderSearch(e.target.value));
document.getElementById('searchResults')?.addEventListener('click', e => {
  const btn = e.target.closest('.search-item__add');
  if (!btn) return;
  addToCart(+btn.dataset.id);
  toast('Added to cart');
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });

// ── Mobile nav ───────────────────────────────────────────────────────────────
const mobNav = document.getElementById('mobNav');
document.getElementById('menuToggle')?.addEventListener('click', () => mobNav?.classList.add('open'));
document.getElementById('mobNavClose')?.addEventListener('click', () => mobNav?.classList.remove('open'));
mobNav?.addEventListener('click', e => { if (e.target === mobNav) mobNav.classList.remove('open'); });

// ── Newsletter ────────────────────────────────────────────────────────────────
document.getElementById('newsBtn')?.addEventListener('click', () => {
  const input = document.getElementById('newsEmail');
  if (!input.value.trim().includes('@')) return toast('Enter a valid email');
  input.value = '';
  toast('Thank you for joining!');
});

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

renderCart();
