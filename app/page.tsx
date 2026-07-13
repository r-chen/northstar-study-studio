"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Task = {
  id: string;
  title: string;
  note: string;
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
const task = (title: string, note: string): Task => ({
  id: uid(),
  title,
  note,
  done: false,
});

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
        task("Take a no-pressure Grade 8 math check-in", "Try 12–15 mixed questions. Mark topics as green, yellow, or red; do not chase a score."),
        task("Refresh fractions, ratios, and percentages", "Solve a short mixed set, then write one real-life example for each idea."),
        task("Algebra: simplify and solve", "Practise distributive property and one- and two-step equations. Check every answer by substitution."),
        task("Explore linear relations", "Make a table, graph, and equation for the same pattern. Describe slope in plain language."),
        task("Geometry and measurement review", "Work with area, volume, Pythagorean theorem, and unit conversions."),
        task("Data and probability mini-lab", "Use a small real dataset; find centre and spread, then make one honest graph."),
        task("Solve one rich problem two ways", "Choose a Waterloo CEMC-style problem. Show two approaches and compare them."),
        task("Create a one-page math field guide", "Record the five ideas you most want available on the first week of school."),
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
        task("Set up a science notebook", "Create sections for questions, evidence, vocabulary, diagrams, and reflections."),
        task("Review lab safety and measurement", "Learn common symbols, SI units, significant observations, and how to write a fair test."),
        task("Chemistry preview: atoms and elements", "Build a visual explanation of atoms, ions, elements, and compounds."),
        task("Physics preview: electricity", "Sketch series and parallel circuits and explain current, voltage, and resistance."),
        task("Biology preview: ecosystems", "Make a local food web and predict what happens when one population changes."),
        task("Earth science: climate evidence", "Read one reputable explainer and separate observations, models, and conclusions."),
        task("Run a safe mini-investigation", "Ask a testable question using household materials; record method, data, and limitations."),
        task("Make a two-minute science explainer", "Teach one concept with a hand-drawn diagram and clear, accurate language."),
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
        task("Choose one summer anchor book", "Pick a novel or nonfiction book you genuinely want to finish; read for one full block."),
        task("Practise active annotation", "Mark a page for questions, patterns, surprises, and one sentence worth discussing."),
        task("Write a 150-word summary", "Capture the central idea without retelling every event. Revise for precision."),
        task("Build a strong analytical paragraph", "Use a claim, specific evidence, explanation, and a closing connection."),
        task("Draft a 500-word short story", "Start with a character who wants something and introduce a meaningful obstacle."),
        task("Revise for voice and clarity", "Read the story aloud; improve five sentences and remove details that do not earn their place."),
        task("Prepare a three-minute book talk", "Introduce the work, one big idea, and who might enjoy it—without reading a script."),
        task("Start a personal word bank", "Collect 12 useful words from real reading and write an original sentence for each."),
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
        task("Set up a project journal", "For each build, record the goal, plan, bugs, decisions, and what to try next."),
        task("Python basics: values and input", "Use variables, numbers, strings, input, and formatted output in a tiny program."),
        task("Python decisions and loops", "Build a number game or quiz using conditions and repetition."),
        task("Functions: make code reusable", "Turn repeated logic into two named functions and test unusual inputs."),
        task("Represent information with lists", "Make a reading, music, or game-data tracker that can add and summarize items."),
        task("Design a tiny useful tool", "Plan a calculator, study helper, story generator, or game-related data tool."),
        task("Build and debug the first version", "Work in small steps; write down three bugs and how they were found."),
        task("Publish a project reflection", "Include a screenshot, what it does, the hardest part, and one next improvement."),
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
        task("Begin a summer visual journal", "Fill one spread with sketches, colour notes, collage, or observations from the week."),
        task("Observational drawing study", "Draw one ordinary object from three angles; focus on shape, value, and proportion."),
        task("Create with a constraint", "Make a piece using only three colours, one material, or ten repeated shapes."),
        task("Finish one small artwork or craft", "Choose a clear stopping point, photograph it well, and give it a title."),
        task("Write a short artist statement", "In 100 words: intention, choices, challenge, and what changed during the work."),
        task("Music: focused technique block", "Warm up, isolate four difficult measures, slow them down, then play in context."),
        task("Music: record and listen", "Record one piece, name two strengths and one specific next step."),
        task("Curate a mini portfolio", "Choose 3–5 works that show range and growth; add a short caption to each."),
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
        task("Build one trusted capture system", "Choose one place for every deadline and commitment. Practise entering five sample assignments with due dates and next actions."),
        task("Create the school command centre", "Set up matching paper and digital folders, a file-naming rule, and a home landing spot for the backpack and forms."),
        task("Research the public student resources", "Find the school calendar, guidance, library, technology support, clubs or athletics page, and student handbook. Keep personal details out of notes."),
        task("Design a 20-minute weekly reset", "Clear papers, check the calendar, review every course, choose priorities, and prepare the bag. Test the checklist once this summer."),
        task("Practise asking for help early", "Write and role-play a respectful teacher conversation: what I tried, where I am stuck, and the specific help I need."),
        task("Write a professional school email", "Use a useful subject line, greeting, concise context, clear question, thanks, and full name. Proofread before sending."),
        task("Make a September activity shortlist", "Choose two broad categories to investigate—such as STEM, service, music, art, culture, or athletics. Wait for current school announcements before choosing a group."),
        task("Build a contribution ladder", "For a future group, list four levels: attend, help, own a small task, then improve or lead a project. The first goal is simply to participate."),
        task("Run a tiny leadership experiment", "Organize one family, friend, or community activity this summer. Set a goal, invite people, divide work, and follow up."),
        task("Write a first-month reflection template", "Prepare five prompts: what energized me, what was hard, who helped, how I contributed, and what I will adjust."),
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
          setData(parsed);
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
                  <div><strong>{item.title}</strong><p>{item.note}</p></div>
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
