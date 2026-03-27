import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAdminProfile } from "../utils/adminProfile.js";
import { getStudentProfile } from "../utils/studentProfile.js";

const getStoredUser = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      return null;
    }

    if (storedUser.role !== "admin") {
      const studentProfile = getStudentProfile(storedUser);
      return {
        ...storedUser,
        name: studentProfile.studentName || storedUser.name,
        email: studentProfile.email || storedUser.email,
        avatar: studentProfile.profilePhoto || storedUser.avatar || "",
      };
    }

    const adminProfile = getAdminProfile(storedUser);
    return {
      ...storedUser,
      name: adminProfile.adminName || storedUser.name,
      email: adminProfile.email || storedUser.email,
      avatar: adminProfile.profilePhoto || storedUser.avatar || "",
    };
  } catch {
    return null;
  }
};

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [user, setUser] = useState(() => getStoredUser());
  const shouldShowPublicNav =
    location.pathname === "/" ||
    location.pathname === "/verify" ||
    (location.pathname.startsWith("/certificate/") && user?.role !== "student") ||
    location.pathname === "/login" ||
    location.pathname === "/signup";
  const hideFooterLinks =
    location.pathname === "/profile" ||
    location.pathname === "/admin-dashboard" ||
    location.pathname === "/admin";
  const brandLink = shouldShowPublicNav
    ? "/"
    : user
      ? user.role === "admin"
        ? "/admin-dashboard"
        : "/student-dashboard"
      : "/";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setProfileMenuOpen(false);
    setMobileNavOpen(false);
    window.dispatchEvent(new Event("user-updated"));
    navigate("/");
  };

  const closeMenus = () => {
    setProfileMenuOpen(false);
    setMobileNavOpen(false);
  };

  useEffect(() => {
    closeMenus();
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("user-updated", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("user-updated", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-10 pt-6 animate-fadeUp">
      <header className="sticky top-0 z-20 mb-8 bg-[#f7f2e8]/90 pb-6 pt-4 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
        <Link
          to={brandLink}
          className="flex items-center gap-4"
        >
          <span className="rounded-2xl bg-ink px-3.5 py-3 text-lg font-bold text-white font-display">
            CF
          </span>
          <div>
            <div className="font-display text-lg font-semibold">CertiFlow</div>
            <div className="text-xs text-ink-soft">
              Certificate Verification System
            </div>
          </div>
        </Link>
        {user && !shouldShowPublicNav ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-full border border-[#f0d7c1] bg-white p-2 text-sm font-semibold sm:px-4 sm:py-2"
              aria-expanded={profileMenuOpen}
              aria-label="Toggle profile menu"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="User avatar"
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
              )}
              <div className="hidden text-left sm:block">
                <div className="text-sm font-semibold text-ink">
                  {user.name || "User"}
                </div>
                <div className="text-xs text-ink-soft">
                  {user.role || "student"}
                </div>
              </div>
              <span
                className={`text-[#7d6b5c] transition-transform ${
                  profileMenuOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
            {profileMenuOpen ? (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-[#f0d7c1] bg-white p-2 shadow-lg">
                <Link
                  to="/profile"
                  className="block rounded-xl px-3 py-2 text-sm text-ink hover:bg-[#f9f4ec]"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  View Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#c43d2f] transition hover:bg-[#fff1ee]"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e7d6c5] bg-white text-ink shadow-[0_10px_24px_rgba(15,27,45,0.08)] transition hover:-translate-y-0.5 md:hidden"
              aria-expanded={mobileNavOpen}
              aria-label="Toggle navigation menu"
            >
              <span className="flex flex-col gap-1.5">
                <span
                  className={`block h-0.5 w-5 rounded-full bg-current transition ${
                    mobileNavOpen ? "translate-y-2 rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 rounded-full bg-current transition ${
                    mobileNavOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 rounded-full bg-current transition ${
                    mobileNavOpen ? "-translate-y-2 -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          <nav className="hidden flex-wrap items-center gap-4 text-sm font-semibold md:flex">
            <Link
              to="/"
              className="rounded-full px-3 py-2 transition hover:-translate-y-0.5 hover:bg-black/5"
            >
              Home
            </Link>
            <Link
              to="/#about"
              className="rounded-full px-3 py-2 transition hover:-translate-y-0.5 hover:bg-black/5"
            >
              About
            </Link>
            <Link
              to="/verify"
              className="rounded-full px-3 py-2 transition hover:-translate-y-0.5 hover:bg-black/5"
            >
              Verify Certificate
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-ink px-4 py-2 transition hover:-translate-y-0.5"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-ink px-4 py-2 text-white transition hover:-translate-y-0.5"
            >
              Sign Up
            </Link>
          </nav>
          </>
        )}
        </div>
        {shouldShowPublicNav && mobileNavOpen ? (
          <div className="mt-4 rounded-[28px] border border-[#e5d6c6] bg-[linear-gradient(145deg,#fffdf9_0%,#fff5eb_100%)] p-3 shadow-[0_18px_40px_rgba(15,27,45,0.10)] md:hidden">
            <nav className="flex flex-col gap-2 text-sm font-semibold">
              <Link
                to="/"
                className="rounded-2xl px-4 py-3 text-ink transition hover:bg-white/80"
                onClick={closeMenus}
              >
                Home
              </Link>
              <Link
                to="/#about"
                className="rounded-2xl px-4 py-3 text-ink transition hover:bg-white/80"
                onClick={closeMenus}
              >
                About
              </Link>
              <Link
                to="/verify"
                className="rounded-2xl px-4 py-3 text-ink transition hover:bg-white/80"
                onClick={closeMenus}
              >
                Verify Certificate
              </Link>
              <Link
                to="/login"
                className="rounded-2xl border border-[#d9c5b1] px-4 py-3 text-center text-ink transition hover:bg-white/80"
                onClick={closeMenus}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-2xl bg-ink px-4 py-3 text-center text-white transition hover:opacity-95"
                onClick={closeMenus}
              >
                Sign Up
              </Link>
            </nav>
          </div>
        ) : null}
      </header>

      <main>{children}</main>

      <footer className="mt-14 flex flex-wrap items-center justify-between gap-4 text-sm text-ink-soft">
        <div className="space-y-1">
          <div>Built for campuses, training partners, and internship teams.</div>
          <div>Email: support@certiflow.com</div>
        </div>
      </footer>
    </div>
  );
}
