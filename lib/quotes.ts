export const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Every sale has five basic obstacles: no need, no money, no hurry, no desire, no trust.", author: "Zig Ziglar" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The harder I work, the luckier I get.", author: "Samuel Goldwyn" },
  { text: "You don't close a sale, you open a relationship.", author: "Patricia Fripp" },
  { text: "Either I will find a way, or I will make one.", author: "Philip Sidney" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Your attitude, not your aptitude, will determine your altitude.", author: "Zig Ziglar" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack of will.", author: "Vince Lombardi" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Ninety percent of selling is conviction and ten percent is persuasion.", author: "Shiv Khera" },
  { text: "Make a customer, not a sale.", author: "Katherine Barchetti" },
  { text: "To build a long-term, successful enterprise, when you don't close a sale, open a relationship.", author: "Patricia Fripp" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { text: "The key is not to prioritise what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Marilyn Monroe" },
  { text: "We generate fears while we sit. We overcome them by action.", author: "Dr Henry Link" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "The most valuable thing you can make is a mistake — you can't learn anything from being perfect.", author: "Adam Osborne" },
]

export function getDailyQuote() {
  const day = Math.floor(Date.now() / 86400000)
  return QUOTES[day % QUOTES.length]
}
