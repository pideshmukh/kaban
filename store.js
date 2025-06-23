import { generateId } from './utils.js';
import { translations } from './translations.js';

export const store = Vue.reactive({
    state: { 
        boards: [],
        currentBoardId: null,
        settings: { language: 'en', theme: 'light' },
        ui: { editingTask: null, draggedTaskInfo: null, filterQuery: '' }
    },
    get t() {
        return (key, ...args) => {
            const lang = this.state.settings.language;
            const translation = translations[lang]?.[key] || key;
            return typeof translation === 'function' ? translation(...args) : translation;
        };
    },
    initializeDefaultState() { 
        this.state.boards = []; 
        this.state.settings.language = 'en'; 
        this.state.settings.theme = 'light';
        this.state.currentBoardId = null;
        this.state.ui.editingTask = null;
        this.state.ui.draggedTaskInfo = null;
        this.state.ui.filterQuery = '';
    },
    addBoard(name) { 
        if (!name.trim() || name.trim().length < 3) {
            alert(this.t('boardNameCannotBeEmpty')); // Or a more sophisticated validation message
            return null;
        }
        const newBoard = { 
            id: generateId(), 
            name: name.trim(), 
            columns: [
                { id: generateId(), name: this.t('defaultColumnTodo'), tasks: [] },
                { id: generateId(), name: this.t('defaultColumnInProgress'), tasks: [] },
                { id: generateId(), name: this.t('defaultColumnDone'), tasks: [] }
            ]
        };
        this.state.boards.push(newBoard); 
        return newBoard;
    },
    deleteBoard(boardId) { 
        this.state.boards = this.state.boards.filter(b => b.id !== boardId);
        if (this.state.currentBoardId === boardId) {
            this.state.currentBoardId = this.state.boards.length > 0 ? this.state.boards[0].id : null;
            // If current board is deleted, navigate to boards list or first available board
            if (!this.state.currentBoardId) {
                window.location.hash = 'boards';
            } else {
                 window.location.hash = `board/${this.state.currentBoardId}`;
            }
        }
    },
    addTaskToBoard({ boardId, taskDetails }) { 
        const board = this.state.boards.find(b => b.id === boardId);
        if (!board || !taskDetails.title.trim() || taskDetails.title.trim().length < 3) {
             alert(this.t('taskTitleCannotBeEmpty')); // Or a more sophisticated validation message
            return false;
        }
        const newTask = { id: generateId(), ...taskDetails, createdAt: new Date().toISOString() };
        const targetColumn = board.columns.find(c => c.id === taskDetails.columnId) || board.columns[0];
        if (targetColumn) {
            targetColumn.tasks.push(newTask);
        } else {
            return false; // Should not happen if columnId is validated or defaulted
        }
        return true;
    },
    updateSettings(newSettings) { 
        this.state.settings = { ...this.state.settings, ...newSettings }; 
    },
    openTaskModal({ taskId, columnId }) { 
        const board = this.state.boards.find(b => b.id === this.state.currentBoardId); 
        if (!board) return;
        const column = board.columns.find(c => c.id === columnId); 
        if (!column) return;
        const task = column.tasks.find(t => t.id === taskId); 
        if (!task) return;
        this.state.ui.editingTask = { task: { ...task }, columnId }; // Store original columnId
    },
    closeTaskModal() { 
        this.state.ui.editingTask = null; 
    },
    saveTaskChanges({ taskId, originalColumnId, updatedTaskData }) { 
        const board = this.state.boards.find(b => b.id === this.state.currentBoardId); 
        if (!board) return;
        
        const sourceColumn = board.columns.find(c => c.id === originalColumnId);
        if (!sourceColumn) return;

        const taskIndex = sourceColumn.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        // If column is changed via modal (if that feature is added)
        // This example assumes column doesn't change in modal, but `updatedTaskData` could include `columnId`
        // For now, it updates in place.
        sourceColumn.tasks[taskIndex] = { ...sourceColumn.tasks[taskIndex], ...updatedTaskData };
        this.closeTaskModal();
    },
    deleteTaskFromModal({ taskId, columnId }) { 
        const board = this.state.boards.find(b => b.id === this.state.currentBoardId); 
        if (!board) return;
        const column = board.columns.find(c => c.id === columnId); 
        if (!column) return;
        column.tasks = column.tasks.filter(t => t.id !== taskId); 
        this.closeTaskModal();
    },
    handleTaskDragStart({ taskId, originalColumnId }) { 
        this.state.ui.draggedTaskInfo = { taskId, originalColumnId }; 
    },
    handleTaskDropOnColumn({ targetColumnId }) { 
        if (!this.state.ui.draggedTaskInfo) return;
        const { taskId, originalColumnId } = this.state.ui.draggedTaskInfo;
        
        if (originalColumnId === targetColumnId) { 
            this.state.ui.draggedTaskInfo = null; 
            return; 
        }

        const board = this.state.boards.find(b => b.id === this.state.currentBoardId); 
        if (!board) return;

        const sourceCol = board.columns.find(c => c.id === originalColumnId);
        const targetCol = board.columns.find(c => c.id === targetColumnId); 
        if (!sourceCol || !targetCol) return;

        const taskIndex = sourceCol.tasks.findIndex(t => t.id === taskId); 
        if (taskIndex === -1) return;

        const [taskToMove] = sourceCol.tasks.splice(taskIndex, 1);
        targetCol.tasks.push(taskToMove); 
        this.state.ui.draggedTaskInfo = null;
    }
});
