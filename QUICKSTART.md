# 🚀 Zero Messenger - Краткий Старт

## 📋 Структура файлов

```
zero-messenger/
│
├── 📄 HTML & CSS
│   ├── index.html              # Главный HTML (разметка приложения)
│   └── styles.css              # Стили (готовый дизайн)
│
├── ⚙️ Конфигурация
│   ├── config.js               # Firebase credentials (НУЖНО ЗАПОЛНИТЬ!)
│   └── package.json            # Зависимости проекта
│
├── 🔐 Аутентификация
│   └── auth.js                 # Логика регистрации/входа
│
├── 🔥 Firebase & Firestore
│   └── firestore.js            # Работа с базой (CRUD операции)
│
├── 💬 Чаты
│   └── chat.js                 # Логика сообщений и чатов
│
├── 🎨 UI & Интерфейс
│   ├── ui.js                   # Переключение экранов и профиль
│   └── utils.js                # Вспомогательные функции
│
├── 🎯 Главное приложение
│   └── app.js                  # Инициализация и логирование
│
├── 📚 Документация
│   ├── README.md               # Полная инструкция
│   ├── FIREBASE_SETUP.md       # Настройка Firebase
│   ├── ANDROID_BUILD_GUIDE.md  # Создание APK
│   ├── FIRESTORE_RULES.txt     # Правила безопасности
│   └── .gitignore              # Исключения для Git
│
└── 🔧 CI/CD
    └── android-build.yml       # GitHub Actions для APK
```

## ⚡ Быстрый старт (3 минуты)

### 1️⃣ Установка (1 минута)
```bash
# Клонируем проект
git clone https://github.com/yourusername/zero-messenger.git
cd zero-messenger

# Устанавливаем зависимости
npm install
```

### 2️⃣ Firebase Setup (1 минута)
```bash
# 1. Идем в Firebase Console
# 2. Копируем config из Web приложения
# 3. Открываем config.js и вставляем:

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "...",
    projectId: "...",
    // ... остальное
};
```

### 3️⃣ Запуск (1 минута)
```bash
# Стартуем веб-сервер
npm start

# Или используем:
npx http-server
```

Откройте http://localhost:8080 🎉

## 📱 Для APK (GitHub Actions)

1. Создайте Keystore (5 минут)
2. Добавьте Secrets в GitHub (5 минут)
3. Push кода → GitHub Actions сам соберет APK (5 минут)

Подробнее: `ANDROID_BUILD_GUIDE.md`

## 📚 Что где находится

| Что нужно | Файл | Что делать |
|----------|------|----------|
| Залогиниться/Зарегистрироваться | auth.js | Используется автоматически |
| Добавить чат | chat.js | `openChat()` или `startChat()` |
| Отправить сообщение | chat.js | `sendMessage()` |
| Удалить сообщение | firestore.js | `deleteMessageForMe()` или `deleteMessageForAll()` |
| Изменить профиль | ui.js | `saveProfile()` |
| Поменять настройки | ui.js | `changeFontSize()`, `toggleDarkTheme()` |
| Добавить функцию | utils.js | Все вспомогательные функции |

## 🔥 Firestore Структура

```javascript
// Как устроена база данных:

users/{uid}
  └─ userId: 1234
  └─ name: "Иван"
  └─ email: "ivan@example.com"
  └─ avatar: "base64_image"

chats/{chatId}
  └─ participants: [uid1, uid2]
  └─ lastMessage: "Привет!"
  └─ lastMessageTime: timestamp

messages/{messageId}
  └─ chatId: "uid1_uid2"
  └─ senderId: uid1
  └─ text: "Привет!"
  └─ createdAt: timestamp
  └─ read: true
  └─ deletedForAll: false
```

## 🎨 UI Компоненты

### Экраны приложения:
- **chatsView** - Список чатов
- **chatDetailView** - Открытый чат с сообщениями
- **profileView** - Профиль пользователя
- **settingsView** - Настройки

### Управление:
```javascript
// Переключение экранов
switchView('chats')      // К чатам
switchView('profile')    // К профилю
switchView('settings')   // К настройкам

// Диалоги
openFindUserDialog()     // Поиск пользователя
openDeleteDialog()       // Удаление сообщения
```

## 🔐 Безопасность

### Правила Firestore:
✅ Каждый может читать публичные профили
✅ Только участники видят сообщения в чате
✅ Только автор может удалить свое сообщение
❌ Нет доступа к данным других пользователей

Правила в файле: `FIRESTORE_RULES.txt`

## 🐛 Отладка

### Включить логирование:
```javascript
// В DevTools (F12) → Console:

// Проверить Firebase
console.log(firebase.app());

// Проверить текущего пользователя
console.log(currentUser);

// Проверить данные профиля
console.log(currentUserData);

// Загрузить чаты
loadChats().then(console.log);
```

## 📞 ID пользователя

Каждый пользователь получает **4-значный уникальный ID**:
- Генерируется при регистрации
- Используется для поиска в приложении
- Видит всем (публичный)
- Пример: `#1234`

## ✨ Основные функции

```javascript
// Аутентификация
register(name, email, password)
login(email, password)
logout()

// Чаты
openChat(chatId, otherUserUid, otherUserId)
startChat(otherUserUid)
displayChats()

// Сообщения
sendMessage(chatId, text)
deleteMessageForMe(messageId)
deleteMessageForAll(messageId)
listenToMessages(chatId, callback)

// Профиль
loadProfileView()
saveProfile()
handleAvatarUpload(event)

// Поиск
findUserById()
getUserById(userId)
```

## 🎯 Рекомендуемый процесс разработки

### 1. Локальное тестирование
```bash
npm start
# Тестируйте на http://localhost:8080
```

### 2. После работы
```bash
git add .
git commit -m "Feature: Add message search"
git push origin main
```

### 3. Для APK
```bash
git tag v1.0.1 -m "Release 1.0.1"
git push origin v1.0.1
# GitHub Actions соберет APK автоматически
```

## 📈 Масштабирование

Если у вас много пользователей:

1. **Optimizes queries:**
   ```javascript
   // ❌ Плохо
   const all = await db.collection('messages').get();
   
   // ✅ Хорошо
   const recent = await db.collection('messages')
     .where('chatId', '==', chatId)
     .orderBy('createdAt', 'desc')
     .limit(50)
     .get();
   ```

2. **Используйте индексы** для сортировки

3. **Кэшируйте** часто используемые данные

4. **Удаляйте** старые сообщения через admin SDK

## 🌍 Развертывание

### На Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### На другом хостинге:
Просто скопируйте все файлы на сервер.

## 📊 Мониторинг

Проверяйте в Firebase Console:
- **Firestore** → Usage (операции/день)
- **Authentication** → Пользователи
- **Realtime Database Rules** (если нужны)

## ❓ FAQ

**Q: Могу ли я использовать Storage для аватаров?**
A: Да, но в текущей версии используется base64 в Firestore.

**Q: Как добавить групповые чаты?**
A: Измените структуру `chats` на массив с несколькими участниками.

**Q: Как работает синхронизация?**
A: Firestore слушает изменения в реальном времени через `onSnapshot()`.

**Q: Безопасен ли мой API Key?**
A: Он видим в браузере, но Firestore Rules защищают данные.

## 🚀 Что дальше

- [ ] Добавить поиск сообщений
- [ ] Групповые чаты
- [ ] Голосовые сообщения
- [ ] Видеозвонки (через Twilio)
- [ ] Push уведомления
- [ ] Шифрование E2E

## 📞 Поддержка

Если что-то не работает:
1. Проверьте консоль браузера (F12)
2. Проверьте Firebase Rules
3. Посмотрите документацию в README.md
4. Создайте Issue на GitHub

---

**Вы готовы к разработке! 🎉**

Начните с файла `FIREBASE_SETUP.md` для настройки Firebase.
