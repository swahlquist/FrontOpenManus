document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const providerSelect = document.getElementById('provider-select');
    
    // Backend API URL - change this to your actual backend URL
    const apiUrl = 'http://localhost:8000/chat/completions';
    
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    function addMessage(content, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
        messageDiv.textContent = content;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessage(message, true);
        userInput.value = '';
        
        // Prepare the request
        const provider = providerSelect.value;
        const requestData = {
            provider: provider,
            messages: [
                {
                    role: "user",
                    content: message
                }
            ]
        };
        
        try {
            // Show loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add('message', 'ai-message');
            loadingDiv.textContent = 'Thinking...';
            chatMessages.appendChild(loadingDiv);
            
            // Make API request
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Remove loading indicator
            chatMessages.removeChild(loadingDiv);
            
            // Add AI response to chat
            addMessage(data.content, false);
            
        } catch (error) {
            console.error('Error:', error);
            // Remove loading indicator if there was an error
            if (loadingDiv && loadingDiv.parentNode === chatMessages) {
                chatMessages.removeChild(loadingDiv);
            }
            addMessage('Error: Could not connect to AI service. Please try again later.', false);
        }
    }
});