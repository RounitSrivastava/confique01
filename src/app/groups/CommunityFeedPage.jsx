"use client";
import React from "react";
import {
  ArrowLeft,
  Search,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Plus,
  User,
  Flag,
  X,
  EyeOff,
  UserX,
  Image as ImageIcon,
  UserPlus,
  Link,
  Share2,
  MessageCircle,
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
    author: "design_guru",
    time: "5h ago",
    upvotes: 1200,
    comments: 312,
    community: "MobileDesign",
    authorImage: "https://picsum.photos/seed/design/50/50",
    userVote: 0,
    hasImage: false,
  },
  {
    id: 2,
    title: "Best methods for remote user testing in 2024?",
    content:
      "Seeking recommendations and experiences with remote user testing platforms and methodologies.",
    author: "researcher_pro",
    time: "9h ago",
    upvotes: 621,
    comments: 98,
    community: "UXResearch",
    authorImage: "https://picsum.photos/seed/research/50/50",
    hasImage: false,
    userVote: 0,
  },
  {
    id: 3,
    title: "My new portfolio concept, feedback welcome!",
    content: null,
    author: "creative_dev",
    time: "8h ago",
    upvotes: 874,
    comments: 109,
    community: "webdev",
    authorImage: "https://picsum.photos/seed/creative/50/50",
    hasImage: true,
    imageUrl: "https://picsum.photos/seed/portfolio/600/400",
    userVote: 0,
  },
];

const defaultCommunityInfo = {
  name: "Rounit Srivastava",
  description: "Welcome to the community!",
  members: "1 member",
  online: "0",
  iconUrl: "https://picsum.photos/seed/ph-icon/100/100",
  bannerUrl: "https://picsum.photos/seed/philippines-banner/1200/200",
  isJoined: true,
  // optional slug fallback (for invite links when no real slug passed)
  slug: "rounit-srivastava",
};

// --------------------
// Post Menu
// --------------------
const reportTypes = [
  "Spam",
  "Harassment",
  "Hate Speech",
  "Self-harm or suicide",
  "NSFW / Explicit content",
  "Intellectual property violation",
];

const PostOptionsMenu = React.forwardRef(({ post, onClose, onHide }, ref) => {
  const [reporting, setReporting] = React.useState(false);

  const handleReport = (type) => {
    alert(`Reported post ${post.id} for: ${type}`);
    onClose();
  };

  const handleHide = () => {
    onHide(post.id);
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-30 w-64 bg-gray-900 rounded-lg shadow-xl p-2 border border-gray-700"
    >
      {!reporting ? (
        <>
          <button
            onClick={() => setReporting(true)}
            className="flex items-center w-full px-3 py-2 text-sm text-purple-400 hover:bg-gray-900 rounded-md"
          >
            <Flag className="w-4 h-4 mr-2" /> Report
          </button>

          <hr className="border-gray-600 my-1" />

          <button
            onClick={handleHide}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 rounded-md"
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
              onClick={() => handleReport(type)}
              className="w-full px-3 py-2 text-xs text-white hover:bg-purple-500 rounded-md"
            >
              {type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
PostOptionsMenu.displayName = "PostOptionsMenu";

// --------------------
// Image Preview Modal
// --------------------
const ImagePreviewModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-800/70 rounded-full text-white hover:bg-gray-900 transition-colors"
          aria-label="Close image preview"
        >
          <X className="w-6 h-6" />
        </button>

        <img
          src={imageUrl}
          alt="Full-screen preview"
          className="max-w-full max-h-screen object-contain"
        />
      </div>
    </div>
  );
};

// --------------------
// Create Post Modal
// --------------------
const CreatePostModal = ({ communityName, onClose, onSubmit }) => {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [imageFile, setImageFile] = React.useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState(null);

  const handleClearImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      handleClearImage();
    }
  };

  React.useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleSubmit = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    if (!title.trim()) return;

    const finalImageUrl = imageFile ? imagePreviewUrl : null;

    const newPost = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim() || null,
      author: "CurrentUser",
      time: "Just now",
      upvotes: 1,
      comments: 0,
      community: communityName,
      authorImage: "https://picsum.photos/seed/newuser/50/50",
      hasImage: !!imageFile,
      imageUrl: finalImageUrl,
      userVote: 1,
    };

    onSubmit(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-gray-800 w-full max-w-xl rounded-xl shadow-2xl flex flex-col max-h-full">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">
            Create a Post in {communityName}
          </h2>
          <X
            className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white"
            onClick={onClose}
          />
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 space-y-4 overflow-y-auto flex-grow"
        >
          <div>
            <input
              type="text"
              placeholder="Title (required)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0d0d0d] text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>

          <div>
            <textarea
              placeholder="Text (optional)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="5"
              className="w-full bg-[#0d0d0d] text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
            />
          </div>

          <div className="border border-dashed p-4 rounded-lg border-gray-600">
            {imagePreviewUrl ? (
              <div className="mb-3 relative">
                <p className="text-sm text-white mb-2">Image Preview:</p>
                <img
                  src={imagePreviewUrl}
                  alt="Selected Preview"
                  className="max-h-40 w-full object-cover rounded-lg"
                />

                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-purple-500 transition-colors"
                  aria-label="Remove selected image"
                >
                  <X className="w-4 h-4" />
                </button>

                <p className="text-xs text-gray-400 mt-1">
                  {imageFile?.name}
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center">
                Select an image to attach to your post.
              </p>
            )}

            <div className="mt-3">
              <label
                htmlFor="image-upload"
                className={`flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full cursor-pointer transition-colors ${
                  imageFile
                    ? "bg-red-700 text-white hover:bg-red-600"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {imageFile ? "Change Image" : "Choose Image from Device"}
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                onClick={(e) => {
                  if (imageFile) {
                    e.target.value = null;
                  }
                }}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-[#0d0d0d] disabled:text-gray-400"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

// --------------------
// Invite Menu Dropdown
// --------------------
const InviteMenu = React.forwardRef(
  ({ communityName, communitySlug, onClose }, ref) => {
    const handleShare = (method) => {
      // Fallback base URL for SSR safety
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://your-app-url.com";

      // Prefer provided slug; otherwise generate a slug from name
      const slugFromName = (communityName || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

      const slug = communitySlug || slugFromName || "community";

      // 🔗 New invite link → goes to Explore page with `invited` query
      const inviteLink = `${baseUrl}/groups?invited=${encodeURIComponent(
        slug
      )}`;

      const message = `Check out this community: ${communityName}. Join here: ${inviteLink}`;

      if (method === "WhatsApp") {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
          message
        )}`;
        window.open(whatsappUrl, "_blank");
        onClose();
      } else if (method === "Link") {
        if (navigator.clipboard) {
          navigator.clipboard
            .writeText(inviteLink)
            .then(() => {
              alert("Invite link copied to clipboard!");
              onClose();
            })
            .catch((err) => {
              console.error("Failed to copy text: ", err);
              alert(`Failed to copy link. Link: ${inviteLink}`);
              onClose();
            });
        } else {
          alert(`Invite link: ${inviteLink} (Please copy manually)`);
          onClose();
        }
      } else {
        alert(
          `Sharing invite for ${communityName} via ${method}! (Message: "${message}")`
        );
        onClose();
      }
    };

    return (
      <div
        ref={ref}
        className="absolute right-0 top-10 z-40 w-56 bg-gray-900 rounded-lg shadow-xl p-2 border border-gray-600"
      >
        <h4 className="text-sm text-white px-3 py-1 font-semibold border-b border-gray-600 mb-1">
          Invite Members
        </h4>

        <button
          onClick={() => handleShare("Link")}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
        >
          <Link className="w-4 h-4 mr-2" /> Share via Link
        </button>
        <button
          onClick={() => handleShare("WhatsApp")}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
        >
          <MessageCircle className="w-4 h-4 mr-2 text-green-400" /> Share via
          WhatsApp
        </button>
        <button
          onClick={() => handleShare("Other Apps")}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
        >
          <Share2 className="w-4 h-4 mr-2" /> Other Methods
        </button>
      </div>
    );
  }
);
InviteMenu.displayName = "InviteMenu";

// --------------------
// Community Header (full-width, no card)
// --------------------
const CommunityHeader = ({ community, onCreatePost }) => {
  const [isInviteMenuOpen, setIsInviteMenuOpen] = React.useState(false);
  const joined = true; // Hardcoded to true

  const inviteButtonRef = React.useRef(null);
  const inviteMenuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isInviteMenuOpen &&
        inviteButtonRef.current &&
        !inviteButtonRef.current.contains(event.target) &&
        inviteMenuRef.current &&
        !inviteMenuRef.current.contains(event.target)
      ) {
        setIsInviteMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isInviteMenuOpen]);

  const membersLabel = community.members
    ? community.members.toString().toLowerCase().includes("member")
      ? community.members
      : `${community.members} members`
    : "0 members";

  const inviteButton = (
    <div className="relative">
      <button
        ref={inviteButtonRef}
        onClick={() => setIsInviteMenuOpen((prev) => !prev)}
        className="hidden sm:flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-300"
      >
        <UserPlus className="w-4 h-4 mr-1" />
        Invite
      </button>
      {isInviteMenuOpen && (
        <InviteMenu
          ref={inviteMenuRef}
          communityName={community.name}
          communitySlug={community.slug} // 🔗 pass slug to InviteMenu
          onClose={() => setIsInviteMenuOpen(false)}
        />
      )}
    </div>
  );

  return (
    <div className="mb-6">
      <div className="relative w-full">
        {/* Top banner – full width */}
        <div className="h-24 sm:h-32 w-full overflow-hidden bg-gray-800">
          {community.bannerUrl ? (
            <img
              src={community.bannerUrl}
              alt={`${community.name} banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-900 to-purple-600" />
          )}
        </div>

        {/* White bar – full width */}
        <div className="bg-[#0d0d0d] text-white px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4">
          {/* Avatar overlapping the banner */}
          <div className="-mt-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black border-0 border-white overflow-hidden flex items-center justify-center text-xl font-bold text-white">
              {community.iconUrl ? (
                <img
                  src={community.iconUrl}
                  alt={`${community.name} icon`}
                  className="w-full h-full object-cover"
                />
              ) : (
                community.name?.charAt(0) || "C"
              )}
            </div>
          </div>

          {/* Name + stats */}
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-bold">
              {community.name || "Community Name"}
            </h1>
            <p className="text-xs sm:text-sm text-white">
              {membersLabel} • {community.online || "0"} online
            </p>
          </div>

          {/* Buttons on the right */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onCreatePost}
              className="hidden sm:flex items-center border border-gray-300 rounded-full px-3 py-1.5 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              Post
            </button>

            {inviteButton}

            <button
              className="rounded-full px-4 py-1.5 text-sm font-semibold bg-gray-200 text-black cursor-default"
              disabled
            >
              Joined
            </button>
          </div>
        </div>
      </div>

      {/* Description under header */}
      {community.description && (
        <div className="px-4 sm:px-6 mt-2">
          <p className="text-sm text-gray-300">{community.description}</p>
        </div>
      )}
    </div>
  );
};

// --------------------
// Filter Bar
// --------------------
const FilterBar = ({ selected, setActiveFilter }) => (
  <div className="flex space-x-2 px-4 py-3 bg-[#0d0d0d] border-b border-gray-800">
    {["Hot", "New", "Events"].map((f) => (
      <button
        key={f}
        onClick={() => setActiveFilter(f)}
        className={`px-3 py-1 rounded-full text-sm transition-colors ${
          selected === f
            ? "bg-purple-600 text-white"
            : "bg-gray-900 text-gray-300 hover:bg-gray-00"
        }`}
      >
        {f}
      </button>
    ))}
  </div>
);

// --------------------
// Comments Page
// --------------------
const initialDummyComments = [
  {
    id: 1,
    author: "digital_dreamer",
    time: "4h ago",
    text: "Totally agree! I've abandoned so many apps with clunky interfaces.",
    parentId: null,
  },
  {
    id: 2,
    author: "pixel_perfect",
    time: "2h ago",
    text: "Accessibility is key. A design isn’t user-centric without it.",
    parentId: null,
  },
  {
    id: 3,
    author: "design_guru",
    time: "1h ago",
    text: "Exactly! Accessibility must be a core design principle.",
    parentId: 2,
  },
];

const CommentItem = ({ comment, allComments, onReply }) => {
  const replies = allComments.filter((c) => c.parentId === comment.id);

  return (
    <div className="flex">
      <div className="w-8 h-8 rounded-full bg-gray-900 text-xs flex items-center justify-center mt-1 flex-shrink-0">
        {comment.author[2]?.toUpperCase()}
      </div>

      <div className="ml-3 flex-1">
        <p className="text-xs text-gray-400">
          <span className="text-white font-semibold">{comment.author}</span> ·{" "}
          {comment.time}
        </p>
        <p className="text-sm text-gray-200 mt-1">{comment.text}</p>

        <button
          onClick={() => onReply(comment)}
          className="text-gray-200 text-xs font-semibold mt-1 hover:underline"
        >
          Reply
        </button>

        {replies.length > 0 && (
          <div className="mt-3 border-l-2 border-gray-700 pl-3 space-y-3">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                allComments={allComments}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentsPage = ({ post, onBack }) => {
  const [commentText, setCommentText] = React.useState("");
  const [comments, setComments] = React.useState(initialDummyComments);
  const [replyingTo, setReplyingTo] = React.useState(null);

  const DEFAULT_LEFT_SIDEBAR = 250;
  const DEFAULT_RIGHT_PANEL = 360;

  const [barStyle, setBarStyle] = React.useState({
    left: DEFAULT_LEFT_SIDEBAR,
    width: Math.max(
      typeof window !== "undefined"
        ? window.innerWidth - DEFAULT_LEFT_SIDEBAR - DEFAULT_RIGHT_PANEL
        : 800,
      300
    ),
  });

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      author: "u/CurrentUser",
      time: "Just now",
      text: commentText.trim(),
      parentId: replyingTo ? replyingTo.id : null,
    };

    setComments((prevComments) => [...prevComments, newComment]);
    setCommentText("");
    setReplyingTo(null);
  };

  const topLevelComments = comments
    .filter((c) => c.parentId === null)
    .sort((a, b) => b.id - a.id);

  React.useEffect(() => {
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
    ];

    const detect = () => {
      if (typeof window === "undefined") return;

      let leftWidth = 0;
      let rightWidth = 0;

      for (const sel of leftSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          leftWidth = Math.round(el.getBoundingClientRect().right);
          break;
        }
      }

      for (const sel of rightSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          rightWidth = Math.round(
            window.innerWidth - el.getBoundingClientRect().left
          );
          break;
        }
      }

      if (leftWidth === 0) leftWidth = DEFAULT_LEFT_SIDEBAR;
      if (rightWidth === 0) rightWidth = DEFAULT_RIGHT_PANEL;

      const centerWidth = Math.max(
        window.innerWidth - leftWidth - rightWidth,
        300
      );

      setBarStyle({
        left: leftWidth,
        width: centerWidth,
      });
    };

    detect();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", detect);
      const t = setTimeout(detect, 250);
      return () => {
        window.removeEventListener("resize", detect);
        clearTimeout(t);
      };
    }
  }, []);

  return (
    <div className="relative bg-[#0d0d0d] text-white min-h-screen pb-20">
      <div className="flex items-center px-4 py-3 bg-[#0d0d0d] border-b border-gray-800 z-20">
        <ArrowLeft className="w-6 h-6 cursor-pointer mr-3" onClick={onBack} />
        <div className="overflow-hidden">
          <p className="text-xs text-gray-400">{post.community}</p>
          <h2 className="text-sm text-white line-clamp-1">{post.title}</h2>
        </div>
      </div>

      <div className="px-4 py-3 bg-[#0d0d0d] border-b border-gray-800 z-10">
        <p className="text-xs text-gray-400">
          <span className="text-white font-semibold">{post.author}</span> ·{" "}
          {post.time}
        </p>
        {post.content && (
          <p className="text-sm text-gray-200 mt-1">{post.content}</p>
        )}
      </div>

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

        {topLevelComments.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            Be the first to comment!
          </div>
        )}
      </div>

      <div
        role="region"
        aria-label="Comment input"
        className="fixed bottom-0 z-50 bg-[#0d0d0d] border-t border-gray-800 shadow-2xl"
        style={{
          left: `${barStyle.left}px`,
          width: `${barStyle.width}px`,
        }}
      >
        <div className="p-4">
          {replyingTo && (
            <div className="flex justify-between items-center text-xs text-gray-400 mb-2 p-2 bg-gray-800 rounded">
              <span>Replying to **{replyingTo.author}**</span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-white hover:text-purple-300 ml-2 transition-colors"
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
              placeholder={
                replyingTo ? "Write your reply..." : "Add a comment..."
              }
              className="flex-1 bg-gray-800 px-4 py-2 rounded-full text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-600 h-10 transition-shadow"
              style={{ resize: "none" }}
            />

            <button
              onClick={handleCommentSubmit}
              disabled={!commentText.trim()}
              className="bg-purple-600 p-2 rounded-full disabled:bg-gray-900 disabled:text-gray-500 text-white hover:bg-purple-700 transition-colors"
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
  onImageClick,
  onHidePost,
}) => {
  const isMenuOpen = openMenuId === post.id;
  const menuButtonRef = React.useRef(null);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        onToggleMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, onToggleMenu]);

  const format = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : n);

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-4 mx-4 shadow-lg">
      {/* Header */}
      <div className="flex justify-between relative">
        <div className="flex items-center">
          <img
            src={post.authorImage}
            className="w-6 h-6 rounded-full mr-2"
            alt="author"
          />
          <span className="text-sm text-white font-semibold">
            {post.community}
          </span>
          <span className="text-xs text-gray-400 ml-2">
            Posted by {post.author} · {post.time}
          </span>
        </div>

        <MoreHorizontal
          ref={menuButtonRef}
          className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors"
          onClick={() => onToggleMenu(post.id)}
        />

        {isMenuOpen && (
          <PostOptionsMenu
            ref={menuRef}
            post={post}
            onClose={() => onToggleMenu(null)}
            onHide={onHidePost}
          />
        )}
      </div>

      <h3
        className="text-white text-lg font-bold mt-3 cursor-pointer transition-colors"
        onClick={() => onCommentsClick(post)}
      >
        {post.title}
      </h3>

      {post.content && (
        <p className="text-gray-300 text-sm mt-1 line-clamp-3">
          {post.content}
        </p>
      )}

      {post.hasImage && (
        <div
          className="mt-3 bg-gray-900 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => onImageClick(post.imageUrl)}
        >
          <img
            src={post.imageUrl}
            className="w-full object-cover max-h-96"
            alt="post preview (click to enlarge)"
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between mt-4">
        {/* Voting */}
        <div className="flex items-center space-x-3 bg-gray-900 rounded-full p-1">
          <div
            onClick={() => onUpvote(post.id)}
            className={`flex items-center px-2 py-1 rounded-full cursor-pointer transition-colors ${
              post.userVote === 1
                ? "bg-transparent text-purple-600"
                : "hover:bg-gray-600 text-gray-400"
            }`}
          >
            <ArrowUp className="w-4 h-4 mr-1" />
            <span className="font-semibold">{format(post.upvotes)}</span>
          </div>

          <ArrowDown
            onClick={() => onDownvote(post.id)}
            className={`w-4 h-4 cursor-pointer transition-colors ${
              post.userVote === -1
                ? "text-red-400"
                : "text-gray-400 hover:text-red-300"
            }`}
          />
        </div>

        {/* Comments */}
        <button
          className="flex items-center text-gray-400 cursor-pointer transition-colors p-1"
          onClick={() => onCommentsClick(post)}
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          <span className="font-semibold">{post.comments} Comments</span>
        </button>
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
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [previewImageUrl, setPreviewImageUrl] = React.useState(null);

  const topRef = React.useRef(null);

  const communityInfo = community || { ...defaultCommunityInfo, isJoined: true };

  React.useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, [selectedPost]);

  const handleNewPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const vote = (id, type) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        let newUpvotes = p.upvotes;
        let newUserVote = p.userVote;
        let uv = p.userVote;

        if (type === 1) {
          if (uv === 1) {
            newUpvotes -= 1;
            newUserVote = 0;
          } else {
            newUpvotes += 1;
            newUserVote = 1;
          }
        } else if (type === -1) {
          if (uv === -1) {
            newUserVote = 0;
          } else {
            if (uv === 1) {
              newUpvotes -= 1;
            }
            newUserVote = -1;
          }
        }

        return { ...p, upvotes: newUpvotes, userVote: newUserVote };
      })
    );
  };

  const handleHidePost = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    alert(`Post ${id} has been hidden.`);
  };

  const sortedAndFilteredPosts = React.useMemo(() => {
    let filtered = posts.filter((p) =>
      searchTerm
        ? p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.content &&
            p.content.toLowerCase().includes(searchTerm.toLowerCase()))
        : true
    );

    switch (activeFilter) {
      case "Hot":
        filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case "New":
        filtered.sort((a, b) => b.id - a.id);
        break;
      case "Events":
        break;
      default:
        filtered.sort((a, b) => b.upvotes - a.upvotes);
    }
    return filtered;
  }, [posts, searchTerm, activeFilter]);

  if (selectedPost) {
    return (
      <CommentsPage
        post={selectedPost}
        onBack={() => setSelectedPost(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Image Preview */}
      <ImagePreviewModal
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />

      {/* Create Post Modal */}
      {isModalOpen && (
        <CreatePostModal
          communityName={communityInfo.name}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleNewPost}
        />
      )}

      {/* Top bar */}
      <div
        className="flex items-center justify-between p-4 bg-[#0d0d0d] border-b border-gray-800"
        ref={topRef}
      >
        <ArrowLeft
          className="w-6 h-6 cursor-pointer text-gray-400 hover:text-white"
          onClick={onGoBack}
        />
        <div className="flex-1 text-center"></div>
        <Search
          className="w-6 h-6 cursor-pointer text-gray-400 hover:text-white"
          onClick={() => setSearchShown(!searchShown)}
        />
      </div>

      {/* Search input */}
      {searchShown && (
        <div className="p-4 bg-[#0d0d0d] border-b border-gray-800">
          <input
            className="w-full bg-gray-800 px-4 py-2 rounded-full text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Full-width Community Header */}
      <CommunityHeader
        community={communityInfo}
        onCreatePost={() => setIsModalOpen(true)}
      />

      <FilterBar selected={activeFilter} setActiveFilter={setActiveFilter} />

      {/* Post Feed */}
      <div className="pt-4 pb-12">
        {sortedAndFilteredPosts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            openMenuId={openMenuId}
            onToggleMenu={setOpenMenuId}
            onUpvote={(id) => vote(id, 1)}
            onDownvote={(id) => vote(id, -1)}
            onCommentsClick={(post) => setSelectedPost(post)}
            onImageClick={setPreviewImageUrl}
            onHidePost={handleHidePost}
          />
        ))}

        {sortedAndFilteredPosts.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No posts found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
