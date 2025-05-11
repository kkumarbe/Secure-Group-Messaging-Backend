const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['private', 'open'], required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  banishedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxMembers: { type: Number, default: 100 }
});

module.exports = mongoose.model('Group', groupSchema);