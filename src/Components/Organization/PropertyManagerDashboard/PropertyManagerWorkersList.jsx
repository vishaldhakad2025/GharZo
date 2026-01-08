import React, { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Star,
  Home,
  AlertCircle,
  Edit,
  Trash,
  X,
} from "lucide-react";
import axios from "axios";

const WorkerCard = ({ worker, onCardClick }) => {
  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 m-4 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl max-w-sm w-full">
      <div className="flex items-center mb-4">
        {worker.profileImage ? (
          <img
            src={worker.profileImage}
            alt={worker.name}
            className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-gray-200"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`p-3 rounded-full mr-4 transform transition-all duration-300 hover:rotate-12 flex-shrink-0 ${
            worker.profileImage ? "hidden" : ""
          }`}
          style={{ background: "linear-gradient(to bottom right, #3B82F6, #1D4ED8)" }}
        >
          <User size={32} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{worker.name}</h2>
          <p className="text-gray-600 flex items-center">
            <Briefcase size={16} className="mr-2 text-green-500" />{" "}
            {worker.role}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <p className="flex items-center text-gray-700">
          <Phone size={20} className="mr-2 text-blue-500" />{" "}
          {worker.contactNumber}
        </p>
        <p className="flex items-center text-gray-700">
          <Mail size={20} className="mr-2 text-red-500" /> {worker.email}
        </p>
        <p className="flex items-center text-gray-700">
          <Star size={20} className="mr-2 text-yellow-500" />
          {worker.ratings.average} ({worker.ratings.count} reviews)
        </p>
        <p className="flex items-center text-gray-700">
          <MapPin size={20} className="mr-2 text-purple-500" />
          {worker.assignedProperties && worker.assignedProperties.length > 0
            ? worker.assignedProperties.map((prop) => prop.name).join(", ")
            : "No properties assigned"}
        </p>
        <p className="flex items-center text-gray-700">
          <Home size={20} className="mr-2 text-indigo-500" />
          {worker.assignedProperties && worker.assignedProperties.length > 0
            ? worker.assignedProperties[0]?.address || "No address available"
            : "No address available"}
        </p>
        <p className="flex items-center text-gray-700">
          <AlertCircle size={20} className="mr-2 text-orange-500" />
          {worker.activeComplaints} Active Complaints
        </p>
        <p className="text-gray-700 font-semibold">
          Charge: ₹{worker.chargePerService}
        </p>
        <div className="flex justify-between items-center">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              worker.status === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {worker.status}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCardClick(worker);
            }}
            className="flex items-center bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
          >
            <Edit size={16} className="mr-2" /> Edit
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkerModal = ({ worker, onClose, onEdit, onDelete }) => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    contactNumber: "",
    email: "",
    address: "",
    propertyIds: [],
    availabilityDays: [],
    availableTimeSlots: [],
    chargePerService: 0,
    idProofType: "",
    idProofNumber: "",
    profileImage: null,
  });

  const [fullWorker, setFullWorker] = useState(null);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFullWorker = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found");
          return;
        }
        const res = await axios.get(
          `https://api.gharzoreality.com/api/pm/workers/${worker.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.success) {
          setFullWorker(res.data.worker);
        } else {
          setError("Failed to fetch worker details");
        }
      } catch (err) {
        setError("Error fetching worker details: " + err.message);
      }
    };

    if (worker.id) {
      fetchFullWorker();
    }
  }, [worker.id]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found");
          return;
        }

        // Fetch properties
        const propRes = await axios.get(
          "https://api.gharzoreality.com/api/pm/properties",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (propRes.data.success) {
          setProperties(propRes.data.properties);
          if (propRes.data.properties.length === 0) {
            setError("No properties available. Please add properties first.");
          }
        } else {
          setError("Failed to fetch properties");
        }
      } catch (err) {
        setError("Error fetching properties: " + err.message);
      }
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    if (worker) {
      const initialData = {
        name: worker.name || "",
        role: worker.role || "",
        contactNumber: worker.contactNumber || "",
        email: worker.email || "",
        address: worker.address || "",
        propertyIds: (worker.assignedProperties || []).map((p) => p.id) || [],
        availabilityDays: [],
        availableTimeSlots: [],
        chargePerService: worker.chargePerService || 0,
        idProofType: "",
        idProofNumber: "",
        profileImage: null,
      };
      setFormData(initialData);
    }
  }, [worker]);

  useEffect(() => {
    if (fullWorker) {
      const daysMap = {
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
        sunday: "Sunday",
      };
      const timeMap = {
        morning: "Morning",
        afternoon: "Afternoon",
        evening: "Evening",
      };

      let availDays = [];
      let availTimes = [];
      if (fullWorker.availability) {
        availDays = Object.keys(fullWorker.availability.days)
          .filter((day) => fullWorker.availability.days[day])
          .map((day) => daysMap[day]);
        availTimes = Object.keys(fullWorker.availability.timeSlots)
          .filter((slot) => fullWorker.availability.timeSlots[slot])
          .map((slot) => timeMap[slot]);
      }

      setFormData((prev) => ({
        ...prev,
        availabilityDays: availDays,
        availableTimeSlots: availTimes,
        propertyIds: (fullWorker.assignedProperties || []).map((p) => p.id),
        idProofType: fullWorker.idProofType || fullWorker.idProof?.type || prev.idProofType,
        idProofNumber: fullWorker.idProofNumber || fullWorker.idProof?.number || prev.idProofNumber,
        address: fullWorker.address || prev.address,
      }));
    }
  }, [fullWorker]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, profileImage: e.target.files[0] || null }));
  };

  const handleDaysChange = (day) => {
    setFormData((prev) => ({
      ...prev,
      availabilityDays: prev.availabilityDays.includes(day)
        ? prev.availabilityDays.filter((d) => d !== day)
        : [...prev.availabilityDays, day],
    }));
  };

  const handleTimeSlotsChange = (slot) => {
    setFormData((prev) => ({
      ...prev,
      availableTimeSlots: prev.availableTimeSlots.includes(slot)
        ? prev.availableTimeSlots.filter((s) => s !== slot)
        : [...prev.availableTimeSlots, slot],
    }));
  };

  const handlePropertyChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setFormData((prev) => ({
      ...prev,
      propertyIds: selectedOptions,
    }));
  };

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const currentWorkerForDisplay = fullWorker || worker;
  const activeComplaintsCount = (currentWorkerForDisplay.activeComplaints || []).length || currentWorkerForDisplay.activeComplaints || 0;
  const displayAssignedProperties = (currentWorkerForDisplay.assignedProperties || []).map((prop) => prop.name).join(", ") || "No properties assigned";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Worker Details</h2>
          <button onClick={onClose}>
            <X size={24} className="text-gray-600 hover:text-gray-800" />
          </button>
        </div>
        {currentWorkerForDisplay.profileImage && (
          <div className="text-center mb-4">
            <img
              src={currentWorkerForDisplay.profileImage}
              alt={currentWorkerForDisplay.name}
              className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-gray-200"
            />
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 rounded-lg border-l-2 border-red-500 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700">Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700">Contact Number</label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700">Profile Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {formData.profileImage && (
              <p className="text-sm text-gray-500 mt-1">Selected: {formData.profileImage.name}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              placeholder="Enter address"
            />
          </div>
          <div>
            <label className="block text-gray-700">Assigned Properties</label>
            <select
              name="propertyIds"
              multiple
              value={formData.propertyIds}
              onChange={handlePropertyChange}
              className="w-full p-2 border rounded-md h-24"
            >
              {properties.length > 0 ? (
                properties.map((property) => (
                  <option key={property._id || property.id} value={property._id || property.id}>
                    {property.name}, {property.address}
                  </option>
                ))
              ) : (
                <option disabled>No properties available</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Availability Days</label>
            <div className="grid grid-cols-2 gap-2">
              {days.map((day) => (
                <label key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.availabilityDays.includes(day)}
                    onChange={() => handleDaysChange(day)}
                    className="mr-2"
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-700">Available Time Slots</label>
            <div className="grid grid-cols-3 gap-2">
              {["Morning", "Afternoon", "Evening"].map((slot) => (
                <label key={slot} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.availableTimeSlots.includes(slot)}
                    onChange={() => handleTimeSlotsChange(slot)}
                    className="mr-2"
                  />
                  {slot}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-700">
              Charge Per Service (₹)
            </label>
            <input
              type="number"
              name="chargePerService"
              value={formData.chargePerService}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700">ID Proof Type</label>
            <select
              name="idProofType"
              value={formData.idProofType}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Type</option>
              <option value="Aadhaar">Aadhaar</option>
              <option value="PAN">PAN</option>
              <option value="Passport">Passport</option>
              <option value="Driving License">Driving License</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700">ID Proof Number</label>
            <input
              type="text"
              name="idProofNumber"
              value={formData.idProofNumber}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <p className="text-gray-700">
            <strong>Status:</strong> {currentWorkerForDisplay.status}
          </p>
          <p className="text-gray-700">
            <strong>Ratings:</strong> {currentWorkerForDisplay.ratings?.average || 0} (
            {currentWorkerForDisplay.ratings?.count || 0} reviews)
          </p>
          <p className="text-gray-700">
            <strong>Assigned Properties:</strong> {displayAssignedProperties}
          </p>
          <p className="text-gray-700">
            <strong>Active Complaints:</strong> {activeComplaintsCount}
          </p>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => onDelete(currentWorkerForDisplay)}
            className="flex items-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            <Trash size={20} className="mr-2" /> Delete
          </button>
          <button
            onClick={() => onEdit(worker.id, formData)}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            <Edit size={20} className="mr-2" /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center">
      <span>{message}</span>
    </div>
  );
};

const WorkerDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");
        const response = await axios.get(
          "https://api.gharzoreality.com/api/pm/workers",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          setWorkers(response.data.workers);
        } else {
          setError("Failed to fetch worker data");
        }
      } catch (err) {
        setError("Error fetching data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const handleEdit = async (workerId, formData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("role", formData.role);
      formDataToSend.append("contactNumber", formData.contactNumber);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("address", formData.address);
      if (formData.profileImage) {
        formDataToSend.append("profileImage", formData.profileImage);
      }
      formData.availabilityDays.forEach((day) => {
        formDataToSend.append("availabilityDays[]", day);
      });
      formData.availableTimeSlots.forEach((slot) => {
        formDataToSend.append("availableTimeSlots[]", slot);
      });
      formDataToSend.append(
        "chargePerService",
        parseFloat(formData.chargePerService).toString()
      );
      formDataToSend.append("idProofType", formData.idProofType);
      formDataToSend.append("idProofNumber", formData.idProofNumber);
      formData.propertyIds.forEach((id) => {
        formDataToSend.append("propertyIds[]", id);
      });

      const response = await axios.put(
        `https://api.gharzoreality.com/api/pm/workers/${workerId}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setWorkers((prev) =>
          prev.map((w) =>
            w.id === workerId ? { ...w, ...response.data.worker } : w
          )
        );
        setToast(response.data.message);
        setSelectedWorker(null);
      } else {
        setError("Failed to update worker");
      }
    } catch (err) {
      setError("Error updating worker: " + err.message);
    }
  };

  const handleDelete = async (workerData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const response = await axios.delete(
        `https://api.gharzoreality.com/api/pm/workers/${workerData.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            name: workerData.name,
            role: workerData.role,
            contactNumber: workerData.contactNumber,
            email: workerData.email,
            address: workerData.address || "",
            propertyIds: (workerData.assignedProperties || []).map(p => p.id) || [],
            availabilityDays: workerData.availabilityDays || [],
            availableTimeSlots: workerData.availableTimeSlots || [],
            chargePerService: workerData.chargePerService,
            idProofType: workerData.idProofType || "",
            idProofNumber: workerData.idProofNumber || "",
          },
        }
      );
      if (response.data.success) {
        setWorkers((prev) => prev.filter((w) => w.id !== workerData.id));
        setToast(response.data.message);
        setSelectedWorker(null);
      } else {
        setError("Failed to delete worker");
      }
    } catch (err) {
      setError("Error deleting worker: " + err.message);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Worker Dashboard
      </h1>
      {loading && <p className="text-center text-gray-600">Loading...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {workers.map((worker) => (
          <WorkerCard
            key={worker.id}
            worker={worker}
            onCardClick={setSelectedWorker}
          />
        ))}
      </div>
      {selectedWorker && (
        <WorkerModal
          worker={selectedWorker}
          onClose={() => setSelectedWorker(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default WorkerDashboard;