// "use client";
// import { Heart, MessageCircle, Share2 } from "lucide-react";

// const PostCard = ({ post }) => {
//   return (
//     <div className="bg-white p-4 rounded-xl shadow mb-4 hover:shadow-md transition">
//       {/* Post Header */}
//       <div className="flex items-center gap-3 mb-3">
//         <img
//           src={post.user.avatar}
//           alt={post.user.name}
//           className="w-10 h-10 rounded-full"
//         />
//         <div>
//           <h3 className="text-sm font-semibold text-gray-800">{post.user.name}</h3>
//           <p className="text-xs text-text-4">{post.time}</p>
//         </div>
//       </div>

//       {/* Post Content */}
//       <p className="text-sm text-gray-700 mb-3">{post.content}</p>

//       {post.image && (
//         <img
//           src={post.image}
//           alt="Post content"
//           className="rounded-lg mb-3 max-h-80 w-full object-cover"
//         />
//       )}

//       {/* Post Actions */}
//       <div className="flex items-center justify-between text-gray-600 text-sm">
//         <button className="flex items-center gap-1 hover:text-red-500">
//           <Heart size={16} /> {post.likes}
//         </button>
//         <button className="flex items-center gap-1 hover:text-blue-500">
//           <MessageCircle size={16} /> {post.comments}
//         </button>
//         <button className="flex items-center gap-1 hover:text-green-500">
//           <Share2 size={16} /> Share
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PostCard;
