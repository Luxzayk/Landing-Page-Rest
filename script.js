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
            image: "images/menu-criollo-clasico.jpg"
        },
        {
            id: "md-002",
            name: "Menú Norteño",
            desc: "Sopa + Arroz con pato (porción del día) + Bebida.",
            price: 16.00,
            badge: "Menú",
            image: "images/arroz-con-pato.jpg"
        },
        {
            id: "md-003",
            name: "Menú Ligero",
            desc: "Sopa + Pollo a la plancha con ensalada + Bebida.",
            price: 13.00,
            badge: "Menú",
            image: "images/menu-ligero.jpg"
        },
        {
            id: "md-004",
            name: "Menú Marino",
            desc: "Sopa + Pescado frito con arroz + Bebida.",
            price: 15.00,
            badge: "Menú",
            image: "images/pescado-frito.jpg"
        },
    ],
    topDishes: [{
            id: "pd-101",
            name: "Lomo Saltado",
            desc: "Clásico lomo con papas, arroz y su toque criollo.",
            price: 22.00,
            badge: "⭐ Popular",
            image: "images/lomo-saltado.jpg"
        },
        {
            id: "pd-102",
            name: "Ají de Gallina",
            desc: "Cremoso y suave, con arroz y papa sancochada.",
            price: 18.00,
            badge: "Casero",
            image: "images/aji-de-gallina.jpg"
        },
        {
            id: "pd-103",
            name: "Tallarín Saltado",
            desc: "Tallarines con verduras y carne al wok.",
            price: 20.00,
            badge: "Rápido",
            image: "images/tallarin-saltado.jpg"
        },
        {
            id: "pd-104",
            name: "Chaufa de Pollo",
            desc: "Arroz chaufa con pollo, huevo y cebolla china.",
            price: 17.00,
            badge: "Top",
            image: "images/arroz-chaufa.jpg"
        },
    ],
};

/***********************
 * UTILIDADES
 ***********************/
const money = (n) => `S/ ${Number(n).toFixed(2)}`;
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

function parseTimeToMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

function getTodaySchedule() {
    const day = new Date().getDay();
    return RESTAURANT.schedule[day];
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
 * WHATSAPP
 ***********************/
function buildGeneralWhatsAppMessage() {
    const st = isOpenNow();
    const now = new Date();
    const dateStr = now.toLocaleString("es-PE", {
        dateStyle: "medium",
        timeStyle: "short"
    });

    const lines = [
        `Hola 👋, quiero consultar el *menú del día* en *${RESTAURANT.name}*`,
        `🗓 ${dateStr}`,
        ``,
        `¿Qué opciones tienen hoy y qué tiempo aprox están manejando? 🙌`,
        ``,
        `Estado actual: ${st.open ? "🟢 Abierto" : "🔴 Cerrado"}`
    ];
    return lines.join("\n");
}

function buildDishWhatsAppMessage(product) {
    const now = new Date();
    const dateStr = now.toLocaleString("es-PE", {
        dateStyle: "medium",
        timeStyle: "short"
    });

    const lines = [
        `Hola 👋, quiero pedir este plato en *${RESTAURANT.name}*:`,
        `🗓 ${dateStr}`,
        ``,
        `*${product.name}* — ${money(product.price)}`,
        `${product.desc}`,
        ``,
        `¿Está disponible? ¿Tiempo aprox? 🙌`
    ];
    return lines.join("\n");
}

function waUrl(message) {
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${RESTAURANT.whatsappNumber}?text=${encoded}`;
}

function updateGlobalWhatsLinks() {
    const url = waUrl(buildGeneralWhatsAppMessage());
    ["btnWhatsHero", "btnWhatsCTA", "fabWhatsapp", "btnWhatsMobile", "btnWhatsHeader"].forEach(id => {
        const el = qs(`#${id}`);
        if (el) el.href = url;
    });

    const footerPhone = qs("#footerPhone");
    if (footerPhone) footerPhone.textContent = `+${RESTAURANT.whatsappNumber}`;
}

/***********************
 * RENDER PRODUCTS
 ***********************/
function renderProductCard(product, targetEl) {
    const el = document.createElement("article");
    el.className = "cardProd";
    el.innerHTML = `
    <div class="cardProd__img" style="background-image:
    linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.45)),
    url('${product.image}');">
      <div class="cardProd__badge">${product.badge ?? "Plato"}</div>
    </div>
    <div class="cardProd__body">
      <h3 class="cardProd__title">${product.name}</h3>
      <p class="cardProd__desc">${product.desc}</p>
      <div class="cardProd__row">
        <div class="price">${money(product.price)}</div>
        <button class="btn btn--primary" data-order="${product.id}" type="button">
          Pedir este plato
        </button>
      </div>
    </div>
  `;
    targetEl.appendChild(el);
}

function getProductById(id) {
    const all = [...MENU_DATA.menuDelDia, ...MENU_DATA.topDishes];
    return all.find(p => p.id === id);
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

    const howToGo = qs("#btnHowToGo");
    if (howToGo) howToGo.href = RESTAURANT.mapsQueryUrl;
}

/***********************
 * NAV MÓVIL
 ***********************/
function setupMobileNav() {
    const btn = document.querySelector("#btnHamburger");
    const mobileNav = document.querySelector("#mobileNav");
    if (!btn || !mobileNav) return;

    btn.addEventListener("click", () => {
        mobileNav.classList.toggle("is-open");
    });

    // Cierra cuando tocas un link del menú
    mobileNav.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", () => mobileNav.classList.remove("is-open"));
    });

    // Si se agranda la pantalla, lo cierra
    window.addEventListener("resize", () => {
        if (window.innerWidth > 980) {
            mobileNav.classList.remove("is-open");
        }
    });
}


/***********************
 * DARK MODE
 ***********************/
const THEME_KEY = "olla_theme_v1";

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);

    const icon = qs("#themeIcon");
    const text = qs("#themeText");
    if (theme === "dark") {
        if (icon) icon.textContent = "☀️";
        if (text) text.textContent = "Claro";
    } else {
        if (icon) icon.textContent = "🌙";
        if (text) text.textContent = "Oscuro";
    }
}

function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
        applyTheme(saved);
        return;
    }

    // si no hay preferencia guardada, usamos la del sistema
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
}

function setupThemeToggle() {
    const btn = qs("#themeToggle");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") || "light";
        applyTheme(current === "dark" ? "light" : "dark");
    });
}

/***********************
 * EVENTS
 ***********************/
function setupEvents() {
    // Pedir plato específico
    document.addEventListener("click", (e) => {
        const orderBtn = e.target.closest("[data-order]");
        if (!orderBtn) return;

        const p = getProductById(orderBtn.dataset.order);
        if (!p) return;

        window.open(waUrl(buildDishWhatsAppMessage(p)), "_blank", "noopener");
    });
}

/***********************
 * INIT
 ***********************/
function init() {
    qs("#year").textContent = new Date().getFullYear();

    initTheme();
    setupThemeToggle();

    // Render menu
    const menuDiaGrid = qs("#menuDiaGrid");
    const topGrid = qs("#topDishesGrid");

    MENU_DATA.menuDelDia.forEach(p => renderProductCard(p, menuDiaGrid));
    MENU_DATA.topDishes.forEach(p => renderProductCard(p, topGrid));

    renderScheduleUI();
    updateGlobalWhatsLinks();

    setupMobileNav();
    setupEvents();

    setInterval(renderScheduleUI, 60000);
}

document.addEventListener("DOMContentLoaded", init);