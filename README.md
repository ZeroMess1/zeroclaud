# Zero Messenger 🚀

Современный мессенджер на базе Firestore с полной функциональностью общения.

## ✨ Возможности

- 📝 **Регистрация и вход** - Email/пароль аутентификация
- 🆔 **Уникальные ID** - 4-значные коды для поиска пользователей
- 💬 **Чаты** - Общение в реальном времени
- ✓ **Статус сообщений** - 1 галочка (отправлено), 2 галочки (прочитано)
- 🗑️ **Удаление сообщений** - "Удалить у себя" или "Удалить у всех"
- 👤 **Профиль** - Изменение имени, аватара, информации о себе
- 🔐 **Конфиденциальность** - Скрытие данных профиля
- 🎨 **Настройки** - Размер шрифта, темная тема
- 📱 **Адаптивный дизайн** - Работает на всех устройствах

## 🛠️ Требования

- Node.js 14+
- npm или yarn
- Firebase Account
- Java JDK 11+ (для APK)
- Android SDK (для APK)

## 📦 Установка

### 1. Клонируем репозиторий
```bash
git clone https://github.com/yourusername/zero-messenger.git
cd zero-messenger
```

### 2. Устанавливаем зависимости
```bash
npm install
```

### 3. Настраиваем Firebase

Создаем файл `config.js` с вашими Firebase credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

Получить эти данные можно в Firebase Console:
1. Идем на https://console.firebase.google.com/
2. Создаем новый проект
3. Переходим в Project Settings
4. Копируем конфигурацию для Web

### 4. Структурируем Firestore

Создаем следующие коллекции в Firestore:

```
├── users
│   ├── {uid}
│   │   ├── userId: 1234 (number)
│   │   ├── name: "John" (string)
│   │   ├── email: "john@example.com" (string)
│   │   ├── avatar: "" (string - base64)
│   │   ├── about: "" (string)
│   │   ├── birthday: "" (string)
│   │   ├── hideAbout: false (boolean)
│   │   ├── hideBirthday: false (boolean)
│   │   ├── online: true (boolean)
│   │   ├── lastSeen: timestamp
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│
├── chats
│   ├── {chatId}
│   │   ├── chatId: "uid1_uid2" (string)
│   │   ├── participants: [uid1, uid2] (array)
│   │   ├── lastMessage: "Hello" (string)
│   │   ├── lastMessageSenderId: uid1 (string)
│   │   ├── lastMessageTime: timestamp
│   │   └── createdAt: timestamp
│
├── messages
│   ├── {messageId}
│   │   ├── messageId: "id123" (string)
│   │   ├── chatId: "uid1_uid2" (string)
│   │   ├── senderId: uid1 (string)
│   │   ├── text: "Hello" (string)
│   │   ├── createdAt: timestamp
│   │   ├── read: false (boolean)
│   │   ├── readAt: null (timestamp)
│   │   ├── deleted: false (boolean)
│   │   ├── deletedForMe: {} (map)
│   │   ├── deletedForAll: false (boolean)
│   │   └── edited: false (boolean)
│
└── blocks
    └── {blockId}
        ├── blockerId: uid1 (string)
        ├── blockedId: uid2 (string)
        └── createdAt: timestamp
```

## 🚀 Запуск

### Web версия
```bash
# Простой сервер для тестирования
npx http-server
```

Откройте http://localhost:8080 в браузере

## 📱 Создание APK

### Способ 1: Через GitHub Actions (рекомендуется)

#### Подготовка:

1. **Создаем Keystore** для подписи APK:
```bash
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias zeromessenger
```

2. **Конвертируем в Base64**:
```bash
base64 my-release-key.keystore > keystore-base64.txt
```

3. **Добавляем Secrets в GitHub**:
   - Идем на GitHub → Settings → Secrets and variables → Actions
   - Добавляем:
     - `KEYSTORE_BASE64` - содержимое keystore-base64.txt
     - `KEYSTORE_PASSWORD` - пароль от keystore
     - `KEY_ALIAS` - alias (zeromessenger)
     - `KEY_PASSWORD` - пароль от ключа

4. **Перемещаем workflow**:
```bash
mkdir -p .github/workflows
mv android-build.yml .github/workflows/
```

5. **Push в GitHub**:
```bash
git add .
git commit -m "Add Android build workflow"
git push origin main
```

6. **APK будет собран автоматически** при push. Скачайте в разделе Actions.

### Способ 2: Локальная сборка

```bash
# Устанавливаем Cordova
npm install -g cordova

# Создаем проект
cordova create ZeroMessenger com.zeromessenger.app "Zero Messenger"
cd ZeroMessenger

# Добавляем платформу
cordova platform add android

# Копируем файлы
cp ../index.html www/
cp ../styles.css www/
cp ../config.js www/
cp ../*.js www/

# Собираем
cordova build android --release

# Подписываем
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore my-release-key.keystore \
  platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk \
  zeromessenger

# Оптимизируем
zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk \
  platforms/android/app/build/outputs/apk/release/ZeroMessenger.apk
```

## 🔧 Структура файлов

```
zero-messenger/
├── index.html           # Главный HTML
├── styles.css           # Стили
├── config.js            # Конфигурация Firebase
├── utils.js             # Утилиты
├── auth.js              # Аутентификация
├── firestore.js         # Работа с Firestore
├── chat.js              # Логика чатов
├── ui.js                # UI логика
├── app.js               # Главный файл приложения
├── android-build.yml    # GitHub Actions workflow
├── package.json         # Зависимости
└── README.md            # Этот файл
```

## 📋 Правила Firestore Security

Добавьте в Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid == uid;
    }
    
    match /chats/{chatId} {
      allow read: if request.auth.uid in resource.data.participants;
      allow write: if request.auth.uid in resource.data.participants;
    }
    
    match /messages/{messageId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid == request.resource.data.senderId;
      allow update: if request.auth.uid == resource.data.senderId;
      allow delete: if request.auth.uid == resource.data.senderId;
    }
    
    match /blocks/{blockId} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid == request.resource.data.blockerId;
    }
  }
}
```

## 🎯 Использование

### Регистрация
1. Введите имя, email и пароль
2. Нажмите "Создать аккаунт"
3. Получите уникальный 4-значный ID

### Поиск пользователя
1. Нажмите кнопку поиска
2. Введите 4-значный ID пользователя
3. Нажмите "Найти"
4. Нажмите "Написать"

### Отправка сообщений
1. Напишите текст в поле ввода
2. Нажмите кнопку отправки или Enter
3. Сообщение появится с статусом ✓

### Управление сообщениями
1. Длительно нажмите на сообщение (0.5 сек)
2. Сообщение выделится синим
3. Выберите несколько если нужно
4. Нажмите "Удалить"
5. Выберите "Удалить у себя" или "Удалить у всех"

### Профиль
1. Нажмите на вкладку "Профиль"
2. Загрузите аватар
3. Заполните информацию о себе
4. Нажмите "Сохранить изменения"

### Настройки
1. Нажмите на вкладку "Настройки"
2. Измените размер шрифта
3. Включите темную тему
4. Управляйте конфиденциальностью
5. Нажмите "Выход" для выхода

## 🔐 Безопасность

- Пароли хранятся через Firebase Auth (не видны в базе)
- Данные шифруются при передаче (HTTPS)
- Firestore Rules защищают доступ к данным
- Аватары хранятся как base64 (без Storage)

## 📞 Поддержка

Если у вас есть вопросы, создайте Issue в GitHub.

## 📄 Лицензия

MIT License

## 🚀 Roadmap

- [ ] Групповые чаты
- [ ] Голосовые сообщения
- [ ] Видеозвонки
- [ ] Шифрование end-to-end
- [ ] Синхронизация между устройствами
- [ ] Поиск сообщений
- [ ] Темы и стикеры

---

**Версия**: 1.0.0  
**Последнее обновление**: 2024  
**Статус**: Активно разрабатывается
