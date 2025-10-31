"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../app/lib/supabaseclient";
import Comments from "./comments";

const PostCard = ({ post, onPostUpdate }) => {
  const [votesByPost, setVotesByPost] = useState({});
  const [votingInProgress, setVotingInProgress] = useState(false);

  useEffect(() => {
    const currentSessionKey = localStorage.getItem("sessionKey") || null;
    const stored = localStorage.getItem(`votes:${currentSessionKey}`);
    try {
      const parsed = stored ? JSON.parse(stored) : {};
      setVotesByPost(parsed && typeof parsed === "object" ? parsed : {});
    } catch {
      setVotesByPost({});
    }
  }, []);

  const getVote = (postId) => votesByPost[postId] || null;
  
  const setVote = (postId, value) => {
    setVotesByPost((prev) => {
      const next = { ...prev };
      if (value === null) delete next[postId];
      else next[postId] = value;
      const currentSessionKey = localStorage.getItem("sessionKey") || null;
      localStorage.setItem(`votes:${currentSessionKey}`, JSON.stringify(next));
      return next;
    });
  };

  const handleUpvote = async () => {
    if (votingInProgress) return;

    const current = getVote(post.id);
    let deltaUp = 0, deltaDown = 0, nextVote = null;

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

    setVotingInProgress(true);

    try {
      const { error, data } = await supabase
        .from("posts")
        .update({
          upvotes: (post.upvotes >= 0 ? (post.upvotes || 0) + deltaUp : 0),
          downvotes: (post.downvotes >= 0 ? (post.downvotes || 0) + deltaDown : 0),
        })
        .eq("id", post.id)
        .select()
        .single();

      if (error) {
        alert("Failed to update vote. Please try again.");
      } else {
        onPostUpdate && onPostUpdate(post.id, { ...post, ...data });
        setVote(post.id, nextVote);
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
    } finally {
      setVotingInProgress(false);
    }
  };

  const handleDownvote = async () => {
    if (votingInProgress) return;

    const current = getVote(post.id);
    const score = (post.upvotes || 0) - (post.downvotes || 0);
    let deltaUp = 0, deltaDown = 0, nextVote = null;

    if (current === "down") {
      deltaDown = -1;
      nextVote = null;
    } else if (current === "up") {
      if (score === 1) {
        deltaUp = -1;
        nextVote = null;
      } else {
        deltaUp = -1;
        deltaDown = 1;
        nextVote = "down";
      }
    } else {
      if (score > 0) {
        deltaDown = 1;
        nextVote = "down";
      } else return;
    }

    setVotingInProgress(true);

    try {
      const { error, data } = await supabase
        .from("posts")
        .update({
          upvotes: (post.upvotes || 0) + deltaUp,
          downvotes: (post.downvotes || 0) + deltaDown,
        })
        .eq("id", post.id)
        .select()
        .single();

      if (error) {
        alert("Failed to update vote. Please try again.");
      } else {
        onPostUpdate && onPostUpdate(post.id, { ...post, ...data });
        setVote(post.id, nextVote);
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
    } finally {
      setVotingInProgress(false);
    }
  };

  const score = (post.upvotes || 0) - (post.downvotes || 0);
  const currentUserVote = getVote(post.id);
  const isDownvoteDisabled = score <= 0 && currentUserVote !== 'down';

  return (
    <div className="mx-auto w-2/3 my-4 p-4 border rounded-lg flex flex-col gap-3 shadow-sm bg-white">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">{post.title}</h2>
        {post.flair && (
          <div className="text-sm rounded-full flex justify-center items-center bg-blue-400 px-3 py-1 text-white">
            {post.flair}
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-4">{post.content}</p>
      {post.image_url && (
        <img src={post.image_url} className="justify-center rounded-lg" alt="" />
      )}
      
      <div className="flex gap-3 items-center">
        <img
          src="upvote.svg"
          onClick={handleUpvote}
          className={`rounded-full h-5 w-5 cursor-pointer transition-opacity ${
            votingInProgress ? "opacity-50 cursor-not-allowed" : ""
          } ${currentUserVote === "up" ? "ring-2 ring-orange-500" : ""}`}
          style={{ pointerEvents: votingInProgress ? "none" : "auto" }}
        />
        <span className="font-medium">{score}</span>
        <img
          src="downvote.svg"
          onClick={() => !isDownvoteDisabled && handleDownvote()}
          className={`rounded-full h-5 w-5 transition-opacity ${
            isDownvoteDisabled || votingInProgress
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          } ${currentUserVote === "down" ? "ring-2 ring-blue-500" : ""}`}
          style={{ pointerEvents: isDownvoteDisabled || votingInProgress ? "none" : "auto" }}
        />
      </div>
      
      <Comments postId={post.id} />
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>Posted on: {new Date(post.created_at).toLocaleDateString()}</span>
        {post.users && (
          <span>By: {post.users.name} ({post.users.roll})</span>
        )}
      </div>
    </div>
  );
};

export default PostCard;