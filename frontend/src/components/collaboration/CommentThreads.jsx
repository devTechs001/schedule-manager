import React, { useState } from 'react';
import { FaComment, FaReply, FaEllipsisV, FaThumbsUp, FaTrash, FaEdit } from 'react-icons/fa';

const CommentThreads = ({ comments: initialComments = [], onAddComment, onReply }) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const addComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      text: newComment,
      author: { name: 'You', avatar: 'Y' },
      createdAt: new Date(),
      likes: 0,
      replies: [],
    };
    setComments([...comments, comment]);
    onAddComment?.(comment);
    setNewComment('');
  };

  const addReply = (commentId) => {
    if (!replyText.trim()) return;
    const reply = {
      id: Date.now(),
      text: replyText,
      author: { name: 'You', avatar: 'Y' },
      createdAt: new Date(),
    };
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c
    ));
    onReply?.(commentId, reply);
    setReplyTo(null);
    setReplyText('');
  };

  const likeComment = (commentId) => {
    setComments(comments.map(c =>
      c.id === commentId ? { ...c, likes: c.likes + 1 } : c
    ));
  };

  const deleteComment = (commentId) => {
    setComments(comments.filter(c => c.id !== commentId));
  };

  const formatTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaComment className="text-primary-600 text-xl" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment */}
      <div className="flex gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white flex-shrink-0">
          Y
        </div>
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
          <button
            onClick={addComment}
            disabled={!newComment.trim()}
            className="mt-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50"
          >
            Post Comment
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No comments yet. Start the discussion!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 flex-shrink-0">
                {comment.author.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">{comment.author.name}</span>
                  <span className="text-sm text-gray-500">{formatTime(comment.createdAt)}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.text}</p>
                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => likeComment(comment.id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-primary-600"
                  >
                    <FaThumbsUp /> {comment.likes || 'Like'}
                  </button>
                  <button
                    onClick={() => setReplyTo(comment.id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-primary-600"
                  >
                    <FaReply /> Reply
                  </button>
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-500"
                  >
                    <FaTrash />
                  </button>
                </div>

                {/* Reply Input */}
                {replyTo === comment.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => addReply(comment.id)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg"
                    >Reply</button>
                  </div>
                )}

                {/* Replies */}
                {comment.replies?.length > 0 && (
                  <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm">
                          {reply.author.avatar}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white text-sm">{reply.author.name}</span>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentThreads;

