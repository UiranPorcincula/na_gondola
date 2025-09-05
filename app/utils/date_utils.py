from datetime import datetime

def format_date(date_str):
    """Converte string de data para formato YYYY-MM-DD"""
    if date_str:
        try:
            # Tentativa de converter data no formato 'dd/mm/yyyy'
            return datetime.strptime(date_str, '%d/%m/%Y').strftime('%Y-%m-%d')
        except ValueError:
            try:
                # Tentativa de converter data no formato 'yyyy-mm-dd'
                return datetime.strptime(date_str, '%Y-%m-%d').strftime('%Y-%m-%d')
            except ValueError:
                # Retorna None se a data não estiver em nenhum dos formatos esperados
                return None
    return None