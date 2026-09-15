const supabaseSettings = window.SUPABASE_CONFIG || {};
const isSupabaseConfigured = Boolean(
    window.supabase &&
    supabaseSettings.url &&
    supabaseSettings.publishableKey &&
    !supabaseSettings.url.includes('TU-PROJECT-REF') &&
    !supabaseSettings.publishableKey.includes('TU_PUBLISHABLE_KEY')
);
const supabaseClient = isSupabaseConfigured
    ? window.supabase.createClient(supabaseSettings.url, supabaseSettings.publishableKey)
    : null;

function requireSupabase() {
    if (supabaseClient) return supabaseClient;
    showToast('Configura Supabase en supabase-config.js para usar esta función.', 'error');
    return null;
}

function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[character]));
}

function fileExtension(file) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return /^[a-z0-9]{1,8}$/.test(extension || '') ? extension : 'jpg';
}

async function getAuthenticatedUser() {
    if (!supabaseClient) return null;
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) return null;
    return data.session?.user ?? null;
}

async function syncSessionFromSupabase() {
    if (!supabaseClient) {
        checkSession();
        return null;
    }

    const authUser = await getAuthenticatedUser();
    if (!authUser) {
        localStorage.removeItem('viajero_session');
        checkSession();
        return null;
    }

    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('username, city, avatar_url, has_plan, yapti_tokens')
        .eq('id', authUser.id)
        .maybeSingle();

    if (error) console.error('No se pudo obtener el perfil:', error);

    const user = {
        id: authUser.id,
        email: authUser.email,
        username: profile?.username || authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'viajero',
        city: profile?.city || 'Granada',
        avatar: profile?.avatar_url || '',
        hasPlan: Boolean(profile?.has_plan),
        yaptiTokens: profile?.yapti_tokens ?? YAPTI_FREE_TOKENS
    };
    localStorage.setItem('viajero_session', JSON.stringify(user));
    checkSession();
    return user;
}

// Base de Datos de Ciudades Creativas con las 10 locaciones solicitadas

document.addEventListener("DOMContentLoaded", () => {
    const activeDepartments = document.querySelectorAll('.dept-active');
    const legendBox = document.getElementById('map-legend');

    activeDepartments.forEach(dept => {
        // 1. Efecto visual en la leyenda al pasar el mouse
        dept.addEventListener('mouseenter', (e) => {
            const areaName = e.target.getAttribute('name');
            legendBox.textContent = `Explorar: ¡${areaName}!`;
            legendBox.classList.add('active');
        });

        dept.addEventListener('mouseleave', () => {
            legendBox.textContent = "Pasa el cursor sobre un departamento destacado";
            legendBox.classList.remove('active');
        });

        // 2. Evento Clic para Redireccionar e integrar con el Select
        dept.addEventListener('click', (e) => {
            const targetCity = e.target.getAttribute('data-city');

            // Cambiamos de vista a Ciudades Creativas utilizando tu enrutador nativo
            if (typeof navigateTo === "function") {
                navigateTo('/ciudades-creativas'); 
            }

            // Esperamos que la vista se monte/active
            setTimeout(() => {
                const selectCity = document.getElementById('select-city');
                
                if (selectCity) {
                    // Seleccionamos la ciudad correspondiente en el <select>
                    selectCity.value = targetCity;
                    
                    // Reseteamos el filtro de categorías a 'todos' para consistencia estética
                    if (typeof changeCategoryFilter === "function") {
                        changeCategoryFilter('todos');
                    }

                    // Forzamos el renderizado dinámico de tus tarjetas
                    if (typeof filterCreativeSites === "function") {
                        filterCreativeSites();
                    }
                    
                    // Desplazamiento suave para enfocar el título de la sección
                    const sitesTitle = document.getElementById('sites-title');
                    if (sitesTitle) {
                        sitesTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }, 180); // Sincronización perfecta de milisegundos con la transición de la vista
        });
    });
});
const aiResponses = {
    "granada": "En Granada te recomiendo visitar la Calle La Calzada, subir a la torre de la Iglesia de la Merced para ver los tejados coloniales, y comer un tradicional **Vigorón en el Parque Central**.",
    "cerro negro": "Para el volcán Cerro Negro en León, debés prepararte para caminar unos 45 minutos sobre piedra volcánica suelta. Arriba te deslizás en una tabla de madera a más de 60 km/h.",
    "barro": "El corazón de las artesanías de barro es **San Juan de Oriente** en Masaya. Ahí podés entrar directamente a los talleres de los artesanos locales y ver cómo usan el torno de pie.",
    "corn island": "La mejor época para ir a Corn Island es en los meses de **marzo, abril y mayo**, cuando el mar Caribe está súper calmo y hay muy pocas lluvias.",
    "default": "¡Qué buenísima pregunta! Nicaragua tiene destinos increíbles. Te sugiero explorar nuestras secciones para encontrar exactamente lo que buscás."
};

let likedItemsInSession = []; 
let currentCategoryFilter = 'todos';

/* --- SISTEMA DE NOTIFICACIONES TOAST INTEGRADO --- */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-card ${type}`;
    const icon = type === 'success' ? '🎉' : '❌';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
        <button type="button" class="toast-close" aria-label="Cerrar notificación">×</button>
    `;

    container.appendChild(toast);

    let dismissed = false;
    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        clearTimeout(autoTimer);
        toast.classList.add('fade-out');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });
        // Respaldo por si transitionend no dispara (p.ej. pestaña en segundo plano)
        setTimeout(() => toast.remove(), 350);
    };

    // Se cierra sola a los 3 segundos...
    const autoTimer = setTimeout(dismiss, 3000);
    // ...pero también se puede cerrar antes con la "x".
    toast.querySelector('.toast-close').addEventListener('click', dismiss);
}

function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
        v.style.display = 'none';
    });

    const idMap = {
        '/': 'view-home',
        '/mapa-interactivo': 'view-map',
        '/ciudades-creativas': 'view-sites',
        '/galeria': 'view-gallery',
        '/ia-guia': 'view-ia',
        '/correo-verificado': 'view-email-verified',
        '/registro': 'view-auth',
        '/esteli': 'view-esteli',
        '/leon': 'view-leon',
        '/nagarote': 'view-nagarote',
        '/managua': 'view-managua',
        '/masaya': 'view-masaya',
        '/granada': 'view-granada',
        '/sanjuan': 'view-sanjuan',
        '/juigalpa': 'view-juigalpa',
        '/matagalpa': 'view-matagalpa',
        '/bluefields': 'view-bluefields'
        
    };
    
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.querySelector('#menu-toggle');
  let ultimoScroll = window.scrollY;

  window.addEventListener('scroll', () => {
    const scrollActual = window.scrollY;

    // Cuando el menú hamburguesa está abierto, la navbar no se oculta.
    if (menuToggle.checked) {
      navbar.classList.remove('nav-hidden');
      ultimoScroll = scrollActual;
      return;
    }

    // Baja: ocultar, solo después de pasar 80px.
    if (scrollActual > ultimoScroll && scrollActual > 80) {
      navbar.classList.add('nav-hidden');
    }

    // Sube aunque sea un poco: mostrar.
    if (scrollActual < ultimoScroll) {
      navbar.classList.remove('nav-hidden');
    }

    ultimoScroll = scrollActual;
  });

  // Al abrir el menú, asegurar que la barra sea visible.
  menuToggle.addEventListener('change', () => {
    if (menuToggle.checked) {
      navbar.classList.remove('nav-hidden');
    }
  });

     document.querySelectorAll('.menu-link').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelector('#menu-toggle').checked = false;
  });
});

    const targetId = idMap[viewId] || 'view-404';
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
        targetElement.style.display = 'block';
        targetElement.classList.add('active');
    }

    if(viewId === '/galeria') renderGallery();
    if(viewId === '/ciudades-creativas') filterCreativeSites();
    if(viewId === '/ia-guia') initYaptiView();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

const params = new URLSearchParams(window.location.search);
const ciudad = params.get("ciudad");

document.querySelectorAll(".view").forEach(vista=>{
    vista.classList.remove("active");
});

if(ciudad){
    const vista=document.getElementById("view-"+ciudad);

    if(vista){
        vista.classList.add("active");
    }
}

/* --- INTERFAZ FILTRADORA DE CIUDADES CREATIVAS --- */
function changeCategoryFilter(category) {
    currentCategoryFilter = category;
    const buttons = document.querySelectorAll('.tab-filter');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if(category === 'todos') document.getElementById('filter-all')?.classList.add('active');
    if(category === 'turistico') document.getElementById('filter-tur')?.classList.add('active');
    if(category === 'colonial') document.getElementById('filter-col')?.classList.add('active');
    if(category === 'historico') document.getElementById('filter-his')?.classList.add('active');
    if(category === 'artesania') document.getElementById('filter-art')?.classList.add('active');

    filterCreativeSites();
}

async function filterCreativeSites() {
    const selectCityElem = document.getElementById('select-city');
    if (!selectCityElem) return;

    const selectedCity = selectCityElem.value;
    const container = document.getElementById('sites-render-container');
    if (!container) return;

    container.innerHTML = `<div class="no-data-alert"><i data-lucide="loader-2"></i> Cargando...</div>`;

    // Catálogo curado (antes vivía escrito a mano en este archivo; ahora es la
    // misma tabla que usa YAPTI como contexto, así nunca se desincroniza).
    let sites = [];
    if (supabaseClient) {
        const { data, error } = await supabaseClient
            .from('sitios_creativos')
            .select('name, category, description, rating, visitors, highlights')
            .eq('ciudad', selectedCity);
        if (error) {
            console.error('No se pudo cargar el catálogo de sitios creativos:', error);
        } else {
            sites = (data || []).map(site => ({
                name: site.name,
                category: site.category,
                desc: site.description,
                rating: site.rating,
                visitors: site.visitors,
                highlights: site.highlights || []
            }));
        }
    }

    // Locales agregados por usuarios (requiere el Plan Viajero para publicarse)
    let locales = [];
    if (supabaseClient) {
        const { data, error } = await supabaseClient
            .from('locales_negocio')
            .select('nombre, categoria, descripcion, ciudad')
            .eq('ciudad', selectedCity);
        if (error) {
            console.error('No se pudieron cargar los locales de la comunidad:', error);
        } else {
            locales = (data || []).map(local => ({
                name: local.nombre,
                category: local.categoria,
                desc: local.descripcion,
                rating: null,
                visitors: null,
                highlights: [],
                esLocalComunidad: true
            }));
        }
    }

    container.innerHTML = '';

    const filteredSites = [...sites, ...locales].filter(site => {
        if (currentCategoryFilter === 'todos') return true;
        return site.category === currentCategoryFilter;
    });

    if(filteredSites.length === 0) {
        container.innerHTML = `
            <div class="no-data-alert">
                <i data-lucide="info"></i> No hay registros cargados bajo la categoría "<b>${currentCategoryFilter.toUpperCase()}</b>" en <b>${selectedCity}</b>.
            </div>`;
        if (window.lucide) lucide.createIcons();
        return;
    }

    filteredSites.forEach(site => {
        const card = document.createElement('div');
        card.className = `site-card border-${site.category}`;
        let tagsHTML = '';
        (site.highlights || []).forEach(h => { tagsHTML += `<span class="tag">${h}</span>`; });

        const metaHTML = site.esLocalComunidad
            ? `<span class="badge-local"><i data-lucide="store" style="width: 1rem; height: 1rem;"></i> Negocio Local</span>`
            : `
                <span class="rating"><i data-lucide="star" style="width: 1rem; height: 1rem; fill: currentColor;"></i> ${site.rating}</span>
                <span class="visitors"><i data-lucide="users" style="width: 1rem; height: 1rem;"></i> ${site.visitors}</span>
            `;

        card.innerHTML = `
            <div class="site-title">${escapeHtml(site.name)} <span class="badge-cat">${site.category.toUpperCase()}</span></div>
            <div class="site-meta">${metaHTML}</div>
            <div class="site-desc">${escapeHtml(site.desc)}</div>
            <div class="highlights">${tagsHTML}</div>
        `;
        container.appendChild(card);
    });
    if (window.lucide) lucide.createIcons();
}

function closeModalOnOverlay(e) { if (e.target.id === 'upload-modal') closeModal(); }

/* ==========================================================================
    NUEVO DISPARADOR CENTRALIZADO DE SESIÓN (SOLUCIONA TU BUG DE NAVEGACIÓN)
   ========================================================================== */
function checkSession() {
    const session = localStorage.getItem('viajero_session');
    const formsContainer = document.getElementById('auth-forms-container');
    const profileContainer = document.getElementById('auth-profile-container');
    
    // Buscar el botón de registro/perfil en la barra superior (Navbar)
    const navAuthLink = document.querySelector('a[onclick*="/registro"]') || document.querySelector('.nav-links a:last-child');

    if (session) {
        const user = JSON.parse(session);
        
        // Intercambiar formularios de Login por la Vista de Perfil
        if (formsContainer) formsContainer.style.display = 'none';
        if (profileContainer) profileContainer.style.display = 'block';

        // Modificar dinámicamente el botón "Registro" de arriba por tu Nombre de cuenta
        if (navAuthLink) {
            navAuthLink.innerHTML = `<span id="nav-auth-text">@${user.username}</span>`;
        }

        // --- ACTUALIZACIÓN EXCLUSIVA PARA EL AVATAR PERSISTENTE ---
        const profileImg = document.getElementById('profile-avatar-img');
        if (profileImg) {
            // Si el usuario tiene un avatar guardado en Base64, lo usa; si no, deja el por defecto
            profileImg.src = user.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=viajero";
        }
        // ---------------------------------------------------------

        // Pintar la información del usuario en la tarjeta de perfil
        actualizarCajaPerfilInterfaz(user);
        renderMfaStatus();
    } else {
        // Si no hay sesión, reestablecer todo al estado nativo
        if (formsContainer) formsContainer.style.display = 'grid';
        if (profileContainer) profileContainer.style.display = 'none';
        if (navAuthLink) {
            navAuthLink.innerHTML = `<span id="nav-auth-text">Registro</span>`;
        }
    }
}

/* ==========================================================================
    PLAN DE PAGO (SIMULADO), TOKENS DE YAPTI Y "AGREGAR LOCAL"
    ------------------------------------------------------------------------
    IMPORTANTE: Esta app no tiene conectada una pasarela de pago real
    (Stripe, PayPal, etc.). La función purchasePlanSimulated() simula el
    cobro y activa el plan directamente en la base de datos, para que todo
    el flujo (UI, bloqueos, desbloqueos) funcione de punta a punta. Cuando
    tengas un proveedor de pagos real, esa es la única función que hay que
    reemplazar por la llamada de checkout real + un webhook que confirme el
    pago antes de poner has_plan en true.
   ========================================================================== */

const YAPTI_FREE_TOKENS = 5; // Preguntas gratis para quien no tiene el plan

// --- Estado del plan / tokens del usuario actual ---
async function getUserPlanState() {
    const user = await getAuthenticatedUser();

    if (!user) {
        // Invitado (no ha iniciado sesión): tokens contados en este navegador
        const used = parseInt(localStorage.getItem('yapti_tokens_anon_used') || '0', 10);
        return {
            loggedIn: false,
            hasPlan: false,
            tokensRemaining: Math.max(0, YAPTI_FREE_TOKENS - used)
        };
    }

    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('has_plan, yapti_tokens')
        .eq('id', user.id)
        .maybeSingle();

    if (error) console.error('No se pudo leer el plan del usuario:', error);

    return {
        loggedIn: true,
        userId: user.id,
        hasPlan: Boolean(profile?.has_plan),
        tokensRemaining: profile?.yapti_tokens ?? YAPTI_FREE_TOKENS
    };
}

// --- Modal "Necesitas el plan" ---
function openPlanModal(reason) {
    const modal = document.getElementById('plan-modal');
    if (!modal) return;

    const reasonText = document.getElementById('plan-modal-reason');
    if (reasonText) {
        reasonText.textContent = reason === 'yapti'
            ? 'Se te acabaron las preguntas gratis a YAPTI. Con el plan tenés preguntas ilimitadas.'
            : 'Agregar tu local a Ciudades Creativas es un beneficio del Plan Viajero.';
    }

    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

function closePlanModal() {
    const modal = document.getElementById('plan-modal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.classList.add('hidden');
}

async function purchasePlanSimulated() {
    const user = await getAuthenticatedUser();
    if (!user) {
        showToast('Inicia sesión para comprar el plan.', 'error');
        closePlanModal();
        navigateTo('/registro');
        return;
    }

    const btn = document.getElementById('plan-buy-btn');
    const textoOriginal = btn ? btn.innerText : '';
    if (btn) { btn.disabled = true; btn.innerText = 'Procesando pago...'; }

    // Simulación de una pasarela de pago (ver nota arriba del módulo).
    await new Promise(resolve => setTimeout(resolve, 1200));

    const { error } = await supabaseClient
        .from('profiles')
        .update({ has_plan: true })
        .eq('id', user.id);

    if (btn) { btn.disabled = false; btn.innerText = textoOriginal; }

    if (error) {
        console.error(error);
        showToast('No se pudo activar el plan. Intenta de nuevo.', 'error');
        return;
    }

    showToast('¡Listo! Tu Plan Viajero está activo.');
    closePlanModal();

    // Refrescar la sesión local (localStorage) y toda la interfaz que dependa del plan
    await syncSessionFromSupabase();
    renderYaptiPlanStatus();
    if (document.getElementById('view-sites')?.classList.contains('active')) {
        filterCreativeSites();
    }
}

// --- Tokens de YAPTI ---
function renderYaptiPlanStatus() {
    getUserPlanState().then(state => {
        const badge = document.getElementById('yapti-tokens-badge');
        if (!badge) return;

        if (state.hasPlan) {
            badge.innerHTML = `<i data-lucide="sparkles"></i> Plan Viajero: preguntas ilimitadas`;
            badge.classList.add('plan-active');
        } else {
            badge.innerHTML = `<i data-lucide="zap"></i> Tokens disponibles: ${state.tokensRemaining}`;
            badge.classList.remove('plan-active');
        }
        if (window.lucide) lucide.createIcons();
    });
}

// Descuenta un token antes de dejar preguntar a YAPTI.
// Devuelve true si puede continuar, false si hay que bloquear la pregunta.
async function consumeYaptiToken() {
    const state = await getUserPlanState();

    if (state.hasPlan) return true;

    if (state.tokensRemaining <= 0) {
        openPlanModal('yapti');
        return false;
    }

    if (state.loggedIn) {
        const { error } = await supabaseClient
            .from('profiles')
            .update({ yapti_tokens: state.tokensRemaining - 1 })
            .eq('id', state.userId);
        if (error) console.error('No se pudo descontar el token:', error);
    } else {
        const used = parseInt(localStorage.getItem('yapti_tokens_anon_used') || '0', 10);
        localStorage.setItem('yapti_tokens_anon_used', String(used + 1));
    }

    renderYaptiPlanStatus();
    return true;
}

// --- "Agregar Local" en Ciudades Creativas ---
async function handleAddLocalClick() {
    const user = await getAuthenticatedUser();
    if (!user) {
        showToast('Inicia sesión para agregar tu local.', 'error');
        navigateTo('/registro');
        return;
    }

    const state = await getUserPlanState();
    if (!state.hasPlan) {
        openPlanModal('local');
        return;
    }

    const modal = document.getElementById('add-local-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

function closeAddLocalModal() {
    const modal = document.getElementById('add-local-modal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.classList.add('hidden');
}

async function handleAddLocalSubmit(event) {
    event.preventDefault();
    const user = await getAuthenticatedUser();
    if (!user) {
        showToast('Inicia sesión para agregar tu local.', 'error');
        return;
    }

    const nombre = document.getElementById('local-nombre')?.value.trim();
    const ciudad = document.getElementById('local-ciudad')?.value;
    const categoria = document.getElementById('local-categoria')?.value;
    const descripcion = document.getElementById('local-descripcion')?.value.trim();

    if (!nombre || !ciudad || !descripcion) {
        showToast('Completa todos los campos.', 'error');
        return;
    }

    const btn = event.target.querySelector('button[type="submit"]');
    const textoOriginal = btn.innerText;
    btn.disabled = true;
    btn.innerText = 'Guardando...';

    const { error } = await supabaseClient.from('locales_negocio').insert({
        user_id: user.id,
        nombre,
        ciudad,
        categoria,
        descripcion
    });

    btn.disabled = false;
    btn.innerText = textoOriginal;

    if (error) {
        console.error(error);
        showToast('No se pudo guardar tu local. Intenta de nuevo.', 'error');
        return;
    }

    showToast('¡Tu local ya está publicado en Ciudades Creativas!');
    event.target.reset();
    closeAddLocalModal();
    filterCreativeSites();
}



function actualizarCajaPerfilInterfaz(user) {
    const usernameEl = document.getElementById('val-username');
    const cityEl = document.getElementById('val-city');
    const editUserInp = document.getElementById('edit-username');
    const editCityInp = document.getElementById('edit-city');
    const avatarImg = document.getElementById('profile-avatar-img');
    const planStatusEl = document.getElementById('val-plan-status');
    const btnCancelPlan = document.getElementById('btn-cancel-plan');
    
    if (user) {
        if (usernameEl) usernameEl.innerText = `@${user.username}`;
        if (cityEl) cityEl.innerText = user.city || 'Granada';
        if (editUserInp) editUserInp.value = user.username;
        if (editCityInp) editCityInp.value = user.city || '';
        
        if (avatarImg) {
            avatarImg.src = user.avatar && user.avatar.trim() !== "" 
                ? user.avatar 
                : "https://api.dicebear.com/7.x/bottts/svg?seed=" + user.username;
        }

        if (planStatusEl) {
            planStatusEl.innerText = user.hasPlan ? 'Activo ✓' : 'Sin plan activo';
            planStatusEl.classList.toggle('plan-status-active', Boolean(user.hasPlan));
        }
        if (btnCancelPlan) {
            btnCancelPlan.style.display = user.hasPlan ? 'inline-flex' : 'none';
        }
    }
}

async function cancelPlanSubscription() {
    if (!confirm('¿Seguro que querés dar de baja el Plan Viajero? Perderás las preguntas ilimitadas a YAPTI y ya no podrás agregar nuevos locales.')) return;

    const user = await getAuthenticatedUser();
    if (!user) {
        showToast('Inicia sesión primero.', 'error');
        return;
    }

    const btn = document.getElementById('btn-cancel-plan');
    const textoOriginal = btn ? btn.innerText : '';
    if (btn) { btn.disabled = true; btn.innerText = 'Procesando...'; }

    const { error } = await supabaseClient
        .from('profiles')
        .update({ has_plan: false })
        .eq('id', user.id);

    if (btn) { btn.disabled = false; btn.innerText = textoOriginal; }

    if (error) {
        console.error(error);
        showToast('No se pudo dar de baja el plan. Intenta de nuevo.', 'error');
        return;
    }

    // Refrescar la sesión local (localStorage) y la interfaz
    await syncSessionFromSupabase();
    renderYaptiPlanStatus();
    showToast('Diste de baja el Plan Viajero.');
}

/* ==========================================================================
    CAMBIO DINÁMICO Y PERSISTENCIA DEL AVATAR / LOGO DE PERFIL
   ========================================================================== */

function uploadAvatar() {
    const fileInput = document.getElementById('avatar-input');
    const profileImg = document.getElementById('profile-avatar-img');

    // Verificar que el input exista y que el usuario haya seleccionado un archivo
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        return;
    }

    const archivo = fileInput.files[0];

    // Validar que realmente sea una imagen
    if (!archivo.type.startsWith('image/')) {
        showToast('Por favor, selecciona un archivo de imagen válido (PNG, JPG).', 'error');
        return;
    }

    // Instanciar FileReader para leer el archivo local sin necesidad de subirlo al servidor aún
    const reader = new FileReader();

    // Cuando termine de leer el archivo de la PC/celular del usuario
    reader.onload = function(e) {
        const imagenBase64 = e.target.result;

        // 1. Cambiar el logo visualmente en caliente en la pantalla
        if (profileImg) {
            profileImg.src = imagenBase64;
        }

        // 2. Persistir el cambio en el LocalStorage para que se mantenga al recargar la página
        const sessionData = localStorage.getItem('viajero_session');
        if (sessionData) {
            try {
                const user = JSON.parse(sessionData);
                user.avatar = imagenBase64; // Guardamos el string Base64 en el objeto del usuario
                localStorage.setItem('viajero_session', JSON.stringify(user));
                
                showToast('¡Imagen de perfil actualizada con éxito!');
            } catch (error) {
                console.error('Error al actualizar avatar en la sesión:', error);
            }
        }
    };

    // Iniciar la lectura del archivo como URL de datos
    reader.readAsDataURL(archivo);
}

function toggleEdit() {
    const session = localStorage.getItem('viajero_session');
    if (!session) return;
    const user = JSON.parse(session);

    const viewMode = document.getElementById('profile-view-mode');
    const editMode = document.getElementById('profile-edit-mode');
    const btnEdit = document.getElementById('btn-edit');
    const btnSave = document.getElementById('btn-save');

    if (viewMode.style.display !== 'none') {
        document.getElementById('edit-username').value = user.username;
        document.getElementById('edit-city').value = user.city || '';
        
        viewMode.style.display = 'none';
        editMode.style.display = 'block';
        btnEdit.innerText = "Cancelar";
        btnSave.style.display = 'inline-block';
    } else {
        viewMode.style.display = 'block';
        editMode.style.display = 'none';
        btnEdit.innerText = "Editar Perfil";
        btnSave.style.display = 'none';
    }
}


function toggleYaptiSidebar() {
    document.querySelector('.yapti-shell')?.classList.toggle('sidebar-open');
}
function closeYaptiSidebarOnMobile() {
    if (window.innerWidth <= 900) {
        document.querySelector('.yapti-shell')?.classList.remove('sidebar-open');
    }
}

/* --- GUÍA VIRTUAL DE IA (YAPTI) --- */
// Cada "Nuevo Chat" es una conversation_id distinta, igual que en ChatGPT/Claude.
// Usuarios con sesión: todo se guarda en Supabase (tabla yapti_historial), persiste entre dispositivos.
// Invitados: se guarda en este navegador (localStorage), se pierde si borran datos o cambian de equipo.

let currentYaptiConversationId = sessionStorage.getItem('yapti_conversation_id') || crypto.randomUUID();
sessionStorage.setItem('yapti_conversation_id', currentYaptiConversationId);

function setQuickQuestion(text) {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = text;
        sendUserMessage();
    }
    closeYaptiSidebarOnMobile();
}
function handleChatKey(e) { if (e.key === 'Enter') sendUserMessage(); }

function appendChatMessage(role, text) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    if (role === 'user') {
        const userMsg = document.createElement('div');
        userMsg.className = 'message user';
        userMsg.innerText = text;
        chatMessages.appendChild(userMsg);
    } else {
        const aiMsg = document.createElement('div');
        aiMsg.className = 'message ai';
        aiMsg.innerHTML = `
            <div class="ai-badge"><img src="img/yapti/yapti_frontal.png" alt="" class="ai-badge-avatar"> Guía IA Pinolero</div>
            <div class="ai-body"></div>
        `;
        aiMsg.querySelector('.ai-body').innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        chatMessages.appendChild(aiMsg);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Muestra el saludo centrado (sin mensajes) o la conversación con el input abajo.
function setYaptiLayoutState(hasMessages) {
    const empty = document.getElementById('yapti-empty-state');
    const messages = document.getElementById('chat-messages');
    const main = document.getElementById('yapti-main');
    if (!empty || !messages || !main) return;
    empty.style.display = hasMessages ? 'none' : 'flex';
    messages.style.display = hasMessages ? 'flex' : 'none';
    main.classList.toggle('has-messages', hasMessages);
}

async function saveYaptiMessage(role, text) {
    const user = await getAuthenticatedUser();
    if (user) {
        const { error } = await supabaseClient.from('yapti_historial').insert({
            user_id: user.id, role, content: text, conversation_id: currentYaptiConversationId
        });
        if (error) console.error('No se pudo guardar el mensaje en el historial:', error);
    } else {
        const historial = JSON.parse(localStorage.getItem('yapti_chat_guest') || '[]');
        historial.push({ role, content: text, conversation_id: currentYaptiConversationId, created_at: new Date().toISOString() });
        // Guardamos como máximo los últimos 200 mensajes para no llenar el navegador
        localStorage.setItem('yapti_chat_guest', JSON.stringify(historial.slice(-200)));
    }
}

async function getYaptiAllMessages() {
    const user = await getAuthenticatedUser();
    if (user) {
        const { data, error } = await supabaseClient
            .from('yapti_historial')
            .select('role, content, conversation_id, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });
        if (error) { console.error('No se pudo cargar el historial de YAPTI:', error); return []; }
        return data || [];
    }
    return JSON.parse(localStorage.getItem('yapti_chat_guest') || '[]');
}

// Dibuja SOLO los mensajes de la conversación actualmente abierta.
async function renderCurrentYaptiConversation() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const todos = await getYaptiAllMessages();
    const delChat = todos.filter(m => m.conversation_id === currentYaptiConversationId);

    chatMessages.innerHTML = '';
    delChat.forEach(msg => appendChatMessage(msg.role, msg.content));
    setYaptiLayoutState(delChat.length > 0);
    if (window.lucide) lucide.createIcons();
}

// Arma la lista "Recientes" del sidebar agrupando por conversation_id.
async function loadYaptiConversationsList() {
    const list = document.getElementById('yapti-recent-list');
    if (!list) return;

    const todos = await getYaptiAllMessages();
    const conversaciones = new Map();

    todos.forEach(m => {
        if (!conversaciones.has(m.conversation_id)) {
            conversaciones.set(m.conversation_id, { id: m.conversation_id, titulo: null, ultima: m.created_at });
        }
        const c = conversaciones.get(m.conversation_id);
        if (!c.titulo && m.role === 'user') c.titulo = m.content;
        c.ultima = m.created_at;
    });

    const items = Array.from(conversaciones.values())
        .filter(c => c.titulo) // solo conversaciones con al menos una pregunta
        .sort((a, b) => (a.ultima < b.ultima ? 1 : -1))
        .slice(0, 15);

    list.innerHTML = '';
    if (items.length === 0) {
        list.innerHTML = `<span class="yapti-recent-empty">Todavía no hay conversaciones</span>`;
        return;
    }

    items.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'yapti-sidebar-item yapti-recent-item' + (c.id === currentYaptiConversationId ? ' active' : '');
        btn.textContent = c.titulo.length > 34 ? c.titulo.slice(0, 34) + '…' : c.titulo;
        btn.onclick = () => openYaptiConversation(c.id);
        list.appendChild(btn);
    });
}

async function openYaptiConversation(conversationId) {
    currentYaptiConversationId = conversationId;
    sessionStorage.setItem('yapti_conversation_id', conversationId);
    await renderCurrentYaptiConversation();
    await loadYaptiConversationsList();
    document.getElementById('chat-input')?.focus();
    closeYaptiSidebarOnMobile();
}

function startNewYaptiChat() {
    currentYaptiConversationId = crypto.randomUUID();
    sessionStorage.setItem('yapti_conversation_id', currentYaptiConversationId);
    document.getElementById('chat-messages').innerHTML = '';
    setYaptiLayoutState(false);
    loadYaptiConversationsList();
    document.getElementById('chat-input')?.focus();
    closeYaptiSidebarOnMobile();
}

async function clearYaptiHistory() {
    if (!confirm('¿Borrar TODO tu historial de conversaciones con YAPTI? Esto no se puede deshacer.')) return;

    const user = await getAuthenticatedUser();
    if (user) {
        const { error } = await supabaseClient.from('yapti_historial').delete().eq('user_id', user.id);
        if (error) {
            console.error(error);
            showToast('No se pudo borrar el historial.', 'error');
            return;
        }
    } else {
        localStorage.removeItem('yapti_chat_guest');
    }

    startNewYaptiChat();
    showToast('Historial borrado.');
}

// Muestra en el sidebar quién está usando YAPTI y su plan (reutiliza la sesión ya guardada).
function renderYaptiSidebarProfile() {
    const session = JSON.parse(localStorage.getItem('viajero_session') || 'null');
    const nombre = document.getElementById('yapti-sidebar-username');
    const planLabel = document.getElementById('yapti-sidebar-plan');
    const upgradeBtn = document.getElementById('yapti-upgrade-btn');
    const avatarImg = document.getElementById('yapti-sidebar-avatar');
    const avatarFallback = document.getElementById('yapti-sidebar-avatar-fallback');
    if (!nombre || !planLabel || !upgradeBtn) return;

    if (session) {
        nombre.textContent = '@' + session.username;
        planLabel.textContent = session.hasPlan ? 'Plan Viajero' : 'Gratis';
        upgradeBtn.style.display = session.hasPlan ? 'none' : 'inline-flex';
        if (session.avatar) {
            avatarImg.src = session.avatar;
            avatarImg.style.display = 'block';
            avatarFallback.style.display = 'none';
        } else {
            avatarImg.style.display = 'none';
            avatarFallback.style.display = 'flex';
        }
    } else {
        nombre.textContent = 'Invitado';
        planLabel.textContent = 'Gratis';
        upgradeBtn.style.display = 'inline-flex';
        avatarImg.style.display = 'none';
        avatarFallback.style.display = 'flex';
    }
    if (window.lucide) lucide.createIcons();
}

// Se llama una sola vez, cada vez que se entra a la vista de YAPTI.
async function initYaptiView() {
    renderYaptiPlanStatus();
    renderYaptiSidebarProfile();
    await renderCurrentYaptiConversation();
    await loadYaptiConversationsList();
}

// Respuestas por palabra clave: quedan como red de seguridad si la IA real
// (Edge Function yapti-ai) no está desplegada todavía o falla en el momento.
function respuestaDeRespaldo(text) {
    const normalizedText = text.toLowerCase();
    let aiText = aiResponses["default"];
    for (let key in aiResponses) { if (normalizedText.includes(key)) { aiText = aiResponses[key]; break; } }
    return aiText;
}

function showYaptiTyping() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return null;
    const typing = document.createElement('div');
    typing.className = 'message ai yapti-typing';
    typing.innerHTML = `
        <div class="ai-badge"><img src="img/yapti/yapti_frontal.png" alt="" class="ai-badge-avatar"> Guía IA Pinolero</div>
        <div class="yapti-typing-dots"><span></span><span></span><span></span></div>
    `;
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    if (window.lucide) lucide.createIcons();
    return typing;
}
function removeYaptiTyping(el) { el?.remove(); }

async function sendUserMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const allowed = await consumeYaptiToken();
    if (!allowed) return;

    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    setYaptiLayoutState(true);
    appendChatMessage('user', text);
    saveYaptiMessage('user', text);
    input.value = '';

    const typingEl = showYaptiTyping();

    // Historial de la conversación actual, para que la IA tenga contexto
    const todos = await getYaptiAllMessages();
    const historialActual = todos.filter(m => m.conversation_id === currentYaptiConversationId);

    let aiText;
    try {
        const { data, error } = await supabaseClient.functions.invoke('yapti-ai', {
            body: { message: text, history: historialActual }
        });
        if (error || !data?.reply) throw error || new Error('La IA no devolvió respuesta.');
        aiText = data.reply;
    } catch (err) {
        console.error('YAPTI (IA real) no disponible, usando respuestas de respaldo:', err);
        aiText = respuestaDeRespaldo(text);
    }

    removeYaptiTyping(typingEl);
    appendChatMessage('ai', aiText);
    saveYaptiMessage('ai', aiText);
    loadYaptiConversationsList(); // el título de "Recientes" ya tiene con qué armarse
    if (window.lucide) lucide.createIcons();
}

// Detecta si el usuario llegó desde el enlace de confirmación de correo de Supabase
// (funciona tanto con el flujo por hash como por query string).
function checkEmailVerification() {
    const hashParams = new URLSearchParams((window.location.hash || '').replace('#', '?'));
    const queryParams = new URLSearchParams(window.location.search || '');
    const type = hashParams.get('type') || queryParams.get('type');
    return type === 'signup' || type === 'email_change';
}

window.onload = function() {
    // Verificar si hay sesión iniciada inmediatamente al cargar el documento
    checkSession();

    try {
        if (window.lucide) lucide.createIcons();
    } catch (e) {
        console.error("Error en Lucide:", e);
    }

    const splash = document.getElementById('splash-screen');
    const contenido = document.getElementById('main-content');
    const vieneDeConfirmarCorreo = checkEmailVerification();

    if (vieneDeConfirmarCorreo) {
        // Limpiamos el token de la URL para que no quede visible ni se re-dispare al recargar
        history.replaceState(null, '', window.location.pathname);
    }

    if (splash) {
        setTimeout(() => {
            if (typeof navigateTo === 'function') {
                navigateTo(vieneDeConfirmarCorreo ? '/correo-verificado' : '/');
            }
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                if (contenido) {
                    contenido.style.display = 'block';
                    contenido.style.opacity = '1';
                }
            }, 500);
        }, vieneDeConfirmarCorreo ? 900 : 5000);
    }
    
    // Variable global para almacenar la instancia del mapa y evitar duplicados
let leafletMapInstance = null;

document.querySelectorAll('.dept-trigger').forEach(dept => {
  dept.addEventListener('click', function() {
    const name = this.getAttribute('name');
    const lat = parseFloat(this.getAttribute('data-lat'));
    const lng = parseFloat(this.getAttribute('data-lng'));
    const zoom = parseInt(this.getAttribute('data-zoom')) || 11;

    // 1. Mostrar la sección del mapa detallado
    const seccionDetalle = document.getElementById('mapa-detalle-seccion');
    seccionDetalle.style.display = 'block';
    
    // 2. Actualizar el título de la sección
    document.getElementById('nombre-departamento').textContent = name;

    // 3. Hacer scroll suave hacia la sección
    seccionDetalle.scrollIntoView({ behavior: 'smooth' });

    // 4. Inicializar o actualizar Leaflet
    if (leafletMapInstance) {
      // Si el mapa ya existe, solo movemos la vista suavemente al nuevo destino
      leafletMapInstance.setView([lat, lng], zoom);
    } else {
      // Si es la primera vez que hacen clic, creamos el mapa
      leafletMapInstance = L.map('leaflet-map').setView([lat, lng], zoom);

      // Añadimos la capa de mapa (OpenStreetMap estándar)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMapInstance);
    }

    // Opcional: Añadir un marcador en el centro del departamento escogido
    // Limpiamos marcadores anteriores si es necesario manejando un LayerGroup, 
    // o simplemente dejamos un pin en el centro:
    L.marker([lat, lng]).addTo(leafletMapInstance)
      .bindPopup(`<b>Bienvenido a ${name}</b>`)
      .openPopup();
  });
});

// Lógica para cerrar la sección si el usuario quiere regresar al mapa general
const btnCerrarDetalle = document.getElementById('btn-cerrar-detalle');
const seccionDetalle = document.getElementById('mapa-detalle-seccion');

if (btnCerrarDetalle && seccionDetalle) {
  btnCerrarDetalle.addEventListener('click', () => {
    seccionDetalle.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
}

/* ========================================================================
   SUPABASE — versiones finales sin servidor Node/Express
   ======================================================================== */
async function renderGallery() {
    const container = document.getElementById('gallery-render-container');
    const client = requireSupabase();
    if (!container || !client) return;
    try {
        const { data: gallery, error } = await client
            .from('gallery')
            .select('id, user_id, image_url, location, description, created_at, profiles(username), gallery_likes(count)')
            .order('created_at', { ascending: false });
        if (error) throw error;

        const currentUser = await getAuthenticatedUser();
        const ids = gallery.map(item => item.id);
        let likedIds = new Set();
        let savedIds = new Set();
        if (currentUser && ids.length) {
            const [likes, saves] = await Promise.all([
                client.from('gallery_likes').select('gallery_id').eq('user_id', currentUser.id).in('gallery_id', ids),
                client.from('gallery_saves').select('gallery_id').eq('user_id', currentUser.id).in('gallery_id', ids)
            ]);
            if (likes.error) throw likes.error;
            if (saves.error) throw saves.error;
            likedIds = new Set(likes.data.map(item => item.gallery_id));
            savedIds = new Set(saves.data.map(item => item.gallery_id));
        }
        if (!gallery.length) {
            container.innerHTML = '<p class="no-data-alert">Aún no hay momentos en la bitácora. ¡Sé el primero!</p>';
            return;
        }
        container.innerHTML = gallery.map(item => {
            const liked = likedIds.has(item.id);
            const saved = savedIds.has(item.id);
            const likes = item.gallery_likes?.[0]?.count || 0;
            return `<article class="gallery-card">
                <div class="card-image-wrapper"><img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.location || 'Fotografía viajera')}" class="card-media" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800';"></div>
                <div class="card-content"><h3>${escapeHtml(item.location || 'Destino')}</h3><p>${escapeHtml(item.description || 'Sin descripción.')}</p>
                    <div class="card-actions-bar">
                        <button class="action-btn like-btn ${liked ? 'active' : ''}" onclick="toggleLike(this, ${item.id})" aria-label="Me gusta"><i data-lucide="heart" ${liked ? 'style="fill:#ef4444;color:#ef4444;"' : ''}></i><span class="count-label">${likes}</span></button>
                        <button class="action-btn save-btn ${saved ? 'active' : ''}" onclick="toggleSave(this, ${item.id})" aria-label="Guardar"><i data-lucide="bookmark" ${saved ? 'style="fill:#fbbf24;color:#fbbf24;"' : ''}></i></button>
                    </div><div class="card-footer"><span class="explorer-tag">@${escapeHtml(item.profiles?.username || 'Explorador')}</span></div>
                </div></article>`;
        }).join('');
        if (window.lucide) lucide.createIcons();
    } catch (error) {
        console.error('Error al cargar la galería:', error);
        container.innerHTML = '<p class="no-data-alert" style="color:#ff4a4a;">No se pudo cargar la galería. Revisa Supabase.</p>';
    }
}

async function toggleLike(btn, id) {
    const client = requireSupabase();
    const user = await getAuthenticatedUser();
    if (!client || !user) return showToast('Inicia sesión para dar me gusta.', 'error');
    const query = btn.classList.contains('active')
        ? client.from('gallery_likes').delete().eq('gallery_id', id).eq('user_id', user.id)
        : client.from('gallery_likes').insert({ gallery_id: id, user_id: user.id });
    const { error } = await query;
    if (error) return showToast(error.message, 'error');
    renderGallery();
}

async function toggleSave(btn, id) {
    const client = requireSupabase();
    const user = await getAuthenticatedUser();
    if (!client || !user) return showToast('Inicia sesión para guardar momentos.', 'error');
    const saved = btn.classList.contains('active');
    const query = saved
        ? client.from('gallery_saves').delete().eq('gallery_id', id).eq('user_id', user.id)
        : client.from('gallery_saves').insert({ gallery_id: id, user_id: user.id });
    const { error } = await query;
    if (error) return showToast(error.message, 'error');
    showToast(saved ? 'Removido de tu colección.' : 'Momento guardado en tu colección.');
    renderGallery();
}

function openModal() {
    const modal = document.getElementById('upload-modal');
    if (!modal) return;

    // Abrir de inmediato: no esperamos a la verificación de sesión para que
    // el clic se sienta instantáneo.
    modal.style.display = 'flex';
    modal.classList.remove('hidden');

    getAuthenticatedUser().then(user => {
        if (!user) {
            closeModal();
            showToast('Inicia sesión o regístrate para publicar una fotografía.', 'error');
            navigateTo('/registro');
        }
    });
}

function closeModal() {
    const modal = document.getElementById('upload-modal');
    if (modal) { modal.style.display = 'none'; modal.classList.add('hidden'); }
}

async function handleUploadSubmit(event) {
    event.preventDefault();
    const client = requireSupabase();
    const user = await getAuthenticatedUser();
    const location = document.getElementById('form-location');
    const input = document.getElementById('form-file');
    const description = document.getElementById('form-desc');
    const file = input?.files?.[0];
    if (!client || !user) return showToast('Inicia sesión para publicar una fotografía.', 'error');
    if (!location?.value.trim() || !file) return showToast('Selecciona una imagen y escribe la ubicación.', 'error');
    if (!file.type.startsWith('image/')) return showToast('Solo se permiten imágenes.', 'error');
    if (file.size > 5 * 1024 * 1024) return showToast('La imagen no puede superar 5 MB.', 'error');
    const submit = event.target.querySelector('button[type="submit"]');
    const original = submit?.innerText;
    try {
        if (submit) { submit.disabled = true; submit.innerText = 'PUBLICANDO...'; }
        const path = `${user.id}/${crypto.randomUUID()}.${fileExtension(file)}`;
        const { error: uploadError } = await client.storage.from('gallery').upload(path, file, { contentType: file.type });
        if (uploadError) throw uploadError;
        const { data } = client.storage.from('gallery').getPublicUrl(path);
        const { error: insertError } = await client.from('gallery').insert({ user_id: user.id, image_url: data.publicUrl, location: location.value.trim(), description: description?.value.trim() || '' });
        if (insertError) throw insertError;
        event.target.reset();
        closeModal();
        showToast('¡Tu momento viajero fue publicado!');
        renderGallery();
    } catch (error) {
        console.error('Error al publicar:', error);
        showToast(error.message || 'No se pudo publicar la foto.', 'error');
    } finally {
        if (submit) { submit.disabled = false; submit.innerText = original; }
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const client = requireSupabase();
    const username = document.getElementById('reg-username')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const password = document.getElementById('reg-password')?.value;
    if (!client || !username || !email || !password) return showToast('Completa todos los campos de registro.', 'error');
    const { data, error } = await client.auth.signUp({ email, password, options: { data: { username } } });
    if (error) return showToast(error.message, 'error');
    event.target.reset();
    if (data.session) {
        await syncSessionFromSupabase();
        showToast('¡Cuenta creada! Ya puedes explorar y publicar.');
        navigateTo('/');
    } else {
        showToast('Cuenta creada. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const client = requireSupabase();
    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    if (!client || !email || !password) return showToast('Ingresa tu correo y contraseña.', 'error');
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) return showToast(error.message, 'error');

    // ¿Esta cuenta tiene activada la verificación en dos pasos (2FA)?
    // Si sí, todavía no dejamos pasar: hay que completar el código antes.
    const { data: aal } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
        event.target.reset();
        await openMfaChallenge();
        return;
    }

    const user = await syncSessionFromSupabase();
    event.target.reset();
    showToast(`¡Bienvenido de nuevo, ${user?.username || 'viajero'}!`);
    navigateTo('/');
}

async function handleLogout() {
    window.__logoutManual__ = true;
    if (supabaseClient) await supabaseClient.auth.signOut();
    localStorage.removeItem('viajero_session');
    checkSession();
    showToast('Sesión terminada. ¡Vuelve pronto!');
    navigateTo('/');
}

async function uploadAvatar() {
    const client = requireSupabase();
    const user = await getAuthenticatedUser();
    const input = document.getElementById('avatar-input');
    const file = input?.files?.[0];
    if (!client || !user || !file) return;
    if (!file.type.startsWith('image/')) return showToast('Selecciona una imagen válida.', 'error');
    if (file.size > 2 * 1024 * 1024) return showToast('El avatar no puede superar 2 MB.', 'error');
    try {
        const path = `${user.id}/avatar.${fileExtension(file)}`;
        const { error: uploadError } = await client.storage.from('avatars').upload(path, file, { contentType: file.type, upsert: true });
        if (uploadError) throw uploadError;
        const { data } = client.storage.from('avatars').getPublicUrl(path);
        const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
        const { error: profileError } = await client.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
        if (profileError) throw profileError;
        await syncSessionFromSupabase();
        showToast('¡Imagen de perfil actualizada!');
    } catch (error) { showToast(error.message || 'No se pudo actualizar el avatar.', 'error'); }
}

async function saveProfile() {
    const client = requireSupabase();
    const user = await getAuthenticatedUser();
    const username = document.getElementById('edit-username')?.value.trim();
    const city = document.getElementById('edit-city')?.value.trim();
    if (!client || !user || !username) return showToast('El nombre de usuario no puede quedar vacío.', 'error');
    const { error } = await client.from('profiles').update({ username, city: city || 'Granada' }).eq('id', user.id);
    if (error) return showToast(error.message, 'error');
    await syncSessionFromSupabase();
    toggleEdit();
    showToast('¡Perfil de explorador actualizado!');
}

/* ==========================================================================
    VERIFICACIÓN EN DOS PASOS (2FA) — Supabase Auth MFA (TOTP)
   ========================================================================== */

async function getMfaStatus() {
    if (!supabaseClient) return { enrolled: false, factorId: null };
    const { data, error } = await supabaseClient.auth.mfa.listFactors();
    if (error) { console.error('No se pudo leer el estado de 2FA:', error); return { enrolled: false, factorId: null }; }
    const verificado = (data?.totp || []).find(f => f.status === 'verified');
    return { enrolled: Boolean(verificado), factorId: verificado?.id || null };
}

async function renderMfaStatus() {
    const box = document.getElementById('mfa-status-box');
    if (!box) return;

    const user = await getAuthenticatedUser();
    if (!user) { box.innerHTML = ''; return; }

    const { enrolled, factorId } = await getMfaStatus();
    box.innerHTML = enrolled
        ? `<span class="profile-value plan-status-active">Activada ✓</span>
           <button type="button" class="btn btn-danger" onclick="desactivarMfa('${factorId}')">Desactivar</button>`
        : `<span class="profile-value">Desactivada</span>
           <button type="button" class="btn btn-secondary" onclick="iniciarActivacionMfa()">Activar verificación en dos pasos</button>`;
}

async function iniciarActivacionMfa() {
    const client = requireSupabase();
    if (!client) return;

    const { data, error } = await client.auth.mfa.enroll({ factorType: 'totp' });
    if (error) { showToast(error.message, 'error'); return; }

    window.__mfaEnrollFactorId = data.id;
    document.getElementById('mfa-qr-img').src = data.totp.qr_code;
    document.getElementById('mfa-secret-text').textContent = data.totp.secret;

    const modal = document.getElementById('mfa-enroll-modal');
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

function closeMfaEnrollModal() {
    const client = requireSupabase();
    // Si cierran el modal sin confirmar el código, deshacemos el enrolamiento
    // a medias para no dejar un factor "unverified" colgado en la cuenta.
    if (client && window.__mfaEnrollFactorId) {
        client.auth.mfa.unenroll({ factorId: window.__mfaEnrollFactorId }).catch(() => {});
    }
    window.__mfaEnrollFactorId = null;
    document.getElementById('mfa-enroll-code').value = '';
    const modal = document.getElementById('mfa-enroll-modal');
    modal.style.display = 'none';
    modal.classList.add('hidden');
}

async function confirmarActivacionMfa(event) {
    event.preventDefault();
    const client = requireSupabase();
    const code = document.getElementById('mfa-enroll-code')?.value.trim();
    const factorId = window.__mfaEnrollFactorId;
    if (!client || !factorId || !code) return;

    const { data: challenge, error: errChallenge } = await client.auth.mfa.challenge({ factorId });
    if (errChallenge) { showToast(errChallenge.message, 'error'); return; }

    const { error: errVerify } = await client.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    if (errVerify) { showToast('Código incorrecto. Revisa tu app de autenticación e intenta de nuevo.', 'error'); return; }

    window.__mfaEnrollFactorId = null; // ya quedó verificado, closeMfaEnrollModal no debe desenrolarlo
    showToast('¡Verificación en dos pasos activada!');
    closeMfaEnrollModal();
    renderMfaStatus();
}

async function desactivarMfa(factorId) {
    if (!factorId) return;
    if (!confirm('¿Desactivar la verificación en dos pasos? Tu cuenta quedará protegida solo con tu contraseña.')) return;

    const client = requireSupabase();
    const { error } = await client.auth.mfa.unenroll({ factorId });
    if (error) { showToast(error.message, 'error'); return; }

    showToast('Verificación en dos pasos desactivada.');
    renderMfaStatus();
}

// --- Pedir el código de 2FA al iniciar sesión (si la cuenta lo tiene activado) ---
async function openMfaChallenge() {
    const client = requireSupabase();
    const { data, error } = await client.auth.mfa.listFactors();
    if (error) { showToast(error.message, 'error'); return; }

    const factor = (data?.totp || []).find(f => f.status === 'verified');
    if (!factor) return;

    window.__mfaChallengeFactorId = factor.id;
    document.getElementById('mfa-challenge-code').value = '';
    const modal = document.getElementById('mfa-challenge-modal');
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

function closeMfaChallenge() {
    const modal = document.getElementById('mfa-challenge-modal');
    modal.style.display = 'none';
    modal.classList.add('hidden');
}

async function verificarMfaChallenge(event) {
    event.preventDefault();
    const client = requireSupabase();
    const code = document.getElementById('mfa-challenge-code')?.value.trim();
    const factorId = window.__mfaChallengeFactorId;
    if (!client || !factorId || !code) return;

    const { data: challenge, error: errChallenge } = await client.auth.mfa.challenge({ factorId });
    if (errChallenge) { showToast(errChallenge.message, 'error'); return; }

    const { error: errVerify } = await client.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    if (errVerify) { showToast('Código incorrecto. Intenta de nuevo.', 'error'); return; }

    closeMfaChallenge();
    const user = await syncSessionFromSupabase();
    showToast(`¡Bienvenido de nuevo, ${user?.username || 'viajero'}!`);
    navigateTo('/');
}

window.addEventListener('load', () => {
    syncSessionFromSupabase();
    if (supabaseClient) {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                syncSessionFromSupabase();
                return;
            }

            const habiaSesion = !!localStorage.getItem('viajero_session');
            localStorage.removeItem('viajero_session');
            checkSession();

            // Si había sesión y se cerró sola (no por "Cerrar Sesión"), es una
            // expiración real: avisamos en vez de dejar botones que fallan en silencio.
            if (event === 'SIGNED_OUT' && habiaSesion && !window.__logoutManual__) {
                showToast('Tu sesión expiró. Inicia sesión de nuevo.', 'error');
                navigateTo('/registro');
            }
            window.__logoutManual__ = false;
        });
    }
});