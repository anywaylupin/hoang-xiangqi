let board = null;
const game = new Xiangqi();
const $status = $('#status');
const $historyTableBody = $('#history-table tbody');

function removeHighlights() {
  $('#myBoard .square-2b8ce').removeClass('highlight');
}

function highlightSquare(square) {
  $('#myBoard .square-' + square).addClass('highlight');
}

function onDragStart(source, piece) {
  if (game.game_over()) return false;

  const turn = game.turn();
  const isWrongTurn = (turn === 'r' && piece.startsWith('b')) || (turn === 'b' && piece.startsWith('r'));

  return !isWrongTurn;
}

function onDrop(source, target) {
  removeHighlights();

  const move = game.move({ from: source, to: target });
  if (!move) return 'snapback';

  updateStatus();
  updateHistory();
}

function onMouseoverSquare(square) {
  const moves = game.moves({ square, verbose: true });
  if (!moves.length) return;

  highlightSquare(square);
  moves.forEach(({ to }) => highlightSquare(to));
}

function onMouseoutSquare() {
  removeHighlights();
}

function onSnapEnd() {
  board.position(game.fen());
}

function updateStatus() {
  const moveColor = game.turn() === 'r' ? 'Red' : 'Black';
  $status.text(`${moveColor} turn`);
}

function updateHistory() {
  const history = game.history();
  const rows = [];

  for (let i = 0; i < history.length; i += 2) {
    const redMove = history[i] || '';
    const blackMove = history[i + 1] || '';
    rows.push(`<tr><td>${i / 2 + 1}</td><td>${redMove}</td><td>${blackMove}</td></tr>`);
  }

  $historyTableBody.html(rows.join(''));
}

const config = {
  draggable: true,
  position: 'start',
  onDragStart,
  onDrop,
  onMouseoverSquare,
  onMouseoutSquare,
  onSnapEnd
};

board = Xiangqiboard('myBoard', config);
updateStatus();
updateHistory();
