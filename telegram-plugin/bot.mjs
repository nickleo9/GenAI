import TelegramBot from 'node-telegram-bot-api';
import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..');

// --- Configuration ---
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error('Error: TELEGRAM_BOT_TOKEN environment variable is required.');
  console.error('Get a token from @BotFather on Telegram.');
  process.exit(1);
}

// --- Quiz databases ---
const QUIZ_DATABASES = {
  'generative-ai': { file: 'generative_ai_exam.json', name: '資策會生成式AI認證', icon: '🤖' },
  'ai-basis':      { file: 'daily_answers_basis.json', name: '人工智慧基礎概論', icon: '📚' },
  'ai-application': { file: 'daily_answers_apply.json', name: '生成式AI應用與規劃', icon: '💡' },
  'ipas':          { file: 'ipas_exam.json', name: 'iPAS AI應用規劃師', icon: '📝' },
};

const quizData = {};

async function loadQuizData() {
  for (const [key, db] of Object.entries(QUIZ_DATABASES)) {
    try {
      const raw = await readFile(join(DATA_DIR, db.file), 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        quizData[key] = data;
        console.log(`✅ Loaded ${db.name}: ${data.length} questions`);
      }
    } catch (err) {
      console.warn(`⚠️ Failed to load ${db.name}: ${err.message}`);
      quizData[key] = [];
    }
  }
}

// --- Session management ---
const sessions = new Map();

function getSession(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, {
      currentQuiz: null,
      questions: [],
      currentIndex: 0,
      score: 0,
      answered: false,
    });
  }
  return sessions.get(chatId);
}

// --- Helpers ---
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function escapeMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

// --- Bot setup ---
const bot = new TelegramBot(TOKEN, { polling: true });
console.log('🚀 Telegram bot starting...');

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  sessions.delete(chatId);

  bot.sendMessage(chatId,
    `👋 歡迎使用 *GenAI 題庫練習機器人*！\n\n` +
    `這裡可以幫助你準備 AI 認證考試。\n\n` +
    `📋 *可用指令：*\n` +
    `/quiz \\- 選擇題庫開始練習\n` +
    `/random \\- 隨機一題快速練習\n` +
    `/stats \\- 查看本次練習統計\n` +
    `/stop \\- 停止當前練習\n` +
    `/help \\- 顯示幫助訊息`,
    { parse_mode: 'MarkdownV2' }
  );
});

// /help command
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `📖 *使用說明*\n\n` +
    `1\\. 使用 /quiz 選擇一個題庫\n` +
    `2\\. 選擇練習題數（5、10 或 20 題）\n` +
    `3\\. 點擊選項按鈕作答\n` +
    `4\\. 每題作答後會顯示正確答案與解析\n` +
    `5\\. 完成所有題目後顯示成績統計\n\n` +
    `💡 使用 /random 可以快速練習隨機一題`,
    { parse_mode: 'MarkdownV2' }
  );
});

// /quiz command - show quiz selection
bot.onText(/\/quiz/, (msg) => {
  const chatId = msg.chat.id;
  const availableQuizzes = Object.entries(QUIZ_DATABASES)
    .filter(([key]) => quizData[key] && quizData[key].length > 0);

  if (availableQuizzes.length === 0) {
    bot.sendMessage(chatId, '❌ 目前沒有可用的題庫，請稍後再試。');
    return;
  }

  const keyboard = availableQuizzes.map(([key, db]) => ([{
    text: `${db.icon} ${db.name} (${quizData[key].length}題)`,
    callback_data: `select_quiz:${key}`,
  }]));

  bot.sendMessage(chatId, '📋 請選擇題庫：', {
    reply_markup: { inline_keyboard: keyboard },
  });
});

// /random command - one random question from any quiz
bot.onText(/\/random/, (msg) => {
  const chatId = msg.chat.id;
  const allQuestions = Object.values(quizData).flat();
  if (allQuestions.length === 0) {
    bot.sendMessage(chatId, '❌ 目前沒有可用的題目。');
    return;
  }

  const session = getSession(chatId);
  const q = allQuestions[Math.floor(Math.random() * allQuestions.length)];
  session.questions = [q];
  session.currentIndex = 0;
  session.score = 0;
  session.currentQuiz = 'random';
  session.answered = false;
  sendQuestion(chatId, session);
});

// /stats command
bot.onText(/\/stats/, (msg) => {
  const chatId = msg.chat.id;
  const session = getSession(chatId);

  if (!session.currentQuiz) {
    bot.sendMessage(chatId, '📊 目前沒有進行中的練習。使用 /quiz 開始練習！');
    return;
  }

  const total = session.questions.length;
  const answered = session.currentIndex + (session.answered ? 1 : 0);
  const pct = answered > 0 ? Math.round((session.score / answered) * 100) : 0;

  bot.sendMessage(chatId,
    `📊 *練習統計*\n\n` +
    `題庫：${escapeMarkdown(session.currentQuiz)}\n` +
    `進度：${answered} / ${total} 題\n` +
    `正確：${session.score} 題\n` +
    `正確率：${pct}%`,
    { parse_mode: 'MarkdownV2' }
  );
});

// /stop command
bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  const session = getSession(chatId);

  if (!session.currentQuiz) {
    bot.sendMessage(chatId, '目前沒有進行中的練習。');
    return;
  }

  showFinalResult(chatId, session);
  sessions.delete(chatId);
});

// --- Callback query handler ---
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  bot.answerCallbackQuery(query.id);

  // Quiz selection
  if (data.startsWith('select_quiz:')) {
    const quizKey = data.replace('select_quiz:', '');
    handleQuizSelection(chatId, quizKey);
    return;
  }

  // Question count selection
  if (data.startsWith('count:')) {
    const parts = data.split(':');
    const quizKey = parts[1];
    const count = parseInt(parts[2], 10);
    startQuiz(chatId, quizKey, count);
    return;
  }

  // Answer selection
  if (data.startsWith('answer:')) {
    const answerIndex = parseInt(data.replace('answer:', ''), 10);
    handleAnswer(chatId, answerIndex);
    return;
  }

  // Next question
  if (data === 'next') {
    handleNext(chatId);
    return;
  }
});

// --- Quiz flow ---
function handleQuizSelection(chatId, quizKey) {
  const questions = quizData[quizKey];
  if (!questions || questions.length === 0) {
    bot.sendMessage(chatId, '❌ 此題庫沒有可用的題目。');
    return;
  }

  const db = QUIZ_DATABASES[quizKey];
  const counts = [5, 10, 20].filter(c => c <= questions.length);
  if (questions.length > 20) counts.push(questions.length);

  const keyboard = counts.map(c => ({
    text: c === questions.length ? `全部 ${c} 題` : `${c} 題`,
    callback_data: `count:${quizKey}:${c}`,
  }));

  bot.sendMessage(chatId,
    `${db.icon} *${escapeMarkdown(db.name)}*\n共 ${questions.length} 題\n\n請選擇練習題數：`,
    {
      parse_mode: 'MarkdownV2',
      reply_markup: { inline_keyboard: [keyboard] },
    }
  );
}

function startQuiz(chatId, quizKey, count) {
  const session = getSession(chatId);
  const db = QUIZ_DATABASES[quizKey];

  session.currentQuiz = db.name;
  session.questions = shuffleArray(quizData[quizKey]).slice(0, count);
  session.currentIndex = 0;
  session.score = 0;
  session.answered = false;

  bot.sendMessage(chatId,
    `🎯 開始練習 *${escapeMarkdown(db.name)}*\n共 ${count} 題，加油！`,
    { parse_mode: 'MarkdownV2' }
  );

  setTimeout(() => sendQuestion(chatId, session), 500);
}

function sendQuestion(chatId, session) {
  const q = session.questions[session.currentIndex];
  const total = session.questions.length;
  const num = session.currentIndex + 1;

  let text = `📝 *第 ${num} \\/ ${total} 題*\n\n`;
  if (q.topic) text += `📂 ${escapeMarkdown(q.topic)}\n\n`;
  text += escapeMarkdown(q.question) + '\n\n';

  const options = q.options || [];
  options.forEach((opt, i) => {
    text += `*${LETTERS[i]}\\.* ${escapeMarkdown(opt)}\n\n`;
  });

  const keyboard = options.map((_, i) => ({
    text: LETTERS[i],
    callback_data: `answer:${i}`,
  }));

  bot.sendMessage(chatId, text, {
    parse_mode: 'MarkdownV2',
    reply_markup: {
      inline_keyboard: [keyboard],
    },
  });
}

function handleAnswer(chatId, answerIndex) {
  const session = getSession(chatId);

  if (!session.currentQuiz || session.answered) return;

  session.answered = true;
  const q = session.questions[session.currentIndex];
  const correctIndex = q.correct_answer_index ?? LETTERS.indexOf(q.correct_answer_letter);
  const isCorrect = answerIndex === correctIndex;

  if (isCorrect) session.score++;

  const correctLetter = LETTERS[correctIndex];
  let response = isCorrect
    ? `✅ *正確！* 答案是 *${correctLetter}*`
    : `❌ *錯誤* \\- 你選了 *${LETTERS[answerIndex]}*，正確答案是 *${correctLetter}*`;

  if (q.explanation) {
    response += `\n\n💡 *解析：*\n${escapeMarkdown(q.explanation)}`;
  }

  const isLast = session.currentIndex >= session.questions.length - 1;
  const keyboard = [[{
    text: isLast ? '📊 查看成績' : '➡️ 下一題',
    callback_data: 'next',
  }]];

  bot.sendMessage(chatId, response, {
    parse_mode: 'MarkdownV2',
    reply_markup: { inline_keyboard: keyboard },
  });
}

function handleNext(chatId) {
  const session = getSession(chatId);
  if (!session.currentQuiz) return;

  session.currentIndex++;
  session.answered = false;

  if (session.currentIndex >= session.questions.length) {
    showFinalResult(chatId, session);
    sessions.delete(chatId);
    return;
  }

  sendQuestion(chatId, session);
}

function showFinalResult(chatId, session) {
  const total = Math.min(session.currentIndex + 1, session.questions.length);
  const answered = session.currentIndex >= session.questions.length
    ? session.questions.length
    : session.currentIndex + (session.answered ? 1 : 0);
  const pct = answered > 0 ? Math.round((session.score / answered) * 100) : 0;

  let grade;
  if (pct >= 90) grade = '🏆 優秀！';
  else if (pct >= 70) grade = '✅ 及格！繼續加油！';
  else if (pct >= 50) grade = '📖 再多練習一些吧！';
  else grade = '💪 需要多加努力！';

  bot.sendMessage(chatId,
    `🎉 *練習完成！*\n\n` +
    `📋 題庫：${escapeMarkdown(session.currentQuiz)}\n` +
    `✏️ 作答：${answered} 題\n` +
    `✅ 正確：${session.score} 題\n` +
    `📊 正確率：${pct}%\n\n` +
    `${grade}\n\n` +
    `使用 /quiz 再次練習`,
    { parse_mode: 'MarkdownV2' }
  );
}

// --- Start ---
await loadQuizData();
console.log('✅ Bot is running. Press Ctrl+C to stop.');
