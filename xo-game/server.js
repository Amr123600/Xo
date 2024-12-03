const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// لتخزين حالة اللعبة
let gameState = {
  board: ['', '', '', '', '', '', '', '', ''], // حالة اللوحة
  currentPlayer: 'player1', // اللاعب الذي يملك الدور
  player1: null, // اسم اللاعب 1
  player2: null, // اسم اللاعب 2
  symbol1: 'X', // رمز اللاعب 1
  symbol2: 'O', // رمز اللاعب 2
};

// إعداد مجلد للملفات الثابتة (مثل HTML و CSS و JS)
app.use(express.static('public'));

// استماع للاتصال عبر Socket.io
io.on('connection', (socket) => {
  console.log('مستخدم متصل:', socket.id);

  // إرسال حالة اللعبة الحالية
  socket.emit('gameState', gameState);

  // استلام أسماء اللاعبين والرموز
  socket.on('startGame', (playerData) => {
    if (!gameState.player1) {
      gameState.player1 = playerData.name;
      gameState.symbol1 = playerData.symbol;
      socket.emit('playerAssigned', { symbol: gameState.symbol1 });
    } else if (!gameState.player2) {
      gameState.player2 = playerData.name;
      gameState.symbol2 = playerData.symbol;
      socket.emit('playerAssigned', { symbol: gameState.symbol2 });
    }

    // بمجرد أن يتصل اللاعب الثاني، تبدأ اللعبة
    if (gameState.player1 && gameState.player2) {
      io.emit('gameStart', { message: 'اللاعب 1: ' + gameState.player1 + ' ضد اللاعب 2: ' + gameState.player2 });
    }
  });

  // استلام الحركة من اللاعبين
  socket.on('makeMove', (index) => {
    if (gameState.board[index] === '') {
      gameState.board[index] = gameState.currentPlayer === 'player1' ? gameState.symbol1 : gameState.symbol2;
      // تغيير الدور
      gameState.currentPlayer = gameState.currentPlayer === 'player1' ? 'player2' : 'player1';
      io.emit('gameState', gameState);

      // تحقق من الفائز
      checkWinner();
    }
  });

  // إعادة ضبط اللعبة
  socket.on('restartGame', () => {
    gameState.board = ['', '', '', '', '', '', '', '', ''];
    gameState.currentPlayer = 'player1';
    io.emit('gameState', gameState);
  });

  // تحقق من الفائز
  function checkWinner() {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // صفوف
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // أعمدة
      [0, 4, 8], [2, 4, 6],            // الأقطار
    ];

    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (gameState.board[a] && gameState.board[a] === gameState.board[b] && gameState.board[a] === gameState.board[c]) {
        io.emit('gameOver', { winner: gameState.board[a] });
        return;
      }
    }

    // تحقق من التعادل
    if (!gameState.board.includes('')) {
      io.emit('gameOver', { winner: 'tie' });
    }
  }
});

// تشغيل السيرفر
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`السيرفر يعمل على المنفذ ${port}`);
});
