const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const Reply = require('../../Domains/replies/entities/Reply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const {
      content, owner, threadId, commentId,
    } = newReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner',
      values: [
        id,
        content,
        owner,
        threadId,
        commentId,
        false,
        new Date().toISOString(),
      ],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async isReplyExist(replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount < 1) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }
  }

  async isReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses',
      );
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async getReplyByCommentThreadId(commentId) {
    const query = {
      text: `SELECT 
                replies.id,
                replies.content,
                replies.date,
                replies.is_delete,
                users.username
              FROM replies 
              INNER JOIN users ON replies.owner = users.id 
              WHERE replies.comment_id = $1
              ORDER BY replies.date`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows.map(
      (row) => new Reply({ ...row, isDelete: row.is_delete }),
    );
  }
}

module.exports = ReplyRepositoryPostgres;
