import type { Difficulty } from "../types";

export type TopicKey =
  | "java"
  | "python"
  | "javascript"
  | "electricity"
  | "math"
  | "english"
  | "science"
  | "history"
  | "chemistry"
  | "generic";

interface TopicBank {
  label: string;
  subject: string;
  mcq: string[];
  short: string[];
  diagram: string[];
  numerical: string[];
  long: string[];
  caseStudy: string[];
  answers: Record<string, string>;
}

const BANKS: Record<TopicKey, TopicBank> = {
  java: {
    label: "Java Programming",
    subject: "Computer Science (Java)",
    mcq: [
      "Which keyword is used to inherit a class in Java?",
      "What is the default value of a boolean instance variable in Java?",
      "Which collection class does not allow duplicate elements?",
      "Which access modifier makes a member visible only within its package?",
    ],
    short: [
      "Explain the difference between JDK, JRE, and JVM.",
      "What is method overloading? Give one example in Java.",
      "Define encapsulation and explain why it is useful in OOP.",
      "What is the purpose of the `final` keyword in Java?",
    ],
    diagram: [
      "Draw a class diagram showing inheritance between `Animal` and `Dog` with at least two methods.",
      "Illustrate the Java memory model showing Stack and Heap for object creation.",
    ],
    numerical: [
      "Write a Java program to find the factorial of n using a loop. Show dry run for n = 5.",
      "Trace the output of a nested loop that prints a number triangle pattern.",
    ],
    long: [
      "Explain exception handling in Java with try-catch-finally and one custom exception example.",
      "Describe multithreading in Java. Compare `Thread` class and `Runnable` interface.",
    ],
    caseStudy: [
      "A student’s Java program throws NullPointerException when calling a method on an uninitialized object. Identify the cause and suggest fixes.",
    ],
    answers: {
      inherit:
        "The `extends` keyword is used for inheritance in Java.",
      boolean:
        "The default value of a boolean instance variable is `false`.",
      encapsulation:
        "Encapsulation hides internal state using private fields and public methods, improving maintainability and security.",
      jdk:
        "JDK includes development tools; JRE runs programs; JVM executes bytecode.",
    },
  },
  python: {
    label: "Python Programming",
    subject: "Computer Science (Python)",
    mcq: [
      "Which of the following is mutable in Python?",
      "What is the output of `len('hello')`?",
      "Which keyword defines a function in Python?",
    ],
    short: [
      "Explain list comprehension with an example.",
      "What is the difference between a list and a tuple?",
      "Define a Python dictionary and its common use case.",
    ],
    diagram: [
      "Draw a flowchart to check whether a number is prime in Python.",
    ],
    numerical: [
      "Write a Python program to print the first 10 Fibonacci numbers.",
    ],
    long: [
      "Explain file handling in Python using `with open()` and exception handling.",
    ],
    caseStudy: [
      "A script fails with IndentationError. Explain common causes and how to fix them.",
    ],
    answers: {},
  },
  javascript: {
    label: "JavaScript",
    subject: "Computer Science (JavaScript)",
    mcq: [
      "Which keyword declares a block-scoped variable in ES6?",
      "What does `typeof null` return in JavaScript?",
    ],
    short: [
      "Explain event bubbling and event capturing in the DOM.",
      "What is the difference between `==` and `===`?",
    ],
    diagram: [
      "Sketch the event loop model for async JavaScript (call stack, web APIs, queue).",
    ],
    numerical: [],
    long: [
      "Explain closures in JavaScript with a practical example.",
    ],
    caseStudy: [],
    answers: {},
  },
  electricity: {
    label: "Electricity",
    subject: "Science (Physics)",
    mcq: [
      "Which of the following is a good conductor of electricity?",
      "What is the SI unit of electric current?",
      "Which material is commonly used for electroplating with chromium?",
    ],
    short: [
      "Define electroplating. Explain its purpose.",
      "State Ohm's law and write its mathematical form.",
      "What is the difference between series and parallel circuits?",
    ],
    diagram: [
      "Draw a labelled diagram of an electric circuit with a cell, switch, and bulb.",
      "Plot a graph showing the relationship between voltage and current for a resistor.",
    ],
    numerical: [
      "Calculate the resistance of a wire if 2A current flows when 12V is applied.",
      "Find the total resistance when 4Ω and 6Ω resistors are connected in series.",
    ],
    long: [
      "Explain heating effect of electric current with practical applications.",
    ],
    caseStudy: [
      "A household fuse blows frequently when multiple appliances run. Analyze the circuit load.",
    ],
    answers: {
      electroplating:
        "Electroplating coats a metal using electrolysis for corrosion resistance and appearance.",
      ohm: "Ohm's law: V = IR. Current is proportional to voltage for ohmic conductors.",
    },
  },
  math: {
    label: "Mathematics",
    subject: "Mathematics",
    mcq: [
      "What is the value of (-2)²?",
      "Which of the following is a rational number?",
    ],
    short: [
      "State the Pythagorean theorem and give one application.",
      "Define a prime number with two examples.",
    ],
    diagram: [
      "Draw a right triangle and label sides to illustrate the Pythagorean theorem.",
    ],
    numerical: [
      "Solve the quadratic equation x² - 5x + 6 = 0.",
      "Find the area of a circle with radius 7 cm. (Use π = 22/7)",
    ],
    long: [
      "Prove that the sum of angles in a triangle is 180°.",
    ],
    caseStudy: [],
    answers: {},
  },
  english: {
    label: "English",
    subject: "English",
    mcq: [
      "Choose the correct synonym of 'benevolent'.",
      "Identify the part of speech of the underlined word.",
    ],
    short: [
      "Write a paragraph on 'The Importance of Reading'.",
      "Define a metaphor and give one example.",
    ],
    diagram: [],
    numerical: [],
    long: [
      "Write a letter to the editor about reducing plastic waste in your city.",
    ],
    caseStudy: [],
    answers: {},
  },
  science: {
    label: "Science",
    subject: "Science",
    mcq: [
      "Which organelle is known as the powerhouse of the cell?",
      "What gas is released during photosynthesis?",
    ],
    short: [
      "Explain the water cycle with labelled stages.",
      "What is the difference between elements and compounds?",
    ],
    diagram: [
      "Draw and label the structure of a plant cell.",
    ],
    numerical: [
      "Calculate speed if distance = 150 m and time = 30 s.",
    ],
    long: [
      "Describe the human digestive system and the role of enzymes.",
    ],
    caseStudy: [],
    answers: {},
  },
  history: {
    label: "History",
    subject: "History",
    mcq: [
      "In which year did India gain independence?",
      "Who was the first Prime Minister of India?",
    ],
    short: [
      "Explain the causes of the Revolt of 1857.",
      "What was the Non-Cooperation Movement?",
    ],
    diagram: [],
    numerical: [],
    long: [
      "Discuss the impact of British colonial rule on Indian economy.",
    ],
    caseStudy: [],
    answers: {},
  },
  chemistry: {
    label: "Chemistry",
    subject: "Chemistry",
    mcq: [
      "What is the atomic number of Carbon?",
      "Which gas turns lime water milky?",
    ],
    short: [
      "Define an acid and a base according to Arrhenius theory.",
      "What is a mole? State Avogadro's number.",
    ],
    diagram: [
      "Draw the electron dot structure of water (H₂O).",
    ],
    numerical: [
      "Calculate the molecular mass of H₂SO₄. (H=1, S=32, O=16)",
    ],
    long: [
      "Explain the periodic trends of atomic radius across a period.",
    ],
    caseStudy: [],
    answers: {},
  },
  generic: {
    label: "General",
    subject: "General Studies",
    mcq: [],
    short: [],
    diagram: [],
    numerical: [],
    long: [],
    caseStudy: [],
    answers: {},
  },
};

export function extractTopic(title: string, additionalInfo?: string): string {
  const combined = `${title} ${additionalInfo || ""}`.trim();
  const patterns = [
    /\b(?:quiz|test|exam|assignment|paper)\s+on\s+(.+?)(?:\s*[-–|]|$)/i,
    /\b(?:quiz|test|exam)\s*:\s*(.+?)(?:\s*[-–|]|$)/i,
    /^(.+?)\s+(?:quiz|test|exam)$/i,
  ];

  for (const pattern of patterns) {
    const match = combined.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return title.replace(/^(quiz|test|exam|assignment)\s+/i, "").trim() || title;
}

export function detectTopicKey(
  title: string,
  additionalInfo?: string
): TopicKey {
  const topic = extractTopic(title, additionalInfo).toLowerCase();
  const combined = `${title} ${additionalInfo || ""}`.toLowerCase();

  const rules: [TopicKey, RegExp[]][] = [
    ["java", [/\bjava\b/, /\bjvm\b/, /\bjdk\b/]],
    ["python", [/\bpython\b/]],
    ["javascript", [/\bjavascript\b/, /\bjs\b/]],
    [
      "electricity",
      [
        /\belectric/,
        /\bcircuit/,
        /\bohm\b/,
        /\bresistance\b/,
        /\belectroplat/,
      ],
    ],
    ["math", [/\bmath/, /\balgebra/, /\bgeometry/, /\barithmetic/]],
    ["english", [/\benglish\b/, /\bgrammar\b/, /\bliterature\b/]],
    ["chemistry", [/\bchemist/, /\bacid\b/, /\bmolecule\b/]],
    ["history", [/\bhistory\b/, /\bindependence\b/, /\bcivilization\b/]],
    ["science", [/\bscience\b/, /\bphysics\b/, /\bbiology\b/]],
  ];

  for (const [key, patterns] of rules) {
    if (patterns.some((p) => p.test(topic) || p.test(combined))) {
      return key;
    }
  }

  return "generic";
}

type QuestionCategory =
  | "mcq"
  | "short"
  | "diagram"
  | "numerical"
  | "long"
  | "caseStudy";

function normalizeQuestionType(type: string): QuestionCategory {
  const t = type.toLowerCase();
  if (t.includes("multiple choice") || t.includes("mcq")) return "mcq";
  if (t.includes("diagram") || t.includes("graph")) return "diagram";
  if (t.includes("numerical")) return "numerical";
  if (t.includes("long")) return "long";
  if (t.includes("case study")) return "caseStudy";
  return "short";
}

function buildGenericQuestions(
  topic: string,
  type: QuestionCategory,
  count: number
): string[] {
  const label = topic.charAt(0).toUpperCase() + topic.slice(1);
  const templates: Record<string, string[]> = {
    mcq: [
      `Which statement best describes a fundamental concept of ${label}?`,
      `Identify the correct definition related to ${label}.`,
      `Choose the most accurate option about ${label}.`,
    ],
    short: [
      `Define a key term in ${label} and explain its importance.`,
      `Explain two main concepts students must know about ${label}.`,
      `What are the applications of ${label} in real life?`,
    ],
    diagram: [
      `Draw a labelled diagram illustrating a core idea of ${label}.`,
      `Sketch a flowchart explaining a process in ${label}.`,
    ],
    numerical: [
      `Solve a practice problem based on ${label}. Show all steps.`,
      `Calculate the result for a standard ${label} exercise.`,
    ],
    long: [
      `Write a detailed answer explaining the principles of ${label} with examples.`,
    ],
    caseStudy: [
      `Read the scenario related to ${label} and answer with reasoning.`,
    ],
  };

  const pool = templates[type] || templates.short;
  return Array.from({ length: count }, (_, i) => {
    const base = pool[i % pool.length];
    return count > pool.length ? `${base} (Q${i + 1})` : base;
  });
}

export function getQuestionsForType(
  topicKey: TopicKey,
  topicLabel: string,
  questionType: string,
  count: number
): string[] {
  const bank = BANKS[topicKey];
  const category = normalizeQuestionType(questionType);
  const pool = bank[category];

  if (pool.length >= count) {
    return pool.slice(0, count);
  }

  const fromBank = [...pool];
  const generic = buildGenericQuestions(topicLabel, category, count - fromBank.length);
  const merged: string[] = [];

  for (let i = 0; i < count; i++) {
    if (i < fromBank.length) {
      merged.push(fromBank[i]);
    } else {
      merged.push(
        generic[i - fromBank.length] ||
          buildGenericQuestions(topicLabel, category, 1)[0]
      );
    }
  }

  return merged;
}

export function getTopicBank(topicKey: TopicKey): TopicBank {
  if (topicKey === "generic") {
    return BANKS.generic;
  }
  return BANKS[topicKey];
}

export function getMockAnswerForQuestion(
  questionText: string,
  topicKey: TopicKey,
  difficulty: Difficulty
): string {
  const bank = getTopicBank(topicKey);
  const lower = questionText.toLowerCase();

  for (const [keyword, answer] of Object.entries(bank.answers)) {
    if (lower.includes(keyword)) {
      return answer;
    }
  }

  const topic = bank.label;
  if (difficulty === "easy") {
    return `A clear, concise answer about ${topic} covering the basic definition and one example.`;
  }
  if (difficulty === "moderate") {
    return `A structured answer about ${topic} with definition, explanation, and a relevant example.`;
  }
  return `An in-depth answer about ${topic} including reasoning, examples, and practical application.`;
}

export function inferSubjectFromTopic(
  topicKey: TopicKey,
  topicLabel: string
): string {
  if (topicKey !== "generic") {
    return getTopicBank(topicKey).subject;
  }
  const label = topicLabel.charAt(0).toUpperCase() + topicLabel.slice(1);
  return label;
}
