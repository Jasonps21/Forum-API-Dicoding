const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyCommentUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newReply = new NewReply(useCasePayload);

    await this._threadRepository.isThreadExist(newReply.threadId);
    await this._commentRepository.isCommentExist(newReply.commentId);

    return this._replyRepository.addReply(newReply);
  }
}

module.exports = AddReplyCommentUseCase;
