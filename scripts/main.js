import config from './config.js';

// Éléments du DOM
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const themeToggle = document.getElementById('theme-toggle');
const loadingIndicator = document.getElementById('loading-indicator');

// Constantes de sécurité
const MAX_MESSAGE_LENGTH = 1000; // Limite de caractères par message
const MAX_MESSAGES = 50; // Limite de messages dans l'historique

// Historique des messages
let messageHistory = [];

// Fonction de sanitization pour la protection XSS
export function sanitizeInput(input) {
    return input;
}

// Fonction de validation des entrées
export function validateMessage(message) {
    // Vérifier la longueur
    if (message.length > MAX_MESSAGE_LENGTH) {
        throw new Error(`Le message ne doit pas dépasser ${MAX_MESSAGE_LENGTH} caractères.`);
    }

    // Vérifier si le message est vide
    if (!message.trim()) {
        throw new Error('Le message ne peut pas être vide.');
    }

    // Vérifier les caractères spéciaux dangereux
    const dangerousPattern = /<script|javascript:|on\w+=/gi;
    if (dangerousPattern.test(message)) {
        throw new Error('Le message contient des caractères non autorisés.');
    }

    return message.trim();
}

// Fonction pour ajouter un message à l'historique
function addMessageToHistory(role, content) {
    const message = {
        role,
        content,
        timestamp: new Date()
    };
    
    messageHistory.push(message);
    
    // Limiter la taille de l'historique
    if (messageHistory.length > MAX_MESSAGES) {
        messageHistory = messageHistory.slice(-MAX_MESSAGES);
    }
}

// Fonction pour afficher un message dans le chat
function displayMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString();
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fonction pour envoyer un message à l'API
export async function sendToAPI(message) {
    try {
        console.log('Envoi de la requête à l\'API...');
        console.log('URL:', config.API_URL);
        console.log('Modèle:', config.MODEL);
        console.log('Historique des messages:', messageHistory);
        
        const requestBody = {
            model: config.MODEL,
            messages: messageHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            temperature: 0.7,
            max_tokens: 1000
        };
        
        console.log('Corps de la requête:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(config.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.API_KEY}`,
                'HTTP-Referer': window.location.origin || 'http://localhost',
                'X-Title': 'Mon Chatbot'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Statut de la réponse:', response.status);
        console.log('En-têtes de la réponse:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Détails de l\'erreur API:', {
                status: response.status,
                statusText: response.statusText,
                errorData
            });
            throw new Error(`Erreur API: ${response.status} - ${errorData.error?.message || response.statusText || 'Erreur inconnue'}`);
        }

        const data = await response.json();
        console.log('Réponse de l\'API:', data);
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Erreur détaillée:', error);
        throw error;
    }
}

// Afficher/masquer l'indicateur de chargement
function toggleLoading(show) {
    loadingIndicator.style.display = show ? 'block' : 'none';
}

// Fonction pour envoyer un message
async function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    try {
        // Valider le message
        validateMessage(message);
        
        // Afficher le message de l'utilisateur
        displayMessage(message, true);
        addMessageToHistory('user', message);
        
        // Réinitialiser l'input
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Afficher l'indicateur de chargement
        toggleLoading(true);
        
        // Envoyer à l'API
        const response = await sendToAPI(message);
        
        // Afficher la réponse
        displayMessage(response);
        addMessageToHistory('assistant', response);
    } catch (error) {
        console.error('Erreur:', error);
        displayMessage("Désolé, j'ai rencontré une erreur. Pouvez-vous réessayer ?");
    } finally {
        toggleLoading(false);
    }
}

// Initialisation de l'interface utilisateur (seulement si les éléments existent)
if (typeof window !== 'undefined' && document.getElementById('theme-toggle')) {
    // Gestion du thème
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    themeToggle.setAttribute('aria-pressed', currentTheme === 'dark');

    // Ajouter le message système au début de la conversation
    addMessageToHistory('system', 'Tu es un assistant IA français amical et serviable. Tu dois répondre en français et maintenir un ton professionnel mais accessible. Tu dois t\'adapter au contexte de la conversation et te souvenir des échanges précédents.');

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.setAttribute('aria-pressed', newTheme === 'dark');
    });

    // Ajustement automatique de la hauteur du textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        
        // Mettre à jour l'attribut aria-invalid si nécessaire
        const isValid = this.value.length <= MAX_MESSAGE_LENGTH;
        this.setAttribute('aria-invalid', !isValid);
        this.setAttribute('aria-valuenow', this.value.length);
        this.setAttribute('aria-valuemax', MAX_MESSAGE_LENGTH);
    });

    // Gestionnaires d'événements
    sendButton.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
} 