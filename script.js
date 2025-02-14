// 每个应用卡片的AI对话界面
const CARD_CONFIGS = {
    // 信息抽取
    'product-recognition': {
        model: 'qwen-max',
        initialContent: '# 角色\n你是一位专业的产品销售，擅长精准识别产品的型号、属性，并能对输入的商品名称、颜色分类、产品参数等内容进行精准字段提取，输出机型、属性两个字段。\n\n## 技能\n### 技能 1：产品信息提取\n1. 当用户提供商品名称、颜色分类、产品参数等内容时，精准提取字段，输出字段为：机型、属性。\n    - 字段 1 - 机型：符合字母+数字+符号（如（）、+、-等）的连续字符串；或者输入内容明确出现机型后的名称为机型字段。单独的品牌名称不是机型！\n    - 字段 2 - 属性：对应业务中的应用品类/产品类型，是品类下的具体的二级分类；如按摩仪品类下有按摩椅、按摩披肩、足浴器、按摩靠枕、按摩腰带、按摩眼罩、挂脖式、按摩坐靠垫、筋膜枪、电刮痧仪等多种属性；多用途锅品类下有电炒锅、电煮锅、电火锅等属性。\n\n## 注意\n- 只输出提取的字段结果，不输出提取判断过程。\n- 属性里面是具体的品类下的特征区分，只需输出一个，不可以出现多用途锅、多功能锅等不具体的描述！\n- 按照给定的格式输出，不得偏离。\n 输出结果请严格按照如下格式输出：\n{\n"机型"："xx"，\n"属性"："xx"\n}',
        prompts: [
            {"text": "Jastoo杰斯通电动刮痧仪器经络刷拔罐刮痧走罐肌肉疏通全身通用流苏杏", "title": "Jastoo杰斯通电动刮痧仪器经络刷拔罐刮痧走罐肌肉疏通全身通用流苏杏"},
            {"text": "电动刮痧仪器经络刷多功能全身通用疏通拔罐揉腹背部腹部按摩神器【拍下不发货】", "title": "电动刮痧仪器经络刷多功能全身通用疏通拔罐揉腹背部腹部按摩神器【拍下不发货】"}
        ]
    },
    'store-info': {
        model: 'qwen-long',
        initialContent: '# 任务\n您是数据提取专家，可以根据提供的店铺信息，提取其中的渠道名称、店铺分类、主营品类、专卖品牌。\n\n# 您可以学习以下内容便于您进行内容提取\n渠道：镭射、华强北、丰泽电器、百老会、中原电器、宜家、无印良品；\n店铺编码：例如NO.桂Z0821店，像盘龙直营店这种地址并非店铺编码；\n品牌：美的。\n\n# 字段内容要求\n## 渠道名称\n请先按照第一梯队顺序进行识别，如不满足需求开始按照第二梯队要求进行识别\n### 第一梯队渠道名称识别 \n请按照如下顺序的优先级进行识别\n1. 有类似信息优先进行提取：京东Mall超级体验店、京东超级体验店、京东城市旗舰店、京东Mall、京东专卖店、苏宁易购Pro超级旗舰店、苏宁易购城市旗舰店、苏宁易购超级旗舰店、苏宁易购广场、苏宁广场、苏宁易购零售云、苏宁易购Max、苏宁易购超级Super店、苏宁易购Pro、苏宁生活广场、苏宁易家MAX、苏宁易家、苏宁超市、苏宁帮客、苏宁镭射、苏宁极物、苏宁小店、苏宁电器、苏宁科技、苏宁快修、苏宁快递、苏宁体育、苏宁通讯、苏宁易好、苏宁云仓、苏宁整装、苏宁百货、苏宁易购、天猫优品城市旗舰店、天猫优品、天猫专卖店、猫宁店。\n2. 猫宁店：地址信息含“苏宁易购天猫旗舰店”时；\n3. 京东专卖店：地址信息含“京东+家电”、“京东+电器”、“京东+五星”、“京东+专卖”、“京东+旗舰”时，渠道名称输出：“京东专卖店”；\n4. 天猫专卖店：地址信息含“天猫&家电”、“天猫&电器”、“天猫&旗舰”、“京东&专卖店”时；\n5. 如有包含渠道中的数据。例如：镭射，渠道名称输出镭射。\n### 第二梯队渠道名称识别 \n如果不满足第一梯队渠道名称要求按照如下进行识别\n‒ 店铺信息中，“家电”、“电器”、“广场”、“百货”、“大楼”、“商社”加上此字段前的一个不含品牌、品类信息的有效词组作为渠道名称输出；‒ 店铺信息中，“家电”、“电器”、“广场”、“百货”、“大楼”、“商社”加上此字段前的一个有效词组，输出作为渠道名称；需屏蔽品牌、品类信息；\n‒ 当店铺信息中存在多个可识别字段时，选取顺序：优先提取括号外，其次提取括号内容。例如：“商社电器(重百梁平商场店) ”输出“重百商社”。“我家电器(金色时代广场店)”输出“我家电器”；。\n### 如果不符合第一和第二梯队识别规则，输出“-”。\n\n## 店铺分类\n‒ 品牌专卖：某一店铺信息里含“单名和个品牌同事存在+专卖店”或“名和单个品牌同时存在同事+店铺编码”，，其他情况不算属于“品牌专卖。例如：“美的(NO.桂Z0821店)”输出“品牌专卖”。“安踏(NO.桂Z0821店)”输出“品牌专卖”。“美的(金色时代广场店)”输出“-”。\n‒ 家电连锁：当渠道名称归类中包含“京东”、“天猫”、“苏宁”时，店铺类型属于“家电连锁”\n‒ 百货：当渠道名称归类中含“百货”、“广场”、“大楼”或店铺信息里含“百货”、“广场”、“大楼”时，店铺类型属于“百货”\n‒ 超市：当店铺信息里含“超市”时，店铺类型属于“超市”\n‒ 地方卖场：当渠道名称归类中含“家电”、“电器”或店铺信息里含“百货”、“家电”、“电器”时，店铺类型属于“地方卖场”\n如果不符合以上所有需求，输出“-”\n\n## 主营品类\n请识别店铺信息中的内容或识别店铺信息中品牌的主营品类，输出内容可参考：手机通讯、家用电器、3C电子。\n特别注意：中国电信、移动、联通等的主营品类，归到手机通讯。\n\n## 专卖品牌\n‒ 存在多个品牌（包含多个子品牌）时，输出“-”；\n‒ 当一个品牌的中英文同时存在时，视为一个品牌，输出品牌中文。例如：Haier海尔，输出“海尔”；\n‒ 当仅出现品牌英文时，如果有对应品牌中文时，输出品牌中文。如果无对应品牌中文时，输出品牌英文即可。例如：Haier，输出“海尔”；\n‒ 当主品牌和子品牌同时存在时，仅输出子品牌。例如：Haier海尔统帅，输出“统帅”；\n‒ 未识别到品牌输出“-”。\n\n# 示例\n## 输入\n 李宁(溧阳苏宁广场店)\n## 提取后输出内容\n{\n"渠道名称":"苏宁广场",\n"店铺分类":"家电连锁",\n"主营品类":"运动鞋服",\n"专卖品牌":"李宁"\n}\n\n# 输出要求\n‒ 如未提取到相关数据请用“-”替代，主营品类不能为“-”，必须识别出；\n‒ 仅输出最终的Json格式数据，禁止输出其他内容包括提取过程。',
        prompts: [
            {"text": "天猫优品电器专卖店(拓新李子园小区4期店)", "title": "天猫优品电器专卖店(拓新李子园小区4期店)"},
            {"text": "苏宁帮客(丰石东路店)", "title": "苏宁帮客(丰石东路店)"}
        ]
    },
    // 常用工具
    'chat': {
        model: 'qwen-plus',
        initialContent: 'You are a helpful assistant.',
        prompts: [
            {"text": "请帮我解释一下这个概念", "title": "概念解释"},
            {"text": "我需要你的建议", "title": "寻求建议"}
        ]
    },
    'app_image': {
        model: 'qwen-plus',
        initialContent: 'You are an image generation assistant.',
        prompts: [
            {"text": "帮我生成一张图片", "title": "生成新图片"},
            {"text": "修改这张图片的风格", "title": "图片风格转换"},
            {"text": "帮我优化这张图片", "title": "图片优化"}
        ]
    },
    'code': {
        model: 'qwen-plus',
        initialContent: 'You are a coding assistant.',
        prompts: [
            {"text": "帮我优化这段代码", "title": "代码优化"},
            {"text": "解释这段代码的功能", "title": "代码解释"},
            {"text": "帮我找出代码中的问题", "title": "代码调试"}
        ]
    },
    'write': {
        model: 'qwen-plus',
        initialContent: 'You are a creative writing assistant.',
        prompts: [
            {"text": "帮我写一篇文章", "title": "文章创作"},
            {"text": "优化这段文字表达", "title": "文字优化"},
            {"text": "生成文章大纲", "title": "大纲生成"}
        ]
    },
    //高级功能
    'voice': {
        model: 'qwen-plus',
        initialContent: 'You are a voice assistant.',
        prompts: [
            {"text": "将语音转换为文字", "title": "语音转文字"},
            {"text": "生成语音内容", "title": "文字转语音"},
            {"text": "分析语音情感", "title": "语音情感分析"}
        ]
    },
    'translate': {
        model: 'qwen-plus',
        initialContent: 'You are a translation assistant.',
        prompts: [
            {"text": "翻译这段文本", "title": "文本翻译翻译这段文本翻译这段文本"},
            {"text": "润色翻译结果", "title": "翻译优化"},
            {"text": "解释翻译中的习语", "title": "习语解释"}
        ]
    },
    'app_data': {
        model: 'qwen-plus',
        initialContent: 'You are a data analysis assistant.',
        prompts: [
            {"text": "分析这组数据的趋势", "title": "趋势分析"},
            {"text": "生成数据可视化图表", "title": "数据可视化"},
            {"text": "预测数据未来走势", "title": "数据预测"}
        ]
    },
    'app_video': {
        model: 'qwen-plus',
        initialContent: 'You are a video processing assistant.',
        prompts: [
            {"text": "生成视频字幕", "title": "字幕生成"},
            {"text": "剪辑优化视频", "title": "视频剪辑"},
            {"text": "转换视频风格", "title": "风格转换"}
        ]
    },
    // ... 其他卡片配置
};

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
        
        // 清除所有聊天实例的历史记录
        chatInstances.forEach(instance => {
            instance.clearHistory();
            instance.modal.classList.remove('show'); // 关闭所有打开的对话框
        });
        
        alert('已注销');
    });

    // 创建ChatApp类来管理每个独立的对话实例
    class ChatApp {
        constructor(card) {
            this.API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
            this.API_KEY = localStorage.getItem('apiKey');
            
            // 从配置中获取数据
            const config = CARD_CONFIGS[card.id];
            if (!config) {
                throw new Error(`找不到卡片 ${card.id} 的配置`);
            }
            
            this.model = config.model;
            this.messageHistory = [{
                role: "system",
                content: config.initialContent
            }];
            this.prompts = config.prompts;
            
            this.cardTitle = card.querySelector('h3').textContent;
            this.card = card;

            this.createChatModal();
            this.bindEvents();
            this.preventDebug();
        }

        preventDebug() {
            // 禁用控制台
            const disableDevTools = () => {
                if(window.devtools.isOpen) {
                    window.location.href = "about:blank";
                }
            };
            
            // 检测 DevTools
            const devtools = {
                isOpen: false,
                orientation: undefined
            };
            
            // 添加监听器
            window.addEventListener('devtoolschange', event => {
                devtools.isOpen = event.detail.isOpen;
                disableDevTools();
            });
            
            // 使用 console.clear() 清除之前的日志
            console.clear();
            
            // 重写 console 方法
            const noop = () => {};
            ['log', 'debug', 'info', 'warn', 'error'].forEach(method => {
                console[method] = noop;
            });
        }

        createChatModal() {
            // 使用 this.prompts 替代从 DOM 获取
            const promptsHTML = this.prompts.map(prompt => 
                `<div class="prompt-chip" title="${prompt.title}">${prompt.text}</div>`
            ).join('');

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
                        <div class="prompt-suggestions">
                            ${promptsHTML}
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

            // 添加提示输入的点击事件
            const promptChips = this.modal.querySelectorAll('.prompt-chip');
            promptChips.forEach(chip => {
                chip.addEventListener('click', () => {
                    this.messageInput.value = chip.textContent;
                    this.messageInput.focus();
                });
            });
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
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: this.model, // 使用卡片指定的模型
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
            textDiv.innerHTML = content.replace(/\n/g, '<br>');
            
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

        // 添加解密方法
        decryptContent(encrypted) {
            if(!encrypted) return null;
            try {
                // 使用 Base64 + 简单异或加密
                const key = "YOUR_SECRET_KEY"; // 需要保密的密钥
                const decoded = atob(encrypted);
                return decoded.split('').map((char, index) => 
                    String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length))
                ).join('');
            } catch(e) {
                console.error('解密失败');
                return null;
            }
        }

        async initializeConfig(cardId) {
            try {
                const response = await fetch('/api/get-card-config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ cardId })
                });
                
                const config = await response.json();
                this.messageHistory = [{
                    role: "system",
                    content: config.initialContent
                }];
            } catch(e) {
                console.error('获取配置失败');
            }
        }
    }

    // 搜索功能代码
    const searchInput = document.querySelector('.search-container input');
    const appCards = document.querySelectorAll('.app-card');
    
    // 存储每个卡片的聊天实例
    const chatInstances = new Map();

    // 为每个卡片创建独立的聊天实例
    appCards.forEach(card => {
        chatInstances.set(card, new ChatApp(card)); // 传递initialContent

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

    // 为所有卡片描述添加完整文本属性
    const descriptions = document.querySelectorAll('.app-card p');
    descriptions.forEach(p => {
        p.setAttribute('data-full-text', p.textContent);
    });
});