module.exports = {
  intent: 'helpAuthCode',
  matcher: [
    'авторизация',
    'привязать устройство',
    'войти',
    'вход',
    'вход по коду',
    'расскажи про код',
    'что за код'
  ],

  async handler(ctx) {
    const buttons = ['скажи код', 'создай пароль', 'сгенерируй пин код'];
    return ctx.reply(
      [
        'Чтобы связать два устройства, вам нужно на главном устройстве скомандовать: "скажи код".',
        'После этого у вас будет одна минута, чтобы запустить навык на другом устройстве и повторить код.',
        'После этого данные главного устройства будут использоваться там, где сказали код.',
        Math.random() > 0.5 ? 'Скажите "повтори", чтобы прослушать еще раз.' : ''
      ],
      buttons
    );
  }
};
