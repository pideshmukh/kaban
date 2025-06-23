import { store } from './store.js';
import { BoardListPage } from './components/BoardListPage.js';
import { BoardViewPage } from './components/BoardViewPage.js';
import { KanbanColumn } from './components/KanbanColumn.js';
import { TaskCard } from './components/TaskCard.js';
import { SettingsPage } from './components/SettingsPage.js';
import { TaskModal } from './components/TaskModal.js';

const app = Vue.createApp({
    setup() { 
        const currentPage = Vue.ref('boards'); // Default page
        const tGlobal = Vue.computed(() => store.t);

        const setCurrentPage = (page, param = null) => {
            currentPage.value = page;
            if (page === 'board' && param) {
                store.state.currentBoardId = param;
                 // Check if board exists, otherwise redirect
                if (!store.state.boards.find(b => b.id === param)) {
                    alert(tGlobal.value('boardNotFound'));
                    navigateToRoute('boards'); // Fallback
                }
            } else if (page !== 'board') {
                store.state.currentBoardId = null;
                store.state.ui.filterQuery = ''; 
            }
        };

        const currentBoard = Vue.computed(() => {
            if (currentPage.value === 'board' && store.state.currentBoardId) {
                return store.state.boards.find(b => b.id === store.state.currentBoardId);
            }
            return null;
        });
        
        const viewBoard = (boardId) => { 
            window.location.hash = `board/${boardId}`; 
        };

        const navigateToRoute = (page, param = null) => {
            let newHash = page;
            if (param) {
                newHash += `/${param}`;
            }
            window.location.hash = newHash;
        };

        const handleHashChange = () => {
            const hash = window.location.hash.slice(1);
            if (!hash) { 
                setCurrentPage('boards'); 
                return; 
            }
            const [pageFromHash, paramFromHash] = hash.split('/');
            
            // Clear search query if navigating to a new board or away from a board view
            if ( (pageFromHash === 'board' && paramFromHash !== store.state.currentBoardId) || 
                 (currentPage.value === 'board' && pageFromHash !== 'board') ) {
                store.state.ui.filterQuery = '';
            }
            setCurrentPage(pageFromHash || 'boards', paramFromHash || null);
        };

        const addBoardAndNavigate = (boardName) => {
            const newBoard = store.addBoard(boardName); 
            if (newBoard && newBoard.id) {
                navigateToRoute('board', newBoard.id);
            }
        };

        Vue.onMounted(() => {
            store.initializeDefaultState();
            window.addEventListener('hashchange', handleHashChange);
            handleHashChange(); // Initial route handling
        });

        Vue.onUnmounted(() => { 
            window.removeEventListener('hashchange', handleHashChange); 
        });
        
        Vue.watchEffect(() => { 
            document.body.className = store.state.settings.theme === 'dark' ? 'dark-mode' : ''; 
        });

        return {
            state: store.state, 
            tGlobal, 
            currentPage, 
            currentBoard, 
            navigateToRoute,
            addBoard: addBoardAndNavigate, 
            deleteBoard: store.deleteBoard.bind(store), // Ensure 'this' context for store methods
            viewBoard,
            addTaskToBoard: store.addTaskToBoard.bind(store),
            updateSettings: store.updateSettings.bind(store),
            openTaskModal: store.openTaskModal.bind(store),
            closeTaskModal: store.closeTaskModal.bind(store),
            saveTaskChanges: store.saveTaskChanges.bind(store),
            deleteTaskFromModal: store.deleteTaskFromModal.bind(store),
            handleTaskDragStart: store.handleTaskDragStart.bind(store),
            handleTaskDropOnColumn: store.handleTaskDropOnColumn.bind(store),
        };
    }
});

// Register components
app.component('board-list-page', BoardListPage);
app.component('board-view-page', BoardViewPage);
app.component('kanban-column', KanbanColumn);
app.component('task-card', TaskCard);
app.component('settings-page', SettingsPage);
app.component('task-modal', TaskModal);

app.mount('#app');
