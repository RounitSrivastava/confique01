const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});
const Post = require('./src/models/Post').default || require('./src/models/Post');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const posts = await Post.find({ poll: { $ne: null } }).sort({createdAt:-1}).limit(3).lean();
        console.dir(posts.map(p => p.poll), {depth: null});
    } catch(e) { console.error(e); }
    process.exit(0);
});
