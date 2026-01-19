import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import AboutUs from "./Components/User_Section/About/AboutUs";

// Auth context
import { AuthProvider } from "./Components/User_Section/Context/AuthContext";

// Layouts
import UserLayout from "./Components/User_Section/UserSection/UserLayout";
import Layout from "./Components/LandLoard/Layout/Layout";

// Main Website Components
import Navbar from "./Components/User_Section/Navbar/navbar";
import Footer from "./Components/User_Section/Footer/footer";
import MainPage from "./Components/User_Section/Main/MainPage";
import AllProperty from "./Components/User_Section/AllProperty/AllProperty";
import PropertyDetails from "./Components/User_Section/AllProperty/PropertyDetails";
import PG from "./Components/User_Section/PG/PG";
import Reel from "./Components/User_Section/Reels/Reel";
import PgDetails from "./Components/User_Section/PG/PgDetails";
import RentProperty from "./Components/User_Section/RentProperty/RentProperty";
import SellProperty from "./Components/User_Section/SellProperty/SellProperty";
import Contact from "./Components/User_Section/Contact/Contact";
import Hostel from "./Components/User_Section/Hostel/Hostel";
import HostelDetail from "./Components/User_Section/Hostel/HostelDetail";

import RentPropertyDetail from "./Components/User_Section/RentProperty/RentPropertyDetails";
import SellPropertyDetail from "./Components/User_Section/SellProperty/SellPropertyDetail";
import BlogPage from "./Components/User_Section/Blog.jsx";
import HowItWorks from "./Components/User_Section/HowItWorks";

// User Pages
import ProfilePage from "./Components/User_Section/UserSection/pages/ProfilePage";
import BookingsPage from "./Components/User_Section/UserSection/pages/BookingPage";
import PrivacyRefund from "./Components/User_Section/PrivacyRefund/PrivacyRefund.jsx";

// Landlord Pages
import Dashboard from "./Components/LandLoard/Dashboard/Dashboard";
import AddProperty from "./Components/LandLoard/Property/AddProperty";
import Tenants from "./Components/LandLoard/Tenant/Tenant";
import PropertyDetail from "./Components/LandLoard/Property/PropertyDetail";
import PropertyList from "./Components/LandLoard/Property/Propertylist";
import Property from "./Components/LandLoard/Property/Property";
import RoomOverview from "./Components/LandLoard/Property/RoomOverview";
import TenantForm from "./Components/LandLoard/Tenant/TenantForm";
import LandlordProfile from "./Components/LandLoard/Profile/LandlordProfile";
import LandlordReels from "./Components/LandLoard/Reels/LandlordReels";
import LandlordSubAdmin from "./Components/LandLoard/SubAdmin/SubAdminDashboard.jsx";
import TenantList from "./Components/LandLoard/Tenant/TenantList";
import TenantDetails from "./Components/LandLoard/Tenant/TenantDetails";
import RoomAdd from "./Components/LandLoard/Property/RoomAdd";

import EditProperty from "./Components/LandLoard/Property/EditProperty.jsx";
import SubAdminDashboard from "./Components/LandLoard/SubAdmin/SubAdminDashboard";
import SubAdminList from "./Components/LandLoard/SubAdmin/SubAdminList";
import AddSubAdmin from "./Components/LandLoard/SubAdmin/AddSubAdmin";
import AllComplaints from "./Components/LandLoard/Dashboard/AllComplaints.jsx";

// Tenant Section Components
import TenantLayout from "./Components/TenantSection/TenantLayout";
import TenantDashboard from "./Components/TenantSection/TenantDashboard";
import TenantProfile from "./Components/TenantSection/Profile/TenantProfile";
import TenantProperties from "./Components/TenantSection/Property/AllProperty";
import TenantPropertyDetails from "./Components/TenantSection/Property/PropertyDetails";
import RentPayments from "./Components/TenantSection/Rent/RentPayments";
import MaintenanceRequests from "./Components/TenantSection/Maintenance/MaintenanceRequests";
import RequestForm from "./Components/TenantSection/Maintenance/RequestForm";
import LeaseAgreement from "./Components/TenantSection/Lease/LeaseAgreement";
import Announcements from "./Components/TenantSection/Announcements";
import Support from "./Components/TenantSection/Support/Support";
import PropertyReviews from "./Components/LandLoard/Property/PropertyReviews";
import Documents from "./Components/TenantSection/Docqments/Documents";
import MyAgreement from "./Components/TenantSection/MyAgreement/MyAgreement.jsx"

// Seller Pages
import SellerLayout from "./Components/Seller_Section/Layout/SellerLayout";
import AddPropertySeller from "./Components/Seller_Section/Property/AddPropertySeller";
import SellerProperty from "./Components/Seller_Section/Property/SellerProperty";
import SellerPropertyDetail from "./Components/Seller_Section/Property/SellerPropertyDetail";
import EditPropertySeller from "./Components/Seller_Section/Property/EditpropertySeller";
import SellerProfile from "./Components/Seller_Section/Profile/SellerProfile";
import EnquiriesSeller from "./Components/Seller_Section/Property/EnquiriesSeller";
import SellerSubscription from "./Components/Seller_Section/Subscription/SellerSubscription";
import SellerHome from "./Components/Seller_Section/Home/SellerHome";

// login & signup
import LandloardLogin from "./Components/LandLoard/LandloardLogin&Reg/LandloardLogin.jsx";
import LandloardSignup from "./Components/LandLoard/LandloardLogin&Reg/LandloardSignup.jsx";
import SallerLogin from "./Components/Seller_Section/SellerLogin&Reg/SallerLogin.jsx";
import SallerSignup from "./Components/Seller_Section/SellerLogin&Reg/SallerSignup.jsx";
import TenantLogin from "./Components/TenantSection/TenantLogin&Reg/TenantLogin.jsx";
import TenantSignup from "./Components/TenantSection/TenantLogin&Reg/TenantSignup.jsx";
import PropertyDetailMain from "./Components/User_Section/Main/City/PropertyDetailMain.jsx";
import PropertyListMain from "./Components/User_Section/Main/City/PropertyListMain.jsx";
import Complaints from "./Components/TenantSection/Complaints/Complaints.jsx";
import TenantBills from "./Components/TenantSection/Bills/TenantBills.jsx";
import PropertyPage from "./Components/TenantSection/Property/Tenant Dashboard/PropertyPage.jsx";
import AnnouncementsPage from "./Components/TenantSection/Property/Tenant Dashboard/AnnouncementsPage.jsx";
import RentPage from "./Components/TenantSection/Property/Tenant Dashboard/RentPage.jsx";
import MaintenancePage from "./Components/TenantSection/Property/Tenant Dashboard/MaintenancePage.jsx";
import ContactsPage from "./Components/TenantSection/Property/Tenant Dashboard/ContactsPage.jsx";
import LeasePage from "./Components/TenantSection/Property/Tenant Dashboard/LeasePage.jsx";
import Login from "./Components/User_Section/Login&Signup/Login.jsx";
import UserSignup from "./Components/User_Section/Login&Signup/UserSignup.jsx";
import TenantRentPayments from "./Components/TenantSection/Rent/RentPayments";
import VisitRequest from "./Components/LandLoard/Property/VisitRequest.jsx";

import LandlordComplaints from "./Components/LandLoard/Property/LandlordComplaints.jsx";
import DuePackages from "./Components/LandLoard/Property/DuesPackages.jsx";
import Facilities from "./Components/TenantSection/Facilities/Facilities.jsx";
import Expenses from "./Components/LandLoard/Property/Expenses.jsx";
import Dues from "./Components/LandLoard/Property/Dues.jsx";
import LandLoardplan from "./Components/LandLoard/Subscription/MySubscriptions.jsx";
import LandLoardreelsub from "./Components/LandLoard/Subscription/MyReelSubscriptions.jsx";
// sub owner section self
import SubOwnerLayout from "./Components/Sub_owner/SubOwnerLayout/SubOwnerLayout.jsx";
import SubOwnerDashboard from "./Components/Sub_owner/SubOwnerPages/SubOwnerDashboard.jsx";
import SubOwnerProfile from "./Components/Sub_owner/SubOwnerPages/SubOwnerProfile.jsx";
import SubOwnerProperty from "./Components/Sub_owner/SubOwnerPages/SubOwnerProperty.jsx";
import SubOwnerComplaints from "./Components/Sub_owner/SubOwnerPages/SubOwnerComplaints.jsx";
import SubOwnerexpenses from "./Components/Sub_owner/SubOwnerPages/SubOwnerexpenses.jsx";
import SubOwnerMaintains from "./Components/Sub_owner/SubOwnerPages/SubOwnerMaintains.jsx";
import SubOwnerDues from "./Components/Sub_owner/SubOwnerPages/SubOwnerDues.jsx";
import SubOwnerCollections from "./Components/Sub_owner/SubOwnerPages/SubOwnerCollections.jsx";
import SubOwnerOwner from "./Components/Sub_owner/SubOwnerPages/SubOwnerOwner.jsx";
import SubOwnerLogin from "./Components/Sub_owner/SubOwnerLogin/SubOwnerLogin.jsx";
import SubOwnerAddTenant from "./Components/Sub_owner/SubOwnerPages/SubOwnerAddTenant.jsx";
import SubOwnerPropertyDetail from "./Components/Sub_owner/SubOwnerPages/SubOwnerPropertyDetail.jsx";
import EditTenant from "./Components/Sub_owner/SubOwnerPages/SubOwnerPropertyPage/EditTanant.jsx";
import SubOwnerAddRooms from "./Components/Sub_owner/SubOwnerPages/SubOwnerPropertyPage/SubOwnerAddRooms.jsx";
import SubscriptionPlans from "./Components/LandLoard/Subscription/SubscriptionPlans.jsx";

import LandlordSwitchRequests from "./Components/LandLoard/Property/LandlordSwitchRequests.jsx";
import Roomswitch from "./Components/TenantSection/Roomswitch/Roomswitch.jsx";
import TenantDues from "./Components/LandLoard/Property/TenantDues.jsx";
import Collections from "./Components/LandLoard/Property/Collections.jsx";
import LandlordAnnouncements from "./Components/LandLoard/Property/LandlordAnnouncements.jsx";
import CreateWorkers from "./Components/Sub_owner/Workers/CreateWorkers.jsx";
import SubOwnerWorkers from "./Components/Sub_owner/Workers/SubOwnerWorkers.jsx";
import Sidebar from "./Components/Seller_Section/Sidebar/Sidebar.jsx";
import SellerReels from "./Components/Seller_Section/Property/Reels.jsx";
import EditpropertySeller from "./Components/Seller_Section/Property/EditpropertySeller";
import MyVisits from "./Components/User_Section/ScheduleTour/MyVisits.jsx";
import TenantSidebar from "./Components/TenantSection/TenantSidebar.jsx";

import SellerMySubscriptions from "./Components/Seller_Section/Subscription/SellerMySubscription.jsx";

// draze Worker dashboard section .............. Org .................
import WorkerDashboardLoginDr from "./Components/DrazeWorkerDashboard/WorkerDashboardLoginDr.jsx"
import WorkerDashboardDr from "./Components/DrazeWorkerDashboard/WorkerDashboardDr.jsx"
import DrWorkerLayout from "./Components/DrazeWorkerDashboard/DrWorkerLayout.jsx"
import DrWorkerProfile from "./Components/DrazeWorkerDashboard/DrWorkerProfile.jsx"
import SellerMyReelSubscription from "./Components/Seller_Section/Subscription/SellerMyReelSubscription.jsx";
import PoliceVerification from "./Components/LandLoard/Property/PoliceVerification.jsx";
import TenantPoliceVerification from "./Components/TenantSection/Docqments/TenantPoliceVerification.jsx";
import SubOwnerPoliceVerification from "./Components/Sub_owner/SubOwnerPages/SubOwnerPoliceVerification.jsx";
import RentListingPage from "./Components/User_Section/Main/RentListingPage.jsx";
import SaleListingPage from "./Components/User_Section/Main/SaleListingPage.jsx";
import RoomsListingPage from "./Components/User_Section/Main/RoomsListingPage.jsx";
import CommercialListingPage from "./Components/User_Section/Main/CommercialListingPage.jsx";
import PGHostelSection from "./Components/User_Section/Main/PGHostelSection.jsx";
import HostelsListingPage from "./Components/User_Section/Main/HostelsListingPage.jsx";
import ServicesListingPage from "./Components/User_Section/Main/ServicesListingPage.jsx";
import AddListingForm from "./Components/User_Section/Main/AddListingForm.jsx";
import RentalPropety from "./Components/User_Section/Main/RentalPropety.jsx";

// ScrollToTop Component
const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
  return null;
};

// Floating Add Button (imported from separate file)
import FloatingAddButton from "./Components/FloatingAddButton";

function App() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="">
      <AuthProvider>
        <Router>
          <ScrollToTop />

          {/* Floating Add Button - visible on all pages */}
          <FloatingAddButton />

          <Routes>
            {/* Public Website */}
            <Route
              path="*"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <div className="flex-grow pt-20">
                    <Routes>
                      <Route index element={<MainPage />} />
                      <Route path="/properties" element={<AllProperty />} />
                      <Route
                        path="/property/:id"
                        element={<PropertyDetails />}
                      />
                      <Route path="/reels" element={<Reel />} />
                      <Route path="/pg" element={<PG />} />
                      <Route path="/pg/:id" element={<PgDetails />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/hostel" element={<Hostel />} />
                      <Route path="/hostel/:id" element={<HostelDetail />} />
                      <Route path="/toparea" element={<PropertyListMain />} />
                      <Route path="/rentalpropety" element={<RentalPropety />} />
                      <Route
                        path="/details/:name"
                        element={<PropertyDetailMain />}
                      />

                      {/* ────── NEW LISTING ROUTES ADDED HERE ────── */}
                      <Route path="/rent" element={<RentListingPage />} />
                      <Route path="/sale" element={<SaleListingPage />} />
                      <Route path="/rooms" element={<RoomsListingPage />} />
                      <Route path="/commercial" element={<CommercialListingPage />} />
                      <Route path="/pg" element={<PGHostelSection />} />
                      <Route path="/hostels" element={<HostelsListingPage />} />
                      <Route path="/services" element={<ServicesListingPage />} />
                      <Route path="/add-listing" element={<AddListingForm />} />
                      {/* ──────────────────────────────────────── */}

                      <Route path="/login" element={<Login />} />
                      <Route path="/signupuser" element={<UserSignup />} />
                      <Route
                        path="/landlord_login"
                        element={<LandloardLogin />}
                      />
                      <Route
                        path="/landlord_signup"
                        element={<LandloardSignup />}
                      />
                      <Route path="/seller_login" element={<SallerLogin />} />
                      <Route path="/seller_signup" element={<SallerSignup />} />
                      <Route path="/tenant_login" element={<TenantLogin />} />
                      <Route path="/tenant_signup" element={<TenantSignup />} />

                      <Route path="/rent" element={<RentProperty />} />
                      <Route
                        path="/rent/:id"
                        element={<RentPropertyDetail />}
                      />
                      <Route path="/sell" element={<SellProperty />} />
                      <Route
                        path="/sell/:propertyId"
                        element={<SellPropertyDetail />}
                      />
                      <Route path="/about" element={<AboutUs />} />
                      <Route path="/my-visits" element={<MyVisits />} />
                      <Route path="/blog" element={<BlogPage />} />
                      <Route path="/how-it-works" element={<HowItWorks />} />
                      <Route
                        path="/privacy_refund"
                        element={<PrivacyRefund />}
                      />
                    </Routes>
                  </div>
                  <Footer />
                </div>
              }
            />
            {/* User Section */}
            <Route path="/user" element={<UserLayout />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="bookings" element={<BookingsPage />} />
            </Route>

            {/* Landlord Dashboard Section */}
            <Route path="/landlord" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="landlord-profile" element={<LandlordProfile />} />
              <Route
                path="/landlord/landlord_reels"
                element={<LandlordReels />}
              />
              <Route
                path="/landlord/landlord_subadmin"
                element={<LandlordSubAdmin />}
              />
              <Route
                path="/landlord/my-subscriptions/:id"
                element={<LandLoardplan />}
              />
              <Route
                path="/landlord/my-reel-subscriptions"
                element={<LandLoardreelsub />}
              />

              <Route path="property-list" element={<PropertyList />} />
              <Route path="add-property" element={<AddProperty />} />
              <Route path="police-verification" element={<PoliceVerification />} />

              <Route
                path="/landlord/property/edit/:id"
                element={<AddProperty />}
              />
              <Route
                path="/landlord/property/:id/edit"
                element={<EditProperty />}
              />
              <Route
                path="/landlord/property/edit/:id"
                element={<AddProperty />}
              />
              <Route path="room-overview" element={<RoomOverview />} />
              <Route path="property" element={<Property />} />
              <Route path="/landlord/expenses" element={<Expenses />} />
              <Route
                path="/landlord/announcement"
                element={<LandlordAnnouncements />}
              />
              <Route path="/landlord/dues" element={<Dues />} />
              <Route
                path="/landlord/tenantdues/:propertyId"
                element={<TenantDues />}
              />
              <Route
                path="/landlord/switch-requests"
                element={<LandlordSwitchRequests />}
              />
              <Route path="property/:id" element={<PropertyDetail />} />
              <Route
                path="/landlord/property/:propertyId/rooms"
                element={<RoomOverview />}
              />
              <Route
                path="/landlord/visit-requests"
                element={<VisitRequest />}
              />
              <Route path="/landlord/collections" element={<Collections />} />
              <Route
                path="/landlord/allComplaints"
                element={<AllComplaints />}
              />
              <Route path="/landlord/duespackages" element={<DuePackages />} />
              <Route
                path="property/:propertyId/add-room"
                element={<RoomAdd />}
              />

              <Route path="roomform" element={<PropertyDetail />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="tenant-form" element={<TenantForm />} />
              <Route path="tenant-list" element={<TenantList />} />
              <Route path="reels" element={<Reel />} />
              <Route
                path="tenant-details/:tenantId"
                element={<TenantDetails />}
              />
            </Route>
            {/* Sub-Admin */}
            <Route path="/landlord/subadmin" element={<SubAdminDashboard />} />
            <Route path="/landlord/subadmin/list" element={<SubAdminList />} />
            <Route path="/landlord/subadmin/add" element={<AddSubAdmin />} />

            {/* Tenant Dashboard Section */}
            <Route path="/landlord/subscription-plans" element={<SubscriptionPlans />} />

            <Route path="/tenant" element={<TenantLayout />}>
              <Route index element={<TenantDashboard />} />
              <Route path="profile" element={<TenantProfile />} />
              <Route path="sidebar" element={<TenantSidebar />} />
              <Route path="properties" element={<TenantProperties />} />
              <Route
                path="properties/:id"
                element={<TenantPropertyDetails />}
              />
              <Route
                path="rent-payments/:tenantId"
                element={<RentPayments />}
              />
              <Route path="/tenant/police-verification" element={<TenantPoliceVerification />} />
              <Route path="/tenant/room-switch" element={<Roomswitch />} />
              <Route path="/tenant/rent-agreement" element={<MyAgreement />} />
              <Route path="maintenance" element={<MaintenanceRequests />} />
              <Route path="maintenance/request" element={<RequestForm />} />
              <Route path="lease" element={<LeaseAgreement />} />
              <Route path="bills" element={<TenantBills />} />
              <Route path="property" element={<PropertyPage />} />
              <Route path="rent" element={<RentPage />} />
              <Route
                path="property-reviews/:propertyId"
                element={<PropertyReviews />}
              />
              <Route
                path="maintenance-dashboard"
                element={<MaintenancePage />}
              />
              <Route path="propertyreviews" element={<PropertyReviews />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route
                path="announcements-dashboard"
                element={<AnnouncementsPage />}
              />
              <Route path="lease-dashboard" element={<LeasePage />} />
              <Route path="complaints/:tenantId" element={<Complaints />} />
              <Route
                path="property/:id/complaints"
                element={<LandlordComplaints />}
              />
              <Route
                path="announcements/:tenantId"
                element={<Announcements />}
              />
              <Route path="support" element={<Support />} />
              <Route path="/tenant/documents" element={<Documents />} />
              <Route path="/tenant/facilities" element={<Facilities />} />
            </Route>
           
          
            {/* Seller Section */}
            <Route path="/seller" element={<SellerLayout />}>
              <Route index element={<SellerHome />} />
              <Route path="home" element={<SellerHome />} />
              <Route path="sidebar" element={<Sidebar />} />
              <Route path="add-property" element={<AddPropertySeller />} />
              <Route path="edit-listings" element={<EditpropertySeller />} />
              <Route path="property" element={<SellerProperty />} />
              <Route path="property/:id" element={<SellerPropertyDetail />} />
              <Route path="reels" element={<SellerReels />} />

              <Route
                path="edit-property/:id"
                element={<EditPropertySeller />}
              />
              <Route path="seller-profile" element={<SellerProfile />} />
              <Route path="enquiries" element={<EnquiriesSeller />} />
              <Route path="subscription" element={<SellerSubscription />} />
              <Route path="/seller/my-subscriptions" element={<SellerMySubscriptions />} />
              <Route path="/seller/my-reel-subscriptions" element={<SellerMyReelSubscription />} />
            </Route>

            {/* Sub Owner Routes with Layout */}
            <Route path="/sub_owner" element={<SubOwnerLayout />}>
              <Route index element={<SubOwnerDashboard />} />
              <Route path="dashboard" element={<SubOwnerDashboard />} />
              <Route path="sub_owner_profile" element={<SubOwnerProfile />} />
              <Route path="police-verification" element={<SubOwnerPoliceVerification />} />
              <Route path="sub_owner_property" element={<SubOwnerProperty />} />
              <Route
                path="/sub_owner/property/:propertyId/add_room"
                element={<SubOwnerAddRooms />}
              />
              <Route path="complaints" element={<SubOwnerComplaints />} />
              <Route path="maintains" element={<SubOwnerMaintains />} />
              <Route path="dues" element={<SubOwnerDues />} />
              <Route path="collections" element={<SubOwnerCollections />} />
              <Route path="my_owner" element={<SubOwnerOwner />} />

              <Route path="/sub_owner/edit-tenant" element={<EditTenant />} />
              <Route
                path="/sub_owner/property/:propertyId"
                element={<SubOwnerPropertyDetail />}
              />
              <Route
                path="/sub_owner/sub_owner_add_tenant"
                element={<SubOwnerAddTenant />}
              />

              <Route
                path="/sub_owner/sub_owner_add_workers"
                element={<CreateWorkers />}
              />
              <Route
                path="/sub_owner/sub_owner_expenses"
                element={<SubOwnerexpenses />}
              />
              <Route
                path="/sub_owner/sub_owner_workers_list"
                element={<SubOwnerWorkers />}
              />
            </Route>
            {/* Login separate without sidebar */}
            <Route path="/sub_owner_login" element={<SubOwnerLogin />} />
            

            {/* //-------------------- Draze worker Dashboard route section-------------------------  */}
            <Route path="/dr-worker-dashboard" element={<DrWorkerLayout />}>
              <Route index element={<WorkerDashboardDr />} />
              <Route
                path="/dr-worker-dashboard/dashboard"
                element={<WorkerDashboardDr />}
              />
              <Route
                path="/dr-worker-dashboard/profile"
                element={<DrWorkerProfile />}
              />
            </Route>
            <Route
              path="/dr_worker_login"
              element={<WorkerDashboardLoginDr />}
            />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;