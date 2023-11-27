const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadUseCase = require('../GetThreadUseCase');
const Thread = require('../../../Domains/threads/entities/Thread');
const Comment = require('../../../Domains/comments/entities/Comment');
const Reply = require('../../../Domains/replies/entities/Reply');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockThread = new Thread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date().toISOString(),
      username: 'jason',
    });
    const mockComments = [
      new Comment({
        id: 'comment-123',
        username: 'jason',
        date: new Date().toISOString(),
        content: 'sebuah comment',
        isDelete: false,
      }),
    ];
    const mockReplies = [
      new Reply({
        id: 'reply-123',
        username: 'jason',
        date: new Date().toISOString(),
        content: 'sebuah balasan',
        isDelete: false,
      }),
    ];

    mockThreadRepository.isThreadExist = jest.fn(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockComments));
    mockReplyRepository.getReplyByCommentThreadId = jest.fn(() => Promise.resolve(mockReplies));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute('thread-123');

    // Assert
    expect(thread.id).toEqual('thread-123');
    expect(thread.title).toEqual('sebuah thread');
    expect(thread.body).toEqual('sebuah body thread');
    expect(thread.date).toBeDefined();
    expect(thread.username).toEqual('jason');
    expect(thread.comments).toHaveLength(1);
    expect(thread.comments).toEqual(mockComments);

    // validate mock function call
    expect(mockThreadRepository.isThreadExist).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      'thread-123',
    );
    expect(mockReplyRepository.getReplyByCommentThreadId).toBeCalledWith(
      'comment-123',
    );
  });
});
