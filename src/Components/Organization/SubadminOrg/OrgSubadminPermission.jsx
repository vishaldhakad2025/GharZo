import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaLock } from "react-icons/fa";

const OrgSubadminPermission = ({ onPermissionAdded }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [editPermission, setEditPermission] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Fetch permissions from API
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const orgToken = localStorage.getItem("orgToken");
        if (!orgToken) {
          throw new Error("No token found in localStorage");
        }

        const response = await fetch(
          "https://api.gharzoreality.com/api/permissions",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${orgToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch permissions");
        }

        const data = await response.json();
        if (data.success) {
          setPermissions(data.permissions.map((p) => ({
            ...p,
            id: p.id || p._id,
          })));
        } else {
          throw new Error(data.message || "Failed to fetch permissions");
        }
      } catch (error) {
        toast.error(error.message || "Failed to fetch permissions", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    fetchPermissions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orgToken = localStorage.getItem("orgToken");
      if (!orgToken) {
        throw new Error("No token found in localStorage");
      }

      const response = await fetch("https://api.gharzoreality.com/api/permissions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${orgToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          description: description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create permission");
      }

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || "Permission created successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        const newPermission = { ...data.permission, id: data.permission.id || data.permission._id };
        setPermissions([...permissions, newPermission]);
        onPermissionAdded(newPermission);

        setName("");
        setDescription("");
      } else {
        throw new Error(data.message || "Failed to create permission");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create permission", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const orgToken = localStorage.getItem("orgToken");
      if (!orgToken) {
        throw new Error("No token found in localStorage");
      }

      const response = await fetch(
        `https://api.gharzoreality.com/api/permissions/${editPermission.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${orgToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editPermission.name,
            description: editPermission.description,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update permission");
      }

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || "Permission updated successfully", {
          position: "top-right",
          autoClose: 3000,
        });

        const updatedPermission = { ...data.permission, id: data.permission.id || data.permission._id };
        setPermissions(
          permissions.map((perm) =>
            perm.id === editPermission.id ? updatedPermission : perm
          )
        );
        setIsEditModalOpen(false);
        setEditPermission(null);
      } else {
        throw new Error(data.message || "Failed to update permission");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update permission", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleDelete = async () => {
    try {
      const orgToken = localStorage.getItem("orgToken");
      if (!orgToken) {
        throw new Error("No token found in localStorage");
      }

      const response = await fetch(
        `https://api.gharzoreality.com/api/permissions/${permissionToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${orgToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete permission");
      }

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || "Permission deleted successfully", {
          position: "top-right",
          autoClose: 3000,
        });

        setPermissions(
          permissions.filter((perm) => perm.id !== permissionToDelete)
        );
        setIsDeleteModalOpen(false);
        setPermissionToDelete(null);
      } else {
        throw new Error(data.message || "Failed to delete permission");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete permission", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const openEditModal = (permission) => {
    setEditPermission({ ...permission });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (id) => {
    setPermissionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handlePermissionClick = (permission) => {
    setSelectedPermission(permission);
  };

  const handlePermissionToggle = (id) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((permId) => permId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Add New Permission
          </h2>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Permission Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm py-2 px-3 focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50 transition duration-200"
                placeholder="e.g., view_property"
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm py-2 px-3 focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50 transition duration-200"
                placeholder="e.g., Allows viewing of the property"
                rows="4"
                required
              ></textarea>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
              }`}
            >
              {isSubmitting ? "Adding..." : "Add Permission"}
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Permissions List
          </h2>
          {permissions.length === 0 ? (
            <p className="text-gray-500">No permissions available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {permissions.map((permission) => (
                    <tr key={permission.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {permission.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {permission.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(permission.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(permission)}
                            className="p-2 rounded-full text-blue-600 hover:text-blue-800 transform hover:scale-110 transition-all duration-300"
                            title="Edit"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDeleteModal(permission.id)}
                            className="p-2 rounded-full text-red-600 hover:text-red-800 transform hover:scale-110 transition-all duration-300"
                            title="Delete"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1zm-7 4h18"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPermission(permission);
                              setShowPermissionModal(true);
                            }}
                            className="p-2 rounded-full text-green-600 hover:text-green-800 transform hover:scale-110 transition-all duration-300"
                            title="View"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Edit Permission
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="editName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Permission Name
                </label>
                <input
                  type="text"
                  id="editName"
                  value={editPermission?.name || ""}
                  onChange={(e) =>
                    setEditPermission({
                      ...editPermission,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm py-2 px-3 focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="editDescription"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="editDescription"
                  value={editPermission?.description || ""}
                  onChange={(e) =>
                    setEditPermission({
                      ...editPermission,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm py-2 px-3 focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50"
                  rows="4"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="py-2 px-4 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this permission?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="py-2 px-4 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaLock className="mr-2 text-indigo-500" />
                  Permission Details
                </h3>
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {selectedPermission ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                    <FaLock className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {selectedPermission.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedPermission.description}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(
                        selectedPermission.createdAt
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">ID:</span>{" "}
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                        {selectedPermission.id}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handlePermissionToggle(selectedPermission.id);
                      setShowPermissionModal(false);
                    }}
                    className={`w-full py-2 rounded-lg font-medium transition ${
                      selectedPermissions.includes(selectedPermission.id)
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                    }`}
                  >
                    {selectedPermissions.includes(selectedPermission.id)
                      ? "Remove Permission"
                      : "Add Permission"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        onClick={() => handlePermissionClick(permission)}
                        className={`p-3 border rounded-lg cursor-pointer hover:shadow-md transition ${
                          selectedPermissions.includes(permission.id)
                            ? "border-green-300 bg-green-50"
                            : "border-gray-200 hover:border-indigo-300"
                        }`}
                      >
                        <p className="font-medium text-sm text-gray-800 truncate">
                          {permission.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {permission.description}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowPermissionModal(false)}
                    className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default OrgSubadminPermission;