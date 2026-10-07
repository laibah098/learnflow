// ========================================
// HELPERS
// ========================================

// A shorter way to find an element by its ID.
const $ = id => document.getElementById(id);

// Create an HTML element.
// textContent displays text without interpreting it as HTML.
function element(tag, text, className) {
    const node = document.createElement(tag);

    if (text !== undefined) {
        node.textContent = text;
    }

    if (className) {
        node.className = className;
    }

    return node;
}

// Create a button and connect it to a function.
function action(text, handler, className) {
    const button = element("button", text, className);

    button.type = "button";
    button.onclick = handler;

    return button;
}


// ========================================
// BROWSER STORAGE
// ========================================

let storageOK = true;
let state;

try {
    state = JSON.parse(
        localStorage.getItem("learnflow-v2")
    ) || {};
} catch {
    state = {};
    storageOK = false;
}

state.tasks = Array.isArray(state.tasks)
    ? state.tasks
    : [];

state.notes = Array.isArray(state.notes)
    ? state.notes
    : [];

state.completed = Array.isArray(state.completed)
    ? state.completed
    : [];

state.scores = state.scores || {};

function save() {
    try {
        localStorage.setItem(
            "learnflow-v2",
            JSON.stringify(state)
        );
    } catch {
        storageOK = false;
    }

    if (!storageOK) {
        $("storageMessage").textContent =
            "Browser storage is unavailable. Changes may not " +
            "survive navigation or refresh.";
    }
}


// ========================================
// COURSE CONTENT
// ========================================

// Each lesson contains:
// 1. Title
// 2. Explanation
// 3. Code example

const courses = [
    {
        id: "html",
        name: "HTML Basics",
        description: "Build the structure of a webpage.",

        lessons: [
            [
                "Headings and paragraphs",

                "Use h1 for the main heading, h2 for a " +
                "section heading, and p for a paragraph.",

                `<h1>My study page</h1>
<h2>Today's lesson</h2>
<p>I am learning HTML.</p>`
            ],

            [
                "Links and images",

                "A link uses href to choose its destination. " +
                "An image uses src for its file and alt " +
                "for a text description.",

                `<a href="https://example.com">Visit a website</a>
<img src="book.jpg" alt="An open book">`
            ],

            [
                "Inputs and buttons",

                "Inputs let users type. A button can run a " +
                "JavaScript function when clicked.",

                `<input id="name" placeholder="Your name">
<button onclick="greet()">Say hello</button>
<p id="message"></p>`
            ]
        ]
    },

    {
        id: "css",
        name: "CSS Styling",
        description: "Style text, spacing and cards.",

        lessons: [
            [
                "Connect your stylesheet",

                "Put CSS in style.css, then add this link " +
                "inside the HTML head.",

                `<link rel="stylesheet" href="style.css">`
            ],

            [
                "Colors and text",

                "A selector chooses what to style. Each " +
                "property changes part of its appearance.",

                `body {
    background-color: #f3f6fb;
    color: #20304b;
    font-family: Arial, sans-serif;
}`
            ],

            [
                "Spacing and cards",

                "Padding adds space inside a box; margin " +
                "adds space outside it. Border-radius " +
                "rounds its corners.",

                `.card {
    padding: 20px;
    margin: 15px;
    border: 1px solid #ddd;
    border-radius: 12px;
}`
            ]
        ]
    },

    {
        id: "js",
        name: "JavaScript",
        description: "Respond to clicks and read input.",

        lessons: [
            [
                "Connect JavaScript",

                "Create script.js. Link it just before the " +
                "closing body tag so the page elements " +
                "exist first.",

                `<script src="script.js"></script>`
            ],

            [
                "Functions and input",

                "A function groups instructions. Read input " +
                "with value and display plain text with " +
                "textContent. Try this with the HTML inputs " +
                "and buttons example.",

                `function greet() {
    let name = document.getElementById("name").value;

    document.getElementById("message").textContent =
        "Hello, " + name;
}`
            ],

            [
                "Make a decision",

                "An if statement runs different instructions " +
                "depending on a condition.",

                `let answer = "CSS";
let message = document.getElementById("message");

if (answer === "CSS") {
    message.textContent = "Correct!";
} else {
    message.textContent = "Try again.";
}`
            ]
        ]
    }
];


// ========================================
// DASHBOARD
// ========================================

function progress(course) {
    const completedLessons = course.lessons.filter(
        (lesson, index) => {
            return state.completed.includes(
                course.id + "-" + index
            );
        }
    );

    return Math.round(
        completedLessons.length / course.lessons.length * 100
    );
}

function courseCard(course) {
    const card = element("article", undefined, "card");

    card.append(
        element("h3", course.name),
        element("p", course.description)
    );

    const percent = progress(course);

    const bar = element("progress");
    bar.max = 100;
    bar.value = percent;

    bar.setAttribute(
        "aria-label",
        course.name + " progress"
    );

    const link = element("a", "Open lessons", "button");
    link.href = "courses.html#" + course.id;

    card.append(
        element("strong", percent + "% complete"),
        bar,
        link
    );

    return card;
}

// Only run this section on the dashboard page.
if ($("courses")) {
    courses.forEach(course => {
        $("courses").append(courseCard(course));
    });
}

if ($("stats")) {
    const completedTasks = state.tasks.filter(task => {
        return task.completed;
    }).length;

    const quizzesTaken = Object.values(state.scores).length;

    const stats = [
        ["Tasks completed", completedTasks],

        [
            "Lessons completed",
            state.completed.length + " / 9"
        ],

        [
            "Quizzes taken",
            quizzesTaken + " / 3"
        ]
    ];

    stats.forEach(([label, value]) => {
        const card = element("article", undefined, "card");

        card.append(
            element("p", label),
            element("h2", String(value))
        );

        $("stats").append(card);
    });
}


// ========================================
// LESSONS PAGE
// ========================================

if ($("lessons")) {
    courses.forEach(course => {
        const section = element("section");

        section.id = course.id;

        section.append(
            element("h2", course.name)
        );

        course.lessons.forEach(([title, text, code], index) => {
            const lessonID = course.id + "-" + index;

            const lesson = element(
                "article",
                undefined,
                "lesson"
            );

            const codeBlock = element("pre");

            codeBlock.append(
                element("code", code)
            );

            const button = action("", () => {
                if (state.completed.includes(lessonID)) {
                    state.completed = state.completed.filter(
                        id => id !== lessonID
                    );
                } else {
                    state.completed.push(lessonID);
                }

                save();
                updateButton();
            });

            function updateButton() {
                const completed =
                    state.completed.includes(lessonID);

                button.textContent = completed
                    ? "Completed — undo"
                    : "Mark lesson complete";

                button.setAttribute(
                    "aria-pressed",
                    String(completed)
                );
            }

            updateButton();

            lesson.append(
                element("h3", title),
                element("p", text),
                codeBlock,
                button
            );

            section.append(lesson);
        });

        $("lessons").append(section);
    });
}


// ========================================
// TASKS PAGE
// ========================================

function renderTasks() {
    const container = $("tasks");

    container.replaceChildren();

    if (state.tasks.length === 0) {
        container.append(
            element(
                "p",
                "No tasks yet. Add your first study goal."
            )
        );
    }

    state.tasks.forEach((task, index) => {
        const row = element(
            "div",
            undefined,
            "task" + (task.completed ? " done" : "")
        );

        const checkbox = element("input");

        checkbox.type = "checkbox";
        checkbox.id = "task-" + index;
        checkbox.checked = task.completed;

        checkbox.onchange = () => {
            task.completed = checkbox.checked;

            save();
            renderTasks();
        };

        const label = element("label", task.text);
        label.htmlFor = checkbox.id;

        const deleteButton = action(
            "Delete",
            () => {
                state.tasks.splice(index, 1);

                save();
                renderTasks();
            },
            "secondary"
        );

        row.append(
            checkbox,
            label,
            deleteButton
        );

        container.append(row);
    });
}

if ($("taskForm")) {
    $("taskForm").onsubmit = event => {
        event.preventDefault();

        const text = $("taskInput").value.trim();

        if (!text) {
            return;
        }

        state.tasks.push({
            text: text,
            completed: false
        });

        save();

        $("taskForm").reset();

        renderTasks();
    };

    renderTasks();
}


// ========================================
// NOTES PAGE
// ========================================

let editingNote = null;

function renderNotes() {
    const container = $("notes");

    container.replaceChildren();

    if (state.notes.length === 0) {
        container.append(
            element(
                "p",
                "No notes yet. Write something you learned."
            )
        );
    }

    state.notes.forEach((note, index) => {
        const card = element(
            "article",
            undefined,
            "card"
        );

        const controls = element(
            "div",
            undefined,
            "actions"
        );

        const editButton = action(
            "Edit",
            () => {
                editingNote = index;

                $("noteTitle").value = note.title;
                $("noteText").value = note.text;

                $("saveNote").textContent = "Update note";

                $("noteTitle").focus();
            },
            "secondary"
        );

        const deleteButton = action(
            "Delete",
            () => {
                state.notes.splice(index, 1);

                editingNote = null;

                $("noteForm").reset();

                $("saveNote").textContent = "Save note";

                save();
                renderNotes();
            },
            "secondary"
        );

        controls.append(
            editButton,
            deleteButton
        );

        card.append(
            element("h3", note.title),
            element("p", note.text, "note-body"),
            controls
        );

        container.append(card);
    });
}

if ($("noteForm")) {
    $("noteForm").onsubmit = event => {
        event.preventDefault();

        const title = $("noteTitle").value.trim();
        const text = $("noteText").value.trim();

        if (!title || !text) {
            return;
        }

        const note = {
            title: title,
            text: text
        };

        if (editingNote === null) {
            state.notes.push(note);
        } else {
            state.notes[editingNote] = note;
        }

        editingNote = null;

        save();

        $("noteForm").reset();

        $("saveNote").textContent = "Save note";

        renderNotes();
    };

    renderNotes();
}


// ========================================
// QUIZ QUESTIONS
// ========================================

// Each question contains:
// 1. Question text
// 2. Answer choices
// 3. Correct answer index
//
// Indexes start at 0:
// 0 = first answer, 1 = second answer, 2 = third answer.

const quizzes = {
    html: [
        [
            "What is HTML mainly used for?",
            ["Page structure", "Styling", "Timers"],
            0
        ],

        [
            "Which tag is a main heading?",
            ["<p>", "<h1>", "<img>"],
            1
        ],

        [
            "Which attribute gives a link its destination?",
            ["src", "color", "href"],
            2
        ],

        [
            "Which tag displays an image?",
            ["<img>", "<a>", "<button>"],
            0
        ],

        [
            "Which element lets a user type?",
            ["<h2>", "<input>", "<br>"],
            1
        ]
    ],

    css: [
        [
            "What does CSS control?",
            ["Database access", "Page appearance", "Quiz answers"],
            1
        ],

        [
            "Which property changes text color?",
            ["color", "width", "padding"],
            0
        ],

        [
            "Which property changes the background?",
            ["font-size", "margin", "background-color"],
            2
        ],

        [
            "Which property adds space inside a box?",
            ["margin", "padding", "border"],
            1
        ],

        [
            "Which property rounds corners?",
            ["text-align", "height", "border-radius"],
            2
        ]
    ],

    js: [
        [
            "What can JavaScript do?",
            ["Respond to clicks", "Replace the internet", "Only style text"],
            0
        ],

        [
            "What does a function contain?",
            ["Only images", "Reusable instructions", "CSS colors"],
            1
        ],

        [
            "How do you read an input's text?",
            [".value", ".color", ".href"],
            0
        ],

        [
            "What is if used for?",
            ["Adding images", "Making a decision", "Choosing a font"],
            1
        ],

        [
            "Which displays plain text safely?",
            ["innerHTML", "background", "textContent"],
            2
        ]
    ]
};


// ========================================
// QUIZ PAGE
// ========================================

let quizTopic;
let questionIndex;
let quizScore;

function renderLibrary() {
    const container = $("quizLibrary");

    container.replaceChildren();

    courses.forEach(course => {
        const card = element(
            "article",
            undefined,
            "card"
        );

        const score = state.scores[course.id];

        const scoreText = score === undefined
            ? "Not taken yet"
            : "Latest score: " + score + " / 5";

        const startButton = action(
            score === undefined ? "Start quiz" : "Try again",
            () => startQuiz(course.id)
        );

        card.append(
            element("h3", course.name + " quiz"),
            element("p", "5 questions"),
            element("p", scoreText),
            startButton
        );

        container.append(card);
    });
}

function startQuiz(topic) {
    quizTopic = topic;
    questionIndex = 0;
    quizScore = 0;

    $("quizArea").hidden = false;

    showQuestion();

    $("quizArea").scrollIntoView({
        behavior: "smooth"
    });
}

function showQuestion() {
    const area = $("quizArea");

    area.replaceChildren();

    const [question, choices, correct] =
        quizzes[quizTopic][questionIndex];

    const course = courses.find(course => {
        return course.id === quizTopic;
    });

    area.append(
        element(
            "p",
            course.name +
            " · Question " +
            (questionIndex + 1) +
            " of 5"
        ),
        element("h2", question)
    );

    const answers = element(
        "div",
        undefined,
        "answers"
    );

    const feedback = element("p");
    feedback.setAttribute("role", "status");

    let answered = false;

    const nextButton = action(
        questionIndex === 4 ? "See result" : "Next question",
        () => {
            if (!answered) {
                return;
            }

            questionIndex++;

            if (questionIndex < quizzes[quizTopic].length) {
                showQuestion();
            } else {
                finishQuiz();
            }
        }
    );

    nextButton.disabled = true;

    choices.forEach((choice, index) => {
        const button = action(choice, () => {
            if (answered) {
                return;
            }

            answered = true;

            Array.from(answers.children).forEach(
                (answerButton, answerIndex) => {
                    answerButton.disabled = true;

                    if (answerIndex === correct) {
                        answerButton.classList.add("correct");
                    }
                }
            );

            if (index === correct) {
                quizScore++;

                feedback.textContent = "Correct!";
            } else {
                button.classList.add("wrong");

                feedback.textContent =
                    "Correct answer: " + choices[correct];
            }

            nextButton.disabled = false;
        });

        answers.append(button);
    });

    area.append(
        answers,
        feedback,
        nextButton
    );
}

function finishQuiz() {
    state.scores[quizTopic] = quizScore;

    save();
    renderLibrary();

    const area = $("quizArea");

    area.replaceChildren(
        element("h2", "Quiz complete"),

        element(
            "p",
            "You scored " +
            quizScore +
            " / 5 (" +
            quizScore * 20 +
            "%)."
        ),

        action(
            "Try again",
            () => startQuiz(quizTopic)
        )
    );
}

if ($("quizLibrary")) {
    renderLibrary();
}


// ========================================
// FOCUS TIMER
// ========================================

let secondsLeft = 25 * 60;
let interval = null;
let deadline;

function showTime() {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    $("time").textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}

function stopTimer() {
    clearInterval(interval);
    interval = null;
}

function tick() {
    secondsLeft = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000)
    );

    showTime();

    if (secondsLeft === 0) {
        stopTimer();

        $("timerStatus").textContent =
            "Session complete. Take a break!";

        $("start").disabled = false;
    }
}

if ($("time")) {
    $("start").onclick = () => {
        if (interval !== null) {
            return;
        }

        if (secondsLeft === 0) {
            secondsLeft = 25 * 60;
        }

        deadline = Date.now() + secondsLeft * 1000;

        $("timerStatus").textContent =
            "Focus session running";

        $("start").disabled = true;

        tick();

        interval = setInterval(tick, 250);
    };

    $("pause").onclick = () => {
        if (interval !== null) {
            tick();
            stopTimer();

            $("timerStatus").textContent = secondsLeft === 0
                ? "Session complete. Take a break!"
                : "Paused";

            $("start").disabled = false;
        }
    };

    $("reset").onclick = () => {
        stopTimer();

        secondsLeft = 25 * 60;

        showTime();

        $("timerStatus").textContent =
            "Ready to focus";

        $("start").disabled = false;
    };

    showTime();
}


// ========================================
// DARK MODE
// ========================================

function showTheme() {
    document.body.classList.toggle(
        "dark",
        Boolean(state.dark)
    );

    $("theme").textContent = state.dark
        ? "Light mode"
        : "Dark mode";
}

$("theme").onclick = () => {
    state.dark = !state.dark;

    showTheme();
    save();
};

showTheme();

if (!storageOK) {
    save();
}