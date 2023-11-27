class DeleteReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, threadId, owner, commentId,
    } = payload;

    this.id = id;
    this.threadId = threadId;
    this.owner = owner;
    this.commentId = commentId;
  }

  _verifyPayload({
    id, threadId, owner, commentId,
  }) {
    if (!id || !threadId || !owner || !commentId) {
      throw new Error('DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof threadId !== 'string' || typeof owner !== 'string' || typeof commentId !== 'string') {
      throw new Error('DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReply;
