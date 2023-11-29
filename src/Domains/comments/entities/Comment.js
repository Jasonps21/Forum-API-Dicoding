const Reply = require('../../replies/entities/Reply');

class Comment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, isDelete, likeCount,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = isDelete ? '**komentar telah dihapus**' : content;
    this.likeCount = likeCount;
    this.replies = [];
  }

  /**
   * note: no need to catch as ClientError, because this is internal error.
   */
  _verifyPayload({
    id, username, date, content, isDelete, likeCount,
  }) {
    if (!id || !username || !date || !content || isDelete === undefined || isDelete === null
      || likeCount === undefined) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof username !== 'string' || typeof date !== 'string' || typeof content !== 'string' || typeof isDelete !== 'boolean' || typeof likeCount !== 'number') {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  setReplies(replies) {
    const isReplyArray = Array.isArray(replies);

    if (!isReplyArray) {
      throw new Error('COMMENT.REPLY_NOT_ARRAY');
    }

    const isAnyInvalidReply = replies.some((reply) => !(reply instanceof Reply));

    if (isAnyInvalidReply) {
      throw new Error('COMMENT.REPLAIS_CONTAINS_INVALID_MEMBER');
    }

    this.replies = replies;
  }
}

module.exports = Comment;
