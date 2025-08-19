// Funcionalidades do Kanban
document.addEventListener('DOMContentLoaded', function() {
    initializeKanban();
    initializeModal();
    initializeDragAndDrop();
    
    // Adicionar botões de ação aos cards existentes
    document.querySelectorAll('.task-card').forEach(addActionButtons);
});

// Variável global para armazenar a tarefa a ser excluída
let taskCardToDelete = null;

// Inicialização do Kanban
function initializeKanban() {
    updateTaskCounts();
    setDefaultDeadline();
}

// Atualizar contadores de tarefas
function updateTaskCounts() {
    const columns = document.querySelectorAll('.kanban-column');
    
    columns.forEach(column => {
        const content = column.querySelector('.column-content');
        const countElement = column.querySelector('.task-count');
        const taskCards = content.querySelectorAll('.task-card');
        
        countElement.textContent = taskCards.length;
    });
}

// Configurar data padrão no modal
function setDefaultDeadline() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const deadlineInput = document.getElementById('taskDeadline');
    if (deadlineInput) {
        deadlineInput.value = tomorrow.toISOString().split('T')[0];
    }
}

// Modal de Nova Tarefa
function openNewTaskModal() {
    const modal = document.getElementById('taskModal');
    modal.style.display = 'flex'; // Corrigido para centralizar
    document.body.style.overflow = 'hidden';
    
    // Focar no primeiro campo
    setTimeout(() => {
        document.getElementById('taskTitle').focus();
    }, 100);
}

function closeNewTaskModal() {
    const modal = document.getElementById('taskModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Limpar formulário
    document.getElementById('newTaskForm').reset();
    setDefaultDeadline();
}

function initializeModal() {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('newTaskForm');
    
    // Fechar modal ao clicar fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeNewTaskModal();
        }
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeNewTaskModal();
        }
    });
    
    // Submeter formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        createNewTask();
    });
}

// Criar nova tarefa
function createNewTask() {
    const form = document.getElementById('newTaskForm');
    const formData = new FormData(form);
    
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        deadline: formData.get('deadline'),
        assignee: formData.get('assignee'),
        tags: formData.get('tags')
    };
    
    // Criar elemento da tarefa
    const taskCard = createTaskCard(taskData);
    
    // Adicionar botões de ação para a nova tarefa
    addActionButtons(taskCard);

    // Adicionar à coluna "A Fazer"
    const todoColumn = document.getElementById('todo-column-content');
    if (todoColumn) {
        todoColumn.appendChild(taskCard);
    }
    
    // Atualizar contadores
    updateTaskCounts();
    
    // Fechar modal
    closeNewTaskModal();
    
    // Mostrar notificação
    showNotification('Tarefa criada com sucesso!', 'success');
}

// Criar card de tarefa
function createTaskCard(taskData) {
    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';
    taskCard.draggable = true;
    taskCard.dataset.status = 'todo';
    
    const priorityClass = taskData.priority;
    const priorityColor = {
        'high': '#ff4d4f',
        'medium': '#faad14',
        'low': '#52c41a'
    };
    
    const tags = taskData.tags ? taskData.tags.split(',').map(tag => tag.trim()) : [];
    
    taskCard.innerHTML = `
        <div class="task-priority ${priorityClass}" style="background: ${priorityColor[priorityClass]}"></div>
        <h4>${escapeHtml(taskData.title)}</h4>
        <p>${escapeHtml(taskData.description)}</p>
        <div class="task-meta">
            <span class="task-deadline">Prazo: ${formatDate(taskData.deadline)}</span>
            <span class="task-assignee">${escapeHtml(taskData.assignee)}</span>
        </div>
        <div class="task-tags">
            ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
    `;
    
    return taskCard;
}

// Funções auxiliares
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function showNotification(message, type = 'info') {
    // Criar notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#52c41a' : '#1890ff'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Drag and Drop
function initializeDragAndDrop() {
    const taskCards = document.querySelectorAll('.task-card');
    const columns = document.querySelectorAll('.column-content');
    
    taskCards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
    
    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
        column.addEventListener('dragenter', handleDragEnter);
        column.addEventListener('dragleave', handleDragLeave);
    });
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedElement = null;
    
    // Remover classe drag-over de todas as colunas
    document.querySelectorAll('.column-content').forEach(column => {
        column.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    // Só remover a classe se não estiver sobre um filho
    if (!this.contains(e.relatedTarget)) {
        this.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (draggedElement) {
        // Remover elemento da posição original
        const originalParent = draggedElement.parentElement;
        originalParent.removeChild(draggedElement);
        
        // Adicionar à nova coluna
        this.appendChild(draggedElement);
        
        // Atualiza a classe 'completed' com base na nova coluna
        const newStatus = this.parentElement.id.replace('kanban-', '').replace('-column', '');
        if (newStatus === 'done') {
            draggedElement.classList.add('completed');
        } else {
            draggedElement.classList.remove('completed');
        }
        
        // Atualiza o data-status da tarefa
        draggedElement.dataset.status = newStatus;
        
        // Atualizar contadores
        updateTaskCounts();
        
        // Mostrar notificação
        const statusText = {
            'todo': 'A Fazer',
            'in-progress': 'Em Andamento',
            'done': 'Concluído'
        };
        
        showNotification(`Tarefa movida para ${statusText[newStatus]}`, 'success');
    }
}

// Modal de confirmação de exclusão
function openDeleteModal(taskCard) {
    taskCardToDelete = taskCard;
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    taskCardToDelete = null;
}

function confirmDelete() {
    if (taskCardToDelete) {
        taskCardToDelete.remove();
        updateTaskCounts();
        showNotification('Tarefa excluída', 'success');
        closeDeleteModal();
    }
}

// Botões de ação do card (Editar/Excluir)
function addActionButtons(taskCard) {
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    actions.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        display: flex;
        gap: 4px;
    `;
    
    actions.innerHTML = `
        <button onclick="editTask(this.parentElement.parentElement)" style="background: none; border: none; cursor: pointer; padding: 4px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
        </button>
        <button onclick="openDeleteModal(this.parentElement.parentElement)" style="background: none; border: none; cursor: pointer; padding: 4px; color: #ff4d4f;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
            </svg>
        </button>
    `;
    
    taskCard.appendChild(actions);
    
    // Mostrar/ocultar ações no hover
    taskCard.addEventListener('mouseenter', () => {
        actions.style.display = 'flex';
    });
    
    taskCard.addEventListener('mouseleave', () => {
        actions.style.display = 'none';
    });
}


// Listener para o botão de confirmação
document.addEventListener('DOMContentLoaded', function() {
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmDelete);
    }
});

// Funcionalidade de edição (vazio por enquanto)
function editTask(taskCard) {
    console.log('Editar tarefa:', taskCard);
    // Implementar a lógica de edição aqui
}