const Comment = require('../../Domains/comments/entities/Comment');

class GetThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
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
      const likeCount = await this._likeRepository.getTotalLikeComment(
        commentData.id,
      );
      commentData.setReplies(replies);
      commentData.likeCount = likeCount;
    }
    thread.setComments(commentsFromDB);

    return thread;
  }
}

module.exports = GetThreadUseCase;
