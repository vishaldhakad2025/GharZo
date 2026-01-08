// RentAgreementForm.jsx
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import axios from "axios";

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
      nationality: "Indian", // Default set here
      tenantId: "",
    },
    tenant2: {
      name: "",
      mobile: "",
      aadhar: "",
      collegeReg: "",
      gender: "",
      nationality: "Indian", // Default set here
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const terms = [
    "Tenant shall occupy premises for residential purposes only and not for any other purposes without prior written permission/consent of the owner.",
    "Tenant shall return the room in the same condition as it was given at the time of rent agreement. (If anything found damage and misplaced during your tenure at the premises you have to pay marked price of that things.)",
    "Tenant shall not make any addition/alteration in the rented premises without prior consent/permission of the owner and shall not do such work which will cause damage to the rented premises.",
    "Tenant shall pay rent monthly in the first week of every month on every 5th day of the month and if you do not pay it in the given time period then you pay fine that 100/- per day until payment received.",
    "Tenant can't vacate the room before the completion of 6/11 months as agreed and shall only vacate the rented premises with prior notice/information of one month.",
    "Notice will be valid if it is documented on 1st calendar day of the month.",
    "You have to vacate the room with-in notice period realization. (If such is failed u have to pay full months of rent and your security money not be refunded.)",
    "In case of any dispute, matter shall be referred to Phagwara Court only.",
    "Tenant shall be responsible for any illegal work done in PG premises (drugs, fight or any other illegal work).",
    "If a tenant is found violating the rules, then two-day notice will be served to vacate the room. (In such condition security will not be refunded and all the dues you have to pay separately like- Electric bill, Maintance charge or any other charges.)",
    "Electricity bill will be collected before 5th of every month.",
    "It is requested to not misbehave with any of the staff members of the Dekho Rentals.",
    "Maintenance charges 300/- will be taken every month.",
    "Security deposit will be refunded upon receipt of written notice to vacate at least one month prior to end of the lock-in period.",
    "WIFI is not included in rent (it is complementary)",
    "No loud music, parties, or disturbances allowed inside the PG premises.",
    "We are not responsible for anything stolen outside your room from common area.",
    "Outsiders are not allowed to stay at night. Only parents are allowed with prior permission.",
    "Motor charges per room will be 15 units per month.",
    "For international students C form is necessary and take the c form 30 days prior of expiring the visa",
    "On NON-PAYMENT of rent, its owner/manager right to lock the room until rent will be paid",
    "Vacating charges. 500",
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

        // 1. Fetch Tenant Profile (for tenantId)
        const profileRes = await axios.get("https://api.gharzoreality.com/api/tenant/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tenant = profileRes.data?.tenant;
        if (!tenant?.tenantId) throw new Error("Tenant ID not found in profile");
        const tenantId = tenant.tenantId;

        // 2. Fetch Room Info using tenantId
        const roomRes = await axios.get(
          `https://api.gharzoreality.com/api/tenant/${tenantId}/my-rooms`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const room = roomRes.data.rooms?.[0];
        if (!room) throw new Error("Room data not found");

        // 3. Fetch Accommodation Info
        const accRes = await axios.get("https://api.gharzoreality.com/api/tenant/accommodations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const accommodation = accRes.data.accommodations?.[0];

        setFormData((prev) => ({
          ...prev,
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
            nationality: "Indian", // Always default to Indian
          },
          tenant2: {
            name: "",
            mobile: "",
            aadhar: "",
            collegeReg: "",
            gender: "",
            nationality: "Indian", // Always default to Indian
          },
        }));
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const capitalizeFirst = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleDownload = () => {
    const {
      apartmentName,
      roomNo,
      timePeriod,
      dateOfJoining,
      startingMeterMain,
      startingMeterInverter,
      monthlyRent,
      securityDeposit,
      tenant1,
      tenant2,
    } = formData;

    const displayValue = (val) => val || "/NA";

    const doc = new jsPDF();
    let y = 20;

    // Title
    doc.setFontSize(24);
    doc.text("DEKHO RENTALS RENT AGREEMENT", 105, y, { align: "center" });
    y += 20;
    doc.setFontSize(12);

    // Apartment and Room
    let text = `Apartment name: ${displayValue(apartmentName)} Room no. ${displayValue(roomNo)}.`;
    let lines = doc.splitTextToSize(text, 170);
    lines.forEach((line) => {
      doc.text(line, 20, y);
      y += 6;
    });
    y += 5;

    // Time Period
    text = `Time period: 6 months 11 months`;
    lines = doc.splitTextToSize(text, 170);
    lines.forEach((line) => {
      doc.text(line, 20, y);
      y += 6;
    });
    y += 5;

    // Tenant Information
    doc.text("Tenant information: -", 20, y);
    y += 10;

    text = `Name: 1. ${displayValue(tenant1.name)} 2. ${displayValue(tenant2.name)}`;
    lines = doc.splitTextToSize(text, 170);
    lines.forEach((line) => {
      doc.text(line, 20, y);
      y += 6;
    });

    text = `Mobile no.: 1. ${displayValue(tenant1.mobile)} 2. ${displayValue(tenant2.mobile)}`;
    lines = doc.splitTextToSize(text, 170);
    lines.forEach((line) => {
      doc.text(line, 20, y);
      y += 6;
    });

    text = `Aadhar/passport/visa no.: 1. ${displayValue(tenant1.aadhar)}`;
    lines = doc.splitTextToSize(text, 170);
    lines.forEach((line) => {
      doc.text(line, 20, y);
      y += 6;
    });

    text = `2. ${displayValue(tenant2.aadhar)}`;
    lines = doc.splitTextToSize(text, 170);
    lines.forEach((line) => {
      doc.text(line, 20, y);
      y += 6;
    });

    text = `College registration no.: 1. ${displayValue(tenant1.collegeReg)} 2. ${displayValue(tenant2.collegeReg)}`;
    lines = doc.splitTextToSize(text, 170);
    lines.forEach((line) => {
      doc.text(line, 20, y);
      y += 6;
    });

    text = `Gender: 1. ${displayValue(tenant1.gender)}`;
    lines = doc.splitTextToSize(text, 170);
    lines.forEach((line) => {
      doc.text(line, 20, y);
      y += 6;
    });

    text = `Nationality: 1. ${displayValue(tenant1.nationality)}`;
    lines = doc.splitTextToSize(text, 170);
    lines.forEach((line) => {
      doc.text(line, 20, y);
      y += 6;
    });
    y += 5;

    // Rent Information
    doc.text("Rent information", 20, y);
    y += 10;

    text = `Date of joining: ${displayValue(dateOfJoining)}. Starting meter reading: Main/invertor ${displayValue(startingMeterMain)}/ ${displayValue(startingMeterInverter)}`;
    lines = doc.splitTextToSize(text, 170);
    lines.forEach((line) => {
      doc.text(line, 20, y);
      y += 6;
    });

    text = `Monthly rent amount rs: ${displayValue(monthlyRent)} Security deposit rs: ${displayValue(securityDeposit)}`;
    lines = doc.splitTextToSize(text, 170);
    lines.forEach((line) => {
      doc.text(line, 20, y);
      y += 6;
    });
    y += 10;

    // Terms & Conditions
    doc.setFontSize(14);
    doc.text("Terms & conditions", 20, y);
    y += 10;
    doc.setFontSize(10);

    terms.forEach((t, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      text = `${i + 1}. ${t}`;
      lines = doc.splitTextToSize(text, 170);
      lines.forEach((line) => {
        doc.text(line, 20, y);
        y += 6;
      });
      y += 2;
    });

    y += 15;

    // Note and Signatures
    doc.text("Note:", 20, y);
    y += 10;
    text = "Signature of tenant Signature of tenant Signature of property manager";
    lines = doc.splitTextToSize(text, 170);
    lines.forEach((line) => {
      doc.text(line, 20, y);
      y += 6;
    });

    doc.save("Rent_Agreement.pdf");
  };

  if (loading)
    return <div className="flex justify-center items-center h-64 text-gray-700">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  const {
    apartmentName,
    roomNo,
    timePeriod,
    dateOfJoining,
    startingMeterMain,
    startingMeterInverter,
    monthlyRent,
    securityDeposit,
    tenant1,
    tenant2,
  } = formData;

  const displayValue = (val) => val || "/NA";

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg font-[Poppins] text-gray-800 text-sm">
      <h1 className="text-2xl font-bold text-center mb-8 text-blue-700">
        DEKHO RENTALS RENT AGREEMENT
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="font-semibold">APARTMENT NAME:</label>
          <input
            readOnly
            value={displayValue(apartmentName)}
            className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
          />
        </div>
        <div>
          <label className="font-semibold">ROOM NO.:</label>
          <input
            readOnly
            value={displayValue(roomNo)}
            className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="font-semibold">TIME PERIOD:</label>
        <input
          readOnly
          value={displayValue(timePeriod)}
          className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
        />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3 text-blue-600">TENANT INFORMATION</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">NAME 1:</label>
            <input
              readOnly
              value={displayValue(tenant1.name)}
              className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
            />
          </div>
          <div>
            <label className="font-semibold">NAME 2:</label>
            <input
              readOnly
              value={displayValue(tenant2.name)}
              className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
            />
          </div>
          <div>
            <label className="font-semibold">MOBILE NO. 1:</label>
            <input
              readOnly
              value={displayValue(tenant1.mobile)}
              className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
            />
          </div>
          <div>
            <label className="font-semibold">MOBILE NO. 2:</label>
            <input
              readOnly
              value={displayValue(tenant2.mobile)}
              className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <div>
            <label className="font-semibold">AADHAR/PASSPORT/VISA NO. 1:</label>
            <input
              readOnly
              value={displayValue(tenant1.aadhar)}
              className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
            />
          </div>
          <div>
            <label className="font-semibold">AADHAR/PASSPORT/VISA NO. 2:</label>
            <input
              readOnly
              value={displayValue(tenant2.aadhar)}
              className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
            />
          </div>
          <div>
            <label className="font-semibold">COLLEGE REGISTRATION NO. 1:</label>
            <input
              readOnly
              value={displayValue(tenant1.collegeReg)}
              className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
            />
          </div>
          <div>
            <label className="font-semibold">COLLEGE REGISTRATION NO. 2:</label>
            <input
              readOnly
              value={displayValue(tenant2.collegeReg)}
              className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
            />
          </div>
          <div>
            <label className="font-semibold">GENDER 1:</label>
            <input
              readOnly
              value={displayValue(tenant1.gender)}
              className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
            />
          </div>
          <div>
            <label className="font-semibold">NATIONALITY 1:</label>
            <input
              readOnly
              value={displayValue(tenant1.nationality)}
              className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
            />
          </div>
        </div>
      </div>

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
          <label className="font-semibold">STARTING METER READING MAIN:</label>
          <input
            readOnly
            value={displayValue(startingMeterMain)}
            className="border-b border-gray-500 w-full py-1 bg-transparent outline-none"
          />
        </div>
        <div>
          <label className="font-semibold">STARTING METER READING INVERTOR:</label>
          <input
            readOnly
            value={displayValue(startingMeterInverter)}
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

      <div className="mt-8">
        <h2 className="text-lg font-bold mb-3 text-blue-600">TERMS & CONDITIONS</h2>
        <ul className="list-decimal pl-5 space-y-2 text-justify text-gray-700 leading-relaxed">
          {terms.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>

      <div className="text-center border-t border-gray-400 pt-4 mt-6 text-sm leading-relaxed">
        Signature of tenant ________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        Signature of tenant ________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        Signature of property manager ________________
      </div>

      <div className="text-center mt-6">
        <button
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          Download Agreement
        </button>
      </div>
    </div>
  );
};

export default RentAgreementForm;