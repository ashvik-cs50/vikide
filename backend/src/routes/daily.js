const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

// ─── GET TODAY'S CHALLENGE ───
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let challenge = await prisma.dailyChallenge.findFirst({
      where: { date: today },
      include: {
        completions: true
      }
    });

    // If no challenge for today, create one
    if (!challenge) {
      const challenges = [
        { title: 'Hello World', description: 'Write a program that prints "Hello, World!" to the console.', difficulty: 'easy', language: 'vik', starterCode: '// Print Hello World\n', solution: 'say Hello, World!', xpReward: 50 },
        { title: 'Even or Odd', description: 'Write a program that checks if a number is even or odd.', difficulty: 'easy', language: 'vik', starterCode: 'getIn num Enter a number:\n', solution: 'getIn num Enter a number:\ni num % 2 == 0\n  say Even!\nenif\ni num % 2 == 1\n  say Odd!\nenif', xpReward: 75 },
        { title: 'Count to Ten', description: 'Use a loop to count from 1 to 10.', difficulty: 'easy', language: 'vik', starterCode: '// Count from 1 to 10\nset count = 1\n', solution: 'set count = 1\nwhi count <= 10\n  say vari,count\n  calc count = count a 1\nenwhi', xpReward: 75 },
        { title: 'Sum Calculator', description: 'Ask the user for two numbers and print their sum.', difficulty: 'medium', language: 'vik', starterCode: 'getIn a First number:\ngetIn b Second number:\n', solution: 'getIn a First number:\ngetIn b Second number:\ncalc sum = a a b\nsay The sum is: vari,sum', xpReward: 100 },
        { title: 'Greeting Function', description: 'Create a function that greets the user with their name.', difficulty: 'medium', language: 'vik', starterCode: 'get name What is your name?\n', solution: 'get name What is your name?\nfun greet\n  say Hello vari,name! Welcome to Vik Script!\nendf\ncall greet', xpReward: 100 },
        { title: 'Array Explorer', description: 'Create an array of colors and print each one.', difficulty: 'medium', language: 'vik', starterCode: 'ar colors = red,green,blue\n', solution: 'ar colors = red,green,blue\nsay My favorite colors:\nsay vari,colors', xpReward: 125 },
        { title: 'Fibonacci Sequence', description: 'Print the first 10 numbers of the Fibonacci sequence.', difficulty: 'hard', language: 'vik', starterCode: 'set a = 0\nset b = 1\nset count = 0\n', solution: 'set a = 0\nset b = 1\nset count = 0\nwhi count < 10\n  say vari,a\n  set temp = a\n  set a = b\n  calc b = temp a b\n  calc count = count a 1\nenwhi', xpReward: 200 },
        { title: 'Guessing Game', description: 'Create a number guessing game with random numbers!', difficulty: 'hard', language: 'vik', starterCode: 'rnd secret 1 10\nsay I am thinking of a number between 1 and 10...\ngetIn guess Your guess:\n', solution: 'rnd secret 1 10\nsay I am thinking of a number between 1 and 10...\ngetIn guess Your guess:\ni guess == secret\n  say Correct! You guessed it!\nenif\ni guess != secret\n  say Sorry, the number was vari,secret\nenif', xpReward: 200 },
      ];

      const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
      challenge = await prisma.dailyChallenge.create({
        data: {
          ...randomChallenge,
          date: today
        },
        include: { completions: true }
      });
    }

    res.json(challenge);
  } catch (err) {
    console.error('Daily challenge error:', err);
    res.status(500).json({ error: 'Failed to fetch daily challenge' });
  }
});

// ─── COMPLETE TODAY'S CHALLENGE ───
router.post('/today/complete', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const challenge = await prisma.dailyChallenge.findFirst({
      where: { date: today }
    });

    if (!challenge) {
      return res.status(404).json({ error: 'No challenge for today' });
    }

    const existing = await prisma.userDailyChallenge.findUnique({
      where: {
        userId_challengeId: { userId: req.user.id, challengeId: challenge.id }
      }
    });

    if (existing) {
      return res.json({ message: 'Already completed today\'s challenge!', xpEarned: 0 });
    }

    const { code } = req.body || {};

    await prisma.userDailyChallenge.create({
      data: {
        userId: req.user.id,
        challengeId: challenge.id,
        code: code || '',
        xpEarned: challenge.xpReward
      }
    });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { xp: { increment: challenge.xpReward } }
    });

    res.json({ message: 'Challenge completed!', xpEarned: challenge.xpReward });
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete challenge' });
  }
});

module.exports = router;
