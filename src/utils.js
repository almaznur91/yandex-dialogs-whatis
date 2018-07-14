const Az = require('az');
// здесь мелкие обработки текста

const verbs = [
  'находится',
  'находятся',
  'растет',
  'лежит',
  'лежат',
  'стоит',
  'стоят',
  'висит',
  'висят',
  'налита',
  'налито',
  'будет',
  'будут',
  'было',
  'был',
  'была',
  'надо купить',
  'надо',
  'купить'
];
module.exports.verbs = verbs;
module.exports.rememberRegex = new RegExp('(.*) (' + verbs.join('|') + ') (.*)');

module.exports.initMorph = async () => {
  await new Promise(resolve => Az.Morph.init(resolve));
};

// разбивает строку на 3 части, с глаголом посередине
module.exports.splitByVerb = msg => {
  if (msg === '') return false;
  const words = msg.split(' ');
  const posts = getMsgPosts(msg);
  const countVerbs = posts.filter(post => post === 'VERB').length;

  // может быть только один глагол и только посередине
  if (countVerbs != 1) return false;
  const verbIndex = posts.indexOf('VERB');
  if (verbIndex === 0 || verbIndex == posts.length - 1) return false;

  return {
    question: words.slice(0, verbIndex).join(' '),
    answer: words.slice(verbIndex + 1).join(' '),
    verb: words[verbIndex]
  };
};

// возвращает массив частей речи фразы
const getMsgPosts = msg => {
  if (msg === '') return false;
  const words = msg.split(' ');

  // части речи
  const posts = words.map(word => {
    const morph = Az.Morph(word);
    return morph[0].tag.POST.replace('INFN', 'VERB') // инфинитив
      .replace('PRTS', 'VERB'); // причастие
    // .replace('PRED', 'VERB') // предикатив (надо)
  });
  return posts;
};

// находит глагол в команде
module.exports.getVerb = message => {
  return (
    verbs.find(verb => {
      const reg = new RegExp(`${verb} `);
      return message.match(reg);
    }) || false
  );
};

// убирает глагол из начала в вопросе
const cleanVerb = msg => {
  const words = msg.split(' ');
  const posts = getMsgPosts(msg);
  if (!posts) return msg;
  return words
    .filter((word, index) => {
      return posts[index] !== 'VERB';
    })
    .join(' ');
};

// убирает глагол из начала в вопросе
// const cleanVerb = msg => {
//   verbs.forEach(verb => {
//     msg = msg.replace(new RegExp(`^${verb} `), '');
//     msg = msg.replace(new RegExp(` ${verb}$`), '');
//   });
//   return msg;
// };
// module.exports.cleanVerb = cleanVerb;

// убирает лишнее в вопросе
module.exports.cleanQuestion = message => {
  let msg = message.replace(/^(что|кто|в чем) /, '').replace(/^(где|когда) /, '');
  return cleanVerb(msg);
};