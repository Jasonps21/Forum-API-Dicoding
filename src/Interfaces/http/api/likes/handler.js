const LikeDislikeCommentUseCase = require('../../../../Applications/use_case/LikeDislikeCommentUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;
  }

  async putCommentLikeHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const useCase = this._container.getInstance(LikeDislikeCommentUseCase.name);

    await useCase.execute({
      threadId,
      commentId,
      owner,
    });

    const response = h.response({
      status: 'success',
    });
    return response;
  }
}

module.exports = LikesHandler;
