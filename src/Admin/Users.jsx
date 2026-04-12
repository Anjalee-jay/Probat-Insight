import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import AdminNavbar from "../Components/AdminNavbar";
import {
  clearUsers as clearUsersRequest,
  createUser,
  fetchUsers,
  removeUser,
  updateUser,
} from "../services/usersApi";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&family=Outfit:wght@400;500;600;700;800&display=swap');`;
const USERS_STORAGE_KEY = "probat-admin-users";
const DASHBOARD_REFRESH_EVENT = "probat-dashboard-refresh";

function loadStoredUsers() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!rawUsers) {
      return [];
    }

    const parsedUsers = JSON.parse(rawUsers);
    return Array.isArray(parsedUsers) ? parsedUsers : [];
  } catch {
    return [];
  }
}

function buildInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "US";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatJoinedDate(date = new Date()) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function createLocalUser(payload, existingUserId) {
  return {
    id: existingUserId || String(Date.now()),
    name: payload.name,
    email: payload.email.toLowerCase(),
    role: payload.role,
    initials: buildInitials(payload.name),
    active: payload.active,
    analyses: payload.analyses,
    joined: payload.joined || formatJoinedDate(),
  };
}

function normalizePayload(form, existingUser) {
  return {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    role: form.role,
    active: form.active,
    analyses: Math.max(0, Number(form.analyses) || 0),
    joined: existingUser?.joined || formatJoinedDate(),
  };
}

function Ico({ d, cls = "w-5 h-5", sw = "1.7" }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={sw} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function RoleBadge({ role }) {
  const styles = {
    Player: "bg-blue-50 text-blue-600 border-blue-100",
    Coach: "bg-violet-50 text-violet-600 border-violet-100",
    Admin: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Analyst: "bg-amber-50 text-amber-600 border-amber-100",
    User: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border ${styles[role] || "bg-gray-50 text-gray-500 border-gray-200"}`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border ${
        active
          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
          : "bg-gray-50 text-gray-400 border-gray-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

const AV_COLORS = [
  "from-emerald-400 to-green-600",
  "from-blue-400 to-indigo-600",
  "from-violet-400 to-purple-600",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-600",
];

function Avatar({ name, index, avatar, size = "w-10 h-10" }) {
  const initials = name ? name.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase() : "??";
  const grad = AV_COLORS[index % AV_COLORS.length];

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${size} flex-shrink-0 rounded-xl object-cover shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${size} flex-shrink-0 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-[13px] shadow-sm`}
    >
      {initials}
    </div>
  );
}

function SummaryStrip({ users }) {
  const total = users.length;
  const active = users.filter((user) => user.active).length;
  const players = users.filter((user) => user.role === "Player").length;
  const coaches = users.filter((user) => user.role === "Coach").length;

  return (
    <div className="grid grid-cols-4 gap-4 max-[800px]:grid-cols-2">
      {[
        { label: "Total Users", value: total, bg: "bg-gray-50 border-gray-100", text: "text-gray-800" },
        { label: "Active", value: active, bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700" },
        { label: "Players", value: players, bg: "bg-blue-50 border-blue-100", text: "text-blue-700" },
        { label: "Coaches", value: coaches, bg: "bg-violet-50 border-violet-100", text: "text-violet-700" },
      ].map((stat) => (
        <div key={stat.label} className={`${stat.bg} border rounded-xl px-5 py-4 flex items-center gap-4`}>
          <p className={`text-[28px] font-extrabold leading-none ${stat.text}`} style={{ fontFamily: "'Syne'" }}>
            {stat.value}
          </p>
          <p className="text-[12px] font-semibold text-gray-400 leading-tight">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function FilterTab({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 select-none ${
        active ? "bg-white text-gray-800 shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-600 hover:bg-white/60"
      }`}
    >
      {label}
      {count != null && (
        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${active ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function UserRow({ user, index, onEdit, onDelete }) {
  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} index={index} avatar={user.avatar} />
          <div>
            <p className="text-[13.5px] font-semibold text-gray-800 leading-tight">{user.name}</p>
            <p className="text-[12px] text-gray-400 mt-0.5">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
      <td className="px-6 py-4"><span className="text-[13px] font-semibold text-gray-700">{user.analyses ?? 0}</span></td>
      <td className="px-6 py-4"><span className="text-[12px] text-gray-400">{user.joined ?? "—"}</span></td>
      <td className="px-6 py-4"><StatusBadge active={user.active} /></td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
          <button
            onClick={() => onEdit(user)}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-400 transition-colors"
            title="Edit user"
          >
            <Ico d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" cls="w-3.5 h-3.5" sw="2" />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 transition-colors"
            title="Delete user"
          >
            <Ico d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" cls="w-3.5 h-3.5" sw="2" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function EmptyState({ loading, onAdd }) {
  return (
    <tr>
      <td colSpan={6}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
            <Ico d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" cls="w-7 h-7 text-gray-300" sw="1.4" />
          </div>
          <p className="text-[15px] font-bold text-gray-400" style={{ fontFamily: "'Syne'" }}>
            {loading ? "Loading users" : "No users found"}
          </p>
          <p className="text-[13px] text-gray-300 text-center max-w-xs">
            {loading ? "Checking backend and local cache for saved users." : "No users match your current filters, or none have been added yet."}
          </p>
          {!loading && (
            <button
              onClick={onAdd}
              className="mt-2 flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-green-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Ico d="M12 4v16m8-8H4" cls="w-4 h-4" sw="2.2" />
              Add User
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function UserFormModal({
  isOpen,
  form,
  busy,
  error,
  mode,
  onChange,
  onClose,
  onSubmit,
}) {
  if (!isOpen) {
    return null;
  }

  const isEditing = mode === "edit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button type="button" aria-label="Close user modal" onClick={onClose} className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-2xl rounded-[28px] bg-white shadow-2xl shadow-slate-900/10 border border-white/70 overflow-hidden">
        <div className="px-7 py-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 via-white to-blue-50">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-emerald-600">Admin</p>
          <h2 className="text-[28px] font-bold tracking-[-0.02em] text-gray-900 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {isEditing ? "Edit User Details" : "Add User Details"}
          </h2>
          <p className="text-[13px] text-gray-400 mt-1">
            {isEditing ? "Update the selected user and sync the changes." : "Create a new player, coach, analyst, or admin account entry."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="px-7 py-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
            <label className="block">
              <span className="block text-[12px] font-semibold tracking-[0.08em] uppercase text-gray-400 mb-2">Full Name</span>
              <input type="text" name="name" value={form.name} onChange={onChange} placeholder="Enter full name" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-700 outline-none transition-colors focus:border-emerald-400 focus:bg-white" required />
            </label>

            <label className="block">
              <span className="block text-[12px] font-semibold tracking-[0.08em] uppercase text-gray-400 mb-2">Email</span>
              <input type="email" name="email" value={form.email} onChange={onChange} placeholder="name@example.com" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-700 outline-none transition-colors focus:border-emerald-400 focus:bg-white" required />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4 max-[700px]:grid-cols-1">
            <label className="block">
              <span className="block text-[12px] font-semibold tracking-[0.08em] uppercase text-gray-400 mb-2">Role</span>
              <select name="role" value={form.role} onChange={onChange} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-700 outline-none transition-colors focus:border-emerald-400 focus:bg-white">
                <option value="Player">Player</option>
                <option value="Coach">Coach</option>
                <option value="Analyst">Analyst</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-[12px] font-semibold tracking-[0.08em] uppercase text-gray-400 mb-2">Status</span>
              <select name="active" value={String(form.active)} onChange={onChange} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-700 outline-none transition-colors focus:border-emerald-400 focus:bg-white">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-[12px] font-semibold tracking-[0.08em] uppercase text-gray-400 mb-2">Analyses</span>
              <input type="number" min="0" name="analyses" value={form.analyses} onChange={onChange} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-700 outline-none transition-colors focus:border-emerald-400 focus:bg-white" />
            </label>
          </div>

          {error && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">{error}</div>}

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-emerald-600 border border-emerald-100 flex items-center justify-center flex-shrink-0">
              <Ico d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" cls="w-4 h-4" sw="2" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-emerald-700">{isEditing ? "Changes update the table immediately." : "This user will appear immediately in the table."}</p>
              <p className="text-[12px] text-emerald-600/80 mt-1">When the backend is available, the data is synced there. Otherwise it stays in local storage.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={busy} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[13px] font-semibold text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-green-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0">
              <Ico d="M12 4v16m8-8H4" cls="w-4 h-4" sw="2.2" />
              {busy ? (isEditing ? "Saving..." : "Creating...") : isEditing ? "Save Changes" : "Save User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [users, setUsers] = useState(() => loadStoredUsers());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingUserId, setEditingUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageMessage, setPageMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [syncMode, setSyncMode] = useState("local");
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Player",
    active: true,
    analyses: 0,
  });

  const location = useLocation();
  const navigate = useNavigate();

  const resetForm = useCallback(() => {
    setForm({
      name: "",
      email: "",
      role: "Player",
      active: true,
      analyses: 0,
    });
    setSubmitError("");
  }, []);

  const openCreateModal = useCallback(() => {
    setModalMode("create");
    setEditingUserId(null);
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  useEffect(() => {
    let isMounted = true;
    const storedUsers = loadStoredUsers();

    async function loadUsers() {
      try {
        const apiUsers = await fetchUsers();
        if (!isMounted) {
          return;
        }
        setUsers(apiUsers);
        setSyncMode("backend");
        setPageMessage("Users are synced with the backend database.");
      } catch {
        if (!isMounted) {
          return;
        }
        setUsers(storedUsers);
        setSyncMode("local");
        setPageMessage(
          storedUsers.length > 0
            ? "Backend unavailable. Using saved local data."
            : "Backend unavailable. New users will be stored locally until the API is reachable."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (location.state?.openAddUser) {
      openCreateModal();
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate, openCreateModal]);

  useEffect(() => {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT, { detail: { source: "users" } }));
  }, [users]);

  function openEditModal(user) {
    setModalMode("edit");
    setEditingUserId(user.id);
    setSubmitError("");
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      active: Boolean(user.active),
      analyses: user.analyses ?? 0,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }
    setIsModalOpen(false);
    setEditingUserId(null);
    resetForm();
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]:
        name === "active"
          ? value === "true"
          : name === "analyses"
            ? value
            : value,
    }));
  }

  async function handleSaveUser(event) {
    event.preventDefault();
    const existingUser = users.find((user) => user.id === editingUserId);
    const payload = normalizePayload(form, existingUser);

    if (!payload.name || !payload.email) {
      setSubmitError("Name and email are required.");
      return;
    }

    setIsSaving(true);
    setSubmitError("");

    try {
      if (modalMode === "edit" && editingUserId) {
        if (syncMode === "backend") {
          const response = await updateUser(editingUserId, payload);
          setUsers((current) => current.map((user) => (user.id === editingUserId ? response.user : user)));
          setPageMessage("User updated and synced to the backend.");
        } else {
          const updatedUser = createLocalUser(payload, editingUserId);
          setUsers((current) => current.map((user) => (user.id === editingUserId ? updatedUser : user)));
          setPageMessage("User updated locally.");
        }
      } else if (syncMode === "backend") {
        const response = await createUser(payload);
        setUsers((current) => [response.user, ...current]);
        setPageMessage("User created and synced to the backend.");
      } else {
        const newUser = createLocalUser(payload);
        setUsers((current) => [newUser, ...current]);
        setPageMessage("User created locally.");
      }

      closeModal();
    } catch (error) {
      setSubmitError(error.message || "Unable to save the user.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteUser(user) {
    const confirmed = window.confirm(`Delete ${user.name}?`);
    if (!confirmed) {
      return;
    }

    try {
      if (syncMode === "backend") {
        await removeUser(user.id);
        setPageMessage("User deleted from the backend.");
      } else {
        setPageMessage("User deleted locally.");
      }
      setUsers((current) => current.filter((entry) => entry.id !== user.id));
    } catch (error) {
      setPageMessage(error.message || "Unable to delete the user.");
    }
  }

  async function handleClearAllUsers() {
    const confirmed = window.confirm("Clear all users? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    try {
      if (syncMode === "backend") {
        await clearUsersRequest();
        setPageMessage("All users cleared from the backend.");
      } else {
        setPageMessage("All locally stored users cleared.");
      }
      setUsers([]);
    } catch (error) {
      setPageMessage(error.message || "Unable to clear users.");
    }
  }

  const FILTERS = [
    { id: "all", label: "All", count: users.length },
    { id: "active", label: "Active", count: users.filter((user) => user.active).length },
    { id: "player", label: "Players", count: users.filter((user) => user.role === "Player").length },
    { id: "coach", label: "Coaches", count: users.filter((user) => user.role === "Coach").length },
  ];

  const filtered = users
    .filter((user) => {
      const matchFilter =
        filter === "all"
          ? true
          : filter === "active"
            ? user.active
            : filter === "player"
              ? user.role === "Player"
              : filter === "coach"
                ? user.role === "Coach"
                : true;

      const query = search.toLowerCase();
      const matchSearch = !query || user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query);
      return matchFilter && matchSearch;
    })
    .sort((left, right) => {
      if (sortBy === "oldest") {
        return String(left.id).localeCompare(String(right.id));
      }
      if (sortBy === "name_az") {
        return left.name.localeCompare(right.name);
      }
      if (sortBy === "name_za") {
        return right.name.localeCompare(left.name);
      }
      if (sortBy === "analyses") {
        return (right.analyses ?? 0) - (left.analyses ?? 0);
      }
      return String(right.id).localeCompare(String(left.id));
    });

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>

      <UserFormModal
        isOpen={isModalOpen}
        form={form}
        busy={isSaving}
        error={submitError}
        mode={modalMode}
        onChange={handleFormChange}
        onClose={closeModal}
        onSubmit={handleSaveUser}
      />

      <Sidebar user={{ initials: "AD", name: "Admin User", role: "Super Admin" }} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminNavbar title="Users" user={{ initials: "AD", name: "Admin User" }} onSearch={setSearch} />

        <main className="flex-1 overflow-y-auto px-8 py-7 space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.01em] text-gray-900 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Users
              </h1>
              <p className="text-[13px] text-gray-400 mt-1">Manage players, coaches and administrators.</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className={`text-[11px] font-semibold tracking-[0.12em] uppercase px-3 py-1 rounded-full border ${syncMode === "backend" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                  {syncMode === "backend" ? "Backend Sync" : "Local Draft"}
                </span>
                {pageMessage && <span className="text-[12px] text-gray-500">{pageMessage}</span>}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {users.length > 0 && (
                <button
                  onClick={handleClearAllUsers}
                  className="px-4 py-2.5 rounded-xl border border-red-200 bg-white text-[13px] font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-green-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Ico d="M12 4v16m8-8H4" cls="w-4 h-4" sw="2.2" />
                Add User
              </button>
            </div>
          </div>

          <SummaryStrip users={users} />

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl">
              {FILTERS.map((item) => (
                <FilterTab key={item.id} label={item.label} count={item.count} active={filter === item.id} onClick={() => setFilter(item.id)} />
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="text-[13px] font-medium text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300 transition-colors"
              style={{ fontFamily: "'Plus Jakarta Sans'" }}
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="name_az">Sort: Name A–Z</option>
              <option value="name_za">Sort: Name Z–A</option>
              <option value="analyses">Sort: Most Analyses</option>
            </select>
          </div>

          {users.length > 0 && (
            <p className="text-[12px] text-gray-400 font-medium -mt-2">
              Showing <span className="font-bold text-gray-600">{filtered.length}</span> of {users.length} users
            </p>
          )}

          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  {["User", "Role", "Analyses", "Joined", "Status", ""].map((column) => (
                    <th key={column} className="text-left px-6 py-3.5 text-[10.5px] font-bold tracking-[0.12em] uppercase text-gray-400 whitespace-nowrap">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <EmptyState loading={isLoading} onAdd={openCreateModal} />
                ) : (
                  filtered.map((user, index) => (
                    <UserRow key={user.id ?? index} user={user} index={index} onEdit={openEditModal} onDelete={handleDeleteUser} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
