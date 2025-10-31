"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseclient";
import LoadingSpinner from "../../components/LoadingSpinner";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalUpvotes: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchUserStats(parsedUser.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserStats = async (userId) => {
    try {
      // Fetch user's posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, title, upvotes, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Fetch user's comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id, content, created_at, post_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      const totalUpvotes = posts?.reduce((sum, post) => sum + (post.upvotes || 0), 0) || 0;
      
      setStats({
        totalPosts: posts?.length || 0,
        totalComments: comments?.length || 0,
        totalUpvotes,
        recentActivity: [
          ...(posts?.slice(0, 3).map(post => ({
            type: 'post',
            title: post.title,
            date: post.created_at
          })) || []),
          ...(comments?.slice(0, 3).map(comment => ({
            type: 'comment',
            title: comment.content.substring(0, 50) + '...',
            date: comment.created_at
          })) || [])
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to view your dashboard.</p>
          <a 
            href="/signin"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">Here's your activity overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">Posts</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">Comments</h3>
                <p className="text-3xl font-bold text-green-600">{stats.totalComments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-2xl">👍</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">Upvotes</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.totalUpvotes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          {stats.recentActivity.length === 0 ? (
            <p className="text-gray-600">No recent activity found.</p>
          ) : (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-full mr-4">
                    <span className="text-lg">
                      {activity.type === 'post' ? '📝' : '💬'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {activity.type === 'post' ? 'Created post:' : 'Commented:'}
                    </p>
                    <p className="text-gray-600 text-sm">{activity.title}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
