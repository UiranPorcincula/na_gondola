def utility_processor():
    def todos_pontos_registrados(registro):
        return all([
            registro.entrada,
            registro.inicio_almoco,
            registro.fim_almoco,
            registro.saida
        ])
    return dict(todos_pontos_registrados=todos_pontos_registrados)