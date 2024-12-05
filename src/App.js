import { useState } from 'react';
import './App.css';

function Square({ value, onSquareClick }) {
  return (
    <button className={`square ${value}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, size }) {
  const handleClick = (i) => {
    if (calculateWinner(squares, size) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  };

  const winner = calculateWinner(squares, size);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  const rows = [];
  for (let row = 0; row < size; row++) {
    const rowSquares = [];
    for (let col = 0; col < size; col++) {
      rowSquares.push(
        <Square
          key={row * size + col}
          value={squares[row * size + col]}
          onSquareClick={() => handleClick(row * size + col)}
        />
      );
    }
    rows.push(
      <div key={row} className="board-row">
        {rowSquares}
      </div>
    );
  }

  return (
    <>
      <div className="status">{status}</div>
      {rows}
    </>
  );
}

export default function Game() {
  const size = 15;
  const [history, setHistory] = useState([Array(size * size).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [xWins, setXWins] = useState(0);  // X的胜利次数
  const [oWins, setOWins] = useState(0);  // O的胜利次数
  const [isGameOver, setIsGameOver] = useState(false);  // 游戏是否结束
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  const winnerData = calculateWinner(currentSquares, size);

  function handlePlay(nextSquares) {
    if (calculateWinner(nextSquares, size)) {
      setIsGameOver(true);
    }
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    setIsGameOver(false);  // 重置游戏结束状态
  }

  function resetGame() {
    setHistory([Array(size * size).fill(null)]);
    setCurrentMove(0);
    setIsGameOver(false);
  }

  function undoMove() {
    if (currentMove > 0) {
      setCurrentMove(currentMove - 1);
    }
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  // 更新得分
  if (winnerData && winnerData.winner === 'X') {
    setXWins(xWins + 1);
  } else if (winnerData && winnerData.winner === 'O') {
    setOWins(oWins + 1);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          size={size}
        />
      </div>
      <div className="game-info">
        <div>
          <strong>Player X Wins: </strong>{xWins}
        </div>
        <div>
          <strong>Player O Wins: </strong>{oWins}
        </div>
        <ol>{moves}</ol>
        <div>
          <button onClick={resetGame}>Restart Game</button>
          <button onClick={undoMove} disabled={currentMove === 0}>Undo Move</button>
        </div>
      </div>
    </div>
  );
}

// 计算胜利者
function calculateWinner(squares, size) {
  const directions = [
    [1, 0],  // 横向
    [0, 1],  // 纵向
    [1, 1],  // 斜向 /
    [1, -1], // 斜向 \
  ];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const current = squares[row * size + col];
      if (!current) continue;

      for (const [dx, dy] of directions) {
        let count = 1;

        for (let i = 1; i < 5; i++) {
          const newRow = row + dx * i;
          const newCol = col + dy * i;
          if (
            newRow >= 0 &&
            newRow < size &&
            newCol >= 0 &&
            newCol < size &&
            squares[newRow * size + newCol] === current
          ) {
            count++;
          } else {
            break;
          }
        }

        if (count === 5) {
          return current; // 返回胜利者
        }
      }
    }
  }
  return null;
}
