const AddReplyCommentUseCase = require('../../../../Applications/use_case/AddReplyCommentUseCase');
const DeleteReplyCommentUseCase = require('../../../../Applications/use_case/DeleteReplyCommentUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;
  }

  async postReplyCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { content } = request.payload;
    const { threadId, commentId } = request.params;
    const useCase = this._container.getInstance(AddReplyCommentUseCase.name);

    const addedReply = await useCase.execute({
      threadId,
      commentId,
      content,
      owner,
    });

    const response = h.response({
      status: 'success',
      message: 'Balasan berhasil ditambahkan',
      data: {
        addedReply,
      },
    });

    response.code(201);
    return response;
  }

  async deleteReplyCommentHandler(request) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId, replyId: id } = request.params;

    const useCase = this._container.getInstance(DeleteReplyCommentUseCase.name);

    await useCase.execute({
      id, threadId, owner, commentId,
    });

    return {
      status: 'success',
      message: 'Balasan berhasil dihapus',
    };
  }
}

module.exports = RepliesHandler;
