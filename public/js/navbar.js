export function renderNavbar() {
    const navbar = document.getElementById('atn-navbar');
    if (!navbar || !navbar.hasAttribute('data-shared-navbar')) return;

    navbar.innerHTML = `
        <div class="atn-navbar-inner">
            <div class="atn-navbar-brand">
                <button class="atn-sidebar-toggle" id="sidebar-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="atn-sidebar">
                    <i class="fas fa-bars" aria-hidden="true"></i>
                </button>
                <a href="/home" class="atn-logo" aria-label="AtenaSystem - Início">
                    <span><span class="atn-logo-accent">Atena</span><span>System</span></span>
                </a>
            </div>
            <a class="atn-navbar-partner" href="http://rogalvaom.page.gd/" target="_blank" rel="noopener noreferrer" aria-label="@rogalvaom">
                <img src="/public/img/rogalvaom.png" alt="@rogalvaom">
            </a>
        </div>
    `;
}