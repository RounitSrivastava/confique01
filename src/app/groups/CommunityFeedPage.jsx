// /groups/CommunityFeedPage.js
"use client";
import React from "react";
import {
  ArrowLeft,
  Search,
  Bell,
  BarChart3,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  User,
  Flag,
  X,
  EyeOff,
  UserX,
} from "lucide-react";

// -------------------------
// Initial Dummy Feed Data
// -------------------------
const initialPosts = [
  {
    id: 1,
    title: "The importance of user-centric design in modern apps",
    content:
      "Let's discuss why putting the user first is more than just a buzzword. It impacts engagement, retention, and ultimately, the bottom line...",
    author: "u/design_guru",
    time: "5h ago",
    upvotes: 1200,
    comments: 312,
    community: "r/MobileDesign",
    authorImage: "/images/avatar-1.png",
    hasImage: false,
    userVote: 0,
  },
  {
    id: 2,
    title: "Best methods for remote user testing in 2024?",
    content:
      "Seeking recommendations and experiences with remote user testing platforms and methodologies.",
    author: "u/researcher_pro",
    time: "9h ago",
    upvotes: 621,
    comments: 98,
    community: "r/UXResearch",
    authorImage: "/images/avatar-2.png",
    hasImage: false,
    userVote: 0,
  },
  {
    id: 3,
    title: "My new portfolio concept, feedback welcome!",
    content: null,
    author: "u/creative_dev",
    time: "8h ago",
    upvotes: 874,
    comments: 109,
    community: "r/webdev",
    authorImage: "/images/avatar-3.png",
    hasImage: true,
    imageUrl: "/images/portfolio-preview.jpg",
    userVote: 0,
  },
];

const defaultCommunityInfo = {
  name: "r/DefaultCommunity",
  description: "Fallback community info",
  members: "100k",
  online: "1k",
  iconUrl: "/images/mobile-design-icon.png",
  isJoined: true,
};

// --------------------
// Post Menu (Report / Hide etc)
// --------------------
const reportTypes = [
  "Spam",
  "Harassment",
  "Hate Speech",
  "Self-harm or suicide",
  "NSFW / Explicit content",
  "Intellectual property violation",
];

const PostOptionsMenu = ({ post, onClose }) => {
  const [reporting, setReporting] = React.useState(false);

  return (
    <div className="absolute right-0 top-8 z-30 w-64 bg-gray-700 rounded-lg shadow-xl p-2 border border-gray-600">
      {!reporting ? (
        <>
          <button
            onClick={() => setReporting(true)}
            className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-600 rounded-md"
          >
            <Flag className="w-4 h-4 mr-2" /> Report
          </button>

          <hr className="border-gray-600 my-1" />

          <button
            onClick={() => alert(`Blocking user ${post.author}`)}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded-md"
          >
            <UserX className="w-4 h-4 mr-2" /> Block User ({post.author})
          </button>

          <button
            onClick={() => alert(`Hiding post ${post.id}`)}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded-md"
          >
            <EyeOff className="w-4 h-4 mr-2" /> Hide Post
          </button>
        </>
      ) : (
        <div className="space-y-1">
          <div className="flex justify-between px-1">
            <h4 className="text-sm text-white">Select a reason:</h4>
            <X
              className="w-4 text-gray-400 cursor-pointer"
              onClick={() => setReporting(false)}
            />
          </div>

          {reportTypes.map((type) => (
            <button
              key={type}
              onClick={() => {
                alert(`Reported for: ${type}`);
                onClose();
              }}
              className="w-full px-3 py-2 text-xs text-gray-300 hover:bg-red-800/40 rounded-md"
            >
              {type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --------------------
// Community Header
// --------------------
const CommunityHeader = ({ community }) => {
  return (
    <div className="flex items-center p-4 border-b border-gray-800 bg-gray-900">
      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
        <User className="w-6 h-6 text-gray-300" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-white">{community.name}</h2>
        <p className="text-xs text-gray-400">
          {community.members} Members • {community.online} Online
        </p>
      </div>
    </div>
  );
};

// --------------------
// Filter Bar
// --------------------
const FilterBar = ({ selected, setActiveFilter }) => (
  <div className="flex space-x-2 px-4 py-3 bg-gray-900 border-b border-gray-800">
    {["Hot", "New", "Events"].map((f) => (
      <button
        key={f}
        onClick={() => setActiveFilter(f)}
        className={`px-3 py-1 rounded-full text-sm ${
          selected === f
            ? "bg-blue-600 text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        {f}
      </button>
    ))}
  </div>
);

// --------------------
// Comments Page (with functional comment submission and replies, scroll fixed)
// --------------------
const initialDummyComments = [
  {
    id: 1,
    author: "u/digital_dreamer",
    time: "4h ago",
    text: "Totally agree! I've abandoned so many apps with clunky interfaces.",
    parentId: null, // Top-level comment
  },
  {
    id: 2,
    author: "u/pixel_perfect",
    time: "2h ago",
    text: "Accessibility is key. A design isn’t user-centric without it.",
    parentId: null,
  },
  {
    id: 3,
    author: "u/design_guru",
    time: "1h ago",
    text: "Exactly! Accessibility must be a core design principle.",
    parentId: 2, // Reply to comment 2
  },
];

// Helper component to render a single comment and its replies
const CommentItem = ({ comment, allComments, onReply }) => {
  // Recursively filter and render replies
  const replies = allComments.filter((c) => c.parentId === comment.id);

  return (
    <div className="flex">
      <div className="w-8 h-8 rounded-full bg-gray-700 text-xs flex items-center justify-center mt-1">
        {comment.author[2]?.toUpperCase()}
      </div>

      <div className="ml-3 flex-1">
        <p className="text-xs text-gray-400">
          <span className="text-white">{comment.author}</span> · {comment.time}
        </p>
        <p className="text-sm text-gray-200 mt-1">{comment.text}</p>
        
        {/* Reply Action Button */}
        <button 
          onClick={() => onReply(comment)}
          className="text-blue-400 text-xs font-semibold mt-1 hover:underline"
        >
          Reply
        </button>

        {/* Render Replies recursively */}
        <div className="mt-3 border-l-2 border-gray-700 pl-3 space-y-3">
          {replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} allComments={allComments} onReply={onReply} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CommentsPage = ({ post, onBack }) => {
  const [commentText, setCommentText] = React.useState("");
  const [comments, setComments] = React.useState(initialDummyComments);
  const [replyingTo, setReplyingTo] = React.useState(null); // Tracks the comment object being replied to

  // Function to handle comment submission
  const handleCommentSubmit = () => {
    if (!commentText.trim()) return; 

    const newComment = {
      id: Date.now(),
      author: "u/CurrentUser",
      time: "Just now",
      text: commentText.trim(),
      parentId: replyingTo ? replyingTo.id : null, // Set parentId if replying
    };

    setComments((prevComments) => [...prevComments, newComment]); // Add new comment to the end for rendering logic
    setCommentText(""); // Clear the input field
    setReplyingTo(null); // Clear reply status
  };
  
  // Filter for only top-level comments (parentId is null)
  const topLevelComments = comments.filter(c => c.parentId === null).sort((a, b) => b.id - a.id); // Sort by newest first

  // conservative defaults (in case detection fails)
  const DEFAULT_LEFT_SIDEBAR = 250;
  const DEFAULT_RIGHT_PANEL = 360;

  const [barStyle, setBarStyle] = React.useState({
    left: DEFAULT_LEFT_SIDEBAR,
    width: Math.max(
      window.innerWidth - DEFAULT_LEFT_SIDEBAR - DEFAULT_RIGHT_PANEL,
      300
    ),
  });

  React.useEffect(() => {
    // selectors to try for sidebars / right panel
    const leftSelectors = [
      ".sidebar",
      "[data-sidebar]",
      "aside.left",
      "nav",
      ".left-sidebar",
      ".app-sidebar",
    ];
    const rightSelectors = [
      ".right-panel",
      "[data-right-panel]",
      ".rightbar",
      ".aside-right",
      ".sidebar-right",
      ".right-sidebar",
    ];

    const detect = () => {
      let leftWidth = 0;
      let rightWidth = 0;

      // find left sidebar element and use its right edge as offset
      for (const sel of leftSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Use the right edge position (distance from left viewport) as left offset
          leftWidth = Math.round(rect.right);
          break;
        }
      }

      // find right panel and compute width from its left edge to viewport right
      for (const sel of rightSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const rect = el.getBoundingClientRect();
          // width on right side = viewport width - left of right panel
          rightWidth = Math.round(window.innerWidth - rect.left);
          break;
        }
      }

      // fallback to default pixel widths if detection failed
      if (leftWidth === 0) leftWidth = DEFAULT_LEFT_SIDEBAR;
      if (rightWidth === 0) rightWidth = DEFAULT_RIGHT_PANEL;

      // compute center column width
      const centerWidth = Math.max(
        window.innerWidth - leftWidth - rightWidth,
        300
      );

      setBarStyle({
        left: leftWidth,
        width: centerWidth,
      });
    };

    // run once, and on resize
    detect();
    window.addEventListener("resize", detect);
    // also run on a short timeout to catch layout shifts
    const t = setTimeout(detect, 250);
    return () => {
      window.removeEventListener("resize", detect);
      clearTimeout(t);
    };
  }, []);

  // input bar height — used for bottom padding
  const INPUT_BAR_HEIGHT = 64;

  return (
    // FIX: Removed h-screen and flex-col, added min-h-screen and bottom padding
    <div className="relative bg-black-900 text-white min-h-screen pb-[64px]"> 
      {/* Header - Made sticky to stay at the top during scroll */}
      <div className="flex items-center px-4 py-3 bg-gray-900 border-b border-gray-800 z-20"> 
        <ArrowLeft className="w-6 h-6 cursor-pointer mr-3" onClick={onBack} />
        <div>
          <p className="text-xs text-gray-400">{post.community}</p>
          <h2 className="text-sm text-white line-clamp-1">{post.title}</h2>
        </div>
      </div>

      {/* Post summary */}
      <div className="px-4 py-3 bg-gray-900 border-b border-gray-800 z-10">
        <p className="text-xs text-gray-400">
          {post.author} · {post.time}
        </p>
        {post.content && (
          <p className="text-sm text-gray-200 mt-1">{post.content}</p>
        )}
      </div>

      {/* Comments List - Removed internal overflow/flex constraints */}
      <div>
        {topLevelComments.map((c) => (
          <div key={c.id} className="px-4 py-3 border-b border-gray-800">
            <CommentItem 
              comment={c} 
              allComments={comments} 
              onReply={setReplyingTo} 
            />
          </div>
        ))}

        <div style={{ height: 16 }} />
      </div>

      {/* FIXED COMMENT INPUT BAR (auto-detected offsets & width) */}
      <div
        role="region"
        aria-label="Comment input"
        // Uses fixed positioning relative to the viewport
        className="fixed bottom-0 z-50"
        style={{
          left: `${barStyle.left}px`,
          width: `${barStyle.width}px`,
        }}
      >
        <div className="px-6 py-2">
          {/* Reply Indicator */}
          {replyingTo && (
            <div className="flex justify-between items-center text-xs text-gray-400 mb-1 p-1 bg-gray-800 rounded">
              <span>Replying to **{replyingTo.author}**</span>
              <button 
                onClick={() => setReplyingTo(null)}
                className="text-red-400 hover:text-red-300 ml-2"
              >
                <X className="w-3 h-3 inline" /> Cancel
              </button>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCommentSubmit();
              }}
              placeholder={replyingTo ? "Write your reply..." : "Add a comment..."}
              className="flex-1 bg-gray-800 px-4 py-2 rounded-full text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 h-10"
              style={{ resize: "none" }}
            />

            <button
              onClick={handleCommentSubmit}
              disabled={!commentText.trim()}
              className="bg-blue-600 p-2 rounded-full disabled:bg-gray-700"
              aria-disabled={!commentText.trim()}
            >
              <ArrowUp className="w-4 h-4" /> 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --------------------
// PostCard Component
// --------------------
const PostCard = ({
  post,
  openMenuId,
  onToggleMenu,
  onUpvote,
  onDownvote,
  onCommentsClick,
}) => {
  const isMenuOpen = openMenuId === post.id;

  const format = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : n);

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-4 mx-4">
      {/* Header */}
      <div className="flex justify-between relative">
        <div className="flex items-center">
          <img
            src={post.authorImage}
            className="w-6 h-6 rounded-full mr-2"
            alt="author"
          />
          <span className="text-sm text-white">{post.community}</span>
          <span className="text-xs text-gray-400 ml-2">{post.author}</span>
        </div>

        <MoreHorizontal
          className="w-5 h-5 text-gray-400 cursor-pointer"
          onClick={() => onToggleMenu(post.id)}
        />

        {isMenuOpen && (
          <PostOptionsMenu post={post} onClose={() => onToggleMenu(null)} />
        )}
      </div>

      <h3 className="text-white font-semibold mt-3">{post.title}</h3>

      {post.content && (
        <p className="text-gray-300 text-sm mt-1">{post.content}</p>
      )}

      {post.hasImage && (
        <img
          src={post.imageUrl}
          className="w-full rounded-lg mt-3"
          alt="post"
        />
      )}

      {/* Footer */}
      <div className="flex justify-between mt-4">
        {/* Voting */}
        <div className="flex items-center space-x-3">
          <div
            onClick={() => onUpvote(post.id)}
            className={`cursor-pointer ${
              post.userVote === 1 ? "text-blue-500" : "text-gray-400"
            }`}
          >
            <ArrowUp className="w-5 h-5 inline mr-1" />
            {format(post.upvotes)}
          </div>

          <ArrowDown
            onClick={() => onDownvote(post.id)}
            className={`w-5 h-5 cursor-pointer ${
              post.userVote === -1 ? "text-red-500" : "text-gray-400"
            }`}
          />
        </div>

        {/* Comments */}
        <div
          className="flex items-center text-gray-400 cursor-pointer"
          onClick={() => onCommentsClick(post)}
        >
          <MessageSquare className="w-5 h-5 mr-1" />
          {post.comments}
        </div>
      </div>
    </div>
  );
};

// --------------------
// MAIN FEED PAGE
// --------------------
export default function CommunityFeedPage({ community, onGoBack }) {
  const [activeFilter, setActiveFilter] = React.useState("Hot");
  const [searchShown, setSearchShown] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [openMenuId, setOpenMenuId] = React.useState(null);
  const [posts, setPosts] = React.useState(initialPosts);
  const [selectedPost, setSelectedPost] = React.useState(null);

  const info = community || defaultCommunityInfo;

  // Show comment page
  if (selectedPost) {
    return (
      <CommentsPage post={selectedPost} onBack={() => setSelectedPost(null)} />
    );
  }

  // Voting logic
  const vote = (id, type) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        let up = p.upvotes;
        let uv = p.userVote;

        if (uv === type) {
          up -= type;
          uv = 0;
        } else {
          if (uv !== 0) up -= uv;
          up += type;
          uv = type;
        }

        return { ...p, upvotes: up, userVote: uv };
      })
    );
  };

  const filtered = posts.filter((p) =>
    searchTerm
      ? p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.content &&
          p.content.toLowerCase().includes(searchTerm.toLowerCase()))
      : true
  );

  return (
    <div className="min-h-screen bg-black-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
        <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={onGoBack} />
        <h1 className="text-xl font-bold">{info.name}</h1>

        <Search
          className="w-6 h-6 cursor-pointer"
          onClick={() => setSearchShown(!searchShown)}
        />
      </div>

      {searchShown && (
        <div className="p-4 bg-gray-900 border-b border-gray-800">
          <input
            className="w-full bg-gray-800 px-4 py-2 rounded-md text-white"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      <CommunityHeader community={info} />
      <FilterBar selected={activeFilter} setActiveFilter={setActiveFilter} />

      <div className="pt-4 pb-20">
        {filtered.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            openMenuId={openMenuId}
            onToggleMenu={setOpenMenuId}
            onUpvote={(id) => vote(id, 1)}
            onDownvote={(id) => vote(id, -1)}
            onCommentsClick={(post) => setSelectedPost(post)}
          />
        ))}
      </div>
    </div>
  );
}