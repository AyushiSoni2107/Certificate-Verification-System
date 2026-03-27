import React, { useEffect, useMemo, useState } from "react";
import { getAdminProfile, saveAdminProfile } from "../utils/adminProfile.js";
import { getStudentProfile, saveStudentProfile } from "../utils/studentProfile.js";

const DEFAULT_ADMIN_PROFILE = {
  adminName: "Admin User",
  email: "admin@certiflow.com",
  phone: "",
  profilePhoto: "",
  role: "Admin",
};

const DEFAULT_STUDENT_PROFILE = {
  studentName: "Student User",
  email: "student@certiflow.com",
  phone: "",
  profilePhoto: "",
  role: "Student",
};

const uploadToDataUrl = (file, onDone) => {
  if (!file) {
    onDone("");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => onDone(String(reader.result || ""));
  reader.readAsDataURL(file);
};

const InfoCard = ({ eyebrow, title, children }) => (
  <section className="rounded-[28px] border border-[#f1e2d2] bg-white p-6 shadow-[0_16px_32px_rgba(15,27,45,0.08)]">
    <div className="text-xs uppercase tracking-[0.2em] text-ink-soft">{eyebrow}</div>
    <h2 className="mt-2 font-display text-xl text-ink">{title}</h2>
    <div className="mt-4">{children}</div>
  </section>
);

const Field = ({ label, children }) => (
  <label className="block">
    <div className="text-sm font-semibold text-ink">{label}</div>
    <div className="mt-2">{children}</div>
  </label>
);

const TextInput = (props) => (
  <input
    {...props}
    className={`w-full rounded-2xl border border-[#ead8c8] bg-[#fffdfa] px-4 py-3 text-sm text-ink outline-none transition focus:border-[#f0c2a5] focus:ring-2 focus:ring-[#ffe0d2] ${
      props.className || ""
    }`}
  />
);

const UploadField = ({ label, value, buttonLabel, onChange }) => (
  <div className="rounded-3xl border border-dashed border-[#f0d7c1] bg-[#fff8f1] p-4">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-white shadow-[0_10px_22px_rgba(15,27,45,0.08)]">
          {value ? (
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg text-accent-dark">+</span>
          )}
        </div>
        <div>
          <div className="text-sm font-semibold text-ink">{label}</div>
        </div>
      </div>
      <label className="inline-flex cursor-pointer items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-[0_10px_20px_rgba(15,27,45,0.06)] transition hover:-translate-y-0.5">
        {buttonLabel}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => onChange(event.target.files?.[0] || null)}
        />
      </label>
    </div>
  </div>
);

export default function Profile() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const isAdmin = user?.role === "admin";
  const [form, setForm] = useState(
    isAdmin ? DEFAULT_ADMIN_PROFILE : DEFAULT_STUDENT_PROFILE
  );
  const [status, setStatus] = useState({ type: "idle", message: "" });

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role === "admin") {
      const storedProfile = getAdminProfile(user);
      setForm({
        adminName: storedProfile.adminName || user.name || "Admin User",
        email: storedProfile.email || user.email || "admin@certiflow.com",
        phone: storedProfile.phone || "",
        profilePhoto: storedProfile.profilePhoto || user.avatar || "",
        role: storedProfile.role || "Admin",
      });
      return;
    }

    const storedProfile = getStudentProfile(user);
    setForm({
      studentName: storedProfile.studentName || user.name || "Student User",
      email: storedProfile.email || user.email || "student@certiflow.com",
      phone: storedProfile.phone || "",
      profilePhoto: storedProfile.profilePhoto || user.avatar || "",
      role: storedProfile.role || "Student",
    });
  }, [user]);

  if (!user) {
    return (
      <section className="rounded-3xl border border-[#f1e2d2] bg-white p-8 shadow-[0_12px_24px_rgba(15,27,45,0.08)]">
        <h1 className="font-display text-3xl">Profile</h1>
        <p className="mt-3 text-ink-soft">
          Please log in to manage your profile.
        </p>
      </section>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUpload = (field, file) => {
    uploadToDataUrl(file, (result) => {
      setForm((current) => ({
        ...current,
        [field]: result,
      }));
    });
  };

  const handleSave = () => {
    if (isAdmin) {
      const profilePayload = {
        adminName: form.adminName,
        email: form.email,
        phone: form.phone,
        profilePhoto: form.profilePhoto,
        role: form.role,
      };

      saveAdminProfile(user, profilePayload);
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          name: form.adminName,
          email: form.email,
          avatar: form.profilePhoto,
          role: "admin",
        })
      );
    } else {
      const profilePayload = {
        studentName: form.studentName,
        email: form.email,
        phone: form.phone,
        profilePhoto: form.profilePhoto,
        role: form.role,
      };

      saveStudentProfile(user, profilePayload);
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          name: form.studentName,
          email: form.email,
          avatar: form.profilePhoto,
          role: "student",
        })
      );
    }

    window.dispatchEvent(new Event("user-updated"));
    setStatus({ type: "success", message: "Profile updated successfully." });
  };

  const title = isAdmin ? "Manage your admin account" : "Manage your student account";
  const eyebrow = isAdmin ? "Admin Profile" : "Student Profile";
  const cardTitle = isAdmin ? "Admin Identity" : "Student Identity";
  const nameLabel = isAdmin ? "Admin Name" : "Student Name";
  const nameField = isAdmin ? "adminName" : "studentName";
  const nameValue = isAdmin ? form.adminName : form.studentName;
  const roleValue = isAdmin ? "Admin" : "Student";
  const uploadLabel = isAdmin ? "Profile Photo Upload" : "Student Photo Upload";

  return (
    <section className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-ink-soft">
          {eyebrow}
        </div>
        <h1 className="mt-3 font-display text-3xl text-ink">{title}</h1>
      </div>

      {status.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            status.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {status.message}
        </div>
      ) : null}

      <div>
        <InfoCard eyebrow="Basic Information" title={cardTitle}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={nameLabel}>
              <TextInput name={nameField} value={nameValue} onChange={handleChange} />
            </Field>
            <Field label="Email ID">
              <TextInput
                type="email"
                name="email"
                value={form.email}
                readOnly
                disabled
              />
            </Field>
            <Field label="Phone Number">
              <TextInput
                type="number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />
            </Field>
            <Field label="Role">
              <TextInput name="role" value={roleValue} readOnly disabled />
            </Field>
          </div>
          <div className="mt-5">
            <UploadField
              label={uploadLabel}
              value={form.profilePhoto}
              buttonLabel="Upload Photo"
              onChange={(file) => handleUpload("profilePhoto", file)}
            />
          </div>
        </InfoCard>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(255,106,61,0.28)] transition hover:-translate-y-0.5"
        >
          Save Changes
        </button>
      </div>
    </section>
  );
}
