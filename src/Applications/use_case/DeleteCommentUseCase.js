const DeleteComment = require('../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const deleteComment = new DeleteComment(useCasePayload);

    await this._threadRepository.isThreadExist(deleteComment.threadId);
    await this._commentRepository.isCommentExist(deleteComment.id);
    await this._commentRepository.isCommentOwner(
      deleteComment.id,
      deleteComment.owner,
    );

    return this._commentRepository.deleteComment(deleteComment.id);
  }
}

module.exports = DeleteCommentUseCase;
