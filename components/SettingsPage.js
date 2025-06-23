export const SettingsPage = {
    props: ['settings', 'tGlobal'],
    emits: ['update-settings'],
    setup(props, { emit }) {
        // Use local refs to decouple from prop mutation if needed for complex forms,
        // but for simple selects, direct binding and emitting on change is fine.
        // For consistency with two-way binding feel, often local refs are used.
        const localLanguage = Vue.ref(props.settings.language);
        const localTheme = Vue.ref(props.settings.theme);

        // Watch for prop changes to update local refs if parent state could change from elsewhere
        Vue.watch(() => props.settings.language, (newVal) => {
            localLanguage.value = newVal;
        });
        Vue.watch(() => props.settings.theme, (newVal) => {
            localTheme.value = newVal;
        });

        const updateLanguage = () => {
            emit('update-settings', { language: localLanguage.value });
        };
        const updateTheme = () => {
            emit('update-settings', { theme: localTheme.value });
        };

        return { localLanguage, localTheme, updateLanguage, updateTheme };
    },
    template: `
        <div class="page"> 
            <h2>{{ tGlobal('settingsTitle') }}</h2>
            <div class="form-group">
                <label for="language-select">{{ tGlobal('languageLabel') }}</label>
                <select id="language-select" v-model="localLanguage" @change="updateLanguage">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                </select>
            </div>
            <div class="form-group">
                <label for="theme-select">{{ tGlobal('themeLabel') }}</label>
                <select id="theme-select" v-model="localTheme" @change="updateTheme">
                    <option value="light">{{ tGlobal('themeLight') }}</option>
                    <option value="dark">{{ tGlobal('themeDark') }}</option>
                </select>
            </div>
        </div>
    `
};
