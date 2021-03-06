// простое связывание разных Алис по одноразовому коду
const storage = require('../../storage');

const getUserIdByCode = (ctx, code) => {
  if (!ctx.user.shared.codes) return;
  // delete expired
  ctx.user.shared.codes = ctx.user.shared.codes.filter(item => item.expire > new Date().getTime());

  const result = ctx.user.shared.codes.find(item => item.code == code);
  return result;
};

module.exports = {
  intent: 'authCode',
  matcher: ctx => {
    const code = ctx.message.replace(/ /g, '').match(/[0-9]{6}/);
    return code ? 1 : 0;
  },

  async handler(ctx) {
    const code = ctx.message.replace(/ /g, '').match(/[0-9]{6}/);
    const item = getUserIdByCode(ctx, code);
    if (item) {
      if (!ctx.user.shared.auth) ctx.user.shared.auth = {};
      ctx.user.shared.auth[ctx.userId] = item.userId;
      await storage.setShared(ctx.userData, ctx.user.shared);

      if (item.userId == ctx.userId) {
        return ctx.reply([
          'У вас получилось привязать устройство к самому себе.',
          'Теперь получите код на одном устройстве, а передайте его в другое.'
        ]);
      }

      return ctx.reply([
        'Теперь вы связаны с другим устройством, теперь вы используете общие данные.',
        'Чтобы разорвать связь, скажите "отменить авторизацию" или привяжите устройство к самому себе.'
      ]);
    } else {
      return ctx.reply('Код не найден');
    }
  }
};
