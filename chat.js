// Текущий открытый чат
let currentChatId = null;
let currentOtherUser = null;
let messagesUnsubscribe = null;
let selectedMessages = new Set();

// Загрузить список чатов
async function displayChats() {
    try {
        const chats = await loadChats();
        const chatsList = document.getElementById('chatsList');

        if (chats.length === 0) {
            chatsList.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" opacity="0.3">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <p>Нет чатов</p>
                    <small>Найдите пользователя по ID чтобы начать общение</small>
                </div>
            `;
            return;
        }

        chatsList.innerHTML = chats.map(chat => `
            <div class="chat-item ${currentChatId === chat.chatId ? 'active' : ''}" 
                 onclick="openChat('${chat.chatId}', '${chat.otherUserData.uid}', '${chat.otherUserData.userId}')">
                <div class="chat-avatar" style="background: ${getAvatarColor(chat.otherUserData.userId)}"
                     title="${chat.otherUserData.name}">
                    ${getInitials(chat.otherUserData.name)}
                </div>
                <div class="chat-preview">
                    <div class="chat-preview-name">${chat.otherUserData.name}</div>
                    <div class="chat-preview-message">
                        ${chat.lastMessageSenderId === currentUser.uid ? 'Вы: ' : ''}
                        ${chat.lastMessage ? chat.lastMessage : 'Нет сообщений'}
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Ошибка загрузки чатов:', error);
        showToast('Ошибка загрузки чатов', 'error');
    }
}

// Открыть чат
async function openChat(chatId, otherUserUid, otherUserId) {
    try {
        // Отписываемся от предыдущего слушателя
        if (messagesUnsubscribe) {
            messagesUnsubscribe();
        }

        currentChatId = chatId;
        selectedMessages.clear();
        
        // Получаем данные другого пользователя
        currentOtherUser = await getUserProfile(otherUserUid);
        
        if (!currentOtherUser) {
            showToast('Пользователь не найден', 'error');
            return;
        }

        // Переключаемся на вид чата
        switchView('chatDetail');

        // Обновляем информацию чата
        document.getElementById('chatName').textContent = currentOtherUser.name;
        document.getElementById('chatUserId').textContent = `#${String(currentOtherUser.userId).padStart(4, '0')}`;
        const chatAvatarHeader = document.getElementById('chatAvatarHeader');
        chatAvatarHeader.style.background = getAvatarColor(currentOtherUser.userId);
        chatAvatarHeader.textContent = getInitials(currentOtherUser.name);

        // Слушаем сообщения в реальном времени
        messagesUnsubscribe = listenToMessages(chatId, (messages) => {
            displayMessages(messages);
            
            // Помечаем непрочитанные сообщения как прочитанные
            messages.forEach(msg => {
                if (msg.senderId !== currentUser.uid && !msg.read) {
                    markMessageAsRead(msg.id, chatId);
                }
            });
        });

        // Обновляем активный чат в списке
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        event.currentTarget.classList.add('active');

    } catch (error) {
        console.error('Ошибка открытия чата:', error);
        showToast('Ошибка открытия чата', 'error');
    }
}

// Отобразить сообщения
function displayMessages(messages) {
    const container = document.getElementById('messagesContainer');
    
    container.innerHTML = messages.map(msg => {
        const isOwn = msg.senderId === currentUser.uid;
        const status = msg.read ? '✓✓' : '✓';
        const time = formatMessageTime(msg.createdAt);
        
        const isSelected = selectedMessages.has(msg.id);

        return `
            <div class="message ${isOwn ? 'sent' : 'received'}" 
                 data-message-id="${msg.id}"
                 onmousedown="handleMessagePress(event, '${msg.id}')"
                 oncontextmenu="handleMessageContextMenu(event, '${msg.id}')">
                <div class="message-bubble ${isSelected ? 'selected' : ''}" 
                     id="bubble-${msg.id}">
                    ${msg.deletedForAll ? '<em>[Сообщение удалено]</em>' : escapeHtml(msg.text)}
                </div>
                <div class="message-time">
                    <span>${time}</span>
                    ${isOwn ? `<span class="message-status">${status}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');

    // Скролим к последнему сообщению
    container.scrollTop = container.scrollHeight;
}

// Обработка нажатия на сообщение
let messageHoldTimeout = null;

function handleMessagePress(event, messageId) {
    if (event.button === 2) { // Right click
        return;
    }

    messageHoldTimeout = setTimeout(() => {
        selectMessage(messageId, event);
    }, 500); // 0.5 секунды
}

function selectMessage(messageId, event) {
    const isSelected = selectedMessages.has(messageId);
    
    if (isSelected) {
        selectedMessages.delete(messageId);
    } else {
        selectedMessages.add(messageId);
    }

    // Обновляем визуальное состояние
    const bubble = document.getElementById(`bubble-${messageId}`);
    if (bubble) {
        bubble.classList.toggle('selected');
    }

    updateDeletePanel();
}

function updateDeletePanel() {
    const panel = document.getElementById('deleteActionsPanel');
    const count = selectedMessages.size;

    if (count === 0) {
        panel.classList.remove('active');
    } else {
        const label = document.getElementById('deleteCountLabel');
        if (count === 1) {
            label.textContent = '1 сообщение';
        } else if (count % 10 === 1 && count % 100 !== 11) {
            label.textContent = `${count} сообщение`;
        } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
            label.textContent = `${count} сообщения`;
        } else {
            label.textContent = `${count} сообщений`;
        }
        panel.classList.add('active');
    }
}

// Обработка правого клика
document.addEventListener('mouseup', () => {
    clearTimeout(messageHoldTimeout);
});

function handleMessageContextMenu(event, messageId) {
    event.preventDefault();
    selectMessage(messageId, event);
}

// Отправить сообщение
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value;

    if (!text.trim()) {
        return;
    }

    // Отправляем сообщение
    const result = await sendMessageToChat(currentChatId, text);
    
    if (result) {
        input.value = '';
        input.focus();
    }
}

async function sendMessageToChat(chatId, text) {
    return await sendMessage(chatId, text);
}

// Обработка Enter в input
document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

// Отмена выделения
function cancelDelete() {
    selectedMessages.clear();
    updateDeletePanel();
    
    // Очищаем выделение
    document.querySelectorAll('.message-bubble.selected').forEach(bubble => {
        bubble.classList.remove('selected');
    });
}

// Открыть диалог удаления
function openDeleteDialog() {
    document.getElementById('deleteDialog').classList.add('active');
}

// Закрыть диалог удаления
function closeDeleteDialog() {
    document.getElementById('deleteDialog').classList.remove('active');
}

// Удалить сообщения для меня
async function deleteMessageForMe() {
    closeDeleteDialog();
    
    let count = 0;
    for (const messageId of selectedMessages) {
        if (await deleteMessageForMe(messageId)) {
            count++;
        }
    }
    
    selectedMessages.clear();
    updateDeletePanel();
    showToast(`${count} сообщение(й) удалено для вас`, 'success');
}

// Удалить сообщения для всех
async function deleteMessageForAll() {
    closeDeleteDialog();
    
    let count = 0;
    for (const messageId of selectedMessages) {
        if (await deleteMessageForAll(messageId)) {
            count++;
        }
    }
    
    selectedMessages.clear();
    updateDeletePanel();
}

// Назад к чатам
function backToChats() {
    switchView('chats');
    currentChatId = null;
    currentOtherUser = null;
    selectedMessages.clear();
    
    if (messagesUnsubscribe) {
        messagesUnsubscribe();
    }
    
    // Очищаем input
    document.getElementById('messageInput').value = '';
}

// Найти пользователя по ID
async function findUserById() {
    const input = document.getElementById('searchUserId');
    const userId = parseInt(input.value);

    if (isNaN(userId) || userId < 1000 || userId > 9999) {
        showToast('Введите корректный 4-значный ID', 'error');
        return;
    }

    const user = await getUserById(userId);

    if (!user) {
        document.getElementById('searchResult').innerHTML = `
            <div class="search-result">
                <p style="color: var(--color-danger);">Пользователь с ID #${String(userId).padStart(4, '0')} не найден</p>
            </div>
        `;
        return;
    }

    if (user.uid === currentUser.uid) {
        showToast('Вы не можете начать чат с самим собой', 'error');
        return;
    }

    // Показываем результат
    document.getElementById('searchResult').innerHTML = `
        <div class="search-result">
            <div class="user-card">
                <div class="chat-avatar" style="background: ${getAvatarColor(user.userId)}; width: 48px; height: 48px;">
                    ${getInitials(user.name)}
                </div>
                <div class="user-card-info">
                    <div>${user.name}</div>
                    <div>#${String(user.userId).padStart(4, '0')}</div>
                </div>
                <button class="btn-primary" style="width: auto; padding: 8px 16px;" 
                        onclick="startChat('${user.uid}')">Написать</button>
            </div>
        </div>
    `;
}

// Начать чат
async function startChat(otherUserUid) {
    try {
        // Получаем или создаем чат
        const chatId = await getOrCreateChat(otherUserUid);
        
        if (!chatId) {
            showToast('Ошибка создания чата', 'error');
            return;
        }

        // Получаем данные пользователя
        const userData = await getUserProfile(otherUserUid);
        
        // Закрываем диалог
        closeFindUserDialog();
        
        // Перезагружаем чаты
        await displayChats();
        
        // Открываем чат
        openChat(chatId, otherUserUid, userData.userId);
        
        showToast('Чат начат!', 'success');
    } catch (error) {
        console.error('Ошибка начала чата:', error);
        showToast('Ошибка начала чата', 'error');
    }
}

// Функции диалога поиска
function openFindUserDialog() {
    document.getElementById('findUserDialog').classList.add('active');
    document.getElementById('searchUserId').focus();
    document.getElementById('searchResult').innerHTML = '';
}

function closeFindUserDialog() {
    document.getElementById('findUserDialog').classList.remove('active');
    document.getElementById('searchUserId').value = '';
    document.getElementById('searchResult').innerHTML = '';
}

// Закрытие диалога по Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeFindUserDialog();
        closeDeleteDialog();
    }
});

// Клик вне диалога
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

console.log('Chat загружен');
