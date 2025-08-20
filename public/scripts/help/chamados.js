document.addEventListener('DOMContentLoaded', () => {

    const btnNovoChamado = document.getElementById('btnNovoChamado');
    const modalChamado = document.getElementById('modalChamado');
    const formChamado = document.getElementById('formChamado');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelarModalBtn = document.getElementById('cancelarModalBtn');
    const cardsChamadosContainer = document.querySelector('.cards-chamados');
    
    // Contadores para os cartões de resumo
    const contadorAbertos = document.querySelector('.card-resumo:nth-child(1) .card-resumo-numero');
    const contadorEmAndamento = document.querySelector('.card-resumo:nth-child(2) .card-resumo-numero');
    const contadorFinalizados = document.querySelector('.card-resumo:nth-child(3) .card-resumo-numero');

    let modoEdicao = false;
    let chamadoEmEdicao = null;
    let proximoNumeroChamado = cardsChamadosContainer.children.length + 1;

    const fecharModal = () => {
        modalChamado.classList.add('hidden');
        formChamado.reset();
        modoEdicao = false;
        chamadoEmEdicao = null;
        document.querySelector('#modalChamado h3').textContent = 'Novo Chamado';
        document.getElementById('salvarModalBtn').textContent = 'Salvar'; // Revertido para "Salvar"
    };

    const atualizarContadores = () => {
        const abertos = cardsChamadosContainer.querySelectorAll('.chamado-status.status-aberto').length;
        const emAndamento = cardsChamadosContainer.querySelectorAll('.chamado-status.status-em-andamento').length;
        const finalizados = cardsChamadosContainer.querySelectorAll('.chamado-status.status-finalizado').length;

        contadorAbertos.textContent = abertos;
        contadorEmAndamento.textContent = emAndamento;
        contadorFinalizados.textContent = finalizados;
    };

    const criarCardChamado = (numero, titulo, descricao, prioridade, responsavel) => {
        const dataCriacao = new Date().toLocaleDateString('pt-BR');
        
        const prioridadeClass = prioridade.toLowerCase();
        let prioridadeTexto = '';
        if (prioridade === 'Alta') prioridadeTexto = 'Alta Prioridade';
        if (prioridade === 'Media') prioridadeTexto = 'Media Prioridade';
        if (prioridade === 'Baixa') prioridadeTexto = 'Baixa Prioridade';

        return `
            <div class="card-chamado" data-chamado-id="${numero}" data-prioridade="${prioridade}">
                <div class="card-chamado-top">
                    <span class="chamado-id">#${numero}</span>
                    <h4 class="chamado-titulo">${titulo}</h4>
                    <div class="chamado-actions">
                        <button class="dots-btn">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="dots-menu">
                            <button class="btn-editar">Editar</button>
                            <button class="btn-excluir">Excluir</button>
                        </div>
                    </div>
                </div>
                <div class="card-chamado-middle">
                    <p class="chamado-descricao">${descricao}</p>
                </div>
                <div class="card-chamado-bottom">
                    <div class="chamado-info">
                        <span class="chamado-user">
                            <i class="fas fa-user user-icon"></i>${responsavel}
                        </span>
                        <span class="chamado-date">${dataCriacao}</span>
                        <span class="chamado-prioridade prioridade-${prioridadeClass}">${prioridadeTexto}</span>
                    </div>
                    <div class="chamado-status-wrapper">
                        <span class="chamado-status status-aberto">Aberto</span>
                        <div class="status-menu hidden">
                            <button data-status="Aberto">Aberto</button>
                            <button data-status="Em Andamento">Em Andamento</button>
                            <button data-status="Finalizado">Finalizado</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    const ordenarChamados = () => {
        const cards = Array.from(cardsChamadosContainer.querySelectorAll('.card-chamado'));
        
        cards.sort((a, b) => {
            const statusA = a.querySelector('.chamado-status').textContent.trim();
            const statusB = b.querySelector('.chamado-status').textContent.trim();
            
            const isFinalizadoA = statusA === 'Finalizado';
            const isFinalizadoB = statusB === 'Finalizado';

            // Coloca os finalizados no final da lista
            if (isFinalizadoA && !isFinalizadoB) return 1;
            if (!isFinalizadoA && isFinalizadoB) return -1;

            // Se ambos são finalizados ou não-finalizados, ordena por prioridade
            const prioridadeOrdem = { 'Alta': 3, 'Media': 2, 'Baixa': 1 };
            const prioA = prioridadeOrdem[a.dataset.prioridade] || 0;
            const prioB = prioridadeOrdem[b.dataset.prioridade] || 0;
            return prioB - prioA;
        });

        cards.forEach(card => cardsChamadosContainer.appendChild(card));
    };

    const setStatus = (element, newStatus) => {
        const newClass = `status-${newStatus.toLowerCase().replace(' ', '-')}`;
        element.textContent = newStatus;
        element.className = `chamado-status ${newClass}`;
    };

    btnNovoChamado.addEventListener('click', () => {
        modalChamado.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', fecharModal);
    cancelarModalBtn.addEventListener('click', fecharModal);

    modalChamado.addEventListener('click', (event) => {
        if (event.target === modalChamado) {
            fecharModal();
        }
    });

    formChamado.addEventListener('submit', (event) => {
        event.preventDefault();

        const titulo = document.getElementById('tituloChamado').value;
        const descricao = document.getElementById('descricaoChamado').value;
        const prioridade = document.getElementById('prioridadeChamado').value;
        const prazo = document.getElementById('prazoChamado').value;
        const responsavel = document.getElementById('responsavelChamado').value;

        if (modoEdicao) {
            chamadoEmEdicao.querySelector('.chamado-titulo').textContent = titulo;
            chamadoEmEdicao.querySelector('.chamado-descricao').textContent = descricao;
            chamadoEmEdicao.querySelector('.chamado-prioridade').textContent = prioridade + ' Prioridade';
            chamadoEmEdicao.querySelector('.chamado-prioridade').className = `chamado-prioridade prioridade-${prioridade.toLowerCase()}`;
            chamadoEmEdicao.dataset.prioridade = prioridade;
            fecharModal();
            ordenarChamados();
            atualizarContadores();
        } else {
            const novoCardHtml = criarCardChamado(proximoNumeroChamado, titulo, descricao, prioridade, responsavel);
            cardsChamadosContainer.insertAdjacentHTML('beforeend', novoCardHtml);
            proximoNumeroChamado++;
            fecharModal();
            ordenarChamados();
            atualizarContadores();
        }
    });

    document.addEventListener('click', (event) => {
        // Lógica para o menu de 3 pontos
        const dotsBtn = event.target.closest('.dots-btn');
        if (dotsBtn) {
            const dotsMenu = dotsBtn.nextElementSibling;
            dotsMenu.classList.toggle('visible');

            document.querySelectorAll('.dots-menu.visible').forEach(menu => {
                if (menu !== dotsBtn.nextElementSibling) {
                    menu.classList.remove('visible');
                }
            });
            return;
        }

        // Lógica para o menu de status
        const statusElement = event.target.closest('.chamado-status');
        if (statusElement) {
            const statusMenu = statusElement.nextElementSibling;
            if (statusElement.textContent.trim() === 'Finalizado') {
                document.querySelectorAll('.status-menu').forEach(menu => menu.classList.add('hidden'));
                return;
            }
            document.querySelectorAll('.status-menu').forEach(menu => {
                if (menu !== statusElement.nextElementSibling) {
                    menu.classList.add('hidden');
                }
            });
            statusMenu.classList.toggle('hidden');
            return;
        }

        // Lógica para os botões do menu de status
        const statusMenuButton = event.target.closest('.status-menu button');
        if (statusMenuButton) {
            const newStatus = statusMenuButton.dataset.status;
            const statusMenu = statusMenuButton.closest('.status-menu');
            const statusTag = statusMenu.previousElementSibling;
            
            setStatus(statusTag, newStatus);
            statusMenu.classList.add('hidden');
            ordenarChamados();
            atualizarContadores();
            return;
        }

        // Fecha todos os menus se o clique for fora deles
        document.querySelectorAll('.dots-menu.visible').forEach(menu => {
            menu.classList.remove('visible');
        });
        document.querySelectorAll('.status-menu').forEach(menu => {
            menu.classList.add('hidden');
        });

        // Lógica para o botão de editar
        if (event.target.classList.contains('btn-editar')) {
            const card = event.target.closest('.card-chamado');
            
            modoEdicao = true;
            chamadoEmEdicao = card;
            
            document.querySelector('#modalChamado h3').textContent = 'Editar Chamado';
            document.getElementById('salvarModalBtn').textContent = 'Salvar'; // Revertido para "Salvar"
            document.getElementById('tituloChamado').value = card.querySelector('.chamado-titulo').textContent;
            document.getElementById('descricaoChamado').value = card.querySelector('.chamado-descricao').textContent;
            document.getElementById('prioridadeChamado').value = card.dataset.prioridade;
            
            modalChamado.classList.remove('hidden');
        }

        // Lógica para o botão de excluir
        if (event.target.classList.contains('btn-excluir')) {
            const card = event.target.closest('.card-chamado');
            const confirmacao = confirm('Tem certeza que deseja excluir este chamado?');
            if (confirmacao) {
                card.remove();
                atualizarContadores();
            }
        }
    });

    // Inicialização para ordenar cards existentes e atualizar os contadores ao carregar a página
    ordenarChamados();
    atualizarContadores();
});