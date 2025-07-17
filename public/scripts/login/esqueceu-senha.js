const API_URL = 'http://localhost:3000/api/auth/forgot-password';

document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Documento carregado.');

    const form = document.getElementById('forgot-form');
    if (!form) {
        console.error('[DEBUG] ERRO: Formulário #forgot-form não encontrado!');
        return;
    }

    const emailInput = document.getElementById('email');
    const mensagemDiv = document.getElementById('mensagem-sucesso');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    const setMensagem = (text, tipo) => {
        console.log(`[DEBUG] setMensagem: texto="${text}", tipo="${tipo}"`);
        mensagemDiv.textContent = text;
        mensagemDiv.className = tipo;
    };

    form.addEventListener('submit', async (e) => {
        console.log('[DEBUG] 1. Evento de submit iniciado.');
        e.preventDefault();
        console.log('[DEBUG] 2. preventDefault() foi chamado.');

        setMensagem('', '');
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            console.log('[DEBUG] Validação de e-mail falhou.');
            setMensagem('Por favor, insira um formato de e-mail válido.', 'erro');
            return;
        }
        console.log('[DEBUG] 3. Validação de e-mail passou.');

        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';

        try {
            console.log('[DEBUG] 4. Entrando no bloco TRY.');
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            console.log(`[DEBUG] 5. Resposta da API recebida. Status: ${response.status}`);

            const responseText = await response.text();
            console.log(`[DEBUG] 6. Corpo da resposta como texto: "${responseText}"`);

            if (!responseText) {
                throw new Error("A resposta do servidor está vazia.");
            }

            const data = JSON.parse(responseText);
            console.log('[DEBUG] 7. JSON.parse funcionou. Dados:', data);

            if (!response.ok) {
                console.log('[DEBUG] 8. Resposta NÃO foi OK. Lançando erro.');
                throw new Error(data.error || 'Erro na resposta da API.');
            }

            console.log('[DEBUG] 9. Resposta foi OK. Atualizando mensagem de sucesso.');
            setMensagem(data.message || 'Instruções enviadas!', 'sucesso');
            
            console.log('[DEBUG] 10. Resetando o formulário.');
            form.reset();
            console.log('[DEBUG] 11. Formulário resetado.');

        } catch (error) {
            console.error('[DEBUG] ERRO CAPTURADO NO BLOCO CATCH!');
            console.error('[DEBUG] Objeto do erro:', error);
            setMensagem(error.message || 'Ocorreu um erro inesperado.', 'erro');
        } finally {
            console.log('[DEBUG] 12. Entrando no bloco FINALLY.');
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            console.log('[DEBUG] 13. Bloco FINALLY concluído. Fim do handler.');
        }
    });
});