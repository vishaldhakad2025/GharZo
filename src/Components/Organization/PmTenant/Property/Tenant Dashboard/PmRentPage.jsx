import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function RentPage() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [dueAmount, setDueAmount] = useState(null);

  // Your tenant token
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlRFTkFOVC1sbGQydWN3cGMiLCJyb2xlIjoidGVuYW50IiwibW9iaWxlIjoiODgyMTk5MTU3MiIsImVtYWlsIjoiZGhha2FkcmFodWwxNTQ5OUBnbWFpbC5jb20iLCJpYXQiOjE3NTY5MDQxMzUsImV4cCI6MTc1OTQ5NjEzNX0.m-v3wFxFTEdRscwmEGePVCuUtwsCpIx3OBDql70fqus";

  // Fetch pending dues from accommodations API
  useEffect(() => {
    const fetchDue = async () => {
      try {
        const res = await axios.get(
          "https://api.gharzoreality.com/api/tenant/accommodations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success && res.data.accommodations.length > 0) {
          // Agar multiple properties hain, toh sabhi ke dues add kar diye
          const totalDues = res.data.accommodations.reduce(
            (sum, acc) => sum + (acc.pendingDues || 0),
            0
          );
          setDueAmount(totalDues);
        } else {
          setDueAmount(0);
        }
      } catch (err) {
        console.error("Error fetching dues:", err);
        setDueAmount(0);
      }
    };

    fetchDue();
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "https://api.gharzoreality.com/api/tenant/rent/pay", 
        {
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMsg("✅ Payment Successful: " + res.data.transactionId);
    } catch (err) {
      setMsg("❌ Payment Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-emerald-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Wallet size={40} className="text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">Rent Payment</h1>
        </div>

        <p className="mb-2 text-gray-600">
          💰 Current Due: {dueAmount === null ? "Loading..." : `₹${dueAmount}`}
        </p>

        <input
          type="number"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 border rounded-xl mb-4"
        />

        <button
          onClick={handlePayment}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded-xl shadow hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

        {msg && <p className="mt-3 text-sm">{msg}</p>}

        <Link
          to="/tenant"
          className="mt-6 inline-block px-4 py-2 bg-gray-500 text-white rounded-xl shadow hover:bg-gray-600"
        >
          ⬅ Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
