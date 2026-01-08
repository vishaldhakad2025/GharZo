import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function OrganizationDepartments() {
  const [departments, setDepartments] = useState([]);
  const [globalPermissions, setGlobalPermissions] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [permissionName, setPermissionName] = useState("");
  const [permissionDescription, setPermissionDescription] = useState("");
  const [canCreate, setCanCreate] = useState(false);
  const [canRead, setCanRead] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);
  const [mode, setMode] = useState("createPermission");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPermissions();
    fetchDepartments();
  }, []);

  // Fetch all permissions
  async function fetchPermissions() {
    const token = localStorage.getItem("orgToken");
    if (!token) {
      toast.error("No authentication token found. Please log in.", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    try {
      const response = await fetch("https://api.gharzoreality.com/api/organization/allpermission", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setGlobalPermissions(
          data.permissions.map((p) => ({
            id: p._id,
            name: p.name,
            description: p.description,
            canCreate: p.canCreate,
            canRead: p.canRead,
            canUpdate: p.canUpdate,
            canDelete: p.canDelete,
            createdAt: p.createdAt,
          }))
        );
      } else {
        toast.error(data.message || "Failed to fetch permissions.", {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.error("Error fetching permissions: " + error.message, {
        position: "top-center",
        autoClose: 2000,
      });
    }
  }

  // Fetch all departments (API only, no mock data)
  async function fetchDepartments() {
    const token = localStorage.getItem("orgToken");
    if (!token) {
      toast.error("No authentication token found. Please log in.", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    try {
      const response = await fetch("https://api.gharzoreality.com/api/organization/alldepartment", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setDepartments(
          data.departments.map((d) => ({
            id: d.id || d._id,
            name: d.departmentName,
            permissions: d.permissions.map((id) =>
              globalPermissions.find((p) => p.id === id) || { id, name: "Unknown", description: "Unknown" }
            ),
            createdAt: d.createdAt,
          }))
        );
      } else {
        toast.error(data.message || "Failed to fetch departments.", {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.error("Error fetching departments: " + error.message, {
        position: "top-center",
        autoClose: 2000,
      });
    }
  }

  // Reset the form
  function resetForm() {
    setDepartmentName("");
    setPermissionName("");
    setPermissionDescription("");
    setCanCreate(false);
    setCanRead(false);
    setCanUpdate(false);
    setCanDelete(false);
    setSelectedPermissionIds([]);
    setEditingDepartmentId(null);
    setMode("createPermission");
  }

  // Toggle permission selection
  function togglePermissionSelection(id) {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // Step 1: Create a permission
  async function savePermission(e) {
    e.preventDefault();
    if (!permissionName.trim()) {
      toast.error("Please enter a permission name!", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }
    if (!permissionDescription.trim()) {
      toast.error("Please enter a permission description!", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("orgToken");
      if (!token) {
        toast.error("No authentication token found. Please log in.", {
          position: "top-center",
          autoClose: 2000,
        });
        setLoading(false);
        return;
      }

      const response = await fetch(
        "https://api.gharzoreality.com/api/organization/create-permission",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: permissionName.trim(),
            description: permissionDescription.trim(),
            canCreate,
            canRead,
            canUpdate,
            canDelete,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.message && data.message.toLowerCase().includes("token")) {
          toast.error("Session expired. Please log in again.", {
            position: "top-center",
            autoClose: 2000,
          });
        } else {
          toast.error(data.message || "Failed to create permission!", {
            position: "top-center",
            autoClose: 2000,
          });
        }
        setLoading(false);
        return;
      }

      toast.success(data.message || "Permission added!", {
        position: "top-center",
        autoClose: 2000,
      });
      setLoading(false);
      setPermissionName("");
      setPermissionDescription("");
      setCanCreate(false);
      setCanRead(false);
      setCanUpdate(false);
      setCanDelete(false);
      fetchPermissions(); // Refresh permissions list
    } catch (error) {
      toast.error("Error creating permission: " + error.message, {
        position: "top-center",
        autoClose: 2000,
      });
      setLoading(false);
    }
  }

  // Step 2: Create or update a department
  async function saveDepartment(e) {
    const token = localStorage.getItem("orgToken");
    e.preventDefault();
    if (!departmentName.trim()) {
      toast.error("Please enter a department name!", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }
    if (selectedPermissionIds.length === 0) {
      toast.error("Please select at least one permission!", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    setLoading(true);
    try {
      // Always get token fresh from localStorage at the moment of API call
      const token = window.localStorage.getItem("orgToken");
      if (!token) {
        toast.error("No authentication token found. Please log in.", {
          position: "top-center",
          autoClose: 2000,
        });
        setLoading(false);
        return;
      }
      const response = await fetch(
        "https://api.gharzoreality.com/api/organization/create-department",
        {
          method: editingDepartmentId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            departmentName: departmentName.trim(),
            permissions: selectedPermissionIds,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        if (data.message && data.message.toLowerCase().includes("token")) {
          toast.error("Session expired. Please log in again.", {
            position: "top-center",
            autoClose: 2000,
          });
        } else {
          toast.error(data.message || "Failed to save department!", {
            position: "top-center",
            autoClose: 2000,
          });
        }
        setLoading(false);
        return;
      }
      toast.success(data.message || "Department saved!", {
        position: "top-center",
        autoClose: 2000,
      });
      setLoading(false);
      fetchDepartments(); // Refetch to update list
      resetForm();
    } catch (error) {
      toast.error("Error saving department: " + error.message, {
        position: "top-center",
        autoClose: 2000,
      });
      setLoading(false);
    }
  }

  // Edit a department (only for UI, not API)
  function editDepartment(id) {
    const dept = departments.find((d) => d.id === id);
    if (!dept) return;
    setDepartmentName(dept.name);
    setSelectedPermissionIds(dept.permissions.map((p) => p.id));
    setEditingDepartmentId(dept.id);
    setMode("createDepartment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Delete a department (UI only, not API)
  function deleteDepartment(id) {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    setDepartments((prev) => prev.filter((d) => d.id !== id));
    toast.success("Department deleted (UI only)!", {
      position: "top-center",
      autoClose: 2000,
    });
  }

  // Filter departments for search
  const [query, setQuery] = useState("");
  const filteredDepartments = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <ToastContainer />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold text-black mb-4">
          Manage Your Organization
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Only create permission, get all permission, and create department APIs are active.
        </p>

        {/* Step Navigation */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <button
            onClick={() => setMode("createPermission")}
            className={`px-4 py-2 rounded-md ${
              mode === "createPermission"
                ? "bg-draze-teal text-white"
                : "border border-draze-blue text-draze-blue hover:bg-draze-blue hover:text-white"
            } transition-all duration-300`}
          >
            Step 1: Create Permission
          </button>
          <button
            onClick={() => setMode("createDepartment")}
            className={`px-4 py-2 rounded-md ${
              mode === "createDepartment"
                ? "bg-draze-teal text-white"
                : "border border-draze-blue text-draze-blue hover:bg-draze-blue hover:text-white"
            } transition-all duration-300`}
          >
            Step 2: Create Department
          </button>
        </div>

        {/* Step 1: Create Permission Form */}
        {mode === "createPermission" && (
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6 border border-draze-blue">
            <form onSubmit={savePermission}>
              <h3 className="text-lg font-medium text-draze-teal mb-4">
                Create a New Permission
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600">
                      Permission Name
                    </label>
                    <input
                      value={permissionName}
                      onChange={(e) => setPermissionName(e.target.value)}
                      placeholder="e.g. Manage Campaigns"
                      className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-draze-teal"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600">
                    Permission Description
                  </label>
                  <input
                    value={permissionDescription}
                    onChange={(e) => setPermissionDescription(e.target.value)}
                    placeholder="e.g. Permissions for managing campaigns"
                    className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-draze-teal"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={canCreate}
                      onChange={(e) => setCanCreate(e.target.checked)}
                      className="h-4 w-4 accent-draze-teal"
                    />
                    Can Create
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={canRead}
                      onChange={(e) => setCanRead(e.target.checked)}
                      className="h-4 w-4 accent-draze-teal"
                    />
                    Can Read
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={canUpdate}
                      onChange={(e) => setCanUpdate(e.target.checked)}
                      className="h-4 w-4 accent-draze-teal"
                    />
                    Can Update
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={canDelete}
                      onChange={(e) => setCanDelete(e.target.checked)}
                      className="h-4 w-4 accent-draze-teal"
                    />
                    Can Delete
                  </label>
                </div>
                <div className="w-full flex gap-2 justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 rounded-md ${
                      loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-draze-blue to-draze-teal text-white"
                    }`}
                  >
                    {loading ? "Adding..." : "Add Permission"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="border border-draze-blue text-draze-blue px-4 py-2 rounded-md hover:bg-draze-blue hover:text-white transition-all duration-300"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
            <div className="mt-6">
              <h3 className="text-lg font-medium text-draze-teal mb-4">All Permissions</h3>
              {globalPermissions.length === 0 ? (
                <div className="text-sm text-gray-500">No permissions available.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {globalPermissions.map((perm) => (
                    <div key={perm.id} className="p-4 border border-draze-blue rounded-md">
                      <div className="font-medium">{perm.name}</div>
                      <div className="text-sm text-gray-600">{perm.description}</div>
                      <div className="text-xs text-gray-400">
                        Created: {new Date(perm.createdAt).toLocaleString()}
                      </div>
                      <div className="text-xs mt-2">
                        Can Create: {perm.canCreate ? "Yes" : "No"} | Can Read: {perm.canRead ? "Yes" : "No"} | 
                        Can Update: {perm.canUpdate ? "Yes" : "No"} | Can Delete: {perm.canDelete ? "Yes" : "No"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Create Department Form */}
        {mode === "createDepartment" && (
          <form
            onSubmit={saveDepartment}
            className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6 border border-draze-blue"
          >
            <h3 className="text-lg font-medium text-draze-teal mb-4">
              {editingDepartmentId ? "Update Department" : "Create a New Department"}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600">
                  Department Name
                </label>
                <input
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g. tenanexpenses"
                  className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-draze-teal"
                />
              </div>
              <div className="w-full sm:w-auto flex gap-2 items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-md ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-draze-blue to-draze-teal text-white"
                  }`}
                >
                  {loading ? "Saving..." : editingDepartmentId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-draze-blue text-draze-blue px-4 py-2 rounded-md hover:bg-draze-blue hover:text-white transition-all duration-300"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="mt-4">
              <div className="p-3 border border-draze-blue rounded-md h-64 overflow-y-auto">
                <h3 className="font-medium mb-2 text-draze-teal">Select Permissions</h3>
                <div className="text-xs text-gray-500 mb-2">
                  Choose permissions for this department
                </div>
                {globalPermissions.length === 0 ? (
                  <div className="text-sm text-gray-500">No permissions available.</div>
                ) : (
                  <div className="space-y-2">
                    {globalPermissions.map((perm) => (
                      <label key={perm.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedPermissionIds.includes(perm.id)}
                          onChange={() => togglePermissionSelection(perm.id)}
                          className="h-4 w-4 accent-draze-teal"
                        />
                        {perm.name} ({perm.description})
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search departments..."
            className="flex-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-draze-teal"
          />
          <div className="text-sm text-gray-500">
            {filteredDepartments.length} department(s)
          </div>
        </div>

        {/* Departments List */}
        <h2 className="text-xl font-semibold text-draze-blue mb-4">Your Departments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {filteredDepartments.length === 0 && (
            <div className="col-span-full bg-white p-6 rounded shadow text-center text-gray-500 border border-draze-blue">
              No departments yet. Create one in Step 2!
            </div>
          )}
          {filteredDepartments.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col border border-draze-blue hover:shadow-xl transition h-72"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-xl text-draze-teal">{d.name}</div>
                  <div className="text-xs text-gray-400">
                    Created: {new Date(d.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editDepartment(d.id)}
                    className="px-3 py-1 border border-draze-blue rounded text-sm text-draze-teal hover:bg-draze-teal hover:text-white transition-all duration-300"
                    aria-label={`Edit ${d.name}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteDepartment(d.id)}
                    className="px-3 py-1 border border-red-600 rounded text-sm text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300"
                    aria-label={`Delete ${d.name}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 flex-1">
                <div>
                  <div className="text-sm font-medium mb-1 text-draze-blue">Permissions</div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {d.permissions.length === 0 ? (
                      <li className="text-gray-400">No permissions</li>
                    ) : (
                      d.permissions.map((perm) => (
                        <li key={perm.id}>
                          {perm.name} ({perm.description})
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          .from-draze-blue { background-color: #00C4CC; }
          .to-draze-teal { background-color: #00E0A8; }
          .bg-draze-blue { background-color: #00C4CC; }
          .bg-draze-teal { background-color: #00E0A8; }
          .text-draze-blue { color: #00C4CC; }
          .text-draze-teal { color: #00E0A8; }
          .border-draze-blue { border-color: #00C4CC; }
          .accent-draze-teal { accent-color: #00E0A8; }
          .from-draze-blue.to-draze-teal { background-image: linear-gradient(to right, #00C4CC, #00E0A8); }
          .hover\\:from-draze-teal:hover { background-color: #00E0A8; }
          .hover\\:to-draze-blue:hover { background-color: #00C4CC; }
        `}
      </style>
    </div>
  );
}