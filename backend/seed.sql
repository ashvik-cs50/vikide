-- Vik IDE D1 Seed Data

-- Achievements
INSERT OR IGNORE INTO achievements (id, name, description, xp_reward, criteria) VALUES
  ('ach_first_login', 'First Login', 'Welcome to VIKco! You logged in for the first time.', 50, '{"type":"login","count":1}'),
  ('ach_code_newbie', 'Code Newbie', 'Write your first line of code.', 100, '{"type":"lines_written","count":1}'),
  ('ach_streak_starter', 'Streak Starter', 'Log in 3 days in a row.', 150, '{"type":"streak","count":3}'),
  ('ach_week_warrior', 'Week Warrior', 'Maintain a 7-day streak.', 300, '{"type":"streak","count":7}'),
  ('ach_lesson_learner', 'Lesson Learner', 'Complete your first lesson.', 100, '{"type":"lessons_completed","count":1}'),
  ('ach_scholar', 'Scholar', 'Complete 10 lessons.', 500, '{"type":"lessons_completed","count":10}'),
  ('ach_project_starter', 'Project Starter', 'Create your first project.', 100, '{"type":"projects_created","count":1}'),
  ('ach_builder', 'Builder', 'Create 5 projects.', 300, '{"type":"projects_created","count":5}'),
  ('ach_daily_dedication', 'Daily Dedication', 'Complete 3 daily challenges.', 200, '{"type":"daily_challenges","count":3}'),
  ('ach_level_5', 'Level 5', 'Reach level 5.', 500, '{"type":"level","count":5}'),
  ('ach_level_10', 'Level 10', 'Reach level 10!', 1000, '{"type":"level","count":10}'),
  ('ach_centurion', 'Centurion', 'Earn 1000 XP total.', 200, '{"type":"xp_total","count":1000}'),
  ('ach_polyglot', 'Polyglot', 'Write code in 3 different languages.', 400, '{"type":"languages","count":3}');

-- Python Lessons
INSERT OR IGNORE INTO lessons (id, title, description, category, difficulty, content, "order", xp_reward) VALUES
  ('lesson_py_1', 'Hello Python!', 'Write your first Python program.', 'python', 'easy',
'# Hello Python!\n\nPython is a beginner-friendly programming language.\n\n## Your First Program\n\n```python\nprint("Hello, World!")\n```\n\n## What You Learned\n- `print()` displays text on the screen\n- Text in quotes is called a "string"\n- Python runs your code line by line',
1, 50);

INSERT OR IGNORE INTO lessons (id, title, description, category, difficulty, content, "order", xp_reward) VALUES
  ('lesson_py_2', 'Python Variables', 'Store data with variables.', 'python', 'easy',
'# Python Variables\n\nVariables store data so you can use it later.\n\n```python\nname = "Alice"\nage = 15\nprint(f"{name} is {age} years old")\n```\n\n## Types of Data\n- **Strings** - text (e.g., "hello")\n- **Integers** - whole numbers (e.g., 42)\n- **Floats** - decimal numbers (e.g., 3.14)\n- **Booleans** - True or False',
2, 75);

INSERT OR IGNORE INTO lessons (id, title, description, category, difficulty, content, "order", xp_reward) VALUES
  ('lesson_py_3', 'Python If Statements', 'Make decisions in your code.', 'python', 'easy',
'# If Statements\n\nConditional statements let your code make decisions.\n\n```python\nage = 15\nif age >= 18:\n    print("You are an adult")\nelif age >= 13:\n    print("You are a teenager")\nelse:\n    print("You are a child")\n```\n\n## Comparison Operators\n- `==` equal to\n- `!=` not equal to\n- `>` greater than\n- `<` less than\n- `>=` greater than or equal\n- `<=` less than or equal',
3, 100);

-- JavaScript / Web Lessons
INSERT OR IGNORE INTO lessons (id, title, description, category, difficulty, content, "order", xp_reward) VALUES
  ('lesson_js_1', 'JavaScript Basics', 'Learn JavaScript fundamentals.', 'web', 'easy',
'# JavaScript Basics\n\nJavaScript makes websites interactive.\n\n```javascript\nconsole.log("Hello, World!");\n\nlet name = "Alice";\nconst age = 15;\n\nconsole.log(`${name} is ${age} years old`);\n```\n\n## Key Points\n- `let` declares a variable that can change\n- `const` declares a variable that can\''t change\n- Use backticks `` ` `` for template strings with `${}`',
1, 50);

INSERT OR IGNORE INTO lessons (id, title, description, category, difficulty, content, "order", xp_reward) VALUES
  ('lesson_js_2', 'JavaScript Functions', 'Create reusable code blocks.', 'web', 'easy',
'# JavaScript Functions\n\nFunctions let you reuse code!\n\n```javascript\nfunction greet(name) {\n    return `Hello, ${name}!`;\n}\n\nconsole.log(greet("Alice"));\nconsole.log(greet("Bob"));\n```\n\n## Arrow Functions (Modern Way)\n```javascript\nconst greet = (name) => `Hello, ${name}!`;\n```',
2, 75);

INSERT OR IGNORE INTO lessons (id, title, description, category, difficulty, content, "order", xp_reward) VALUES
  ('lesson_html_1', 'HTML Structure', 'Build web page structure.', 'web', 'easy',
'# HTML Structure\n\nHTML is the skeleton of every website.\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Welcome!</h1>\n    <p>This is a paragraph.</p>\n</body>\n</html>\n```\n\n## Common Tags\n- `<h1>` to `<h6>` - headings\n- `<p>` - paragraph\n- `<a>` - links\n- `<img>` - images\n- `<div>` - container/division',
1, 50);

INSERT OR IGNORE INTO lessons (id, title, description, category, difficulty, content, "order", xp_reward) VALUES
  ('lesson_css_1', 'CSS Styling', 'Make your pages look great.', 'web', 'easy',
'# CSS Styling\n\nCSS makes websites beautiful!\n\n```css\nbody {\n    background-color: #05070D;\n    color: white;\n    font-family: Arial, sans-serif;\n}\n\n.title {\n    font-size: 2rem;\n    color: #5B8CFF;\n}\n\n#main-button {\n    padding: 10px 20px;\n    border: none;\n    border-radius: 8px;\n    cursor: pointer;\n}\n```\n\n## Selectors\n- `element` - selects all elements of that type\n- `.class` - selects elements with that class\n- `#id` - selects the element with that id',
2, 75);

-- Java Lesson
INSERT OR IGNORE INTO lessons (id, title, description, category, difficulty, content, "order", xp_reward) VALUES
  ('lesson_java_1', 'Java Introduction', 'Start with Java.', 'java', 'easy',
'# Java Introduction\n\nJava is a powerful, object-oriented language.\n\n```java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n```\n\n## Key Points\n- Every Java program needs a `class`\n- The `main` method is where execution starts\n- `System.out.println()` prints to the console',
1, 50);

-- C++ Lesson
INSERT OR IGNORE INTO lessons (id, title, description, category, difficulty, content, "order", xp_reward) VALUES
  ('lesson_cpp_1', 'C++ Basics', 'Learn C++ fundamentals.', 'cpp', 'easy',
'# C++ Basics\n\nC++ is fast and powerful.\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n```\n\n## Key Points\n- `#include` adds libraries\n- `cout <<` prints text\n- `endl` starts a new line',
1, 50);

-- Algorithms Lessons
INSERT OR IGNORE INTO lessons (id, title, description, category, difficulty, content, "order", xp_reward) VALUES
  ('lesson_algo_1', 'What are Algorithms?', 'Learn the basics of algorithms.', 'algorithms', 'easy',
'# What are Algorithms?\n\nAn algorithm is a step-by-step procedure for solving a problem.\n\n## Example: Making a Sandwich\n1. Get two slices of bread\n2. Spread butter on one side\n3. Add filling\n4. Put the second slice on top\n\n## Computer Algorithms\nComputers use algorithms too!\n\n```python\ndef linear_search(list, target):\n    for i in range(len(list)):\n        if list[i] == target:\n            return i\n    return -1\n```',
1, 75);

INSERT OR IGNORE INTO lessons (id, title, description, category, difficulty, content, "order", xp_reward) VALUES
  ('lesson_algo_2', 'Sorting - Bubble Sort', 'Learn one of the simplest sorting algorithms.', 'algorithms', 'medium',
'# Bubble Sort\n\nBubble sort repeatedly steps through a list, compares adjacent elements, and swaps them if they are in the wrong order.\n\n```python\ndef bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr\n\nnumbers = [64, 34, 25, 12, 22, 11, 90]\nsorted_nums = bubble_sort(numbers)\nprint(sorted_nums)\n```\n\n## How it Works\n- Pass through the list from left to right\n- If adjacent elements are in wrong order, swap them\n- The largest element "bubbles up" to its correct position\n- Repeat until the list is sorted',
2, 150);
