class LikeDislikeCommentUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner } = useCasePayload;
    await this._threadRepository.isThreadExist(threadId);
    await this._commentRepository.isCommentExist(commentId);

    const isLikeExist = await this._likeRepository.isLikeCommentExist(
      commentId,
      owner,
    );

    if (isLikeExist) {
      await this._likeRepository.unlikeComment(commentId, owner);
    } else {
      await this._likeRepository.likeComment(commentId, owner);
    }
  }
}

module.exports = LikeDislikeCommentUseCase;
