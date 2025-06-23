export const BoardListPage = {
    props: ['boards', 'tGlobal'],
    emits: ['add-board', 'delete-board', 'view-board'],
    setup(props, { emit }) {
        const newBoardName = Vue.ref('');
        const isNewBoardNameValid = Vue.computed(() => newBoardName.value.trim().length >= 3);
        
        const handleAddBoard = () => {
            if (isNewBoardNameValid.value) {
                emit('add-board', newBoardName.value);
                newBoardName.value = '';
            } else {
                alert(props.tGlobal('boardNameCannotBeEmpty'));
            }
        };

        const confirmDeleteBoard = (board) => {
            if (confirm(props.tGlobal('confirmDeleteBoard', board.name))) {
                emit('delete-board', board.id);
            }
        };

        return { newBoardName, isNewBoardNameValid, handleAddBoard, confirmDeleteBoard };
    },
    template: `
        <div class="page board-list-page"> 
            <h2 class="page-title">{{ tGlobal('boardsTitle') }}</h2>

            <div v-if="boards.length === 0" class="no-boards-welcome-container">
                <span class="icon" aria-hidden="true">🗂️</span>
                <p class="welcome-text">{{ tGlobal('noBoardsYet') }}</p>
                
                <div class="add-board-form-wrapper add-board-form-inline"> 
                    <div class="form-group">
                        <label for="new-board-name-input-welcome" class="sr-only">{{ tGlobal('newBoardNameLabel') }}</label>
                        <input id="new-board-name-input-welcome" type="text" v-model="newBoardName" 
                               :placeholder="tGlobal('defaultBoardName')"
                               :class="{ 'invalid': newBoardName.length > 0 && !isNewBoardNameValid }"
                               @keyup.enter="handleAddBoard">
                        <span v-if="newBoardName.length > 0 && !isNewBoardNameValid" class="error-message">{{ tGlobal('validationMinLength', 3) }}</span>
                    </div>
                    <button @click="handleAddBoard" :disabled="!isNewBoardNameValid">{{ tGlobal('addBoardBtn') }}</button>
                </div>
            </div>

            <div v-else>
                <ul class="board-list">
                    <li v-for="board in boards" :key="board.id" class="board-list-item">
                        <span class="board-list-item-name">{{ board.name }}</span>
                        <div class="board-list-item-actions">
                            <button @click="$emit('view-board', board.id)" class="button-secondary">
                                {{ tGlobal('viewBoardBtn') }}
                            </button>
                            <button @click="confirmDeleteBoard(board)" class="danger">
                                {{ tGlobal('deleteBoardBtn') }}
                            </button>
                        </div>
                    </li>
                </ul>

                <div class="add-board-section-existing">
                    <h3>{{ tGlobal('newBoardNameLabel') }}</h3>
                    <div class="add-board-form-wrapper">
                        <div class="form-group">
                            <label for="new-board-name-input" class="sr-only">{{ tGlobal('newBoardNameLabel') }}</label>
                            <input id="new-board-name-input" type="text" v-model="newBoardName" 
                                   :placeholder="tGlobal('defaultBoardName')"
                                   :class="{ 'invalid': newBoardName.length > 0 && !isNewBoardNameValid }"
                                   @keyup.enter="handleAddBoard">
                            <span v-if="newBoardName.length > 0 && !isNewBoardNameValid" class="error-message">{{ tGlobal('validationMinLength', 3) }}</span>
                        </div>
                        <button @click="handleAddBoard" :disabled="!isNewBoardNameValid">{{ tGlobal('addBoardBtn') }}</button>
                    </div>
                </div>
            </div>
        </div>
    `
};
