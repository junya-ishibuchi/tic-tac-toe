import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
  return (
    <button
      className={"square" + (props.isWinningSpace ? " win" : "")}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

  class Board extends React.Component {
    renderSquare(i) {
      return (
        <Square
          value={this.props.squares[i]}
          isWinningSpace={this.props.winnerLineNumbers && this.props.winnerLineNumbers.includes(i)}
          onClick={() => this.props.onClick(i)}
          key={i}
        />
      );
    }

    renderRows(row) {
      let rows = [];
      for (let col = 0; col < 3; col++) {
        rows.push(this.renderSquare(row * 3 + col));
      }
      return rows;
    }

    renderSquares() {
      let squares = [];
      for (let row = 0; row < 3; row++) {
        squares.push(<div className="board-row" key={row}>{this.renderRows(row)}</div>);
      }
      return squares;
    }

    render() {
      return <div>{this.renderSquares()}</div>;
    }
  }
  
  class Game extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        history: [{
          squares: Array(9).fill(null),
          checkedCol: null,
          checkedRow: null,
        }],
        stepNumber: 0,
        xIsNext: true,
        currentHistoryStep: null,
        isHistoryOrderByAsc: true,
      };
    }

    handleClick(i) {
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      if (calculateWinnerLineNumbers(squares) || squares[i]) {
        return;
      }
      squares[i] = this.state.xIsNext ? 'X' : 'O';
      this.setState({
        history: history.concat([{
          squares: squares,
          checkedCol: (i % 3) + 1,
          checkedRow: Math.ceil((i + 1) / 3),
        }]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
      });
    }

    jumpTo(step) {
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0,
        currentHistoryStep: step,
      });
    }

    render() {
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const winnerLineNumbers = calculateWinnerLineNumbers(current.squares);

      const moves = history.map((step, move) => {
        const desc = move ?
          'Go to move #' + move + ` (col: ${step.checkedCol}, row: ${step.checkedRow})`:
          'Go to game start';
          return (
            <li key={move}>
              <button onClick={() => this.jumpTo(move)}>
                {(move === this.state.currentHistoryStep) ? <b>{desc}</b> : desc}
              </button>
            </li>
          );
      });

      let status;
      if (winnerLineNumbers) {
        status = 'Winner: ' + current.squares[winnerLineNumbers[0]];
      } else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }

      return (
        <div className="game">
          <div className="game-board">
            <Board
              squares={current.squares}
              winnerLineNumbers={winnerLineNumbers}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <div>History Order by:
            <button
              onClick={() =>
                this.setState({ isHistoryOrderByAsc: !this.state.isHistoryOrderByAsc })
              }
            >
              {this.state.isHistoryOrderByAsc ? "Asc" : "Desc"}
            </button>
            </div>
            <ol>{this.state.isHistoryOrderByAsc ? moves : moves.reverse()}</ol>
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<Game />);
  
  function calculateWinnerLineNumbers(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return [a, b, c]
      }
    }
    return null;
  }