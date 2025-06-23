export const TaskCard = {
    props: ['task', 'columnId', 'tGlobal', 'settings'],
    emits: ['open-task-modal', 'task-drag-start'],
    setup(props, { emit }) {
        const formattedDueDate = Vue.computed(() => {
            if (!props.task.dueDate) return '';
            try {
                // Ensure date is parsed correctly regardless of local timezone issues with yyyy-mm-dd
                const parts = props.task.dueDate.split('-');
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
                const day = parseInt(parts[2], 10);
                const localDate = new Date(Date.UTC(year, month, day)); // Use UTC to avoid timezone shifts from yyyy-mm-dd

                return localDate.toLocaleDateString(props.settings.language, { 
                    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' 
                });
            } catch (e) {
                console.error("Error formatting due date:", e);
                return props.task.dueDate; // Fallback to raw date
            }
        });
        const priorityText = Vue.computed(() => {
            const priorityKey = `priority${props.task.priority.charAt(0).toUpperCase() + props.task.priority.slice(1)}`;
            return props.tGlobal(priorityKey);
        });
        
        const handleDragStart = (e) => {
            e.dataTransfer.setData('text/plain', props.task.id);
            e.dataTransfer.effectAllowed = 'move';
            // Accessing classList directly on e.target is fine
            e.target.classList.add('dragging'); 
            emit('task-drag-start'); // No specific payload needed here based on original code, parent receives columnId from KanbanColumn
        };
        const handleDragEnd = (e) => { 
            e.target.classList.remove('dragging'); 
        };

        return { formattedDueDate, priorityText, handleDragStart, handleDragEnd };
    },
    template: `
        <div :class="['task-card', 'priority-' + task.priority]" 
             draggable="true" 
             @dragstart="handleDragStart"
             @dragend="handleDragEnd"
             @click="$emit('open-task-modal')" 
             :title="tGlobal('clickToEdit')">
            <h4>{{ task.title }}</h4>
            <p v-if="task.description">{{ task.description }}</p>
            <p v-if="task.dueDate"><small>{{ tGlobal('dueDatePrefix') }}{{ formattedDueDate }}</small></p>
            <p><small>{{ tGlobal('priorityPrefix') }}{{ priorityText }}</small></p>
        </div>
    `
};
