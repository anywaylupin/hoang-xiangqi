// Cấu hình bàn cờ
const config = {
  draggable: true,
  position: 'start',
  onDragStart,
  onDrop,
  onMouseoverSquare,
  onMouseoutSquare,
  onSnapEnd
};

let lastPiece = null;
const game = new Xiangqi();
const board = Xiangqiboard('myBoard', config);

// Truy xuất các phần tử DOM
const $turn = $('#turn');
const $turnImg = $('#turn-img')[0];
const $historyTableBody = $('#history-table tbody');
const $reset = $('#btn-reset');
const $undo = $('#btn-undo');

// Tên quân cờ đầy đủ
const pieceNames = {
  rK: 'Tướng',
  rA: 'Sĩ',
  rB: 'Tượng',
  rN: 'Mã',
  rR: 'Xe',
  rC: 'Pháo',
  rP: 'Tốt',
  bK: 'Tướng',
  bA: 'Sĩ',
  bB: 'Tượng',
  bN: 'Mã',
  bR: 'Xe',
  bC: 'Pháo',
  bP: 'Tốt'
};

// Xử lý nút Reset
$reset.on('click', () => {
  game.reset();
  board.start();
  update();
});

// Xử lý nút Undo
$undo.on('click', () => {
  const lastMove = game.undo();
  if (lastMove) {
    board.position(game.fen());
    update();
  }
});

// Xóa các ô được tô sáng
function removeHighlights() {
  $('#myBoard .square-2b8ce').removeClass('highlight');
}

// Tô sáng ô
function highlightSquare(square) {
  $('#myBoard .square-' + square).addClass('highlight');
}

// Khi bắt đầu kéo quân cờ
function onDragStart(source, piece) {
  if (game.game_over()) return false;

  lastPiece = piece;

  const turn = game.turn();
  const isWrongTurn = (turn === 'r' && piece.startsWith('b')) || (turn === 'b' && piece.startsWith('r'));

  return !isWrongTurn;
}

// Khi thả quân cờ
function onDrop(source, target) {
  removeHighlights();

  const move = game.move({ from: source, to: target });
  if (!move) return 'snapback';

  update();
}

// Khi rê chuột qua quân cờ
function onMouseoverSquare(square) {
  const moves = game.moves({ square, verbose: true });
  if (!moves.length) return;

  highlightSquare(square);
  moves.forEach(({ to }) => highlightSquare(to));
}

// Khi rời chuột khỏi ô
function onMouseoutSquare() {
  removeHighlights();
}

// Khi quân cờ về vị trí mới
function onSnapEnd() {
  board.position(game.fen());
}

// Cập nhật trạng thái lượt chơi
function updateStatus() {
  const turn = game.turn(); // 'r' hoặc 'b'
  const isRedTurn = turn === 'r';
  const moveColor = isRedTurn ? 'Đỏ' : 'Đen';
  let colorClass = isRedTurn ? 'red' : 'black';

  let statusText = '';

  // ⚠️ Kiểm tra trạng thái kết thúc ván bằng switch
  switch (true) {
    case game.in_checkmate():
      colorClass = isRedTurn ? 'black' : 'red';
      statusText = `Chiếu hết! Bên ${isRedTurn ? 'Đen' : 'Đỏ'} thắng!`;
      break;
    case game.in_stalemate():
      colorClass = '';
      statusText = 'Hết nước đi. Hòa cờ!';
      break;
    case game.in_draw():
      colorClass = '';
      statusText = 'Ván cờ hòa!';
      break;
    case game.in_threefold_repetition():
      colorClass = '';
      statusText = 'Hòa do lặp lại nước đi 3 lần!';
      break;
    case game.in_check():
      statusText = `Bên ${moveColor} đang bị chiếu!`;
      break;
    default:
      statusText = `Bên ${moveColor}`;
  }

  $turn.text(statusText);
  $turn.removeClass('red black');
  if (colorClass) $turn.addClass(colorClass);

  $turnImg.src = `img/xiangqipieces/wikimedia/${turn}K.svg`;
  $turnImg.alt = moveColor;
}

// Cập nhật bảng lịch sử
function updateHistory() {
  const history = game.history({ verbose: true });
  const totalTurns = Math.ceil(history.length / 2);

  $historyTableBody.empty();

  for (let i = 0; i < totalTurns; i++) {
    const redMove = history[i * 2];
    const blackMove = history[i * 2 + 1];

    const redStr = redMove
      ? `${pieceNames[redMove.color + redMove.piece.toUpperCase()] || ''} ${redMove.from} → ${redMove.to}`
      : '';
    const blackStr = blackMove
      ? `${pieceNames[blackMove.color + blackMove.piece.toUpperCase()] || ''} ${blackMove.from} → ${blackMove.to}`
      : '';

    $historyTableBody.append(`<tr><td>${i + 1}</td><td>${redStr}</td><td>${blackStr}</td></tr>`);
  }
}

// Khởi động ban đầu
function update() {
  updateStatus();
  updateHistory();
}

update();
