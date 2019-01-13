const help = require('../help');
const matchers = require('../../matchers');

// команда по умолчанию (справка)
module.exports = {
  intent: '',
  matcher: matchers.strings(['', 'привет', 'приветствие']),
  // matcher: ['привет', 'приветствие'], // TODO: заменить после выхода sdk 2.0.7

  async handler(ctx) {
    if (ctx.message != 'ping') ctx.logMessage(`> ${ctx.message} (welcome)`);
    let msg;
    const buttons = ['помощь', 'примеры', 'что ты знаешь', 'команды', 'что нового'];
    if (ctx.user.state.visitor.visits > 1 || ctx.user.state.visit.messages > 1) {
      msg =
        'Привет' +
        (ctx.user.state.visitor.lastVisitLong
          ? ', давно не виделись, спросите "что нового", чтобы узнать об обновлениях'
          : '');
      return ctx.reply(msg, buttons);
    } else {
      msg = [
        'Я умею запоминать что где лежит и напоминать об этом.',
        'Хотите ознакомиться с возможностями на примере?'
      ];
      return ctx.confirm(msg, help.tour.handler, help.first.handler);
    }
  }
};