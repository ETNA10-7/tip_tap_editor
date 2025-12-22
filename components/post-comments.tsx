"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { ProfileAvatar } from "@/components/profile-avatar";
import { format } from "date-fns";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { ThumbsUp, Reply, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";

interface PostCommentsProps {
  postId: Id<"posts">;
}

export function PostComments({ postId }: PostCommentsProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [commentContent, setCommentContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<Id<"comments"> | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingId, setEditingId] = useState<Id<"comments"> | null>(null);
  const [editContent, setEditContent] = useState("");

  const comments = useQuery(api.comments.listByPost, { postId });
  const createComment = useMutation(api.comments.create);
  const updateComment = useMutation(api.comments.update);
  const deleteComment = useMutation(api.comments.remove);
  const toggleClap = useMutation(api.comments.toggleClap);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      router.push("/auth");
      return;
    }

    if (!commentContent.trim()) return;

    try {
      await createComment({
        postId,
        content: commentContent.trim(),
      });
      setCommentContent("");
    } catch (err) {
      console.error("Failed to create comment:", err);
    }
  };

  const handleSubmitReply = async (parentId: Id<"comments">) => {
    if (!isAuthenticated || !user) {
      router.push("/auth");
      return;
    }

    if (!replyContent.trim()) return;

    try {
      await createComment({
        postId,
        parentId,
        content: replyContent.trim(),
      });
      setReplyContent("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to create reply:", err);
    }
  };

  const handleUpdateComment = async (id: Id<"comments">) => {
    if (!editContent.trim()) return;

    try {
      await updateComment({
        id,
        content: editContent.trim(),
      });
      setEditingId(null);
      setEditContent("");
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  const handleDeleteComment = async (id: Id<"comments">) => {
    if (!confirm("Delete this comment?")) return;

    try {
      await deleteComment({ id });
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleClap = async (id: Id<"comments">) => {
    if (!isAuthenticated || !user) {
      router.push("/auth");
      return;
    }
    try {
      await toggleClap({ id });
    } catch (err) {
      console.error("Failed to toggle clap:", err);
    }
  };

  const commentCount = comments?.length || 0;

  return (
    <div className="mt-12 pt-8 border-t border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Responses ({commentCount})
        </h2>
      </div>

      {/* Comment Form */}
      {isAuthenticated && user ? (
        <div className="mb-8">
          <div className="flex items-start gap-3">
            <ProfileAvatar user={user} size="sm" />
            <div className="flex-1">
              <form onSubmit={handleSubmitComment} className="space-y-3">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="What are your thoughts?"
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!commentContent.trim()}
                    className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                  >
                    Publish
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 rounded-lg border border-slate-200 bg-slate-50 text-center">
          <p className="text-sm text-slate-600">
            <button
              onClick={() => router.push("/auth")}
              className="text-slate-900 font-semibold hover:underline"
            >
              Sign in
            </button>{" "}
            to leave a response
          </p>
        </div>
      )}

      {/* Comments List */}
      {comments && comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              user={user}
              isAuthenticated={isAuthenticated}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleSubmitReply={handleSubmitReply}
              editingId={editingId}
              setEditingId={setEditingId}
              editContent={editContent}
              setEditContent={setEditContent}
              handleUpdateComment={handleUpdateComment}
              handleDeleteComment={handleDeleteComment}
              handleClap={handleClap}
              router={router}
            />
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-center py-8">
          No responses yet. Be the first to respond!
        </p>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: any;
  user: any;
  isAuthenticated: boolean;
  replyingTo: Id<"comments"> | null;
  setReplyingTo: (id: Id<"comments"> | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleSubmitReply: (id: Id<"comments">) => void;
  editingId: Id<"comments"> | null;
  setEditingId: (id: Id<"comments"> | null) => void;
  editContent: string;
  setEditContent: (content: string) => void;
  handleUpdateComment: (id: Id<"comments">) => void;
  handleDeleteComment: (id: Id<"comments">) => void;
  handleClap: (id: Id<"comments">) => void;
  router: any;
}

function CommentItem({
  comment,
  user,
  isAuthenticated,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleSubmitReply,
  editingId,
  setEditingId,
  editContent,
  setEditContent,
  handleUpdateComment,
  handleDeleteComment,
  handleClap,
  router,
}: CommentItemProps) {
  const isAuthor = isAuthenticated && user && comment.authorId === user._id;
  const isEditing = editingId === comment._id;
  const isReplying = replyingTo === comment._id;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <ProfileAvatar user={comment.author} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-900 text-sm">
              {comment.author?.name || "Anonymous"}
            </span>
            <span className="text-xs text-slate-500">
              {format(new Date(comment.createdAt), "MMM d")}
              {comment.editedAt && " (edited)"}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateComment(comment._id)}
                  className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditContent("");
                  }}
                  className="rounded-full border border-slate-200 px-4 py-1.5 text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-700 text-sm leading-relaxed mb-2">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <button
                onClick={() => handleClap(comment._id)}
                className={`flex items-center gap-1 transition-colors ${
                  comment.hasClapped
                    ? "text-blue-600 hover:text-blue-700"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ThumbsUp
                  className={`h-4 w-4 ${
                    comment.hasClapped ? "fill-current" : ""
                  }`}
                />
                <span>{comment.claps}</span>
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => {
                    if (!isAuthenticated || !user) {
                      router.push("/auth");
                      return;
                    }
                    if (isReplying) {
                      setReplyingTo(null);
                      setReplyContent("");
                    } else {
                      setReplyingTo(comment._id);
                    }
                  }}
                  className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                >
                  <Reply className="h-4 w-4" />
                  <span>{comment.replies?.length || 0} reply</span>
                </button>
              )}
              {isAuthor && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingId(comment._id);
                      setEditContent(comment.content);
                    }}
                    className="hover:text-slate-900 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-4 ml-4 pl-4 border-l-2 border-slate-200">
              <div className="flex items-start gap-3">
                <ProfileAvatar user={user} size="sm" />
                <div className="flex-1">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleSubmitReply(comment._id)}
                      disabled={!replyContent.trim()}
                      className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50 hover:bg-slate-800"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                      className="rounded-full border border-slate-200 px-4 py-1.5 text-xs hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 ml-4 pl-4 border-l-2 border-slate-200 space-y-4">
              {comment.replies.map((reply: any) => (
                <div key={reply._id} className="flex items-start gap-3">
                  <ProfileAvatar user={reply.author} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 text-sm">
                        {reply.author?.name || "Anonymous"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {format(new Date(reply.createdAt), "MMM d")}
                        {reply.editedAt && " (edited)"}
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed mb-2">
                      {reply.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <button
                        onClick={() => handleClap(reply._id)}
                        className={`flex items-center gap-1 transition-colors ${
                          reply.hasClapped
                            ? "text-blue-600 hover:text-blue-700"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <ThumbsUp
                          className={`h-4 w-4 ${
                            reply.hasClapped ? "fill-current" : ""
                          }`}
                        />
                        <span>{reply.claps}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

