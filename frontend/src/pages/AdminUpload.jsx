import React from "react";

export default function AdminUpload() {
  return (
    <section className="space-y-10">
      <div>
        <h1 className="font-display text-3xl">Admin Upload Dashboard</h1>
        <p className="mt-2 text-ink-soft">
          Upload Excel files, validate data integrity, and issue certificates in
          bulk.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="grid gap-4 rounded-3xl border border-dashed border-[#f0cdb0] bg-gradient-to-br from-white to-[#ffe9d6] p-7 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl shadow-lg">
            ⬆
          </div>
          <div className="font-display text-lg">
            Drop your Excel file here
          </div>
          <div className="text-xs text-ink-soft">
            Accepted: .xlsx, .xls · Max 5MB
          </div>
          <button className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,106,61,0.3)] transition hover:-translate-y-0.5">
            Choose File
          </button>
          <div className="text-xs text-ink-soft">
            Required fields: Certificate ID, Student Name, Domain, Start Date,
            End Date.
          </div>
        </div>
        <div className="rounded-3xl border border-[#f1e2d2] bg-white p-6 shadow-[0_12px_24px_rgba(15,27,45,0.08)]">
          <div className="text-xs uppercase tracking-[0.2em] text-ink-soft">
            Upload Checklist
          </div>
          <div className="mt-4 space-y-3 text-sm text-ink-soft">
            {[
              "Validate certificate IDs for uniqueness.",
              "Ensure start and end dates are formatted correctly.",
              "Check domains against approved internship list.",
              "Confirm student names match enrollment records.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[#f0d7c1] bg-[#f9f4ec] p-4"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          [
            "Smart Validation",
            "Auto-detect duplicate IDs and missing fields before issuing.",
          ],
          [
            "Auto Templates",
            "Generate on-brand certificates with prefilled data and signatures.",
          ],
          [
            "Secure Logs",
            "Every upload is tracked with timestamps and admin identity.",
          ],
        ].map(([title, copy]) => (
          <div
            key={title}
            className="rounded-3xl border border-[#f1e2d2] bg-white p-6 shadow-[0_12px_24px_rgba(15,27,45,0.08)]"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-ink-soft">
              Admin Tools
            </div>
            <div className="mt-3 text-lg font-semibold">{title}</div>
            <p className="mt-3 text-sm text-ink-soft">{copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
