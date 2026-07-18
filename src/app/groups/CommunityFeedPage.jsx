 "use client";

import React from "react";
import {
    ArrowLeft,
    Search,
    MessageSquare,
    ArrowUp,
    Heart,
    ArrowDown,
    MoreHorizontal,
    Plus,
    Flag,
    X,
    EyeOff,
    UserX,
    Image as ImageIcon,
    UserPlus,
    Link,
    Share2,
    MessageCircle,
    Trash2,
    MapPin,
    CornerUpLeft,
    Pin,
    ThumbsDown,
    BarChart2,
    Smile,
} from "lucide-react";
import { useRouter } from "next/navigation";
const SITE_OWNER_EMAIL = "confique01@gmail.com";

// -------------------------
// Custom Hook: Twitter-like Scroll Detection
// -------------------------
const useScrollDirection = (scrollRef) => {
  const [showButton, setShowButton] = React.useState(true);
  const lastY = React.useRef(0);

  React.useEffect(() => {
    if (!scrollRef || !scrollRef.current) return; // ✅ prevents crash

    const el = scrollRef.current;
    lastY.current = el.scrollTop;

    const onScroll = () => {
      const currentY = el.scrollTop;
      const delta = currentY - lastY.current;

      if (currentY < 120) {
        setShowButton(true);
      } else if (delta > 5) {
        setShowButton(false); // scroll down
      } else if (delta < -5) {
        setShowButton(true); // scroll up
      }

      lastY.current = currentY;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  return showButton;
};

// -------------------------
// Helpers
// -------------------------
const getCurrentUserEmail = () => {
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem("userEmail") || null;
    } catch (e) {
        return null;
    }
};

const getCurrentUserSnapshotFromLocalStorage = () => {
    if (typeof window === "undefined") return null;
    try {
        const raw =
            localStorage.getItem("currentUser") ||
            localStorage.getItem("confique_current_user");
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
};

const deriveNameFromEmail = (email) => {
    if (!email || typeof email !== "string") return "";
    return email.split("@")[0] || "";
};

const pushNotifications = (notifications) => {
    if (typeof window === "undefined" || !Array.isArray(notifications)) return;
    try {
        const notifStore = JSON.parse(localStorage.getItem("notifications") || "{}");
        notifications.forEach(async (n) => {
            if (!n || !n.targetEmail) return;
            const target = n.targetEmail.toLowerCase();
            const list = notifStore[target] || [];
            notifStore[target] = [n, ...list];
            
            // Send to Backend
            try {
                await fetch("/api/notifications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(n)
                });
            } catch (err) {
                console.error("Backend notification error", err);
            }
        });
        localStorage.setItem("notifications", JSON.stringify(notifStore));
        window.dispatchEvent(
            new CustomEvent("confique:new-notification", {
                detail: notifications,
            })
        );
    } catch (e) {
        console.error("Failed to push notifications", e);
    }
};

const defaultCommunityInfo = {
    name: "Rounit Srivastava",
    description: "Welcome to the community!",
    members: "1 member",
    online: "0",
    iconUrl: "https://picsum.photos/seed/ph-icon/100/100",
    bannerUrl: "https://picsum.photos/seed/philippines-banner/1200/200",
    isJoined: true,
    slug: "rounit-srivastava",
    ownerEmail: "community.owner@example.com",
};

// --------------------
// small utility: API fetch wrapper that includes cookies
const apiFetch = (url, opts = {}) => {
    const final = {
        credentials: "include", // ensure cookies are sent (auth)
        cache: "no-store",
        ...opts,
        headers: {
            ...(opts.headers || {}),
            // keep content-type if provided; do not override binary/form
        },
    };
    return fetch(url, final);
};

// --------------------
// URL helper: normalize relative -> absolute
const makeAbsoluteUrl = (u) => {
    if (!u) return null;
    if (typeof u !== "string") return null;
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    // prefer runtime origin if available
    const base =
        typeof window !== "undefined" && window.location && window.location.origin
            ? window.location.origin
            : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    // ensure single slash
    if (u.startsWith("/")) return `${base}${u}`;
    return `${base}/${u}`;
};

const isPlaceholderAvatar = (url) => {
  if (!url) return true;
  return (
    url.includes("dicebear.com") ||
    url.includes("avatars.dicebear.com") ||
    url.includes("initials/svg")
  );
};

// helper: convert File -> data URL (base64)
const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result); // "data:image/..;base64,...."
        fr.onerror = (err) => reject(err);
        fr.readAsDataURL(file);
    });

const renderTextWithLinks = (text) => {
    if (!text) return null;
    if (typeof text !== 'string') return text;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
        if (part.match(urlRegex)) {
            return (
                <a 
                    key={i} 
                    href={part} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#53bdeb] hover:underline break-all" 
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};

// --------------------
// Avatar component (fixes scaling / fallback)
// --------------------
// Avatar component (FIXED – SVG safe, DiceBear compatible)
// --------------------
const Avatar = ({ src, alt, size = 40, className = "", onClick }) => {
  const px = typeof size === "number" ? `${size}px` : size;

  const finalSrc =
  typeof src === "string" && src.trim().length > 0
    ? src
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        alt || "User"
      )}`;

  return (
    <img
      src={finalSrc}
      alt={alt || "avatar"}
      width={px}
      height={px}
      className={`rounded-full object-cover bg-bg-3 ${className}`}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          alt || "User"
        )}`;
      }}
      style={{ width: px, height: px }}
      onClick={onClick}
    />
  );
};

// --------------------

// --------------------
// Small subcomponents
// --------------------
const reportTypes = [
    "Spam",
    "Harassment",
    "Hate Speech",
    "Self-harm or suicide",
    "NSFW / Explicit content",
    "Intellectual property violation",
];

const PostOptionsMenu = React.forwardRef(
    (
        {
            post,
            onClose,
            onHide,
            onReport,
            isAdmin,
            onAdminRemove,
            canDeleteSelf,
            onDeleteSelf,
        },
        ref
    ) => {
        const [reporting, setReporting] = React.useState(false);

        const handleReport = (type) => {
            onReport(post, type);
            setReporting(false);
            onClose();
        };

        const handleHide = () => {
            onHide(post.id);
            onClose();
        };

        const handleAdminRemove = () => {
            if (
                typeof window === "undefined" ||
                window.confirm("Are you sure you want to remove this post for everyone?")
            ) {
                onAdminRemove(post.id);
                onClose();
            }
        };

        const handleDeleteSelf = () => {
            if (
                typeof window === "undefined" ||
                window.confirm("Delete this post for everyone?")
            ) {
                onDeleteSelf(post.id); // calls handleAdminRemovePost in parent
                onClose();
            }
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

                        {canDeleteSelf && (
                            <button
                                onClick={handleDeleteSelf}
                                className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/40 rounded-md"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete my post
                            </button>
                        )}

                        <button
                            onClick={handleHide}
                            className="flex items-center w-full px-3 py-2 text-sm text-text-2 hover:bg-bg-3 rounded-md"
                        >
                            <EyeOff className="w-4 h-4 mr-2" /> Hide Post
                        </button>

                        {isAdmin && (
                            <>
                                <hr className="border-gray-600 my-1" />
                                <button
                                    onClick={handleAdminRemove}
                                    className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/40 rounded-md"
                                >
                                    <UserX className="w-4 h-4 mr-2" /> Remove from Community
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <div className="space-y-1">
                        <div className="flex justify-between px-1">
                            <h4 className="text-sm text-text-1">Select a reason:</h4>
                            <X
                                className="w-4 text-text-3 cursor-pointer"
                                onClick={() => setReporting(false)}
                            />
                        </div>

                        {reportTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => handleReport(type)}
                                className="w-full px-3 py-2 text-xs text-text-1 hover:bg-[#a855f7] rounded-md"
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }
);
PostOptionsMenu.displayName = "PostOptionsMenu";

const ImagePreviewModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg-1 bg-opacity-90 p-4"
            onClick={onClose}
        >
            <div
                className="relative max-w-full max-h-full"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-800/70 rounded-full text-text-1 hover:bg-gray-900 transition-colors"
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

const useKeyboardMetrics = () => {
  const [metrics, setMetrics] = React.useState({
    keyboardHeight: 0,
    isOpen: false,
  });

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const vv = window.visualViewport;

    const update = () => {
      const keyboardHeight =
        window.innerHeight - vv.height - vv.offsetTop;

      setMetrics({
        keyboardHeight: keyboardHeight > 0 ? keyboardHeight : 0,
        isOpen: keyboardHeight > 0,
      });
    };

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return metrics;
};

// update uper
// create post modal form with image upload and preview
const CreatePostModal = ({ communityName, onClose, onSubmit }) => {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [imageFile, setImageFile] = React.useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState(null);
  const [isPosting, setIsPosting] = React.useState(false);

  const { keyboardHeight, isOpen } = useKeyboardMetrics(); // ✅ NEW

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleClearImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
  };

  React.useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleSubmit = async () => {
  if (!title.trim() || isPosting) return;

  setIsPosting(true);
  try {
    await onSubmit({
      title: title.trim(),
      content: content.trim(),
      imageFile,
      imagePreviewUrl,
    });
    onClose();
  } finally {
    setIsPosting(false);
  }
};
  return (
    <div
  className="
    fixed inset-0 z-50
    bg-black/70
    flex items-center justify-center
    px-3
    transition-transform duration-300 ease-out
  "
  style={{
    transform: isOpen
      ? `translateY(-${keyboardHeight / 2}px)`
      : "translateY(0)",
  }}
>
      {/* FLOATING CARD */}
      <div
        className="
          w-full sm:max-w-xl
          bg-bg-4
          rounded-2xl
          shadow-2xl
          flex flex-col
          max-h-[90svh]
          overflow-hidden
        "
      >
        {/* HEADER */}
        <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-border-2">
          <div>
            <h2 className="text-lg font-semibold text-text-1">Create post</h2>
            <p className="text-xs text-text-3">
              Posting in <span className="text-purple-400">{communityName}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-bg-3 transition"
          >
            <X className="w-5 h-5 text-text-2" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 overscroll-contain">
          {/* TITLE */}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="
              w-full bg-transparent
              text-text-1
              placeholder-gray-500
              border-b border-gray-700
              pb-2
              focus:outline-none focus:border-[#a855f7]
            "
          />

          {/* CONTENT */}
          <textarea
            placeholder="What do you want to share?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={(e) => {
              setTimeout(() => {
                e.target.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }, 100);
            }}
            rows={6}
            className="
              w-full bg-transparent
              text-text-1
              placeholder-gray-400
              rounded-xl
              px-4 py-3
              border border-white/20
              focus:border-white/40
              focus:outline-none
              focus:ring-2 focus:ring-purple-600/40
            "
          />

          {/* IMAGE PREVIEW */}
          {imagePreviewUrl && (
            <div className="relative">
              <img
                src={imagePreviewUrl}
                alt="Preview"
                className="w-full max-h-56 object-cover rounded-xl"
              />
              <button
                onClick={handleClearImage}
                className="
                  absolute top-2 right-2
                  bg-black/60 p-1.5 rounded-full
                  hover:bg-red-600 transition
                "
              >
                <X className="w-4 h-4 text-text-1" />
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          className="
            flex-none
            px-4 py-3
            border-t border-border-2
            flex items-center gap-3
            bg-bg-4
          "
          style={{
            paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          }}
        >
          <label
            htmlFor="post-image"
            className="p-2 rounded-full hover:bg-bg-3 cursor-pointer"
          >
            <ImageIcon className="w-5 h-5 text-purple-400" />
          </label>

          <input
            id="post-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          <button
  onClick={handleSubmit}
  disabled={!title.trim() || isPosting}
  className={`ml-auto px-6 py-2 rounded-full font-semibold transition active:scale-95
    ${isPosting
      ? "bg-gray-700 text-text-2 cursor-not-allowed"
      : "bg-[#c084fc] text-text-1 hover:bg-purple-700"}
  `}
>
  {isPosting ? "Posting..." : "Post"}
</button>
        </div>
      </div>
    </div>
  );
};


const InviteMenu = React.forwardRef(
    ({ communityName, communitySlug, onClose }, ref) => {
        const handleShare = (method) => {
            const baseUrl =
                typeof window !== "undefined"
                    ? window.location.origin
                    : "https://your-app-url.com";

            const slugFromName = (communityName || "")
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]+/g, "");
            const slug = communitySlug || slugFromName || "community";
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
  className="
  z-50 bg-gray-900 rounded-lg shadow-xl p-2 border border-gray-600 w-56
  absolute right-0 top-10
"
>

                <h4 className="text-sm text-text-1 px-3 py-1 font-semibold border-b border-gray-600 mb-1">
                    Invite Members
                </h4>

                <button
                    onClick={() => handleShare("Link")}
                    className="flex items-center w-full px-3 py-2 text-sm text-text-2 hover:bg-bg-3 rounded-md transition-colors"
                >
                    <Link className="w-4 h-4 mr-2" /> Share via Link
                </button>
                <button
                    onClick={() => handleShare("WhatsApp")}
                    className="flex items-center w-full px-3 py-2 text-sm text-text-2 hover:bg-bg-3 rounded-md transition-colors"
                >
                    <MessageCircle className="w-4 h-4 mr-2 text-green-400" /> Share via
                    WhatsApp
                </button>
                <button
                    onClick={() => handleShare("Other Apps")}
                    className="flex items-center w-full px-3 py-2 text-sm text-text-2 hover:bg-bg-3 rounded-md transition-colors"
                >
                    <Share2 className="w-4 h-4 mr-2" /> Other Methods
                </button>
            </div>
        );
    }
);
InviteMenu.displayName = "InviteMenu";
const CreateMenu = React.forwardRef(({ onSelect, onClose }, ref) => (
  <div
    ref={ref}
    className="absolute right-0 top-10 w-44 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50"
  >
    <button
      onClick={() => {
        onSelect("poll");
        onClose();
      }}
      className="w-full text-left px-4 py-2 text-sm text-text-1 hover:bg-bg-3"
    >
      Create Poll
    </button>
  </div>
));

// --------------------
// Author Profile Modal (new)
const AuthorProfileModal = ({ email, onClose, userData }) => {
    if (!email && !userData) return null;
    const u = userData || {};
    const bioText =
  typeof u?.bio === "string" && !u.bio.startsWith("http")
    ? u.bio
    : typeof u?.about === "string"
    ? u.about
    : "";
    return (
       <div
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
  onMouseDown={onClose}
>
            <div className="bg-bg-4 rounded-lg max-w-sm w-full p-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-4">
                 <Avatar
  src={u?.avatar || null}
  alt={u?.displayName || u?.email || "User"}
  size={72}
/>


                    <div>
                        <h3 className="text-lg font-bold text-text-1">{u?.displayName || deriveNameFromEmail(email)}</h3>
                       <p className="text-sm text-text-3 mt-1">
  {bioText || "No bio added yet"}
</p>
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="px-3 py-2 rounded-md bg-bg-3 text-text-1">Close</button>
                </div>
            </div>
        </div>
    );
};

// --------------------
// Community Header
// --------------------
const CommunityHeader = ({
  community,
  onCreatePost,
  isAdmin,
  canDeleteCommunity,
  onDeleteCommunity,
}) => {
    const [isInviteMenuOpen, setIsInviteMenuOpen] = React.useState(false);
    const [isCreateMenuOpen, setIsCreateMenuOpen] = React.useState(false);
const createBtnRef = React.useRef(null);
const createMenuRef = React.useRef(null);
    const desktopInviteBtnRef = React.useRef(null);
const desktopInviteMenuRef = React.useRef(null);

const mobileInviteBtnRef = React.useRef(null);
const mobileInviteMenuRef = React.useRef(null);


   React.useEffect(() => {
  const handleClickOutside = (e) => {

    // INVITE MENU
    if (isInviteMenuOpen) {
      const isDesktop = window.matchMedia("(min-width: 640px)").matches;

      if (isDesktop) {
        if (
          desktopInviteBtnRef.current &&
          desktopInviteMenuRef.current &&
          !desktopInviteBtnRef.current.contains(e.target) &&
          !desktopInviteMenuRef.current.contains(e.target)
        ) {
          setIsInviteMenuOpen(false);
        }
      } else {
        if (
          mobileInviteBtnRef.current &&
          mobileInviteMenuRef.current &&
          !mobileInviteBtnRef.current.contains(e.target) &&
          !mobileInviteMenuRef.current.contains(e.target)
        ) {
          setIsInviteMenuOpen(false);
        }
      }
    }

    // CREATE MENU
    if (
      isCreateMenuOpen &&
      createBtnRef.current &&
      createMenuRef.current &&
      !createBtnRef.current.contains(e.target) &&
      !createMenuRef.current.contains(e.target)
    ) {
      setIsCreateMenuOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [isInviteMenuOpen, isCreateMenuOpen]);

    const getMembersLabel = () => {
        if (community.membersCount !== undefined) {
            return `${community.membersCount} member${community.membersCount === 1 ? '' : 's'}`;
        }
        if (community.members) {
            const m = community.members.toString().toLowerCase();
            return m.includes("member") ? community.members : `${community.members} members`;
        }
        return "0 members";
    };
    const membersLabel = getMembersLabel();

    const inviteButton = (
        
<div className="relative hidden sm:block">
  <button
    ref={desktopInviteBtnRef}
    onClick={() => setIsInviteMenuOpen((p) => !p)}
    className="flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-300"
  >
    <UserPlus className="w-4 h-4 mr-1" />
    Invite
  </button>

  {isInviteMenuOpen && (
    <InviteMenu
      ref={desktopInviteMenuRef}
      communityName={community.name}
      communitySlug={community.slug}
      onClose={() => setIsInviteMenuOpen(false)}
    />
  )}
</div>
    );

    return (
        <div className="mb-6">
            <div className="relative w-full">
                <div className="h-24 sm:h-32 w-full overflow-hidden bg-bg-3">
                    {community.bannerUrl ? (
                        <img
                            src={community.bannerUrl}
                            alt={`${community.name} banner`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                    "https://picsum.photos/seed/philippines-banner/1200/200";
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-slate-900 to-purple-600" />
                    )}
                </div>

                <div className="bg-bg-4 px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4 text-text-1">
                    <div className="-mt-10">
                        <Avatar
                            src={community.iconUrl}
                            alt={community.name || "community"}
                            size={80}
                            className="border-0"
                        />
                    </div>

                    <div className="flex flex-col">
                        <h1 className="text-lg sm:text-xl font-bold">
                            {community.name || "Community Name"}
                        </h1>
                       <p className="text-xs sm:text-sm text-text-1">
  {membersLabel}
</p>

                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={onCreatePost}
                            className="hidden sm:flex items-center border border-gray-300 rounded-full px-3 py-1.5 text-sm font-medium"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Post
                        </button>

                        {inviteButton}

                        {/* Mobile Invite Button */}
{/* Mobile Invite */}
<div className="relative sm:hidden">
  <button
    ref={mobileInviteBtnRef}
    onClick={() => setIsInviteMenuOpen((p) => !p)}
    className="flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-300"
  >
    <UserPlus className="w-4 h-4 mr-1" />
    Invite
  </button>
<div className="relative sm:hidden ml-2">
  <button
    ref={createBtnRef}
    onClick={() => setIsCreateMenuOpen((p) => !p)}
    className="p-2 rounded-full hover:bg-bg-3"
  >
    <MoreHorizontal className="w-5 h-5 text-text-1" />
  </button>

  {isCreateMenuOpen && (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setIsCreateMenuOpen(false)}
      />
      <CreateMenu
        ref={createMenuRef}
        onSelect={(type) => onCreatePost(type)}
        onClose={() => setIsCreateMenuOpen(false)}
      />
    </>
  )}
</div>
  {isInviteMenuOpen && (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setIsInviteMenuOpen(false)}
      />
      <InviteMenu
        ref={mobileInviteMenuRef}
        communityName={community.name}
        communitySlug={community.slug}
        onClose={() => setIsInviteMenuOpen(false)}
      />
    </>
  )}
</div>


{/* Desktop Joined Button */}
<button
  className="hidden sm:inline-flex rounded-full px-4 py-1.5 text-sm font-semibold bg-gray-200 text-black cursor-default"
  disabled
>
  Joined
</button>
<div className="relative hidden sm:block">
  <button
    ref={createBtnRef}
    onClick={() => setIsCreateMenuOpen((p) => !p)}
    className="p-2 rounded-full hover:bg-bg-3"
  >
    <MoreHorizontal className="w-5 h-5 text-text-1" />
  </button>

  {isCreateMenuOpen && (
    <CreateMenu
      ref={createMenuRef}
      onSelect={(type) => onCreatePost(type)}
      onClose={() => setIsCreateMenuOpen(false)}
    />
  )}
</div>

                        {canDeleteCommunity && (
                            <button
                                onClick={onDeleteCommunity}
                                className="ml-2 flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-red-700 text-text-1 hover:bg-red-600"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete Community
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {community.description && (
                <div className="px-4 sm:px-6 mt-2">
                    <p className="text-sm text-text-2">{community.description}</p>
                </div>
            )}
        </div>
    );
};

// --------------------
// Filter Bar
// --------------------
const FilterBar = ({ selected, setActiveFilter, eventsCount = 0 }) => (
    <div className="flex space-x-2 px-4 py-3 bg-bg-4 border-b border-border-2">
        {["Hot", "New"].map((f) => (
            <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selected === f
                        ? "bg-[#c084fc] text-text-1"
                        : "bg-gray-900 text-text-2 hover:bg-bg-3"
                }`}
            >
                {f}
            </button>
        ))}

        <button
            onClick={() => setActiveFilter("Events")}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selected === "Events"
                    ? "bg-[#c084fc] text-text-1"
                    : "bg-gray-900 text-text-2 hover:bg-bg-3"
            }`}
        >
            Events {eventsCount > 0 ? `(${eventsCount})` : ""}
        </button>
    </div>
);

// --------------------
// Comments helpers + CommentsPage
// --------------------
const mapBackendCommentToFrontend = (comment) => {
    const createdAt = comment.createdAt ? new Date(comment.createdAt) : new Date();

    const authorName =
        comment.authorName ||
        comment.authorDisplayName ||
        (comment.authorEmail ? comment.authorEmail.split("@")[0] : "User");

    const rawAvatar =
        comment.authorImage || comment.authorAvatar || null;

    const authorImage = rawAvatar
  ? makeAbsoluteUrl(rawAvatar)
  : undefined;

    return {
        id: comment._id || comment.id,
        author: authorName,
        authorEmail: comment.authorEmail || null,
        authorImage,
        text: comment.text || "",
        time: createdAt.toLocaleString(),
        parentId: comment.parentId || null,
        createdAtMs: createdAt.getTime(),
    };
};

const CommentItem = ({ comment, allComments, onReply, currentUserEmail, currentUserAvatar }) => {
    const replies = allComments.filter((c) => c.parentId === comment.id);

    // if comment belongs to current user, prefer currentUserAvatar
    const avatarSrc =
    comment.authorEmail &&
    currentUserEmail &&
    comment.authorEmail === currentUserEmail
        ? currentUserAvatar || comment.authorImage
        : comment.authorImage;

    return (
        <div className="flex">
            <div className="flex-shrink-0 mt-1">
                <Avatar src={avatarSrc} alt={comment.author} size={32} className="" />
            </div>

            <div className="ml-3 flex-1">
                <p className="text-xs text-text-3">
                    <span className="text-text-1 font-semibold">{comment.author}</span> ·{" "}
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
                                currentUserEmail={currentUserEmail}
                                currentUserAvatar={currentUserAvatar}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const enrichCommentAuthors = async (comments, setComments) => {
  const emails = [
    ...new Set(comments.map(c => c.authorEmail).filter(Boolean))
  ];

  await Promise.all(
    emails.map(async (email) => {
      try {
        const res = await apiFetch(
          `/api/users/by-email?email=${encodeURIComponent(email)}`,
          { method: "GET" }
        );
        if (!res.ok) return;

        const data = await res.json();
        if (!data?.user?.avatar) return;

        setComments(prev =>
          prev.map(c =>
            c.authorEmail === email
              ? { ...c, authorImage: data.user.avatar }
              : c
          )
        );
      } catch (e) {
        console.error("Comment avatar fetch failed", e);
      }
    })
  );
};

const CommentsPage = ({
    post,
    communityInfo,
    onBack,
    isDbBackedCommunity,
    currentUserEmailFromParent,
    currentUserDisplayNameFromParent,
    currentUserAvatarFromParent,
}) => {
    const [commentText, setCommentText] = React.useState("");
    const [comments, setComments] = React.useState([]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [replyingTo, setReplyingTo] = React.useState(null);
    const [loadingComments, setLoadingComments] = React.useState(false);

    const currentUserEmail =
        currentUserEmailFromParent || getCurrentUserEmail() || null;
    const currentUserDisplayName =
        currentUserDisplayNameFromParent || (currentUserEmail ? deriveNameFromEmail(currentUserEmail) : "You");
    const currentUserAvatar = currentUserAvatarFromParent || (typeof window !== "undefined" ? localStorage.getItem("userAvatar") : null);

    React.useEffect(() => {
        if (typeof window !== "undefined") window.scrollTo(0, 0);
    }, []);

    React.useEffect(() => {
        const loadComments = async () => {
            if (!isDbBackedCommunity || !communityInfo?.id || !post?.id) return;
            try {
                setLoadingComments(true);
                const res = await apiFetch(
                    `/api/groups/${encodeURIComponent(
                        communityInfo.id
                    )}/posts/${encodeURIComponent(post.id)}/comments`,
                    { method: "GET" }
                );
                if (!res.ok) return;
                const data = await res.json();
                const fromDb = Array.isArray(data.comments) ? data.comments : [];
                let mapped = fromDb.map(mapBackendCommentToFrontend);

                // override author name/avatar for comments belonging to current user
                mapped = mapped.map((c) => {
                    if (c.authorEmail && currentUserEmail && c.authorEmail === currentUserEmail) {
                        return {
                            ...c,
                            author: currentUserDisplayName,
                            authorImage: currentUserAvatar || c.authorImage,
                        };
                    }
                    return c;
                });

                setComments(mapped);
                enrichCommentAuthors(mapped, setComments);
            } catch (e) {
                console.error("Failed to load comments", e);
            } finally {
                setLoadingComments(false);
            }
        };
        loadComments();
    }, [isDbBackedCommunity, communityInfo?.id, post?.id, currentUserEmail, currentUserDisplayName, currentUserAvatar]);

    const handleCommentSubmit = async () => {
        const trimmed = commentText.trim();

// 🚨 prevents double click + double enter
if (!trimmed || isSubmitting) return;
setIsSubmitting(true);
        const parentId = replyingTo ? replyingTo.id : null;

        if (isDbBackedCommunity && communityInfo?.id && post?.id) {
            try {
                const res = await apiFetch(
                    `/api/groups/${encodeURIComponent(
                        communityInfo.id
                    )}/posts/${encodeURIComponent(post.id)}/comments`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            text: trimmed,
                            parentId,
                        }),
                    }
                );

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    if (res.status === 401) {
                        alert("You must be logged in to comment.");
                        return;
                    }
                    alert(data.error || "Failed to submit comment");
                    return;
                }
                const data = await res.json();
                const savedCommentRaw = data.comment || data.newComment || null;
                const savedComment = savedCommentRaw
                    ? (() => {
                        const mapped = mapBackendCommentToFrontend(savedCommentRaw);
                        // override if it's current user's comment
                        if (mapped.authorEmail && currentUserEmail && mapped.authorEmail === currentUserEmail) {
                            return {
                                ...mapped,
                                author: currentUserDisplayName,
                                authorImage: currentUserAvatar || mapped.authorImage,
                            };
                        }
                        return mapped;
                    })()
                    : {
                        id: `local-${Date.now()}`,
                        author: currentUserEmail ? currentUserDisplayName : "You",
                        authorEmail: currentUserEmail,
                        authorImage: currentUserAvatar || (currentUserEmail ? `https://avatars.dicebear.com/api/initials/${encodeURIComponent(currentUserDisplayName || deriveNameFromEmail(currentUserEmail))}.svg` : null),
                        text: trimmed,
                        time: new Date().toLocaleString(),
                        parentId,
                        createdAtMs: Date.now(),
                    };

                setComments((prev) => [...prev, savedComment]);
            } catch (err) {
                console.error("Error posting comment:", err);
                alert("Error posting comment.");
                 } finally {

        // ✅ ALWAYS unlock
        setIsSubmitting(false);
              
            }
        } else {
            const now = new Date();
            const localComment = {
                id: now.getTime(),
                author: currentUserEmail ? currentUserDisplayName : "u/CurrentUser",
                authorEmail: currentUserEmail,
                authorImage: currentUserAvatar || (currentUserEmail ? `https://avatars.dicebear.com/api/initials/${encodeURIComponent(currentUserDisplayName || deriveNameFromEmail(currentUserEmail))}.svg` : null),
                text: trimmed,
                time: "Just now",
                parentId,
                createdAtMs: now.getTime(),
            };
            setComments((prev) => [...prev, localComment]);
        }

        if (post.authorEmail && currentUserEmail && currentUserEmail !== post.authorEmail) {
            const notif = {
                id: `comment-${post.id}-${Date.now()}`,
                type: "COMMENT",
                targetEmail: post.authorEmail,
                postId: post.id,
                communitySlug: communityInfo.slug,
                communityName: communityInfo.name,
                message: `${currentUserEmail} commented on your post "${post.title}" in "${communityInfo.name}"`,
                createdAt: new Date().toISOString(),
                read: false,
            };
            pushNotifications([notif]);
        }

        setCommentText("");
        setReplyingTo(null);
    };

    const topLevelComments = comments
        .filter((c) => !c.parentId)
        .sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));

    return (
        <div className="relative bg-bg-4 text-text-1 min-h-screen pb-20">
            <div className="flex items-center px-4 py-3 bg-bg-4 border-b border-border-2 z-20">
                <ArrowLeft className="w-6 h-6 cursor-pointer mr-3" onClick={onBack} />
                <div className="overflow-hidden">
                    <p className="text-xs text-text-3">{post.community}</p>
                    <h2 className="text-sm text-text-1 line-clamp-1">{post.title}</h2>
                </div>
            </div>

            <div className="px-4 py-3 bg-bg-4 border-b border-border-2 z-10">
                <p className="text-xs text-text-3">
                    <span className="text-text-1 font-semibold">{post.author}</span> ·{" "}
                    {post.time}
                </p>
                {post.content && (
  <p
    className="
      text-text-2 text-sm mt-2
      whitespace-pre-wrap
      leading-relaxed
      line-clamp-3
    "
  >
    {post.content}
  </p>
)}

            </div>

            <div>
                {loadingComments && (
                    <div className="p-4 text-center text-text-4 text-sm">Loading comments...</div>
                )}

                {topLevelComments.map((c) => (
                    <div key={c.id} className="px-4 py-3 border-b border-border-2">
                        <CommentItem
                            comment={c}
                            allComments={comments}
                            onReply={setReplyingTo}
                            currentUserEmail={currentUserEmail}
                            currentUserAvatar={currentUserAvatar}
                        />
                    </div>
                ))}

                {!loadingComments && topLevelComments.length === 0 && (
                    <div className="p-4 text-center text-text-4">Be the first to comment!</div>
                )}
            </div>

            <div
  role="region"
  aria-label="Comment input"
  className="
    fixed bottom-0 z-50 bg-bg-4 border-t border-border-2 shadow-2xl
    left-0 w-full
    sm:left-[250px] sm:w-[calc(100%-250px-360px)]
  "
>

                <div className="p-4">
                    {replyingTo && (
                        <div className="flex justify-between items-center text-xs text-text-3 mb-2 p-2 bg-bg-3 rounded">
                            <span>Replying to {replyingTo.author}</span>
                            <button onClick={() => setReplyingTo(null)} className="text-text-1 hover:text-purple-300 ml-2 transition-colors">
                                <X className="w-3 h-3 inline" /> Cancel
                            </button>
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !isSubmitting){
                                    e.preventDefault();
                                    handleCommentSubmit();
                                }
                            }}
                            placeholder={replyingTo ? "Write your reply..." : "Add a comment..."}
                            className="flex-1 bg-bg-3 px-4 py-2 rounded-full text-sm text-text-1 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-600 h-10 transition-shadow"
                        />
                        <button
                            onClick={handleCommentSubmit}
                            disabled={!commentText.trim() || isSubmitting}
                            className={`
    p-2 rounded-full text-text-1 transition-colors
    ${isSubmitting
        ? "bg-gray-700 cursor-not-allowed"
        : "bg-[#c084fc] hover:bg-purple-700"}
`}
                            aria-disabled={!commentText.trim()}
                        >
                            {isSubmitting ? "..." : <ArrowUp className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --------------------
// PostCard
// --------------------
const PostCard = ({
    post,
    openMenuId,
    onToggleMenu,
    onCommentsClick,
    onImageClick,
    onHidePost,
    onReport,
    isAdmin,
    onAdminRemove,
    canDeleteSelf,
    onDeleteSelf,
    onAuthorClick,
    currentUserAvatar,
    currentUserEmail,
    currentUserDisplayName,
    onVote,
}) => {
    const [expanded, setExpanded] = React.useState(false);
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

        const handleGlobalPostDeleted = (e) => {
            const deletedPostId = e?.detail?.postId;
            if (deletedPostId && typeof setPosts === 'function') {
                setPosts(prev => prev.filter(p => p.id !== deletedPostId));
            }
        };
        window.addEventListener("confique:post-deleted", handleGlobalPostDeleted);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("confique:post-deleted", handleGlobalPostDeleted);
        };
    }, [isMenuOpen, onToggleMenu]);

    const format = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : n);

    // safe author label: prefer current user's display name when emails match
    const authorLabel =
        post.authorEmail && currentUserEmail && post.authorEmail === currentUserEmail
            ? currentUserDisplayName || post.author || deriveNameFromEmail(post.authorEmail)
            : post.author || (post.authorEmail ? deriveNameFromEmail(post.authorEmail) : "Unknown");

    // pick avatar from available fields with fallbacks
    const avatarSrc =
  post.authorImage ||
  post.authorAvatar ||
  post.authorImageUrl ||
  post.authorProfilePic ||
  null; // ❗ DO NOT generate DiceBear here

    const handleUpvoteClick = () => {
        if (typeof onVote === 'function') {
            onVote(post.id, 1);
        }
    };

   return (
  <div className="mx-0">
    {/* FULL-WIDTH SEPARATOR */}
   

    {/* POST CONTENT */}
    <div className="p-4 mx-4">
      <div className="flex justify-between relative">

                <div className="flex items-center">
                    <button
                        onClick={() => {
  if (!onAuthorClick) return;

  const safeEmail = post.authorEmail || null;
  if (!safeEmail) {
    console.warn("No valid email for author profile");
    return;
  }

  onAuthorClick(safeEmail);

}}
                        className="flex items-center gap-2 focus:outline-none"
                        title={`View ${authorLabel}'s profile`}
                    >
                        <Avatar src={avatarSrc} alt={authorLabel} size={24} className="mr-2 flex-shrink-0" />
                        <div className="text-left">
                            <div className="text-sm text-text-1 font-semibold">{authorLabel}</div>
                            <div className="text-xs text-text-3"> {post.time}</div>
                        </div>
                    </button>
                </div>

                <MoreHorizontal
                    ref={menuButtonRef}
                    className="w-5 h-5 text-text-3 cursor-pointer hover:text-text-1 transition-colors"
                    onClick={() => onToggleMenu(post.id)}
                />

                {isMenuOpen && (
                    <PostOptionsMenu
                        ref={menuRef}
                        post={post}
                        onClose={() => onToggleMenu(null)}
                        onHide={onHidePost}
                        onReport={onReport}
                        isAdmin={isAdmin}
                        onAdminRemove={onAdminRemove}
                        canDeleteSelf={canDeleteSelf}
                        onDeleteSelf={onDeleteSelf}
                    />
                )}
            </div>

            <h3 className="text-text-1 text-lg font-bold mt-3 cursor-pointer transition-colors" onClick={() => onCommentsClick(post)}>
                {post.title}
            </h3>

           {post.content && (
  <div className="mt-2">
    <p
      className={`
        text-text-2 text-sm
        whitespace-pre-wrap
        leading-relaxed
        ${expanded ? "" : "line-clamp-3"}
      `}
    >
      {post.content}
    </p>

    {post.content.length > 180 && (
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-1 text-xs font-semibold text-purple-400 hover:underline"
      >
        {expanded ? "See less" : "See more"}
      </button>
    )}
  </div>
)}

            {post.imageUrl && (
                <div className="mt-3 bg-gray-900 rounded-lg overflow-hidden cursor-pointer" onClick={() => onImageClick(post.imageUrl)}>
                    <img
                        src={post.imageUrl}
                        className="w-full object-cover max-h-96"
                        alt="post preview (click to enlarge)"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://placehold.co/800x450/111827/ffffff?text=No+Image";
                        }}
                    />
                </div>
            )}

            <div className="flex justify-between mt-4">
                <div className="flex items-center">
                    <div
                        onClick={handleUpvoteClick}
                        className={`flex items-center px-2 py-1 cursor-pointer transition-colors ${
  post.userVote === 1
    ? "text-[#a855f7]"
    : "text-text-3 hover:text-text-1"
}`}
                    >
                        <ArrowUp
  className={`w-4 h-4 mr-1 transition-colors ${
    post.userVote === 1 ? "text-[#a855f7]" : "text-text-3"
  }`}
/>
                        <span className={`font-semibold ${post.userVote === 1 ? "text-text-1" : "text-text-2"}`}>
                            {format(post.upvotes)}
                        </span>
                    </div>
                </div>
                </div>

                <button className="flex items-center text-text-3 cursor-pointer transition-colors p-1" onClick={() => onCommentsClick(post)}>
                    <MessageSquare className="w-5 h-5 mr-2" />
                    <span className="font-semibold">{post.comments} Comments</span>
                </button>
            </div>
             <div className="h-px w-full bg-white/10" />
        </div>
    );
};

// --------------------
// Event list item
// --------------------
const EventListItem = ({ event, onOpenDetails }) => {
    return (
        <div className="flex items-start gap-4 p-4 border-b border-border-2">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                <img
                    src={event.poster}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/400x300/111827/ffffff?text=No+Image";
                    }}
                />
            </div>

            <div className="flex-1">
                <h4 className="text-text-1 font-bold text-lg cursor-pointer" onClick={() => onOpenDetails(event.id)}>
                    {event.title}
                </h4>
                <div className="text-sm text-text-3 mt-1 flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span>{event.venue || "Online"}</span>
                    <span>•</span>
                    <span>{event.date || "TBA"}</span>
                </div>
                <div className="mt-2 text-xs text-text-2 flex items-center gap-2">
                    {event.tags && event.tags.map((t, i) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-bg-3 text-text-2">{t}</span>
                    ))}
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
                <button onClick={() => onOpenDetails(event.id)} className="bg-[#c084fc] text-text-1 px-3 py-1.5 rounded-full text-sm">View</button>
                <div className="text-xs text-text-3">{event.impressions ? `${event.impressions.toLocaleString()} views` : ""}</div>
            </div>
        </div>
    );
};

// --------------------
// mapBackendPostToFrontend (normalizes image/author urls)
// --------------------
const mapBackendPostToFrontend = (post, communityInfo) => {
    const createdAt = post.createdAt ? new Date(post.createdAt) : null;
    const timeLabel = createdAt ? createdAt.toLocaleString() : "Just now";

    const resolvedAuthor =
        post.authorDisplayName ||
        post.authorName ||
        post.author ||
        post.authorUsername ||
        (post.authorEmail ? deriveNameFromEmail(post.authorEmail) : "Unknown");

    // ensure image and authorImage are absolute
    const absImageUrl = post.imageUrl ? makeAbsoluteUrl(post.imageUrl) : null;
    const absAuthorImage =
  post.authorImage !== undefined
    ? makeAbsoluteUrl(post.authorImage)
    : post.authorAvatar
    ? makeAbsoluteUrl(post.authorAvatar)
    : post.authorImageUrl
    ? makeAbsoluteUrl(post.authorImageUrl)
    : null;


    return {
        id: post._id || post.id,
        title: post.title,
        content: post.content || null,
        author: resolvedAuthor,
        authorEmail: post.authorEmail || null,
        authorId: post.authorId || post.author_id || null,
        time: timeLabel,
        upvotes: post.upvotes || 0,
        comments: post.commentsCount || 0,
        community: communityInfo.name,
        authorImage: absAuthorImage,
        hasImage: !!(absImageUrl || post.imageBase64),
        imageUrl: absImageUrl,
        userVote: post.userVote || 0,
        createdAtMs: createdAt ? createdAt.getTime() : Date.now(),
        authorDisplayName: post.authorDisplayName || null,
        authorName: post.authorName || null,
        authorUsername: post.authorUsername || null,
        reactions: post.reactions || [],
        poll: post.poll || null,
    };
};

// --------------------
// MAIN FEED PAGE (Client Component)
// --------------------
export default function CommunityFeedPage({ community, onGoBack, onDeleteCommunity }) {
    // Use the custom hook for Twitter-like scroll behavior
   const scrollRef = React.useRef(null);
const showFab = useScrollDirection(scrollRef);

  
    
    const router = useRouter();

    const handleGoBack = () => {
        if (onGoBack) onGoBack();
        else router.back();
    };

    const handleDeleteCommunity = async (communityInfo) => {
        if (onDeleteCommunity) {
            onDeleteCommunity(communityInfo);
            return;
        }
        if (typeof window !== "undefined" && !window.confirm(`Are you sure you want to delete the community "${communityInfo.name}"?`)) {
            return;
        }
        
        const isDbBackedCommunity =
            communityInfo && typeof communityInfo.id === "string" && /^[0-9a-fA-F]{24}$/.test(communityInfo.id);

        if (isDbBackedCommunity && communityInfo.id) {
            try {
                await apiFetch(`/api/groups/${encodeURIComponent(communityInfo.id)}`, { method: "DELETE" });
                alert(`Community "${communityInfo.name}" deleted successfully.`);
                router.push('/groups');
            } catch (e) {
                console.error("Failed to delete community from backend", e);
                alert("Failed to delete community.");
            }
        } else {
            router.push('/groups');
        }
    };
    
    if (!community) {
        return (
            <div className="min-h-screen bg-bg-4 text-text-1 p-4">
                <button onClick={handleGoBack} className="text-text-3 hover:text-text-1 mb-4 flex items-center">
                    <ArrowLeft className="w-6 h-6 mr-2" /> Back to Explore
                </button>
                <h1 className="text-xl font-bold text-red-500">Error: Community data missing.</h1>
                <p className="text-text-3">Please ensure the community object is passed correctly to CommunityFeedPage.</p>
            </div>
        );
    }
    
    const communityInfo = community || { ...defaultCommunityInfo, isJoined: true };

    const isDbBackedCommunity =
        communityInfo && typeof communityInfo.id === "string" && /^[0-9a-fA-F]{24}$/.test(communityInfo.id);

    const [activeFilter, setActiveFilter] = React.useState("Hot");
    const [searchShown, setSearchShown] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [openMenuId, setOpenMenuId] = React.useState(null);

    const [posts, setPosts] = React.useState([]);
    const [postsLoading, setPostsLoading] = React.useState(true);
    const [selectedPost, setSelectedPost] = React.useState(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [postType, setPostType] = React.useState("post");
    const [previewImageUrl, setPreviewImageUrl] = React.useState(null);
    const [reports, setReports] = React.useState([]);
    const [currentUser, setCurrentUser] = React.useState(null);

    const [selectedProfileEmail, setSelectedProfileEmail] = React.useState(null);
    const [selectedProfileData, setSelectedProfileData] = React.useState(null);
    const [profileLoading, setProfileLoading] = React.useState(false);

    // CHAT STATE
    const [chatInput, setChatInput] = React.useState("");
    const [replyToMsg, setReplyToMsg] = React.useState(null);
    const [menuOpenId, setMenuOpenId] = React.useState(null);
    const [selectedImageFile, setSelectedImageFile] = React.useState(null);
    const [selectedImagePreview, setSelectedImagePreview] = React.useState(null);
    const [pinnedPostId, setPinnedPostId] = React.useState(null);
    const [isPollModalOpen, setIsPollModalOpen] = React.useState(false);
    const [pollQuestion, setPollQuestion] = React.useState("");
    const [pollOptions, setPollOptions] = React.useState(["", ""]);
    const [isMultiSelect, setIsMultiSelect] = React.useState(false);
    const fileInputRef = React.useRef(null);
    const chatEndRef = React.useRef(null);

    const topRef = React.useRef(null);
    const fetchedEmailsRef = React.useRef(new Set());
    const deletedPostIdsRef = React.useRef(new Set());


    React.useEffect(() => {
        let mounted = true;
        async function loadUser() {
            try {
                const res = await apiFetch("/api/me", { method: "GET" });
                if (!mounted) return;
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data?.user || null);
                    try {
                        if (typeof window !== "undefined" && data?.user) {
                            localStorage.setItem("confique_current_user", JSON.stringify(data.user));
                            localStorage.setItem("userEmail", data.user.email || "");
                            if (data.user.avatar) localStorage.setItem("userAvatar", data.user.avatar);
                            if (data.user.displayName) localStorage.setItem("userName", data.user.displayName);
                        }
                    } catch (e) {}
                } else {
                    const snap = getCurrentUserSnapshotFromLocalStorage();
                    if (snap) setCurrentUser(snap);
                    else {
                        const email = getCurrentUserEmail();
                        if (email) setCurrentUser({ email, name: "", displayName: deriveNameFromEmail(email), username: deriveNameFromEmail(email) });
                    }
                }
            } catch (e) {
                console.error("CommunityFeedPage auth check failed:", e);
                const snap = getCurrentUserSnapshotFromLocalStorage();
                    if (snap) setCurrentUser(snap);
                    else {
                        const email = getCurrentUserEmail();
                        if (email) setCurrentUser({ email, name: "", displayName: deriveNameFromEmail(email), username: deriveNameFromEmail(email) });
                    }
            }
        }
        loadUser();
        return () => { mounted = false; };
    }, []);

    const currentUserEmail = currentUser?.email || null;
    const currentUserDisplayName = (currentUser && (currentUser.displayName || currentUser.name || currentUser.username)) || (currentUserEmail ? deriveNameFromEmail(currentUserEmail) : null);
    const currentUserName = currentUser?.name || null;
    const isSiteOwner = currentUserEmail === SITE_OWNER_EMAIL;
    const isCommunityOwner = communityInfo?.ownerEmail && currentUserEmail && communityInfo.ownerEmail === currentUserEmail;
    const isAdmin = isSiteOwner || isCommunityOwner;
    const canDeleteCommunity = isSiteOwner; // 🔥 ONLY site owner


    let currentUserAvatar = null;
    try {
        currentUserAvatar =
            (currentUser && (currentUser.avatar || currentUser.avatarUrl || currentUser.image || currentUser.profilePic)) ||
            (typeof window !== "undefined" ? localStorage.getItem("userAvatar") : null) ||
            null;
    } catch (e) {
        currentUserAvatar = null;
    }

    const readEventsFromLocalStorage = React.useCallback(() => {
        if (typeof window === "undefined") return [];
        try {
            const raw = localStorage.getItem("confique:events") || localStorage.getItem("EVENTS_SNAPSHOT") || null;
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed;
        } catch (e) {
            console.error("Failed to read events from localStorage", e);
            return [];
        }
    }, []);

    const [eventsInCategory, setEventsInCategory] = React.useState([]);

    React.useEffect(() => {
        const allEvents = readEventsFromLocalStorage();
        const matchKey = (communityInfo && (communityInfo.category || communityInfo.slug || communityInfo.name)) || null;
        if (!matchKey) {
            setEventsInCategory([]);
            return;
        }
        const mk = String(matchKey).toLowerCase().trim();
        const matched = allEvents.filter((ev) => {
            if (!ev) return false;
            const cat = (ev.category || "").toString().toLowerCase();
            const title = (ev.title || "").toString().toLowerCase();
            const tags = (ev.tags || []).join(" ").toLowerCase();
            return cat === mk || title.includes(mk) || tags.includes(mk);
        });
        setEventsInCategory(matched);
    }, [communityInfo, readEventsFromLocalStorage]);

    React.useEffect(() => {
        if (topRef.current) topRef.current.scrollIntoView({ behavior: "auto", block: "start" });
    }, [selectedPost]);

    React.useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const stored = JSON.parse(localStorage.getItem("reports") || "[]");
            setReports(stored);
        } catch (e) {
            console.error("Failed to parse reports from localStorage", e);
        }
    }, []);
    
    const sendVoteUpdate = React.useCallback(async (postId, newVoteType) => {
        if (!currentUserEmail) {
            alert("Please log in to vote.");
            return;
        }
        if (!isDbBackedCommunity || !communityInfo.id) {
             console.warn("Voting disabled for non-db backed community.");
             return;
        }

        try {
            const res = await apiFetch(`/api/groups/${encodeURIComponent(communityInfo.id)}/posts/${encodeURIComponent(postId)}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vote: newVoteType })
            });
            
            if (!res.ok) {
                console.error("Failed to save vote to backend. Status:", res.status);
                const errorData = await res.json().catch(() => ({}));
                alert("Failed to save vote: " + (errorData.error || "Please try again"));
                
                if (communityInfo.id) {
                    try {
                        const res = await apiFetch(`/api/groups/${encodeURIComponent(communityInfo.id)}/posts`, { method: "GET" });
                        if (res.ok) {
                            const data = await res.json();
                            const postsFromDb = Array.isArray(data.posts) ? data.posts : [];
                            const mapped = postsFromDb.map((p) => mapBackendPostToFrontend(p, communityInfo));
                            setPosts(mapped);
                            enrichAuthors(mapped);
                        }
                    } catch (e) {
                        console.error("Error re-fetching posts after vote failure", e);
                    }
                }
            } else {
                const data = await res.json();
                if (data.post) {
                    setPosts(prev => prev.map(p => 
                        p.id === postId ? {
                            ...p,
                            upvotes: data.post.upvotes || p.upvotes,
                            userVote: data.post.userVote || p.userVote
                        } : p
                    ));
                }
            }
        } catch (e) {
            console.error("Vote API call failed:", e);
            alert("Network error while voting. Please check your connection.");
        }
    }, [currentUserEmail, isDbBackedCommunity, communityInfo.id]);

    const enrichAuthors = React.useCallback(
    async (postsArray) => {
        if (!Array.isArray(postsArray) || postsArray.length === 0) return;

        const updated = postsArray.map((p) => {
            // ---------- AUTHOR NAME ----------
            let name =
                p.author ||
                (p.authorEmail ? deriveNameFromEmail(p.authorEmail) : "User");

            // ---------- AUTHOR AVATAR ----------
            let authorImage = p.authorImage;

// only normalize if it actually exists
if (authorImage) {
  authorImage = makeAbsoluteUrl(authorImage);
}


            authorImage = makeAbsoluteUrl(authorImage);

            // ---------- FORCE CURRENT USER ----------
            if (
                p.authorEmail &&
                currentUserEmail &&
                p.authorEmail === currentUserEmail
            ) {
                return {
                    ...p,
                    author: currentUserDisplayName || name,
                    authorImage: currentUserAvatar || authorImage,
                };
            }

            return {
                ...p,
                author: name,
                authorImage,
            };
        });

        setPosts((prev) => {
            const map = new Map(prev.map((x) => [String(x.id), x]));
            updated.forEach((u) =>
                map.set(String(u.id), { ...(map.get(String(u.id)) || {}), ...u })
            );
            return Array.from(map.values());
        });
    },
    [currentUserEmail, currentUserDisplayName, currentUserAvatar]
);

    React.useEffect(() => {
    if (!isDbBackedCommunity || !communityInfo.id) {
        setPostsLoading(false);
        return;
    }

    async function loadPosts(isInitial = false) {
        try {
            if (isInitial) setPostsLoading(true);

            const res = await apiFetch(
                `/api/groups/${encodeURIComponent(communityInfo.id)}/posts`,
                { method: "GET" }
            );

            if (!res.ok) {
                console.error("Failed to load posts", res.status);
                if (isInitial) setPosts([]);
                return;
            }

            const data = await res.json();
            const postsFromDb = Array.isArray(data.posts) ? data.posts : [];
            const mapped = postsFromDb.map((p) =>
                mapBackendPostToFrontend(p, communityInfo)
            ).filter(p => !deletedPostIdsRef.current.has(p.id));

            setPosts(mapped);
            enrichAuthors(mapped);
        } catch (e) {
            console.error("Error loading posts", e);
        } finally {
            if (isInitial) setPostsLoading(false);
        }
    }

    // Initial load
    loadPosts(true);

    // Real-time polling
    const interval = setInterval(() => {
        loadPosts(false);
    }, 3000);

    return () => clearInterval(interval);
}, [isDbBackedCommunity, communityInfo.id, enrichAuthors]);

    const handleReact = async (postId, emoji) => {
        if (!isDbBackedCommunity || !communityInfo.id) return;
        try {
            // Optimistic UI update
            setPosts(prev => prev.map(p => {
                if (p.id !== postId) return p;
                const currentUserEmailLocal = currentUserEmail || getCurrentUserEmail();
                if (!currentUserEmailLocal) return p;

                let newReactions = [...(p.reactions || [])];
                const existingTargetEntry = newReactions.find(r => r.emoji === emoji);
                const userHadThisEmoji = existingTargetEntry && existingTargetEntry.users.includes(currentUserEmailLocal);

                // Remove user from ALL emojis
                newReactions = newReactions.map(r => ({
                    ...r,
                    users: r.users.filter(u => u !== currentUserEmailLocal)
                }));

                if (!userHadThisEmoji) {
                    // Add them to the new emoji
                    const targetEntry = newReactions.find(r => r.emoji === emoji);
                    if (targetEntry) {
                        targetEntry.users.push(currentUserEmailLocal);
                    } else {
                        newReactions.push({ emoji, users: [currentUserEmailLocal] });
                    }
                }

                // Filter out empty emojis
                newReactions = newReactions.filter(r => r.users.length > 0);

                return { ...p, reactions: newReactions };
            }));

            await apiFetch(`/api/groups/${encodeURIComponent(communityInfo.id)}/posts/${encodeURIComponent(postId)}/react`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emoji })
            });
        } catch (e) {
            console.error("Failed to react", e);
        }
    };

    const handleCreatePoll = async () => {
        if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) {
            alert("Please provide a question and at least two options.");
            return;
        }
        if (!isDbBackedCommunity || !communityInfo.id) {
            alert("Polls are only supported in DB-backed communities.");
            return;
        }

        const payload = {
            title: pollQuestion,
            content: "poll",
            poll: {
                question: pollQuestion,
                isMultiSelect: isMultiSelect,
                options: pollOptions.filter(o => o.trim()).map(opt => ({ text: opt, votes: [] }))
            }
        };

        try {
            const res = await apiFetch(`/api/groups/${encodeURIComponent(communityInfo.id)}/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.post) {
                    const mapped = mapBackendPostToFrontend(data.post, communityInfo);
                    setPosts(prev => [mapped, ...prev]);
                    enrichAuthors([mapped]);
                }
            }
        } catch (e) {
            console.error("Failed to create poll", e);
        } finally {
            setIsPollModalOpen(false);
            setPollQuestion("");
            setPollOptions(["", ""]);
            setIsMultiSelect(false);
            if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleVotePoll = async (postId, optionIndex) => {
        if (!isDbBackedCommunity || !communityInfo.id) return;
        try {
            // Optimistic UI update
            setPosts(prev => prev.map(p => {
                if (p.id !== postId || !p.poll) return p;
                const newPoll = JSON.parse(JSON.stringify(p.poll));
                const currentUserEmailLocal = currentUserEmail || getCurrentUserEmail();
                if (!currentUserEmailLocal) return p;

                const userHasVotedForThisOption = newPoll.options[optionIndex].votes.includes(currentUserEmailLocal);

                if (userHasVotedForThisOption) {
                    newPoll.options[optionIndex].votes = newPoll.options[optionIndex].votes.filter(e => e !== currentUserEmailLocal);
                } else {
                    if (!newPoll.isMultiSelect) {
                        newPoll.options.forEach(opt => {
                            opt.votes = opt.votes.filter(u => u !== currentUserEmailLocal);
                        });
                    }
                    newPoll.options[optionIndex].votes.push(currentUserEmailLocal);
                }

                return { ...p, poll: newPoll };
            }));

            await apiFetch(`/api/groups/${encodeURIComponent(communityInfo.id)}/posts/${encodeURIComponent(postId)}/vote-poll`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ optionIndex })
            });
        } catch (e) {
            console.error("Failed to vote", e);
        }
    };

    const handleNewPost = async ({ title, content, imageFile, imagePreviewUrl }) => {
        if (!isDbBackedCommunity || !communityInfo.id) {
            const currentUserEmailLocal = currentUserEmail || getCurrentUserEmail() || "current@user.com";
            let avatarFromSnapshot = null;
            try {
                const snap = getCurrentUserSnapshotFromLocalStorage();
                avatarFromSnapshot = snap?.avatar || null;
            } catch (e) {}
            const userAvatar = currentUser?.avatar || avatarFromSnapshot || `https://avatars.dicebear.com/api/initials/${encodeURIComponent(currentUserDisplayName || deriveNameFromEmail(currentUserEmailLocal))}.svg`;

            const nowMs = Date.now();
            const newPost = {
                id: nowMs,
                title,
                content: content || null,
                author: currentUserDisplayName || deriveNameFromEmail(currentUserEmailLocal),
                authorEmail: currentUserEmailLocal,
                time: "Just now",
                upvotes: 1,
                comments: 0,
                community: communityInfo.name,
                authorImage: userAvatar,
                hasImage: !!imageFile,
                imageUrl: imagePreviewUrl || null,
                userVote: 1,
                createdAtMs: nowMs,
            };
            setPosts((prev) => [newPost, ...prev]);
            return;
        }

        try {
            const payload = { title, content };

            if (imageFile) {
                try {
                    const dataUrl = await fileToBase64(imageFile);
                    if (dataUrl) payload.imageBase64 = dataUrl;
                } catch (e) {
                    console.error("Failed to convert image file to base64:", e);
                }
            }

            if (!payload.imageBase64 && imagePreviewUrl) {
                payload.imageUrl = imagePreviewUrl;
            }

            const res = await apiFetch(`/api/groups/${encodeURIComponent(communityInfo.id)}/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                if (res.status === 401) {
                    alert("You must be logged in to create a post.");
                    return;
                }
                alert(data.error || "Failed to create post");
                return;
            }

            const { post } = await res.json();

            const normalized = {
  ...post,
  imageUrl:
    post.imageUrl
      ? makeAbsoluteUrl(post.imageUrl)
      : post.imageBase64 || null, // ✅ allow base64 preview
  authorImage: post.authorImage
    ? makeAbsoluteUrl(post.authorImage)
    : null,
};
const mapped = {
  ...mapBackendPostToFrontend(normalized, communityInfo),

  // 🔥 FORCE IMAGE VISIBILITY
  imageUrl: imagePreviewUrl || normalized.imageUrl || null,
  hasImage: !!imagePreviewUrl,
};

setPosts((prev) => [mapped, ...prev]);
            enrichAuthors([mapped]);
        } catch (e) {
            console.error("Failed to create post", e);
            alert("Something went wrong while creating the post.");
        }
    };

    // Auto-scroll to bottom of chat only when new posts arrive
    React.useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [posts.length]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (selectedImagePreview) URL.revokeObjectURL(selectedImagePreview);
        setSelectedImageFile(file);
        setSelectedImagePreview(URL.createObjectURL(file));
    };

    const handleClearImage = () => {
        if (selectedImagePreview) URL.revokeObjectURL(selectedImagePreview);
        setSelectedImageFile(null);
        setSelectedImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendChat = async () => {
        if (!chatInput.trim() && !selectedImageFile) return;
        const msg = chatInput.trim();
        setChatInput("");
        
        const fileToUpload = selectedImageFile;
        const previewToUpload = selectedImagePreview;
        setSelectedImageFile(null);
        setSelectedImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        let finalContent = msg;
        if (replyToMsg) {
            const payload = {
                isReply: true,
                replyId: replyToMsg.id,
                replyAuthor: replyToMsg.authorName || replyToMsg.author,
                replyText: replyToMsg.displayContent || replyToMsg.content || replyToMsg.title,
                text: msg
            };
            finalContent = JSON.stringify(payload);
            setReplyToMsg(null);
        }
        
        const title = msg.length > 50 ? msg.substring(0, 47) + "..." : msg || "Image attachment";
        await handleNewPost({
            title,
            content: finalContent,
            imageFile: fileToUpload,
            imagePreviewUrl: previewToUpload
        });
    };

    const vote = (id, type) => {
        // Since we only have upvote now, type will always be 1 or 0
        let likedPost = null;
        const currentUserEmailLocal = currentUserEmail || getCurrentUserEmail() || null;

        setPosts((prev) =>
            prev.map((p) => {
                if (p.id !== id) return p;
                
                let newUpvotes = p.upvotes;
                let newUserVote = p.userVote;
                const previousVote = p.userVote;

                // Only handle upvote toggle (1 -> 0, 0 -> 1)
                if (type === 1 && previousVote === 1) {
                    // Remove upvote
                    newUpvotes -= 1;
                    newUserVote = 0;
                    type = 0; // Update finalVoteType
                } else if (type === 1) {
                    // Add upvote
                    newUpvotes += 1;
                    newUserVote = 1;
                    type = 1; // Update finalVoteType
                }

                newUpvotes = Math.max(0, newUpvotes);

                const updatedPost = { ...p, upvotes: newUpvotes, userVote: newUserVote };
                
                if (
                    newUserVote === 1 && 
                    previousVote !== 1 && 
                    updatedPost.authorEmail &&
                    currentUserEmailLocal &&
                    currentUserEmailLocal !== updatedPost.authorEmail
                ) {
                    likedPost = updatedPost;
                }

                return updatedPost;
            })
        );
        
        if (isDbBackedCommunity && communityInfo.id) {
            // For backend, only send 1 (upvote) or 0 (remove vote)
            const finalVoteType = type === 1 ? 1 : 0;
            sendVoteUpdate(id, finalVoteType);
        }

        if (likedPost && currentUserEmailLocal) {
            const notif = {
                id: `like-${likedPost.id}-${Date.now()}`,
                type: "LIKE",
                targetEmail: likedPost.authorEmail,
                postId: likedPost.id,
                communitySlug: communityInfo.slug,
                communityName: communityInfo.name,
                message: `${currentUserEmailLocal} liked your post "${likedPost.title}" in "${communityInfo.name}"`,
                createdAt: new Date().toISOString(),
                read: false,
            };
            pushNotifications([notif]);
        }
    };

    const handleHidePost = (id) => {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        alert(`Post ${id} has been hidden for you.`);
    };

    const handleDeletePost = async (postId) => {
        if (!confirm("Are you sure you want to delete this message for everyone?")) return;
        
        // Optimistic UI update
        deletedPostIdsRef.current.add(postId);
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        
        try {
            const res = await apiFetch(`/api/groups/${encodeURIComponent(communityInfo.id)}/posts/${postId}`, {
                method: "DELETE"
            });
            if (!res.ok) {
                const data = await res.json().catch(()=>({}));
                alert(data.error || "Failed to delete message");
            }
        } catch (e) {
            console.error("Error deleting post:", e);
        }
    };

    const handleReportPost = (post, reason) => {
        if (!currentUserEmail) {
            alert("You need to be logged in to report a post.");
            return;
        }

        const newReport = {
            id: Date.now(),
            postId: post.id,
            postTitle: post.title,
            communitySlug: communityInfo.slug,
            communityName: communityInfo.name,
            reporterEmail: currentUserEmail,
            reason,
            status: "pending",
            createdAt: new Date().toISOString(),
        };

        setReports((prev) => [newReport, ...prev]);

        try {
            if (typeof window !== "undefined") {
                const existingReports = JSON.parse(localStorage.getItem("reports") || "[]");
                localStorage.setItem("reports", JSON.stringify([newReport, ...existingReports]));

                const notifBase = {
                    type: "REPORT",
                    createdAt: newReport.createdAt,
                    read: false,
                    postId: post.id,
                    communitySlug: communityInfo.slug,
                    communityName: communityInfo.name,
                    message: `${currentUserEmail} reported a post in "${communityInfo.name}": "${post.title}" for ${reason}`,
                };

                const notifications = [];
                if (communityInfo.ownerEmail) {
                    notifications.push({
                        ...notifBase,
                        id: `n-${newReport.id}-community-owner`,
                        targetEmail: communityInfo.ownerEmail,
                    });
                }
                notifications.push({
                    ...notifBase,
                    id: `n-${newReport.id}-site-owner`,
                    targetEmail: SITE_OWNER_EMAIL,
                });

                pushNotifications(notifications);
            }
        } catch (e) {
            console.error("Failed to save report/notifications", e);
        }

        alert("Report submitted. Admins will review it.");
    };

    const handleAdminRemovePost = async (postId) => {
        setPosts((prev) => prev.filter((p) => p.id !== postId));

        try {
            if (typeof window !== "undefined") {
                const allReports = JSON.parse(localStorage.getItem("reports") || "[]");
                const updated = allReports.map((r) => (r.postId === postId ? { ...r, status: "removed" } : r));
                localStorage.setItem("reports", JSON.stringify(updated));
                setReports(updated);
            }
        } catch (e) {
            console.error("Failed to update reports after post removal", e);
        }

        if (isDbBackedCommunity && communityInfo.id) {
            try {
                const res = await apiFetch(`/api/groups/${encodeURIComponent(communityInfo.id)}/posts/${encodeURIComponent(postId)}`, { 
                    method: "DELETE" 
                });
                if (!res.ok) {
                    console.error("Backend post deletion failed (DB not updated). Status:", res.status);
                } else {
                    alert("Post removed from the community and permanently deleted.");
                }
            } catch (e) {
                console.error("Failed to delete post from backend", e);
            }
        } else {
            alert("Post removed from the community (local only).");
        }
    };
    const handleCommunityInvite = async () => {
        try {
            const res = await fetch("/api/me");
            const data = await res.json();
            if (data?.user?.referralCode) {
                const link = `${window.location.origin}/auth/register?ref=${data.user.referralCode}&c=${communityInfo.id}`;
                navigator.clipboard.writeText(link);
                alert("Invite link copied to clipboard! When your friend signs up, you both get points, and they can join this community.");
            } else {
                alert("Please log in to generate an invite link.");
            }
        } catch (e) {
            console.error(e);
            alert("Error generating invite link.");
        }
    };

    const handleDeleteCommunityClick = async () => {
        if (typeof window !== "undefined" && !window.confirm(`Are you sure you want to delete the community "${communityInfo.name}"?`)) {
            return;
        }
        
        await handleDeleteCommunity(communityInfo);
    };

    const sortedAndFilteredPosts = React.useMemo(() => {
        let filtered = posts.filter((p) =>
            searchTerm
                ? (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.content && p.content.toLowerCase().includes(searchTerm.toLowerCase()))
                : true
        );

        // Always sort strictly chronologically for chat interface
        filtered.sort((a, b) => (a.createdAtMs || 0) - (b.createdAtMs || 0));
        
        return filtered;
    }, [posts, searchTerm]);

    const handleOpenEventDetails = (eventId) => {
        if (typeof window !== "undefined") {
            const currentOrigin = window.location.origin;
            const path = `/events?event=${eventId}`;
            window.location.href = `${currentOrigin}${path}`;
        } else {
            alert(`Open event ${eventId}`);
        }
    };

   const loadProfileByEmail = React.useCallback(
  async (email, initialPreview = null) => {
    if (!email) return null;

    try {
      const res = await apiFetch(
        `/api/users/by-email?email=${encodeURIComponent(email)}`,
        { method: "GET" }
      );

      if (!res.ok) return null;

      const data = await res.json();
      if (!data?.user) return null;

      const user = data.user;

      // ✅ 1️⃣ Update modal
      setSelectedProfileData(user);

      // ✅ 2️⃣ HARD backfill avatar into ALL posts
      setPosts((prev) =>
        prev.map((p) =>
          p.authorEmail === email
            ? {
                ...p,
                authorImage: user.avatar || p.authorImage,
                authorAvatar: user.avatar || p.authorAvatar,
              }
            : p
        )
      );

      return user;
    } catch (e) {
      console.error("loadProfileByEmail failed:", e);
      return null;
    }
  },
  []
);
// 🔥 AUTO ENRICH POST AUTHORS (NO CLICK REQUIRED)
React.useEffect(() => {
  if (!posts.length) return;

  posts.forEach((p) => {
    if (
  p.authorEmail &&
  !fetchedEmailsRef.current.has(p.authorEmail)
) {
      // 🔒 lock immediately (VERY IMPORTANT)
      fetchedEmailsRef.current.add(p.authorEmail);

      // 🔥 auto fetch
      loadProfileByEmail(p.authorEmail);
    }
  });
}, [posts, loadProfileByEmail]);

    if (selectedPost) {
        return (
            <CommentsPage
                post={selectedPost}
                communityInfo={communityInfo}
                onBack={() => setSelectedPost(null)}
                isDbBackedCommunity={isDbBackedCommunity}
                currentUserEmailFromParent={currentUserEmail}
                currentUserDisplayNameFromParent={currentUserDisplayName}
                currentUserAvatarFromParent={currentUserAvatar}
            />
        );
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                @media (min-width: 768px) {
                    main { padding-top: 0 !important; }
                    main > div { padding-left: 0 !important; padding-right: 0 !important; max-width: none !important; height: 100%; }
                }
            `}} />
            <div
                className="fixed inset-0 z-[100] bg-bg-4 md:relative md:inset-auto md:z-auto md:h-[calc(100vh-64px)] md:bg-transparent text-text-2 flex flex-col overflow-hidden"
                onClick={() => { if (menuOpenId) setMenuOpenId(null); }}
            >
            <div className="flex-1 overflow-y-auto" ref={scrollRef}>

            <ImagePreviewModal imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />

            {selectedProfileEmail && (
                <AuthorProfileModal
                    email={selectedProfileEmail}
                    userData={selectedProfileData}
                    onClose={() => { setSelectedProfileEmail(null); setSelectedProfileData(null); }}
                />
            )}

            {isModalOpen && (
                <CreatePostModal postType={postType} communityName={communityInfo.name} onClose={() => setIsModalOpen(false)} onSubmit={handleNewPost} />
            )}

            <div
                ref={topRef}
                className="sticky top-0 z-40 flex items-center justify-between px-4 py-2 bg-bg-2 cursor-pointer shadow-sm"
            >
                <div className="flex items-center gap-3">
                    <ArrowLeft className="w-6 h-6 cursor-pointer text-[#aebac1]" onClick={handleGoBack} /> 
                    {(communityInfo.iconUrl || communityInfo.image) ? (
                        <img 
                            src={communityInfo.iconUrl || communityInfo.image} 
                            alt={communityInfo.name} 
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-[#005c4b] flex items-center justify-center text-text-1 font-bold text-lg">
                            {communityInfo.name?.charAt(0)?.toUpperCase()}
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="font-semibold text-base text-text-2">{communityInfo.name}</span>
                        <span className="text-xs text-text-3">
                            {communityInfo.membersCount || 0} participants
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-[#aebac1]">
                    <UserPlus className="w-5 h-5 cursor-pointer hover:text-[#c084fc] transition-colors" onClick={(e) => { e.stopPropagation(); handleCommunityInvite(); }} title="Invite Friends" />
                    <Search className="w-5 h-5 cursor-pointer hover:text-text-1 transition-colors" onClick={(e) => { e.stopPropagation(); setSearchShown(!searchShown); }} title="Search" />
                </div>
            </div>

            {searchShown && (
                <div className="px-4 py-3 bg-bg-4 border-b border-border-2 flex items-center gap-3 shadow-sm animate-in slide-in-from-top-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                        <input
                            className="w-full bg-bg-3 pl-10 pr-4 py-2 rounded-full text-text-2 placeholder-gray-500 outline-none text-sm border border-border-1 focus:border-[#a855f7] transition-colors"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <button onClick={() => { setSearchShown(false); setSearchTerm(""); }} className="text-sm font-medium text-text-3 hover:text-text-1">Cancel</button>
                </div>
            )}

            {pinnedPostId && sortedAndFilteredPosts.find(p => p.id === pinnedPostId) && (
                <div className="bg-bg-3 border-b border-border-2 px-4 py-2 flex items-center justify-between cursor-pointer sticky top-0 z-30 shadow-md" onClick={() => {
                    const el = document.getElementById(`msg-${pinnedPostId}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Pin className="w-[14px] h-[14px] text-text-3 shrink-0" />
                        <div className="truncate text-[14px]">
                            <span className="font-semibold text-[#a855f7] mr-1">
                                {sortedAndFilteredPosts.find(p => p.id === pinnedPostId).authorEmail === currentUserEmail ? 'You:' : (sortedAndFilteredPosts.find(p => p.id === pinnedPostId).authorName || sortedAndFilteredPosts.find(p => p.id === pinnedPostId).author) + ':'}
                            </span>
                            <span className="text-text-2">{sortedAndFilteredPosts.find(p => p.id === pinnedPostId).content || sortedAndFilteredPosts.find(p => p.id === pinnedPostId).title}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2 p-4 min-h-full">
                {postsLoading ? (
                    <div className="flex justify-center p-8"><span className="w-8 h-8 rounded-full border-4 border-[#a855f7] border-t-transparent animate-spin"></span></div>
                ) : sortedAndFilteredPosts.length === 0 ? (
                    <div className="p-8 text-center text-text-4">No messages yet. Start the conversation!</div>
                ) : (
                    <div className="space-y-4">
                        {sortedAndFilteredPosts.slice().map((p, index) => {
                            const isNearBottom = index >= sortedAndFilteredPosts.length - 2;
                            const dropdownPositionClass = isNearBottom ? "bottom-6" : "top-6";
                            const isSelf = !!currentUserEmail && p.authorEmail === currentUserEmail;
                            const timeStr = p.createdAtMs ? new Date(p.createdAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : p.time;
                            
                            let displayContent = p.content || p.title;
                            let replyData = null;
                            if (p.content && p.content.startsWith('{"isReply":true')) {
                                try {
                                    const parsed = JSON.parse(p.content);
                                    replyData = parsed;
                                    displayContent = parsed.text;
                                } catch(e) {}
                            }
                            p.displayContent = displayContent; // save for replying to this later

                            const isMenuOpen = menuOpenId === p.id;

                            return (
                                <div key={p.id} id={`msg-${p.id}`} className={`flex ${isSelf ? 'justify-end' : 'justify-start'} group relative ${isMenuOpen ? 'z-50' : 'z-0'}`}>
                                    {!isSelf && (
                                        <Avatar 
                                            src={p.authorImage || p.authorAvatar} 
                                            alt={p.authorName || p.author}
                                            size={32}
                                            className="mr-2 self-end mb-1 cursor-pointer"
                                            onClick={() => { setSelectedProfileEmail(p.authorEmail); loadProfileByEmail(p.authorEmail); }}
                                        />
                                    )}
                                    <div className={`max-w-[85%] md:max-w-[70%] rounded-lg p-2 px-3 shadow-sm relative ${isSelf ? 'bg-bg-3 text-text-2 rounded-tr-none' : 'bg-bg-2 text-text-2 rounded-tl-none'}`}>
                                        {!isSelf && <div className="text-[13px] font-semibold text-[#53bdeb] mb-0.5">{p.authorName || p.author}</div>}
                                        
                                        {pinnedPostId === p.id && (
                                            <div className="absolute top-2 right-2 text-text-3">
                                                <Pin className="w-3 h-3" />
                                            </div>
                                        )}

                                        {/* Hover Chevron */}
                                        <div 
                                            className={`absolute top-1 right-2 ${isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} cursor-pointer text-text-3 hover:text-text-1 transition-opacity z-10 bg-gradient-to-l from-[#2a2a2a] to-transparent pl-2`}
                                            style={!isSelf ? { backgroundImage: 'linear-gradient(to left, #111111 50%, transparent)' } : {}}
                                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === p.id ? null : p.id); }}
                                        >
                                            <svg viewBox="0 0 19 20" width="19" height="20" className="fill-current"><path d="M3.8 6.7l5.7 5.7 5.7-5.7 1.6 1.6-7.3 7.2-7.3-7.2 1.6-1.6z"></path></svg>
                                        </div>
                                        
                                        {/* Dropdown Menu */}
                                        {menuOpenId === p.id && (
                                            <div className={`absolute ${dropdownPositionClass} ${isSelf ? 'right-2' : 'left-[calc(100%-28px)]'} z-50 bg-[#121212] rounded-xl shadow-2xl py-2 w-52 border border-[#222] overflow-hidden flex flex-col`}>
                                                <div className="flex items-center justify-around px-3 py-2 mb-1 border-b border-[#222]">
                                                    {["👍", "❤️", "😂", "😮", "😢", "🙏"].map(emoji => (
                                                        <span 
                                                            key={emoji} 
                                                            onClick={(e) => { e.stopPropagation(); handleReact(p.id, emoji); setMenuOpenId(null); }}
                                                            className="text-xl cursor-pointer hover:scale-125 transition-transform"
                                                        >
                                                            {emoji}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div 
                                                    className="px-4 py-2.5 hover:bg-bg-3 cursor-pointer text-[14px] font-medium text-text-2 transition-colors flex items-center gap-4"
                                                    onClick={(e) => { e.stopPropagation(); setReplyToMsg(p); setMenuOpenId(null); }}
                                                >
                                                    <CornerUpLeft className="w-[18px] h-[18px] text-text-3" />
                                                    Reply
                                                </div>
                                                <div 
                                                    className="px-4 py-2.5 hover:bg-bg-3 cursor-pointer text-[14px] font-medium text-text-2 transition-colors flex items-center gap-4"
                                                    onClick={(e) => { e.stopPropagation(); setPinnedPostId(pinnedPostId === p.id ? null : p.id); setMenuOpenId(null); }}
                                                >
                                                    <Pin className="w-[18px] h-[18px] text-text-3" />
                                                    {pinnedPostId === p.id ? 'Unpin' : 'Pin'}
                                                </div>
                                                {!isSelf && (
                                                    <div 
                                                        className="px-4 py-2.5 hover:bg-bg-3 cursor-pointer text-[14px] font-medium text-text-2 transition-colors flex items-center gap-4"
                                                        onClick={(e) => { e.stopPropagation(); handleReportPost(p, "Reported via chat menu"); setMenuOpenId(null); }}
                                                    >
                                                        <ThumbsDown className="w-[18px] h-[18px] text-text-3" />
                                                        Report
                                                    </div>
                                                )}
                                                {(isSelf || isAdmin) && (
                                                    <div 
                                                        className="px-4 py-2.5 hover:bg-bg-3 cursor-pointer text-[14px] font-medium text-text-2 transition-colors flex items-center gap-4"
                                                        onClick={(e) => { e.stopPropagation(); handleDeletePost(p.id); setMenuOpenId(null); }}
                                                    >
                                                        <Trash2 className="w-[18px] h-[18px] text-text-3" />
                                                        Delete
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Reply Quote Box */}
                                        {replyData && (
                                            <div className={`mb-1 p-2 rounded bg-black/20 border-l-4 ${isSelf ? 'border-[#53bdeb]' : 'border-[#a855f7]'}`}>
                                                <div className={`text-[12px] font-semibold ${isSelf ? 'text-[#53bdeb]' : 'text-[#a855f7]'} mb-0.5`}>{replyData.replyAuthor}</div>
                                                <div className="text-[13px] text-text-2 opacity-80 truncate">{replyData.replyText}</div>
                                            </div>
                                        )}

                                        {p.imageUrl && (
                                            <img src={p.imageUrl} alt="attached" className="rounded-lg mb-1 max-h-60 object-contain cursor-pointer" onClick={() => setPreviewImageUrl(p.imageUrl)} />
                                        )}
                                        {p.poll ? (
                                            <div className="min-w-[200px] sm:min-w-[250px] mb-2 pb-2 pr-12 relative z-0">
                                                <div className="font-bold text-[15px] mb-3 flex items-start gap-2">
                                                    <BarChart2 className="w-5 h-5 text-[#a855f7] shrink-0 mt-0.5" />
                                                    {p.poll.question}
                                                </div>
                                                <div className="space-y-2">
                                                    {p.poll.options.map((opt, i) => {
                                                        const totalVotes = p.poll.options.reduce((sum, o) => sum + (o.votes?.length || 0), 0);
                                                        const voteCount = opt.votes?.length || 0;
                                                        const percent = totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100);
                                                        const currentUserEmailLocal = currentUserEmail || getCurrentUserEmail();
                                                        const hasVoted = opt.votes?.includes(currentUserEmailLocal);

                                                        return (
                                                            <div 
                                                                key={i} 
                                                                onClick={(e) => { e.stopPropagation(); handleVotePoll(p.id, i); }}
                                                                className="relative bg-black/20 rounded-md overflow-hidden cursor-pointer hover:bg-black/30 transition-colors border border-border-1"
                                                            >
                                                                <div 
                                                                    className="absolute top-0 left-0 bottom-0 bg-[#c084fc]/30 transition-all duration-500"
                                                                    style={{ width: `${percent}%` }}
                                                                />
                                                                <div className="relative px-3 py-2 flex justify-between items-center z-10">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center shrink-0 ${hasVoted ? 'bg-[#c084fc] border-[#a855f7]' : ''}`}>
                                                                            {hasVoted && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                                        </div>
                                                                        <span className="text-[14px]">{opt.text}</span>
                                                                    </div>
                                                                    {totalVotes > 0 && <span className="text-[12px] text-text-2 font-medium">{percent}%</span>}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap text-[14.2px] leading-snug break-words pb-2 pr-16 relative z-0">
                                                {renderTextWithLinks(displayContent)}
                                            </p>
                                        )}

                                        {p.reactions && p.reactions.length > 0 && (
                                            <div className="mt-1 flex flex-wrap gap-1 pr-14 relative z-10">
                                                {p.reactions.map((r, idx) => {
                                                    const currentUserEmailLocal = currentUserEmail || getCurrentUserEmail();
                                                    const hasReacted = r.users.includes(currentUserEmailLocal);
                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            onClick={(e) => { e.stopPropagation(); handleReact(p.id, r.emoji); }}
                                                            className={`bg-black/30 rounded-full px-1.5 py-0.5 flex items-center gap-1 cursor-pointer hover:bg-black/50 text-[11px] ${hasReacted ? 'border border-[#a855f7]' : 'border border-transparent'}`}
                                                        >
                                                            <span>{r.emoji}</span>
                                                            <span className="text-text-3 font-medium">{r.users.length}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                        <div className="absolute bottom-1 right-2 flex items-center gap-1 z-0">
                                            <span className="text-[11px] text-text-3">{timeStr}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>
            </div> {/* End of scrollable area */}
            
            {/* STICKY CHAT INPUT */}
            <div className="flex-none bg-bg-2 z-50 relative">
                {selectedImagePreview && (
                    <div className="bg-bg-2 px-4 py-2 border-b border-border-3 relative flex justify-center">
                        <img src={selectedImagePreview} alt="Preview" className="h-24 object-contain rounded border border-border-1" />
                        <button onClick={handleClearImage} className="absolute top-3 right-4 bg-black/60 p-1 rounded-full text-text-1 hover:bg-black/80">
                            <svg viewBox="0 0 24 24" width="18" height="18" className="fill-current"><path d="M19.1 17.2l-5.3-5.3 5.3-5.3-1.8-1.8-5.3 5.3-5.3-5.3-1.8 1.8 5.3 5.3-5.3 5.3 1.8 1.8 5.3-5.3 5.3 5.3z"></path></svg>
                        </button>
                    </div>
                )}
                {replyToMsg && (
                    <div className="bg-bg-2 border-b border-border-3">
                        <div className="max-w-4xl mx-auto w-full px-4 py-2 flex items-center justify-between">
                            <div className="flex-1 border-l-4 border-[#a855f7] bg-bg-3 rounded p-2 mr-4 min-w-0">
                                <div className="text-[13px] font-semibold text-[#a855f7] mb-0.5">{replyToMsg.authorName || replyToMsg.author}</div>
                                <div className="text-[13px] text-text-2 truncate">{replyToMsg.displayContent}</div>
                            </div>
                            <button onClick={() => setReplyToMsg(null)} className="text-text-3 hover:text-[#d1d7db] p-1 flex-shrink-0">
                                <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current"><path d="M19.1 17.2l-5.3-5.3 5.3-5.3-1.8-1.8-5.3 5.3-5.3-5.3-1.8 1.8 5.3 5.3-5.3 5.3 1.8 1.8 5.3-5.3 5.3 5.3z"></path></svg>
                            </button>
                        </div>
                    </div>
                )}
                <div className="flex items-end gap-2 max-w-4xl mx-auto w-full px-2 py-2.5">
                    <div className="flex items-center gap-1 shrink-0 pb-1.5 pl-1">
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageSelect} />
                        <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-text-3 hover:text-[#d1d7db] transition-colors">
                            <ImageIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => setIsPollModalOpen(true)} className="p-1.5 text-text-3 hover:text-[#d1d7db] transition-colors" title="Create Poll">
                            <BarChart2 className="w-6 h-6" />
                        </button>
                    </div>
                    <textarea 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendChat();
                            }
                        }}
                        placeholder="Type a message"
                        className="flex-1 bg-bg-3 border border-border-1 text-text-2 rounded-lg px-4 py-2.5 min-h-[44px] max-h-32 outline-none resize-none overflow-y-auto text-[15px]"
                        rows="1"
                    />
                    <button 
                        onClick={handleSendChat}
                        disabled={!chatInput.trim()}
                        className={`p-2 rounded-full transition-colors flex items-center justify-center w-11 h-11 shrink-0 ${chatInput.trim() ? 'bg-[#c084fc] text-[#111b21] hover:bg-[#a855f7]' : 'bg-transparent text-text-3'}`}
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        {/* Poll Modal */}
        {isPollModalOpen && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                <div className="bg-bg-2 border border-border-1 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                    <button onClick={() => setIsPollModalOpen(false)} className="absolute top-4 right-4 text-text-3 hover:text-[#d1d7db]">
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold text-text-2 mb-6">Create Poll</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-3 mb-2">Question</label>
                            <input 
                                type="text" 
                                value={pollQuestion}
                                onChange={(e) => setPollQuestion(e.target.value)}
                                className="w-full bg-bg-3 border border-border-1 rounded-lg px-4 py-2.5 text-text-2 outline-none focus:border-[#a855f7]"
                                placeholder="Ask a question..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-3 mb-2">Options</label>
                            <div className="space-y-3">
                                {pollOptions.map((opt, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...pollOptions];
                                                newOpts[i] = e.target.value;
                                                setPollOptions(newOpts);
                                            }}
                                            className="flex-1 bg-bg-3 border border-border-1 rounded-lg px-4 py-2.5 text-text-2 outline-none focus:border-[#a855f7]"
                                            placeholder={`Option ${i + 1}`}
                                        />
                                        {pollOptions.length > 2 && (
                                            <button onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:text-red-300">
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {pollOptions.length < 10 && (
                                <button 
                                    onClick={() => setPollOptions([...pollOptions, ""])}
                                    className="mt-3 text-sm text-[#a855f7] hover:text-purple-400 font-medium flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Add Option
                                </button>
                            )}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-1">
                                <input
                                    type="checkbox"
                                    id="multiSelectToggle"
                                    checked={isMultiSelect}
                                    onChange={(e) => setIsMultiSelect(e.target.checked)}
                                    className="w-4 h-4 rounded border-border-1 accent-[#c084fc] bg-bg-3 cursor-pointer"
                                />
                                <label htmlFor="multiSelectToggle" className="text-sm text-text-3 select-none cursor-pointer hover:text-[#d1d7db] transition-colors">
                                    Allow multiple answers
                                </label>
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <button onClick={() => setIsPollModalOpen(false)} className="px-5 py-2 text-text-2 hover:bg-bg-3 rounded-full font-medium transition-colors">
                                Cancel
                            </button>
                            <button 
                                onClick={handleCreatePoll}
                                disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2}
                                className="px-5 py-2 bg-[#c084fc] text-[#111b21] rounded-full font-bold hover:bg-[#a855f7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send Poll
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}