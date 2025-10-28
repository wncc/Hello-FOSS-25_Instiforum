"use client";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../app/lib/supabaseclient";
import { userAgent } from "next/server";

function buildCommentTree(flatComments) {
  const idToNode = new Map();
  const roots = [];
  flatComments.forEach((c) => idToNode.set(c.id, { ...c, children: [] }));
  idToNode.forEach((node) => {
    if (node.parent_id) {
      const parent = idToNode.get(node.parent_id);
      if (parent) parent.children.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  });
  // sort by created_at ascending within each level
  const sortRec = (nodes) => {
    nodes.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}

export default function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [votesByComment, setVotesByComment] = useState({}); // { [commentId]: 'up' | 'down' }
  const [votingInProgress, setVotingInProgress] = useState({}); // { [commentId]: boolean }

  const tree = useMemo(() => buildCommentTree(comments), [comments]);

  useEffect(() => {
    const loadVotes = () => {
      const sessionKey = localStorage.getItem("sessionKey") || null;
      const raw = localStorage.getItem(`commentVotes:${sessionKey}`);
      try {
        const parsed = raw ? JSON.parse(raw) : {};
        setVotesByComment(parsed && typeof parsed === "object" ? parsed : {});
      } catch {
        setVotesByComment({});
      }
    };
    loadVotes();
  }, [postId]);

  const getVote = (commentId) => votesByComment[commentId] || null;
  const setVote = (commentId, value) => {
    setVotesByComment((prev) => {
      const next = { ...prev };
      if (value === null) delete next[commentId];
      else next[commentId] = value;
      const sessionKey = localStorage.getItem("sessionKey") || null;
      localStorage.setItem(`commentVotes:${sessionKey}`, JSON.stringify(next));
      return next;
    });
  };

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (err) setError(err.message);
    setComments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!postId) return;
    fetchComments();
  }, [postId]);

  const handleCreate = async (content, parentId = null) => {
    const userdata = JSON.parse(localStorage.getItem("user") || "{}");
    const userid = userdata.id || null;
    const trimmed = (content || "").trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    const payload = {
      post_id: postId,
      parent_id: parentId,
      content: trimmed,
      upvotes: 0,
      downvotes: 0,
      user_id: userid,
    };
    const { data, error: err } = await supabase
      .from("comments")
      .insert(payload)
      .select("*")
      .single();
    if (err) {
      setError(err.message || "Failed to add comment");
      setSubmitting(false);
      return;
    }
    // Refresh to ensure correct nesting and ordering
    await fetchComments();
    setSubmitting(false);
  };

  const handleUpvote = async (comment) => {
    // Prevent double-clicks
    if (votingInProgress[comment.id]) return;

    const current = getVote(comment.id);
    let deltaUp = 0;
    let deltaDown = 0;
    let nextVote = null;
    if (current === "up") {
      deltaUp = -1;
      nextVote = null;
    } else if (current === "down") {
      deltaUp = 1;
      deltaDown = -1;
      nextVote = "up";
    } else {
      deltaUp = 1;
      nextVote = "up";
    }

    setVotingInProgress((prev) => ({ ...prev, [comment.id]: true }));

    try {
      const { error: err, data } = await supabase
        .from("comments")
        .update({
          upvotes: comment.upvotes + deltaUp,
          downvotes: comment.downvotes + deltaDown,
        })
        .eq("id", comment.id)
        .select()
        .single();

      if (err) {
        console.error("Failed to update comment vote:", err);
        alert("Failed to update vote. Please try again.");
      } else {
        setComments((prev) =>
          prev.map((c) => (c.id === comment.id ? data : c))
        );
        setVote(comment.id, nextVote);
      }
    } catch (err) {
      console.error("Error during comment vote:", err);
    } finally {
      setVotingInProgress((prev) => ({ ...prev, [comment.id]: false }));
    }
  };

  const handleDownvote = async (comment) => {
    // Prevent double-clicks
    if (votingInProgress[comment.id]) return;

    const current = getVote(comment.id);
    let deltaUp = 0;
    let deltaDown = 0;
    let nextVote = null;
    if (current === "down") {
      deltaDown = -1;
      nextVote = null;
    } else if (current === "up") {
      deltaUp = -1;
      deltaDown = 1;
      nextVote = "down";
    } else {
      deltaDown = 1;
      nextVote = "down";
    }

    setVotingInProgress((prev) => ({ ...prev, [comment.id]: true }));

    try {
      const { error: err, data } = await supabase
        .from("comments")
        .update({
          upvotes: comment.upvotes + deltaUp,
          downvotes: comment.downvotes + deltaDown,
        })
        .eq("id", comment.id)
        .select()
        .single();

      if (err) {
        console.error("Failed to update comment vote:", err);
        alert("Failed to update vote. Please try again.");
      } else {
        setComments((prev) =>
          prev.map((c) => (c.id === comment.id ? data : c))
        );
        setVote(comment.id, nextVote);
      }
    } catch (err) {
      console.error("Error during comment vote:", err);
    } finally {
      setVotingInProgress((prev) => ({ ...prev, [comment.id]: false }));
    }
  };

  return (
    <div className="mt-2">
      <div className="flex gap-2 items-center">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreate(newComment, null).then(() => setNewComment(""));
            }
          }}
          placeholder="Add a comment"
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          disabled={submitting}
          onClick={() => {
            handleCreate(newComment, null).then(() => setNewComment(""));
          }}
          className={`px-3 py-2 rounded text-white ${
            submitting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500"
          }`}
        >
          {submitting ? "Posting..." : "Comment"}
        </button>
      </div>
      {loading && (
        <div className="text-sm text-gray-500 mt-2">Loading comments...</div>
      )}
      {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
      <div className="mt-3">
        {tree.map((node) => (
          <CommentItem
            key={node.id}
            node={node}
            depth={0}
            onReply={handleCreate}
            onUpvote={handleUpvote}
            onDownvote={handleDownvote}
            getVote={getVote}
            votingInProgress={votingInProgress}
          />
        ))}
      </div>
    </div>
  );
}

function CommentItem({
  node,
  depth,
  onReply,
  onUpvote,
  onDownvote,
  getVote,
  votingInProgress,
}) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const vote = getVote(node.id);
  const isVoting = votingInProgress[node.id];

  return (
    <div className="mt-3">
      <div className="flex items-start gap-2">
        <div className="flex flex-col items-center">
          <img
            src="upvote.svg"
            className={`rounded-full h-4 w-4 cursor-pointer transition-opacity ${
              isVoting ? "opacity-50 cursor-not-allowed" : ""
            } ${vote === "up" ? "ring-2 ring-orange-500" : ""}`}
            onClick={() => !isVoting && onUpvote(node)}
            style={{ pointerEvents: isVoting ? "none" : "auto" }}
          />
          <div className="text-sm">
            {(node.upvotes || 0) - (node.downvotes || 0)}
          </div>
          <img
            src="downvote.svg"
            className={`rounded-full h-4 w-4 cursor-pointer transition-opacity ${
              isVoting ? "opacity-50 cursor-not-allowed" : ""
            } ${vote === "down" ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => !isVoting && onDownvote(node)}
            style={{ pointerEvents: isVoting ? "none" : "auto" }}
          />
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 border rounded px-3 py-2">
            <div className="text-sm text-gray-600 mb-1">
              Posted on {new Date(node.created_at).toLocaleString()}
            </div>
            <div className="text-gray-800">{node.content}</div>
          </div>
          <div className="mt-1">
            <button
              className="text-xs text-blue-600"
              onClick={() => setReplying((v) => !v)}
            >
              {replying ? "Cancel" : "Reply"}
            </button>
          </div>
          {replying && (
            <div className="flex gap-2 items-center mt-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onReply(text, node.id);
                    setText("");
                    setReplying(false);
                  }
                }}
                placeholder="Write a reply"
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                className="px-3 py-2 bg-blue-500 text-white rounded"
                onClick={() => {
                  onReply(text, node.id);
                  setText("");
                  setReplying(false);
                }}
              >
                Reply
              </button>
            </div>
          )}
          {node.children && node.children.length > 0 && (
            <div className="border-l pl-3 mt-2 ml-2">
              {node.children.map((child) => (
                <CommentItem
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  onReply={onReply}
                  onUpvote={onUpvote}
                  onDownvote={onDownvote}
                  getVote={getVote}
                  votingInProgress={votingInProgress}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
