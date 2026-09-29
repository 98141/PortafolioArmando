"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function Modal({ open, onClose, titleId, descriptionId, id, busy = false, className = "", children }: {
  open: boolean; onClose: () => void; titleId: string; descriptionId?: string;
  id?: string; busy?: boolean; className?: string; children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus();
      else document.getElementById("main-content")?.focus();
    };
  }, [open]);
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    if (busy) dialog.focus();
    else if (document.activeElement === dialog) dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [busy, open]);

  return <dialog ref={ref} id={id} tabIndex={-1} aria-labelledby={titleId} aria-describedby={descriptionId}
    aria-modal="true" aria-busy={busy || undefined}
    onKeyDown={event => {
      if (event.key !== "Tab") return;
      const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'
      )).filter(item => item.getClientRects().length > 0);
      const first = items[0], last = items[items.length - 1];
      if (!first) { event.preventDefault(); event.currentTarget.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}
    className={`app-dialog ${className}`}>{children}</dialog>;
}
