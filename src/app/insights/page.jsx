// "use client";
// import {
//   ThumbsUp,
//   MessageSquare,
//   Share2,
//   MoreVertical,
//   Send,
//   ArrowLeft,
// } from "lucide-react";
// import { useState, useRef, useEffect } from "react";

// /*
//   Updates:
//   - Menu now only includes "Report Post"
//   - Report modal (choose reason) -> submit (client-side)
//   - Only one like allowed per user across all posts (liking a new post removes previous like)
//   - Prevent multiple reports for the same post by this user (tracked locally)
// */

// const initialInsights = [
//   {
//     id: 1,
//     author: "Shubham Singh",
//     avatar: "https://placehold.co/40x40/fca5a5/262626?text=SS",
//     time: "21/09/2025 at 00:40",
//     title: "Web3: Hype or the Next Step?",
//     content:
//       "When people talk about Web3, I see it as just the next step in how the internet is evolving.\n\nIn simple terms: Web3 shifts control from centralized platforms to protocols and users. The promise is ownership of data, composable money, and programmable trust. But there are real UX, scale and regulation hurdles. Adoption will depend on solving those problems while keeping the experience intuitive for normal users. Longer paragraph text to demonstrate Show More / Show Less behavior. Add a few more sentences so that it overflows the clamp and we can test the button. This should be enough to demonstrate the multi-line clamp + show more flow.",
//     image: null,
//     likes: 12,
//     comments: 3,
//     commentList: [
//       {
//         id: 101,
//         author: "Rounit Srivastava",
//         avatar: "https://placehold.co/40x40/fff/000?text=R",
//         time: "06/09/2025 at 23:31",
//         content:
//           "I don’t think Web3 is a full revolution just yet but it does feel like a step in the right direction...",
//       },
//       {
//         id: 102,
//         author: "Amit S.",
//         avatar: "https://placehold.co/40x40/fff/000?text=A",
//         time: "07/09/2025 at 08:41",
//         content: "Agree with you — it's experimental but promising for ownership of data.",
//       },
//       {
//         id: 103,
//         author: "Priya J.",
//         avatar: "https://placehold.co/40x40/fff/000?text=P",
//         time: "07/09/2025 at 10:12",
//         content: "Curious how UX will evolve for mainstream users.",
//       },
//     ],
//   },
// ];

// const CommentRow = ({ c }) => (
//   <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 flex gap-3 items-start">
//     <img src={c.avatar} className="w-10 h-10 rounded-full" alt={c.author} />
//     <div>
//       <div className="flex items-center gap-2 mb-1">
//         <span className="text-white font-semibold text-sm">{c.author}</span>
//         <span className="text-xs text-gray-400">{c.time}</span>
//       </div>
//       <p className="text-gray-300 text-sm leading-relaxed">{c.content}</p>
//     </div>
//   </div>
// );

// export default function InsightsPage() {
//   const [insights, setInsights] = useState(initialInsights);

//   // SINGLE-like logic: store likedPostId (null if none)
//   const [likedPostId, setLikedPostId] = useState(null);

//   // comments / UI
//   const [showCommentsId, setShowCommentsId] = useState(null);
//   const [textMap, setTextMap] = useState({});
//   const [expandedPosts, setExpandedPosts] = useState(new Set());

//   // three-dot menu
//   const [openMenuId, setOpenMenuId] = useState(null);
//   const menuRefs = useRef({});

//   // report modal
//   const [reportModal, setReportModal] = useState({ open: false, postId: null });
//   const [reportReason, setReportReason] = useState("Spam");
//   const [reportedPosts, setReportedPosts] = useState(new Set()); // prevent duplicate reports

//   const nextId = useRef(200);

//   // Toggle expand
//   const toggleExpanded = (postId) =>
//     setExpandedPosts((prev) => {
//       const next = new Set(prev);
//       if (next.has(postId)) next.delete(postId);
//       else next.add(postId);
//       return next;
//     });

//   // Add comment
//   const addComment = (postId) => {
//     let text = (textMap[postId] || "").trim();
//     if (!text) return;

//     setInsights((prev) =>
//       prev.map((p) =>
//         p.id === postId
//           ? {
//               ...p,
//               comments: p.comments + 1,
//               commentList: [
//                 ...p.commentList,
//                 {
//                   id: nextId.current++,
//                   author: "You",
//                   avatar: "https://placehold.co/40x40/555/fff?text=U",
//                   time: "Just now",
//                   content: text,
//                 },
//               ],
//             }
//           : p
//       )
//     );

//     setTextMap((t) => ({ ...t, [postId]: "" }));
//   };

//   // Like logic: only one liked post per user at any time
//   const handleLike = (postId) => {
//     setInsights((prevIns) => {
//       // prepare new array with updated counts
//       return prevIns.map((p) => {
//         if (p.id === postId) {
//           // clicking same post toggles like off
//           if (likedPostId === postId) {
//             return { ...p, likes: Math.max(0, p.likes - 1) };
//           } else {
//             return { ...p, likes: p.likes + 1 };
//           }
//         }
//         // if previously liked another post, decrement its count
//         if (p.id === likedPostId) {
//           return { ...p, likes: Math.max(0, p.likes - 1) };
//         }
//         return p;
//       });
//     });

//     setLikedPostId((prev) => (prev === postId ? null : postId));
//   };

//   // Share (navigator.share fallback to clipboard)
//   const copyToClipboard = async (text) => {
//     try {
//       if (navigator.clipboard && navigator.clipboard.writeText) {
//         await navigator.clipboard.writeText(text);
//         return true;
//       } else {
//         const temp = document.createElement("input");
//         temp.value = text;
//         document.body.appendChild(temp);
//         temp.select();
//         const ok = document.execCommand("copy");
//         document.body.removeChild(temp);
//         return ok;
//       }
//     } catch {
//       return false;
//     }
//   };

//   const handleShare = async (post) => {
//     const postUrl =
//       typeof window !== "undefined"
//         ? window.location.origin + `/insights/${post.id}`
//         : `/insights/${post.id}`;
//     const shareData = { title: post.title, text: `${post.title} — by ${post.author}`, url: postUrl };

//     if (navigator.share) {
//       try {
//         await navigator.share(shareData);
//       } catch {
//         await copyToClipboard(postUrl);
//         alert("Link copied to clipboard.");
//       }
//     } else {
//       await copyToClipboard(postUrl);
//       alert("Link copied to clipboard.");
//     }
//   };

//   // Report flow
//   const openReportModal = (postId) => {
//     if (reportedPosts.has(postId)) {
//       alert("You have already reported this post.");
//       setOpenMenuId(null);
//       return;
//     }
//     setReportModal({ open: true, postId });
//     setOpenMenuId(null);
//   };

//   const submitReport = () => {
//     const postId = reportModal.postId;
//     if (!postId) return;
//     // Example: here you would POST to your API with reason
//     // For demo, we mark as reported locally and close modal
//     setReportedPosts((prev) => new Set(prev).add(postId));
//     setReportModal({ open: false, postId: null });
//     alert(`Report submitted for post ${postId} — reason: ${reportReason}`);
//   };

//   // Close menu when clicking outside
//   useEffect(() => {
//     if (!openMenuId) return;
//     const onDocClick = (e) => {
//       const node = menuRefs.current[openMenuId];
//       if (!node) {
//         setOpenMenuId(null);
//         return;
//       }
//       if (node.contains(e.target)) return; // clicked inside menu
//       setOpenMenuId(null);
//     };
//     window.addEventListener("mousedown", onDocClick);
//     return () => window.removeEventListener("mousedown", onDocClick);
//   }, [openMenuId]);

//   return (
//     <div className="min-h-screen bg-neutral-950 text-gray-100 flex justify-center p-4">
//       <div className="w-full max-w-2xl space-y-6">
//         <h1 className="text-3xl font-bold text-white mb-4">Insights Feed</h1>

//         {insights.map((post) => {
//           const SHOW_TOGGLE_CHARS = 220;
//           const isExpandable = post.content && post.content.length > SHOW_TOGGLE_CHARS;
//           const isExpanded = expandedPosts.has(post.id);
//           const isLiked = likedPostId === post.id;
//           const isReported = reportedPosts.has(post.id);

//           return (
//             <div key={post.id} className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5">
//               {/* Top info + menu */}
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center gap-3">
//                   <img src={post.avatar} className="w-10 h-10 rounded-full border border-neutral-600" alt={post.author} />
//                   <div>
//                     <p className="text-white font-semibold">{post.author}</p>
//                     <p className="text-xs text-gray-400">{post.time}</p>
//                   </div>
//                 </div>

//                 {/* Menu: only Report Post */}
//                 <div className="relative inline-block">
//                   <button
//                     onClick={() => setOpenMenuId((prev) => (prev === post.id ? null : post.id))}
//                     className="text-gray-400 hover:text-white p-1 rounded-full transition"
//                     aria-expanded={openMenuId === post.id}
//                     aria-haspopup="true"
//                   >
//                     <MoreVertical size={20} />
//                   </button>

//                   {openMenuId === post.id && (
//                     <div ref={(el) => (menuRefs.current[post.id] = el)} className="absolute right-0 mt-2 w-44 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl z-50">
//                       <button
//                         onClick={() => openReportModal(post.id)}
//                         className={`w-full text-left px-4 py-2 text-sm ${isReported ? "text-gray-500 cursor-not-allowed" : "text-red-400 hover:bg-neutral-700" } rounded-xl`}
//                         disabled={isReported}
//                       >
//                         {isReported ? "Reported" : "Report Post"}
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Title */}
//               <h2 className="text-xl text-white font-bold mt-3">{post.title}</h2>

//               {/* Content with clamp */}
//               <div className="mt-2">
//                 <div
//                   className="text-gray-300 whitespace-pre-wrap transition-all"
//                   style={
//                     isExpanded
//                       ? {}
//                       : {
//                           display: "-webkit-box",
//                           WebkitLineClamp: 3,
//                           WebkitBoxOrient: "vertical",
//                           overflow: "hidden",
//                         }
//                   }
//                 >
//                   {post.content}
//                 </div>

//                 {isExpandable && (
//                   <button onClick={() => toggleExpanded(post.id)} className="mt-2 text-sm font-medium text-blue-400 hover:text-blue-300" aria-expanded={isExpanded}>
//                     {isExpanded ? "Show Less" : "Show More"}
//                   </button>
//                 )}
//               </div>

//               {/* Buttons */}
//               <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-700">
//                 <button onClick={() => handleLike(post.id)} className={`flex items-center gap-2 ${isLiked ? "text-blue-400" : "text-gray-300"}`} aria-pressed={isLiked}>
//                   <ThumbsUp size={18} />
//                   <span>{post.likes}</span>
//                 </button>

//                 <button className="flex items-center gap-2 text-gray-300" onClick={() => setShowCommentsId((prev) => (prev === post.id ? null : post.id))}>
//                   <MessageSquare size={18} /> <span>{post.comments}</span>
//                 </button>

//                 <button className="flex items-center gap-2 text-gray-300" onClick={() => handleShare(post)}>
//                   <Share2 size={18} /> Share
//                 </button>
//               </div>

//               {/* Comment Panel */}
//               {showCommentsId === post.id && (
//                 <div className="mt-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
//                   <div className="flex items-center gap-3 mb-4">
//                     <button onClick={() => setShowCommentsId(null)} className="text-gray-300 hover:text-white p-2 rounded-full">
//                       <ArrowLeft size={20} />
//                     </button>
//                     <h3 className="text-xl font-semibold text-white">Comments</h3>
//                   </div>

//                   <div className="flex items-center mb-4">
//                     <input
//                       type="text"
//                       placeholder="Add a comment..."
//                       value={textMap[post.id] || ""}
//                       onChange={(e) => setTextMap((p) => ({ ...p, [post.id]: e.target.value }))}
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") addComment(post.id);
//                       }}
//                       className="flex-1 bg-neutral-800 border border-neutral-700 rounded-full py-3 px-4 text-gray-200 focus:outline-none"
//                     />

//                     <button
//                       onClick={() => addComment(post.id)}
//                       disabled={!((textMap[post.id] || "").trim())}
//                       className={`ml-3 w-12 h-12 rounded-full flex items-center justify-center ${ (textMap[post.id] || "").trim() ? "bg-violet-500 hover:bg-violet-600 text-white" : "bg-neutral-700 text-gray-400 cursor-not-allowed" }`}
//                     >
//                       <Send size={20} />
//                     </button>
//                   </div>

//                   <div className="space-y-3 max-h-48 overflow-y-auto pr-1 tiny-scroll">
//                     {post.commentList.length > 0 ? post.commentList.map((c) => <CommentRow key={c.id} c={c} />) : <p className="text-gray-500 text-sm text-center">No comments yet.</p>}
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* Report Modal */}
//       {reportModal.open && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/60" onClick={() => setReportModal({ open: false, postId: null })} />
//           <div className="relative bg-neutral-900 border border-neutral-700 rounded-2xl p-5 w-full max-w-md z-60">
//             <h3 className="text-lg font-semibold text-white mb-3">Report Post</h3>
//             <p className="text-gray-300 text-sm mb-4">Select a reason for reporting this post.</p>

//             <div className="space-y-2 mb-4">
//               {["Spam", "Harassment", "Hate Speech", "Misinformation", "Other"].map((r) => (
//                 <label key={r} className="flex items-center gap-2 text-gray-200">
//                   <input type="radio" name="reportReason" value={r} checked={reportReason === r} onChange={() => setReportReason(r)} className="accent-violet-500" />
//                   <span className="text-sm">{r}</span>
//                 </label>
//               ))}
//             </div>

//             <div className="flex items-center justify-end gap-3">
//               <button onClick={() => setReportModal({ open: false, postId: null })} className="px-4 py-2 rounded-lg bg-neutral-700 text-gray-200">Cancel</button>
//               <button onClick={submitReport} className="px-4 py-2 rounded-lg bg-red-500 text-white">Submit Report</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* tiny / nearly invisible scrollbar styles (still scrollable) */}
//       <style>{`
//         .tiny-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
//         .tiny-scroll::-webkit-scrollbar-track { background: transparent; }
//         .tiny-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 999px; }
//         .tiny-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.10); }
//         .tiny-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.06) transparent; }
//       `}</style>
//     </div>
//   );
// }
