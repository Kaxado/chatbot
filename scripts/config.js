// Configuration de l'API
const config = {
    API_URL: 'https://openrouter.ai/api/v1/chat/completions',
    API_KEY: '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',
    MODEL: 'qwen/qwq-32b:free'
};

// Vérification de la présence de la clé API
if (!config.API_KEY) {
    console.error('Attention : La clé API OpenRouter n\'est pas définie.');
}

export default config; 