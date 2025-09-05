    <script>
        window.addEventListener('DOMContentLoaded', () => {
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            // Função para remover os alertas quando o usuário clicar em qualquer outra área da página
            document.addEventListener('click', () => {
                document.getElementById('usernameAlert').innerText = '';
                document.getElementById('passwordAlert').innerText = '';
            });

            usernameInput.addEventListener('input', () => {
                const usernameValue = usernameInput.value;
                if (usernameValue.includes(' ')) {
                    document.getElementById('usernameAlert').innerText = 'Não é permitido espaços';
                    usernameInput.value = usernameValue.replace(/\s/g, ''); // Remove os espaços em branco
                } else {
                    document.getElementById('usernameAlert').innerText = '';
                }
            });

            passwordInput.addEventListener('input', () => {
                const passwordValue = passwordInput.value;
                if (passwordValue.includes(' ')) {
                    document.getElementById('passwordAlert').innerText = 'Não é permitido espaços';
                    passwordInput.value = passwordValue.replace(/\s/g, ''); // Remove os espaços em branco
                } else {
                    document.getElementById('passwordAlert').innerText = '';
                }
            });
        });
    </script>