export const BoardViewPage = {
    props: ['board', 'searchQuery', 'tGlobal', 'settings', 'navigateToRoute'],
    emits: ['update-search-query', 'add-task', 'open-task-modal', 'task-drag-start', 'task-drop-on-column'],
    setup(props, { emit }) {
        const newTask = Vue.reactive({ title: '', description: '', priority: 'medium', dueDate: '', columnId: '' });
        const isAddTaskFormVisible = Vue.ref(false);

        const isNewTaskTitleValid = Vue.computed(() => newTask.title.trim().length >= 3);
        const isNewTaskDueDateValid = Vue.computed(() => {
            if (!newTask.dueDate) return true; // Due date is optional
            const today = new Date(); 
            today.setHours(0,0,0,0); // Compare with start of today
            return new Date(newTask.dueDate) >= today;
        });
        const isNewTaskFormValid = Vue.computed(() => isNewTaskTitleValid.value && isNewTaskDueDateValid.value);

        Vue.watchEffect(() => {
            // Set default columnId for new task when board/columns are available
            if (props.board && props.board.columns.length > 0 && !newTask.columnId) {
                newTask.columnId = props.board.columns[0].id;
            }
        });
        
        // Reset columnId if current board changes and the old columnId is not in the new board
        Vue.watchEffect(() => {
            if (props.board && props.board.columns.length > 0) {
                const columnExists = props.board.columns.some(col => col.id === newTask.columnId);
                if (!columnExists) {
                    newTask.columnId = props.board.columns[0].id;
                }
            } else if (props.board && props.board.columns.length === 0) {
                 newTask.columnId = ''; // No columns available
            }
        });


        const toggleAddTaskForm = () => {
            isAddTaskFormVisible.value = !isAddTaskFormVisible.value;
        };

        const handleAddTask = () => {
            if (isNewTaskFormValid.value) {
                if (!newTask.columnId && props.board.columns.length > 0) { // Ensure columnId is set
                    newTask.columnId = props.board.columns[0].id;
                }
                if (!newTask.columnId) {
                    alert("No column selected or available for the new task."); // Should not happen with watcher
                    return;
                }
                emit('add-task', { boardId: props.board.id, taskDetails: { ...newTask } });
                // Reset form
                newTask.title = ''; 
                newTask.description = ''; 
                newTask.priority = 'medium'; 
                newTask.dueDate = '';
                // newTask.columnId remains or resets via watcher if needed
                if (props.board.columns.length > 0) newTask.columnId = props.board.columns[0].id; // Reset to first column
                isAddTaskFormVisible.value = false; // Optionally close form
            } else {
                 if (!isNewTaskTitleValid.value) alert(props.tGlobal('taskTitleCannotBeEmpty'));
                 else if (!isNewTaskDueDateValid.value) alert(props.tGlobal('validationFutureDate'));
            }
        };

        const filteredColumns = Vue.computed(() => {
            if (!props.board || !props.board.columns) return [];
            return props.board.columns.map(column => ({
                ...column,
                tasks: column.tasks.filter(task =>
                    task.title.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
                    (task.description && task.description.toLowerCase().includes(props.searchQuery.toLowerCase()))
                )
            }));
        });
        
        const handleGoBack = () => {
            if(props.navigateToRoute) {
                props.navigateToRoute('boards');
            }
        };

        return { 
            newTask, 
            isNewTaskFormValid, 
            isNewTaskTitleValid, 
            isNewTaskDueDateValid, 
            handleAddTask, 
            filteredColumns,
            isAddTaskFormVisible,
            toggleAddTaskForm,
            handleGoBack
        };
    },
    template: `
        <div class="page"> 
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-md); flex-wrap: wrap; gap: var(--spacing-sm);">
                <h2 style="margin-bottom: 0; margin-right: auto;">{{ board.name }}</h2>
                <button @click="handleGoBack" class="button-secondary">
                    &larr; {{ tGlobal('backToBoardsBtn') }}
                </button>
            </div>

            <div class="form-group search-bar-wrapper">
                <span class="search-icon">🔍</span>
                <input type="text" :value="searchQuery" @input="$emit('update-search-query', $event.target.value)" 
                       :placeholder="tGlobal('searchTaskPlaceholder')">
                <button v-if="searchQuery" @click="$emit('update-search-query', '')" 
                        class="clear-search-button" :title="tGlobal('clearSearchBtn')">
                    &times;
                </button>
            </div>

            <div class="kanban-board">
                <kanban-column v-for="column in filteredColumns" :key="column.id"
                    :column="column"
                    :original-tasks-count="board.columns.find(c => c.id === column.id).tasks.length"
                    :search-active="searchQuery.length > 0"
                    @open-task-modal="$emit('open-task-modal', $event)"
                    @task-drag-start="$emit('task-drag-start', $event)"
                    @task-drop-on-column="$emit('task-drop-on-column', $event)"
                    :t-global="tGlobal"
                    :settings="settings"
                ></kanban-column>
            </div>
            <hr style="border: 0; border-top: 1px solid var(--color-border); margin: var(--spacing-lg) 0;">
            
            <button @click="toggleAddTaskForm" 
                    class="add-task-toggle-button"
                    :class="{ 'is-open': isAddTaskFormVisible }">
                <span v-if="isAddTaskFormVisible">▼ {{ tGlobal('hideTaskFormBtn') }}</span>
                <span v-else>+ {{ tGlobal('addNewTaskTitle') }}</span>
            </button>

            <div v-if="isAddTaskFormVisible" class="add-task-accordion-content">
                <div class="form-group">
                    <label>{{ tGlobal('taskTitleLabel') }}</label>
                    <input type="text" v-model="newTask.title" :class="{ 'invalid': newTask.title.length > 0 && !isNewTaskTitleValid }">
                    <span v-if="newTask.title.length > 0 && !isNewTaskTitleValid" class="error-message">{{ tGlobal('validationMinLength', 3) }}</span>
                </div>
                <div class="form-group">
                    <label>{{ tGlobal('taskDescriptionLabel') }}</label>
                    <textarea v-model="newTask.description" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>{{ tGlobal('taskPriorityLabel') }}</label>
                    <select v-model="newTask.priority">
                        <option value="low">{{ tGlobal('priorityLow') }}</option>
                        <option value="medium">{{ tGlobal('priorityMedium') }}</option>
                        <option value="high">{{ tGlobal('priorityHigh') }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>{{ tGlobal('taskDueDateLabel') }}</label>
                    <input type="date" v-model="newTask.dueDate" :class="{ 'invalid': newTask.dueDate && !isNewTaskDueDateValid }">
                     <span v-if="newTask.dueDate && !isNewTaskDueDateValid" class="error-message">{{ tGlobal('validationFutureDate') }}</span>
                </div>
                <div class="form-group">
                    <label>{{ tGlobal('taskColumnLabel') }}</label>
                    <select v-model="newTask.columnId" v-if="board.columns && board.columns.length > 0">
                        <option v-for="col in board.columns" :key="col.id" :value="col.id">{{ col.name }}</option>
                    </select>
                     <p v-else class="error-message">No columns available. Please add columns to the board first.</p>
                </div>
                <button @click="handleAddTask" :disabled="!isNewTaskFormValid || (board.columns.length === 0)">{{ tGlobal('addTaskBtn') }}</button>
            </div>
        </div>
    `
};
