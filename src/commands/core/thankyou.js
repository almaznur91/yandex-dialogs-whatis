module.exports = {
  intent: 'thankyou',
  matcher: ['спс', 'все спасибо', 'спасибо', 'благодарю', 'спасибо умничка', 'спасибо тебе', 'спасибо большое'],

  handler(ctx) {
    ctx.chatbase.setAsFeedback();

    return ctx.replyRandom([
      'Всегда пожалуйста',
      'Не за что',
      'Обращайся!',
      'Пожалуйста',
      'Пожалуйста',
      'Пожалуйста',
      'Пожалуйста',
      'Пожалуйста'
    ], [
      {
        title: 'оценить навык',
        url: 'https://dialogs.yandex.ru/store/skills/00203e6e-vtoraya-pamya',
        hide: true
      }
    ]);
  }
};
