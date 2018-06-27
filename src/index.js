const Alice = require('yandex-dialogs-sdk');
const Scene = require('yandex-dialogs-sdk').Scene;
const alice = new Alice();
const loki = require('lokijs');
const Fuse = require('fuse.js');

const PORT = process.env.BASE_URL || 3002;
const DB_PATH = 'data/loki.db';

const STAGE_IDLE = 'STAGE_IDLE';
const STAGE_WAIT_FOR_ANSWER = 'STAGE_WAIT_FOR_ANSWER';

const yandexDialogsWhatis = {
  stage: STAGE_IDLE,
  question: '',
  answer: '',
  lastAddedItem: {},
  db: {},

  initDb(name) {
    return new Promise((resolv, reject) => {
      let db = new loki(name, {
        autoload: true,
        autoloadCallback: () => resolv(db),
        autosave: true,
        autosaveInterval: 4000
      });
    });
  },

  async run() {
    this.db = await this.initDb(DB_PATH);

    alice.command('/^что /', ctx => {
      console.log('> question: ', ctx.messsage);
      this.getUserData(ctx, (ctx, userData) => {
        this.processQuestion(ctx, userData);
      });
    });

    const inAnswer = new Scene('in-answer');
    inAnswer.enter('запомни', ctx => {
      console.log('> answer begin: ', ctx.messsage);
      this.getUserData(ctx, (ctx, userData) => {
        let reply = this.processAnswer(ctx, userData);
        return ctx.reply(reply);
      });
    });
    inAnswer.leave('отмена', ctx => {
      console.log('> answer cancel: ', ctx.messsage);
      this.stage = STAGE_IDLE;
      this.question = '';
      this.answer = '';
      ctx.reply('Всё отменено');
    });
    inAnswer.any(ctx => {
      console.log('> answer end: ', ctx.messsage);
      this.getUserData(ctx, (ctx, userData) => {
        let reply = this.processAnswer(ctx, userData);
        if(this.stage == STAGE_IDLE){
          inAnswer._handleLeaveScene();
        }
        return ctx.reply(reply);
      });
    });
    alice.registerScene(inAnswer);

    /* alice.command('запомни ${question} находится ${answer}', ctx => {
      console.log('> full answer: ', ctx.messsage);
      console.log(ctx);
      this.getUserData(ctx, (ctx, userData) => {
        const { question, answer } = ctx.body;
        this.stage = STAGE_IDLE;
        this.storeAnswer(userData, question, answer);
        return ctx.reply(question + ' находится ' + answer + ', поняла');
      });
    }); */

    alice.command(['/^демо данные$/'], ctx => {
      console.log('> demo data');
      this.getUserData(ctx, (ctx, userData) => {
        this.fillDemoData(userData);
        ctx.reply('Данные сброшены на демонстрационные');
      });
    });

    alice.command(['отмена'], ctx => {
      console.log('> cancel');
      this.stage = STAGE_IDLE;
      this.question = '';
      this.answer = '';
      ctx.reply('Всё отменено');
    });

    alice.command(['удалить'], ctx => {
      console.log('> remove');
      this.stage = STAGE_IDLE;
      this.question = '';
      this.answer = '';
      this.deleteItem(ctx, this.lastAddedItem);
      return ctx.reply('Удален ответ: ' + this.lastAddedItem.questions.join(', '));
    });

    alice.any(ctx => {
      console.log('> default');
      this.getUserData(ctx, (ctx, userData) => {
        return this.processHelp(ctx, userData);
      });
    });

    /*
    https://github.com/fletcherist/yandex-dialogs-sdk/issues/8
    alice.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    }); */

    alice.listen('/', PORT);
    console.log('listen ' + PORT);
  },

  getUserData(ctx, callback) {
    let userId = ctx.userId;
    if (!userId) {
      ctx.reply('Не указан идентификатор пользователя');
    }

    let userData = this.db.getCollection(userId);
    if (userData === null) {
      userData = this.db.addCollection(userId);
    }
    return callback(ctx, userData);
  },

  fillDemoData(userData) {
    userData.clear();
    userData.insert({
      questions: ['в желто-зеленом'],
      answer: 'дыня'
    });
    userData.insert({
      questions: ['в синем', 'в голубом'],
      answer: 'возможно арбуз'
    });
    userData.insert({
      questions: ['в большом синем', 'в большом голубом'],
      answer: 'персик'
    });
    userData.insert({
      questions: ['в черном'],
      answer: 'грейпфрут'
    });
    userData.insert({
      questions: ['в большом черном'],
      answer: 'возможно персик'
    });
    userData.insert({
      questions: ['в красном'],
      answer: 'новый арбуз'
    });
    userData.insert({
      questions: ['в большом красном'],
      answer: 'гранат'
    });
    userData.insert({
      questions: ['в белом'],
      answer: 'классический арбуз'
    });
    userData.insert({
      questions: ['в арахисе'],
      answer: 'крем-сода'
    });
    userData.insert({
      questions: ['в среднем'],
      answer: 'бабл-гам'
    });
  },

  processHelp(ctx, userData) {
    const replyMessage = ctx.replyBuilder;
    const helpText = [
      'Я умею запоминать, что где лежит и напоминать об этом.',
      'Начните фразу со "что", чтобы получить ответ. Например: "что в синем".',
      'Начните фразу с "запомни", чтобы добавить новый ответ, например: "запомни: в синем".'
    ];

    questions = userData.data.map(item => item.questions[0]);
    questions = questions.map(question => {
      const btn = ctx.buttonBuilder.text('что ' + question);
      replyMessage.addButton({ ...btn.get() });
    });

    if (questions.length > 0) {
      helpText.push('У меня есть информация об этих объектах:');
    }
    replyMessage.text(helpText.join('\n'));
    console.log('reply message: ', replyMessage.get());
    ctx.reply(replyMessage.get());
  },

  processQuestion(ctx, userData) {
    const q = ctx.messsage.replace(/^что /, '');
    const data = userData.data;

    let fuse = new Fuse(data, {
      includeScore: true,
      keys: [
        {
          name: 'questions',
          weight: 0.7
        },
        {
          name: 'answer',
          weight: 0.1
        }
      ]
    });
    let answers = fuse.search(q);
    if (answers.length > 0) {
      const bestScore = answers[0].score;
      const scoreThreshold = 2;
      answers = answers.map(answer => {
        return {
          ...answer.item,
          ...{
            score: answer.score,
            minor: answer.score / bestScore > scoreThreshold
          }
        };
      });

      let msg = answers[0].answer;
      if (answers.filter(answer => !answer.minor).length > 1) {
        msg += ', но это неточно';
      }

      console.log('answer: ', msg);
      ctx.reply(msg);
    } else {
      ctx.reply('Я не понимаю');
    }
  },

  processAnswer(ctx, userData) {
    const q = ctx.messsage.replace(/^запомни/, '').trim();
    const data = userData.data;
    const replyMessage = ctx.replyBuilder;

    if (this.stage == STAGE_IDLE) {
      this.question = q;
      this.answer = "";

      if(this.question != ''){
        replyMessage.text('Что находится ' + this.question + '?');
        this.stage = STAGE_WAIT_FOR_ANSWER;
      } else {
        replyMessage.text('Что запомнить?');
      }
    } else if (this.stage == STAGE_WAIT_FOR_ANSWER) {
      this.answer = q;
      this.lastAddedItem = {
        questions: [this.question],
        answer: this.answer
      };

      this.stage = STAGE_IDLE;
      this.storeAnswer(userData, this.question, this.answer);

      replyMessage.text(this.question + ' находится ' + this.answer + ', поняла');
    }

    return replyMessage.get();
  },

  storeAnswer(userData, question, answer){
    userData.insert({
      questions: [this.question],
      answer: this.answer
    });
  },

  deleteItem(ctx, answer, userData) {
    console.log('deleteItem', ctx, userData);
  }
};

yandexDialogsWhatis.run();
