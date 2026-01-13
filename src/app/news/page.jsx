// "use client";
// import { Newspaper } from "lucide-react";

// export default function NewsPage() {
//   const news = [
//     {
//       id: 1,
//       title: "OpenAI launches GPT-5 API 🚀",
//       category: "Tech",
//       snippet:
//         "The latest GPT-5 model brings enhanced reasoning and multimodal features, changing how businesses integrate AI...",
//       date: "Sep 23, 2025",
//       image: "/images/news-ai.jpg",
//     },
//     {
//       id: 2,
//       title: "Funding rebounds in 2025 💡",
//       category: "Startups",
//       snippet:
//         "Venture capital funding has seen a surge after a two-year slowdown, with AI and biotech leading the pack...",
//       date: "Sep 22, 2025",
//       image: "/images/news-startup.jpg",
//     },
//     {
//       id: 3,
//       title: "Political Summit 2025 kicks off 🌍",
//       category: "Politics",
//       snippet:
//         "Leaders from over 80 countries gather to discuss climate change, AI regulation, and global trade...",
//       date: "Sep 20, 2025",
//       image: "/images/news-politics.jpg",
//     },
//   ];

//   return (
//     <div className="flex-1 p-6 overflow-y-auto">
//       {/* Header */}
//       <div className="flex items-center gap-2 mb-6">
//         <Newspaper size={22} className="text-purple-600" />
//         <h1 className="text-2xl font-bold text-gray-800">Latest News</h1>
//       </div>

//       {/* News List */}
//       <div className="space-y-6">
//         {news.map((item) => (
//           <div
//             key={item.id}
//             className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
//           >
//             <div className="flex flex-col md:flex-row">
//               {/* Thumbnail */}
//               <img
//                 src={item.image}
//                 alt={item.title}
//                 className="w-full md:w-60 h-40 object-cover"
//               />

//               {/* Content */}
//               <div className="p-4 flex flex-col justify-between">
//                 <div>
//                   <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-600">
//                     {item.category}
//                   </span>
//                   <h2 className="text-lg font-semibold text-gray-800 mt-2">
//                     {item.title}
//                   </h2>
//                   <p className="text-sm text-gray-600 mt-1">{item.snippet}</p>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-3">{item.date}</p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
