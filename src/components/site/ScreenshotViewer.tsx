"use client";
import { useEffect, useId, useRef, useState, type ComponentProps } from "react";
import { ThemeScreenshot } from "./ThemeScreenshot";
import { Icon } from "./Icons";

type Props = ComponentProps<typeof ThemeScreenshot> & { title: string };

export function ScreenshotViewer({title, ...screenshot}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  return <>
    <button ref={trigger} className="screenshot-trigger" aria-haspopup="dialog" aria-controls={id}
      aria-label={"Enlarge " + title + " screenshot"} onClick={() => {dialog.current?.showModal(); setOpen(true);}}>
      <ThemeScreenshot {...screenshot}/><span className="screenshot-enlarge"><Icon name="expand"/>View full screenshot</span>
    </button>
    <dialog ref={dialog} id={id} className="screenshot-dialog" aria-labelledby={id + "-title"}
      onClick={event => {if(event.target === event.currentTarget) dialog.current?.close();}}
      onClose={() => {setOpen(false); trigger.current?.focus({preventScroll: true});}}>
      <div className="screenshot-viewer-panel">
        <div className="screenshot-viewer-heading"><div><h2 id={id + "-title"}>{title}</h2><p>Actual application. Fictional demo data. Scroll or swipe to inspect.</p></div>
          <button className="icon-button" autoFocus aria-label="Close screenshot" onClick={() => dialog.current?.close()}><Icon name="close"/></button></div>
        <div className="screenshot-pan">{open && <ThemeScreenshot {...screenshot} sizes="1800px"/>}</div>
        <p className="screenshot-viewer-note">Original capture, unchanged. Press Escape or use Close to return.</p>
      </div>
    </dialog>
  </>;
}
