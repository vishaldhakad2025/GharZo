import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../../assets/logo/logo.png";
import signupbg from "../../../assets/Images/signupbg.jpg";

function Signup() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const mobileFromLogin = location.state?.mobile || "";

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: mobileFromLogin,
    age: "",
    gender: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["street", "city", "state", "postalCode", "country"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validation
  const validateForm = () => {
    if (!form.fullName) return "Full name is required";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Valid Email is required";
    if (!form.phone || !/^\d{7,15}$/.test(form.phone))
      return "Valid phone number required (7-15 digits)";
    if (!form.age || isNaN(form.age) || form.age < 1)
      return "Valid Age is required";
    if (!form.gender) return "Gender is required";
    if (!form.address.street) return "Street is required";
    if (!form.address.city) return "City is required";
    if (!form.address.state) return "State is required";
    if (!form.address.postalCode) return "Postal Code is required";
    if (!form.address.country) return "Country is required";
    return null;
  };

  // Submit
  const handleSignup = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    try {
      const res = await axios.post(
        `${baseurl}api/auth/user/register`,
        form,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.status === 201 || res.status === 200) {
        login({ ...form, isRegistered: true });
        navigate("/landlord");
      } else {
        alert("Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.response?.data?.message || "Error while registering");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 relative">
      {/* Background with opacity */}
      <div
        className="absolute inset-0 bg-black/60"
        style={{
          backgroundImage: "url(${signupbg})",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(6px)",
        }}
      ></div>

      <div className="relative bg-gray-800 bg-opacity-10 border border-green-800 rounded-2xl shadow-4xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        {/* Left Side Branding */}
        <div className="md:w-1/3 bg-gradient-to-br from-green-800 to-cyan-800 flex flex-col items-center justify-center p-6">
          <img
            src={logo}
            alt="logo"
            className="w-28 h-28 object-contain mb-4"
          />
          <h1 className="text-2xl font-extrabold text-white tracking-wide text-center">
            User Portal
          </h1>
        </div>

        {/* Right Side Form */}
        <div className="md:w-2/3 p-4 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            Complete Your Registration
          </h2>
          <form onSubmit={handleSignup} className="space-y-3 opacity-90">
            {/* Full Name */}
            <input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Email + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="p-2 border rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
                className="p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Age + Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="age"
                type="number"
                placeholder="Age"
                value={form.age}
                onChange={handleChange}
                required
                className="p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
                className="p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Address Fields */}
            <input
              name="street"
              placeholder="Street"
              value={form.address.street}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="city"
                placeholder="City"
                value={form.address.city}
                onChange={handleChange}
                required
                className="p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                name="state"
                placeholder="State"
                value={form.address.state}
                onChange={handleChange}
                required
                className="p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="postalCode"
                placeholder="Postal Code"
                value={form.address.postalCode}
                onChange={handleChange}
                required
                className="p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                name="country"
                placeholder="Country"
                value={form.address.country}
                onChange={handleChange}
                required
                className="p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit + Cancel */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-400 to-green-500 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition duration-200"
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;



// import React, { useState } from "react";
// import axios from "axios";
// import { useAuth } from "../../User_Section/Context/AuthContext.jsx";
// import { useNavigate, useLocation } from "react-router-dom";
// import logo from "../../../assets/logo/logo.png";
// import signupbg from "../../../assets/Images/signupbg.jpg";

// function Signup() {
//   const { login } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const mobileFromLogin = location.state?.mobile || "";

//   const [form, setForm] = useState({
//     fullName: "",
//     email: "",
//     phone: mobileFromLogin,
//     age: "",
//     gender: "",
//     address: {
//       street: "",
//       city: "",
//       state: "",
//       postalCode: "",
//       country: "",
//     },
//   });

//   // Handle input change
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (["street", "city", "state", "postalCode", "country"].includes(name)) {
//       setForm((prev) => ({
//         ...prev,
//         address: {
//           ...prev.address,
//           [name]: value,
//         },
//       }));
//     } else {
//       setForm((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   // Validation
//   const validateForm = () => {
//     if (!form.fullName) return "Full name is required";
//     if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
//       return "Valid Email is required";
//     if (!form.phone || !/^\d{7,15}$/.test(form.phone))
//       return "Valid phone number required (7-15 digits)";
//     if (!form.age || isNaN(form.age) || form.age < 1)
//       return "Valid Age is required";
//     if (!form.gender) return "Gender is required";
//     if (!form.address.street) return "Street is required";
//     if (!form.address.city) return "City is required";
//     if (!form.address.state) return "State is required";
//     if (!form.address.postalCode) return "Postal Code is required";
//     if (!form.address.country) return "Country is required";
//     return null;
//   };

//   // Submit
//   const handleSignup = async (e) => {
//     e.preventDefault();

//     const error = validateForm();
//     if (error) {
//       alert(error);
//       return;
//     }

//     try {
//       const res = await axios.post(
//         "https://api.gharzoreality.com/api/auth/user/register",
//         form,
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       if (res.status === 201 || res.status === 200) {
//         login({ ...form, isRegistered: true });
//         navigate("/landlord");
//       } else {
//         alert("Registration failed");
//       }
//     } catch (error) {
//       console.error("Registration error:", error);
//       alert(error.response?.data?.message || "Error while registering");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-2 relative">
//       {/* Background with opacity */}
//       <div
//         className="absolute inset-0 bg-black/60"
//         style={{
//           backgroundImage: `url(${signupbg})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           filter: "blur(6px)",
//         }}
//       ></div>

//       <div className="relative bg-gray-800 bg-opacity-10 border border-green-800 rounded-2xl shadow-4xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
//         {/* Left Side Branding */}
//         <div className="md:w-1/3 bg-gradient-to-br from-green-800 to-cyan-800 flex flex-col items-center justify-center p-6">
//           <img
//             src={logo}
//             alt="logo"
//             className="w-28 h-28 object-contain mb-4"
//           />
//           <h1 className="text-2xl font-extrabold text-white tracking-wide text-center">
//             User Portal
//           </h1>
//         </div>

//         {/* Right Side Form */}
//         <div className="md:w-2/3 p-4 md:p-8">
//           <h2 className="text-2xl font-bold text-white mb-4 text-center">
//             Complete Your Registration
//           </h2>
//           <form onSubmit={handleSignup} className="space-y-3 opacity-90">
//             {/* Full Name */}
//             <input
//               name="fullName"
//               placeholder="Full Name"
//               value={form.fullName}
//               onChange={handleChange}
//               required
//               className="w-full p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />

//             {/* Email + Phone */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 value={form.email}
//                 onChange={handleChange}
//                 required
//                 className="p-2 border rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <input
//                 name="phone"
//                 placeholder="Phone Number"
//                 value={form.phone}
//                 onChange={handleChange}
//                 required
//                 className="p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             {/* Age + Gender */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               <input
//                 name="age"
//                 type="number"
//                 placeholder="Age"
//                 value={form.age}
//                 onChange={handleChange}
//                 required
//                 className="p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <select
//                 name="gender"
//                 value={form.gender}
//                 onChange={handleChange}
//                 required
//                 className="p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Select Gender</option>
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//               </select>
//             </div>

//             {/* Address Fields */}
//             <input
//               name="street"
//               placeholder="Street"
//               value={form.address.street}
//               onChange={handleChange}
//               required
//               className="w-full p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               <input
//                 name="city"
//                 placeholder="City"
//                 value={form.address.city}
//                 onChange={handleChange}
//                 required
//                 className="p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <input
//                 name="state"
//                 placeholder="State"
//                 value={form.address.state}
//                 onChange={handleChange}
//                 required
//                 className="p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               <input
//                 name="postalCode"
//                 placeholder="Postal Code"
//                 value={form.address.postalCode}
//                 onChange={handleChange}
//                 required
//                 className="p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <input
//                 name="country"
//                 placeholder="Country"
//                 value={form.address.country}
//                 onChange={handleChange}
//                 required
//                 className="p-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             {/* Submit + Cancel */}
//             <div className="flex gap-3">
//               <button
//                 type="submit"
//                 className="w-full bg-gradient-to-r from-cyan-400 to-green-500 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition duration-200"
//               >
//                 Sign Up
//               </button>
//               <button
//                 type="button"
//                 onClick={() => navigate(-1)}
//                 className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition duration-200"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Signup;


