import base64

def convert_to_base64(file):
    """Converte um arquivo para base64"""
    return base64.b64encode(file.read()).decode('utf-8') if file else None