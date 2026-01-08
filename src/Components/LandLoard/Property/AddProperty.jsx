import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import baseurl from "../../../../BaseUrl";
import {
  FaHome,
  FaMapMarkerAlt,
  FaCity,
  FaMap,
  FaMapPin,
  FaBed,
  FaDoorOpen,
  FaImage,
  FaMoneyBillWave,
  FaUsers,
  FaCheckCircle,
  FaTrash,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddProperty = ({ propertyData }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: propertyData?.name || "",
    type: propertyData?.type || "PG",
    address: propertyData?.address || "",
    city: propertyData?.city || "",
    state: propertyData?.state || "",
    pinCode: propertyData?.pinCode || "",
    totalRooms: propertyData?.totalRooms || "",
    totalBeds: propertyData?.totalBeds || "",
    rent: propertyData?.rent || "",
    furnished: propertyData?.furnished || false,
    description: propertyData?.description || "",
  });

  const [roomData, setRoomData] = useState({
    price: propertyData?.roomData?.price || "",
    capacity: propertyData?.roomData?.capacity || 1,
    status: propertyData?.roomData?.status || "Available",
    facilities: propertyData?.roomData?.facilities || {
      roomEssentials: {
        bed: false,
        table: false,
        chair: false,
        fan: false,
        light: false,
      },
      comfortFeatures: { ac: false, geyser: false },
      washroomHygiene: { attachedWashroom: false, westernToilet: false },
      utilitiesConnectivity: { wifi: false, powerBackup: false },
      laundryHousekeeping: { laundry: false, housekeeping: false },
      securitySafety: { cctv: false, securityGuard: false },
      parkingTransport: { bikeParking: false, carParking: false },
      propertySpecific: { kitchen: false, balcony: false },
      nearbyFacilities: { market: false, hospital: false },
    },
    beds: propertyData?.roomData?.beds || [{ price: "", status: "Available" }],
  });

  const [images, setImages] = useState(propertyData?.images || []);
  const [imageFiles, setImageFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Detect sidebar hover state
  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const handleMouseEnter = () => setIsSidebarHovered(true);
      const handleMouseLeave = () => setIsSidebarHovered(false);

      sidebar.addEventListener("mouseenter", handleMouseEnter);
      sidebar.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        sidebar.removeEventListener("mouseenter", handleMouseEnter);
        sidebar.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  const validateField = (name, value) => {
    if (!value.toString().trim()) {
      return "This field is required";
    }
    if (["name", "city", "state"].includes(name)) {
      if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
        return "Letters only allowed";
      }
    } else if (name === "address") {
      if (!/^[a-zA-Z0-9\s.,-]+$/.test(value.trim())) {
        return "Letters, numbers, spaces, commas, periods, and hyphens only allowed";
      }
    } else if (name === "pinCode") {
      if (!/^\d{6}$/.test(value.trim())) {
        return "Must be exactly 6 digits";
      }
    }
    return "";
  };

  // Fetch property if editing
  useEffect(() => {
    if (id && !propertyData) {
      const fetchProperty = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("Not authenticated. Please login.");
            return;
          }

          const response = await axios.get(
            `${baseurl}api/landlord/properties/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = response.data.property;

          const transformFacilities = (facilitiesData) => {
            if (!facilitiesData) return roomData.facilities;
            const defaultFacilities = {
              roomEssentials: {
                bed: false,
                table: false,
                chair: false,
                fan: false,
                light: false,
              },
              comfortFeatures: { ac: false, geyser: false },
              washroomHygiene: {
                attachedWashroom: false,
                westernToilet: false,
              },
              utilitiesConnectivity: { wifi: false, powerBackup: false },
              laundryHousekeeping: { laundry: false, housekeeping: false },
              securitySafety: { cctv: false, securityGuard: false },
              parkingTransport: { bikeParking: false, carParking: false },
              propertySpecific: { kitchen: false, balcony: false },
              nearbyFacilities: { market: false, hospital: false },
            };

            const transformed = { ...defaultFacilities };
            Object.keys(facilitiesData).forEach((key) => {
              if (
                typeof facilitiesData[key] === "object" &&
                facilitiesData[key] !== null
              ) {
                Object.assign(transformed[key] || {}, facilitiesData[key]);
              } else {
                Object.keys(defaultFacilities).forEach((category) => {
                  if (defaultFacilities[category][key] !== undefined) {
                    transformed[category][key] = !!facilitiesData[key];
                  }
                });
              }
            });
            return transformed;
          };

          setFormData({
            name: data.name || "",
            type: data.type || "PG",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            pinCode: data.pinCode || "",
            totalRooms: data.totalRooms || "",
            totalBeds: data.totalBeds || "",
            rent: data.monthlyCollection || "",
            furnished: data.isActive || false,
            description: data.description || "",
          });
          setRoomData({
            price: data.roomData?.price || "",
            capacity: data.roomData?.capacity || 1,
            status: data.roomData?.status || "Available",
            facilities: transformFacilities(data.roomData?.facilities),
            beds: data.roomData?.beds || [{ price: "", status: "Available" }],
          });
          setImages(data.images || []);
          setErrors({});
        } catch (err) {
          toast.error("Failed to fetch property data");
          console.error(err);
        }
      };
      fetchProperty();
    } else if (propertyData) {
      const transformFacilities = (facilitiesData) => {
        if (!facilitiesData) return roomData.facilities;
        const defaultFacilities = {
          roomEssentials: {
            bed: false,
            table: false,
            chair: false,
            fan: false,
            light: false,
          },
          comfortFeatures: { ac: false, geyser: false },
          washroomHygiene: { attachedWashroom: false, westernToilet: false },
          utilitiesConnectivity: { wifi: false, powerBackup: false },
          laundryHousekeeping: { laundry: false, housekeeping: false },
          securitySafety: { cctv: false, securityGuard: false },
          parkingTransport: { bikeParking: false, carParking: false },
          propertySpecific: { kitchen: false, balcony: false },
          nearbyFacilities: { market: false, hospital: false },
        };

        const transformed = { ...defaultFacilities };
        Object.keys(facilitiesData).forEach((key) => {
          if (
            typeof facilitiesData[key] === "object" &&
            facilitiesData[key] !== null
          ) {
            Object.assign(transformed[key] || {}, facilitiesData[key]);
          } else {
            Object.keys(defaultFacilities).forEach((category) => {
              if (defaultFacilities[category][key] !== undefined) {
                transformed[category][key] = !!facilitiesData[key];
              }
            });
          }
        });
        return transformed;
      };

      setRoomData({
        price: propertyData.roomData?.price || "",
        capacity: propertyData.roomData?.capacity || 1,
        status: propertyData.roomData?.status || "Available",
        facilities: transformFacilities(propertyData.roomData?.facilities),
        beds: propertyData.roomData?.beds || [
          { price: "", status: "Available" },
        ],
      });
      setErrors({});
    }
  }, [id, propertyData]);

  // Handlers
  const handlePropertyChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    const error = validateField(name, newValue);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleRoomChange = (e) => {
    const { name, value } = e.target;
    setRoomData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      toast.error("You can upload a maximum of 10 images.");
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...previewUrls]);
    toast.success(`${files.length} image(s) selected for upload`);
  };

  // Delete image handler
  const handleDeleteImage = async (index) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated. Please login.");
      return;
    }

    const imageToDelete = images[index];
    const isNewImage = imageToDelete.startsWith("blob:");

    if (isNewImage) {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
      setImages((prev) => prev.filter((_, i) => i !== index));
      URL.revokeObjectURL(imageToDelete);
      toast.success("Image deleted successfully");
    } else {
      try {
        await axios.delete(`${baseurl}api/landlord/properties/images`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            propertyId: id,
            imageUrls: [imageToDelete],
          },
        });
        setImages((prev) => prev.filter((_, i) => i !== index));
        toast.success("Image deleted successfully");
      } catch (err) {
        console.error("Error deleting image:", err);
        toast.error(
          `Error deleting image: ${err.response?.data?.message || err.message}`
        );
      }
    }
  };

  // Upload images to the dedicated endpoint
  const uploadImages = async (propertyId, token) => {
    try {
      const imageFormData = new FormData();
      imageFormData.append("propertyId", propertyId);
      imageFiles.forEach((file) => {
        imageFormData.append(`images`, file);
      });

      const response = await axios.post(
        `${baseurl}api/landlord/properties/images`,
        imageFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Images uploaded successfully!");
        return response.data.images || [];
      } else {
        throw new Error("Failed to upload images");
      }
    } catch (err) {
      console.error("Error uploading images:", err);
      toast.error(
        `Error uploading images: ${err.response?.data?.message || err.message}`
      );
      return [];
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate all fields on submit
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (["name", "type", "address", "city", "state", "pinCode", "description"].includes(key)) {
        newErrors[key] = validateField(key, formData[key]);
      }
    });
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => err);
    if (hasErrors) {
      toast.error("Please fix the errors in the form.");
      setSubmitting(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated. Please login.");
      setSubmitting(false);
      return;
    }

    try {
      const propertyPayload = {
        ...formData,
        monthlyCollection: formData.rent, // FIX here
        roomData: {
          price: roomData.price,
          capacity: roomData.capacity,
          status: roomData.status,
          facilities: roomData.facilities,
          beds: roomData.beds,
        },
      };

      let propertyResponse;
      if (id) {
        propertyResponse = await axios.put(
          `${baseurl}api/landlord/properties/${id}`,
          propertyPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        propertyResponse = await axios.post(
          `${baseurl}api/landlord/properties`,
          propertyPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (propertyResponse.status === 200 || propertyResponse.status === 201) {
        const propertyId = id || propertyResponse.data.property?._id;
        if (!propertyId) {
          throw new Error("Property ID not found in response");
        }

        let uploadedImages = [];
        if (imageFiles.length > 0) {
          uploadedImages = await uploadImages(propertyId, token);
        }

        toast.success(`Property ${id ? "updated" : "added"} successfully!`);
        navigate("/landlord/property");
      }
    } catch (err) {
      console.error("Error submitting property:", err);
      toast.error(
        `Error ${id ? "updating" : "adding"} property: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "PG",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      totalRooms: "",
      totalBeds: "",
      rent: "",
      furnished: false,
      description: "",
    });
    setRoomData({
      price: "",
      capacity: 1,
      status: "Available",
      facilities: {
        roomEssentials: {
          bed: false,
          table: false,
          chair: false,
          fan: false,
          light: false,
        },
        comfortFeatures: { ac: false, geyser: false },
        washroomHygiene: { attachedWashroom: false, westernToilet: false },
        utilitiesConnectivity: { wifi: false, powerBackup: false },
        laundryHousekeeping: { laundry: false, housekeeping: false },
        securitySafety: { cctv: false, securityGuard: false },
        parkingTransport: { bikeParking: false, carParking: false },
        propertySpecific: { kitchen: false, balcony: false },
        nearbyFacilities: { market: false, hospital: false },
      },
      beds: [{ price: "", status: "Available" }],
    });
    setImages([]);
    setImageFiles([]);
    setMessage("");
    setErrors({});
  };

  const isUpdate = !!id;

  return (
    <div
      className={`px-2 py-4 md:px-20 min-h-screen text-white transition-all duration-500 min-w-0 ${
        isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{
        background: `radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)`,
        boxSizing: "border-box"
      }}
    >
      <motion.div
        className="mx-auto p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl mt-10 mb-20 w-[370px] md:w-[600px] lg:w-[1000px]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl font-extrabold mb-8 text-center text-orange-300 drop-shadow-lg">
          {isUpdate ? "Update Property" : "Add Property"}
        </h2>

        {message && (
          <p
            className={`mb-6 text-center font-medium text-lg ${
              message.includes("Success") ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}

        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* PROPERTY DETAILS */}
          <section>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-orange-300">
              <FaHome className="text-orange-400" />
              Property Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "name", placeholder: "Property Name", icon: FaHome },
                {
                  name: "type",
                  placeholder: "Type",
                  icon: FaDoorOpen,
                  select: true,
                  options: [
                    "PG",
                    "Hostel",
                    "Room",
                    "Flat",
                    "Rental",
                    "1 BHK",
                    "2 BHK",
                    "3 BHK",
                    "4 BHK",
                    "1 RK",
                    "Studio Apartment",
                    "Luxury Bungalows",
                    "Villas",
                    "Builder Floor",
                  ],
                },
                { name: "address", placeholder: "Address", icon: FaMapMarkerAlt },
                { name: "city", placeholder: "City", icon: FaCity },
                { name: "state", placeholder: "State", icon: FaMap },
                { name: "pinCode", placeholder: "Pin Code", icon: FaMapPin },
                {
                  name: "description",
                  placeholder: "Property Description",
                  icon: FaHome,
                  textarea: true,
                },
              ].map((f, i) => (
                <div className="relative" key={i}>
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="absolute left-3 top-4 z-10"
                  >
                    <f.icon className="text-2xl text-orange-400 drop-shadow-md" />
                  </motion.div>
                  {f.select ? (
                    <select
                      name={f.name}
                      value={formData[f.name]}
                      onChange={handlePropertyChange}
                      className={`w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border ${
                        errors[f.name] ? "border-red-500/70" : "border-white/30"
                      } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all`}
                    >
                      <option value="" className="bg-gray-800">Select Type</option>
                      {f.options.map((o) => (
                        <option key={o} value={o} className="bg-gray-800">
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : f.textarea ? (
                    <textarea
                      name={f.name}
                      value={formData[f.name]}
                      onChange={handlePropertyChange}
                      placeholder={f.placeholder}
                      rows="4"
                      className={`w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border ${
                        errors[f.name] ? "border-red-500/70" : "border-white/30"
                      } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none`}
                    />
                  ) : (
                    <input
                      type={
                        f.name === "rent" ||
                        f.name.includes("Rooms") ||
                        f.name.includes("Beds")
                          ? "number"
                          : "text"
                      }
                      name={f.name}
                      value={formData[f.name]}
                      onChange={handlePropertyChange}
                      placeholder={f.placeholder}
                      className={`w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border ${
                        errors[f.name] ? "border-red-500/70" : "border-white/30"
                      } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all`}
                    />
                  )}
                  {errors[f.name] && (
                    <p className="text-red-400 text-sm mt-2 pl-12">
                      {errors[f.name]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* IMAGES */}
          <section>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-orange-300">
              <FaImage className="text-orange-400" />
              Property Images (Max 10)
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Property ${index + 1}`}
                      className="h-32 w-full object-cover rounded-xl border border-white/20 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(index)}
                      className="absolute top-2 right-2 bg-red-600/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition backdrop-blur-sm"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="relative">
                <FaImage className="absolute left-4 top-4 text-2xl text-orange-400 z-10" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full pl-14 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white file:mr-4 file:py-2 file:px-6 file:rounded-lg file:border-0 file:bg-orange-600/80 file:text-white hover:file:bg-orange-500 cursor-pointer transition"
                />
              </div>
            </div>
          </section>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
            <button
              type="button"
              onClick={resetForm}
              className="px-10 py-3 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-10 py-3 bg-orange-600/80 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg"
            >
              {submitting
                ? isUpdate
                  ? "Updating Property..."
                  : "Adding Property..."
                : isUpdate
                ? "Update Property"
                : "Add Property"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddProperty;