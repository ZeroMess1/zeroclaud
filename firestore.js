// =====================
// ПОЛЬЗОВАТЕЛИ
// =====================

// Получить пользователя по ID
async function getUserById(userId) {
    try {
        const userDoc = await db.collection('users').where('userId', '==', parseInt(userId)).get();
        
        if (userDoc.empty) {
            return null;
        }
        
        return {
            uid: userDoc.docs[0].id,
            ...userDoc.docs[0].data()
        };
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        return null;
    }
}

// Получить профиль пользователя
async function getUserProfile(uid) {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
            return null;
        }
        
        return {
            uid: uid,
            ...userDoc.data()
        };
    } catch (error) {
        console.error('Ошибка получения профиля:', error);
        return null;
    }
}

// Обновить профиль
async function updateUserProfile(uid, data) {
    try {
        await db.collection('users').doc(uid).update({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Обновляем глобальную переменную
        currentUserData = { ...currentUserData, ...data };
        
        showToast('Профиль обновлен', 'success');
        return true;
    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        showToast('Ошибка обновления профиля', 'error');
        return false;
    }
}

// =====================
// ЧАТЫ
// =====================

// Получить ID чата между двумя пользователями
function getChatId(userId1, userId2) {
    const ids = [userId1, userId2].sort();
    return `${ids[0]}_${ids[1]}`;
}

// Получить все чаты пользователя
async function loadChats() {
    try {
        const chatsSnapshot = await db.collection('chats')
            .where('participants', 'array-contains', currentUser.uid)
            .orderBy('lastMessageTime', 'desc')
            .get();

        const chats = [];
        for (const doc of chatsSnapshot.docs) {
            const chatData = doc.data();
            
            // Получаем данные другого пользователя
            const otherUserId = chatData.participants.find(id => id !== currentUser.uid);
            const otherUserData = await getUserProfile(otherUserId);
            
            if (otherUserData) {
                chats.push({
                    chatId: doc.id,
                    ...chatData,
                    otherUserData: otherUserData
                });
            }
        }
        
        return chats;
    } catch (error) {
        console.error('Ошибка загрузки чатов:', error);
        return [];
    }
}

// Создать или получить чат
async function getOrCreateChat(otherUserUid) {
    try {
        const chatId = getChatId(currentUser.uid, otherUserUid);
        
        // Проверяем, существует ли чат
        const chatDoc = await db.collection('chats').doc(chatId).get();
        
        if (!chatDoc.exists) {
            // Создаем новый чат
            await db.collection('chats').doc(chatId).set({
                chatId: chatId,
                participants: [currentUser.uid, otherUserUid],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessage: '',
                lastMessageSenderId: currentUser.uid
            });
        }
        
        return chatId;
    } catch (error) {
        console.error('Ошибка создания чата:', error);
        return null;
    }
}

// Получить чат
async function getChat(chatId) {
    try {
        const chatDoc = await db.collection('chats').doc(chatId).get();
        
        if (!chatDoc.exists) {
            return null;
        }
        
        return {
            chatId: chatId,
            ...chatDoc.data()
        };
    } catch (error) {
        console.error('Ошибка получения чата:', error);
        return null;
    }
}

// =====================
// СООБЩЕНИЯ
// =====================

// Отправить сообщение
async function sendMessage(chatId, text) {
    try {
        if (!text || text.trim() === '') {
            showToast('Сообщение не может быть пустым', 'error');
            return null;
        }

        const messageId = db.collection('_temp').doc().id; // Генерируем ID
        
        const messageData = {
            messageId: messageId,
            chatId: chatId,
            senderId: currentUser.uid,
            text: text.trim(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            read: false,
            readAt: null,
            deleted: false,
            deletedForMe: {},
            deletedForAll: false
        };

        // Сохраняем сообщение
        await db.collection('messages').doc(messageId).set(messageData);

        // Обновляем последнее сообщение в чате
        const chat = await getChat(chatId);
        if (chat) {
            const otherUserId = chat.participants.find(id => id !== currentUser.uid);
            await db.collection('chats').doc(chatId).update({
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessage: text.trim(),
                lastMessageSenderId: currentUser.uid
            });
        }

        return messageData;
    } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
        showToast('Ошибка отправки сообщения', 'error');
        return null;
    }
}

// Получить сообщения чата
async function getMessages(chatId, limit = 50) {
    try {
        const messagesSnapshot = await db.collection('messages')
            .where('chatId', '==', chatId)
            .where('deletedForAll', '==', false)
            .orderBy('createdAt', 'asc')
            .limitToLast(limit)
            .get();

        const messages = [];
        for (const doc of messagesSnapshot.docs) {
            const msgData = doc.data();
            
            // Проверяем, удалено ли сообщение для текущего пользователя
            if (msgData.deletedForMe && msgData.deletedForMe[currentUser.uid]) {
                continue;
            }
            
            messages.push({
                id: doc.id,
                ...msgData
            });
        }

        return messages;
    } catch (error) {
        console.error('Ошибка получения сообщений:', error);
        return [];
    }
}

// Слушатель сообщений в реальном времени
function listenToMessages(chatId, callback) {
    const unsubscribe = db.collection('messages')
        .where('chatId', '==', chatId)
        .orderBy('createdAt', 'asc')
        .onSnapshot((snapshot) => {
            const messages = [];
            snapshot.forEach(doc => {
                const msgData = doc.data();
                
                // Проверяем, удалено ли сообщение для текущего пользователя
                if (msgData.deletedForMe && msgData.deletedForMe[currentUser.uid]) {
                    return;
                }
                
                // Проверяем, удалено ли для всех
                if (msgData.deletedForAll) {
                    return;
                }
                
                messages.push({
                    id: doc.id,
                    ...msgData
                });
            });
            
            callback(messages);
        }, (error) => {
            console.error('Ошибка слушателя сообщений:', error);
        });
    
    return unsubscribe;
}

// Пометить сообщение как прочитанное
async function markMessageAsRead(messageId, chatId) {
    try {
        await db.collection('messages').doc(messageId).update({
            read: true,
            readAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Ошибка пометки сообщения:', error);
    }
}

// Удалить сообщение для меня
async function deleteMessageForMe(messageId) {
    try {
        const messageDoc = await db.collection('messages').doc(messageId).get();
        
        if (!messageDoc.exists) {
            showToast('Сообщение не найдено', 'error');
            return false;
        }

        const messageData = messageDoc.data();
        const deletedForMe = messageData.deletedForMe || {};
        deletedForMe[currentUser.uid] = true;

        await db.collection('messages').doc(messageId).update({
            deletedForMe: deletedForMe
        });

        showToast('Сообщение удалено у вас', 'success');
        return true;
    } catch (error) {
        console.error('Ошибка удаления сообщения:', error);
        showToast('Ошибка удаления сообщения', 'error');
        return false;
    }
}

// Удалить сообщение для всех
async function deleteMessageForAll(messageId) {
    try {
        const messageDoc = await db.collection('messages').doc(messageId).get();
        
        if (!messageDoc.exists) {
            showToast('Сообщение не найдено', 'error');
            return false;
        }

        const messageData = messageDoc.data();
        
        // Проверяем, что это сообщение текущего пользователя
        if (messageData.senderId !== currentUser.uid) {
            showToast('Вы можете удалять только свои сообщения', 'error');
            return false;
        }

        await db.collection('messages').doc(messageId).update({
            deletedForAll: true,
            text: '[Сообщение удалено]',
            read: false
        });

        showToast('Сообщение удалено для всех', 'success');
        return true;
    } catch (error) {
        console.error('Ошибка удаления сообщения:', error);
        showToast('Ошибка удаления сообщения', 'error');
        return false;
    }
}

// Редактировать сообщение
async function editMessage(messageId, newText) {
    try {
        if (!newText || newText.trim() === '') {
            showToast('Сообщение не может быть пустым', 'error');
            return false;
        }

        const messageDoc = await db.collection('messages').doc(messageId).get();
        
        if (!messageDoc.exists) {
            showToast('Сообщение не найдено', 'error');
            return false;
        }

        const messageData = messageDoc.data();
        
        if (messageData.senderId !== currentUser.uid) {
            showToast('Вы можете редактировать только свои сообщения', 'error');
            return false;
        }

        await db.collection('messages').doc(messageId).update({
            text: newText.trim(),
            edited: true,
            editedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast('Сообщение отредактировано', 'success');
        return true;
    } catch (error) {
        console.error('Ошибка редактирования сообщения:', error);
        showToast('Ошибка редактирования сообщения', 'error');
        return false;
    }
}

// =====================
// БЛОКИРОВКИ
// =====================

// Заблокировать пользователя
async function blockUser(blockedUserId) {
    try {
        const blockId = getChatId(currentUser.uid, blockedUserId);
        
        await db.collection('blocks').doc(blockId).set({
            blockerId: currentUser.uid,
            blockedId: blockedUserId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast('Пользователь заблокирован', 'success');
        return true;
    } catch (error) {
        console.error('Ошибка блокировки:', error);
        showToast('Ошибка блокировки пользователя', 'error');
        return false;
    }
}

// Разблокировать пользователя
async function unblockUser(blockedUserId) {
    try {
        const blockId = getChatId(currentUser.uid, blockedUserId);
        
        await db.collection('blocks').doc(blockId).delete();

        showToast('Пользователь разблокирован', 'success');
        return true;
    } catch (error) {
        console.error('Ошибка разблокировки:', error);
        showToast('Ошибка разблокировки пользователя', 'error');
        return false;
    }
}

// Проверить, заблокирован ли пользователь
async function isUserBlocked(userId) {
    try {
        const blockId = getChatId(currentUser.uid, userId);
        const blockDoc = await db.collection('blocks').doc(blockId).get();
        return blockDoc.exists;
    } catch (error) {
        console.error('Ошибка проверки блокировки:', error);
        return false;
    }
}

console.log('Firestore загружен');
