// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
// import {
//   FaUser,
//   FaArrowLeft,
//   FaPhone,
//   FaEnvelope,
//   FaIdCard,
//   FaCalendar,
//   FaBriefcase,
//   FaHome,
//   FaImage,
//   FaTimesCircle,
//   FaMale,
//   FaFemale,
//   FaUserFriends,
//   FaMoneyCheckAlt,
//   FaFileContract,
//   FaMoneyBillWave,
//   FaBolt,
//   FaMapMarkerAlt,
//   FaSpinner,
//   FaBed,
//   FaChevronDown,
// } from "react-icons/fa";
// import { motion } from "framer-motion";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const FIXED_TOKEN =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjA5MzdkMmVlMWNkNzVkY2Q3NzAxNSIsInJvbGUiOiJsYW5kbG9yZCIsIm1vYmlsZSI6Ijg4MzkwOTMyNzAiLCJlbWFpbCI6InBhbmRhZ3JlYmh1c2hhbjNAZ21haWwuY29tIiwiaWF0IjoxNzU2NTMzMDExLCJleHAiOjE3NTkxMjUwMTF9._VikMS4j9eaG-L6icqIee40TBM7A57w0NFWEIPsOL8U";

// const TenantForm = () => {
//   const { id: propertyId } = useParams(); // Get propertyId from URL params
//   const navigate = useNavigate();
//   const location = useLocation();
//   const editingTenant = location.state?.tenant; // Adjusted to access tenant from location.state
//   const isEdit = Boolean(editingTenant);
//   const [isLoading, setIsLoading] = useState(false);
//   const [availableRooms, setAvailableRooms] = useState([]);
//   const [isFetchingRooms, setIsFetchingRooms] = useState(false);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     aadhaar: "",
//     mobile: "",
//     permanentAddress: "",
//     work: "",
//     dob: "",
//     maritalStatus: "",
//     fatherName: "",
//     fatherMobile: "",
//     motherName: "",
//     motherMobile: "",
//     photo: null,
//     propertyId: propertyId || "", // Initialize with propertyId from useParams
//     roomId: "",
//     moveInDate: "",
//     rentAmount: "",
//     securityDeposit: "",
//     noticePeriod: "",
//     agreementPeriod: "",
//     agreementPeriodType: "months",
//     rentOnDate: "",
//     rentDateOption: "fixed",
//     rentalFrequency: "Monthly",
//     referredBy: "",
//     remarks: "",
//     bookedBy: "",
//     electricityPerUnit: "",
//     initialReading: "",
//     finalReading: "",
//     initialReadingDate: "",
//     finalReadingDate: "",
//     electricityDueDescription: "",
//     openingBalanceStartDate: "",
//     openingBalanceEndDate: "",
//     openingBalanceAmount: "",
//   });

//   // Fetch available rooms for the given propertyId
//   useEffect(() => {
//     if (propertyId) {
//       const fetchAvailableRooms = async () => {
//         setIsFetchingRooms(true);
//         try {
//           const token = localStorage.getItem("landlordToken") || FIXED_TOKEN;
//           console.log("Fetching rooms for propertyId:", propertyId);
//           const response = await axios.get(
//             `https://api.gharzoreality.com/api/landlord/properties/${propertyId}/rooms/available`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             }
//           );
//           const roomsData = response.data.rooms || [];
//           setAvailableRooms(roomsData);
//           console.log("Fetched available rooms:", roomsData);
//           // Reset roomId if it doesn't belong to the available rooms
//           if (!roomsData.some((room) => room.roomId === formData.roomId)) {
//             console.log(
//               "Resetting roomId: Current roomId",
//               formData.roomId,
//               "not in available rooms"
//             );
//             setFormData((prev) => ({ ...prev, roomId: "", rentAmount: "" }));
//           }
//           if (roomsData.length === 0) {
//             toast.warn("No available rooms for this property.");
//           }
//         } catch (error) {
//           toast.error("Failed to fetch available rooms. Please try again.");
//           console.error("Error fetching available rooms:", error);
//           setAvailableRooms([]);
//         } finally {
//           setIsFetchingRooms(false);
//         }
//       };
//       fetchAvailableRooms();
//     } else {
//       setAvailableRooms([]);
//       setFormData((prev) => ({ ...prev, roomId: "", rentAmount: "" }));
//     }
//   }, [propertyId, formData.roomId]);

//   // Pre-fill form for editing
//   useEffect(() => {
//     if (editingTenant) {
//       const sanitizedTenant = {
//         name: editingTenant.name ?? "",
//         email: editingTenant.email ?? "",
//         aadhaar: editingTenant.aadhaar ?? "",
//         mobile: editingTenant.mobile ?? "",
//         permanentAddress: editingTenant.permanentAddress ?? "",
//         work: editingTenant.work ?? "",
//         dob: editingTenant.dob ?? "",
//         maritalStatus: editingTenant.maritalStatus ?? "",
//         fatherName: editingTenant.fatherName ?? "",
//         fatherMobile: editingTenant.fatherMobile ?? "",
//         motherName: editingTenant.motherName ?? "",
//         motherMobile: editingTenant.motherMobile ?? "",
//         photo: editingTenant.photo ?? null,
//         propertyId: propertyId || editingTenant.propertyId || "", // Ensure propertyId is from URL or tenant
//         roomId: editingTenant.roomId ?? "",
//         moveInDate: editingTenant.moveInDate ?? "",
//         rentAmount: editingTenant.rentAmount ?? "",
//         securityDeposit: editingTenant.securityDeposit ?? "",
//         noticePeriod: editingTenant.noticePeriod ?? "",
//         agreementPeriod: editingTenant.agreementPeriod ?? "",
//         agreementPeriodType: editingTenant.agreementPeriodType ?? "months",
//         rentOnDate: editingTenant.rentOnDate ?? "",
//         rentDateOption: editingTenant.rentDateOption ?? "fixed",
//         rentalFrequency: editingTenant.rentalFrequency ?? "Monthly",
//         referredBy: editingTenant.referredBy ?? "",
//         remarks: editingTenant.remarks ?? "",
//         bookedBy: editingTenant.bookedBy ?? "",
//         electricityPerUnit: editingTenant.electricityPerUnit ?? "",
//         initialReading: editingTenant.initialReading ?? "",
//         finalReading: editingTenant.finalReading ?? "",
//         initialReadingDate: editingTenant.initialReadingDate ?? "",
//         finalReadingDate: editingTenant.finalReadingDate ?? "",
//         electricityDueDescription:
//           editingTenant.electricityDueDescription ?? "",
//         openingBalanceStartDate: editingTenant.openingBalanceStartDate ?? "",
//         openingBalanceEndDate: editingTenant.openingBalanceEndDate ?? "",
//         openingBalanceAmount: editingTenant.openingBalanceAmount ?? "",
//       };
//       setFormData(sanitizedTenant);
//       console.log("Editing tenant data:", sanitizedTenant);
//       console.log("Initial roomId:", sanitizedTenant.roomId);
//     }
//   }, [editingTenant, propertyId]);

//   // Pre-fill rentAmount when roomId changes
//   useEffect(() => {
//     console.log("Current roomId:", formData.roomId);
//     console.log("Available rooms:", availableRooms);
//     const selectedRoom = availableRooms.find(
//       (room) => room.roomId === formData.roomId
//     );
//     if (selectedRoom?.price) {
//       setFormData((prev) => ({
//         ...prev,
//         rentAmount: selectedRoom.price.toString(),
//       }));
//     }
//   }, [formData.roomId, availableRooms]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     console.log(`Input change - ${name}:`, value);
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.size > 2 * 1024 * 1024) {
//         toast.error("Image size must be less than 2MB.");
//         return;
//       }
//       if (!file.type.startsWith("image/")) {
//         toast.error("Please upload a valid image file.");
//         return;
//       }
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setFormData((prev) => ({ ...prev, photo: reader.result }));
//         toast.success("Image selected successfully!");
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleRemoveImage = () => {
//     setFormData((prev) => ({ ...prev, photo: null }));
//     toast.success("Image removed successfully!");
//   };

//   const validateForm = () => {
//     if (
//       !formData.name ||
//       !formData.mobile ||
//       !formData.aadhaar ||
//       !formData.propertyId ||
//       !formData.roomId ||
//       !formData.moveInDate ||
//       !formData.rentAmount
//     ) {
//       toast.error(
//         "Name, Mobile, Aadhaar, Property ID, Room ID, Move-in Date, and Rent Amount are required."
//       );
//       return false;
//     }
//     if (!/^\d{12}$/.test(formData.aadhaar)) {
//       toast.error("Aadhaar must be a 12-digit number.");
//       return false;
//     }
//     if (!/^\d{10}$/.test(formData.mobile)) {
//       toast.error("Mobile must be a 10-digit number.");
//       return false;
//       0;
//     }
//     if (formData.fatherMobile && !/^\d{10}$/.test(formData.fatherMobile)) {
//       toast.error("Father's mobile must be a 10-digit number.");
//       return false;
//     }
//     if (formData.motherMobile && !/^\d{10}$/.test(formData.motherMobile)) {
//       toast.error("Mother's mobile must be a 10-digit number.");
//       return false;
//     }
//     if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       toast.error("Please enter a valid email address.");
//       return false;
//     }
//     if (!availableRooms.some((room) => room.roomId === formData.roomId)) {
//       toast.error("Selected Room ID is invalid. Please select a valid room.");
//       return false;
//     }
//     if (formData.propertyId !== propertyId) {
//       toast.error("Property ID does not match the selected property.");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     if (!validateForm()) {
//       setIsLoading(false);
//       return;
//     }

//     const token = localStorage.getItem("landlordToken") || FIXED_TOKEN;
//     if (!token) {
//       toast.error("Authentication required! Please login first.");
//       setIsLoading(false);
//       return;
//     }

//     const payload = {
//       name: formData.name,
//       email: formData.email,
//       aadhaar: formData.aadhaar,
//       mobile: formData.mobile,
//       permanentAddress: formData.permanentAddress,
//       work: formData.work,
//       dob: formData.dob,
//       maritalStatus: formData.maritalStatus,
//       fatherName: formData.fatherName,
//       fatherMobile: formData.fatherMobile,
//       motherName: formData.motherName,
//       motherMobile: formData.motherMobile,
//       photo: formData.photo,
//       propertyId: formData.propertyId,
//       roomId: formData.roomId,
//       room: formData.roomId, // Added for potential server compatibility
//       moveInDate: formData.moveInDate,
//       rentAmount: Number(formData.rentAmount),
//       securityDeposit: Number(formData.securityDeposit) || 0,
//       noticePeriod: Number(formData.noticePeriod) || 0,
//       agreementPeriod: Number(formData.agreementPeriod) || 0,
//       agreementPeriodType: formData.agreementPeriodType,
//       rentOnDate: Number(formData.rentOnDate) || 0,
//       rentDateOption: formData.rentDateOption,
//       rentalFrequency: formData.rentalFrequency,
//       referredBy: formData.referredBy,
//       remarks: formData.remarks,
//       bookedBy: formData.bookedBy,
//       electricityPerUnit: Number(formData.electricityPerUnit) || 0,
//       initialReading: Number(formData.initialReading) || 0,
//       finalReading: formData.finalReading
//         ? Number(formData.finalReading)
//         : null,
//       initialReadingDate: formData.initialReadingDate || null,
//       finalReadingDate: formData.finalReadingDate || null,
//       electricityDueDescription: formData.electricityDueDescription || null,
//       openingBalanceStartDate: formData.openingBalanceStartDate || null,
//       openingBalanceEndDate: formData.openingBalanceEndDate || null,
//       openingBalanceAmount: Number(formData.openingBalanceAmount) || 0,
//     };

//     console.log("Submitting tenant payload:", payload);

//     try {
//       const response = await axios({
//         method: isEdit ? "PUT" : "POST",
//         url: `https://api.gharzoreality.com/api/landlord/tenant/property/${propertyId}${
//           isEdit ? `/${editingTenant.id}` : ""
//         }`, // Updated API endpoint
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         data: payload,
//       });

//       toast.success(
//         response?.data?.message ||
//           `Tenant ${isEdit ? "updated" : "added"} successfully!`,
//         {
//           position: "top-right",
//           autoClose: 3000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           theme: "colored",
//         }
//       );

//       setFormData({
//         name: "",
//         email: "",
//         aadhaar: "",
//         mobile: "",
//         permanentAddress: "",
//         work: "",
//         dob: "",
//         maritalStatus: "",
//         fatherName: "",
//         fatherMobile: "",
//         motherName: "",
//         motherMobile: "",
//         photo: null,
//         propertyId: propertyId || "", // Keep propertyId for new submissions
//         roomId: "",
//         moveInDate: "",
//         rentAmount: "",
//         securityDeposit: "",
//         noticePeriod: "",
//         agreementPeriod: "",
//         agreementPeriodType: "months",
//         rentOnDate: "",
//         rentDateOption: "fixed",
//         rentalFrequency: "Monthly",
//         referredBy: "",
//         remarks: "",
//         bookedBy: "",
//         electricityPerUnit: "",
//         initialReading: "",
//         finalReading: "",
//         initialReadingDate: "",
//         finalReadingDate: "",
//         electricityDueDescription: "",
//         openingBalanceStartDate: "",
//         openingBalanceEndDate: "",
//         openingBalanceAmount: "",
//       });
//       setTimeout(() => navigate("/landlord/tenant-list"), 1200);
//     } catch (error) {
//       console.error("Submission error:", error.response?.data || error);
//       toast.error(
//         error.response?.data?.message ||
//           `Failed to ${
//             isEdit ? "update" : "add"
//           } tenant. Please check the server logs or try again.`,
//         {
//           position: "top-right",
//           autoClose: 5000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           theme: "colored",
//         }
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-100 min-h-screen">
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="colored"
//       />
//       <motion.button
//         onClick={() => navigate(-1)}
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95 }}
//         className="mb-6 inline-flex items-center bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-800 transition-colors"
//       >
//         <FaArrowLeft className="mr-2" /> Back
//       </motion.button>

//       <form onSubmit={handleSubmit} className="space-y-8">
//         <Card
//           title="Personal Details"
//           icon={<FaUser />}
//           iconColor="bg-indigo-700"
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Input
//               label="Full Name"
//               icon={<FaUser />}
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//               placeholder="Enter tenant name"
//             />
//             <Input
//               label="Email"
//               icon={<FaEnvelope />}
//               name="email"
//               type="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Enter email"
//             />
//             爆0
//             <Input
//               label="Mobile"
//               icon={<FaPhone />}
//               name="mobile"
//               type="tel"
//               value={formData.mobile}
//               onChange={handleChange}
//               required
//               placeholder="Enter 10-digit mobile number"
//               pattern="\d{10}"
//             />
//             <Input
//               label="Aadhaar Number"
//               icon={<FaIdCard />}
//               name="aadhaar"
//               value={formData.aadhaar}
//               onChange={handleChange}
//               required
//               placeholder="Enter 12-digit Aadhaar"
//               pattern="\d{12}"
//             />
//             <Input
//               label="Date of Birth"
//               icon={<FaCalendar />}
//               name="dob"
//               type="date"
//               value={formData.dob}
//               onChange={handleChange}
//               max={new Date().toISOString().split("T")[0]}
//             />
//             <Select
//               key="maritalStatus"
//               label="Marital Status"
//               icon={<FaUserFriends />}
//               name="maritalStatus"
//               value={formData.maritalStatus}
//               onChange={handleChange}
//               options={[
//                 { value: "Unmarried", label: "Unmarried" },
//                 { value: "Married", label: "Married" },
//                 { value: "Others", label: "Others" },
//               ]}
//             />
//             <Input
//               label="Occupation"
//               icon={<FaBriefcase />}
//               name="work"
//               value={formData.work}
//               onChange={handleChange}
//               placeholder="Enter work/profession"
//             />
//             <div className="md:col-span-2 relative group">
//               <Label icon={<FaImage />} text="Tenant Photo" />
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageChange}
//                 className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-700 file:text-white hover:file:bg-indigo-800"
//               />
//               {formData.photo && (
//                 <div className="mt-3 relative group">
//                   <img
//                     src={formData.photo}
//                     alt="Tenant"
//                     className="w-32 h-32 object-cover rounded-lg shadow-md border border-gray-200"
//                   />
//                   <motion.button
//                     type="button"
//                     onClick={handleRemoveImage}
//                     className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                   >
//                     <FaTimesCircle size={16} />
//                   </motion.button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </Card>

//         <Card
//           title="Family Details"
//           icon={<FaUserFriends />}
//           iconColor="bg-green-600"
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Input
//               label="Father's Name"
//               icon={<FaMale />}
//               name="fatherName"
//               value={formData.fatherName}
//               onChange={handleChange}
//               placeholder="Enter father's name"
//             />
//             <Input
//               label="Father's Mobile"
//               icon={<FaPhone />}
//               name="fatherMobile"
//               value={formData.fatherMobile}
//               onChange={handleChange}
//               placeholder="Enter 10-digit father's mobile"
//               pattern="\d{10}"
//             />
//             <Input
//               label="Mother's Name"
//               icon={<FaFemale />}
//               name="motherName"
//               value={formData.motherName}
//               onChange={handleChange}
//               placeholder="Enter mother's name"
//             />
//             <Input
//               label="Mother's Mobile"
//               icon={<FaPhone />}
//               name="motherMobile"
//               value={formData.motherMobile}
//               onChange={handleChange}
//               placeholder="Enter 10-digit mother's mobile"
//               pattern="\d{10}"
//             />
//           </div>
//         </Card>

//         <Card
//           title="Permanent Address"
//           icon={<FaHome />}
//           iconColor="bg-blue-600"
//         >
//           <Label icon={<FaMapMarkerAlt />} text="Address" />
//           <textarea
//             name="permanentAddress"
//             value={formData.permanentAddress}
//             onChange={handleChange}
//             rows={4}
//             placeholder="Enter full permanent address"
//             className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
//           />
//         </Card>

//         <Card
//           title="Property Details"
//           icon={<FaHome />}
//           iconColor="bg-purple-600"
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Input
//               label="Property ID"
//               icon={<FaHome />}
//               name="propertyId"
//               value={formData.propertyId}
//               disabled
//               placeholder="Property ID from URL"
//             />
//             <Select
//               key={`roomId-${formData.propertyId}-${availableRooms.length}`}
//               充
//               label="Available Room"
//               icon={<FaBed />}
//               name="roomId"
//               value={formData.roomId}
//               onChange={handleChange}
//               options={availableRooms.map((room) => ({
//                 value: room.roomId,
//                 label: `${room.roomId} (${room.type}, ₹${room.price})`,
//               }))}
//               isLoading={isFetchingRooms}
//               disabled={!formData.propertyId || availableRooms.length === 0}
//               required
//             />
//           </div>
//         </Card>

//         <Card
//           title="Rental Terms"
//           icon={<FaFileContract />}
//           iconColor="bg-orange-600"
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Input
//               label="Move-in Date"
//               icon={<FaCalendar />}
//               name="moveInDate"
//               type="date"
//               value={formData.moveInDate}
//               onChange={handleChange}
//               required
//             />
//             <Input
//               label="Rent Amount (₹)"
//               icon={<FaMoneyCheckAlt />}
//               name="rentAmount"
//               type="number"
//               value={formData.rentAmount}
//               onChange={handleChange}
//               required
//               placeholder="Enter monthly rent"
//             />
//             <Input
//               label="Security Deposit (₹)"
//               icon={<FaMoneyBillWave />}
//               name="securityDeposit"
//               type="number"
//               value={formData.securityDeposit}
//               onChange={handleChange}
//               placeholder="Enter security deposit"
//             />
//             <Input
//               label="Notice Period (days)"
//               icon={<FaCalendar />}
//               name="noticePeriod"
//               type="number"
//               value={formData.noticePeriod}
//               onChange={handleChange}
//               placeholder="Enter notice period"
//             />
//             <Input
//               label="Agreement Period"
//               icon={<FaFileContract />}
//               name="agreementPeriod"
//               type="number"
//               value={formData.agreementPeriod}
//               onChange={handleChange}
//               placeholder="Enter agreement period"
//             />
//             <Select
//               key="agreementPeriodType"
//               label="Agreement Period Type"
//               icon={<FaFileContract />}
//               name="agreementPeriodType"
//               value={formData.agreementPeriodType}
//               onChange={handleChange}
//               options={[
//                 { value: "months", label: "Months" },
//                 { value: "years", label: "Years" },
//               ]}
//             />
//             <Input
//               label="Rent Due Date"
//               icon={<FaCalendar />}
//               name="rentOnDate"
//               type="number"
//               value={formData.rentOnDate}
//               onChange={handleChange}
//               placeholder="Enter rent due date (1-31)"
//             />
//             <Select
//               key="rentDateOption"
//               label="Rent Date Option"
//               icon={<FaCalendar />}
//               name="rentDateOption"
//               value={formData.rentDateOption}
//               onChange={handleChange}
//               options={[
//                 { value: "fixed", label: "Fixed" },
//                 { value: "flexible", label: "Flexible" },
//               ]}
//             />
//             <Select
//               key="rentalFrequency"
//               label="Rental Frequency"
//               icon={<FaMoneyCheckAlt />}
//               name="rentalFrequency"
//               value={formData.rentalFrequency}
//               onChange={handleChange}
//               options={[
//                 { value: "Monthly", label: "Monthly" },
//                 { value: "Quarterly", label: "Quarterly" },
//                 { value: "Yearly", label: "Yearly" },
//               ]}
//             />
//             <Input
//               label="Referred By"
//               icon={<FaUserFriends />}
//               name="referredBy"
//               value={formData.referredBy}
//               onChange={handleChange}
//               placeholder="Enter referrer name"
//             />
//             <Input
//               label="Booked By"
//               icon={<FaUser />}
//               name="bookedBy"
//               value={formData.bookedBy}
//               onChange={handleChange}
//               placeholder="Enter booking source"
//             />
//             <div className="md:col-span-2">
//               <Label icon={<FaFileContract />} text="Remarks" />
//               <textarea
//                 name="remarks"
//                 value={formData.remarks}
//                 onChange={handleChange}
//                 rows={4}
//                 placeholder="Enter any remarks"
//                 className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
//               />
//             </div>
//           </div>
//         </Card>

//         <Card
//           title="Electricity Details"
//           icon={<FaBolt />}
//           iconColor="bg-yellow-600"
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Input
//               label="Electricity Per Unit (₹)"
//               icon={<FaBolt />}
//               name="electricityPerUnit"
//               type="number"
//               value={formData.electricityPerUnit}
//               onChange={handleChange}
//               placeholder="Enter electricity rate per unit"
//             />
//             <Input
//               label="Initial Reading"
//               icon={<FaBolt />}
//               name="initialReading"
//               type="number"
//               value={formData.initialReading}
//               onChange={handleChange}
//               placeholder="Enter initial meter reading"
//             />
//             <Input
//               label="Initial Reading Date"
//               icon={<FaCalendar />}
//               name="initialReadingDate"
//               type="date"
//               value={formData.initialReadingDate}
//               onChange={handleChange}
//             />
//             <Input
//               label="Final Reading"
//               icon={<FaBolt />}
//               name="finalReading"
//               type="number"
//               value={formData.finalReading}
//               onChange={handleChange}
//               placeholder="Enter final meter reading"
//               disabled={isEdit}
//             />
//             <Input
//               label="Final Reading Date"
//               icon={<FaCalendar />}
//               name="finalReadingDate"
//               type="date"
//               value={formData.finalReadingDate}
//               onChange={handleChange}
//               disabled={isEdit}
//             />
//             <div className="md:col-span-2">
//               <Label
//                 icon={<FaFileContract />}
//                 text="Electricity Due Description"
//               />
//               <textarea
//                 name="electricityDueDescription"
//                 value={formData.electricityDueDescription}
//                 onChange={handleChange}
//                 rows={4}
//                 placeholder="Enter electricity due description"
//                 className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
//                 disabled={isEdit}
//               />
//             </div>
//           </div>
//         </Card>

//         <Card
//           title="Opening Balance"
//           icon={<FaMoneyBillWave />}
//           iconColor="bg-teal-600"
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Input
//               label="Opening Balance Start Date"
//               icon={<FaCalendar />}
//               name="openingBalanceStartDate"
//               type="date"
//               value={formData.openingBalanceStartDate}
//               onChange={handleChange}
//             />
//             <Input
//               label="Opening Balance End Date"
//               icon={<FaCalendar />}
//               name="openingBalanceEndDate"
//               type="date"
//               value={formData.openingBalanceEndDate}
//               onChange={handleChange}
//             />
//             <Input
//               label="Opening Balance Amount (₹)"
//               icon={<FaMoneyBillWave />}
//               name="openingBalanceAmount"
//               type="number"
//               value={formData.openingBalanceAmount}
//               onChange={handleChange}
//               placeholder="Enter opening balance amount"
//             />
//           </div>
//         </Card>

//         <div className="flex flex-col md:flex-row justify-end gap-4 mt-8">
//           <motion.button
//             type="submit"
//             disabled={isLoading}
//             whileHover={{ scale: isLoading ? 1 : 1.05 }}
//             whileTap={{ scale: isLoading ? 1 : 0.95 }}
//             className={`inline-flex items-center bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-800 transition-colors ${
//               isLoading ? "opacity-50 cursor-not-allowed" : ""
//             }`}
//           >
//             {isLoading && <FaSpinner className="animate-spin mr-2" />}
//             {isEdit ? "Update Tenant" : "Save Tenant"}
//           </motion.button>
//           <Link to="/landlord/tenant-list">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg shadow-md hover:bg-gray-300 transition-colors"
//             >
//               View Tenants
//             </motion.button>
//           </Link>
//         </div>
//       </form>
//     </div>
//   );
// };

// // Reusable Card Component
// const Card = ({ title, icon, iconColor, children }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     whileInView={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.4 }}
//     className="bg-white shadow-xl rounded-xl p-6 border border-gray-200"
//   >
//     <h4 className="text-xl font-semibold mb-4 flex items-center gap-3 text-gray-800">
//       <span className={`p-2 rounded-lg ${iconColor} text-white`}>{icon}</span>
//       {title}
//     </h4>
//     {children}
//   </motion.div>
// );

// // Reusable Input Component
// const Input = ({ label, icon, ...props }) => (
//   <div>
//     <Label icon={icon} text={label} />
//     <input
//       {...props}
//       className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
//       aria-label={label}
//     />
//   </div>
// );

// // Reusable Select Component
// const Select = ({ label, icon, options, isLoading, ...props }) => {
//   console.log(`${label} options:`, options);
//   return (
//     <div className="relative">
//       <Label icon={icon} text={label} />
//       <div className="relative">
//         <select
//           {...props}
//           className={`w-full p-3 pr-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-800 text-base ${
//             props.disabled ? "opacity-50 cursor-not-allowed" : ""
//           }`}
//           disabled={isLoading || props.disabled}
//           aria-label={label}
//         >
//           <option value="">
//             {isLoading
//               ? "Loading..."
//               : options.length === 0
//               ? `No ${label.toLowerCase()} available`
//               : `Select ${label.toLowerCase()}`}
//           </option>
//           {options.map((opt) => (
//             <option key={opt.value} value={opt.value}>
//               {opt.label}
//             </option>
//           ))}
//         </select>
//         <FaChevronDown className="absolute right-3 Roscoe Ave, Suite 500/top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
//       </div>
//     </div>
//   );
// };

// export default TenantForm;

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import {
  FaUser,
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaCalendar,
  FaBriefcase,
  FaHome,
  FaImage,
  FaTimesCircle,
  FaMale,
  FaFemale,
  FaUserFriends,
  FaMoneyCheckAlt,
  FaFileContract,
  FaMoneyBillWave,
  FaBolt,
  FaMapMarkerAlt,
  FaSpinner,
  FaBed,
  FaChevronDown,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FIXED_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjA5MzdkMmVlMWNkNzVkY2Q3NzAxNSIsInJvbGUiOiJsYW5kbG9yZCIsIm1vYmlsZSI6Ijg4MzkwOTMyNzAiLCJlbWFpbCI6InBhbmRhZ3JlYmh1c2hhbjNAZ21haWwuY29tIiwiaWF0IjoxNzU2NTMzMDExLCJleHAiOjE3NTkxMjUwMTF9._VikMS4j9eaG-L6icqIee40TBM7A57w0NFWEIPsOL8U";

const TenantForm = () => {
  const { id: propertyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // const editingTenant = location.state;
  const editingTenant = location.state?.tenant;
  const isEdit = Boolean(editingTenant);
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isFetchingRooms, setIsFetchingRooms] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    aadhaar: "",
    mobile: "",
    permanentAddress: "",
    work: "",
    dob: "",
    maritalStatus: "",
    fatherName: "",
    fatherMobile: "",
    motherName: "",
    motherMobile: "",
    photo: null,
    // propertyId: "",
    propertyId: propertyId || "",
    roomId: "",
    moveInDate: "",
    rentAmount: "",
    securityDeposit: "",
    noticePeriod: "",
    agreementPeriod: "",
    agreementPeriodType: "months",
    rentOnDate: "",
    rentDateOption: "fixed",
    rentalFrequency: "Monthly",
    referredBy: "",
    remarks: "",
    bookedBy: "",
    electricityPerUnit: "",
    initialReading: "",
    finalReading: "",
    initialReadingDate: "",
    finalReadingDate: "",
    electricityDueDescription: "",
    openingBalanceStartDate: "",
    openingBalanceEndDate: "",
    openingBalanceAmount: "",
  });

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("landlordToken") || FIXED_TOKEN;
        const response = await axios.get(
          "https://api.gharzoreality.com/api/landlord/properties",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const propertiesData = response.data.properties || [];
        setProperties(propertiesData);
        console.log("Fetched properties:", propertiesData);
      } catch (error) {
        toast.error("Failed to fetch properties. Please try again.");
        console.error("Error fetching properties:", error);
      }
    };
    fetchProperties();
  }, []);

  // Fetch available rooms when propertyId changes
  useEffect(() => {
    if (formData.propertyId) {
      const fetchAvailableRooms = async () => {
        setIsFetchingRooms(true);
        try {
          const token = localStorage.getItem("landlordToken") || FIXED_TOKEN;
          console.log("Fetching rooms for propertyId:", formData.propertyId);
          const response = await axios.get(
            `https://api.gharzoreality.com/api/landlord/properties/${formData.propertyId}/rooms/available`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const roomsData = response.data.rooms || [];
          setAvailableRooms(roomsData);
          console.log("Fetched available rooms:", roomsData);
          // Reset roomId if it doesn't belong to the available rooms
          if (!roomsData.some((room) => room.roomId === formData.roomId)) {
            console.log(
              "Resetting roomId: Current roomId",
              formData.roomId,
              "not in available rooms"
            );
            setFormData((prev) => ({ ...prev, roomId: "", rentAmount: "" }));
          }
          if (roomsData.length === 0) {
            toast.warn("No available rooms for this property.");
          }
        } catch (error) {
          toast.error("Failed to fetch available rooms. Please try again.");
          console.error("Error fetching available rooms:", error);
          setAvailableRooms([]);
        } finally {
          setIsFetchingRooms(false);
        }
      };
      fetchAvailableRooms();
    } else {
      setAvailableRooms([]);
      setFormData((prev) => ({ ...prev, roomId: "", rentAmount: "" }));
    }
  }, [formData.propertyId]);

  // Pre-fill form for editing or from location.state
  useEffect(() => {
    if (editingTenant) {
      const sanitizedTenant = {
        name: editingTenant.name ?? "",
        email: editingTenant.email ?? "",
        aadhaar: editingTenant.aadhaar ?? "",
        mobile: editingTenant.mobile ?? "",
        permanentAddress: editingTenant.permanentAddress ?? "",
        work: editingTenant.work ?? "",
        dob: editingTenant.dob ?? "",
        maritalStatus: editingTenant.maritalStatus ?? "",
        fatherName: editingTenant.fatherName ?? "",
        fatherMobile: editingTenant.fatherMobile ?? "",
        motherName: editingTenant.motherName ?? "",
        motherMobile: editingTenant.motherMobile ?? "",
        photo: editingTenant.photo ?? null,
        propertyId: editingTenant.propertyId ?? "",
        roomId: editingTenant.roomId ?? "",
        moveInDate: editingTenant.moveInDate ?? "",
        rentAmount: editingTenant.rentAmount ?? "",
        securityDeposit: editingTenant.securityDeposit ?? "",
        noticePeriod: editingTenant.noticePeriod ?? "",
        agreementPeriod: editingTenant.agreementPeriod ?? "",
        agreementPeriodType: editingTenant.agreementPeriodType ?? "months",
        rentOnDate: editingTenant.rentOnDate ?? "",
        rentDateOption: editingTenant.rentDateOption ?? "fixed",
        rentalFrequency: editingTenant.rentalFrequency ?? "Monthly",
        referredBy: editingTenant.referredBy ?? "",
        remarks: editingTenant.remarks ?? "",
        bookedBy: editingTenant.bookedBy ?? "",
        electricityPerUnit: editingTenant.electricityPerUnit ?? "",
        initialReading: editingTenant.initialReading ?? "",
        finalReading: editingTenant.finalReading ?? "",
        initialReadingDate: editingTenant.initialReadingDate ?? "",
        finalReadingDate: editingTenant.finalReadingDate ?? "",
        electricityDueDescription:
          editingTenant.electricityDueDescription ?? "",
        openingBalanceStartDate: editingTenant.openingBalanceStartDate ?? "",
        openingBalanceEndDate: editingTenant.openingBalanceEndDate ?? "",
        openingBalanceAmount: editingTenant.openingBalanceAmount ?? "",
      };
      setFormData(sanitizedTenant);
      console.log("Editing tenant data:", sanitizedTenant);
      console.log("Initial roomId:", sanitizedTenant.roomId);
    } else if (location.state?.propertyTitle) {
      setFormData((prev) => ({
        ...prev,
        propertyId: location.state.propertyId || "",
        roomId: "",
        rentAmount: "",
      }));
    }
  }, [editingTenant, location.state]);

  // Pre-fill rentAmount when roomId changes
  useEffect(() => {
    console.log("Current roomId:", formData.roomId);
    console.log("Available rooms:", availableRooms);
    const selectedRoom = availableRooms.find(
      (room) => room.roomId === formData.roomId
    );
    if (selectedRoom?.price) {
      setFormData((prev) => ({
        ...prev,
        rentAmount: selectedRoom.price.toString(),
      }));
    }
  }, [formData.roomId, availableRooms]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input change - ${name}:`, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
        toast.success("Image selected successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, photo: null }));
    toast.success("Image removed successfully!");
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.mobile ||
      !formData.aadhaar ||
      !formData.propertyId ||
      !formData.roomId ||
      !formData.moveInDate ||
      !formData.rentAmount
    ) {
      toast.error(
        "Name, Mobile, Aadhaar, Property ID, Room ID, Move-in Date, and Rent Amount are required."
      );
      return false;
    }
    if (!/^\d{12}$/.test(formData.aadhaar)) {
      toast.error("Aadhaar must be a 12-digit number.");
      return false;
    }
    if (!/^\d{10}$/.test(formData.mobile)) {
      toast.error("Mobile must be a 10-digit number.");
      return false;
    }
    if (formData.fatherMobile && !/^\d{10}$/.test(formData.fatherMobile)) {
      toast.error("Father's mobile must be a 10-digit number.");
      return false;
    }
    if (formData.motherMobile && !/^\d{10}$/.test(formData.motherMobile)) {
      toast.error("Mother's mobile must be a 10-digit number.");
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (!availableRooms.some((room) => room.roomId === formData.roomId)) {
      toast.error("Selected Room ID is invalid. Please select a valid room.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("landlordToken") || FIXED_TOKEN;
    if (!token) {
      toast.error("Authentication required! Please login first.");
      setIsLoading(false);
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      aadhaar: formData.aadhaar,
      mobile: formData.mobile,
      permanentAddress: formData.permanentAddress,
      work: formData.work,
      dob: formData.dob,
      maritalStatus: formData.maritalStatus,
      fatherName: formData.fatherName,
      fatherMobile: formData.fatherMobile,
      motherName: formData.motherName,
      motherMobile: formData.motherMobile,
      photo: formData.photo,
      propertyId: formData.propertyId,
      roomId: formData.roomId,
      room: formData.roomId, // Added for potential server compatibility
      moveInDate: formData.moveInDate,
      rentAmount: Number(formData.rentAmount),
      securityDeposit: Number(formData.securityDeposit) || 0,
      noticePeriod: Number(formData.noticePeriod) || 0,
      agreementPeriod: Number(formData.agreementPeriod) || 0,
      agreementPeriodType: formData.agreementPeriodType,
      rentOnDate: Number(formData.rentOnDate) || 0,
      rentDateOption: formData.rentDateOption,
      rentalFrequency: formData.rentalFrequency,
      referredBy: formData.referredBy,
      remarks: formData.remarks,
      bookedBy: formData.bookedBy,
      electricityPerUnit: Number(formData.electricityPerUnit) || 0,
      initialReading: Number(formData.initialReading) || 0,
      finalReading: formData.finalReading
        ? Number(formData.finalReading)
        : null,
      initialReadingDate: formData.initialReadingDate || null,
      finalReadingDate: formData.finalReadingDate || null,
      electricityDueDescription: formData.electricityDueDescription || null,
      openingBalanceStartDate: formData.openingBalanceStartDate || null,
      openingBalanceEndDate: formData.openingBalanceEndDate || null,
      openingBalanceAmount: Number(formData.openingBalanceAmount) || 0,
    };

    console.log("Submitting tenant payload:", payload);

    try {
      const response = await axios({
        method: isEdit ? "PUT" : "POST",
        url: `https://api.gharzoreality.com/api/landlord/tenant${
          isEdit ? `/${editingTenant.id}` : ""
        }`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: payload,
      });

      toast.success(
        response?.data?.message ||
          `Tenant ${isEdit ? "updated" : "added"} successfully!`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        }
      );

      setFormData({
        name: "",
        email: "",
        aadhaar: "",
        mobile: "",
        permanentAddress: "",
        work: "",
        dob: "",
        maritalStatus: "",
        fatherName: "",
        fatherMobile: "",
        motherName: "",
        motherMobile: "",
        photo: null,
        propertyId: "",
        roomId: "",
        moveInDate: "",
        rentAmount: "",
        securityDeposit: "",
        noticePeriod: "",
        agreementPeriod: "",
        agreementPeriodType: "months",
        rentOnDate: "",
        rentDateOption: "fixed",
        rentalFrequency: "Monthly",
        referredBy: "",
        remarks: "",
        bookedBy: "",
        electricityPerUnit: "",
        initialReading: "",
        finalReading: "",
        initialReadingDate: "",
        finalReadingDate: "",
        electricityDueDescription: "",
        openingBalanceStartDate: "",
        openingBalanceEndDate: "",
        openingBalanceAmount: "",
      });
      setTimeout(() => navigate("/landlord/tenant-list"), 1200);
    } catch (error) {
      console.error("Submission error:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${
            isEdit ? "update" : "add"
          } tenant. Please check the server logs or try again.`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      {/* Back Button */}
      <motion.button
        onClick={() => navigate(-1)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mb-6 inline-flex items-center bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-800 transition-colors"
      >
        <FaArrowLeft className="mr-2" /> Back
      </motion.button>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Card 1 - Personal Details */}
        <Card
          title="Personal Details"
          icon={<FaUser />}
          iconColor="bg-indigo-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              icon={<FaUser />}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter tenant name"
            />
            <Input
              label="Email"
              icon={<FaEnvelope />}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
            <Input
              label="Mobile"
              icon={<FaPhone />}
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              required
              placeholder="Enter 10-digit mobile number"
              pattern="\d{10}"
            />
            <Input
              label="Aadhaar Number"
              icon={<FaIdCard />}
              name="aadhaar"
              value={formData.aadhaar}
              onChange={handleChange}
              required
              placeholder="Enter 12-digit Aadhaar"
              pattern="\d{12}"
            />
            <Input
              label="Date of Birth"
              icon={<FaCalendar />}
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
            />
            <Select
              key="maritalStatus"
              label="Marital Status"
              icon={<FaUserFriends />}
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              options={[
                { value: "Unmarried", label: "Unmarried" },
                { value: "Married", label: "Married" },
                { value: "Others", label: "Others" },
              ]}
            />
            <Input
              label="Occupation"
              icon={<FaBriefcase />}
              name="work"
              value={formData.work}
              onChange={handleChange}
              placeholder="Enter work/profession"
            />
            <div className="md:col-span-2 relative group">
              <Label icon={<FaImage />} text="Tenant Photo" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-700 file:text-white hover:file:bg-indigo-800"
              />
              {formData.photo && (
                <div className="mt-3 relative group">
                  <img
                    src={formData.photo}
                    alt="Tenant"
                    className="w-32 h-32 object-cover rounded-lg shadow-md border border-gray-200"
                  />
                  <motion.button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaTimesCircle size={16} />
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Card 2 - Family Details */}
        <Card
          title="Family Details"
          icon={<FaUserFriends />}
          iconColor="bg-green-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Father's Name"
              icon={<FaMale />}
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              placeholder="Enter father's name"
            />
            <Input
              label="Father's Mobile"
              icon={<FaPhone />}
              name="fatherMobile"
              value={formData.fatherMobile}
              onChange={handleChange}
              placeholder="Enter 10-digit father's mobile"
              pattern="\d{10}"
            />
            <Input
              label="Mother's Name"
              icon={<FaFemale />}
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              placeholder="Enter mother's name"
            />
            <Input
              label="Mother's Mobile"
              icon={<FaPhone />}
              name="motherMobile"
              value={formData.motherMobile}
              onChange={handleChange}
              placeholder="Enter 10-digit mother's mobile"
              pattern="\d{10}"
            />
          </div>
        </Card>

        {/* Card 3 - Address Details */}
        <Card
          title="Permanent Address"
          icon={<FaHome />}
          iconColor="bg-blue-600"
        >
          <Label icon={<FaMapMarkerAlt />} text="Address" />
          <textarea
            name="permanentAddress"
            value={formData.permanentAddress}
            onChange={handleChange}
            rows={4}
            placeholder="Enter full permanent address"
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
          />
        </Card>

        {/* Card 4 - Property Details */}
        <Card
          title="Property Details"
          icon={<FaHome />}
          iconColor="bg-purple-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              key="propertyId"
              label="Property"
              icon={<FaHome />}
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              options={properties.map((prop) => ({
                value: prop._id,
                label: prop.name || prop.propertyId || prop._id,
              }))}
              isLoading={properties.length === 0}
              required
            />
            <Select
              key={`roomId-${formData.propertyId}-${availableRooms.length}`}
              label="Available Room"
              icon={<FaBed />}
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              options={availableRooms.map((room) => ({
                value: room.roomId,
                label: `${room.roomId} (${room.type}, ₹${room.price})`,
              }))}
              isLoading={isFetchingRooms}
              disabled={!formData.propertyId || availableRooms.length === 0}
              required
            />
          </div>
        </Card>

        {/* Card 5 - Rental Terms */}
        <Card
          title="Rental Terms"
          icon={<FaFileContract />}
          iconColor="bg-orange-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Move-in Date"
              icon={<FaCalendar />}
              name="moveInDate"
              type="date"
              value={formData.moveInDate}
              onChange={handleChange}
              required
            />
            <Input
              label="Rent Amount (₹)"
              icon={<FaMoneyCheckAlt />}
              name="rentAmount"
              type="number"
              value={formData.rentAmount}
              onChange={handleChange}
              required
              placeholder="Enter monthly rent"
            />
            <Input
              label="Security Deposit (₹)"
              icon={<FaMoneyBillWave />}
              name="securityDeposit"
              type="number"
              value={formData.securityDeposit}
              onChange={handleChange}
              placeholder="Enter security deposit"
            />
            <Input
              label="Notice Period (days)"
              icon={<FaCalendar />}
              name="noticePeriod"
              type="number"
              value={formData.noticePeriod}
              onChange={handleChange}
              placeholder="Enter notice period"
            />
            <Input
              label="Agreement Period"
              icon={<FaFileContract />}
              name="agreementPeriod"
              type="number"
              value={formData.agreementPeriod}
              onChange={handleChange}
              placeholder="Enter agreement period"
            />
            <Select
              key="agreementPeriodType"
              label="Agreement Period Type"
              icon={<FaFileContract />}
              name="agreementPeriodType"
              value={formData.agreementPeriodType}
              onChange={handleChange}
              options={[
                { value: "months", label: "Months" },
                { value: "years", label: "Years" },
              ]}
            />
            <Input
              label="Rent Due Date"
              icon={<FaCalendar />}
              name="rentOnDate"
              type="number"
              value={formData.rentOnDate}
              onChange={handleChange}
              placeholder="Enter rent due date (1-31)"
            />
            <Select
              key="rentDateOption"
              label="Rent Date Option"
              icon={<FaCalendar />}
              name="rentDateOption"
              value={formData.rentDateOption}
              onChange={handleChange}
              options={[
                { value: "fixed", label: "Fixed" },
                { value: "flexible", label: "Flexible" },
              ]}
            />
            <Select
              key="rentalFrequency"
              label="Rental Frequency"
              icon={<FaMoneyCheckAlt />}
              name="rentalFrequency"
              value={formData.rentalFrequency}
              onChange={handleChange}
              options={[
                { value: "Monthly", label: "Monthly" },
                { value: "Quarterly", label: "Quarterly" },
                { value: "Yearly", label: "Yearly" },
              ]}
            />
            <Input
              label="Referred By"
              icon={<FaUserFriends />}
              name="referredBy"
              value={formData.referredBy}
              onChange={handleChange}
              placeholder="Enter referrer name"
            />
            <Input
              label="Booked By"
              icon={<FaUser />}
              name="bookedBy"
              value={formData.bookedBy}
              onChange={handleChange}
              placeholder="Enter booking source"
            />
            <div className="md:col-span-2">
              <Label icon={<FaFileContract />} text="Remarks" />
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={4}
                placeholder="Enter any remarks"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
              />
            </div>
          </div>
        </Card>

        {/* Card 6 - Electricity Details */}
        <Card
          title="Electricity Details"
          icon={<FaBolt />}
          iconColor="bg-yellow-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Electricity Per Unit (₹)"
              icon={<FaBolt />}
              name="electricityPerUnit"
              type="number"
              value={formData.electricityPerUnit}
              onChange={handleChange}
              placeholder="Enter electricity rate per unit"
            />
            <Input
              label="Initial Reading"
              icon={<FaBolt />}
              name="initialReading"
              type="number"
              value={formData.initialReading}
              onChange={handleChange}
              placeholder="Enter initial meter reading"
            />
            <Input
              label="Initial Reading Date"
              icon={<FaCalendar />}
              name="initialReadingDate"
              type="date"
              value={formData.initialReadingDate}
              onChange={handleChange}
            />
            <Input
              label="Final Reading"
              icon={<FaBolt />}
              name="finalReading"
              type="number"
              value={formData.finalReading}
              onChange={handleChange}
              placeholder="Enter final meter reading"
              disabled={isEdit}
            />
            <Input
              label="Final Reading Date"
              icon={<FaCalendar />}
              name="finalReadingDate"
              type="date"
              value={formData.finalReadingDate}
              onChange={handleChange}
              disabled={isEdit}
            />
            <div className="md:col-span-2">
              <Label
                icon={<FaFileContract />}
                text="Electricity Due Description"
              />
              <textarea
                name="electricityDueDescription"
                value={formData.electricityDueDescription}
                onChange={handleChange}
                rows={4}
                placeholder="Enter electricity due description"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
                disabled={isEdit}
              />
            </div>
          </div>
        </Card>

        {/* Card 7 - Opening Balance */}
        <Card
          title="Opening Balance"
          icon={<FaMoneyBillWave />}
          iconColor="bg-teal-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Opening Balance Start Date"
              icon={<FaCalendar />}
              name="openingBalanceStartDate"
              type="date"
              value={formData.openingBalanceStartDate}
              onChange={handleChange}
            />
            <Input
              label="Opening Balance End Date"
              icon={<FaCalendar />}
              name="openingBalanceEndDate"
              type="date"
              value={formData.openingBalanceEndDate}
              onChange={handleChange}
            />
            <Input
              label="Opening Balance Amount (₹)"
              icon={<FaMoneyBillWave />}
              name="openingBalanceAmount"
              type="number"
              value={formData.openingBalanceAmount}
              onChange={handleChange}
              placeholder="Enter opening balance amount"
            />
          </div>
        </Card>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row justify-end gap-4 mt-8">
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            className={`inline-flex items-center bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-800 transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading && <FaSpinner className="animate-spin mr-2" />}
            {isEdit ? "Update Tenant" : "Save Tenant"}
          </motion.button>
          <Link to="/landlord/tenant-list">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg shadow-md hover:bg-gray-300 transition-colors"
            >
              View Tenants
            </motion.button>
          </Link>
        </div>
      </form>
    </div>
  );
};

// Reusable Card Component
const Card = ({ title, icon, iconColor, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-white shadow-xl rounded-xl p-6 border border-gray-200"
  >
    <h4 className="text-xl font-semibold mb-4 flex items-center gap-3 text-gray-800">
      <span className={`p-2 rounded-lg ${iconColor} text-white`}>{icon}</span>
      {title}
    </h4>
    {children}
  </motion.div>
);

// Reusable Input Component
const Input = ({ label, icon, ...props }) => (
  <div>
    <Label icon={icon} text={label} />
    <input
      {...props}
      className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
      aria-label={label}
    />
  </div>
);

// Reusable Select Component
const Select = ({ label, icon, options, isLoading, ...props }) => {
  console.log(`${label} options:`, options);
  return (
    <div className="relative">
      <Label icon={icon} text={label} />
      <div className="relative">
        <select
          {...props}
          className={`w-full p-3 pr-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-800 text-base ${
            props.disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading || props.disabled}
          aria-label={label}
        >
          <option value="">
            {isLoading
              ? "Loading..."
              : options.length === 0
              ? `No ${label.toLowerCase()} available`
              : `Select ${label.toLowerCase()}`}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none" />
      </div>
    </div>
  );
};

// Label Component
const Label = ({ icon, text }) => (
  <label className="block mb-1.5 font-medium flex items-center text-gray-700">
    <span className="mr-2 text-indigo-700">{icon}</span>
    {text}
  </label>
);

export default TenantForm;
