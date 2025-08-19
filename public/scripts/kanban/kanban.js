// ==================== KANBAN ==================== //
document.addEventListener('DOMContentLoaded', function () {
    initializeKanban();
    initializeModal();
    initializeDragAndDrop();

    // Adicionar botões de ação aos cards existentes
    document.querySelectorAll('.task-card').forEach(card => {
        addActionButtons(card);
        makeTaskDraggable(card);
    });

    // Listener do botão de exclusão
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) confirmBtn.addEventListener('click', confirmDelete);
});

// Variáveis globais
let taskCardToDelete = null;
let editingTaskCard = null;

// ==================== INICIALIZAÇÃO ==================== //
function initializeKanban() {
    updateTaskCounts();
    setDefaultDeadline();
}

function updateTaskCounts() {
    const columns = document.querySelectorAll('.kanban-column');

    columns.forEach(column => {
        const content = column.querySelector('.column-content');
        const countElement = column.querySelector('.task-count');
        const taskCards = content.querySelectorAll('.task-card');

        countElement.textContent = taskCards.length;
    });
}

function setDefaultDeadline() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const deadlineInput = document.getElementById('taskDeadline');
    if (deadlineInput) {
        deadlineInput.value = tomorrow.toISOString().split('T')[0];
    }
}

// ==================== MODAL ==================== //
function openNewTaskModal() {
    editingTaskCard = null;
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('newTaskForm');

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Resetar formulário e configurar para criar nova tarefa
    form.reset();
    setDefaultDeadline();
    form.onsubmit = handleCreateSubmit;

    // Foco no primeiro campo
    setTimeout(() => form.querySelector('[name="title"]').focus(), 100);
}

function closeNewTaskModal() {
    const modal = document.getElementById('taskModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    editingTaskCard = null;
}

function initializeModal() {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('newTaskForm');

    // Fechar modal ao clicar fora
    modal.addEventListener('click', e => {
        if (e.target === modal) closeNewTaskModal();
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.style.display === 'flex') closeNewTaskModal();
    });

    // Configuração padrão do formulário
    form.onsubmit = handleCreateSubmit;
}

// ==================== CRIAÇÃO DE TAREFA ==================== //
function handleCreateSubmit(e) {
    e.preventDefault();
    createNewTask();
}

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

    const taskCard = createTaskCard(taskData);

    addActionButtons(taskCard);
    makeTaskDraggable(taskCard);

    const todoColumn = document.getElementById('todo-column');
    if (todoColumn) todoColumn.appendChild(taskCard);

    updateTaskCounts();
    closeNewTaskModal();
    showNotification('Tarefa criada com sucesso!', 'success');
}

function createTaskCard(taskData) {
    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';
    taskCard.draggable = true;
    taskCard.dataset.status = 'todo';

    const priorityColor = { high: '#ff4d4f', medium: '#faad14', low: '#52c41a' };
    const tags = taskData.tags ? taskData.tags.split(',').map(tag => tag.trim()) : [];

    taskCard.innerHTML = `
        <div class="task-priority ${taskData.priority}" style="background: ${priorityColor[taskData.priority]}"></div>
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

// ==================== EDIÇÃO DE TAREFA ==================== //
function editTask(taskCard) {
    editingTaskCard = taskCard;
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('newTaskForm');

    // Preencher campos
    form.querySelector('[name="title"]').value = taskCard.querySelector('h4').textContent;
    form.querySelector('[name="description"]').value = taskCard.querySelector('p').textContent;
    form.querySelector('[name="priority"]').value = taskCard.querySelector('.task-priority').classList[1];
    form.querySelector('[name="deadline"]').value = taskCard.querySelector('.task-deadline').textContent.replace('Prazo: ', '');
    form.querySelector('[name="assignee"]').value = taskCard.querySelector('.task-assignee').textContent;
    form.querySelector('[name="tags"]').value = [...taskCard.querySelectorAll('.tag')].map(tag => tag.textContent).join(', ');

    // Alterar ação do formulário para edição
    form.onsubmit = function (e) {
        e.preventDefault();
        updateTaskFromForm(taskCard, new FormData(form));
        closeNewTaskModal();
    };

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function updateTaskFromForm(taskCard, formData) {
    taskCard.querySelector('h4').textContent = formData.get('title');
    taskCard.querySelector('p').textContent = formData.get('description');
    taskCard.querySelector('.task-deadline').textContent = "Prazo: " + formatDate(formData.get('deadline'));
    taskCard.querySelector('.task-assignee').textContent = formData.get('assignee');

    // Atualizar prioridade
    const priority = formData.get('priority');
    const priorityColor = { high: "#ff4d4f", medium: "#faad14", low: "#52c41a" };
    const priorityEl = taskCard.querySelector('.task-priority');
    priorityEl.className = "task-priority " + priority;
    priorityEl.style.background = priorityColor[priority];

    // Atualizar tags
    const tags = formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [];
    taskCard.querySelector('.task-tags').innerHTML = tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');

    showNotification("Tarefa atualizada!", "success");
}

// ==================== NOTIFICAÇÕES ==================== //
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    const existing = document.querySelectorAll('.notification').length;

    notification.style.cssText = `
        position: fixed;
        top: ${80 + existing * 60}px;
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

    setTimeout(() => notification.style.transform = 'translateX(0)', 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== DRAG AND DROP ==================== //
let draggedElement = null;

function makeTaskDraggable(taskCard) {
    taskCard.addEventListener('dragstart', handleDragStart);
    taskCard.addEventListener('dragend', handleDragEnd);
}

function initializeDragAndDrop() {
    const columns = document.querySelectorAll('.column-content');

    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
        column.addEventListener('dragenter', handleDragEnter);
        column.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedElement = null;

    document.querySelectorAll('.column-content').forEach(column => column.classList.remove('drag-over'));
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
    if (!this.contains(e.relatedTarget)) this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');

  if (draggedElement) {
    const originalParent = draggedElement.parentElement;
    originalParent.removeChild(draggedElement);
    this.appendChild(draggedElement);

    // ✅ pegue o id da própria área de drop
    const newStatus = this.id.replace('-column', ''); // "todo" | "in-progress" | "done"

    // ✅ aplica/retira estilo de concluído
    if (newStatus === 'done') {
      draggedElement.classList.add('completed');
    } else {
      draggedElement.classList.remove('completed');
    }

    // Atualiza dataset e contadores + toast
    draggedElement.dataset.status = newStatus;
    updateTaskCounts();

    const statusText = { 'todo': 'A Fazer', 'in-progress': 'Em Andamento', 'done': 'Concluído' };
    showNotification(`Tarefa movida para ${statusText[newStatus]}`, 'success');
  }
}

// ==================== EXCLUSÃO ==================== //
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

// ==================== BOTÕES DE AÇÃO ==================== //
function addActionButtons(taskCard) {
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    actions.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        display: none;
        gap: 4px;
    `;

    actions.innerHTML = `
        <button onclick="editTask(this.parentElement.parentElement)" style="background: none; border: none; cursor: pointer; padding: 4px;">
            ✏️
        </button>
        <button onclick="openDeleteModal(this.parentElement.parentElement)" style="background: none; border: none; cursor: pointer; padding: 4px; color: #ff4d4f;">
            🗑️
        </button>
    `;

    taskCard.style.position = "relative";
    taskCard.appendChild(actions);

    taskCard.addEventListener('mouseenter', () => actions.style.display = 'flex');
    taskCard.addEventListener('mouseleave', () => actions.style.display = 'none');
}

// ==================== UTILS ==================== //
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}
