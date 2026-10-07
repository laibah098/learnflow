LearnFlow — HTML, CSS and JavaScript only

1. Extract this folder and open it in VS Code.
2. Right-click index.html and choose Open with Live Server.
3. Navigate with the sidebar.

Pages: index.html, courses.html, tasks.html, notes.html, quiz.html, timer.html.
All pages use style.css and script.js. No build command or dependencies.

Course progress starts at zero. Mark lessons complete on Courses to update it.
Each subject has a five-question quiz with a separate saved latest score.
Tasks can be added, completed and deleted. Notes can be added, edited and deleted.
The focus timer resets when you leave its page. Dark mode is shared across pages.

Data is stored under learnflow-v2 in this browser's localStorage. It is not sent anywhere.
Use the same Live Server address and port to keep access to your saved data.
Clearing browser data removes it. It does not sync between devices or browsers.
The old demo's tasks, notes and scores are not imported into this new version.

Teaching approach:
First build one page with HTML. Then add shared CSS and links to other pages.
Teach input -> click -> function -> textContent with notes or tasks.
Use quizzes, arrays and localStorage as guided extension work; all features from
scratch would be too much for three one-hour beginner classes.
