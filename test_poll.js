const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});
const Post = require('./src/models/Post').default || require('./src/models/Post');
const User = require('./src/models/User').default || require('./src/models/User');
const Group = require('./src/models/Group').default || require('./src/models/Group');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const u = await User.findOne();
        const g = await Group.findOne();
        const p = new Post({
            title: "Test",
            author: u._id,
            group: g._id,
            poll: { question: "Q?", isMultiSelect: true, options: [] }
        });
        await p.save();
        console.log("Saved poll:", p.poll);
        const p2 = await Post.findById(p._id).lean();
        console.log("Fetched poll:", p2.poll);
        await Post.deleteOne({ _id: p._id });
    } catch(e) { console.error(e); }
    process.exit(0);
});
