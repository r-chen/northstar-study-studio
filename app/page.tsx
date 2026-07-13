"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Task = {
  id: string;
  title: string;
  note: string;
  resource?: {
    kind: "Book" | "Guide" | "Interactive" | "Lesson" | "Practice" | "Video";
    label: string;
    url: string;
  };
  done: boolean;
  completedAt?: string;
};

type Subject = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  weight: number;
  purpose: string;
  tasks: Task[];
};

type PlannerData = {
  subjects: Subject[];
  blockMinutes: 30 | 45;
};

const STORAGE_KEY = "northstar-study-studio-v3";
const uid = () => Math.random().toString(36).slice(2, 10);
const resource = (kind: NonNullable<Task["resource"]>["kind"], label: string, url: string) => ({ kind, label, url });
const task = (title: string, note: string, taskResource?: Task["resource"]): Task => ({
  id: uid(),
  title,
  note,
  resource: taskResource,
  done: false,
});

const resources = {
  mathCheckin: resource("Practice", "2025 Gauss Grade 8 Contest", "https://cemc.uwaterloo.ca/sites/default/files/documents/2025/2025Gauss8Contest.html"),
  mathPercentages: resource("Lesson", "CEMC Lesson 3: Percentages", "https://courseware.cemc.uwaterloo.ca/27/75/assignments/585/0"),
  mathEquations: resource("Lesson", "CEMC Lesson 10: Solving Two-Step Equations", "https://courseware.cemc.uwaterloo.ca/27/assignments/733/0"),
  mathLinear: resource("Lesson", "CEMC Lesson 2: Linear Relationships", "https://courseware.cemc.uwaterloo.ca/27/76/assignments/590/0"),
  mathGeometry: resource("Lesson", "CEMC Lesson 7: Volume and Capacity of a Cylinder", "https://courseware.cemc.uwaterloo.ca/27/95/assignments/896/0"),
  mathData: resource("Lesson", "CEMC Lesson 1: Mean, Median, and Mode", "https://courseware.cemc.uwaterloo.ca/27/94/assignments/847/0"),
  mathRichProblem: resource("Practice", "CEMC Problem D: Cheesecake Geometry", "https://cemc.uwaterloo.ca/sites/default/files/documents/2026/POTWD-25-G-N-18-P.pdf"),
  mathSolutions: resource("Guide", "2025 Gauss Grade 8 Worked Solutions", "https://cemc.uwaterloo.ca/sites/default/files/documents/2025/2025GaussSolution.html"),
  scienceNotebook: resource("Guide", "Science Buddies: Laboratory Notebooks", "https://www.sciencebuddies.org/science-fair-projects/science-fair/laboratory-notebooks-stem"),
  scienceSafety: resource("Guide", "Science Buddies: Safety Guidelines", "https://www.sciencebuddies.org/science-fair-projects/references/safety-guidelines"),
  atom: resource("Interactive", "PhET: Build an Atom", "https://phet.colorado.edu/en/simulations/build-an-atom"),
  circuit: resource("Interactive", "PhET: Circuit Construction Kit — DC", "https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc"),
  ecosystem: resource("Video", "Khan Academy: Ecology Introduction", "https://www.khanacademy.org/science/biology/ecology/intro-to-ecology/v/ecology-introduction"),
  climate: resource("Guide", "NASA: Evidence for Climate Change", "https://science.nasa.gov/climate-change/evidence/"),
  fairTest: resource("Guide", "Science Buddies: Doing a Fair Test", "https://www.sciencebuddies.org/science-fair-projects/science-fair/doing-a-fair-test-variables-for-beginners"),
  experiment: resource("Guide", "Science Buddies: Conducting an Experiment", "https://www.sciencebuddies.org/science-fair-projects/science-fair/conducting-an-experiment"),
  marrowThieves: resource("Book", "The Marrow Thieves — Cherie Dimaline", "https://www.cormorantbooks.com/Books/T/The-Marrow-Thieves"),
  criticalReading: resource("Guide", "U of T: Critical Reading Towards Critical Writing", "https://advice.writing.utoronto.ca/researching/critical-reading/"),
  summary: resource("Guide", "Purdue OWL: Quoting, Paraphrasing, and Summarizing", "https://owl.purdue.edu/owl/research_and_citation/using_research/quoting_paraphrasing_and_summarizing/index.html"),
  paragraphs: resource("Guide", "U of T: Paragraphs", "https://advice.writing.utoronto.ca/planning/paragraphs/"),
  creativeWriting: resource("Guide", "Purdue OWL: Creative Writing", "https://owl.purdue.edu/owl/subject_specific_writing/creative_writing/index.html"),
  revising: resource("Guide", "U of T: Revising and Editing", "https://advice.writing.utoronto.ca/revising/revising-and-editing/"),
  bookTalk: resource("Guide", "Scholastic: Student Booktalk Tips", "https://www.scholastic.com/content/dam/teachers/blogs/alycia-zimmerman/migrated-files/161501_bktlk_student_tips.pdf.pdf"),
  dictionary: resource("Guide", "Merriam-Webster Student Dictionary", "https://www.merriam-webster.com/kids"),
  csCircles: resource("Lesson", "Waterloo CS Circles: Start Here", "https://cscircles.cemc.uwaterloo.ca/"),
  pythonVariables: resource("Lesson", "CS Circles 1: Variables", "https://cscircles.cemc.uwaterloo.ca/1-variables/"),
  pythonLoops: resource("Lesson", "CS Circles 7C: Loops", "https://cscircles.cemc.uwaterloo.ca/7c-loops/"),
  pythonFunctions: resource("Lesson", "CS Circles 11B: How Functions Work", "https://cscircles.cemc.uwaterloo.ca/11b-how-functions-work/"),
  pythonLists: resource("Lesson", "CS Circles 13: Lists", "https://cscircles.cemc.uwaterloo.ca/13-lists/"),
  pythonScratch: resource("Video", "Waterloo CEMC: Python from Scratch", "https://open.cs.uwaterloo.ca/python-from-scratch/"),
  pythonDebug: resource("Lesson", "CS Circles 6D: Design, Debugging and Donuts", "https://cscircles.cemc.uwaterloo.ca/6d-design/"),
  pythonCheatSheet: resource("Guide", "CS Circles Python Cheatsheet", "https://cscircles.cemc.uwaterloo.ca/wp-content/plugins/pybox/files/cheatsheet.pdf"),
  sketchbook: resource("Book", "Tate: Your Sketchbook, Your Self", "https://shop.tate.org.uk/your-sketchbook-your-self/10358.html"),
  drawing: resource("Lesson", "National Gallery of Art: Drawing Everyday Objects", "https://www.nga.gov/educational-resources/lesson-drawing-everyday-objects"),
  constraint: resource("Guide", "MoMA: Make Art with Three Colours", "https://www.moma.org/momaorg/shared/pdfs/docs/learn/Make-Art-With-MoMA/2024_Make%20Art%20with%20MoMA-%20Amanda%20Williams.pdf"),
  artProcess: resource("Lesson", "National Gallery of Art: Process and Product — Drawing", "https://www.nga.gov/educational-resources/process-and-product/process-and-product-drawing"),
  artistStatement: resource("Guide", "RISD: Artist Statement", "https://careercenter.risd.edu/artist-statement"),
  fluteSlow: resource("Guide", "The Flute Practice: Slow It Down, Break It Down", "https://theflutepractice.com/blog/slow-it-down-break-it-down/"),
  fluteRecord: resource("Guide", "PracticeFlute: Practice Tips", "https://www.practiceflute.com/blog.html"),
  portfolio: resource("Guide", "National Gallery of Art: Process and Product", "https://www.nga.gov/educational-resources/process-and-product"),
  capture: resource("Guide", "Todoist: Getting Things Done", "https://www.todoist.com/productivity-methods/getting-things-done"),
  drive: resource("Guide", "Google Drive Help: Organize Your Files", "https://support.google.com/drive/answer/2375091"),
  schoolResearch: resource("Guide", "Ontario: Getting Ready for High School", "https://www.ontario.ca/page/getting-ready-high-school"),
  weeklyReview: resource("Guide", "Todoist: The Weekly Review", "https://www.todoist.com/productivity-methods/weekly-review"),
  askForHelp: resource("Guide", "Kids Help Phone: How to Ask for Help", "https://kidshelpphone.ca/get-info/how-to-ask-for-help/"),
  email: resource("Guide", "Purdue OWL: Email Etiquette", "https://owl.purdue.edu/owl/general_writing/academic_writing/email_etiquette.html"),
  activities: resource("Guide", "Ontario: Volunteering in Ontario", "https://www.ontario.ca/page/volunteering-ontario"),
  projectCycle: resource("Guide", "Middlebury: The Project Cycle", "https://www.middlebury.edu/projects-for-peace/summer-grants/project-cycle"),
  reflection: resource("Guide", "Providence College: Student Reflection Toolkit", "https://engaged-learning.providence.edu/engaged-learning/reflective-practice/student-toolkit/"),
} satisfies Record<string, NonNullable<Task["resource"]>>;

const mergeStarterResources = (saved: PlannerData): PlannerData => {
  const defaults = starterData();
  const defaultSubjects = new Map(defaults.subjects.map((subject) => [subject.id, subject]));

  return {
    ...saved,
    subjects: saved.subjects.map((subject) => {
      const defaultSubject = defaultSubjects.get(subject.id);
      if (!defaultSubject) return subject;
      const defaultTasks = new Map(defaultSubject.tasks.map((item) => [item.title, item]));
      return {
        ...subject,
        tasks: subject.tasks.map((item) => {
          const defaultTask = defaultTasks.get(item.title);
          return defaultTask?.resource ? { ...item, note: defaultTask.note, resource: defaultTask.resource } : item;
        }),
      };
    }),
  };
};

const starterData = (): PlannerData => ({
  blockMinutes: 45,
  subjects: [
    {
      id: "math",
      name: "Math Foundations",
      shortName: "Math",
      color: "#e96b4c",
      weight: 22,
      purpose: "Build confident Grade 9 foundations and learn to explain why an answer works.",
      tasks: [
        task("Take a no-pressure Grade 8 math check-in", "Open the 2025 Gauss Grade 8 contest and answer Questions 1–15 without timing yourself. Mark each question green, yellow, or red; do not chase a score.", resources.mathCheckin),
        task("Refresh fractions, ratios, and percentages", "Complete CEMC’s Percentages lesson through the practice section, then write one real-life example connecting a fraction, decimal, and percent.", resources.mathPercentages),
        task("Algebra: simplify and solve", "Complete the Two-Step Equations lesson and its checks. Verify at least three answers by substituting them into the original equations.", resources.mathEquations),
        task("Explore linear relations", "Complete the Linear Relationships lesson. For one example, copy its table, graph, and equation and describe the relationship in plain language.", resources.mathLinear),
        task("Geometry and measurement review", "Complete the Volume and Capacity of a Cylinder lesson, including at least three exercises. Draw and label the formula before using it.", resources.mathGeometry),
        task("Data and probability mini-lab", "Complete the Mean, Median, and Mode lesson, then calculate all three measures for a small dataset from daily life and write one conclusion.", resources.mathData),
        task("Solve one rich problem two ways", "Solve Cheesecake Geometry without opening a solution. Show two approaches or representations, circle the key insight, and compare which is clearer.", resources.mathRichProblem),
        task("Create a one-page math field guide", "Review worked solutions for the Gauss questions you attempted. Build a one-page guide with five useful ideas, one diagram, and one mistake to avoid.", resources.mathSolutions),
      ],
    },
    {
      id: "science",
      name: "Science Explorer",
      shortName: "Science",
      color: "#4c8f80",
      weight: 20,
      purpose: "Prepare for Grade 9 science while testing which STEM questions feel exciting.",
      tasks: [
        task("Set up a science notebook", "Follow the notebook guide and create sections for questions, evidence, vocabulary, diagrams, and reflections.", resources.scienceNotebook),
        task("Review lab safety and measurement", "Read the safety guide and make a 10-item checklist covering hazards, protective steps, SI units, and observations.", resources.scienceSafety),
        task("Chemistry preview: atoms and elements", "Complete the first two levels of the simulation, then draw and label an atom, ion, element, and compound.", resources.atom),
        task("Physics preview: electricity", "Build one series and one parallel circuit in the simulation. Sketch both and explain current, voltage, and resistance.", resources.circuit),
        task("Biology preview: ecosystems", "Watch the ecology introduction, make a local food web, and predict what happens when one population changes.", resources.ecosystem),
        task("Earth science: climate evidence", "Read NASA’s evidence page and make two columns: direct observations and conclusions supported by them.", resources.climate),
        task("Run a safe mini-investigation", "Use the fair-test guide to plan one household-material investigation; identify one variable to change and three to control.", resources.fairTest),
        task("Make a two-minute science explainer", "Use the experiment guide as a structure: question, method, evidence, conclusion, and limitation. Teach it with one hand-drawn diagram.", resources.experiment),
      ],
    },
    {
      id: "english",
      name: "Reading & Writing",
      shortName: "English",
      color: "#7a67a8",
      weight: 10,
      purpose: "Strengthen the reading, argument, and storytelling skills used in every high-school subject.",
      tasks: [
        task("Choose one summer anchor book", "Preview The Marrow Thieves and decide whether it sparks interest. If yes, read for one full block; if not, choose another age-appropriate book.", resources.marrowThieves),
        task("Practise active annotation", "Read the practical tips, then mark two pages for questions, patterns, surprises, and one sentence worth discussing.", resources.criticalReading),
        task("Write a 150-word summary", "Use the summary guide to capture only the central idea and key support. Revise until it is 130–170 words.", resources.summary),
        task("Build a strong analytical paragraph", "Follow the paragraph guide: claim, specific evidence, explanation, and a closing connection.", resources.paragraphs),
        task("Draft a 500-word short story", "Read one creative-writing topic, then draft a story about a character who wants something and meets a meaningful obstacle.", resources.creativeWriting),
        task("Revise for voice and clarity", "Use the revision checklist, read the story aloud, improve five sentences, and remove two details that do not earn their place.", resources.revising),
        task("Prepare a three-minute book talk", "Use the tips sheet to prepare an opening hook, one big idea, and an audience recommendation. Deliver it without reading a script.", resources.bookTalk),
        task("Start a personal word bank", "Collect 12 useful words from real reading. Check each meaning and write one original sentence in the student dictionary.", resources.dictionary),
      ],
    },
    {
      id: "coding",
      name: "Coding & Making",
      shortName: "Coding",
      color: "#3c78a8",
      weight: 18,
      purpose: "Turn STEM ability and creative interests into small, finishable projects.",
      tasks: [
        task("Set up a project journal", "Open CS Circles and create a journal page with five headings: goal, plan, code tried, bugs, and next step.", resources.csCircles),
        task("Python basics: values and input", "Complete the Variables lesson and its exercises. Then change one example so it prints a personalized, non-private message.", resources.pythonVariables),
        task("Python decisions and loops", "Complete the Loops lesson, then build a five-question quiz or number game using conditions and repetition.", resources.pythonLoops),
        task("Functions: make code reusable", "Read how functions work, turn repeated logic into two named functions, and test one unusual input.", resources.pythonFunctions),
        task("Represent information with lists", "Complete the Lists lesson, then make a reading, music, or game-data tracker that adds and summarizes items.", resources.pythonLists),
        task("Design a tiny useful tool", "Watch one Python from Scratch module, then sketch inputs, outputs, and three features for a calculator, study helper, or story generator.", resources.pythonScratch),
        task("Build and debug the first version", "Use the debugging lesson while building in small steps. Record three bugs, their symptoms, and the fixes.", resources.pythonDebug),
        task("Publish a project reflection", "Use the cheatsheet to tidy the code, then write a reflection with a screenshot, purpose, hardest part, and one next improvement.", resources.pythonCheatSheet),
      ],
    },
    {
      id: "creative",
      name: "Creative Portfolio",
      shortName: "Create",
      color: "#d59a36",
      weight: 8,
      purpose: "Keep art and music joyful while developing the habit of finishing and explaining creative work.",
      tasks: [
        task("Begin a summer visual journal", "Use the book preview for inspiration, then fill one spread with sketches, colour notes, collage, or observations from the week.", resources.sketchbook),
        task("Observational drawing study", "Follow the everyday-objects lesson and draw one object from three angles, focusing on shape, value, and proportion.", resources.drawing),
        task("Create with a constraint", "Use MoMA’s activity to make one piece with only three colours. Photograph the finished result.", resources.constraint),
        task("Finish one small artwork or craft", "Use the process prompts to decide what ‘finished’ means, make the final changes, photograph it well, and give it a title.", resources.artProcess),
        task("Write a short artist statement", "Use the RISD prompts to write 100 words covering intention, choices, challenge, and what changed during the work.", resources.artistStatement),
        task("Music: focused technique block", "Use the slow-practice method: warm up, isolate four difficult measures, slow them down, then play them in context.", resources.fluteSlow),
        task("Music: record and listen", "Follow one recording tip, record a complete take, and name two strengths plus one specific next step.", resources.fluteRecord),
        task("Curate a mini portfolio", "Use the process-and-product examples to choose 3–5 works showing range and growth, then add a two-sentence caption to each.", resources.portfolio),
      ],
    },
    {
      id: "launch",
      name: "Organization & Leadership",
      shortName: "Lead",
      color: "#b85f7b",
      weight: 22,
      purpose: "Build a dependable personal system now, research public school resources, and save activity choices for September.",
      tasks: [
        task("Build one trusted capture system", "Read the capture section, choose one place for every commitment, and enter five sample assignments with due dates and next actions.", resources.capture),
        task("Create the school command centre", "Use the file-organization guide to set up matching paper and digital folders, a naming rule, and a home landing spot for forms.", resources.drive),
        task("Research the public student resources", "Use the Ontario overview as a checklist, then find public calendar, guidance, library, technology, activity, and handbook pages. Save no personal details.", resources.schoolResearch),
        task("Design a 20-minute weekly reset", "Adapt the weekly-review checklist: clear papers, check the calendar, review courses, choose priorities, and prepare the bag. Test it once.", resources.weeklyReview),
        task("Practise asking for help early", "Read the help-seeking guide, then role-play: what I tried, where I am stuck, and the specific help I need.", resources.askForHelp),
        task("Write a professional school email", "Use the etiquette guide to draft a useful subject line, greeting, concise context, clear question, thanks, and signature. Do not send it.", resources.email),
        task("Make a September activity shortlist", "Browse the youth-opportunities categories and shortlist two areas—such as STEM, service, music, art, culture, or athletics—to investigate in September.", resources.activities),
        task("Build a contribution ladder", "Use the project cycle to list four future levels: attend, help, own a small task, then improve or lead a project.", resources.projectCycle),
        task("Run a tiny leadership experiment", "Use the project cycle to organize one family, friend, or community activity: define the goal, invite people, divide work, and follow up.", resources.projectCycle),
        task("Write a first-month reflection template", "Use the reflection toolkit to prepare five prompts: what energized me, what was hard, who helped, how I contributed, and what I will adjust.", resources.reflection),
      ],
    },
  ],
});

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export default function Home() {
  const [data, setData] = useState<PlannerData>(starterData);
  const [hydrated, setHydrated] = useState(false);
  const [activeId, setActiveId] = useState("math");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const rotationRef = useRef(0);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- browser storage is intentionally restored after hydration */
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PlannerData;
        if (parsed.subjects?.length) {
          setData(mergeStarterResources(parsed));
          setActiveId(parsed.subjects[0].id);
          setSecondsLeft(parsed.blockMinutes * 60);
        }
      }
    } catch {
      // A corrupt local preference should never make the planner unusable.
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  useEffect(() => {
    if (!timerRunning) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  const active = data.subjects.find((subject) => subject.id === activeId) ?? data.subjects[0];
  const allTasks = data.subjects.flatMap((subject) => subject.tasks);
  const doneCount = allTasks.filter((item) => item.done).length;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = allTasks.filter((item) => item.completedAt?.startsWith(today)).length;

  const wheelBackground = useMemo(() => {
    const total = data.subjects.reduce((sum, subject) => sum + Math.max(subject.weight, 1), 0);
    const result = data.subjects.reduce(
      (accumulator, subject) => {
        const nextCursor = accumulator.cursor + Math.max(subject.weight, 1);
        const start = (accumulator.cursor / total) * 360;
        const end = (nextCursor / total) * 360;
        return {
          cursor: nextCursor,
          stops: [...accumulator.stops, `${subject.color} ${start}deg ${end}deg`],
        };
      },
      { cursor: 0, stops: [] as string[] },
    );
    return `conic-gradient(${result.stops.join(", ")})`;
  }, [data.subjects]);

  const chooseSubject = () => {
    if (spinning || !data.subjects.length) return;
    const total = data.subjects.reduce((sum, subject) => sum + Math.max(subject.weight, 1), 0);
    let ticket = Math.random() * total;
    let index = 0;
    for (let i = 0; i < data.subjects.length; i += 1) {
      ticket -= Math.max(data.subjects[i].weight, 1);
      if (ticket <= 0) {
        index = i;
        break;
      }
    }
    const before = data.subjects.slice(0, index).reduce((sum, subject) => sum + Math.max(subject.weight, 1), 0);
    const chosenWeight = Math.max(data.subjects[index].weight, 1);
    const targetMid = ((before + chosenWeight / 2) / total) * 360;
    const currentMod = ((rotationRef.current % 360) + 360) % 360;
    const desiredMod = (360 - targetMid) % 360;
    const adjustment = (desiredMod - currentMod + 360) % 360;
    const nextRotation = rotationRef.current + 5 * 360 + adjustment;
    rotationRef.current = nextRotation;
    setRotation(nextRotation);
    setSelectedId(null);
    setSpinning(true);
    window.setTimeout(() => {
      const chosen = data.subjects[index];
      setSelectedId(chosen.id);
      setActiveId(chosen.id);
      setSpinning(false);
    }, 2400);
  };

  const toggleTask = (subjectId: string, taskId: string) => {
    setData((current) => ({
      ...current,
      subjects: current.subjects.map((subject) =>
        subject.id !== subjectId
          ? subject
          : {
              ...subject,
              tasks: subject.tasks.map((item) =>
                item.id !== taskId
                  ? item
                  : {
                      ...item,
                      done: !item.done,
                      completedAt: !item.done ? new Date().toISOString() : undefined,
                    },
              ),
            },
      ),
    }));
  };

  const addTask = () => {
    const title = newTask.trim();
    if (!title || !active) return;
    setData((current) => ({
      ...current,
      subjects: current.subjects.map((subject) =>
        subject.id === active.id
          ? { ...subject, tasks: [...subject.tasks, task(title, "A custom focus block.")] }
          : subject,
      ),
    }));
    setNewTask("");
  };

  const setBlockLength = (minutes: 30 | 45) => {
    setData((current) => ({ ...current, blockMinutes: minutes }));
    setTimerRunning(false);
    setSecondsLeft(minutes * 60);
  };

  const updateSubject = (id: string, patch: Partial<Subject>) => {
    setData((current) => ({
      ...current,
      subjects: current.subjects.map((subject) =>
        subject.id === id ? { ...subject, ...patch } : subject,
      ),
    }));
  };

  const addSubject = () => {
    const id = uid();
    setData((current) => ({
      ...current,
      subjects: [
        ...current.subjects,
        {
          id,
          name: "New Workstream",
          shortName: "New",
          color: "#687b8f",
          weight: 10,
          purpose: "Add a short reason this workstream matters.",
          tasks: [],
        },
      ],
    }));
    setActiveId(id);
  };

  const removeSubject = (id: string) => {
    if (data.subjects.length <= 2) return;
    const next = data.subjects.filter((subject) => subject.id !== id);
    setData((current) => ({ ...current, subjects: next }));
    if (activeId === id) setActiveId(next[0].id);
  };

  const resetPlan = () => {
    if (!window.confirm("Replace all subjects, tasks, and progress with the original sample plan?")) return;
    const fresh = starterData();
    setData(fresh);
    setActiveId(fresh.subjects[0].id);
    setSelectedId(null);
    setBlockLength(fresh.blockMinutes);
  };

  if (!hydrated || !active) return <main className="loading">Opening the studio…</main>;

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Northstar Study Studio home">
          <span className="brand-mark">N</span>
          <span><strong>Northstar</strong><small>study studio</small></span>
        </a>
        <div className="header-actions">
          <div className="progress-pill" title={`${doneCount} of ${allTasks.length} starter lessons complete`}>
            <span>{todayCount}</span> blocks today · {doneCount}/{allTasks.length} complete
          </div>
          <button className="button quiet" onClick={() => setEditing(true)}>Customize</button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Summer runway · Grade 9</p>
          <h1>A little progress,<br /><em>chosen with curiosity.</em></h1>
          <p className="lede">
            Complete 3–4 focused blocks, then enjoy the rest of the day. The goal is not to race ahead—it is to arrive confident, curious, and ready to make things.
          </p>
          <div className="daily-rule">
            <span className="rule-number">3–4</span>
            <span><strong>focus blocks</strong><small>30–45 minutes each · breaks between</small></span>
          </div>
          <div className="privacy-facts" aria-label="Privacy features">
            <span>No account</span><span>No name needed</span><span>Saved on this device</span><span>School-neutral</span>
          </div>
        </div>

        <div className="wheel-card" aria-label="Subject spinner">
          <div className="wheel-heading">
            <div><p className="eyebrow">Let chance choose</p><h2>What’s next?</h2></div>
            <span className="saved-note">Saved on this device</span>
          </div>
          <div className="wheel-stage">
            <div className="wheel-pointer" aria-hidden="true" />
            <div
              className="wheel"
              style={{ background: wheelBackground, transform: `rotate(${rotation}deg)` }}
            >
              <div className="wheel-centre"><span>✦</span></div>
            </div>
          </div>
          <div className="legend">
            {data.subjects.map((subject) => (
              <button key={subject.id} onClick={() => setActiveId(subject.id)}>
                <i style={{ background: subject.color }} />{subject.shortName}
              </button>
            ))}
          </div>
          <button className="button spin-button" onClick={chooseSubject} disabled={spinning}>
            {spinning ? "Choosing…" : "Spin for a subject"}
          </button>
          <p className={`selection ${selectedId ? "visible" : ""}`} aria-live="polite">
            {selectedId ? `Your next block: ${data.subjects.find((s) => s.id === selectedId)?.name}` : "Each slice reflects its adjustable wheel weight."}
          </p>
        </div>
      </section>

      <section className="workspace">
        <div className="section-heading">
          <div><p className="eyebrow">The workstreams</p><h2>Pick up where you left off</h2></div>
          <p>Lessons are deliberately block-sized. Start with the first unfinished item, or choose the one that feels most useful.</p>
        </div>

        <nav className="subject-tabs" aria-label="Workstreams">
          {data.subjects.map((subject) => {
            const completed = subject.tasks.filter((item) => item.done).length;
            return (
              <button
                key={subject.id}
                className={subject.id === active.id ? "active" : ""}
                style={{ "--subject": subject.color } as CSSProperties}
                onClick={() => setActiveId(subject.id)}
              >
                <span>{subject.shortName}</span><small>{completed}/{subject.tasks.length}</small>
              </button>
            );
          })}
        </nav>

        <div className="work-grid">
          <article className="lesson-panel" style={{ "--subject": active.color } as CSSProperties}>
            <div className="lesson-intro">
              <div><p className="eyebrow">Current workstream</p><h3>{active.name}</h3></div>
              <div className="completion-ring" aria-label={`${active.tasks.filter((item) => item.done).length} of ${active.tasks.length} complete`}>
                {active.tasks.filter((item) => item.done).length}<small>/{active.tasks.length}</small>
              </div>
            </div>
            <p className="purpose">{active.purpose}</p>
            <ol className="task-list">
              {active.tasks.map((item, index) => (
                <li key={item.id} className={item.done ? "done" : ""}>
                  <button className="check" onClick={() => toggleTask(active.id, item.id)} aria-label={`${item.done ? "Mark incomplete" : "Mark complete"}: ${item.title}`}>
                    {item.done ? "✓" : index + 1}
                  </button>
                  <div className="task-content">
                    <strong>{item.title}</strong>
                    <p className="task-action"><span>Do</span>{item.note}</p>
                    {item.resource && (
                      <a className="task-resource" href={item.resource.url} target="_blank" rel="noreferrer">
                        <span className="resource-kind">{item.resource.kind}</span>
                        <span>{item.resource.label}</span>
                        <span className="resource-open">Open ↗</span>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <div className="add-task">
              <input
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") addTask(); }}
                placeholder={`Add a ${active.shortName} lesson…`}
                aria-label={`Add a lesson to ${active.name}`}
              />
              <button onClick={addTask}>Add</button>
            </div>
          </article>

          <aside className="focus-panel">
            <p className="eyebrow">Focus companion</p>
            <h3>One block at a time.</h3>
            <div className="duration-toggle" aria-label="Block length">
              {[30, 45].map((minutes) => (
                <button key={minutes} className={data.blockMinutes === minutes ? "active" : ""} onClick={() => setBlockLength(minutes as 30 | 45)}>{minutes} min</button>
              ))}
            </div>
            <div className="timer">{formatTime(secondsLeft)}</div>
            <div className="timer-actions">
              <button className="button" onClick={() => setTimerRunning((value) => !value)}>{timerRunning ? "Pause" : secondsLeft === 0 ? "Finished" : "Start focus"}</button>
              <button className="button quiet" onClick={() => { setTimerRunning(false); setSecondsLeft(data.blockMinutes * 60); }}>Reset</button>
            </div>
            <div className="focus-steps">
              <div><span>1</span><p><strong>Choose one finish line</strong>What will be visibly done?</p></div>
              <div><span>2</span><p><strong>Silence the noise</strong>Phone away; one tab or book.</p></div>
              <div><span>3</span><p><strong>Leave a breadcrumb</strong>Write the very next step before stopping.</p></div>
            </div>
            <div className="screen-note">
              <strong>Make play feel good again.</strong>
              <p>Keep social apps out of focus blocks. After 3 solid blocks, online games with friends can be planned leisure—not something to feel guilty about.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="principles">
        <p className="eyebrow">The longer game</p>
        <h2>Strong applications grow from real interests.</h2>
        <div className="principle-grid">
          <div><span>01</span><h3>Foundations first</h3><p>Clear writing, mathematical reasoning, and dependable study habits compound across every course.</p></div>
          <div><span>02</span><h3>Explore before specializing</h3><p>Grade 9 is for noticing which problems create energy. Keep several STEM doors open.</p></div>
          <div><span>03</span><h3>Finish meaningful things</h3><p>A small project with reflection says more than a long list of activities done only for a résumé.</p></div>
          <div><span>04</span><h3>Join → help → own → lead</h3><p>Try two communities, become dependable in one, then take responsibility for a useful improvement.</p></div>
        </div>
      </section>

      <footer><span>Northstar Study Studio</span><p>No personal profile · device-local plan</p></footer>

      {editing && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(false); }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="customize-title">
            <div className="modal-head">
              <div><p className="eyebrow">Planner settings</p><h2 id="customize-title">Customize the wheel</h2></div>
              <button className="close" onClick={() => setEditing(false)} aria-label="Close customization">×</button>
            </div>
            <p className="modal-help">Names, colours, weights, tasks, and progress save only in this browser. Higher weights create larger wheel slices. Avoid entering a real name, school, address, contact details, or other sensitive information.</p>
            <div className="subject-settings">
              {data.subjects.map((subject) => (
                <div className="setting-row" key={subject.id}>
                  <input className="color-input" type="color" value={subject.color} onChange={(event) => updateSubject(subject.id, { color: event.target.value })} aria-label={`${subject.name} colour`} />
                  <label>Name<input value={subject.name} onChange={(event) => updateSubject(subject.id, { name: event.target.value, shortName: event.target.value.slice(0, 9) })} /></label>
                  <label>Wheel weight<input type="number" min="1" max="100" value={subject.weight} onChange={(event) => updateSubject(subject.id, { weight: Math.max(1, Number(event.target.value)) })} /></label>
                  <button className="remove" onClick={() => removeSubject(subject.id)} disabled={data.subjects.length <= 2}>Remove</button>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="button quiet danger" onClick={resetPlan}>Reset sample plan</button>
              <button className="button quiet" onClick={addSubject}>Add workstream</button>
              <button className="button" onClick={() => setEditing(false)}>Save & close</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
