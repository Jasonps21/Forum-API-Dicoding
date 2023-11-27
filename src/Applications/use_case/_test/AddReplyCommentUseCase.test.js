const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReplyCommentUseCase = require('../AddReplyCommentUseCase');

describe('AddReplyCommentUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'this is content',
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockReturnAddedReply = new AddedReply({
      id: 'reply-123',
      content: 'this is content',
      owner: 'user-123',
    });

    mockThreadRepository.isThreadExist = jest.fn(() => Promise.resolve(true));
    mockCommentRepository.isCommentExist = jest.fn(() => Promise.resolve(true));
    mockReplyRepository.addReply = jest.fn(() => Promise.resolve(mockReturnAddedReply));

    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: 'this is content',
      owner: 'user-123',
    });

    const useCase = new AddReplyCommentUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await useCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.isThreadExist).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.isCommentExist).toBeCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(useCasePayload);
  });
});
