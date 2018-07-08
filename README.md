[![Build Status](https://travis-ci.org/popstas/yandex-dialogs-whatis.svg?branch=master)](https://travis-ci.org/popstas/yandex-dialogs-whatis)

# yandex-dialogs-whatis

Бот отвечает на вопросы и умеет записывать новые ответы.

У каждого пользователя собственная база вопросов и ответов.

По умолчанию запускается на *:2756

Команды:
- Начните фразу со "что", чтобы получить ответ. Например: "что на дворе"
- Начните фразу с "где", чтобы найти место, где это что-то лежит. Например: "где трава"
- Скажите "запомни", чтобы добавить новый ответ
- Можно быстро добавить новый ответ так: "запомни ... находится ..."
- Можно удалить последний ответ, сказав "удали последнее"
- Если надо удалить что-то другое, скажите, например, "удали на дворе"
- При тестовом запуске доступна команда "демо данные"

### AWS Lambda
- Создать/обновить лямбду: `npm run deploy`

У пользователя AWS должны быть права на cloudformation, AWSLambdaFullAccess, IAMFullAccess, AmazonAPIGatewayAdministrator (может можно меньше, но эти работают).

## Пожелания к SDK:
- возможность исключить навык из NODE_ENV=production
- мидлвари-матчеры в первом аргументе `alice.command()`
- легкий способ вывести многострочный текст с кнопками, simpleReply, https://github.com/popstas/yandex-dialogs-whatis/commit/8e6843652a7ea8cccb2d0a1fb62ed833103e5665
- мидварь "случайный ответ из списка", replyRandom, https://github.com/popstas/yandex-dialogs-whatis/commit/9c33c692bc02c6f6f20b61f10e03d195cb00f54a
- учитывать вес результатов fuse, чтобы не было ситуаций, когда выбрана команда со score 0.5, https://github.com/popstas/yandex-dialogs-whatis/commit/de596ffd00bebaa0d9a2879292e2e7deb99e54a0
