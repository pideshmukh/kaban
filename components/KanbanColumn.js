export const KanbanColumn = {
    props: ['column', 'originalTasksCount', 'searchActive', 'tGlobal', 'settings'],
    emits: ['open-task-modal', 'task-drag-start', 'task-drop-on-column'],
    setup(props, { emit }) {
        const dragOver = Vue.ref(false);
        const handleDragOver = (e) => { 
            e.preventDefault(); 
            dragOver.value = true; 
        };
        const handleDragLeave = () => { 
            dragOver.value = false; 
        };
        const handleDrop = (e) => {
            e.preventDefault(); // Important to allow drop
            dragOver.value = false;
            emit('task-drop-on-column', { targetColumnId: props.column.id });
        };
        return { dragOver, handleDragOver, handleDragLeave, handleDrop };
    },
    template: `
        <div class="kanban-column" :class="{ 'drag-over': dragOver }"
             @dragover.prevent="handleDragOver" 
             @dragleave.prevent="handleDragLeave" 
             @drop.prevent="handleDrop">
            <h3>{{ column.name }} ({{ column.tasks.length }})</h3>
            <div class="tasks-container">
                <task-card v-for="task in column.tasks" :key="task.id"
                    :task="task"
                    :column-id="column.id"
                    @open-task-modal="$emit('open-task-modal', { taskId: task.id, columnId: column.id })"
                    @task-drag-start="$emit('task-drag-start', { taskId: task.id, originalColumnId: column.id })"
                    :t-global="tGlobal"
                    :settings="settings"
                ></task-card>
                <p v-if="column.tasks.length === 0 && originalTasksCount > 0 && searchActive" 
                   class="no-tasks-message" style="color: var(--color-text-muted); text-align: center; padding: var(--spacing-md) 0;">
                   {{ tGlobal('noSearchResults') }}
                </p>
                <p v-else-if="originalTasksCount === 0 && column.tasks.length === 0" 
                   class="no-tasks-message" style="color: var(--color-text-muted); text-align: center; padding: var(--spacing-md) 0;">
                   {{ tGlobal('noTasksInColumn') }}
                </p>
            </div>
        </div>
    `
};
