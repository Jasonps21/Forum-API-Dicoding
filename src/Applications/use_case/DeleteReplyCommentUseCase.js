const DeleteReply = require('../../Domains/replies/entities/DeleteReply');

class DeleteReplyCommentUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const deleteReply = new DeleteReply(useCasePayload);

    await this._threadRepository.isThreadExist(
      deleteReply.threadId,
    );

    await this._commentRepository.isCommentExist(
      deleteReply.commentId,
    );

    await this._replyRepository.isReplyExist(
      deleteReply.id,
    );

    await this._replyRepository.isReplyOwner(
      deleteReply.id,
      deleteReply.owner,
    );

    return this._replyRepository.deleteReply(deleteReply.id);
  }
}

module.exports = DeleteReplyCommentUseCase;
