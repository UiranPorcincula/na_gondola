import sys
from pathlib import Path

# Adiciona o diretório atual ao caminho de pesquisa do Python
sys.path.insert(0, str(Path(__file__).parent))

from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5000, debug=True)