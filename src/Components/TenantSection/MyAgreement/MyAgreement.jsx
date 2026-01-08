// RentAgreementForm.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import logo from "../../../assets/logo/logo.png";

const RentAgreementForm = () => {
  const [formData, setFormData] = useState({
    apartmentName: "",
    roomNo: "",
    timePeriod: "",
    dateOfJoining: "",
    startingMeterMain: "",
    startingMeterInverter: "",
    monthlyRent: "",
    securityDeposit: "",
    tenant1: {
      name: "",
      mobile: "",
      aadhar: "",
      collegeReg: "",
      gender: "",
      nationality: "Indian",
      tenantId: "",
    },
  });

  const [landlordSignature, setLandlordSignature] = useState("");
  const [tenantSignature, setTenantSignature] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const agreementRef = useRef(null);

  const terms = [
    "Tenant shall occupy premises for residential purposes only and not for any other purposes without prior written permission/consent of the owner.",
    "Tenant shall return the room in the same condition as it was given at the time of rent agreement.",
    "Tenant shall not make any addition/alteration in the rented premises without prior consent of the owner.",
    "Tenant shall pay rent monthly in the first week of every month on every 5th day of the month.",
    "Tenant can't vacate the room before the completion of 6/11 months as agreed.",
    "Notice will be valid if it is documented on 1st calendar day of the month.",
    "Vacating without notice forfeits the security deposit.",
    "In case of any dispute, matter shall be referred to Phagwara Court only.",
    "Tenant shall be responsible for any illegal work done in PG premises.",
    "If tenant violates rules, then two-day notice will be served to vacate the room.",
    "Electricity bill will be collected before 5th of every month.",
    "Maintenance charges 300/- will be taken every month.",
    "Security deposit will be refunded upon receipt of written notice one month prior.",
    "WIFI is complementary.",
    "No loud music, parties, or disturbances allowed inside the PG premises.",
    "Outsiders are not allowed to stay at night. Only parents are allowed with prior permission.",
    "Motor charges per room will be 15 units per month.",
    "On NON-PAYMENT of rent, owner/manager has right to lock the room until rent is paid.",
    "Vacating charges: ₹500.",
    "All rights reserved by Dekho Rentals.",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("tenanttoken");
        if (!token) {
          setError("No token found");
          setLoading(false);
          return;
        }

        // Fetch Tenant Profile
        const profileRes = await axios.get("https://api.gharzoreality.com/api/tenant/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tenant = profileRes.data?.tenant;
        if (!tenant?.tenantId) throw new Error("Tenant ID not found");
        const tenantId = tenant.tenantId;

        // Fetch Accommodation Info
        const accRes = await axios.get("https://api.gharzoreality.com/api/tenant/accommodations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const accommodation = accRes.data.accommodations?.[0];
        if (!accommodation) throw new Error("Accommodation not found");

        // Fetch Landlord Signature
        if (accommodation.landlordId) {
          try {
            const sigRes = await axios.get(
              `https://api.gharzoreality.com/api/landlord/signatureqwerty/${accommodation.landlordId}`
            );
            const sigUrl = sigRes.data?.signatureUrl
              ? `https://api.gharzoreality.com${sigRes.data.signatureUrl}`
              : "";
            setLandlordSignature(sigUrl);
          } catch (err) {
            console.log("Landlord signature not found or error:", err);
            setLandlordSignature("");
          }
        }

        // Fetch Tenant Signature
        try {
          const tenantSigRes = await axios.get(
            `https://api.gharzoreality.com/api/landlord/tenant/signature/${tenantId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (tenantSigRes.data.success && tenantSigRes.data.signatureUrl) {
            setTenantSignature(`https://api.gharzoreality.com${tenantSigRes.data.signatureUrl}`);
          } else {
            setTenantSignature("");
          }
        } catch (err) {
          console.log("Tenant signature not found or error:", err);
          setTenantSignature("");
        }

        // Update Tenant + Room Data
        setFormData({
          apartmentName: accommodation?.propertyName || "",
          roomNo: accommodation?.roomName || "",
          monthlyRent: accommodation?.rentAmount || "",
          securityDeposit: accommodation?.securityDeposit || "",
          dateOfJoining: accommodation?.moveInDate
            ? accommodation.moveInDate.split("T")[0]
            : "",
          tenant1: {
            name: tenant.name || "",
            mobile: tenant.mobile || "",
            aadhar: tenant.aadhar || "",
            tenantId: tenant.tenantId,
            collegeReg: "",
            gender: "",
            nationality: "Indian",
          },
        });
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayValue = (val) => val || "/NA";

  const printOnlyAgreement = () => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .bg-gray-50 {
          background-color: #f9fafb !important;
        }
      }
    `;
    document.head.appendChild(style);

    const printContent = agreementRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  if (loading)
    return <div className="flex justify-center items-center h-64 text-gray-700">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  const { apartmentName, roomNo, dateOfJoining, monthlyRent, securityDeposit, tenant1 } = formData;

  return (
    <div>
      <div
        ref={agreementRef}
        className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg font-[Poppins] text-gray-800 text-sm"
      >
        {/* Updated Header */}
        <h1 className="text-2xl font-bold text-center mb-8 text-blue-700">
          {apartmentName} Apartment
        </h1>

        {/* Apartment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="font-semibold">ROOM NO.:</label>
            <input
              readOnly
              value={displayValue(roomNo)}
              className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
            />
          </div>
        </div>

        {/* Tenant Info */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-blue-600">TENANT INFORMATION</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">NAME:</label>
              <input
                readOnly
                value={displayValue(tenant1.name)}
                className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
              />
            </div>
            <div>
              <label className="font-semibold">MOBILE NO.:</label>
              <input
                readOnly
                value={displayValue(tenant1.mobile)}
                className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <label className="font-semibold">AADHAR/PASSPORT/VISA NO.:</label>
              <input
                readOnly
                value={displayValue(tenant1.aadhar)}
                className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
              />
            </div>
            <div>
              <label className="font-semibold">NATIONALITY:</label>
              <input
                readOnly
                value={displayValue(tenant1.nationality)}
                className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Rent Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="font-semibold">DATE OF JOINING:</label>
            <input
              readOnly
              type="date"
              value={displayValue(dateOfJoining)}
              className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
            />
          </div>
          <div>
            <label className="font-semibold">MONTHLY RENT (RUPEES):</label>
            <input
              readOnly
              value={displayValue(monthlyRent)}
              className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="font-semibold">SECURITY DEPOSIT (RUPEES):</label>
            <input
              readOnly
              value={displayValue(securityDeposit)}
              className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
            />
          </div>
        </div>

        {/* Terms */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-3 text-blue-600">TERMS & CONDITIONS</h2>
          <ul className="list-decimal pl-5 space-y-2 text-justify text-gray-700 leading-relaxed">
            {terms.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>

        {/* Footer - With Background Color Visible on Print */}
        <div className="mt-10 border-t border-gray-400 pt-6 -mx-6 -mb-6 bg-gray-100">
          {/* Signatures Row */}
          <div className="flex flex-col sm:flex-row justify-around items-start px-6 mb-4">
            {/* Tenant Signature */}
            <div className="text-center sm:w-1/2">
              <p className="font-semibold mb-2">Signature of Tenant</p>
              {tenantSignature ? (
                <img
                  src={tenantSignature}
                  alt="Tenant Signature"
                  className="w-40 h-20 object-contain border border-gray-300 mx-auto"
                />
              ) : (
                <div className="w-40 h-20 border border-gray-300 flex items-center justify-center mx-auto">
                  <span className="text-gray-400 text-xs">Tenant Signature</span>
                </div>
              )}
            </div>

            {/* Landlord Signature */}
            <div className="text-center sm:w-1/2 mt-6 sm:mt-0">
              <p className="font-semibold mb-2">Signature of Landlord</p>
              {landlordSignature ? (
                <img
                  src={landlordSignature}
                  alt="Landlord Signature"
                  className="w-40 h-20 object-contain border border-gray-300 mx-auto"
                />
              ) : (
                <div className="w-40 h-20 border border-gray-300 flex items-center justify-center mx-auto">
                  <span className="text-gray-400 text-xs">Landlord Signature</span>
                </div>
              )}
            </div>
          </div>

          {/* Logo + About Draze */}
          <div className="flex flex-col sm:flex-row items-center justify-center px-6 pb-6 space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex-shrink-0">
              <img src={logo} alt="Dekho Rentals Logo" className="h-16 opacity-80" />
            </div>
            <div className="text-left text-xs text-gray-600 max-w-xs">
              <p className="font-semibold text-blue-700 mb-1">About Draze</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Draze is a trusted platform connecting tenants and landlords seamlessly.</li>
                <li>We ensure verified properties, secure agreements, and hassle-free rentals.</li>
                <li>24/7 support for all your accommodation needs.</li>
                <li>Powered by technology, backed by trust.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="text-center mt-6">
        <button
          onClick={printOnlyAgreement}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          Print Agreement
        </button>
      </div>
    </div>
  );
};

export default RentAgreementForm;
