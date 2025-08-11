    document.addEventListener('DOMContentLoaded', () => {
        const messagesContainer = document.getElementById('messages-container');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');

        // Mock de mensagens iniciais
        const initialMessages = [
            { text: 'Olá! Bem-vindo à equipe de vendas.', author: 'Sistema', type: 'received' },
            { text: 'Bom dia! Alguma novidade sobre a proposta para o Cliente X?', author: 'Ana', type: 'received' },
            { text: 'Bom dia, Ana! Acabei de enviar a proposta atualizada para eles.', author: 'Você', type: 'sent' },
            { text: 'Ótimo! Fico no aguardo do retorno deles.', author: 'Ana', type: 'received' }
        ];

        // Função para adicionar uma mensagem na tela
        function addMessage(text, author, type) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', type);

            const contentElement = document.createElement('div');
            contentElement.classList.add('message-content');

            if (type === 'received') {
                const authorElement = document.createElement('p');
                authorElement.classList.add('message-author');
                authorElement.textContent = author;
                contentElement.appendChild(authorElement);
            }

            const textElement = document.createElement('p');
            textElement.textContent = text;
            contentElement.appendChild(textElement);

            messageElement.appendChild(contentElement);
            messagesContainer.appendChild(messageElement);

            // Rolar para a mensagem mais recente
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Carregar mensagens iniciais
        initialMessages.forEach(msg => addMessage(msg.text, msg.author, msg.type));

        // Função para enviar mensagem
        function sendMessage() {
            const text = messageInput.value.trim();
            if (text) {
                addMessage(text, 'Você', 'sent');
                messageInput.value = '';
                messageInput.focus();

                // Simular resposta automática após um tempo
                setTimeout(() => {
                    addMessage('Mensagem recebida!', 'Bot', 'received');
                }, 1000);
            }
        }

        // Event listeners
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    });
