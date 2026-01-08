import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const amenitiesList = [
  "WiFi",
  "Parking",
  "Security",
  "Power Backup",
  "Water Supply",
  "Lift",
  "Garden",
  "CCTV",
  "Housekeeping",
  "24x7 Water",
];

const EditpropertySeller = () => {
  const { id } = useParams(); // Dynamic property ID from URL
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Retrieve sellertoken dynamically from localStorage
  const sellertoken = localStorage.getItem("sellertoken") || null;

  useEffect(() => {
    // Fetch property data from API
    const fetchProperty = async () => {
      if (!sellertoken) {
        setError("Authentication token missing");
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          `https://api.gharzoreality.com/api/seller/edit-property/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sellertoken}`,
            },
          }
        );
        const data = await response.json();
        if (data.success && data.property) {
          // Map API response to form state
          setForm({
            title: data.property.name || "",
            type: data.property.type || "",
            price: data.property.price || 0, // Not in API response, default to 0
            description: data.property.description || "",
            images: data.property.images?.join(", ") || "",
            address: data.property.address || "",
            city: data.property.city || "",
            state: data.property.state || "",
            pincode: data.property.pinCode || "",
            bedroom: data.property.totalRooms || 0, // Map totalRooms to bedroom
            bathroom: 0, // Not in API response, default to 0
            amenities: data.property.amenities || [],
            email: "", // Not in API response, default empty
            contact: data.property.contactNumber || "",
            ownerName: data.property.ownerName || "",
            latitude: data.property.latitude || "",
            longitude: data.property.longitude || "",
            landmark: data.property.landmark || "",
          });
        } else {
          setError("Property not found");
          navigate("/");
        }
      } catch (err) {
        setError("Failed to fetch property data");
        navigate("/");
      }
    };

    fetchProperty();
  }, [id, navigate, sellertoken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sellertoken) {
      setError("Authentication token missing");
      return;
    }

    try {
      // Prepare payload for API
      const payload = {
        name: form.title,
        type: form.type,
        address: form.address,
        city: form.city,
        state: form.state,
        pinCode: form.pincode,
        landmark: form.landmark,
        contactNumber: form.contact,
        ownerName: form.ownerName,
        description: form.description,
        amenities: form.amenities,
        latitude: parseFloat(form.latitude) || 0,
        longitude: parseFloat(form.longitude) || 0,
      };

      const response = await fetch(
        `https://api.gharzoreality.com/api/seller/edit-property/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sellertoken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (data.success) {
        setShowSuccessModal(true); // Show custom success modal instead of alert
      } else {
        setError(data.message || "Failed to update property");
      }
    } catch (err) {
      setError("An error occurred while updating the property");
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate(`/seller/property/${id}`);
  };

  if (!form) return <div className="p-8 mt-20">Loading...</div>;
  if (error) return <div className="p-8 mt-20 text-red-600">{error}</div>;

  return (
    <>
      <div className="min-h-screen pt-24 px-4 bg-gray-100 flex justify-center">
        <div className="bg-white w-full max-w-3xl p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">
            Edit Property
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1 Fields */}
            <div className="space-y-4">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Property Title"
                className="w-full p-3 border rounded"
                required
              />
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full p-3 border rounded text-gray-700"
                required
              >
                <option value="">Select Property Type</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Flat">Flat</option>
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
              </select>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="Price (₹)"
                className="w-full p-3 border rounded"
                required
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full p-3 border rounded"
                rows="4"
                required
              />
              <input
                name="images"
                value={form.images}
                onChange={handleChange}
                placeholder="Enter image URLs (comma-separated)"
                className="w-full p-3 border rounded"
                required
              />
            </div>

            {/* Step 2 Fields */}
            <div className="space-y-4 pt-4">
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full p-3 border rounded"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="p-3 border rounded"
                  required
                />
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="p-3 border rounded"
                  required
                />
              </div>
              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                className="w-full p-3 border rounded"
                required
              />
              <input
                name="landmark"
                value={form.landmark}
                onChange={handleChange}
                placeholder="Landmark"
                className="w-full p-3 border rounded"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="bedroom"
                  value={form.bedroom}
                  onChange={handleChange}
                  placeholder="Bedrooms"
                  type="number"
                  className="p-3 border rounded"
                  required
                />
                <input
                  name="bathroom"
                  value={form.bathroom}
                  onChange={handleChange}
                  placeholder="Bathrooms"
                  type="number"
                  className="p-3 border rounded"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="Latitude"
                  type="number"
                  step="any"
                  className="p-3 border rounded"
                />
                <input
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="Longitude"
                  type="number"
                  step="any"
                  className="p-3 border rounded"
                />
              </div>

              {/* Amenities */}
              <div>
                <p className="mb-2 font-medium text-gray-700">Amenities</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {amenitiesList.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={`flex items-center justify-between p-2 border rounded hover:bg-indigo-100 transition ${
                        form.amenities.includes(item)
                          ? "bg-indigo-200 border-indigo-500"
                          : ""
                      }`}
                      onClick={() => toggleAmenity(item)}
                    >
                      {item}
                      {form.amenities.includes(item) && (
                        <FaCheckCircle className="text-green-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3 Fields */}
            <div className="space-y-4 pt-4">
              <input
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                placeholder="Owner Name"
                className="w-full p-3 border rounded"
                required
              />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                type="email"
                className="w-full p-3 border rounded"
                required
              />
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="Contact Number"
                type="tel"
                className="w-full p-3 border rounded"
                required
              />
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 text-lg font-semibold"
              >
                Update Property
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-fade-in">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-sm text-gray-600 mb-6">
                Property updated successfully! ✅
              </p>
              <button
                onClick={handleCloseModal}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                OK, Take Me Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditpropertySeller;