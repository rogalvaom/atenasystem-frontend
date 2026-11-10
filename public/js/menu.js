import { authReady } from './auth.js';

const session = await authReady;

const [{ renderNavbar }] = await Promise.all([
    import('./navbar.js'),
    import('./components.js')
]);

const MENU_ITEMS = [
    { path: '/representante', moduleId: 'representante', label: 'Representante', icon: 'fa-user-plus' },
    { path: '/comissao', moduleId: 'comissao', label: 'Comissão de Faltas', icon: 'fa-address-book' },
    { path: '/monitore', moduleId: 'monitore', label: 'Monitore', icon: 'fa-user-circle' },
    { path: '/tutore', modePath: '/tutore/justificar', moduleId: 'tutore', label: 'Tutore', icon: 'fa-user' },
    { path: '/alune', moduleId: 'alune', label: 'Alune', icon: 'fa-graduation-cap' },
    { path: '/disciplina', moduleId: 'disciplina', label: 'Disciplina', icon: 'fa-book-open' },
    { path: '/sala', moduleId: 'sala', label: 'Sala', icon: 'fa-university' },
    { path: '/presenca', modePath: '/presenca/reuniao', moduleId: 'presenca-alune', label: 'Presença', icon: 'fa-calendar' },
    { path: '/certificado', moduleId: 'certificado-monitore', label: 'Certificado', icon: 'fa-file-pdf' },
    { path: '/relatorio', modePath: '/relatorio/reuniao', moduleId: 'relatorio-alune', label: 'Relatório', icon: 'fa-chart-column' }
];

function getStoredModulos() {
    try {
        const stored = localStorage.getItem('atn_modulos');
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

function renderMenu(mode) {
    const nav = document.getElementById('atn-sidebar-nav');
    if (!nav) return;

    const modulos = (session && session.modulos) || getStoredModulos() || [];
    
    const visibleItems = MENU_ITEMS.filter(item => {
        if (item.moduleId === 'presenca-alune') {
            return modulos.includes('presenca-alune') || modulos.includes('presenca-tutore') || modulos.includes('presenca-monitore') || modulos.includes('presenca-reuniao');
        }
        if (item.moduleId === 'relatorio-alune') {
            return modulos.includes('relatorio-alune') || modulos.includes('relatorio-tutore') || modulos.includes('relatorio-monitore') || modulos.includes('relatorio-reuniao');
        }
        return modulos.includes(item.moduleId);
    });

    nav.innerHTML = `
        <ul style="list-style:none; padding:0; margin:0; font-family:'Inter',sans-serif;">
            <li class="atn-menu-item"><a href="/home"><i class="fas fa-house"></i> Início</a></li>
            ${visibleItems.map(item => `
                <li class="atn-menu-item"><a href="${mode === 'comissao' && item.modePath ? item.modePath : item.path}"><i class="fas ${item.icon}"></i> ${item.label}</a></li>
            `).join('')}
            <li class="atn-menu-item logout"><a id="atn-logout-link" href="/login"><i class="fas fa-power-off"></i> Logout</a></li>
        </ul>
    `;

    const logoutLink = nav.querySelector('#atn-logout-link');
    logoutLink?.addEventListener('click', function(event) {
        event.preventDefault();
        logoutLink.setAttribute('aria-busy', 'true');

        try {
            const response = apiPost('/logout');
            if (response && response.access) {
                window.location.replace('/login');
            } else {
                throw new Error('Falha ao encerrar a sessão.');
            }
        } catch {
            logoutLink.removeAttribute('aria-busy');
            alert('Não foi possível encerrar a sessão. Tente novamente.');
        }
    });
}

function renderActiveMenuItem() {
    const nav = document.getElementById('atn-sidebar-nav');
    if (!nav) return;

    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
    const candidates = Array.from(nav.querySelectorAll('a[href^="/"]'))
        .map(link => ({
            link: link,
            path: new URL(link.href, window.location.origin).pathname.replace(/\/+$/, '') || '/'
        }))
        .filter(item => currentPath === item.path || currentPath.startsWith(`${item.path}/`))
        .sort((first, second) => second.path.length - first.path.length);

    const activeItem = candidates[0];
    if (!activeItem) return;

    activeItem.link.classList.add('active');
    activeItem.link.setAttribute('aria-current', currentPath === activeItem.path ? 'page' : 'location');
}

const pageSections = [
    { path: '/home', label: 'Visão geral', icon: 'fa-house' },
    { path: '/alune', label: 'Gestão de alunes', icon: 'fa-graduation-cap' },
    { path: '/comissao', label: 'Controle de faltas', icon: 'fa-address-book' },
    { path: '/disciplina', label: 'Gestão acadêmica', icon: 'fa-book-open' },
    { path: '/monitore', label: 'Gestão de monitores', icon: 'fa-user-circle' },
    { path: '/representante', label: 'Equipe de coordenação', icon: 'fa-user-plus' },
    { path: '/sala', label: 'Gestão de salas', icon: 'fa-university' },
    { path: '/tutore', label: 'Gestão de tutores', icon: 'fa-user' },
    { path: '/presenca', label: 'Controle de presença', icon: 'fa-clipboard-check' },
    { path: '/certificado', label: 'Emissão de certificados', icon: 'fa-award' },
    { path: '/relatorio', label: 'Indicadores de frequência', icon: 'fa-chart-column' }
];

function renderPageEyebrow() {
    const main = document.querySelector('.atn-main');
    if (!main || main.querySelector('.atn-page-eyebrow, .report-eyebrow, .attendance-eyebrow, .certificate-eyebrow')) return;

    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const section = pageSections.find(item => path === item.path || path.startsWith(`${item.path}/`));
    const heading = main.querySelector('h2, h1');
    if (!section || !heading || !heading.parentElement) return;

    const eyebrow = document.createElement('p');
    eyebrow.className = 'atn-page-eyebrow';
    const icon = document.createElement('i');
    icon.className = `fas ${section.icon}`;
    icon.setAttribute('aria-hidden', 'true');
    eyebrow.append(icon, document.createTextNode(section.label));
    heading.parentElement.insertBefore(eyebrow, heading);
}

function initializeResponsiveMenu() {
    const sidebar = document.querySelector('.atn-sidebar');
    const toggle = document.getElementById('sidebar-toggle');
    if (!sidebar || !toggle) return;

    sidebar.id = 'atn-sidebar';
    sidebar.querySelector('.atn-sidebar-header')?.remove();
    sidebar.querySelector('.atn-sidebar-close')?.remove();

    let overlay = document.querySelector('.atn-sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'atn-sidebar-overlay';
        overlay.id = 'sidebar-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.append(overlay);
    }

    toggle.setAttribute('aria-controls', sidebar.id);

    function closeMenu(restoreFocus = false) {
        const wasOpen = sidebar.classList.contains('show');
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('atn-sidebar-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menu');
        if (restoreFocus && wasOpen) toggle.focus();
    }

    function openMenu() {
        sidebar.classList.add('show');
        overlay.classList.add('show');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('atn-sidebar-open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Fechar menu');
        sidebar.querySelector('a')?.focus();
    }

    toggle.addEventListener('click', function() {
        if (sidebar.classList.contains('show')) {
            closeMenu();
        } else {
            openMenu();
        }
    });
    overlay.addEventListener('click', function() {
        closeMenu(true);
    });
    sidebar.addEventListener('click', function(event) {
        if (event.target.closest('a') && window.matchMedia('(max-width: 767.98px)').matches) {
            closeMenu();
        }
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') closeMenu(true);
    });
}

function getPageScriptPath(path) {
    const sections = ['alune', 'comissao', 'disciplina', 'monitore', 'representante', 'sala', 'tutore'];
    const section = path.split('/')[1];

    if (section === 'home') return '/public/view/home/index.js';
    if (sections.includes(section)) return `/public/view/${section}/index.js`;
    if (section === 'presenca' || section === 'relatorio') {
        const page = path.split('/')[2] || (section === 'presenca' ? 'alune' : 'alune');
        return `/public/view/${section}/${page}.js`;
    }

    return null;
}

async function loadPageScript() {
    if (document.getElementById('page-script')) return;

    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const scriptPath = getPageScriptPath(path);
    if (scriptPath) await import(scriptPath);

    if (path.startsWith('/certificado')) {
        for (const src of ['/core/html2canvas.js', '/public/js/certificado.js']) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.body.append(script);
            });
        }
    }

    document.dispatchEvent(new CustomEvent('atn:auth-ready', { detail: session }));
}

renderNavbar();
renderMenu(session.modo);
renderActiveMenuItem();
renderPageEyebrow();
initializeResponsiveMenu();
await loadPageScript();

document.addEventListener('atn:content-loaded', renderPageEyebrow);
