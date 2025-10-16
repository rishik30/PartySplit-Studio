const mongoose = require('mongoose');

const FriendSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
}, { _id: false });

const TaskSchema = new mongoose.Schema({
    id: { type: String, required: true },
    description: { type: String, required: true },
    assignedTo: { type: String },
    deadline: { type: String },
    completed: { type: Boolean, default: false },
}, { _id: false });

const SplitDetailSchema = new mongoose.Schema({
    friendId: { type: String, required: true },
    amount: { type: Number },
    percentage: { type: Number },
    shares: { type: Number },
}, { _id: false });

const ExpenseSchema = new mongoose.Schema({
    id: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidById: { type: String, required: true },
    date: { type: String, required: true },
    splitType: {
        type: String,
        enum: ['equally', 'by_amount', 'by_percentage', 'by_shares'],
        required: true,
    },
    splitBetween: [SplitDetailSchema],
}, { _id: false });

const PartySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    friends: [FriendSchema],
    tasks: [TaskSchema],
    expenses: [ExpenseSchema],
});

// Transform the output to match the frontend's expectation of an 'id' field
PartySchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model('Party', PartySchema);
