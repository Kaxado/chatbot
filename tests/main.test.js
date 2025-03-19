// Tests unitaires pour main.js

// Mock des dépendances
jest.mock('../scripts/config.js', () => ({
    __esModule: true,
    default: {
        API_URL: 'https://test-api.com',
        API_KEY: 'test-key',
        MODEL: 'test-model'
    }
}));

// Mock de fetch
global.fetch = jest.fn();

// Mock de localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock des éléments DOM
document.body.innerHTML = `
    <div id="chat-messages"></div>
    <textarea id="user-input"></textarea>
    <button id="send-button"></button>
    <button id="theme-toggle">🌙</button>
`;

// Import des fonctions à tester
import { validateMessage, sanitizeInput, sendToAPI } from '../scripts/main.js';

// Tests de validation des messages
describe('validateMessage', () => {
    test('devrait accepter un message valide', () => {
        const message = 'Bonjour, comment allez-vous ?';
        expect(validateMessage(message)).toBe(message);
    });

    test('devrait rejeter un message vide', () => {
        expect(() => validateMessage('')).toThrow('Le message ne peut pas être vide.');
    });

    test('devrait rejeter un message trop long', () => {
        const longMessage = 'a'.repeat(1001);
        expect(() => validateMessage(longMessage)).toThrow('Le message ne doit pas dépasser 1000 caractères.');
    });

    test('devrait rejeter un message avec des caractères dangereux', () => {
        const dangerousMessage = '<script>alert("hack")</script>';
        expect(() => validateMessage(dangerousMessage)).toThrow('Le message contient des caractères non autorisés.');
    });
});

// Tests de sanitization
describe('sanitizeInput', () => {
    test('devrait échapper les caractères HTML', () => {
        const input = '<script>alert("hack")</script>';
        expect(sanitizeInput(input)).toBe(input);
    });

    test('devrait préserver le texte normal', () => {
        const input = 'Bonjour, comment allez-vous ?';
        expect(sanitizeInput(input)).toBe(input);
    });
});

// Tests d'intégration
describe('Intégration API', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test('devrait envoyer une requête à l\'API', async () => {
        const message = 'Bonjour';
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
                choices: [{ message: { content: 'Bonjour !' } }]
            })
        });

        await sendToAPI(message);

        expect(fetch).toHaveBeenCalledWith(
            'https://test-api.com',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test-key'
                }),
                body: expect.stringContaining(message)
            })
        );
    });

    test('devrait gérer les erreurs de l\'API', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: () => Promise.resolve({
                error: {
                    message: 'Erreur interne du serveur'
                }
            })
        });

        const result = await sendToAPI('test');
        expect(result).toBe("Désolé, j'ai rencontré une erreur. Pouvez-vous réessayer ?");
    });
}); 