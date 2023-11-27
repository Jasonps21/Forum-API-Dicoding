const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const Comment = require('../../Domains/comments/entities/Comment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, owner, threadId } = newComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, owner, threadId, false, new Date().toISOString()],
    };

    const { rows } = await this._pool.query(query);

    return new AddedComment(rows[0]);
  }

  async isCommentExist(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const { rowCount } = await this._pool.query(query);

    if (rowCount < 1) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
  }

  async isCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const { rows } = await this._pool.query(query);
    if (rows[0].owner !== owner) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses',
      );
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT a.id, a.content, a.date, a.is_delete, b.username
              FROM comments a INNER JOIN users b ON a.owner = b.id 
              WHERE a.thread_id = $1
              ORDER BY a.date`,
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);

    return rows.map(
      (row) => new Comment({
        ...row,
        isDelete: row.is_delete,
      }),
    );
  }
}

module.exports = CommentRepositoryPostgres;
