"use client";

import type { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

export function fieldIssues(errors: object, prefix = ""): { name: string; message: string }[] {
  return Object.entries(errors).flatMap(([key, value]) => {
    if (!value || typeof value !== "object" || key === "ref") return [];
    const name = prefix ? `${prefix}.${key}` : key;
    if (typeof value.message === "string") return [{ name, message: value.message }];
    return fieldIssues(value, name);
  });
}

export function accessibleRegister<T extends FieldValues>(register: UseFormRegister<T>, errors: FieldErrors<T>): UseFormRegister<T> {
  const issues = fieldIssues(errors);
  return (name, options) => ({ ...register(name, options), ...(issues.some(issue => issue.name === name)
    ? { "aria-invalid": true, "aria-describedby": `field-error-${name}` } : {}) });
}

export default function FormErrors({ errors }: { errors: object }) {
  const issues = fieldIssues(errors);
  if (!issues.length) return null;
  return <div role="alert" className="rounded-xl border border-rose-400/40 bg-rose-950/40 p-4 text-sm text-rose-200">
    <p className="font-semibold">Revisa los campos antes de guardar:</p>
    <ul className="mt-2 space-y-1">{issues.map(issue => <li key={issue.name} id={`field-error-${issue.name}`}>
      <button type="button" className="text-left underline underline-offset-4" onClick={event => {
        const field = event.currentTarget.form?.elements.namedItem(issue.name);
        if (field instanceof HTMLElement) field.focus();
      }}>{issue.message}</button>
    </li>)}</ul>
  </div>;
}
