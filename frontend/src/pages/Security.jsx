import React from "react";

export default function Security() {
  return (
    <section className="space-y-10">
      <div>
        <h1 className="font-display text-3xl">Security & Data Integrity</h1>
        <p className="mt-2 text-ink-soft">
          Every record is validated, encrypted, and stored safely in MongoDB.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          [
            "Encrypted Login",
            "Secure authentication protects both admin and student data.",
          ],
          [
            "Import Validation",
            "Checks completeness and prevents duplicate IDs on upload.",
          ],
          [
            "Data Integrity",
            "Structured schemas ensure consistent and accurate records.",
          ],
        ].map(([title, copy]) => (
          <div
            key={title}
            className="rounded-3xl border border-[#f1e2d2] bg-white p-6 shadow-[0_12px_24px_rgba(15,27,45,0.08)]"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-ink-soft">
              Security
            </div>
            <div className="mt-3 text-lg font-semibold">{title}</div>
            <p className="mt-3 text-sm text-ink-soft">{copy}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#f1e2d2] bg-white p-6 shadow-[0_12px_24px_rgba(15,27,45,0.08)]">
          <div className="text-xs uppercase tracking-[0.2em] text-ink-soft">
            Compliance
          </div>
          <h2 className="mt-3 text-xl font-semibold">
            Access controls ensure only approved roles can manage data.
          </h2>
          <p className="mt-3 text-ink-soft">
            Role-based permissions restrict uploads, downloads, and certificate
            edits to authorized users only.
          </p>
        </div>
        <div className="rounded-3xl bg-ink p-6 text-white">
          <div className="text-xs uppercase tracking-[0.2em] text-[#c7d4ef]">
            Integrity Monitor
          </div>
          <div className="mt-3 font-display text-2xl">
            Validation checks prevent corruption and inconsistencies.
          </div>
          <div className="mt-4 space-y-3 text-sm text-[#c7d4ef]">
            <div className="flex items-center justify-between">
              <span>Files validated</span>
              <strong className="text-white">48</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Errors blocked</span>
              <strong className="text-white">17</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Schema checks</span>
              <strong className="text-white">Active</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
