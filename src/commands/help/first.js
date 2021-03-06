module.exports = {
  intent: 'helpFirst',
  matcher: ['первая помощь', '1 помощь'],

  async handler(ctx) {
    const buttons = ['помощь', 'примеры', 'что ты знаешь', 'команды'];
    return ctx.reply(
      [
        'Скажите "запомни", чтобы добавить новый ответ.',
        'Можно быстро добавить новый ответ так: "запомни [что-то] находится [где-то]".',
        'Начните фразу со "что", чтобы получить ответ. Например: "что на дворе".',
        'Начните фразу с "где", чтобы найти место, где это что-то лежит. Например: "где трава".',
        'Можно удалить последний ответ, сказав "удали последнее".',
        'Если надо удалить что-то другое, скажите что, например, "удали на дворе".',
        'Чтобы всё стало понятно, посмотрите примеры использования, скажите "примеры".',
        'Если хотите узнать подробности команд, скажите "помощь".'
      ],
      buttons
    );
  }
};
