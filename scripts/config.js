// Configuration de l'API
const config = {
    API_URL: 'https://openrouter.ai/api/v1/chat/completions',
    API_KEY: process.env.OPENROUTER_API_KEY || '',
    MODEL: 'mistralai/mistral-7b-instruct'
};

// Vérification de la présence de la clé API
if (!config.API_KEY) {
    console.error('Attention : La clé API OpenRouter n\'est pas définie. Veuillez ajouter votre clé dans le fichier .env');
}

export default config; 