/***********************
 * CONFIG DEL NEGOCIO
 ***********************/
const RESTAURANT = {
    name: "La Olla Criolla",
    city: "Huacho",
    address: "Av. Primavera 245, Huacho",
    // ✅ Cambia esto por el número real (Perú: 51 + número). Ej: 51987654321
    whatsappNumber: "51933566289",
    // Horario: Lun(1) .. Dom(0)
    schedule: {
        1: {
            open: "12:00",
            close: "16:00"
        }, // Lunes
        2: {
            open: "12:00",
            close: "16:00"
        }, // Martes
        3: {
            open: "12:00",
            close: "16:00"
        }, // Miércoles
        4: {
            open: "12:00",
            close: "16:00"
        }, // Jueves
        5: {
            open: "12:00",
            close: "16:00"
        }, // Viernes
        6: {
            open: "12:00",
            close: "16:00"
        }, // Sábado
        0: null, // Domingo cerrado
    },
    mapsQueryUrl: "https://www.google.com/maps/search/?api=1&query=Av.%20Primavera%20245%20Huacho"
};

/***********************
 * DATA (JSON) - MENÚ
 ***********************/
const MENU_DATA = {
    menuDelDia: [{
            id: "md-001",
            name: "Menú Criollo Clásico",
            desc: "Sopa de casa + Seco de pollo con frejoles + Bebida (chicha o maracuyá).",
            price: 14.00,
            badge: "Menú",
        },
        {
            id: "md-002",
            name: "Menú Norteño",
            desc: "Sopa + Arroz con pato (porción del día) + Bebida.",
            price: 16.00,
            badge: "Menú",
        },
        {
            id: "md-003",
            name: "Menú Ligero",
            desc: "Sopa + Pollo a la plancha con ensalada + Bebida.",
            price: 13.00,
            badge: "Menú",
        },
        {
            id: "md-004",
            name: "Menú Marino",
            desc: "Sopa + Pescado frito con arroz + Bebida.",
            price: 15.00,
            badge: "Menú",
        },
    ],
    topDishes: [{
            id: "pd-101",
            name: "Lomo Saltado",
            desc: "Clásico lomo con papas, arroz y su toque criollo.",
            price: 22.00,
            badge: "⭐ Popular",
        },
        {
            id: "pd-102",
            name: "Ají de Gallina",
            desc: "Cremoso y suave, con arroz y papa sancochada.",
            price: 18.00,
            badge: "Casero",
        },
        {
            id: "pd-103",
            name: "Tallarín Saltado",
            desc: "Tallarines con verduras y carne al wok.",
            price: 20.00,
            badge: "Rápido",
        },
        {
            id: "pd-104",
            name: "Chaufa de Pollo",
            desc: "Arroz chaufa con pollo, huevo y cebolla china.",
            price: 17.00,
            badge: "Top",
        },
    ],
};

/***********************
 * UTILIDADES
 ***********************/
const money = (n) => `S/ ${Number(n).toFixed(2)}`;

function qs(sel, root = document) {
    return root.querySelector(sel);
}

function qsa(sel, root = document) {
    return [...root.querySelectorAll(sel)];
}

function parseTimeToMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

function getTodaySchedule() {
    const day = new Date().getDay();
    return RESTAURANT.schedule[day]; // null => cerrado
}

function isOpenNow() {
    const sched = getTodaySchedule();
    if (!sched) return {
        open: false,
        msg: "Hoy estamos cerrados. Atendemos de lunes a sábado."
    };

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const openMin = parseTimeToMinutes(sched.open);
    const closeMin = parseTimeToMinutes(sched.close);

    const open = nowMin >= openMin && nowMin < closeMin;
    if (open) {
        const minsLeft = closeMin - nowMin;
        const h = Math.floor(minsLeft / 60);
        const m = minsLeft % 60;
        const leftStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
        return {
            open: true,
            msg: `🟢 Abierto ahora • Cerramos en ${leftStr}.`
        };
    } else {
        return {
            open: false,
            msg: `🔴 Cerrado ahora • Abrimos hoy de ${sched.open} a ${sched.close}.`
        };
    }
}

/***********************
 * RENDER DE CARDS
 ***********************/
function renderProductCard(product, targetEl) {
    const el = document.createElement("article");
    el.className = "cardProd";
    el.innerHTML = `
      <div class="cardProd__img">
        <div class="cardProd__badge">${product.badge ?? "Plato"}</div>
      </div>
      <div class="cardProd__body">
        <h3 class="cardProd__title">${product.name}</h3>
        <p class="cardProd__desc">${product.desc}</p>
        <div class="cardProd__row">
          <div>
            <div class="price">${money(product.price)}</div>
            <div class="small">Disponible hoy</div>
          </div>
          <button class="btn btn--primary" data-add="${product.id}" type="button">Agregar</button>
        </div>
      </div>
    `;
    targetEl.appendChild(el);
}

/***********************
 * CARRITO (LocalStorage)
 ***********************/
const CART_KEY = "olla_criolla_cart_v1";
const NOTES_KEY = "olla_criolla_notes_v1";
const DELIVERY_KEY = "olla_criolla_delivery_v1";
const ADDRESS_KEY = "olla_criolla_address_v1";

function loadCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) ? ? {};
    } catch {
        return {};
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getProductById(id) {
    const all = [...MENU_DATA.menuDelDia, ...MENU_DATA.topDishes];
    return all.find(p => p.id === id);
}

function cartCount(cart) {
    return Object.values(cart).reduce((acc, qty) => acc + qty, 0);
}

function cartTotal(cart) {
    return Object.entries(cart).reduce((acc, [id, qty]) => {
        const p = getProductById(id);
        return acc + (p ? p.price * qty : 0);
    }, 0);
}

function addToCart(id) {
    const cart = loadCart();
    cart[id] = (cart[id] ? ? 0) + 1;
    saveCart(cart);
    refreshCartUI();
}

function decFromCart(id) {
    const cart = loadCart();
    if (!cart[id]) return;
    cart[id] -= 1;
    if (cart[id] <= 0) delete cart[id];
    saveCart(cart);
    refreshCartUI();
}

function removeFromCart(id) {
    const cart = loadCart();
    delete cart[id];
    saveCart(cart);
    refreshCartUI();
}

/***********************
 * DRAWER UI
 ***********************/
const drawer = () => qs("#cartDrawer");
const drawerBackdrop = () => qs("#drawerBackdrop");
const btnCloseCart = () => qs("#btnCloseCart");
const btnCheckout = () => qs("#btnCheckout");
const cartList = () => qs("#cartList");
const cartEmpty = () => qs("#cartEmpty");
const cartTotalEl = () => qs("#cartTotal");
const cartCountEl = () => qs("#cartCount");
const drawerSub = () => qs("#drawerSub");

const notesField = () => qs("#notesField");
const orderNotes = () => qs("#orderNotes");
const deliveryField = () => qs("#deliveryField");
const addressBox = () => qs("#addressBox");
const addressInput = () => qs("#address");

function openDrawer() {
    drawer().classList.add("is-open");
    drawer().setAttribute("aria-hidden", "false");
}

function closeDrawer() {
    drawer().classList.remove("is-open");
    drawer().setAttribute("aria-hidden", "true");
}

function renderCartItems() {
    const cart = loadCart();
    const entries = Object.entries(cart);

    const count = cartCount(cart);
    cartCountEl().textContent = count;

    drawerSub().textContent = count === 0 ? "Agrega algo rico 😄" : `${count} item(s) en tu pedido`;

    const total = cartTotal(cart);
    cartTotalEl().textContent = money(total);

    if (entries.length === 0) {
        cartEmpty().hidden = false;
        cartList().hidden = true;
        notesField().hidden = true;
        deliveryField().hidden = true;
        return;
    }

    cartEmpty().hidden = true;
    cartList().hidden = false;
    notesField().hidden = false;
    deliveryField().hidden = false;

    cartList().innerHTML = entries.map(([id, qty]) => {
        const p = getProductById(id);
        if (!p) return "";
        return `
        <div class="cartItem">
          <div class="cartItem__img" aria-hidden="true"></div>
          <div class="cartItem__mid">
            <div class="cartItem__name">${p.name}</div>
            <div class="cartItem__meta">${money(p.price)} • Subtotal: <strong>${money(p.price * qty)}</strong></div>
          </div>
          <div class="cartItem__actions">
            <div class="qty" aria-label="Cantidad">
              <button type="button" data-dec="${id}" aria-label="Disminuir">−</button>
              <span>${qty}</span>
              <button type="button" data-inc="${id}" aria-label="Aumentar">+</button>
            </div>
            <button class="linkDanger" type="button" data-rem="${id}">Eliminar</button>
          </div>
        </div>
      `;
    }).join("");

    // restaurar campos
    orderNotes().value = localStorage.getItem(NOTES_KEY) ? ? "";
    addressInput().value = localStorage.getItem(ADDRESS_KEY) ? ? "";

    // delivery mode
    const deliveryMode = localStorage.getItem(DELIVERY_KEY) ? ? "recojo";
    setDeliveryMode(deliveryMode);
}

function refreshCartUI() {
    renderCartItems();
    updateWhatsLinks(); // actualiza links "Pedir por WhatsApp" con o sin carrito
}

/***********************
 * DELIVERY MODE
 ***********************/
function setDeliveryMode(mode) {
    localStorage.setItem(DELIVERY_KEY, mode);

    const buttons = qsa(".segBtn");
    buttons.forEach(b => b.classList.toggle("segBtn--active", b.dataset.delivery === mode));

    if (mode === "delivery") {
        addressBox().hidden = false;
    } else {
        addressBox().hidden = true;
        // No borramos dirección, solo ocultamos.
    }
}

/***********************
 * WHATSAPP MESSAGE
 ***********************/
function buildWhatsAppMessage() {
    const cart = loadCart();
    const entries = Object.entries(cart);
    const total = cartTotal(cart);

    const now = new Date();
    const dateStr = now.toLocaleString("es-PE", {
        dateStyle: "medium",
        timeStyle: "short"
    });

    const deliveryMode = localStorage.getItem(DELIVERY_KEY) ? ? "recojo";
    const notes = (localStorage.getItem(NOTES_KEY) ? ? "").trim();
    const address = (localStorage.getItem(ADDRESS_KEY) ? ? "").trim();

    let lines = [];
    lines.push(`Hola 👋, quiero hacer un pedido en *${RESTAURANT.name}*`);
    lines.push(`🗓 ${dateStr}`);
    lines.push("");
    lines.push("*Pedido:*");

    if (entries.length === 0) {
        lines.push("- (Aún no agregué productos, quisiera consultar el menú del día)");
    } else {
        for (const [id, qty] of entries) {
            const p = getProductById(id);
            if (!p) continue;
            lines.push(`- ${qty}x ${p.name} — ${money(p.price * qty)}`);
        }
        lines.push("");
        lines.push(`*Total estimado:* ${money(total)}`);
    }

    lines.push("");
    lines.push(`*Entrega:* ${deliveryMode === "delivery" ? "🚴 Delivery" : "🏃 Recojo en local"}`);

    if (deliveryMode === "delivery") {
        lines.push(`*Dirección:* ${address || "(por definir)"} `);
    }

    if (notes) {
        lines.push(`*Indicaciones:* ${notes}`);
    }

    lines.push("");
    lines.push("¿Me confirmas disponibilidad y tiempo aprox? 🙌");

    return lines.join("\n");
}

function getWhatsAppUrl() {
    const msg = buildWhatsAppMessage();
    const encoded = encodeURIComponent(msg);
    return `https://wa.me/${RESTAURANT.whatsappNumber}?text=${encoded}`;
}

function updateWhatsLinks() {
    const url = getWhatsAppUrl();

    const ids = ["btnWhatsHero", "btnWhatsCTA", "fabWhatsapp", "btnWhatsMobile"];
    ids.forEach(id => {
        const el = qs(`#${id}`);
        if (el) el.href = url;
    });

    // Footer phone
    const footerPhone = qs("#footerPhone");
    if (footerPhone) footerPhone.textContent = `+${RESTAURANT.whatsappNumber}`;
}

/***********************
 * UI: HORARIO / ESTADO
 ***********************/
function renderScheduleUI() {
    const badge = qs("#openBadge");
    const todayHours = qs("#todayHours");
    const statusLine = qs("#statusLine");
    const hoursCompact = qs("#hoursCompact");
    const hoursLong = qs("#hoursLong");

    const sched = getTodaySchedule();
    const textHours = sched ? `Hoy: ${sched.open}–${sched.close}` : "Hoy: Cerrado";

    todayHours.textContent = `Horario: ${textHours}`;
    hoursCompact.textContent = sched ? `${sched.open}–${sched.close}` : "Cerrado";
    hoursLong.textContent = "Lun–Sáb: 12:00–16:00";

    const st = isOpenNow();
    statusLine.textContent = st.msg;

    if (st.open) {
        badge.textContent = "🟢 Abierto ahora";
        badge.classList.remove("badge--closed");
        badge.classList.add("badge--open");
    } else {
        badge.textContent = "🔴 Cerrado";
        badge.classList.remove("badge--open");
        badge.classList.add("badge--closed");
    }

    // Botón "Cómo llegar"
    const howToGo = qs("#btnHowToGo");
    if (howToGo) howToGo.href = RESTAURANT.mapsQueryUrl;
}

/***********************
 * NAV MÓVIL
 ***********************/
function setupMobileNav() {
    const btn = qs("#btnHamburger");
    const mobileNav = qs("#mobileNav");
    if (!btn || !mobileNav) return;

    btn.addEventListener("click", () => {
        const isHidden = mobileNav.hasAttribute("hidden");
        if (isHidden) mobileNav.removeAttribute("hidden");
        else mobileNav.setAttribute("hidden", "");
    });

    // cerrar al click en link
    qsa("#mobileNav a").forEach(a => a.addEventListener("click", () => {
        mobileNav.setAttribute("hidden", "");
    }));
}

/***********************
 * EVENTOS
 ***********************/
function setupEvents() {
    // Agregar al carrito (delegación)
    document.addEventListener("click", (e) => {
        const add = e.target.closest("[data-add]");
        if (add) {
            addToCart(add.dataset.add);
            return;
        }

        const inc = e.target.closest("[data-inc]");
        if (inc) {
            addToCart(inc.dataset.inc);
            return;
        }

        const dec = e.target.closest("[data-dec]");
        if (dec) {
            decFromCart(dec.dataset.dec);
            return;
        }

        const rem = e.target.closest("[data-rem]");
        if (rem) {
            removeFromCart(rem.dataset.rem);
            return;
        }

        const openCart = e.target.closest("#btnOpenCart, #btnOpenCartHero, #btnOpenCartCTA, #btnOpenCartMobile");
        if (openCart) {
            openDrawer();
            return;
        }
    });

    // Drawer close
    drawerBackdrop().addEventListener("click", closeDrawer);
    btnCloseCart().addEventListener("click", closeDrawer);

    // Notas y dirección persistentes
    orderNotes().addEventListener("input", () => {
        localStorage.setItem(NOTES_KEY, orderNotes().value);
        updateWhatsLinks();
    });

    addressInput().addEventListener("input", () => {
        localStorage.setItem(ADDRESS_KEY, addressInput().value);
        updateWhatsLinks();
    });

    // Segmented delivery
    qsa(".segBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            setDeliveryMode(btn.dataset.delivery);
            updateWhatsLinks();
        });
    });

    // Checkout WhatsApp
    btnCheckout().addEventListener("click", () => {
        window.open(getWhatsAppUrl(), "_blank", "noopener");
    });
}

/***********************
 * INIT
 ***********************/
function init() {
    // Año footer
    qs("#year").textContent = new Date().getFullYear();

    // Render data
    const menuDiaGrid = qs("#menuDiaGrid");
    const topGrid = qs("#topDishesGrid");

    MENU_DATA.menuDelDia.forEach(p => renderProductCard(p, menuDiaGrid));
    MENU_DATA.topDishes.forEach(p => renderProductCard(p, topGrid));

    // Horario / estado
    renderScheduleUI();

    // WhatsApp links
    updateWhatsLinks();

    // Drawer initial UI
    refreshCartUI();

    // Mobile nav
    setupMobileNav();

    // Events
    setupEvents();

    // Re-render estado cada minuto (por si justo cambia de abierto/cerrado)
    setInterval(renderScheduleUI, 60 * 1000);
}

document.addEventListener("DOMContentLoaded", init);