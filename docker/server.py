import http.server
import os

class SPAHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Se for um arquivo estático existente (js, css, png, etc.), serve normalmente
        path = self.translate_path(self.path)
        if os.path.exists(path) and not os.path.isdir(path):
            return super().do_GET()
        
        # Caso contrário, serve o index.html principal para o SPA Router tratar a rota
        self.path = '/index.html'
        return super().do_GET()

if __name__ == '__main__':
    server_address = ('', 8000)
    httpd = http.server.HTTPServer(server_address, SPAHTTPRequestHandler)
    print("Servidor SPA rodando na porta 8000...")
    httpd.serve_forever()
