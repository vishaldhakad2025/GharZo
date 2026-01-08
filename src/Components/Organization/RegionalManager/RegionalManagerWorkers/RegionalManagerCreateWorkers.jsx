
import React, { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  Phone,
  Mail,
  Home,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  MapPin,
} from "lucide-react";

const AddWorkerForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    contactNumber: "",
    email: "",
    address: "",
    availabilityDays: [],
    availableTimeSlots: [],
    chargePerService: "",
    idProofType: "",
    idProofNumber: "",
    assignedProperties: [],
  });

  const [properties, setProperties] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]); // To track assigned properties
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const timeSlots = ["Morning", "Afternoon", "Evening", "Night"];
  const idProofOptions = ["Aadhaar", "PAN Card", "Driving License", "Passport"];
  const roleOptions = [
    "Electrician",
    "Plumber",
    "Carpenter",
    "Painter",
    "Cleaner",
    "Pest Control",
    "AC Technician",
    "RO Technician",
    "Lift Maintenance",
    "Security Guard",
    "CCTV Technician",
    "Gardener",
    "Generator Technician",
    "Internet Technician",
    "Other",
  ];

  // Fetch properties and workers on component mount
  useEffect(() => {
    const fetchPropertiesAndWorkers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found");
          return;
        }

        // Fetch properties
        const propRes = await fetch(
          "https://api.gharzoreality.com/api/sub-owner/properties",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const propData = await propRes.json();
        if (!propData.success) {
          setError("Failed to fetch properties");
          return;
        }

        // Fetch workers to get assigned properties
        const workerRes = await fetch(
          "https://api.gharzoreality.com/api/sub-owner/workers",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const workerData = await workerRes.json();
        if (!workerData.success) {
          setError("Failed to fetch workers");
          return;
        }

        setProperties(propData.properties);
        setAllWorkers(workerData.workers);
      } catch (err) {
        setError("Error fetching data: " + err.message);
      }
    };
    fetchPropertiesAndWorkers();
  }, []);

  // Filter unassigned properties
  const unassignedProperties = properties.filter((property) => {
    return !allWorkers.some((worker) =>
      worker.assignedProperties.some((prop) => prop.id === property.id)
    );
  });

  // Filter assigned properties
  const assignedProperties = properties.filter((property) =>
    allWorkers.some((worker) =>
      worker.assignedProperties.some((prop) => prop.id === property.id)
    )
  );

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.role.trim()) newErrors.role = "Role is required";
    if (
      !formData.contactNumber.trim() ||
      !/^\d{10}$/.test(formData.contactNumber)
    )
      newErrors.contactNumber = "Valid 10-digit phone number is required";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Valid email is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (formData.availabilityDays.length === 0)
      newErrors.availabilityDays = "At least one day is required";
    if (formData.availableTimeSlots.length === 0)
      newErrors.availableTimeSlots = "At least one time slot is required";
    if (!formData.chargePerService || formData.chargePerService <= 0)
      newErrors.chargePerService = "Valid charge is required";
    if (!formData.idProofType)
      newErrors.idProofType = "ID Proof Type is required";
    if (!formData.idProofNumber.trim())
      newErrors.idProofNumber = "ID Proof Number is required";
    else {
      if (
        formData.idProofType === "Aadhaar" &&
        !/^\d{4}\s\d{4}\s\d{4}$/.test(formData.idProofNumber)
      ) {
        newErrors.idProofNumber = "Aadhaar should be in format XXXX XXXX XXXX";
      } else if (
        formData.idProofType === "PAN Card" &&
        !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.idProofNumber)
      ) {
        newErrors.idProofNumber = "PAN should be in format ABCDE1234F";
      }
    }
    if (formData.assignedProperties.length === 0)
      newErrors.assignedProperties = "At least one property must be selected";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "idProofNumber" && formData.idProofType === "Aadhaar") {
      const cleaned = value.replace(/\D/g, "");
      let formatted = "";
      for (let i = 0; i < cleaned.length && i < 12; i++) {
        if (i === 4 || i === 8) formatted += " ";
        formatted += cleaned[i];
      }
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const newArray = checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value);
      return { ...prev, [field]: newArray };
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePropertyChange = (propertyId) => {
    setFormData((prev) => {
      const newAssignedProperties = prev.assignedProperties.includes(propertyId)
        ? prev.assignedProperties.filter((id) => id !== propertyId)
        : [...prev.assignedProperties, propertyId];
      return { ...prev, assignedProperties: newAssignedProperties };
    });
    if (errors.assignedProperties)
      setErrors((prev) => ({ ...prev, assignedProperties: "" }));
  };

  const handleIdProofChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      idProofType: value,
      idProofNumber: "",
    }));
    if (errors.idProofType) setErrors((prev) => ({ ...prev, idProofType: "" }));
    if (errors.idProofNumber)
      setErrors((prev) => ({ ...prev, idProofNumber: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    setResponse(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found");
      setLoading(false);
      return;
    }

    try {
      const body = {
        ...formData,
        chargePerService: parseFloat(formData.chargePerService),
        idProofNumber:
          formData.idProofType === "Aadhaar"
            ? formData.idProofNumber.replace(/\s/g, "")
            : formData.idProofNumber,
      };

      const res = await fetch(
        "https://api.gharzoreality.com/api/sub-owner/workers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to add worker");
      }

      const data = await res.json();
      setResponse(data);
      setFormData({
        name: "",
        role: "",
        contactNumber: "",
        email: "",
        address: "",
        availabilityDays: [],
        availableTimeSlots: [],
        chargePerService: "",
        idProofType: "",
        idProofNumber: "",
        assignedProperties: [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIdProofPlaceholder = () => {
    switch (formData.idProofType) {
      case "Aadhaar":
        return "Enter Aadhaar (XXXX XXXX XXXX)";
      case "PAN Card":
        return "Enter PAN (ABCDE1234F)";
      case "Driving License":
        return "Enter Driving License Number";
      case "Passport":
        return "Enter Passport Number";
      default:
        return "Select ID Proof Type first";
    }
  };

  const getIdProofPattern = () => {
    switch (formData.idProofType) {
      case "Aadhaar":
        return "\\d{4}\\s\\d{4}\\s\\d{4}";
      case "PAN Card":
        return "[A-Z]{5}[0-9]{4}[A-Z]{1}";
      default:
        return ".*";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-4xl border border-white/20">
        <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center text-gray-800">
          <User className="mr-3 h-8 w-8 text-blue-500" /> Add Worker
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <User size={20} className="mr-2 text-pink-500" /> Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter full name"
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <Briefcase size={20} className="mr-2 text-green-500" /> Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={`border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.role ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value="">Select Role</option>
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <Phone size={20} className="mr-2 text-orange-500" /> Contact
              Number *
            </label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              pattern="\d{10}"
              className={`border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.contactNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter 10-digit phone number"
              required
            />
            {errors.contactNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.contactNumber}
              </p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <Mail size={20} className="mr-2 text-purple-500" /> Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter email address"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <Home size={20} className="mr-2 text-indigo-500" /> Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={`border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter full address"
              required
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <MapPin size={20} className="mr-2 text-purple-500" /> Assigned
              Properties *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl">
              {properties.slice(0, 2).map((property) => {
                const isAssigned = assignedProperties.some(
                  (p) => p.id === property.id
                );
                return (
                  <button
                    key={property.id}
                    type="button"
                    onClick={() => !isAssigned && handlePropertyChange(property.id)}
                    className={`p-3 rounded-xl text-white font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-lg ${
                      isAssigned
                        ? "bg-orange-500 opacity-50 cursor-not-allowed"
                        : formData.assignedProperties.includes(property.id)
                        ? "bg-green-700 hover:bg-green-800"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                    disabled={isAssigned}
                  >
                    {property.name}, {property.address}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="p-0 py-2 rounded-xl text-black font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-lg "
              >
                {Math.max(0, properties.length - 2)}+more
              </button>
            </div>
            {errors.assignedProperties && (
              <p className="text-red-500 text-sm mt-1">
                {errors.assignedProperties}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="flex flex-col space-y-1">
              <label className="font-semibold text-gray-700 flex items-center">
                <Calendar size={20} className="mr-2 text-teal-500" />{" "}
                Availability Days *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 p-4 bg-gray-50 rounded-xl">
                {days.map((day) => (
                  <label
                    key={day}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={day}
                      checked={formData.availabilityDays.includes(day)}
                      onChange={(e) =>
                        handleCheckboxChange(e, "availabilityDays")
                      }
                      className="mr-1"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {day}
                    </span>
                  </label>
                ))}
              </div>
              {errors.availabilityDays && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.availabilityDays}
                </p>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex flex-col space-y-1">
              <label className="font-semibold text-gray-700 flex items-center">
                <Clock size={20} className="mr-2 text-yellow-500" /> Available
                Time Slots *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl">
                {timeSlots.map((slot) => (
                  <label
                    key={slot}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={slot}
                      checked={formData.availableTimeSlots.includes(slot)}
                      onChange={(e) =>
                        handleCheckboxChange(e, "availableTimeSlots")
                      }
                      className="mr-1"
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {slot}
                    </span>
                  </label>
                ))}
              </div>
              {errors.availableTimeSlots && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.availableTimeSlots}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <DollarSign size={20} className="mr-2 text-green-600" /> Charge
              Per Service (₹) *
            </label>
            <input
              type="number"
              name="chargePerService"
              value={formData.chargePerService}
              onChange={handleInputChange}
              min="1"
              className={`border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.chargePerService ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter amount"
              required
            />
            {errors.chargePerService && (
              <p className="text-red-500 text-sm mt-1">
                {errors.chargePerService}
              </p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <FileText size={20} className="mr-2 text-red-500" /> ID Proof Type
              *
            </label>
            <select
              name="idProofType"
              value={formData.idProofType}
              onChange={handleIdProofChange}
              className={`border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.idProofType ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value="">Select ID Proof Type</option>
              {idProofOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.idProofType && (
              <p className="text-red-500 text-sm mt-1">{errors.idProofType}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="flex flex-col space-y-1">
              <label className="font-semibold text-gray-700 flex items-center">
                <FileText size={20} className="mr-2 text-red-500" /> ID Proof
                Number *
              </label>
              <input
                type="text"
                name="idProofNumber"
                value={formData.idProofNumber}
                onChange={handleInputChange}
                pattern={getIdProofPattern()}
                placeholder={getIdProofPlaceholder()}
                className={`border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.idProofNumber ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.idProofNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.idProofNumber}
                </p>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 hover:from-blue-600 hover:to-purple-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? "Adding Worker..." : "Add Worker"}
            </button>
          </div>
        </form>

        {response && (
          <div className="mt-4 p-3 bg-green-100 rounded-lg border-l-2 border-green-500 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-green-800 font-medium">
              Success! {response.worker.name}
            </span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 rounded-lg border-l-2 border-red-500 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl transform transition-all duration-300 ease-in-out scale-100 opacity-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">All Properties</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-gray-800 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {properties.map((property) => {
                const isAssigned = assignedProperties.some(
                  (p) => p.id === property.id
                );
                return (
                  <button
                    key={property.id}
                    type="button"
                    onClick={() => !isAssigned && handlePropertyChange(property.id)}
                    className={`p-4 rounded-xl text-white font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
                      isAssigned
                        ? "bg-orange-500 opacity-50 cursor-not-allowed"
                        : formData.assignedProperties.includes(property.id)
                        ? "bg-green-700 hover:bg-green-800"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                    disabled={isAssigned}
                  >
                    {property.name}, {property.address}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddWorkerForm;