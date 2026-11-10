class Api {
    static getUrlParameters() {
        const url = window.location.href;
        const queryString = url.split('?')[1];
        if (!queryString) return {};

        const params = queryString.split('&');
        const result = {};

        params.forEach(param => {
            const [key, value] = param.split('=');
            result[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });

        return result;
    }

    static getFormData(form) {
        const formData = new FormData(form);
        const jsonData = {};
        const arrayFields = new Set();

        for (let element of form.elements) {
            if (element.name && element.name.endsWith('[]')) {
                arrayFields.add(element.name);
            }
        }

        arrayFields.forEach(name => {
            jsonData[name] = [];
        });

        formData.forEach((value, key) => {
            const trimmed = value.trim();

            if (arrayFields.has(key)) {
                if (trimmed !== '') {
                    jsonData[key].push(trimmed);
                }
            } else {
                jsonData[key] = trimmed !== '' ? trimmed : null;
            }
        });

        return jsonData;
    }

    static request(method, url, data = null) {
        let responseData = null;
        let requestData = data;
        let requestHeaders = {};
        let processData = true;
        let contentType = undefined;

        if (data instanceof FormData) {
            requestHeaders = {};
            processData = false;
            contentType = false;
        } else if (data !== null) {
            requestData = JSON.stringify(data);
            requestHeaders = {
                "Content-Type": "application/json",
            };
        }

        $.ajax({
            method: method,
            url: ((typeof ENV !== 'undefined' && ENV.API_URL) || '') + '/api' + url,
            data: requestData,
            headers: requestHeaders,
            xhrFields: {
                withCredentials: true
            },
            processData: processData,
            contentType: contentType,
            async: false,
            complete: function(response) {
                try {
                    responseData = JSON.parse(response.responseText);
                } catch (e) {
                    responseData = response.responseText;
                }
            }
        });

        return responseData;
    }

    static get(url, data = null) {
        return this.request("GET", url, data);
    }

    static post(url, data = null) {
        return this.request("POST", url, data);
    }

    static put(url, data = null) {
        return this.request("PUT", url, data);
    }

    static delete(url, data = null) {
        return this.request("DELETE", url, data);
    }
}

// Funções globais de compatibilidade
window.getUrlParameters = () => Api.getUrlParameters();
window.getFormData = (form) => Api.getFormData(form);
window.apiGet = (url, data) => Api.get(url, data);
window.apiPost = (url, data) => Api.post(url, data);
window.apiPut = (url, data) => Api.put(url, data);
window.apiDelete = (url, data) => Api.delete(url, data);
