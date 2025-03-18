import config from './config.js';

// Éléments du DOM
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const themeToggle = document.getElementById('theme-toggle');

// Gestion du thème
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Ajustement automatique de la hauteur du textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
});

// Fonction pour ajouter un message au chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fonction pour envoyer un message à l'API
async function sendToAPI(message) {
    try {
        const response = await fetch(config.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Mon Chatbot'
            },
            body: JSON.stringify({
                model: config.MODEL,
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Erreur:', error);
        return "Désolé, j'ai rencontré une erreur. Pouvez-vous réessayer ?";
    }
}

// Fonction pour envoyer un message
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Afficher le message de l'utilisateur
    addMessage(message, true);
    userInput.value = '';
    userInput.style.height = 'auto';

    // Désactiver le bouton d'envoi pendant la requête
    sendButton.disabled = true;

    try {
        // Envoyer le message à l'API
        const response = await sendToAPI(message);
        addMessage(response);
    } catch (error) {
        addMessage("Désolé, j'ai rencontré une erreur. Pouvez-vous réessayer ?");
    } finally {
        // Réactiver le bouton d'envoi
        sendButton.disabled = false;
    }
}

// Événements
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Message de bienvenue
addMessage("Bonjour ! Je suis votre chatbot. Comment puis-je vous aider aujourd'hui ?"); 