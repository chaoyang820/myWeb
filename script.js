document.addEventListener('DOMContentLoaded', function() {
    // 登录按钮和弹出框
    const loginButton = document.querySelector('.login-button');
    const logoutButton = document.querySelector('.logout-button');
    const loginModal = document.getElementById('loginModal');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const loginSubmit = document.getElementById('loginSubmit');
    const loginStatus = document.getElementById('loginStatus');
    const loginCancel = document.getElementById('loginCancel'); // 获取取消按钮

    loginCancel.addEventListener('click', function() {
        loginModal.classList.remove('show'); // 关闭登录弹出框
    });

    // 检查是否已登录并显示状态
    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
        loginStatus.style.display = 'block';
        loginButton.style.display = 'none';
        logoutButton.style.display = 'block';
    } else {
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
    }

    loginButton.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.classList.add('show');
        apiKeyInput.focus();
    });

    loginSubmit.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('apiKey', apiKey);
            apiKeyInput.value = '';
            loginModal.classList.remove('show');
            loginStatus.style.display = 'block';
            loginButton.style.display = 'none';
            logoutButton.style.display = 'block';
            alert('API Key已保存');
        } else {
            alert('请输入有效的API Key');
        }
    });

    logoutButton.addEventListener('click', function() {
        localStorage.removeItem('apiKey');
        loginStatus.style.display = 'none';
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
        alert('已注销');
    });

    // 创建ChatApp类来管理每个独立的对话实例
    class ChatApp {
        constructor(cardTitle) {
            this.API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
            this.API_KEY = localStorage.getItem('apiKey');
            this.messageHistory = [{
                role: "system",
                content: "You are a helpful assistant."
            }];
            this.cardTitle = cardTitle;

            // 创建独立的对话界面
            this.createChatModal();
            this.bindEvents();
        }

        createChatModal() {
            const chatHTML = `
                <div class="chat-modal" id="chatModal_${this.cardTitle}">
                    <div class="chat-container">
                        <div class="chat-header">
                            <div class="chat-title">
                                <i class="fas fa-comments"></i>
                                <span>${this.cardTitle}</span>
                            </div>
                            <div class="header-buttons">
                                <button class="clear-button" title="清除历史消息">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button class="close-button">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div class="chat-messages"></div>
                        <div class="chat-input-container">
                            <button class="icon-button">
                                <i class="fas fa-microphone"></i>
                            </button>
                            <input type="text" id="messageInput" placeholder="说点什么吧...">
                            <button class="icon-button">
                                <i class="fas fa-paperclip"></i>
                            </button>
                            <button class="send-button">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', chatHTML);

            // 获取当前实例的DOM元素
            this.modal = document.getElementById(`chatModal_${this.cardTitle}`);
            this.messagesContainer = this.modal.querySelector('.chat-messages');
            this.messageInput = this.modal.querySelector('#messageInput');
            this.sendButton = this.modal.querySelector('.send-button');
            this.clearButton = this.modal.querySelector('.clear-button');
            this.closeButton = this.modal.querySelector('.close-button');
        }

        bindEvents() {
            this.sendButton.addEventListener('click', () => this.sendMessage());
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
            this.clearButton.addEventListener('click', () => {
                if (confirm('确定要清除所有聊天记录吗？')) {
                    this.clearHistory();
                }
            });
            this.closeButton.addEventListener('click', () => {
                this.modal.classList.remove('show');
            });
        }

        // 其他方法保持不变，但使用this.modal和this.messagesContainer等
        async callAI(userMessage) {
            try {
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`,
                        'Content-Type': 'application/json',
                        // 允许跨域请求
                        'Access-Control-Allow-Origin': '*'
                    },
                    mode: 'cors', // 启用CORS
                    body: JSON.stringify({
                        model: 'qwen-plus',
                        messages: [...this.messageHistory, {
                            role: 'user',
                            content: userMessage
                        }]
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API错误:', errorData);
                    throw new Error(errorData.message || 'API请求失败');
                }

                const data = await response.json();
                if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                    return data.choices[0].message.content;
                } else {
                    throw new Error('无效的API响应格式');
                }
            } catch (error) {
                console.error('AI调用出错:', error);
                if (error.message.includes('Failed to fetch')) {
                    return '网络连接错误，请检查您的网络连接。';
                }
                return `抱歉，发生了错误：${error.message}`;
            }
        }

        async sendMessage() {
            const content = this.messageInput.value.trim();
            if (!content) return;

            this.messageInput.value = '';
            this.addMessage(content, true);
            this.messageHistory.push({
                role: 'user',
                content: content
            });

            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message ai loading';
            loadingDiv.textContent = '正在思考...';
            this.messagesContainer.appendChild(loadingDiv);
            this.scrollToBottom();

            try {
                const aiResponse = await this.callAI(content);
                this.messagesContainer.removeChild(loadingDiv);
                this.addMessage(aiResponse, false);
                this.messageHistory.push({
                    role: 'assistant',
                    content: aiResponse
                });
            } catch (error) {
                this.messagesContainer.removeChild(loadingDiv);
                this.addMessage('抱歉，发生了一些错误，请稍后重试。', false);
            }
        }

        addMessage(content, isUser) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
            
            const textDiv = document.createElement('div');
            textDiv.textContent = content;
            
            const timestampDiv = document.createElement('div');
            timestampDiv.className = 'timestamp';
            timestampDiv.textContent = new Date().toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            messageDiv.appendChild(textDiv);
            messageDiv.appendChild(timestampDiv);
            
            this.messagesContainer.appendChild(messageDiv);
            this.scrollToBottom();
        }

        scrollToBottom() {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }

        clearHistory() {
            this.messagesContainer.innerHTML = '';
            this.messageHistory = [{
                role: "system",
                content: "You are a helpful assistant."
            }];
        }

        show() {
            this.API_KEY = localStorage.getItem('apiKey'); // 更新API_KEY
            if (!this.API_KEY) {
                loginModal.classList.add('show');
                apiKeyInput.focus();
                return;
            }
            this.modal.classList.add('show');
            this.messageInput.focus();
        }
    }

    // 搜索功能代码
    const searchInput = document.querySelector('.search-container input');
    const appCards = document.querySelectorAll('.app-card');
    
    // 存储每个卡片的聊天实例
    const chatInstances = new Map();

    // 为每个卡片创建独立的聊天实例
    appCards.forEach(card => {
        const title = card.querySelector('h3').textContent;
        chatInstances.set(card, new ChatApp(title));

        card.addEventListener('click', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(0.98)';
            
            // 获取该卡片对应的聊天实例并显示
            const chatInstance = chatInstances.get(this);
            chatInstance.show();

            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });

    // 搜索功能实现
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        appCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const isVisible = title.includes(searchTerm) || description.includes(searchTerm);
            card.style.display = isVisible ? 'block' : 'none';
        });
    });
});