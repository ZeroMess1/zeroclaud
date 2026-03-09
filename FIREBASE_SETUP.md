# 🔥 Инструкция по настройке Firebase для Zero Messenger

## 1️⃣ Создание Firebase проекта

### Шаг 1: Идем на Firebase Console
1. Откройте https://console.firebase.google.com/
2. Нажмите **"Создать проект"** или **"Add project"**
3. Введите имя: `Zero Messenger` или любое другое
4. Выберите страну/регион
5. Нажмите **"Продолжить"**

### Шаг 2: Отключаем Analytics (опционально)
- Уберите галку "Включить Google Analytics"
- Нажмите **"Создать проект"**

### Шаг 3: Ждем завершения
- Проект создается (1-2 минуты)
- Нажмите **"Продолжить"** когда готово

## 2️⃣ Получение Firebase Credentials

### Шаг 1: Регистрируем Web приложение
1. На странице проекта нажмите **"</>"** (Web)
2. Введите имя приложения: `Zero Messenger Web`
3. Нажмите **"Зарегистрировать приложение"**

### Шаг 2: Копируем конфигурацию
Вы увидите код:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### Шаг 3: Сохраняем в config.js
1. Откройте файл `config.js` в проекте
2. Замените значения на свои из Firebase
3. Сохраните файл

## 3️⃣ Настройка Firestore Database

### Шаг 1: Создаем Firestore
1. В левом меню нажмите **"Firestore Database"**
2. Нажмите **"Создать базу данных"**
3. Выберите регион (рекомендуется ближайший к вам)
4. Выберите **"Начать в режиме тестирования"** (или безопасном)
5. Нажмите **"Создать"**

### Шаг 2: Применяем Firestore Rules
1. Перейдите на вкладку **"Rules"**
2. Удалите текущие правила
3. Скопируйте содержимое файла `FIRESTORE_RULES.txt`
4. Нажмите **"Publish"**

```javascript
// Должны быть разрешены:
- Читать профили пользователей
- Участники могут читать и писать в своих чатах
- Только авторы могут редактировать/удалять свои сообщения
```

### Шаг 3: Создаем коллекции
Нажмите **"+ Начать коллекцию"** и создайте следующие:

#### Коллекция: `users`
Не нужно создавать вручную - создается при регистрации

#### Коллекция: `chats`
Не нужно создавать вручную - создается при начале диалога

#### Коллекция: `messages`
Не нужно создавать вручную - создается при отправке сообщения

#### Коллекция: `blocks`
Не нужно создавать вручную - создается при блокировке

## 4️⃣ Настройка Authentication

### Шаг 1: Включаем Email/Password
1. Идите в **"Authentication"**
2. Нажмите на вкладку **"Sign-in method"**
3. Нажмите **"Email/Password"**
4. Включите **"Email/Password"**
5. Нажмите **"Save"**

### Шаг 2: Настраиваем параметры (опционально)
1. Идите в **"Settings"** (в левом меню)
2. **"User actions"** → Включите требуемые действия
3. **"Password policy"** → Установите требования к паролю

### Шаг 3: Проверяем Email verification
1. Идите в **"Templates"** (в Authentication)
2. Отредактируйте письмо подтверждения если нужно
3. По умолчанию работает отправка писем

## 5️⃣ Настройка Security

### Шаг 1: Включаем CORS (для локального тестирования)
Для локальной разработки:

```javascript
// В config.js Firebase автоматически обрабатывает это
// При публикации убедитесь что оригин добавлен
```

### Шаг 2: Ограничение API ключей (важно!)
1. Идите в **"Project Settings"** → **"APIs & Services"**
2. Найдите **"Restrictions"** для вашего API Key
3. Установите:
   - **Application restrictions**: None (для тестирования)
   - **API restrictions**: Cloud Firestore, Firebase Authentication

### Шаг 3: Добавляем домены (для production)
1. Идите в **"Authentication"** → **"Settings"**
2. В разделе **"Authorized domains"** добавьте:
   - `localhost` (для локальной разработки)
   - Ваш домен (для production)
   - `firebaseapp.com` (автоматически)

## 6️⃣ Структурируем данные в Firestore

### Создаем индексы (опционально)
Firestore автоматически создает индексы при первом запросе.
Для оптимизации можно создать вручную:

1. Firestore → **Indexes** → **Create Index**
2. Создайте индексы для:
   - `messages`: (chatId, createdAt)
   - `users`: userId
   - `chats`: (participants, lastMessageTime)

## 7️⃣ Тестирование Firebase

### Способ 1: Через консоль браузера
```javascript
// Откройте DevTools (F12) → Console

// Проверка инициализации
console.log(firebase.app());

// Проверка Auth
console.log(firebase.auth().currentUser);

// Проверка Firestore
firebase.firestore().collection('users').limit(1).get()
  .then(snap => console.log('Firestore работает!'));
```

### Способ 2: Функция в приложении
```javascript
async function testFirebase() {
  try {
    // Тест Auth
    console.log('Auth:', !!auth);
    
    // Тест Firestore
    const users = await db.collection('users').limit(1).get();
    console.log('Firestore работает!', users.size);
    
    showToast('Firebase работает корректно!', 'success');
  } catch (error) {
    console.error('Ошибка:', error);
    showToast('Ошибка Firebase: ' + error.message, 'error');
  }
}
```

## 8️⃣ Мониторинг и логирование

### Включаем логирование в разработке
```javascript
// В config.js после инициализации Firebase:

// Логирование Auth
auth.onAuthStateChanged(user => {
  console.log('Auth state changed:', user?.email);
});

// Логирование Firestore (включить в dev только!)
if (window.location.hostname === 'localhost') {
  firebase.firestore().enableLogging(true);
}
```

### Просмотр логов
1. Firebase Console → **Firestore** → **Logs**
2. Фильтруйте по:
   - Operation (создание, чтение, обновление, удаление)
   - Timestamp
   - Error status

## 9️⃣ Backup и восстановление

### Включаем автоматические резервные копии
1. Firestore → **Backups**
2. Нажмите **"Create Backup Schedule"**
3. Выберите расписание (рекомендуется ежедневное)
4. Нажмите **"Create"**

### Ручное резервное копирование
```bash
# Через Google Cloud SDK (если установлен)
gcloud firestore export gs://your-bucket/backup-$(date +%s)
```

## 🔟 Production настройки

### Шаг 1: Переходим в режим безопасности
1. Firestore → **Rules** → Используйте `FIRESTORE_RULES.txt`
2. Убедитесь что разрешены только нужные операции
3. Нажмите **"Publish"**

### Шаг 2: Ограничиваем API ключ
1. Project Settings → APIs & Services
2. Найдите API Key
3. Нажмите на него
4. Установите:
   ```
   API restrictions: Cloud Firestore, Firebase Authentication
   Application restrictions: HTTP referrers (your-domain.com)
   ```

### Шаг 3: Включаем reCAPTCHA (для Auth)
1. Authentication → **Settings**
2. **reCAPTCHA Enterprise** → Включите
3. Это защитит от автоматизированных атак

### Шаг 4: Мониторим квоты
1. Firestore → **Usage**
2. Убедитесь что остаются в пределах бесплатного плана
3. Установите alerts если нужно

## Решение проблем

### ❌ "Permission denied" при чтении/написании
✅ Решение:
1. Проверьте Firestore Rules - может быть неправильное условие
2. Убедитесь что пользователь авторизован
3. Проверьте что UID в Rules совпадает с Firebase Auth

### ❌ "Firebase is not defined"
✅ Решение:
1. Проверьте что Firebase скрипты подключены в HTML
2. Порядок: firebase.js → firebase-auth.js → firebase-firestore.js
3. Убедитесь что интернет соединение активно

### ❌ "Invalid API Key"
✅ Решение:
1. Проверьте config.js - API Key скопирован правильно
2. Убедитесь что API Key не запущен в браузере Security Console
3. Попробуйте пересоздать API Key в Firebase Console

### ❌ "CORS error"
✅ Решение:
1. Используйте https:// вместо http://
2. Добавьте домен в Authorization domains
3. Для localhost обычно работает без настроек

### ❌ Медленная загрузка данных
✅ Решение:
1. Включите кэширование в config.js
2. Используйте `limitToLast()` вместо загрузки всех
3. Создайте индексы для часто используемых запросов

## Полезные ссылки

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firestore Pricing](https://firebase.google.com/pricing)

## Бесплатный план Firebase

**Включено:**
- ✅ До 25,000 операций чтения в день
- ✅ До 25,000 операций записи в день
- ✅ До 1 ГБ хранения
- ✅ Неограниченное количество пользователей Auth
- ✅ 120 операций удаления в день

**Рекомендации:**
- Оптимизируйте запросы
- Используйте мягкое удаление вместо физического
- Кэшируйте данные на клиенте
- Очищайте старые данные

---

**Готово!** Ваша Firebase база данных настроена и готова к использованию 🎉
