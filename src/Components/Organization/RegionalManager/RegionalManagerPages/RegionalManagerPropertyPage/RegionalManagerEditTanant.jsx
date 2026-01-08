
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const EditTenant = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tenant = location.state?.tenant; // Access tenant from location.state

  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tenant) {
      setFormData({ ...tenant });
    }
  }, [tenant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required! Please login first.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      setIsLoading(false);
      return;
    }

    const payload = {
      name: formData.name,
      mobile: formData.mobile,
      room: formData.room,
      moveInDate: formData.moveInDate,
      otherdetails: formData.otherdetails,
    };

    try {
      const response = await axios.put(
        `https://api.gharzoreality.com/api/sub-owner/updateTenant/${tenant.tenantId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(response.data.message || "Tenant updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      navigate("/landlord/tenant-list");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update tenant.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      console.error("Error updating tenant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!tenant || !formData) {
    return (
      <div className="text-center py-10 text-gray-600">
        <p>No tenant data found to edit.</p>
        <motion.button
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
          onClick={() => navigate("/landlord/tenant-list")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Go Back
        </motion.button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center sm:text-left">
        Edit Tenant
      </h2>

      <form onSubmit={handleUpdate} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile || ""}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>

          {/* Room */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room
            </label>
            <input
              type="text"
              name="room"
              value={formData.room || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>

          {/* Move In Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Move In Date
            </label>
            <input
              type="date"
              name="moveInDate"
              value={formData.moveInDate || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>
        </div>

        {/* Other Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Other Details
          </label>
          <textarea
            name="otherdetails"
            value={formData.otherdetails || ""}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring focus:ring-indigo-200"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
          <motion.button
            type="button"
            onClick={() => navigate("/landlord/tenant-list")}
            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md transition disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default EditTenant;