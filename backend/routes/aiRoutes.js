const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key' });

// Public route: get all admin-answered FAQs for the Help & Support page
router.get('/faqs-public', async (req, res) => {
  try {
    const FAQ = require('../models/FAQ');
    const faqs = await FAQ.find({ answeredByAdmin: true }).sort({ createdAt: -1 }).select('question answer userName createdAt');
    res.status(200).json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const lowerMsg = message.toLowerCase();

    // 1. Check if Groq is enabled or use Local Rule-based AI
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'YOUR_GROQ_API_KEY') {
      let reply = "";
      
      // Simple Keyword Engine for Local AI Experience
      if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('how much')) {
        reply = "Our parking rates are quite competitive, typically ranging from ₹20 to ₹60 per hour. You can view the exact price for each slot by clicking on the markers on the dashboard map.";
      } else if (lowerMsg.includes('book') || lowerMsg.includes('reserve') || lowerMsg.includes('how to')) {
        reply = "Booking is easy! Just go to the Dashboard, click on a parking spot that suits you, and click the 'Book Now' button. You'll then be able to select your duration and pay.";
      } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
        reply = "Hello! I am your SmartPark Assistant. I can help you find the best parking spots, understand our pricing, or guide you through the booking process. How can I assist you today?";
      } else if (lowerMsg.includes('where') || lowerMsg.includes('location') || lowerMsg.includes('near')) {
        reply = "We have many parking locations available across the city. On your Dashboard, you can see all available spots on the live map. We even have a recommendation panel that suggests the best spot based on your current location!";
      } else if (lowerMsg.includes('ev') || lowerMsg.includes('charging')) {
        reply = "Yes, some of our parking spots are EV-friendly and offer charging facilities. Look for the 'EV-friendly' tag in the parking details.";
      } else if (lowerMsg.includes('cancel') || lowerMsg.includes('refund')) {
        reply = "You can manage your bookings in the 'Booking History' section. Cancellations are subject to our policy, which you can find in the booking details.";
      } else if (lowerMsg.includes('thank')) {
        reply = "You're very welcome! If you have any more questions, feel free to ask. Happy parking!";
      } else {
        reply = "I'm here to help you with everything related to SmartPark! You can ask me about parking locations, pricing, how to book a spot, or about our EV-friendly facilities. What would you like to know?";
      }
      
      return res.status(200).json({
        success: true,
        reply: reply + " (Assistant in Local Mode)"
      });
    }

    // 2. Use Groq if API key is present
    const messages = [
      {
        role: "system",
        content: `You are a helpful AI Assistant for "SmartPark Finder", a smart parking booking application in India. 
    You help users find parking, understand pricing (usually ₹20-₹60 per hour), and guide them through the booking process.
    Be concise, friendly, and professional.`
      }
    ];

    // Map existing history (which may be in Gemini format) to Groq/OpenAI format
    if (history && Array.isArray(history)) {
      history.forEach(item => {
        let content = "";
        if (item.parts && Array.isArray(item.parts)) {
          content = item.parts.map(p => p.text).join("");
        } else if (typeof item.parts === 'string') {
          content = item.parts;
        } else if (item.content) {
          content = item.content;
        }

        messages.push({
          role: item.role === 'model' ? 'assistant' : (item.role || 'user'),
          content: content || ' '
        });
      });
    }

    messages.push({
      role: "user",
      content: message
    });

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama3-8b-8192",
      max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content || "";

    res.status(200).json({
      success: true,
      reply: text
    });
  } catch (error) {
    console.error('Groq Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get response from AI assistant'
    });
  }
});
router.post('/faq', async (req, res) => {
  try {
    const { question, userName } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    const FAQ = require('../models/FAQ');

    // 1. Check Cache — only return cached if it was answered by admin
    const existingFaq = await FAQ.findOne({ question: new RegExp(`^${question.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    if (existingFaq && existingFaq.answeredByAdmin) {
      // Mark it as asked by a user too (so admin can see repeated questions)
      if (!existingFaq.askedByUser) {
        existingFaq.askedByUser = true;
        existingFaq.userName = userName || existingFaq.userName || 'Anonymous';
        await existingFaq.save();
      }
      return res.status(200).json({ success: true, answer: existingFaq.answer, cached: true, answeredByAdmin: true });
    }

    // 2. Save the question immediately as askedByUser=true
    // If it already exists but is not admin-answered, update the askedByUser flag
    let savedFaq = existingFaq;
    if (!existingFaq) {
      savedFaq = new FAQ({
        question,
        answer: 'Waiting for admin response...',
        askedByUser: true,
        answeredByAdmin: false,
        userName: userName || 'Anonymous'
      });
      await savedFaq.save();
    } else {
      // Update existing to mark as asked by user
      existingFaq.askedByUser = true;
      existingFaq.userName = userName || existingFaq.userName || 'Anonymous';
      await existingFaq.save();
    }

    const promptMessage = `You are a helpful customer support AI for "SmartPark Finder", a parking application. Answer the following user question clearly, concisely, and helpfully in 1-2 short sentences: "${question}"`;

    let reply = "";

    // 3. Generate AI Answer (Fallback or Groq)
    let aiKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : null;
    if (!aiKey || aiKey === 'YOUR_GROQ_API_KEY') {
       const lowerMsg = question.toLowerCase();
       if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
         reply = "Our parking rates typically range from ₹20 to ₹60 per hour depending on location.";
       } else if (lowerMsg.includes('book') || lowerMsg.includes('reserve')) {
         reply = "You can book directly from the Dashboard by selecting a parking spot and clicking 'Book Now'.";
       } else if (lowerMsg.includes('cancel')) {
         reply = "Bookings can be cancelled from your 'Booking History' or Profile settings.";
       } else if (lowerMsg.includes('ev') || lowerMsg.includes('charging')) {
         reply = "Yes, look for the 'EV-friendly' tag on the dashboard for spots with charging facilities.";
       } else {
         reply = "Your question has been received. Our support team will review and respond shortly.";
       }
    } else {
       try {
         const completion = await groq.chat.completions.create({
           messages: [ { role: "system", content: promptMessage } ],
           model: "llama3-8b-8192",
           max_tokens: 150,
         });
         reply = completion.choices[0]?.message?.content || "";
         if (!reply) throw new Error("Empty response from Groq");
       } catch (groqError) {
         console.error('Groq Generation Error:', groqError.message || groqError);
         reply = "Your question has been received. Our support team will review and respond shortly.";
       }
    }

    // 4. Update the saved FAQ with the AI answer (but NOT mark as answeredByAdmin)
    if (savedFaq) {
      savedFaq.answer = reply;
      await savedFaq.save();
    }

    res.status(200).json({ success: true, answer: reply, cached: false, answeredByAdmin: false });

  } catch (error) {
    console.error('FAQ Generation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate answer' });
  }
});

module.exports = router;
