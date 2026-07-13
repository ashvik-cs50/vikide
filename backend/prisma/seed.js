const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding VIK IDE database...\n');

  // ─── Default Achievements ───
  const achievements = [
    { name: 'First Login', description: 'Welcome to VIKco! You logged in for the first time.', xpReward: 50, criteria: { type: 'login', count: 1 } },
    { name: 'Code Newbie', description: 'Write your first line of code.', xpReward: 100, criteria: { type: 'lines_written', count: 1 } },
    { name: 'Streak Starter', description: 'Log in 3 days in a row.', xpReward: 150, criteria: { type: 'streak', count: 3 } },
    { name: 'Week Warrior', description: 'Maintain a 7-day streak.', xpReward: 300, criteria: { type: 'streak', count: 7 } },
    { name: 'Lesson Learner', description: 'Complete your first lesson.', xpReward: 100, criteria: { type: 'lessons_completed', count: 1 } },
    { name: 'Scholar', description: 'Complete 10 lessons.', xpReward: 500, criteria: { type: 'lessons_completed', count: 10 } },
    { name: 'Project Starter', description: 'Create your first project.', xpReward: 100, criteria: { type: 'projects_created', count: 1 } },
    { name: 'Builder', description: 'Create 5 projects.', xpReward: 300, criteria: { type: 'projects_created', count: 5 } },
    { name: 'Daily Dedication', description: 'Complete 3 daily challenges.', xpReward: 200, criteria: { type: 'daily_challenges', count: 3 } },
    { name: 'Level 5', description: 'Reach level 5.', xpReward: 500, criteria: { type: 'level', count: 5 } },
    { name: 'Level 10', description: 'Reach level 10!', xpReward: 1000, criteria: { type: 'level', count: 10 } },
    { name: 'Centurion', description: 'Earn 1000 XP total.', xpReward: 200, criteria: { type: 'xp_total', count: 1000 } },
    { name: 'Polyglot', description: 'Write code in 3 different languages.', xpReward: 400, criteria: { type: 'languages', count: 3 } },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { name: ach.name },
      update: ach,
      create: ach
    });
  }
  console.log(`✓ ${achievements.length} achievements created`);

  // ─── Default Lessons ───
  const lessons = [
    // Python
    { title: 'Hello Python!', description: 'Write your first Python program.', category: 'python', difficulty: 'easy', content: '# Hello Python!\n\nPython is a beginner-friendly programming language.\n\n## Your First Program\n\n```python\nprint("Hello, World!")\n```\n\n## What You Learned\n- `print()` displays text on the screen\n- Text in quotes is called a "string"\n- Python runs your code line by line', order: 1, xpReward: 50 },
    { title: 'Python Variables', description: 'Store data with variables.', category: 'python', difficulty: 'easy', content: '# Python Variables\n\nVariables store data so you can use it later.\n\n```python\nname = "Alice"\nage = 15\nprint(f"{name} is {age} years old")\n```\n\n## Types of Data\n- **Strings** - text (e.g., "hello")\n- **Integers** - whole numbers (e.g., 42)\n- **Floats** - decimal numbers (e.g., 3.14)\n- **Booleans** - True or False', order: 2, xpReward: 75 },
    { title: 'Python If Statements', description: 'Make decisions in your code.', category: 'python', difficulty: 'easy', content: '# If Statements\n\nConditional statements let your code make decisions.\n\n```python\nage = 15\nif age >= 18:\n    print("You are an adult")\nelif age >= 13:\n    print("You are a teenager")\nelse:\n    print("You are a child")\n```\n\n## Comparison Operators\n- `==` equal to\n- `!=` not equal to\n- `>` greater than\n- `<` less than\n- `>=` greater than or equal\n- `<=` less than or equal', order: 3, xpReward: 100 },
    // JavaScript
    { title: 'JavaScript Basics', description: 'Learn JavaScript fundamentals.', category: 'web', difficulty: 'easy', content: '# JavaScript Basics\n\nJavaScript makes websites interactive.\n\n```javascript\nconsole.log("Hello, World!");\n\nlet name = "Alice";\nconst age = 15;\n\nconsole.log(`${name} is ${age} years old`);\n```\n\n## Key Points\n- `let` declares a variable that can change\n- `const` declares a variable that can\'t change\n- Use backticks `` ` `` for template strings with `${}`', order: 1, xpReward: 50 },
    { title: 'JavaScript Functions', description: 'Create reusable code blocks.', category: 'web', difficulty: 'easy', content: '# JavaScript Functions\n\nFunctions let you reuse code!\n\n```javascript\nfunction greet(name) {\n    return `Hello, ${name}!`;\n}\n\nconsole.log(greet("Alice"));\nconsole.log(greet("Bob"));\n```\n\n## Arrow Functions (Modern Way)\n```javascript\nconst greet = (name) => `Hello, ${name}!`;\n```', order: 2, xpReward: 75 },
    // Web
    { title: 'HTML Structure', description: 'Build web page structure.', category: 'web', difficulty: 'easy', content: '# HTML Structure\n\nHTML is the skeleton of every website.\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Welcome!</h1>\n    <p>This is a paragraph.</p>\n</body>\n</html>\n```\n\n## Common Tags\n- `<h1>` to `<h6>` - headings\n- `<p>` - paragraph\n- `<a>` - links\n- `<img>` - images\n- `<div>` - container/division', order: 1, xpReward: 50 },
    { title: 'CSS Styling', description: 'Make your pages look great.', category: 'web', difficulty: 'easy', content: '# CSS Styling\n\nCSS makes websites beautiful!\n\n```css\nbody {\n    background-color: #05070D;\n    color: white;\n    font-family: Arial, sans-serif;\n}\n\n.title {\n    font-size: 2rem;\n    color: #5B8CFF;\n}\n\n#main-button {\n    padding: 10px 20px;\n    border: none;\n    border-radius: 8px;\n    cursor: pointer;\n}\n```\n\n## Selectors\n- `element` - selects all elements of that type\n- `.class` - selects elements with that class\n- `#id` - selects the element with that id', order: 2, xpReward: 75 },
    // Java
    { title: 'Java Introduction', description: 'Start with Java.', category: 'java', difficulty: 'easy', content: '# Java Introduction\n\nJava is a powerful, object-oriented language.\n\n```java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n```\n\n## Key Points\n- Every Java program needs a `class`\n- The `main` method is where execution starts\n- `System.out.println()` prints to the console', order: 1, xpReward: 50 },
    // C++
    { title: 'C++ Basics', description: 'Learn C++ fundamentals.', category: 'cpp', difficulty: 'easy', content: '# C++ Basics\n\nC++ is fast and powerful.\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n```\n\n## Key Points\n- `#include` adds libraries\n- `cout <<` prints text\n- `endl` starts a new line', order: 1, xpReward: 50 },
    // Algorithms
    { title: 'What are Algorithms?', description: 'Learn the basics of algorithms.', category: 'algorithms', difficulty: 'easy', content: '# What are Algorithms?\n\nAn algorithm is a step-by-step procedure for solving a problem.\n\n## Example: Making a Sandwich\n1. Get two slices of bread\n2. Spread butter on one side\n3. Add filling\n4. Put the second slice on top\n\n## Computer Algorithms\nComputers use algorithms too!\n\n```python\n# Linear Search\ndef find_item(list, target):\n    for i in range(len(list)):\n        if list[i] == target:\n            return i\n    return -1\n```', order: 1, xpReward: 75 },
    { title: 'Sorting - Bubble Sort', description: 'Learn one of the simplest sorting algorithms.', category: 'algorithms', difficulty: 'medium', content: '# Bubble Sort\n\nBubble sort repeatedly steps through a list, compares adjacent elements, and swaps them if they are in the wrong order.\n\n```python\ndef bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr\n\nnumbers = [64, 34, 25, 12, 22, 11, 90]\nsorted_nums = bubble_sort(numbers)\nprint(sorted_nums)\n```\n\n## How it Works\n- Pass through the list from left to right\n- If adjacent elements are in wrong order, swap them\n- The largest element "bubbles up" to its correct position\n- Repeat until the list is sorted', order: 2, xpReward: 150 },
  ];

  for (const lesson of lessons) {
    await prisma.lesson.create({ data: lesson });
  }
  console.log(`✓ ${lessons.length} lessons created`);

  console.log('\n✨ Seeding complete!\n');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
