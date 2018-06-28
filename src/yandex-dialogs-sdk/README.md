# yandex-dialogs-sdk
[![npm version](https://badge.fury.io/js/yandex-dialogs-sdk.svg)](https://badge.fury.io/js/yandex-dialogs-sdk)

Создавать навыки для Алисы — это очень просто.

<img height=300 src='https://camo.githubusercontent.com/0ad462b08ffb18f96ae1143f1365b60b918f4bbd/68747470733a2f2f73657470686f6e652e72752f77702d636f6e74656e742f75706c6f6164732f323031372f30372f616c6973612d383130783435362e706e67' />

### Установите SDK
`npm i yandex-dialogs-sdk`

`yarn add yandex-dialogs-sdk`

### Создайте своё первое приложение

```javascript
const Alice = require('yandex-dialogs-sdk')
const alice = new Alice()

alice.command('дай совет', async (ctx) => {
  return ctx.reply('Make const not var')
})

alice.command(['билет в кино', 'что посмотреть', 'что показывают'], ctx => {
  return ctx.reply('') 
})

alice.command(/(https?:\/\/[^\s]+)/g, ctx => ctx.reply('Matched a link!'))

alice.any(async (ctx) => {
  return ctx.reply('О чём это вы?')
})

alice.listen('/', 80)

```

> Можно использовать как постоянно работающий сервер, так и serverless-платформы, такие как **AWS Lambda** или **Google Cloud Functions**. *Смотрите папку `/examples`*

### Программируйте сложную логику

```javascript
const Scene = require('yandex-dialogs-sdk').Scene

const inBar = new Scene('in-the-bar')
inBar.enter('Алиса, пойдём в бар!', ctx => ctx.reply('Пойдём.'))
inBar.command('ты сейчас в баре?', ctx => ctx.reply('Да!'))
inBar.leave('Пошли отсюда', ctx => ctx.reply('Уже ухожу.'))

alice.registerScene(inBar)
alice.command('ты сейчас в баре?', ctx => ctx.reply('Нет!'))

```


### Больше не надо парсить ответы руками
```javascript
alice.command('забронируй встречу в ${where} на ${when}', ctx => {
  const { where, when } = ctx.body
  // where — '7-холмов'
  // when — '18:00'
  ctx.reply(`Готово. Встреча состоится в ${where}. Тебе напомнить?`)
})
alice.handleRequestBody(
  generateRequest('забронируй встречу в 7-холмов на 18:00')
)
```

> Больше примеров в папке **[./examples](https://github.com/fletcherist/yandex-dialogs-sdk/tree/master/examples)**



Создавайте сложные конструкции с кнопками и кастомизацией с помощью фабрик:


Создайте кнопку:
```javascript
const buyBtn = ctx.buttonBuilder
  .text('Купить слона')
  .url('example.com/buy')
  .payload({buy: "slon"})
  .shouldHide(true)
  .get()
```


Создайте ответ:
```javascript

alice.command('купить слона', async (ctx) => {
  const replyMessage = ctx.replyBuilder
    .text('Вы что, серьёзно?')
    .tts('Вы что, серьё+зно?')
    .addButton(buyBtn)
    .get()
  return ctx.reply(replyMessage)
})

```

# API

API очень простой и удобный.

# Ctx

Сущность для управления состоянием ответа. Есть следующие методы и свойства:

#### Свойства

* **ctx.message** — Полное сообщение от пользователя.
* **ctx.body** — объект с данными после парсина ([подробнее](https://github.com/fletcherist/yandex-dialogs-sdk/tree/master/examples/ctxBody.js))
* **ctx.sessionId** — ID сессии.
* **ctx.messageId** — ID сообщения.
* **ctx.userId** — ID пользователя.
* **ctx.payload** — Произвольный JSON, который присылается обработчику, если какая-то кнопка будет нажата.


#### Методы

* **ctx.replyBuilder** — фабрика для создания ответа на запрос. О ней — дальше.
* **ctx.buttonBuilder** — фабрика для создания кнопок. О ней — дальше.


# ReplyBuilder

Генерирует ответ для сервера, какой вы захотите.
Метод доступен из контекста. `ctx.replyBuilder`

### .text(str: string)
Устанавливает текстовое сообщение в ответе.
> Кстати, можно использовать эмодзи 👌

### .tts(str: string)
Устанавливает голосовое сообщение, которое произнесёт Алиса. 
> Доступна особая разметка: например - - паузы и +ударения.

### .addButton(button: buttonBuilder)
Добавляет к ответу кнопку. Кнопки добавляются по очереди:

```javascript
/* example */
ctx.replyBuilder.addButton(btn1).addButton(btn2)
```
```json
"response": {
  "buttons": ["<btn1>", "<btn2>"],
},
```

### .shouldEndSession(flag: boolean)
> Default — false


Признак конца разговора. Завершать ли сессию или продолжить.


### .get()
Получить результат выполнения фабрики. В конце всегда вызывайте этот метод.


**Пример**
```javascript
const replyMessage = ctx.replyBuilder
  .text('Вы что, из Англии?')
  .tts('Вы что, из Англии?')
  .addButton(btn1)
  .addButton(btn2)
  .get()
```
```json
{
  "response": {
    "buttons": ["<btn1>", "<btn2>"],
    "end_session": false,
    "text": "Вы что, из Англии?",
    "tts": "Вы что, из Англии?"
  },
  "session": {
     "some": "session..."
  },
  "version": "1.0"
}
```



# ButtonBuilder
Метод доступен из контекста. `ctx.buttonBuilder`

### .text(text: string)
Устанавливает текст кнопки.


### .title(title: string)
Тоже устанавливает текст кнопки.
> Используйте, какой больше нравится


### .url(url: string)
Устанавливает URL, который откроется при нажатии на кнопку.


### .url(url: string)
Устанавливает URL, который откроется при нажатии на кнопку.


### .shouldHide(flag: boolean)
Нужно ли прятать кнопку после следующей реплики пользователя?


### .payload(payload: string | object)
Произвольный JSON, который Яндекс.Диалоги должны отправить обработчику, если данная кнопка будет нажата. Максимум 4096 байтов.

### .get()
Получить результат выполнения фабрики. В конце всегда вызывайте этот метод.


**Пример**
```javascript
const buyBtn = ctx.buttonBuilder
  .text('Купить слона')
  .url('example.com/buy')
  .payload({buy: "slon"})
  .shouldHide(true)
  .get()
```


### Присылайте пулл-реквесты!
Давайте вместе сделаем библиотеку ещё удобнее для разработчиков.


Phil Romanov © MIT 2018
