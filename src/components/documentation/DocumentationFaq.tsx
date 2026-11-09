"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type MouseEvent } from "react";
import { useAnimate } from "motion/react-mini";

export type GuideQuestion = {q: string; a: string};
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function Question({item, number}: {item: GuideQuestion; number: number}) {
  const details = useRef<HTMLDetailsElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [, animate] = useAnimate();
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const intendedOpen = useRef(false);
  const sequence = useRef<symbol | null>(null);
  const id = useId();
  useEffect(() => {
    const element = details.current, answer = panel.current;
    return () => {
      sequence.current = null;
      animation.current?.stop();
      if (element) element.open = intendedOpen.current;
      answer?.style.removeProperty("height");
      answer?.style.removeProperty("opacity");
    };
  }, []);

  const toggle = async (event: MouseEvent<HTMLElement>) => {
    const element = details.current, answer = panel.current;
    if (!element || !answer) return; // Preserve native disclosure if enhancement is unavailable.
    event.preventDefault();
    const token = Symbol("faq-toggle");
    sequence.current = token;
    const open = animation.current ? !intendedOpen.current : !element.open;
    intendedOpen.current = open;
    animation.current?.stop();
    const wasOpen = element.open;
    const from = wasOpen ? answer.getBoundingClientRect().height : 0;
    element.open = true;
    element.dataset.expanded = String(open);
    answer.style.height = "auto";
    const to = open ? answer.scrollHeight : 0;
    answer.style.height = from + "px";
    if (!wasOpen) answer.style.opacity = "0";
    try {
      const controls = animate(answer, {height: to, opacity: open ? 1 : 0}, {duration: .3, ease: [.22, 1, .36, 1]});
      animation.current = controls;
      await controls;
    } catch {
      // Native disclosure remains usable if motion enhancement is unavailable.
    } finally {
      if (token === sequence.current) {
        element.open = open;
        answer.style.removeProperty("height");
        answer.style.removeProperty("opacity");
        animation.current = null;
      }
    }
  };

  return <details ref={details} className="docs-question">
    <summary onClick={toggle} aria-controls={id}>
      <span className="docs-question-number" aria-hidden="true">{String(number).padStart(2, "0")}</span>
      <span className="docs-question-label">{item.q}</span>
      <span className="docs-question-toggle" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none"><path d="M4 10h12M10 4v12"/></svg></span>
    </summary>
    <div ref={panel} id={id} className="docs-question-answer"><div className="docs-question-answer-inner"><p>{item.a}</p></div></div>
  </details>;
}

export function DocumentationFaq({questions}: {questions: GuideQuestion[]}) {
  const [query, setQuery] = useState("");
  const enhanced = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const search = query.trim().toLocaleLowerCase();
  const results = questions.map((item, index) => ({item, index})).filter(({item}) => (item.q + " " + item.a).toLocaleLowerCase().includes(search));
  return <div className="docs-faq-experience">
    {enhanced && <div className="docs-faq-tools"><label className="docs-faq-search"><svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg><input type="search" aria-label="Find an answer in common questions" placeholder="Find an answer&#8230;" value={query} onChange={event => setQuery(event.target.value)}/></label><span className="docs-faq-count" role="status">{results.length} {results.length === 1 ? "answer" : "answers"}</span></div>}
    <div className="docs-questions">{results.map(({item, index}) => <Question key={item.q} item={item} number={index + 1}/>)}</div>
    {results.length === 0 && <div className="docs-faq-empty"><strong>A different question?</strong><p>Try searching for network, files or notifications.</p><button type="button" onClick={() => setQuery("")}>Show all answers <span aria-hidden="true">&#8599;</span></button></div>}
  </div>;
}
