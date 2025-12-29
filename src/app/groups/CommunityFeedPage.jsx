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
        notifications.forEach((n) => {
            if (!n || !n.targetEmail) return;
            const list = notifStore[n.targetEmail] || [];
            notifStore[n.targetEmail] = [n, ...list];
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

// helper: convert File -> data URL (base64)
const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result); // "data:image/..;base64,...."
        fr.onerror = (err) => reject(err);
        fr.readAsDataURL(file);
    });

// --------------------
// Avatar component (fixes scaling / fallback)
const Avatar = ({ src, alt, size = 40, className = "" }) => {
    const [loaded, setLoaded] = React.useState(null); // null = unknown, true = ok, false = failed

    React.useEffect(() => {
        if (!src) {
            setLoaded(false);
            return;
        }
        let mounted = true;
        const img = new Image();
        img.onload = () => mounted && setLoaded(true);
        img.onerror = () => mounted && setLoaded(false);
        img.src = src;
        return () => {
            mounted = false;
        };
    }, [src]);
  
    const px = typeof size === "number" ? `${size}px` : size;

    if (loaded === true) {
        return (
            <div
                className={`rounded-full overflow-hidden bg-center bg-no-repeat ${className}`}
                style={{
                    width: px,
                    height: px,
                    backgroundImage: `url(${src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
                aria-label={alt || "avatar"}
                role="img"
            />
        );
    }

    // fallback placeholder circle with initial
    const initial = (alt && alt[0] ? alt[0].toUpperCase() : "U");
    return (
        <div
            className={`rounded-full flex items-center justify-center bg-gray-800 text-white font-semibold ${className}`}
            style={{ width: px, height: px }}
            aria-label={alt || "avatar-placeholder"}
        >
            {initial}
        </div>
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
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md"
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
    }
);
PostOptionsMenu.displayName = "PostOptionsMenu";

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
// create post modal form with image upload and preview
const CreatePostModal = ({ communityName, onClose, onSubmit }) => {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [imageFile, setImageFile] = React.useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState(null);

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
    if (!title.trim()) return;
    await onSubmit({
      title: title.trim(),
      content: content.trim(),
      imageFile,
      imagePreviewUrl,
    });
    onClose();
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/70
        flex items-end sm:items-center justify-center
        px-3 pb-4 pt-12
      "
    >
      {/* FLOATING CARD */}
      <div
        className="
          w-full sm:max-w-xl
          bg-[#0d0d0d]
          rounded-2xl
          shadow-2xl
          flex flex-col
          /* FIX: Ensure the modal doesn't exceed the viewport and hides overflow */
          max-h-[90svh] 
          overflow-hidden
        "
      >
        {/* HEADER - added flex-none */}
        <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Create post</h2>
            <p className="text-xs text-gray-400">
              Posting in <span className="text-purple-400">{communityName}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* BODY - scrollable area */}
        <div
          className="
            flex-1 overflow-y-auto
            px-4 py-4 space-y-4
            overscroll-contain
          "
        >
          {/* TITLE */}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="
              w-full bg-transparent
              text-white
              placeholder-gray-500
              border-b border-gray-700
              pb-2
              focus:outline-none focus:border-purple-500
            "
          />

          {/* CONTENT */}
         <textarea
  placeholder="What do you want to share?"
  value={content}
  onChange={(e) => setContent(e.target.value)}
  rows={6}
  className="
    w-full bg-transparent
    bg-[#0f172a]
    text-white
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
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* FOOTER - added flex-none to prevent shrinking */}
        <div
          className="
            flex-none
            px-4 py-3
            border-t border-gray-800
            flex items-center gap-3
            bg-[#0d0d0d]
          "
          style={{ 
            /* Added a fallback padding for browsers/devices where env is 0 */
            paddingBottom: "max(1rem, env(safe-area-inset-bottom))" 
          }}
        >
          <label
            htmlFor="post-image"
            className="p-2 rounded-full hover:bg-gray-800 cursor-pointer"
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
            disabled={!title.trim()}
            className="
              ml-auto
              px-6 py-2 rounded-full
              font-semibold
              bg-purple-600 text-white
              disabled:bg-gray-700 disabled:text-gray-400
              transition active:scale-95
            "
          >
            Post
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
    fixed left-1/2 bottom-6 -translate-x-1/2
    sm:absolute sm:right-0 sm:top-10 sm:left-auto sm:bottom-auto sm:translate-x-0
  "
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
// Author Profile Modal (new)
const AuthorProfileModal = ({ email, onClose, userData }) => {
    if (!email && !userData) return null;
    const u = userData || {};
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div className="bg-[#0d0d0d] rounded-lg max-w-sm w-full p-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-4">
                    <Avatar src={u?.avatar || u?.avatarUrl || u?.avatarUrlFull || u?.avatar || u?.avatarUrl} alt={u?.displayName || u?.email || "User"} size={72} className="" />
                    <div>
                        <h3 className="text-lg font-bold text-white">{u?.displayName || deriveNameFromEmail(email)}</h3>
                        <p className="text-sm text-gray-400">{u?.email || email}</p>
                    </div>
                </div>

                {u?.bio && <p className="mt-3 text-sm text-gray-300">{u.bio}</p>}

                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="px-3 py-2 rounded-md bg-gray-800 text-white">Close</button>
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
    isSiteOwner,
    onDeleteCommunity,
}) => {
    const [isInviteMenuOpen, setIsInviteMenuOpen] = React.useState(false);
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
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isInviteMenuOpen]);

    const membersLabel = community.members
        ? community.members
            .toString()
            .toLowerCase()
            .includes("member")
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
                    communitySlug={community.slug}
                    onClose={() => setIsInviteMenuOpen(false)}
                />
            )}
        </div>
    );

    return (
        <div className="mb-6">
            <div className="relative w-full">
                <div className="h-24 sm:h-32 w-full overflow-hidden bg-gray-800">
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

                <div className="bg-[#0d0d0d] px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4 text-white">
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
                       <p className="text-xs sm:text-sm text-white">
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
<div className="relative sm:hidden">
  <button
    ref={inviteButtonRef}
    onClick={() => setIsInviteMenuOpen((prev) => !prev)}
    className="flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-300"
  >
    <UserPlus className="w-4 h-4 mr-1" />
    Invite
  </button>

 {isInviteMenuOpen && (
  <>
    {/* Backdrop – click anywhere to close */}
    <div
      className="fixed inset-0 z-40"
      onClick={() => setIsInviteMenuOpen(false)}
    />

    {/* Invite Menu */}
    <InviteMenu
      ref={inviteMenuRef}
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


                        {isSiteOwner && (
                            <button
                                onClick={onDeleteCommunity}
                                className="ml-2 flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-red-700 text-white hover:bg-red-600"
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
                    <p className="text-sm text-gray-300">{community.description}</p>
                </div>
            )}
        </div>
    );
};

// --------------------
// Filter Bar
// --------------------
const FilterBar = ({ selected, setActiveFilter, eventsCount = 0 }) => (
    <div className="flex space-x-2 px-4 py-3 bg-[#0d0d0d] border-b border-gray-800">
        {["Hot", "New"].map((f) => (
            <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selected === f
                        ? "bg-purple-600 text-white"
                        : "bg-gray-900 text-gray-300 hover:bg-gray-800"
                }`}
            >
                {f}
            </button>
        ))}

        <button
            onClick={() => setActiveFilter("Events")}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selected === "Events"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-900 text-gray-300 hover:bg-gray-800"
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
    const author =
        comment.authorName ||
        comment.authorDisplayName ||
        (comment.authorEmail ? comment.authorEmail.split("@")[0] : "Unknown");

    return {
        id: comment._id || comment.id,
        author,
        authorEmail: comment.authorEmail || null,
        authorImage: comment.authorImage || comment.authorAvatar || null,
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
        (comment.authorEmail && currentUserEmail && comment.authorEmail === currentUserEmail)
            ? (currentUserAvatar || comment.authorImage)
            : comment.authorImage ||
            comment.authorAvatar ||
            (comment.authorEmail
                ? `https://avatars.dicebear.com/api/initials/${encodeURIComponent(
                    comment.author
                )}.svg`
                : null);

    return (
        <div className="flex">
            <div className="flex-shrink-0 mt-1">
                <Avatar src={avatarSrc} alt={comment.author} size={32} className="" />
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
        if (!trimmed) return;
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
                return;
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
  <p
    className="
      text-gray-300 text-sm mt-2
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
                    <div className="p-4 text-center text-gray-500 text-sm">Loading comments...</div>
                )}

                {topLevelComments.map((c) => (
                    <div key={c.id} className="px-4 py-3 border-b border-gray-800">
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
                    <div className="p-4 text-center text-gray-500">Be the first to comment!</div>
                )}
            </div>

            <div
  role="region"
  aria-label="Comment input"
  className="
    fixed bottom-0 z-50 bg-[#0d0d0d] border-t border-gray-800 shadow-2xl
    left-0 w-full
    sm:left-[250px] sm:w-[calc(100%-250px-360px)]
  "
>

                <div className="p-4">
                    {replyingTo && (
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-2 p-2 bg-gray-800 rounded">
                            <span>Replying to {replyingTo.author}</span>
                            <button onClick={() => setReplyingTo(null)} className="text-white hover:text-purple-300 ml-2 transition-colors">
                                <X className="w-3 h-3 inline" /> Cancel
                            </button>
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleCommentSubmit();
                                }
                            }}
                            placeholder={replyingTo ? "Write your reply..." : "Add a comment..."}
                            className="flex-1 bg-gray-800 px-4 py-2 rounded-full text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-600 h-10 transition-shadow"
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
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen, onToggleMenu]);

    const format = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : n);

    // safe author label: prefer current user's display name when emails match
    const authorLabel =
        post.authorEmail && currentUserEmail && post.authorEmail === currentUserEmail
            ? currentUserDisplayName || post.author || deriveNameFromEmail(post.authorEmail)
            : post.author || (post.authorEmail ? deriveNameFromEmail(post.authorEmail) : "Unknown");

    // pick avatar from available fields with fallbacks
    let avatarSrc;
    if (currentUserEmail && post.authorEmail && post.authorEmail === currentUserEmail) {
        // always show Topbar/current user's exact avatar for their own posts
        avatarSrc = currentUserAvatar || post.authorImage || post.authorAvatar || post.authorImageUrl || null;
    } else {
        avatarSrc =
            post.authorImage ||
            post.authorAvatar ||
            post.authorImageUrl ||
            post.authorProfilePic ||
            (post.authorEmail
                ? `https://avatars.dicebear.com/api/initials/${encodeURIComponent(
                    authorLabel
                )}.svg`
                : "https://picsum.photos/seed/community-user/50/50");
    }
    
    const handleUpvoteClick = () => {
        if (typeof onVote === 'function') {
            onVote(post.id, 1);
        }
    };

    return (
        <div className="p-4 mb-4 mx-4">
            <div className="flex justify-between relative">
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            if (!onAuthorClick) return;
                            const fallbackEmail = post.authorEmail || `${encodeURIComponent(authorLabel)}@local`;
                            const preview = { displayName: authorLabel, avatar: avatarSrc, email: post.authorEmail || fallbackEmail };
                            onAuthorClick(fallbackEmail, post.authorId, preview);
                        }}
                        className="flex items-center gap-2 focus:outline-none"
                        title={`View ${authorLabel}'s profile`}
                    >
                        <Avatar src={avatarSrc} alt={authorLabel} size={24} className="mr-2 flex-shrink-0" />
                        <div className="text-left">
                            <div className="text-sm text-white font-semibold">{authorLabel}</div>
                            <div className="text-xs text-gray-400">Posted by {authorLabel} · {post.time}</div>
                        </div>
                    </button>
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
                        onReport={onReport}
                        isAdmin={isAdmin}
                        onAdminRemove={onAdminRemove}
                        canDeleteSelf={canDeleteSelf}
                        onDeleteSelf={onDeleteSelf}
                    />
                )}
            </div>

            <h3 className="text-white text-lg font-bold mt-3 cursor-pointer transition-colors" onClick={() => onCommentsClick(post)}>
                {post.title}
            </h3>

            {post.content && (
  <p
    className="
      text-gray-300 text-sm mt-2
      whitespace-pre-wrap
      leading-relaxed
      line-clamp-3
    "
  >
    {post.content}
  </p>
)}


            {post.hasImage && post.imageUrl && (
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
    ? "text-purple-500"
    : "text-gray-400 hover:text-white"
}`}
                    >
                        <ArrowUp
  className={`w-4 h-4 mr-1 transition-colors ${
    post.userVote === 1 ? "text-purple-500" : "text-gray-400"
  }`}
/>
                        <span className={`font-semibold ${post.userVote === 1 ? "text-white" : "text-gray-300"}`}>
                            {format(post.upvotes)}
                        </span>
                    </div>
                </div>

                <button className="flex items-center text-gray-400 cursor-pointer transition-colors p-1" onClick={() => onCommentsClick(post)}>
                    <MessageSquare className="w-5 h-5 mr-2" />
                    <span className="font-semibold">{post.comments} Comments</span>
                </button>
            </div>
        </div>
    );
};

// --------------------
// Event list item
// --------------------
const EventListItem = ({ event, onOpenDetails }) => {
    return (
        <div className="flex items-start gap-4 p-4 border-b border-gray-800">
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
                <h4 className="text-white font-bold text-lg cursor-pointer" onClick={() => onOpenDetails(event.id)}>
                    {event.title}
                </h4>
                <div className="text-sm text-gray-400 mt-1 flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span>{event.venue || "Online"}</span>
                    <span>•</span>
                    <span>{event.date || "TBA"}</span>
                </div>
                <div className="mt-2 text-xs text-gray-300 flex items-center gap-2">
                    {event.tags && event.tags.map((t, i) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-gray-800 text-gray-300">{t}</span>
                    ))}
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
                <button onClick={() => onOpenDetails(event.id)} className="bg-purple-600 text-white px-3 py-1.5 rounded-full text-sm">View</button>
                <div className="text-xs text-gray-400">{event.impressions ? `${event.impressions.toLocaleString()} views` : ""}</div>
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
    const candidateAuthorImage =
        post.authorImage || post.authorAvatar || post.authorImageUrl || null;
    const absAuthorImage = candidateAuthorImage ? makeAbsoluteUrl(candidateAuthorImage) : null;

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
        hasImage: !!absImageUrl,
        imageUrl: absImageUrl,
        userVote: post.userVote || 0,
        createdAtMs: createdAt ? createdAt.getTime() : Date.now(),
        authorDisplayName: post.authorDisplayName || null,
        authorName: post.authorName || null,
        authorUsername: post.authorUsername || null,
    };
};

// --------------------
// MAIN FEED PAGE (Client Component)
// --------------------
export default function CommunityFeedPage({ community }) {
    // Use the custom hook for Twitter-like scroll behavior
   const scrollRef = React.useRef(null);
const showFab = useScrollDirection(scrollRef);

  
    
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

    const handleDeleteCommunity = async (communityInfo) => {
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
            <div className="min-h-screen bg-[#0d0d0d] text-white p-4">
                <button onClick={handleGoBack} className="text-gray-400 hover:text-white mb-4 flex items-center">
                    <ArrowLeft className="w-6 h-6 mr-2" /> Back to Explore
                </button>
                <h1 className="text-xl font-bold text-red-500">Error: Community data missing.</h1>
                <p className="text-gray-400">Please ensure the community object is passed correctly to CommunityFeedPage.</p>
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
    const [selectedPost, setSelectedPost] = React.useState(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [previewImageUrl, setPreviewImageUrl] = React.useState(null);
    const [reports, setReports] = React.useState([]);
    const [currentUser, setCurrentUser] = React.useState(null);

    const [selectedProfileEmail, setSelectedProfileEmail] = React.useState(null);
    const [selectedProfileData, setSelectedProfileData] = React.useState(null);
    const [profileLoading, setProfileLoading] = React.useState(false);

    const topRef = React.useRef(null);

    const USER_LOOKUP_BY_ID = "/api/users";
    const USER_LOOKUP_BY_EMAIL = "/api/users";

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

    const enrichAuthors = React.useCallback(async (postsArray) => {
        if (!postsArray || postsArray.length === 0) return;
        const ids = new Set();
        const emails = new Set();

        postsArray.forEach((p) => {
            if (p.authorId) ids.add(String(p.authorId));
            if (p.authorEmail) emails.add(String(p.authorEmail));
        });

        const idList = Array.from(ids);
        const emailList = Array.from(emails);
        if (idList.length === 0 && emailList.length === 0) return;

        const fetchById = async (id) => {
            try {
                const res = await apiFetch(`${USER_LOOKUP_BY_ID}/${encodeURIComponent(id)}`, { method: "GET" });
                if (!res.ok) return null;
                const data = await res.json().catch(() => null);
                return data && data.user ? data.user : null;
            } catch (e) { return null; }
        };

        const fetchByEmail = async (email) => {
            try {
                const qRes = await apiFetch(`${USER_LOOKUP_BY_EMAIL}?email=${encodeURIComponent(email)}`, { method: "GET" });
                if (qRes.ok) {
                    const qData = await qRes.json().catch(() => null);
                    if (qData && data.user) return qData.user;
                    if (qData && Array.isArray(qData.users) && qData.users.length > 0) return qData.users[0];
                }
            } catch (e) {}
            try {
                const pRes = await apiFetch(`${USER_LOOKUP_BY_EMAIL}/by-email/${encodeURIComponent(email)}`, { method: "GET" });
                if (pRes.ok) {
                    const pData = await pRes.json().catch(() => null);
                    if (pData && pData.user) return pData.user;
                }
            } catch (e) {}
            return null;
        };

        try {
            const idFetches = idList.map((id) => fetchById(id));
            const emailFetches = emailList.map((em) => fetchByEmail(em));
            const idResults = await Promise.all(idFetches);
            const emailResults = await Promise.all(emailFetches);

            const idMap = {};
            idList.forEach((id, idx) => {
                const u = idResults[idx];
                if (u) idMap[String(id)] = u;
            });

            const emailMap = {};
            emailList.forEach((em, idx) => {
                const u = emailResults[idx];
                if (u) emailMap[String(em)] = u;
            });

            const updated = postsArray.map((p) => {
                let name = p.author;
                if ((!name || name === "" || name === "Unknown" || name === "User") && p.authorId) {
                    const u = idMap[String(p.authorId)];
                    if (u && (u.displayName || u.name || u.username)) name = u.displayName || u.name || u.username;
                }
                if ((!name || name === "" || name === "Unknown" || name === "User") && p.authorEmail) {
                    const u = emailMap[String(p.authorEmail)];
                    if (u && (u.displayName || u.name || u.username)) name = u.displayName || u.name || u.username;
                }
                if (!name || name === "" || name === "Unknown") {
                    if (p.authorEmail) name = deriveNameFromEmail(p.authorEmail);
                }

                let authorImage = p.authorImage || p.authorAvatar || p.authorImageUrl || null;
                if ((!authorImage || authorImage === "") && p.authorId) {
                    const u = idMap[String(p.authorId)];
                    if (u && u.avatar) authorImage = u.avatar;
                }
                if ((!authorImage || authorImage === "") && p.authorEmail) {
                    const u = emailMap[String(p.authorEmail)];
                    if (u && u.avatar) authorImage = u.avatar;
                }

                if (!authorImage) {
                    authorImage = p.authorEmail
                        ? `https://avatars.dicebear.com/api/initials/${encodeURIComponent(name || deriveNameFromEmail(p.authorEmail))}.svg`
                        : "https://picsum.photos/seed/community-user/50/50";
                }

                const absAuthorImage = authorImage ? makeAbsoluteUrl(authorImage) : authorImage;

                if (p.authorEmail && currentUserEmail && p.authorEmail === currentUserEmail) {
                    return {
                        ...p,
                        author: currentUserDisplayName || (name || deriveNameFromEmail(p.authorEmail)),
                        authorImage: currentUserAvatar || absAuthorImage,
                    };
                }

                return {
                    ...p,
                    author: name || (p.authorEmail ? deriveNameFromEmail(p.authorEmail) : "Unknown"),
                    authorImage: absAuthorImage,
                };
            });

            setPosts((prev) => {
                const map = new Map(prev.map((x) => [String(x.id), x]));
                updated.forEach((u) => map.set(String(u.id), { ...(map.get(String(u.id)) || {}), ...u }));
                return Array.from(map.values());
            });
        } catch (e) {
            console.error("Failed to enrich authors:", e);
        }
    }, [USER_LOOKUP_BY_ID, USER_LOOKUP_BY_EMAIL, currentUserEmail, currentUserDisplayName, currentUserAvatar]);

    React.useEffect(() => {
        if (!isDbBackedCommunity || !communityInfo.id) return;
        async function loadPosts() {
            try {
                const res = await apiFetch(`/api/groups/${encodeURIComponent(communityInfo.id)}/posts`, { method: "GET" });
                if (!res.ok) {
                    console.error("Failed to load posts for", communityInfo.id, res.status);
                    return;
                }
                const data = await res.json();
                const postsFromDb = Array.isArray(data.posts) ? data.posts : [];
                const mapped = postsFromDb.map((p) => mapBackendPostToFrontend(p, communityInfo));
                setPosts(mapped);
                enrichAuthors(mapped);
            } catch (e) {
                console.error("Error loading posts", e);
            }
        }
        loadPosts();
    }, [isDbBackedCommunity, communityInfo.id, enrichAuthors]);

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
                imageUrl: post.imageUrl ? makeAbsoluteUrl(post.imageUrl) : null,
                authorImage: post.authorImage ? makeAbsoluteUrl(post.authorImage) : null,
            };

            const mapped = mapBackendPostToFrontend(normalized, communityInfo);
            setPosts((prev) => [mapped, ...prev]);
            enrichAuthors([mapped]);
        } catch (e) {
            console.error("Failed to create post", e);
            alert("Something went wrong while creating the post.");
        }
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

        switch (activeFilter) {
            case "Hot":
                filtered.sort((a, b) => b.upvotes - a.upvotes);
                break;
            case "New":
                filtered.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
                break;
            case "Events":
                break;
            default:
                filtered.sort((a, b) => b.upvotes - a.upvotes);
        }
        return filtered;
    }, [posts, searchTerm, activeFilter]);

    const handleOpenEventDetails = (eventId) => {
        if (typeof window !== "undefined") {
            const currentOrigin = window.location.origin;
            const path = `/events?event=${eventId}`;
            window.location.href = `${currentOrigin}${path}`;
        } else {
            alert(`Open event ${eventId}`);
        }
    };

    const loadProfileByEmail = React.useCallback(async (email, initialPreview = null) => {
        if (!email) return null;
        if (initialPreview) setSelectedProfileData(initialPreview);
        setProfileLoading(true);
        try {
            let user = null;
            try {
                const res = await apiFetch(`${USER_LOOKUP_BY_EMAIL}?email=${encodeURIComponent(email)}`, { method: "GET" });
                if (res.ok) {
                    const data = await res.json().catch(() => null);
                    if (data && (data.user || (Array.isArray(data.users) && data.users[0]))) {
                        user = data.user || (data.users && data.users[0]);
                    }
                }
            } catch (e) {}

            if (!user) {
                try {
                    const snap = getCurrentUserSnapshotFromLocalStorage();
                    if (snap && snap.email === email) user = snap;
                    else {
                        const found = posts.find((p) => p.authorEmail === email);
                        if (found) {
                            user = {
                                displayName: found.author,
                                avatar: found.authorImage,
                                email: found.authorEmail,
                            };
                        }
                    }
                } catch (e) {}
            }

            if (!user) {
                user = {
                    displayName: deriveNameFromEmail(email),
                    email,
                    avatar: `https://avatars.dicebear.com/api/initials/${encodeURIComponent(deriveNameFromEmail(email))}.svg`,
                };
            }

            setSelectedProfileData(user);
            return user;
        } finally {
            setProfileLoading(false);
        }
    }, [posts]);

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
        <div
  ref={scrollRef}
  className="h-screen bg-[#0d0d0d] text-white overflow-y-auto"

>

            
            {/* Mobile Twitter-style FAB - Fixed with proper hide/show */}
            <div className={`fixed bottom-20 right-4 z-50 sm:hidden transition-all duration-300 ease-in-out ${
                showFab ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}>
                <button
  onClick={() => setIsModalOpen(true)}
  className="
    w-13 h-13 
    rounded-full
    bg-purple-600
    text-white
    flex items-center justify-center
    shadow-lg sm:shadow-xl
    hover:bg-purple-700
    active:scale-95
    ring-1 sm:ring-2 ring-purple-400/30
    transition-transform duration-200
    fixed bottom-0 right-2 sm:right-4

  "
  aria-label="Create Post"
>
  <Plus className="w-5 h-5 sm:w-7 sm:h-7" />
</button>

            </div>

            <ImagePreviewModal imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />

            {selectedProfileEmail && (
                <AuthorProfileModal
                    email={selectedProfileEmail}
                    userData={selectedProfileData}
                    onClose={() => { setSelectedProfileEmail(null); setSelectedProfileData(null); }}
                />
            )}

            {isModalOpen && (
                <CreatePostModal communityName={communityInfo.name} onClose={() => setIsModalOpen(false)} onSubmit={handleNewPost} />
            )}

            <div
                ref={topRef}
                className="flex items-center justify-between px-4 pt-0 pb-4 bg-[#0d0d0d] border-b border-gray-800"
            >

                <ArrowLeft className="w-6 h-6 cursor-pointer text-gray-400 hover:text-white" onClick={handleGoBack} /> 
                <div className="flex-1 text-center" />
                <Search className="w-6 h-6 cursor-pointer text-gray-400 hover:text-white" onClick={() => setSearchShown(!searchShown)} />
            </div>

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

            <CommunityHeader community={communityInfo} onCreatePost={() => setIsModalOpen(true)} isSiteOwner={isSiteOwner} onDeleteCommunity={handleDeleteCommunityClick} />

            <FilterBar selected={activeFilter} setActiveFilter={setActiveFilter} eventsCount={eventsInCategory.length} />

            <div className="pt-4 pb-12">
                {activeFilter === "Events" ? (
                    <div className="max-w-4xl mx-auto">
                        <div className="px-4">
                            <h2 className="text-2xl font-bold mb-4">Events in {communityInfo.category || communityInfo.name}</h2>
                        </div>

                        {eventsInCategory.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No events found for this category.</div>
                        ) : (
                            <div className="bg-[#0d0d0d] divide-y divide-gray-800 rounded-lg overflow-hidden">
                                {eventsInCategory.map((ev) => (
                                    <EventListItem key={ev.id} event={ev} onOpenDetails={handleOpenEventDetails} />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {sortedAndFilteredPosts.map((p) => {
                            const canDeleteSelf = !!currentUserEmail && p.authorEmail && p.authorEmail === currentUserEmail;
                            return (
                                <PostCard
                                    key={p.id}
                                    post={p}
                                    openMenuId={openMenuId}
                                    onToggleMenu={setOpenMenuId}
                                    onCommentsClick={(post) => setSelectedPost(post)}
                                    onImageClick={setPreviewImageUrl}
                                    onHidePost={handleHidePost}
                                    onReport={handleReportPost}
                                    isAdmin={isAdmin}
                                    onAdminRemove={handleAdminRemovePost}
                                    canDeleteSelf={canDeleteSelf}
                                    onDeleteSelf={(postId) => handleAdminRemovePost(postId)}
                                    onAuthorClick={async (email, authorId, preview) => {
                                        const chosenEmail = email; 
                                        setSelectedProfileEmail(chosenEmail);
                                        if (preview) setSelectedProfileData(preview);
                                        await loadProfileByEmail(chosenEmail, preview || null);
                                    }}
                                    currentUserAvatar={currentUserAvatar}
                                    currentUserEmail={currentUserEmail}
                                    currentUserDisplayName={currentUserDisplayName}
                                    onVote={vote}
                                />
                            );
                        })}

                        {sortedAndFilteredPosts.length === 0 && <div className="p-8 text-center text-gray-500">No posts found matching your criteria.</div>}
                    </>
                )}
            </div>
        </div>
    );
}