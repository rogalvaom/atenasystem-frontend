class Router {
    constructor() {
        this.url = window.location.pathname;
        this.baseUrl = (typeof ENV !== 'undefined' && ENV.BASE_URL) || window.basePath || '';
        this.apiUrl = (typeof ENV !== 'undefined' && ENV.API_URL) || window.apiUrl || this.baseUrl;
    }

    pathWeb(requestUrl, routes) {
        let urlParts = requestUrl.split('?');
        let url = urlParts[0];

        // Se for a raiz ou vazio, mapeia para '/'
        if (url.endsWith('index.html') || url === '/' || url === '') {
            url = '/';
        } else {
            url = '/' + url.replace(/^\/+/, '');
        }

        for (const route of routes) {
            const routePath = route[0];
            const routeWeb = '/public/view' + route[1];

            if (url === routePath || (routePath === '/' && (url === '/' || url === ''))) {
                return routeWeb;
            }
        }

        return '/public/view/404.html';
    }

    runWeb(routes) {
        const filePath = this.pathWeb(this.url, routes);
        
        fetch(filePath)
            .then(response => {
                if (!response.ok) throw new Error('Página não encontrada');
                return response.text();
            })
            .then(html => {
                document.open();
                document.write(html);
                document.close();
            })
            .catch(() => {
                fetch('public/view/404.html')
                    .then(res => res.text())
                    .then(html => {
                        document.open();
                        document.write(html);
                        document.close();
                    });
            });
    }
}

