const publicPaths = new Set(['/', '/login']);
const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';

function getStoredModulos() {
    try {
        const stored = localStorage.getItem('atn_modulos');
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

export const authReady = (async function() {
    if (publicPaths.has(currentPath)) return { public: true };

    document.body.style.visibility = 'hidden';
    
    let session = null;
    try {
        session = apiGet('/session');
        if (session && session.modulos) {
            localStorage.setItem('atn_modulos', JSON.stringify(session.modulos));
        }
    } catch {}

    if (!session) {
        window.addEventListener('online', () => window.location.reload(), { once: true });
        return new Promise(() => {});
    }

    if (!session.logged) {
        window.location.replace('/login');
        return new Promise(() => {});
    }

    const modulos = session.modulos || getStoredModulos();
    
    const pathToModuleId = {
        '/home': 'home',
        '/representante': 'representante',
        '/comissao': 'comissao',
        '/monitore': 'monitore',
        '/tutore': 'tutore',
        '/tutore/justificar': 'tutore-justificar',
        '/tutore/presenca': 'tutore-presenca',
        '/alune': 'alune',
        '/alune/justificar': 'alune-justificar',
        '/disciplina': 'disciplina',
        '/sala': 'sala',
        '/presenca/alune': 'presenca-alune',
        '/presenca/tutore': 'presenca-tutore',
        '/presenca/monitore': 'presenca-monitore',
        '/presenca/reuniao': 'presenca-reuniao',
        '/certificado': 'certificado-monitore',
        '/certificado/tutore': 'certificado-tutore',
        '/relatorio/alune': 'relatorio-alune',
        '/relatorio/tutore': 'relatorio-tutore',
        '/relatorio/monitore': 'relatorio-monitore',
        '/relatorio/reuniao': 'relatorio-reuniao'
    };

    const moduleId = pathToModuleId[currentPath];
    if (modulos && moduleId && !modulos.includes(moduleId)) {
        window.location.replace('/home');
        return new Promise(() => {});
    }

    if (modulos) {
        document.querySelectorAll('[data-feature], a[href]').forEach(element => {
            const featureId = element.dataset.feature;
            const path = featureId || new URL(element.href, window.location.origin).pathname.replace(/\/+$/, '') || '/';
            const mappedId = pathToModuleId[path] || featureId;
            if (mappedId && !modulos.includes(mappedId)) {
                element.hidden = true;
                element.setAttribute('aria-hidden', 'true');
                element.style.display = 'none';
            }
        });
    }

    document.body.style.visibility = 'visible';
    return session;
})();

window.atnAuthReady = authReady;
