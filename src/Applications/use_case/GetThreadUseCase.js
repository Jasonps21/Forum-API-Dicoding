class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    await this._threadRepository.isThreadExist(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const commentsFromDB = await this._commentRepository.getCommentsByThreadId(
      threadId,
    );
    for await (const commentData of commentsFromDB) {
      const replies = await this._replyRepository.getReplyByCommentThreadId(
        commentData.id,
      );
      commentData.setReplies(replies);
    }
    thread.setComments(commentsFromDB);

    return thread;
  }
}

module.exports = GetThreadUseCase;
