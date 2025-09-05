def format_price(value):
    return f'R${value:.2f}' if value is not None else ''

def format_value(value):
    # Verificar se o valor é uma string e está no formato '%Y-%m-%d'
    from datetime import datetime
    if isinstance(value, str):
        try:
            # Tentar converter a string para um objeto de data
            value = datetime.strptime(value, '%Y-%m-%d')
        except ValueError:
            # Se não for possível converter, retornar o valor original
            return value
    # Verificar se o valor é um objeto de data
    if isinstance(value, datetime):
        # Formatar a data no formato '%d/%m/%Y'
        return value.strftime('%d/%m/%Y')
    return ''