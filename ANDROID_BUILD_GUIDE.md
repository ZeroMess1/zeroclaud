# 📱 Инструкция: Создание APK через GitHub Actions

## Подготовка (один раз)

### Шаг 1: Создаем Keystore для подписи

Keystore используется для подписи APK. Это необходимо для публикации в Google Play Store.

```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias zeromessenger
```

**Будут запрошены данные:**
- Имя и фамилия: Zero Messenger
- Организация: Zero
- Город: Moscow
- Область: Moscow
- Страна: RU
- Пароль keystore: `ваш_пароль_от_keystore` (запомните!)
- Пароль ключа: `ваш_пароль_от_ключа` (запомните!)

### Шаг 2: Конвертируем Keystore в Base64

```bash
base64 my-release-key.keystore > keystore-base64.txt
cat keystore-base64.txt
```

Скопируйте весь вывод (это будет длинная строка).

### Шаг 3: Добавляем Secrets в GitHub

1. Идем на GitHub → репозиторий
2. Settings → Secrets and variables → Actions → New repository secret

**Добавляем следующие Secrets:**

| Название | Значение | Пример |
|----------|----------|--------|
| `KEYSTORE_BASE64` | Содержимое файла keystore-base64.txt | MIIKWAIBAz...очень длинная строка |
| `KEYSTORE_PASSWORD` | Пароль keystore | MyPassword123 |
| `KEY_ALIAS` | Название ключа | zeromessenger |
| `KEY_PASSWORD` | Пароль от ключа | MyKeyPassword456 |

### Шаг 4: Добавляем Workflow файл

1. В корне репозитория создаем папку: `.github/workflows`
2. Копируем файл `android-build.yml` в эту папку

```bash
mkdir -p .github/workflows
cp android-build.yml .github/workflows/
```

### Шаг 5: Push в GitHub

```bash
git add .
git commit -m "Add Android CI/CD workflow"
git push origin main
```

## Сборка APK

### Способ 1: Автоматическая сборка при Push

Когда вы делаете `push` в ветку `main` или `develop`, GitHub Actions автоматически:
1. Запускает workflow
2. Собирает APK
3. Подписывает его
4. Оптимизирует

Вы сможете скачать готовый APK:
1. Идите на вкладку **Actions**
2. Выберите последний workflow
3. Нажмите на **ZeroMessenger-APK** (в разделе Artifacts)

### Способ 2: Создание Release с автоматической сборкой

```bash
# Создаем тег версии
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

Когда вы создаете Release через GitHub, APK автоматически загружается в Assets.

### Способ 3: Ручной запуск

1. Идите на вкладку **Actions**
2. Выберите **Build APK**
3. Нажмите **Run workflow**
4. Выберите ветку
5. Нажмите **Run workflow**

## Скачивание APK

### Из Artifacts (сборки)

1. GitHub → Actions
2. Выберите последний workflow "Build APK"
3. Внизу найдите **Artifacts**
4. Скачайте **ZeroMessenger-APK**
5. Распакуйте ZIP
6. Файл `ZeroMessenger-release.apk` готов к установке

### Из Release (версии)

1. GitHub → Releases
2. Выберите версию
3. Скачайте `ZeroMessenger-release.apk` из Assets

## Установка APK на устройство

### Способ 1: Через adb (Android Studio)

```bash
adb install ZeroMessenger-release.apk
```

### Способ 2: Через USB

1. Подключите Android устройство через USB
2. Включите режим разработчика
3. Копируете APK на устройство
4. Нажимаете на файл
5. Устанавливаете

### Способ 3: Через Google Play Store

1. Идите на Google Play Console
2. Создайте приложение
3. Загрузите APK
4. Заполните информацию
5. Опубликуйте

## Структура GitHub Actions Workflow

```yaml
name: Build APK
on:
  push:              # Запускается при push
  pull_request:      # Запускается при PR
  workflow_dispatch: # Ручной запуск

jobs:
  build:
    - Setup Node.js       # Устанавливает Node
    - Install deps        # Устанавливает зависимости
    - Setup Java          # Устанавливает Java
    - Setup Android SDK   # Устанавливает Android SDK
    - Create Cordova      # Создает Cordova проект
    - Copy Web Files      # Копирует HTML/CSS/JS
    - Build APK           # Собирает APK
    - Sign APK            # Подписывает APK
    - Upload Artifact     # Загружает результат
    - Create Release      # Создает Release (опционально)
```

## Troubleshooting

### Ошибка: "keystore password was incorrect"

✅ Проверьте:
- Правильность пароля в `KEYSTORE_PASSWORD`
- Что Keystore был правильно закодирован в Base64

### Ошибка: "Cannot find Android SDK"

✅ Решение:
- GitHub Actions использует `android-actions/setup-android@v2`
- Эта ошибка случается редко, попробуйте перезапустить workflow

### Ошибка: "Firebase config not found"

✅ Решение:
1. Проверьте что `config.js` в корне проекта
2. Убедитесь что он содержит Firebase credentials
3. Проверьте что файл скопирован в workflow

### Workflow не запускается

✅ Решение:
1. Проверьте что файл в `.github/workflows/android-build.yml`
2. Проверьте синтаксис YAML (отступы важны!)
3. Попробуйте ручной запуск через Actions → Run workflow

## Обновление APK

Когда вы обновляете код:

```bash
git add .
git commit -m "Update message feature"
git push origin main
```

GitHub Actions автоматически соберет новый APK, и вы сможете его скачать.

## Версионирование

Обновляйте версию в `package.json`:

```json
{
  "version": "1.0.1"  // Измените эту версию
}
```

И в workflow файле (если нужно):

```yaml
android-targetSdkVersion: "31"
```

## Требования для Google Play Store

- APK должна быть подписана (✅ делаем в workflow)
- Версия должна увеличиваться (versionCode в config.xml)
- Иконка приложения (добавьте в корневую папку)
- Скриншоты и описание

## Команды для локальной сборки (если нужно)

```bash
# Вместо GitHub Actions можно собрать локально

# Установить Cordova
npm install -g cordova

# Создать проект
cordova create ZeroMessenger com.zeromessenger.app "Zero Messenger"
cd ZeroMessenger

# Добавить платформу
cordova platform add android

# Копировать файлы (в скрипте)
cp ../index.html www/
cp ../*.css www/
cp ../*.js www/

# Собрать
cordova build android --release
```

## Полезные ссылки

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Firebase Setup](https://firebase.google.com/docs/web/setup)
- [Cordova Documentation](https://cordova.apache.org/docs/en/latest/)
- [Android Development](https://developer.android.com/)
- [Google Play Console](https://play.google.com/console)

---

**Готово!** Теперь при каждом push GitHub Actions автоматически собирает и подписывает APK 🎉
