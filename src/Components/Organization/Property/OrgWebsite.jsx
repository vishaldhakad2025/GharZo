import React, { useEffect, useState } from "react";

const OrgWebsite = () => {
  const [orgInfo, setOrgInfo] = useState(null);
  const [websiteData, setWebsiteData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Step 1: Get current subdomain
const getSubdomain = () => {
  const host = window.location.host; // e.g., myorg.drazeapp.com OR localhost:5174
  const parts = host.split(".");

  // Handle localhost or environments without subdomain
  if (host.includes("localhost")) {
    return "test"; // Replace this with any subdomain you want to simulate locally
  }

  if (parts.length >= 3) {
    return parts[0]; // e.g., "myorg" from "myorg.drazeapp.com"
  }

  return null;
};

  // Helper to get orgToken from localStorage
  const getOrgToken = () => {
    return localStorage.getItem('orgToken'); // Assuming the key is 'orgToken' - adjust if different
  };

  useEffect(() => {
    const subdomain = getSubdomain();

    if (!subdomain) {
      console.error("Subdomain not found.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const token = getOrgToken();
      if (!token) {
        console.error("orgToken not found in localStorage.");
        setLoading(false);
        return;
      }

      try {
        // Step 2: Fetch org info from main API with token
        const orgRes = await fetch(
          `https://api.gharzoreality.com/api/organization/${subdomain}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`, // Adjust header format if needed (e.g., 'X-Auth-Token')
              'Content-Type': 'application/json',
            },
          }
        );
        if (!orgRes.ok) throw new Error("Org fetch failed");
        const orgData = await orgRes.json();
        setOrgInfo(orgData);

        // Step 3: Fetch org website content from the subdomain's public API with token
        const siteRes = await fetch(
          `https://${subdomain}.drazeapp.com/api/organization/public`,
          {
            headers: {
              'Authorization': `Bearer ${token}`, // Adjust if needed
              'Content-Type': 'application/json',
            },
          }
        );
        if (!siteRes.ok) throw new Error("Website content fetch failed");
        const siteData = await siteRes.json();
        setWebsiteData(siteData);
      } catch (err) {
        console.error("Error fetching organization data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // UI States
  if (loading) return <p>Loading website...</p>;
  if (!orgInfo || !websiteData)
    return <p>Organization not found or data is missing.</p>;

  // ✅ Final Render
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: "2px solid #ccc", marginBottom: "20px" }}>
        <h1>{orgInfo.name}</h1>
        <p>
          Subdomain:{" "}
          <strong>{orgInfo.subdomain}.drazeapp.com</strong>
        </p>
      </header>

      {/* Main Content */}
      <main>
        <h2>About</h2>
        <p>{orgInfo.about}</p>

        <h2>Website Data</h2>
        <pre style={{ background: "#f4f4f4", padding: "10px" }}>
          {JSON.stringify(websiteData, null, 2)}
        </pre>

        {/* ✅ Redirect Button */}
        <button
          onClick={() => {
            if (orgInfo?.subdomain) {
              window.location.href = `https://${orgInfo.subdomain}.drazeapp.com`;
            }
          }}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            cursor: "pointer",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Visit {orgInfo.name}'s Website
        </button>
      </main>
    </div>
  );
};

export default OrgWebsite;