export const TaskModal = {
    props: ['task', 'columnId', 'tGlobal'],
    emits: ['close', 'save-task', 'delete-task'],
    setup(props, { emit }) {
        // Create a deep reactive copy for editing
        const editableTask = Vue.reactive({ ...props.task });

        // Watch for prop changes to re-sync editableTask if the modal is re-opened with a different task
        Vue.watchEffect(() => { 
            Object.assign(editableTask, props.task); 
        });

        const isTitleValid = Vue.computed(() => editableTask.title.trim().length >= 3);
        const isDueDateValid = Vue.computed(() => {
            if (!editableTask.dueDate) return true; // Due date is optional
            const today = new Date(); 
            today.setHours(0,0,0,0);
            return new Date(editableTask.dueDate) >= today;
        });
        const isFormValid = Vue.computed(() => isTitleValid.value && isDueDateValid.value);

        const handleSave = () => {
            if (isFormValid.value) {
                emit('save-task', { 
                    taskId: props.task.id, // Original task ID
                    originalColumnId: props.columnId, // Original column ID
                    updatedTaskData: { ...editableTask } // The changed data
                });
            } else {
                 if (!isTitleValid.value) alert(props.tGlobal('taskTitleCannotBeEmpty'));
                 else if (!isDueDateValid.value) alert(props.tGlobal('validationFutureDate'));
            }
        };
        const handleDelete = () => {
            if (confirm(props.tGlobal('confirmDeleteTask'))) {
                emit('delete-task', { taskId: props.task.id, columnId: props.columnId });
            }
        };
        return { editableTask, isFormValid, isTitleValid, isDueDateValid, handleSave, handleDelete };
    },
    template: `
        <div class="modal" @click.self="$emit('close')"> <!-- Close on backdrop click -->
            <div class="modal-content">
                <button @click="$emit('close')" class="close-button" :aria-label="tGlobal('closeBtnLabel') || 'Close'">&times;</button>
                <h3>{{ tGlobal('editTaskTitle') }}</h3>
                <div class="form-group">
                    <label>{{ tGlobal('taskTitleLabel') }}</label>
                    <input type="text" v-model="editableTask.title" :class="{ 'invalid': editableTask.title.length > 0 && !isTitleValid }">
                    <span v-if="editableTask.title.length > 0 && !isTitleValid" class="error-message">{{ tGlobal('validationMinLength', 3) }}</span>
                </div>
                <div class="form-group">
                    <label>{{ tGlobal('taskDescriptionLabel') }}</label>
                    <textarea v-model="editableTask.description" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>{{ tGlobal('taskPriorityLabel') }}</label>
                    <select v-model="editableTask.priority">
                        <option value="low">{{ tGlobal('priorityLow') }}</option>
                        <option value="medium">{{ tGlobal('priorityMedium') }}</option>
                        <option value="high">{{ tGlobal('priorityHigh') }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>{{ tGlobal('taskDueDateLabel') }}</label>
                    <input type="date" v-model="editableTask.dueDate" :class="{ 'invalid': editableTask.dueDate && !isDueDateValid }">
                    <span v-if="editableTask.dueDate && !isDueDateValid" class="error-message">{{ tGlobal('validationFutureDate') }}</span>
                </div>
                <!-- Column selection in modal is not part of original spec, can be added here if needed -->
                <div style="display: flex; justify-content: flex-end; gap: var(--spacing-sm); margin-top: var(--spacing-md);">
                    <button @click="handleDelete" class="danger">{{ tGlobal('deleteTaskBtn') }}</button>
                    <button @click="handleSave" :disabled="!isFormValid">{{ tGlobal('saveChangesBtn') }}</button>
                </div>
            </div>
        </div>
    `
};
