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

// Fonction pour envoyer un message
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Afficher le message de l'utilisateur
    addMessage(message, true);
    userInput.value = '';
    userInput.style.height = 'auto';

    // Simuler une réponse du bot (à remplacer par l'appel API)
    setTimeout(() => {
        addMessage("Je suis désolé, mais je ne suis pas encore connecté à une API de chat. Cette fonctionnalité sera bientôt disponible !");
    }, 1000);
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