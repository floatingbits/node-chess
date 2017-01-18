/**
	Games contain the history of a board and the board itself.

	At time of writing this, the game is also intended to store some
	degree of information regarding the opponents and keys that
	could be used for storage, etc.
*/

var
	piece = require('./piece.js'),
	board = require('./board.js');

// types
var Move = function (sq1, sq2, cp, n, h) {
	'use strict';

	this.capturedPiece = cp;
	this.hashCode = h;
	this.algebraic = n || undefined;
	this.promotion = false;
	this.piece = sq2.piece;
	this.prevFile = sq1.file;
	this.prevRank = sq1.rank;
	this.postFile = sq2.file;
	this.postRank = sq2.rank;
};

// event handlers
var addToHistory = function (g) {
	'use strict';

	return function (ev) {
		var
			hashCode = g.getHashCode(),
			m = new Move(
				ev.prevSquare,
				ev.postSquare,
				ev.capturedPiece,
				ev.algebraic,
				hashCode);

		g.moveHistory.push(m);
	};
};

var denotePromotionInHistory = function (g) {
	'use strict';

	return function () {
		var latest = g.moveHistory[g.moveHistory.length - 1];

		if (latest) {
			latest.promotion = true;
		}
	};
};

// ctor
var Game = function (b) {
	'use strict';

	this.board = b;
	this.moveHistory = [];
};

Game.prototype.getCurrentSide = function () {
	'use strict';

	return this.moveHistory.length % 2 === 0 ?
			piece.SideType.White :
			piece.SideType.Black;
};

Game.prototype.getHashCode = function () {
	'use strict';
	var
		i = 0,
		sum = '';

	for (i = 0; i < this.board.squares.length; i++) {
		if (this.board.squares[i].piece !== null) {
			sum += this.board.squares[i].file +
				this.board.squares[i].rank +
				(this.board.squares[i].piece.side === piece.SideType.White ? 'w' : 'b') +
				this.board.squares[i].piece.notation +
				(i < (this.board.squares.length - 1) ? '-' : '');
		}
	}

	// return unhashed string, since we don't want to use the crypto library in this fork.
    //Should do the job and the size should still be processable
	return sum;
};

// exports
module.exports = {
	// methods
	create : function () {
		'use strict';

		var
			b = board.create(),
			g = new Game(b);

		b.on('move', addToHistory(g));
		b.on('promote', denotePromotionInHistory(g));

		return g;
	},
	load : function (moveHistory) {
		'use strict';

		var
			b = board.create(),
			g = new Game(),
			i = 0;

		b.on('move', addToHistory(g));
		b.on('promote', denotePromotionInHistory(g));

		for (i = 0; i < moveHistory.length; i++) {
			b.move(b.getSquare(moveHistory[i].prevFile, moveHistory[i].prevRank),
				b.getSquare(moveHistory[i].postFile, moveHistory[i].postRank));
		}

		return g;
	}
};
