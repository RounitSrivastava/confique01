const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});
const Event = require('./src/models/Event').default || require('./src/models/Event');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const events = await Event.find({}).lean();
        console.log(JSON.stringify(events.map(e => ({ title: e.title, eventStart: e.eventStart, date: e.date, createdAt: e.createdAt })), null, 2));
    } catch(e) { console.error(e); }
    process.exit(0);
});
