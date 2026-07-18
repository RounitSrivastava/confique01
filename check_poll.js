const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const Post = require('./src/models/Post');
    const post = await Post.findOne({ poll: { $ne: null } }).sort({createdAt: -1}).lean();
    console.dir(post.poll, { depth: null });
    process.exit(0);
});
