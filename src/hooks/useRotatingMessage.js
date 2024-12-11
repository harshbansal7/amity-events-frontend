import { useState, useEffect } from 'react';

const messages = {
  login: [
    "Where attendance is mandatory, but fun is guaranteed! 🎭",
    "Another day, another event to skip classes for... 😉",
    "Welcome back! Ready to make some memories? 🌟",
    "Pro tip: Events are better than lectures 🤫",
    "Loading your social life... Please wait ⌛",
    "Time to turn FOMO into YOLO! 🎉",
    "Your parents think you're studying right now 📚",
    "Warning: Events may cause excessive fun 🎮",
    "Connecting you to your next adventure... 🚀",
    "Plot twist: College is actually about the events 🎭",
    "Logging into the fun side of college 🎪",
    "Your professors won't find you here 🙈",
    "Shh... This is the secret to college life 🤫",
    "Loading memories in 3... 2... 1... 🎬",
    "Where assignments go to die and fun comes alive 🌟",
    "Your GPA called, it's feeling neglected 📉",
    "Welcome to the better side of student life 🎡",
    "Procrastination level: Expert 🏆",
    "Your future self will thank you for this 🙌",
    "Making your college life legendary 💫"
  ],

  eventList: [
    "Because who needs sleep when you have events to attend? 🌙",
    "Where memories are made and deadlines are forgotten 📅",
    "Warning: Events may cause excessive happiness 🎉",
    "Your one-stop shop for procrastination 😅",
    "Because Netflix can wait, but events can't 🎬",
    "Where FOMO meets YOLO 🎭",
    "Loading your next excuse to skip study group... ⌛",
    "Plot twist: These events are actually networking opportunities 🤝",
    "Your parents think you're at the library 📚",
    "Collecting memories, one event at a time ✨",
    "More fun than your 8 AM lecture 🌅",
    "Better than binge-watching series 🍿",
    "Your social life's best friend 🤗",
    "Where attendance is actually worth it 📝",
    "Making college memories since forever 🎊",
    "Because adulting can wait 🎈",
    "Your semester's highlight reel 🎥",
    "More exciting than your textbooks 📚",
    "Where fun meets \'networking\' 😉",
    "Creating stories worth telling 📖"
  ],

  register: [
    "Join the club where FOMO becomes YOLO 🎉",
    "Your parents won't believe what you're about to sign up for 😎",
    "Warning: May cause severe addiction to fun 🎮",
    "One small click, one giant leap for your social life 🚀",
    "Becoming a part of something legendary... 🌟",
    "Your future self will thank you for this 🙌",
    "Plot twist: This is the best decision you'll make today 🎭",
    "Loading your college life upgrade... ⌛",
    "Unlocking achievement: Social Butterfly 🦋",
    "Your semester is about to get way more interesting 🎪",
    "Welcome to the cool side of college 😎",
    "Where memories begin and studies... well... 📚",
    "Your parents think you're registering for extra classes 🤫",
    "Achievement unlocked: Social Life Activated 🎮",
    "Loading your excuse generator... 🔄"
  ],

  myEvents: [
    "Juggling events like a pro circus performer 🎪",
    "Your social calendar is better than your academic one 📅",
    "Achievement unlocked: Event Hoarder 🏆",
    "Your parents would be proud (maybe) 😅",
    "Living your best college life, one event at a time 🌟",
    "Plot twist: You're actually networking 🤝",
    "Warning: May cause severe case of popularity 🌈",
    "Loading your excuses for missed assignments... ⌛",
    "Your future LinkedIn profile thanks you 💼",
    "Professional memory collector at work 📸",
    "Your planner is judging you right now 📒",
    "More events than study hours... oops! 😅",
    "Collecting memories faster than credits 🎓",
    "Your social life is thriving, your GPA... not so much 📊",
    "Making your college stories legendary 🌟"
  ],

  createEvent: [
    "Creating memories, one event at a time ✨",
    "About to make history (or at least try) 🚀",
    "Warning: Your event may cause excessive fun 🎉",
    "Loading your moment of glory... ⌛",
    "Plot twist: You're now the cool event organizer 😎",
    "Your parents would be proud (if they knew) 🤫",
    "Achievement unlocked: Event Creator 🏆",
    "Making FOMO happen since now 🌟",
    "Your professors won't believe this one 📚",
    "Time to show them how it's done 💫",
    "Creating chaos, professionally 🎭",
    "Your event > Their assignments 📝",
    "About to become everyone's favorite person 🤗",
    "Making college memories official ✨",
    "Future legendary event loading... 🔄"
  ],

  forgotPassword: [
    "Happens to the best of us... especially after those late-night events 😴",
    "Plot twist: Your password was your student ID all along 🤦",
    "Memory not found: Please try again 404 ⚠️",
    "Loading your memory banks... ⌛",
    "That moment when you remember everything except your password 🤔",
    "Your password is having an identity crisis 🎭",
    "Warning: Brain.exe has stopped working 🧠",
    "Time to play 'Guess My Password' again 🎮",
    "Your password went on vacation without you 🏖️",
    "Achievement unlocked: Password Amnesia 🏆",
    "Even your calculator remembers better than you 🧮",
    "Your password is playing hide and seek 🙈",
    "Memory.exe has stopped working 💻",
    "Your password needs a vacation from you 🏖️",
    "This is why we can't have nice things 😅"
  ],

  noEvents: [
    "Finally, time to actually study... Said no one ever 📚",
    "The calm before the storm of events 🌪️",
    "Plot twist: Free time for Netflix 🎬",
    "Loading future memories... Please wait ⌛",
    "Time to create your own event? 🤔",
    "Your social calendar needs some spice 🌶️",
    "Warning: Excessive free time detected ⚠️",
    "The perfect time to start that assignment (or not) 📝",
    "Your FOMO is showing 👀",
    "Searching for fun in all the wrong places 🔍",
    "This page is as empty as your excuses 😅",
    "Time to spam refresh until events appear 🔄",
    "Even your calculator is more exciting right now 🧮",
    "Your social life is on a coffee break ☕",
    "Error 404: Fun not found (yet) 💻",
    "The universe is telling you to study 📖",
    "Your professors are winning right now 👨‍🏫",
    "Quick, someone create an event! 🆘",
    "This is your chance to actually do homework 📝",
    "Plot twist: Maybe it's time to be productive 🤔"
  ]
};

const useRotatingMessage = (type) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getRandomMessage = () => {
      const messageList = messages[type] || [];
      const randomIndex = Math.floor(Math.random() * messageList.length);
      return messageList[randomIndex];
    };

    // Set initial message
    setMessage(getRandomMessage());

    // Update message every minute
    const interval = setInterval(() => {
      setMessage(getRandomMessage());
    }, 60000); // 60000 ms = 1 minute

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [type]);

  return message;
};

export default useRotatingMessage;