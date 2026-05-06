const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    askedByUser: {
      type: Boolean,
      default: false, // true = submitted from Help & Support by a real user
    },
    answeredByAdmin: {
      type: Boolean,
      default: false, // true = admin has manually provided an answer
    },
    userName: {
      type: String,
      default: 'Anonymous',
    }
  },
  { timestamps: true }
);

// Indexing for exact case and regex searches and ensuring uniqueness.
// We use a lowercase version of the question for strict matching.
faqSchema.index({ question: 1 });

module.exports = mongoose.model('FAQ', faqSchema);
