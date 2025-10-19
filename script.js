// Minimal, framework-free JS with Supabase integration.

// Global data cache
let DATA = [];

function el(tag, props = {}, children = []){
  const node = document.createElement(tag);
  Object.assign(node, props);
  for(const child of children){
    node.append(child);
  }
  return node;
}

function renderCard(item){
  const card = el('article', { className: 'card', tabIndex: 0, role: 'button', 'aria-pressed': 'false', 'aria-label': `${item.title}: mostra dettagli` });
  card.dataset.experienceId = item.id;
  const inner = el('div', { className: 'card-inner' });

  // Calculate availability
  const remaining = item.total_packages - item.packages_sold;
  const isSoldOut = remaining <= 0;

  const front = el('div', { className: 'card-face card-front' });
  const imageUrl = window.supabaseAPI ? window.supabaseAPI.getImageUrl(item.image_url) : item.image;
  const img = el('img', { src: imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', alt: item.title });
  const title = el('div', { className: 'title', textContent: item.title.toUpperCase() });
  front.append(img, title);

  const back = el('div', { className: 'card-face card-back' });

  // Create scrollable content wrapper
  const contentWrapper = el('div', { className: 'card-content' });
  contentWrapper.append(
    el('p', { textContent: item.description || item.summary })
  );

  // Show price if available
  const isBackHome = item.id === 'back-home';
  if (isBackHome) {
    const priceDiv = el('div', { className: 'price-info' });
    priceDiv.style.cssText = 'margin-top: 8px; padding: 8px; background: #f0f7f5; border-radius: 8px; font-size: 0.95rem; border-left: 4px solid var(--success);';
    priceDiv.innerHTML = `<strong style="color: var(--success);">Libera offerta</strong> — Contributo a tua discrezione`;
    contentWrapper.append(priceDiv);
  } else if (item.unit_price) {
    const priceDiv = el('div', { className: 'price-info' });
    priceDiv.style.cssText = 'margin-top: 8px; padding: 8px; background: #f0f7f5; border-radius: 8px; font-size: 0.95rem;';
    priceDiv.innerHTML = `<strong>Contributo suggerito:</strong> €${parseFloat(item.unit_price).toFixed(2)} per pacchetto`;
    contentWrapper.append(priceDiv);
  }

  // Show availability
  if (!isBackHome) {
    const availDiv = el('div', { className: 'availability-info' });
    availDiv.style.cssText = 'margin-top: 8px; font-size: 0.9rem; color: #567086;';
    if (isSoldOut) {
      availDiv.innerHTML = `<strong style="color: #d32f2f;">Esaurito</strong>`;
    } else if (remaining <= 3) {
      availDiv.innerHTML = `<strong style="color: #f57c00;">Solo ${remaining} disponibili</strong>`;
    } else {
      availDiv.textContent = `${remaining} di ${item.total_packages} disponibili`;
    }
    contentWrapper.append(availDiv);
  }

  back.append(
    el('h3', { textContent: item.title }),
    contentWrapper
  );

  const cta = el('button', { className: 'cta', disabled: isSoldOut, textContent: isSoldOut ? 'Esaurito' : 'Aggiungi al regalo' });
  cta.dataset.experienceId = item.id;
  if (!isSoldOut) {
    cta.style.opacity = '1';
    cta.style.cursor = 'pointer';
  }
  back.append(cta);

  inner.append(front, back);
  card.append(inner);

  // Flip interactions
  function toggleFlip(){
    const isNow = card.classList.toggle('is-flipped');
    card.setAttribute('aria-pressed', isNow ? 'true' : 'false');
  }
  card.addEventListener('click', (e)=>{
    // Allow selecting links/buttons on back without flipping again
    if(e.target.closest('button, a')) return;
    toggleFlip();
  });
  card.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      toggleFlip();
    }
  });
  return card;
}

async function initCarousel(){
  const track = document.querySelector('[data-track]');
  const prev = document.querySelector('[data-prev]');
  const next = document.querySelector('[data-next]');
  if(!track) return;

  // Show loading state
  track.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #567086;">Caricamento esperienze...</div>';

  // Fetch data from Supabase
  if (window.supabaseAPI) {
    try {
      DATA = await window.supabaseAPI.fetchExperiences();
      console.log('✅ Loaded experiences from Supabase:', DATA.length);
    } catch (error) {
      console.error('❌ Error loading experiences:', error);
      track.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #d32f2f;">Errore nel caricamento. Riprova più tardi.</div>';
      return;
    }
  }

  // Clear loading state
  track.innerHTML = '';

  // Render cards
  if (DATA.length === 0) {
    track.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #567086;">Nessuna esperienza disponibile al momento.</div>';
    return;
  }

  for(const item of DATA){
    track.append(renderCard(item));
  }

  // Navigation
  const cardWidth = () => track.querySelector('.card')?.clientWidth ?? 320;
  function scrollByDir(dir){
    track.scrollBy({ left: dir * (cardWidth() + 20), behavior: 'smooth' });
  }
  prev?.addEventListener('click', ()=> scrollByDir(-1));
  next?.addEventListener('click', ()=> scrollByDir(1));
}

// --- Simple session cart ---
const CART_KEY = 'gift_cart_v1';
const SESSION_KEY = 'gift_session_v1';

const cart = {
  // items as Set of ids
  _set: new Set(),
  load(){
    try{
      const raw = localStorage.getItem(CART_KEY);
      this._set = new Set(raw ? JSON.parse(raw) : []);
    }catch{ this._set = new Set(); }
  },
  save(){ localStorage.setItem(CART_KEY, JSON.stringify([...this._set])); },
  has(id){ return this._set.has(id); },
  add(id){ this._set.add(id); this.save(); },
  remove(id){ this._set.delete(id); this.save(); },
  clear(){ this._set.clear(); this.save(); },
  list(){ return DATA.filter(d=> this._set.has(d.id)); },
  count(){ return this._set.size; }
};

function updateCartBadge(){
  const badge = document.querySelector('[data-cart-count]');
  const fab = document.querySelector('.cart-fab');
  if(!badge || !fab) return;
  const n = cart.count();
  badge.textContent = String(n);
  fab.hidden = n === 0; // show only when something is in cart
}

function updateCartTotal(total, hasBackHome, hasPaidItems){
  const totalEl = document.querySelector('[data-cart-total]');
  const summaryEl = document.querySelector('.cart-total-summary');
  if(!totalEl || !summaryEl) return;

  // Handle different scenarios
  if (hasBackHome && !hasPaidItems) {
    // Only back-home (free package)
    summaryEl.style.display = 'none';
  } else if (hasBackHome && hasPaidItems) {
    // Mixed: back-home + paid items
    summaryEl.style.display = 'block';
    totalEl.textContent = `€${total.toFixed(2)}`;
    const hintEl = summaryEl.querySelector('.total-hint');
    if (hintEl) {
      hintEl.textContent = 'Importo suggerito per le esperienze. "Back Home" è a libera offerta.';
    }
  } else {
    // Only paid items
    summaryEl.style.display = 'block';
    totalEl.textContent = `€${total.toFixed(2)}`;
    const hintEl = summaryEl.querySelector('.total-hint');
    if (hintEl) {
      hintEl.textContent = 'Questo è un importo indicativo. Puoi contribuire con l\'importo che preferisci.';
    }
  }
}

function renderOrderSummary(items){
  const itemsContainer = document.querySelector('[data-order-items]');
  const totalEl = document.querySelector('[data-order-total]');
  const summarySection = document.querySelector('.order-summary');
  if(!itemsContainer || !totalEl || !summarySection) return;

  itemsContainer.innerHTML = '';
  let total = 0;
  let hasBackHome = false;
  let hasPaidItems = false;

  for(const item of items){
    const isBackHome = item.id === 'back-home';
    const unitPrice = parseFloat(item.unit_price || 0);

    if (isBackHome) {
      hasBackHome = true;
    } else if (unitPrice > 0) {
      hasPaidItems = true;
      total += unitPrice;
    }

    const row = document.createElement('div');
    row.style.cssText = 'display: flex; justify-content: space-between; align-items: start; padding: 8px 0; border-bottom: 1px solid #e0e0e0;';

    let priceDisplay = '';
    let priceColor = 'var(--brand)';
    if (isBackHome) {
      priceDisplay = 'Libera offerta';
      priceColor = 'var(--success)';
    } else if (unitPrice > 0) {
      priceDisplay = `€${unitPrice.toFixed(2)}`;
    } else {
      priceDisplay = 'Incluso';
      priceColor = 'var(--muted)';
    }

    row.innerHTML = `
      <div style="flex: 1;">
        <div style="font-weight: 700; color: var(--brand);">${item.title}</div>
        <div style="font-size: 0.85rem; color: var(--muted); margin-top: 2px;">1 pacchetto</div>
      </div>
      <div style="font-weight: 700; color: ${priceColor};">${priceDisplay}</div>
    `;
    itemsContainer.appendChild(row);
  }

  // Update total section based on what's in the order
  const totalRow = summarySection.querySelector('.total-row');
  const hintEl = summarySection.querySelector('.total-hint');

  if (hasBackHome && !hasPaidItems) {
    // Only back-home: hide total row, show special message
    if (totalRow) totalRow.style.display = 'none';
    if (hintEl) {
      hintEl.textContent = '"Back Home" è a libera offerta: contribuisci con l\'importo che desideri.';
      hintEl.style.fontWeight = '700';
    }
  } else if (hasBackHome && hasPaidItems) {
    // Mixed: show total for paid items only
    if (totalRow) totalRow.style.display = 'flex';
    totalEl.textContent = `€${total.toFixed(2)}`;
    if (hintEl) {
      hintEl.textContent = 'Importo suggerito per le esperienze con prezzo indicato. "Back Home" è a libera offerta.';
      hintEl.style.fontWeight = '400';
    }
  } else {
    // Only paid items
    if (totalRow) totalRow.style.display = 'flex';
    totalEl.textContent = `€${total.toFixed(2)}`;
    if (hintEl) {
      hintEl.textContent = 'Importo indicativo - puoi contribuire con l\'importo che preferisci.';
      hintEl.style.fontWeight = '400';
    }
  }
}

function renderCartList(){
  const list = document.querySelector('[data-cart-list]');
  const emptyMessage = document.querySelector('[data-empty-cart]');
  const summaryEl = document.querySelector('.cart-total-summary');
  const checkoutForm = document.querySelector('[data-checkout-form]');

  if(!list) return;
  list.innerHTML = '';

  const items = cart.list();
  const isEmpty = items.length === 0;

  // Show/hide empty message
  if (emptyMessage) {
    emptyMessage.hidden = !isEmpty;
  }

  // Show/hide cart list, summary, and form
  if (list) list.style.display = isEmpty ? 'none' : 'grid';
  if (summaryEl) summaryEl.style.display = isEmpty ? 'none' : 'block';
  if (checkoutForm) checkoutForm.style.display = isEmpty ? 'none' : 'block';

  // If empty, return early
  if (isEmpty) return;

  let total = 0;
  let hasBackHome = false;
  let hasPaidItems = false;

  for(const item of items){
    const li = document.createElement('li');
    li.className = 'cart-item';

    // Get image URL using Supabase helper
    const imageUrl = window.supabaseAPI
      ? window.supabaseAPI.getImageUrl(item.image_url)
      : (item.image || item.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200');

    const img = Object.assign(document.createElement('img'), { src: imageUrl, alt: item.title });
    const description = item.description || item.summary || '';
    const shortDesc = description.length > 80 ? description.substring(0, 80) + '...' : description;

    // Check if this is the back-home package (free package)
    const isBackHome = item.id === 'back-home';
    const unitPrice = parseFloat(item.unit_price || 0);

    if (isBackHome) {
      hasBackHome = true;
    } else if (unitPrice > 0) {
      hasPaidItems = true;
      total += unitPrice;
    }

    // Add price information
    let priceHtml = '';
    if (isBackHome) {
      priceHtml = `<div class="item-price" style="font-size: 0.95rem; font-weight: 700; color: var(--success); margin-top: 4px;">Libera offerta</div>`;
    } else if (unitPrice > 0) {
      priceHtml = `<div class="item-price" style="font-size: 0.95rem; font-weight: 700; color: var(--brand); margin-top: 4px;">€${unitPrice.toFixed(2)}</div>`;
    }

    const info = Object.assign(document.createElement('div'), { innerHTML: `<div class="title">${item.title}</div><div style="font-size: 0.9rem; color: var(--muted);">${shortDesc}</div>${priceHtml}` });
    const removeBtn = Object.assign(document.createElement('button'), { className:'remove', textContent:'Rimuovi' });
    removeBtn.setAttribute('data-id', item.id);
    li.append(img, info, removeBtn);
    list.append(li);
  }

  // Update total display
  updateCartTotal(total, hasBackHome, hasPaidItems);
}

function openCart(){
  renderCartList();
  const modal = document.getElementById('cart-dialog');
  if(modal){ modal.hidden = false; document.body.style.overflow = 'hidden'; }
}
function closeCart(){
  const modal = document.getElementById('cart-dialog');
  if(modal){ modal.hidden = true; document.body.style.overflow = ''; }
}

function generateSessionCode(){
  // Simple unique code: yymmdd-5char random base36
  const d = new Date();
  const yymmdd = `${String(d.getFullYear()).slice(-2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `${yymmdd}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
}

async function sendOrderEmails({ sessionCode, guestName, guestEmail, guestMessage, items }) {
  if (!window.supabaseAPI) {
    console.warn('⚠️ Supabase not available, skipping email send');
    return;
  }

  // Calculate total
  let total = 0;
  let hasBackHome = false;
  for (const item of items) {
    if (item.id === 'back-home') {
      hasBackHome = true;
    } else {
      total += parseFloat(item.unit_price || 0);
    }
  }

  // Prepare email data
  const emailData = {
    sessionCode,
    guestName,
    guestEmail: guestEmail || null,
    guestMessage,
    items: items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description || item.summary,
      unitPrice: parseFloat(item.unit_price || 0),
      isBackHome: item.id === 'back-home'
    })),
    total,
    hasBackHome
  };

  // Call Supabase Edge Function
  const { data, error } = await window.supabaseAPI.client.functions.invoke('send-order-emails', {
    body: emailData
  });

  if (error) {
    throw error;
  }

  return data;
}

function initCartUI(){
  cart.load();
  updateCartBadge();

  const fab = document.querySelector('.cart-fab');
  fab?.addEventListener('click', openCart);

  const modal = document.getElementById('cart-dialog');
  modal?.addEventListener('click', (e)=>{
    if(e.target.matches('[data-close-modal]')) closeCart();
  });

  // Remove item
  modal?.addEventListener('click', (e)=>{
    const btn = e.target.closest('.remove');
    if(!btn) return;
    const id = btn.getAttribute('data-id');
    cart.remove(id);
    renderCartList();
    updateCartBadge();
    refreshCTAStates();
  });

  // Checkout form
  const form = modal?.querySelector('[data-checkout-form]');
  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();

    // Prevent empty cart submission
    if(cart.count() === 0) {
      alert('Il carrello è vuoto. Aggiungi almeno un\'esperienza per completare il regalo.');
      return;
    }

    const fd = new FormData(form);
    const name = String(fd.get('name')||'').trim();
    const email = String(fd.get('email')||'').trim();
    const message = String(fd.get('message')||'').trim();
    if(!name){ form.querySelector('[name="name"]').focus(); return; }

    // Generate session code
    const sessionCode = generateSessionCode();

    // Show processing state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Elaborazione...';

    // Create order in Supabase
    if (window.supabaseAPI) {
      try {
        const items = cart.list().map(item => ({
          experienceId: item.id,
          packagesCount: 1
        }));

        const result = await window.supabaseAPI.createOrder({
          sessionCode,
          guestName: name,
          guestEmail: email,
          guestMessage: message,
          items
        });

        if (!result.success) {
          throw new Error(result.error || 'Errore durante la creazione dell\'ordine');
        }

        console.log('✅ Order created successfully:', result.orderId);

        // Store locally as backup
        const order = { code: sessionCode, at: Date.now(), items: cart.list().map(i=>i.id), name, email, message };
        localStorage.setItem(SESSION_KEY, JSON.stringify(order));

        // Get cart items before clearing (needed for email)
        const orderItems = cart.list();

        // Render order summary before clearing cart
        renderOrderSummary(orderItems);

        // Send emails (admin notification + guest confirmation if email provided)
        try {
          await sendOrderEmails({
            sessionCode,
            guestName: name,
            guestEmail: email,
            guestMessage: message,
            items: orderItems
          });
          console.log('✅ Emails sent successfully');
        } catch (emailError) {
          console.error('⚠️ Email sending failed:', emailError);
          // Don't fail the order if email fails
        }

        // Show confirmation view
        const viewCart = modal.querySelector('[data-cart-view]');
        const viewConfirm = modal.querySelector('[data-confirm-view]');
        const codeEl = modal.querySelector('[data-session-code]');
        const codeCausaleEl = modal.querySelector('[data-session-code-causale]');
        if(viewCart && viewConfirm && codeEl){
          viewCart.hidden = true;
          viewConfirm.hidden = false;
          codeEl.textContent = sessionCode;
          if (codeCausaleEl) codeCausaleEl.textContent = sessionCode;
        }

        // Clear cart and refresh UI
        cart.clear();
        updateCartBadge();

        // Reload experiences to update availability counts
        await refreshExperiencesData();

        refreshCTAStates();

      } catch (error) {
        console.error('❌ Error creating order:', error);
        alert('Errore durante il checkout. Riprova più tardi.\n\n' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    } else {
      // Fallback: No Supabase, use local storage only
      console.warn('⚠️ Supabase not available, using local storage only');
      const order = { code: sessionCode, at: Date.now(), items: cart.list().map(i=>i.id), name, email, message };
      localStorage.setItem(SESSION_KEY, JSON.stringify(order));

      // Get cart items before clearing
      const orderItems = cart.list();

      // Render order summary before clearing cart
      renderOrderSummary(orderItems);

      const viewCart = modal.querySelector('[data-cart-view]');
      const viewConfirm = modal.querySelector('[data-confirm-view]');
      const codeEl = modal.querySelector('[data-session-code]');
      const codeCausaleEl = modal.querySelector('[data-session-code-causale]');
      if(viewCart && viewConfirm && codeEl){
        viewCart.hidden = true;
        viewConfirm.hidden = false;
        codeEl.textContent = sessionCode;
        if (codeCausaleEl) codeCausaleEl.textContent = sessionCode;
      }

      cart.clear();
      updateCartBadge();
      refreshCTAStates();
    }

    // Reset button
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  });

  // Done button in confirmation
  modal?.querySelector('[data-done]')?.addEventListener('click', ()=>{
    // reset confirmation view for next time
    const viewCart = modal.querySelector('[data-cart-view]');
    const viewConfirm = modal.querySelector('[data-confirm-view]');
    if(viewCart && viewConfirm){
      viewCart.hidden = false;
      viewConfirm.hidden = true;
    }
    closeCart();
  });
}

async function refreshExperiencesData(){
  if (!window.supabaseAPI) return;
  try {
    DATA = await window.supabaseAPI.fetchExperiences();
    console.log('✅ Refreshed experiences data');
  } catch (error) {
    console.error('❌ Error refreshing experiences:', error);
  }
}

function refreshCTAStates(){
  document.querySelectorAll('.card').forEach(card => {
    const experienceId = card.dataset.experienceId;
    const btn = card.querySelector('.cta');
    if(!btn || !experienceId) return;

    // Check if in cart
    const added = cart.has(experienceId);

    // Check if sold out
    const experience = DATA.find(d => d.id === experienceId);
    const isSoldOut = experience && (experience.total_packages - experience.packages_sold) <= 0;

    if (isSoldOut) {
      btn.disabled = true;
      btn.textContent = 'Esaurito';
      btn.style.cursor = 'not-allowed';
    } else if (added) {
      btn.disabled = true;
      btn.textContent = 'Aggiunto ✔';
      btn.style.cursor = 'default';
    } else {
      btn.disabled = false;
      btn.textContent = 'Aggiungi al regalo';
      btn.style.cursor = 'pointer';
      btn.style.opacity = '1';
    }
  });
}

function enableAddToCartButtons(){
  // Enable CTAs on card backs and set initial state
  document.querySelectorAll('.card').forEach(card => {
    const experienceId = card.dataset.experienceId;
    const btn = card.querySelector('.cta');
    if(!btn || !experienceId) return;

    // Apply initial state
    refreshCTAStates();

    // Add click handler
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      if(cart.has(experienceId)) return;

      // Check availability before adding
      const experience = DATA.find(d => d.id === experienceId);
      if (experience && (experience.total_packages - experience.packages_sold) <= 0) {
        alert('Questa esperienza è esaurita.');
        return;
      }

      cart.add(experienceId);
      refreshCTAStates();
      updateCartBadge();

      // Animate cart FAB when item added
      const fab = document.querySelector('.cart-fab');
      if (fab) {
        fab.style.animation = 'none';
        setTimeout(() => {
          fab.style.animation = 'bounce 0.6s ease';
        }, 10);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', async ()=>{
  await initCarousel();
  initCartUI();
  enableAddToCartButtons();
});
