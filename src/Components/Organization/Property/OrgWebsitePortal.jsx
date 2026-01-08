import React, { useState, useRef, useEffect } from "react";
import { Menu, X, Building2, MapPin, Info, Activity, Edit3, // Edit icon
  Save,
  Users, // Icon for user access
} from "lucide-react";
import { useLocation, useNavigate, useParams, Outlet } from "react-router-dom";
import gsap from "gsap";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx"; // Your auth
import logo from "../../../assets/logo/logo.png"; // Default logo
// No import for heroImage - using public path
import { getSubdomain } from "./subdomin.jsx"; // Function to get subdomain
console.log("Subdomain:", getSubdomain());  
// LocationDisplay (from your Navbar)
const LocationDisplay = ({ city, error }) => (
  <>{error || city}</>
);

// Property Details Modal Component
const PropertyDetailsModal = ({ propertyDetails, onClose }) => {
  if (!propertyDetails) return null;

  const themeColor = propertyDetails.themeColor || '#3b82f6'; // Fallback to blue

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: themeColor }}>{propertyDetails.name}</h2>
          <p className="mb-4 text-gray-700">{propertyDetails.description}</p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="mb-1"><strong>Type:</strong> {propertyDetails.type}</p>
              <p className="mb-1"><strong>Address:</strong> {propertyDetails.location?.address}</p>
              <p className="mb-1"><strong>City:</strong> {propertyDetails.location?.city}</p>
              <p className="mb-1"><strong>State:</strong> {propertyDetails.location?.state}</p>
              <p className="mb-1"><strong>Pin Code:</strong> {propertyDetails.location?.pinCode}</p>
            </div>
            <div>
              {/* <p className="mb-1"><strong>Rating:</strong> {propertyDetails.rating} ({propertyDetails.ratingSummary?.totalRatings || 0} reviews)</p> */}
              <p className="mb-1"><strong>Availability:</strong> {propertyDetails.availability?.hasAvailableRooms ? 'Available' : 'No Availability'}</p>
              {/* <p className="mb-1"><strong>Pricing (Rooms):</strong> ₹{propertyDetails.pricing?.rooms?.min || 0} - ₹{propertyDetails.pricing?.rooms?.max || 0}/month</p> */}
              {/* <p className="mb-1"><strong>Pricing (Beds):</strong> ₹{propertyDetails.pricing?.beds?.min || 0} - ₹{propertyDetails.pricing?.beds?.max || 0}/bed</p> */}
            </div>
          </div>
          {propertyDetails.images?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2" style={{ color: themeColor }}>Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {propertyDetails.images.map((img, i) => (
                  <img key={i} src={img} alt={`Property ${i + 1}`} className="w-full h-32 object-cover rounded" />
                ))}
              </div>
            </div>
          )}
          {propertyDetails.commonFacilities?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2" style={{ color: themeColor }}>Common Facilities</h3>
              <ul className="list-disc pl-5 space-y-1">
                {propertyDetails.commonFacilities.map((fac, i) => (
                  <li key={i} className="text-gray-700">{fac}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end">
            <motion.button
              onClick={onClose}
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: themeColor }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Close
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hero Section Component (Clean image only, no text overlay)
const HeroSection = ({ orgData, editMode, onUpdate }) => {
  const shouldReduceMotion = useReducedMotion();
  const [localDescription, setLocalDescription] = useState(orgData.website?.about || '');
  useEffect(() => {
    setLocalDescription(orgData.website?.about || '');
  }, [orgData.website?.about]);

  const themeColor = orgData.website?.themeColor || '#3b82f6';
  const bannerImage = orgData.website?.bannerImage ? `https://api.gharzoreality.com${orgData.website.bannerImage}` : burnar;

  const handleSave = () => {
    onUpdate({ ...orgData, website: { ...orgData.website, about: localDescription } });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: shouldReduceMotion ? 'scroll' : 'fixed',
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />
      {/* Subtle gradient overlay for balance */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: [0.1, 0.3, 0.1],
            background: [
              `linear-gradient(135deg, ${themeColor}20 0%, ${themeColor}30 50%, ${themeColor}20 100%)`,
              `linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(74,222,128,0.1) 50%, rgba(16,185,129,0.1) 100%)`,
              `linear-gradient(135deg, ${themeColor}20 0%, ${themeColor}30 50%, ${themeColor}20 100%)`
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1] }}
        />
      )}
      {/* Content - Only in edit mode; otherwise empty for clean image */}
      {editMode ? (
        <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4 space-y-4">
          <textarea
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            className="w-full p-4 bg-white/90 text-black rounded-lg text-lg"
            rows={4}
            placeholder="Enter hero section description..."
          />
          <motion.button
            onClick={handleSave}
            className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: themeColor }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Save size={20} className="inline mr-2" />
            Save Hero
          </motion.button>
        </div>
      ) : null}
    </section>
  );
};

// Properties Section Component (Updated to use landlord/properties API)
const PropertiesSection = ({ orgData, editMode, onUpdate, organizationId }) => {
  const shouldReduceMotion = useReducedMotion();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [propertyDetails, setPropertyDetails] = useState(null);
  const containerVariants = shouldReduceMotion ? {} : {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.4 } }
  };

  const cardVariants = shouldReduceMotion ? {} : {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: "easeOut", type: "spring", stiffness: 100, damping: 12 } }
  };

  const themeColor = orgData.website?.themeColor || '#3b82f6';

  useEffect(() => {
    const fetchProperties = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`https://api.gharzoreality.com/api/organization/properties/${organizationId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            const mappedProperties = (json.properties || []).map(prop => ({
              id: prop._id,
              name: prop.name,
              location: `${prop.address}, ${prop.city} - ${prop.pinCode}`,
              price: "Contact for Pricing", // No price in list response; fetch details for exact pricing
              image: prop.images?.[0] || "https://via.placeholder.com/800x400?text=Property",
              description: prop.description,
              type: prop.type,
              // Add other fields as needed
            }));
            setProperties(mappedProperties);
            onUpdate({ totalProperties: json.total || 0 }); // Update total in parent
          } else {
            setProperties([]);
          }
        } else {
          setProperties([]);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [organizationId]);

  const handleViewDetails = async (id) => {
    try {
      const res = await fetch(`https://api.gharzoreality.com/api/public/property/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPropertyDetails(data.property);
        }
      }
    } catch (err) {
      console.error('Error fetching property details:', err);
    }
  };

  const handleCloseModal = () => {
    setPropertyDetails(null);
  };

  const addProperty = () => {
    const newProperty = {
      id: Date.now().toString(),
      name: "New Property",
      location: "New Location",
      price: "₹0/month",
      image: "https://via.placeholder.com/800x400?text=New+Property"
    };
    setProperties([...properties, newProperty]);
  };

  const updateProperty = (index, updated) => {
    const newProps = [...properties];
    newProps[index] = { ...newProps[index], ...updated };
    setProperties(newProps);
  };

  const handleSave = () => {
    onUpdate({ ...orgData, properties });
  };

  if (loading) {
    return <div className="py-16 text-center">Loading properties...</div>;
  }

  if (editMode) {
    return (
      <section className="py-16 px-4 sm:px-8 lg:px-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: themeColor }}>Edit Properties</h2>
          <motion.button onClick={addProperty} className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity mr-4" style={{ backgroundColor: themeColor }} whileHover={{ scale: 1.05 }}>
            Add New Property
          </motion.button>
          <motion.button onClick={handleSave} className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: themeColor }} whileHover={{ scale: 1.05 }}>
            <Save size={20} className="inline mr-2" />
            Save Properties
          </motion.button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {properties.map((property, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-4">
              <input type="text" value={property.name || ''} onChange={(e) => updateProperty(index, { name: e.target.value })} placeholder="Property Name" className="w-full mb-2 p-2 border rounded" />
              <input type="text" value={property.location || ''} onChange={(e) => updateProperty(index, { location: e.target.value })} placeholder="Location" className="w-full mb-2 p-2 border rounded" />
              <input type="text" value={property.price || ''} onChange={(e) => updateProperty(index, { price: e.target.value })} placeholder="Price" className="w-full mb-2 p-2 border rounded" />
              <input type="url" value={property.image || ''} onChange={(e) => updateProperty(index, { image: e.target.value })} placeholder="Image URL" className="w-full p-2 border rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section className="py-16 px-4 sm:px-8 lg:px-16 bg-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: themeColor }}>Featured Properties</h2>
        <p className="text-gray-600">No properties available at the moment. Total: {orgData.totalProperties || 0}</p>
      </section>
    );
  }

  return (
    <>
      <motion.section id="featured-properties" className="py-16 px-4 sm:px-8 lg:px-16 bg-white" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} viewport={{ once: true }}>
          <motion.h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: themeColor }} whileHover={{ scale: 1.01 }} transition={{ duration: 0.2, type: "spring", stiffness: 400 }}>
            Featured Properties
          </motion.h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Discover our premium rental properties in Raajbagh and beyond. Total: {orgData.totalProperties || 0}</p>
        </motion.div>
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto" variants={containerVariants}>
          {properties.map((property) => (
            <motion.div
              key={property.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 group cursor-pointer"
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.01, transition: { duration: 0.4, ease: "easeOut", type: "spring", stiffness: 300, damping: 20 } }}
              whileTap={{ scale: 0.99 }}
            >
              <motion.img src={property.image} alt={property.name} className="w-full h-48 object-cover" whileHover={{ scale: 1.05 }} transition={{ duration: 0.6, ease: "easeOut" }} />
              <motion.div className="p-6" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} viewport={{ once: true }}>
                <motion.h3 className="text-xl font-semibold mb-2" style={{ color: themeColor }} whileHover={{ x: 3 }} transition={{ duration: 0.3 }}>
                  {property.name}
                </motion.h3>
                <motion.p className="text-gray-600 mb-4" whileHover={{ color: "#6b7280" }}>
                  {property.location}
                </motion.p>
                <motion.div className="flex justify-between items-center" whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                  <motion.span className="text-2xl font-bold text-green-600" whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
                    {property.price}
                  </motion.span>
                  <motion.button 
                    onClick={() => handleViewDetails(property.id)}
                    className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity" 
                    style={{ backgroundColor: themeColor }}
                    whileHover={{ scale: 1.03 }} 
                    whileTap={{ scale: 0.97 }} 
                    transition={{ duration: 0.2 }}
                  >
                    View Details
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
      <PropertyDetailsModal propertyDetails={propertyDetails} onClose={handleCloseModal} />
    </>
  );
};

// About Us Section Component (Balanced under hero, professional formatting)
const AboutUs = ({ orgData, editMode, onUpdate }) => {
  const shouldReduceMotion = useReducedMotion();
  const containerVariants = shouldReduceMotion ? {} : {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.3 } }
  };
  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.7, ease: "easeOut", type: "spring", stiffness: 100, damping: 12 },
    }),
  };

  const slideInLeft = shouldReduceMotion ? {} : {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut", type: "spring", stiffness: 100, damping: 12 } }
  };

  const slideInRight = shouldReduceMotion ? {} : {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut", type: "spring", stiffness: 100, damping: 12 } }
  };

  const subtleScale = shouldReduceMotion ? {} : {
    hidden: { opacity: 0, scale: 0.97 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut", type: "spring", stiffness: 120, damping: 15 } }
  };

  const themeColor = orgData.website?.themeColor || '#3b82f6';

  // Defaults for missing API fields
  const defaultAbout = {
    description: orgData.website?.about || 'Dynamic Org Portal - Leading in property management.',
    mission: orgData.website?.mission || 'To provide seamless real estate solutions.', // Default
    vision: orgData.website?.vision || 'To lead the market with innovation.', // Default
    offers: orgData.website?.offers || 'Comprehensive rental property solutions.', // Default
    stats: orgData.stats || [{ value: orgData.totalProperties || 0, label: 'Total Properties' }], // Use totalProperties
    contact: orgData.contact || { email: '', phone: '', address: '' }, // Empty from API
    socialLinks: orgData.website?.socialLinks || { facebook: '', instagram: '', linkedin: '' }
  };

  const [localAbout, setLocalAbout] = useState(defaultAbout);

  useEffect(() => {
    setLocalAbout(defaultAbout);
  }, [orgData]);

  const updateLocalAbout = (updates) => {
    setLocalAbout({ ...localAbout, ...updates });
  };

  const handleSave = () => {
    onUpdate({
      ...orgData,
      website: {
        ...orgData.website,
        about: localAbout.description,
        mission: localAbout.mission,
        vision: localAbout.vision,
        offers: localAbout.offers,
        socialLinks: localAbout.socialLinks
      },
      stats: localAbout.stats,
      contact: localAbout.contact
    });
  };

  if (editMode) {
    return (
      <section className="py-16 px-4 sm:px-8 lg:px-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: themeColor }}>Edit About Us</h2>
          <motion.button onClick={handleSave} className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: themeColor }} whileHover={{ scale: 1.05 }}>
            <Save size={20} className="inline mr-2" />
            Save About Us
          </motion.button>
        </div>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <label className="block mb-2 font-semibold">Description</label>
            <textarea value={localAbout.description} onChange={(e) => updateLocalAbout({ description: e.target.value })} className="w-full p-4 border rounded-lg" rows={3} />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold">Mission</label>
              <textarea value={localAbout.mission} onChange={(e) => updateLocalAbout({ mission: e.target.value })} className="w-full p-4 border rounded-lg" rows={4} />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Vision</label>
              <textarea value={localAbout.vision} onChange={(e) => updateLocalAbout({ vision: e.target.value })} className="w-full p-4 border rounded-lg" rows={4} />
            </div>
          </div>
          <div>
            <label className="block mb-2 font-semibold">What We Offer</label>
            <textarea value={localAbout.offers} onChange={(e) => updateLocalAbout({ offers: e.target.value })} className="w-full p-4 border rounded-lg" rows={2} />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Social Links</label>
            <div className="grid md:grid-cols-3 gap-4">
              <input type="url" value={localAbout.socialLinks.facebook} onChange={(e) => updateLocalAbout({ socialLinks: { ...localAbout.socialLinks, facebook: e.target.value } })} placeholder="Facebook URL" className="w-full p-2 border rounded" />
              <input type="url" value={localAbout.socialLinks.instagram} onChange={(e) => updateLocalAbout({ socialLinks: { ...localAbout.socialLinks, instagram: e.target.value } })} placeholder="Instagram URL" className="w-full p-2 border rounded" />
              <input type="url" value={localAbout.socialLinks.linkedin} onChange={(e) => updateLocalAbout({ socialLinks: { ...localAbout.socialLinks, linkedin: e.target.value } })} placeholder="LinkedIn URL" className="w-full p-2 border rounded" />
            </div>
          </div>
          <div>
            <label className="block mb-2 font-semibold">Stats</label>
            {localAbout.stats.map((stat, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input value={stat.value || ''} onChange={(e) => {
                  const newStats = [...localAbout.stats];
                  newStats[index].value = e.target.value;
                  updateLocalAbout({ stats: newStats });
                }} className="flex-1 p-2 border rounded" />
                <input value={stat.label || ''} onChange={(e) => {
                  const newStats = [...localAbout.stats];
                  newStats[index].label = e.target.value;
                  updateLocalAbout({ stats: newStats });
                }} className="flex-1 p-2 border rounded" />
              </div>
            ))}
          </div>
          <div>
            <label className="block mb-2 font-semibold">Contact Info</label>
            <div className="grid md:grid-cols-3 gap-4">
              <input type="email" value={localAbout.contact.email} onChange={(e) => updateLocalAbout({ contact: { ...localAbout.contact, email: e.target.value } })} placeholder="Email" className="w-full p-2 border rounded" />
              <input type="tel" value={localAbout.contact.phone} onChange={(e) => updateLocalAbout({ contact: { ...localAbout.contact, phone: e.target.value } })} placeholder="Phone" className="w-full p-2 border rounded" />
              <textarea value={localAbout.contact.address} onChange={(e) => updateLocalAbout({ contact: { ...localAbout.contact, address: e.target.value } })} placeholder="Address" className="w-full p-2 border rounded md:col-span-3" rows={2} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-16 px-4 sm:px-8 lg:px-16 bg-gray-50">
      {/* Header Section - Balanced and centered */}
      <motion.div className="text-center mb-12 max-w-4xl mx-auto" variants={subtleScale} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <motion.h1 className="text-4xl md:text-5xl font-extrabold mb-6" style={{ color: themeColor }} whileHover={{ scale: 1.01 }} transition={{ duration: 0.2, type: "spring", stiffness: 400 }}>
          About {orgData.organizationName}
        </motion.h1>
        <motion.p className="text-gray-600 text-lg leading-relaxed px-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }} viewport={{ once: true }}>
          {localAbout.description}
        </motion.p>
      </motion.div>

      {/* Social Links - Centered and balanced */}
      {Object.values(localAbout.socialLinks).some(link => link) && (
        <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex justify-center gap-6">
            {localAbout.socialLinks.facebook && (
              <a href={localAbout.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
            {localAbout.socialLinks.instagram && (
              <a href={localAbout.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800 transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}
            {localAbout.socialLinks.linkedin && (
              <a href={localAbout.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            )}
          </div>
        </motion.div>
      )}

      {/* Mission + Vision - Balanced grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
        {[
          { title: "Our Mission", text: localAbout.mission || 'To be defined.' },
          { title: "Our Vision", text: localAbout.vision || 'To be defined.' },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
            variants={i === 0 ? slideInLeft : slideInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            style={{ borderLeft: `4px solid ${themeColor}` }}
          >
            <motion.h3 className="text-2xl font-bold mb-4" style={{ color: themeColor }} whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              {item.title}
            </motion.h3>
            <motion.p className="text-gray-700 leading-relaxed" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} viewport={{ once: true }}>
              {item.text}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* What We Offer - Balanced and attractive */}
      <motion.div id="what-we-offer" className="text-center mb-12 max-w-4xl mx-auto" variants={subtleScale} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <motion.h2 className="text-3xl font-bold mb-4" style={{ color: themeColor }} whileHover={{ scale: 1.01 }} transition={{ duration: 0.2, type: "spring", stiffness: 400 }}>
          What We Offer
        </motion.h2>
        <motion.p className="text-gray-600 text-lg leading-relaxed px-4" whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          {localAbout.offers}
        </motion.p>
      </motion.div>
      <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        {[
          { title: "Rental Properties", emoji: "🏠" },
          { title: "Tenant Management", emoji: "👥" },
          { title: "Regional Oversight", emoji: "🌍" },
          { title: "Dedicated Support", emoji: "🛠️" },
        ].map((item, index) => (
          <motion.div
            key={index}
            className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 text-center"
            variants={fadeInUp}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
            style={{ borderTop: `3px solid ${themeColor}` }}
          >
            <motion.div className="text-4xl mb-3" whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
              {item.emoji}
            </motion.div>
            <motion.h4 className="text-lg font-semibold text-gray-800" whileHover={{ color: themeColor }} transition={{ duration: 0.3 }}>
              {item.title}
            </motion.h4>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Section - Balanced grid */}
      {localAbout.stats.length > 0 && (
        <motion.div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {localAbout.stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center"
              variants={fadeInUp}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ delay: index * 0.08 }}
              style={{ borderTop: `3px solid ${themeColor}` }}
            >
              <motion.h3 className="text-3xl font-extrabold mb-2" style={{ color: themeColor }} whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
                {stat.value}
              </motion.h3>
              <motion.p className="text-gray-600 font-medium" whileHover={{ color: themeColor }} transition={{ duration: 0.3 }}>
                {stat.label}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Contact Section - Professional and balanced */}
      {(localAbout.contact.email || localAbout.contact.phone || localAbout.contact.address) && (
        <motion.section id="contact" className="mt-16 py-12 bg-white rounded-xl shadow-md max-w-4xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 className="text-3xl font-bold text-center mb-8" style={{ color: themeColor }} whileHover={{ scale: 1.01 }}>
            Contact Us
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6 text-center px-4">
            {localAbout.contact.email && (
              <motion.div className="p-4 rounded-lg bg-gray-50" whileHover={{ y: -2 }}>
                <div className="text-3xl mb-2">📧</div>
                <p className="font-semibold text-gray-800">Email</p>
                <p className="text-gray-600">{localAbout.contact.email}</p>
              </motion.div>
            )}
            {localAbout.contact.phone && (
              <motion.div className="p-4 rounded-lg bg-gray-50" whileHover={{ y: -2 }}>
                <div className="text-3xl mb-2">📞</div>
                <p className="font-semibold text-gray-800">Phone</p>
                <p className="text-gray-600">{localAbout.contact.phone}</p>
              </motion.div>
            )}
            {localAbout.contact.address && (
              <motion.div className="p-4 rounded-lg bg-gray-50 md:col-span-3" whileHover={{ y: -2 }}>
                <div className="text-3xl mb-2">📍</div>
                <p className="font-semibold text-gray-800">Address</p>
                <p className="text-gray-600">{localAbout.contact.address}</p>
              </motion.div>
            )}
          </div>
        </motion.section>
      )}
    </section>
  );
};

// Main Portal Layout Component
function OrgWebsitePortal() {
  const { orgId  } = useParams(); // Dynamic for multi-org, this is subdomain
  const [orgData, setOrgData] = useState({
    organizationName: '',
    logo: logo,
    website: { about: '' },
    organizationId: '', // Will be set to actual ID from API
    totalProperties: 0, // From API
  });
  const [editMode, setEditMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated, logout, role: authRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
console.log("Current Path:", currentPath);
console.log("Org ID (subdomain):", orgId);
  // Global loading
  const [loading, setLoading] = useState(true);

  // GSAP refs
  const logoRef = useRef(null);
  const iconRefs = useRef([]);
  const buttonRef = useRef(null);

  // Detect dev vs live
  const hostname = window.location.hostname;
  const isDev = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('5173');

  const themeColor = orgData.website?.themeColor || '#3b82f6';

  // Scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Optimized fetchOrgData - Public API without token
  useEffect(() => {
    const fetchOrgData = async () => {
      if (!orgId) {
        setMessage('No organization ID found.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`https://api.gharzoreality.com/api/organization/myweb/${orgId}`);

        if (response.ok) {
          const resData = await response.json();
          if (resData.success) {
            const apiData = resData.data;
            const updatedOrgData = {
              organizationId: apiData.id || orgId, // Use actual ID from API
              organizationName: apiData.organizationName || 'Default Org',
              logo: apiData.logoUrl ? `https://api.gharzoreality.com${apiData.logoUrl}` : logo,
              website: apiData.website || { 
                about: '', 
                socialLinks: { facebook: '', instagram: '', linkedin: '' },
                themeColor: '#3b82f6',
                bannerImage: ''
              },
              totalProperties: apiData.totalProperties || 0,
              // Missing fields set to null/empty
              stats: [],
              contact: { email: '', phone: '', address: '' },
              properties: [],
              mission: '', vision: '', offers: ''
            };
            setOrgData(updatedOrgData);
          } else {
            throw new Error(resData.message || 'No data');
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching org data:', error);
        setMessage(`Error fetching data: ${error.message}`);
        // Fallback to minimal mock
        setOrgData({
          organizationId: orgId, // Fallback to subdomain
          organizationName: 'ABC Properties Ltd.',
          logo: logo,
          website: {
            about: 'Leading property management company.',
            socialLinks: { facebook: '', instagram: '', linkedin: '' },
            themeColor: '#3b82f6'
          },
          totalProperties: 0,
          stats: [],
          contact: { email: '', phone: '', address: '' },
          properties: [],
          mission: '', vision: '', offers: ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrgData();
  }, [orgId]); 

  // Save orgData to localStorage on update (for mock fallback) and optionally to API
  const handleUpdateOrgData = (updates) => {
    const newOrgData = { ...orgData, ...updates };
    setOrgData(newOrgData);
    localStorage.setItem('orgData', JSON.stringify(newOrgData));
  };

  // Animations (Enhanced GSAP with smoother easing)
  useEffect(() => {
    if (currentPath !== "/reels") {
      if (logoRef.current) {
        gsap.fromTo(logoRef.current, { scale: 0, rotateY: -90, opacity: 0 }, { scale: 1, rotateY: 0, opacity: 1, duration: 1.2, ease: "back.out(1.7)" });
      }
      iconRefs.current.forEach((icon, i) => {
        if (icon) {
          gsap.fromTo(icon, { scale: 0, rotateY: 90, opacity: 0 }, { scale: 1, rotateY: 0, opacity: 1, delay: i * 0.15, duration: 0.8, ease: "back.out(1.7)" });
        }
      });
      if (buttonRef.current) {
        gsap.fromTo(buttonRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: "power3.out" });
      }
    }
  }, [currentPath]);

  const shouldReduceMotion = useReducedMotion();
  const buttonVariants = shouldReduceMotion ? {} : {
    whileHover: { scale: 1.05, rotate: 2, transition: { type: "spring", stiffness: 300, damping: 20 } },
    whileTap: { scale: 0.98 }
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate(`/login`); // Back to login
  };

  // Updated isHomePath to include root path for live site
  const isHomePath = currentPath === `/website/${orgId}` || currentPath === `${orgId}.drazeapp.com` ;

  if (currentPath === "/reels") return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading organization portal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Professional, with org name next to logo, theme-based */}
      <nav className="backdrop-blur-md shadow-lg fixed top-0 left-0 w-full z-50" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderBottom: `2px solid ${themeColor}` }}>
        <div className="container mx-auto flex items-center justify-between p-4">
          {/* Logo and Org Name */}
          <div className="flex items-center gap-3">
            <img ref={logoRef} src={orgData.logo} alt={orgData.organizationName} className="w-10 h-10 rounded-full shadow-md" />
            <span className="text-xl font-bold text-gray-800 hidden sm:block" style={{ color: themeColor }}>{orgData.organizationName}</span>
          </div>

          {/* Desktop Nav (Enhanced hover with spring) */}
          <div className="hidden md:flex gap-8 text-gray-700 font-medium">
            {[
              { id: 'hero', icon: null, label: 'Home' },
              { id: 'featured-properties', icon: Building2, label: 'Properties' },
              { id: 'about', icon: Info, label: 'About' },
              { id: 'what-we-offer', icon: Activity, label: 'What We Do' },
              // { id: 'contact', icon: MapPin, label: 'Contact' }
            ].map(({ id, icon: Icon, label }) => (
              <motion.button
                key={id}
                onClick={() => scrollToSection(id)}
                className="relative group flex items-center gap-2 hover:text-gray-900 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {Icon && <Icon size={18} className="text-gray-500 group-hover:text-gray-700 transition-colors" ref={el => iconRefs.current.push(el)} />}
                <span className="group-hover:underline underline-offset-4 decoration-2" style={{ textDecorationColor: themeColor }}>{label}</span>
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Back to Website Button - Visible on login paths */}
            {currentPath.endsWith('/tenant_login') && (
              <motion.button onClick={() => navigate('/website/ridhhi-org')} className="flex items-center gap-2 px-4 py-2 rounded-full text-white shadow-md transition-all duration-300 hover:shadow-lg bg-gray-500" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Back to Website
              </motion.button>
            )}
            {/* User Access Button - Always visible on home path for login functionality */}
            {isHomePath && (
              <motion.button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-full text-white shadow-md transition-all duration-300 hover:shadow-lg" style={{ backgroundColor: '#10b981' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Users size={16} />
                <span className="hidden sm:inline">Select Role</span>
              </motion.button>
            )}
            {/* Edit Button - Only visible if authenticated or in home path and on dev */}
            {isHomePath && isDev && isAuthenticated && authRole === 'org' && (
              <motion.button ref={buttonRef} onClick={() => setEditMode(!editMode)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-white shadow-md transition-all duration-300 hover:shadow-lg ${editMode ? 'bg-red-500' : 'bg-amber-500'}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Edit3 size={16} />
                <span className="hidden sm:inline">{editMode ? 'Exit Edit' : 'Edit'}</span>
              </motion.button>
            )}
            <LocationDisplay city="" error="" />
            <div className="md:hidden">
              <motion.button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu (Enhanced with stagger) */}
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-t border-gray-200 flex flex-col gap-2 p-4">
            {[
              { action: () => { scrollToSection('hero'); setIsOpen(false); }, icon: null, label: 'Home' },
              { action: () => { scrollToSection('featured-properties'); setIsOpen(false); }, icon: Building2, label: 'Properties' },
              { action: () => { scrollToSection('about'); setIsOpen(false); }, icon: Info, label: 'About' },
              { action: () => { scrollToSection('what-we-offer'); setIsOpen(false); }, icon: Activity, label: 'What We Do' },
              { action: () => { scrollToSection('contact'); setIsOpen(false); }, icon: MapPin, label: 'Contact' },
            ].map(({ action, icon: Icon, label }, i) => (
              <motion.button key={label} onClick={action} className="flex items-center gap-2 py-2 px-4 rounded hover:bg-gray-100 transition-colors" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                {Icon && <Icon size={18} />}
                {label}
              </motion.button>
            ))}
            {/* Mobile User Access Button */}
            {isHomePath && (
              <motion.button onClick={() => { setIsOpen(false); setShowModal(true); }} className="flex items-center gap-2 py-2 px-4 rounded hover:bg-gray-100 transition-colors" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} style={{ color: '#10b981' }}>
                <Users size={18} />
                Access Portal
              </motion.button>
            )}
            {isHomePath && isDev && isAuthenticated && authRole === 'org' && (
              <motion.button onClick={() => { setIsOpen(false); setEditMode(!editMode); }} className="flex items-center gap-2 py-2 px-4 rounded hover:bg-gray-100 transition-colors" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} style={{ color: editMode ? '#ef4444' : '#f59e0b' }}>
                <Edit3 size={18} />
                {editMode ? 'Exit Edit' : 'Edit'}
              </motion.button>
            )}
          </motion.div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="pt-20"> {/* Offset for fixed navbar */}
        {/* Hero Section - Render on home path */}
        {isHomePath && (
          <>
            <HeroSection orgData={orgData} editMode={editMode} onUpdate={handleUpdateOrgData} />
            <PropertiesSection orgData={orgData} editMode={editMode} onUpdate={handleUpdateOrgData} organizationId={orgData.organizationId} />
            <AboutUs orgData={orgData} editMode={editMode} onUpdate={handleUpdateOrgData} />
          </>
        )}

        {/* Outlet for other child routes (with fallback padding on home if needed) */}
        <div className={!isHomePath ? "p-6" : "p-0"}>
          <Outlet /> {/* Child routes: login, properties, etc. */}
        </div>
      </main>

      {/* User Access Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-lg max-w-md w-full mx-4"
          >
            <h2 className="text-xl font-bold mb-4">Select Role</h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate('/Property_manager_login');
                }}
                className="w-full p-2 bg-blue-500 text-white rounded"
              >
                Property Manager
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate('/regional_manager_login');
                }}
                className="w-full p-2 bg-blue-500 text-white rounded"
              >
                Regional Manager
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate('/Property_Owner_login');
                }}
                className="w-full p-2 bg-blue-500 text-white rounded"
              >
                Property Owner
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate('/tenant_org_login');
                }}
                className="w-full p-2 bg-blue-500 text-white rounded"
              >
                Tenant
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate('/worker_login');
                }}
                className="w-full p-2 bg-blue-500 text-white rounded"
              >
                Worker
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Global Message Display (for website creation feedback) */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          onAnimationComplete={() => !message.includes('successful') && !message.includes('website') && setTimeout(() => setMessage(''), 5000)}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm border ${
            message.includes('successful') || message.includes('Website created') || message.includes('live site')
              ? 'bg-green-500 text-white border-green-600'
              : 'bg-red-500 text-white border-red-600'
          }`}
        >
          {message}
        </motion.div>
      )}
    </div>
  );
}

export default OrgWebsitePortal;