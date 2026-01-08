import React, { useEffect, useRef, useState } from "react";

function OrganizationReels() {
  const [reels, setReels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [category, setCategory] = useState("latest");
  const containerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  
  const [form, setForm] = useState({
    file: null,
    title: "",
    description: "",
    tags: ["property", "garden", "outdoor"],
    tagsInput: "",
    propertyId: "",
  });
  const [showCommentsFor, setShowCommentsFor] = useState(null);
  const [showLikesFor, setShowLikesFor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: "", onConfirm: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const addNotification = (message, type = "success") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({ show: true, message, onConfirm });
  };

  const hideConfirm = () => {
    setConfirmDialog({ show: false, message: "", onConfirm: null });
  };

  // Fetch current organization profile
  useEffect(() => {
    async function fetchCurrentOrg() {
      try {
        const orgToken = localStorage.getItem("orgToken");
        if (!orgToken) return;
        const response = await fetch(
          "https://api.gharzoreality.com/api/organization/profile",
          {
            headers: {
              Authorization: `Bearer ${orgToken}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        if (data.success) {
          setCurrentOrg(data.organization);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    }
    fetchCurrentOrg();
  }, []);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const orgToken = localStorage.getItem("orgToken");
        if (!orgToken) throw new Error("No authentication orgToken found");
        const response = await fetch(
          "https://api.gharzoreality.com/api/landlord/properties",
          {
            headers: {
              Authorization: `Bearer ${orgToken}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();
        if (data.success) {
          setProperties(data.properties || []);
        } else {
          setProperties([]);
        }
      } catch (err) {
        console.error("Properties fetch error:", err);
        setProperties([]);
      }
    }
    fetchProperties();
  }, []);

  // Fetch reels based on category and page
  const fetchReels = async (page = 1, append = false) => {
    try {
      const orgToken = localStorage.getItem("orgToken");
      if (!orgToken) throw new Error("No authentication orgToken found");
      const response = await fetch(
        `https://api.gharzoreality.com/api/reels/landlord/all?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${orgToken}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch reels");
      const data = await response.json();
      const newReels = (data?.reels || []).map((item, i) => ({
        id: item._id || item.id || `api-${(append ? reels.length : 0) + i}`,
        organizationId: item.organizationId,
        src: item.videoUrl,
        poster: item.thumbnailUrl || "",
        title: item.title || "",
        description: item.description || "",
        username: currentOrg?.name || item.organizationId?.name || "Anonymous",
        avatar: currentOrg?.profilePhoto
          ? `https://api.gharzoreality.com${currentOrg.profilePhoto}`
          : `https://i.pravatar.cc/100?img=${((append ? reels.length : 0) + i + 12) % 70}`,
        likes: item.likesCount || 0,
        comments: item.commentsCount || 0,
        liked: false,
        following: false,
      }));
      if (append) {
        setReels((prev) => [...prev, ...newReels]);
      } else {
        setReels(newReels);
      }
      setHasMore(data.pagination ? data.pagination.currentPage < data.pagination.totalPages : newReels.length < 10);
    } catch (err) {
      console.error("Fetch reels error:", err);
      if (!append) {
        setReels([]);
      }
      setHasMore(false);
    } finally {
      if (append) {
        setLoadingMore(false);
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    setCurrentPage(1);
    setReels([]);
    setHasMore(true);
    fetchReels(1, false);
  }, [category]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    setLoadingMore(true);
    fetchReels(nextPage, true);
  };

  // IntersectionObserver for loading more
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, currentPage, reels.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const videos = container.querySelectorAll("video");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (!(el instanceof HTMLVideoElement)) return;
          if (entry.isIntersecting && entry.intersectionRatio > 0.85) {
            el.play().catch(() => {});
            const idx = Number(el.dataset.index || 0);
            setActiveIndex(idx);
          } else {
            el.pause();
          }
        });
      },
      { root: container, threshold: buildThresholdList(30) }
    );

    videos.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, [reels.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (
        e.target &&
        (e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA" ||
          e.target.tagName === "SELECT")
      )
        return;
      if (["ArrowDown", "PageDown", "j"].includes(e.key)) {
        e.preventDefault();
        snapTo(activeIndex + 1);
      } else if (["ArrowUp", "PageUp", "k"].includes(e.key)) {
        e.preventDefault();
        snapTo(activeIndex - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex]);

  const snapTo = (idx) => {
    const container = containerRef.current;
    if (!container) return;
    const clamped = Math.max(0, Math.min(reels.length - 1, idx));
    const card = container.querySelector(`[data-card-index="${clamped}"]`);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const toggleLike = async (id) => {
    try {
      const orgToken = localStorage.getItem("orgToken");
      if (!orgToken) throw new Error("No authentication orgToken found");
      const response = await fetch(
        `https://api.gharzoreality.com/api/reels/${id}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${orgToken}`,
          },
        }
      );
      if (!response.ok) throw new Error(`Like failed: ${response.statusText}`);
      const data = await response.json();
      setReels((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, liked: data.liked, likes: data.likesCount } : r
        )
      );
    } catch (error) {
      console.error("Like error:", error);
      addNotification("Failed to like reel. Please try again.", "error");
    }
  };

  const toggleFollow = (id) => {
    setReels((prev) =>
      prev.map((r) => (r.id === id ? { ...r, following: !r.following } : r))
    );
  };

  const handleShare = async (reel) => {
    const shareData = {
      title: reel.title || "Reel",
      text: `Check out this reel by @${reel.username}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        addNotification("Link copied to clipboard!", "success");
      }
    } catch (e) {
      // ignore
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.file) {
      addNotification("Please choose a video file", "error");
      return;
    }
    if (!form.propertyId) {
      addNotification("Please select a property", "error");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("video", form.file);
      formData.append("title", form.title || "New Reel");
      formData.append("description", form.description || "");
      formData.append("propertyId", form.propertyId);
      formData.append("tags", JSON.stringify(form.tags));

      const orgToken = localStorage.getItem("orgToken");
      if (!orgToken) throw new Error("No authentication orgToken found");

      const response = await fetch(
        "https://api.gharzoreality.com/api/reels/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${orgToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to upload reel");
      }

      const newReel = {
        id: data.reel._id,
        organizationId: data.reel.organizationId || currentOrg?._id,
        src: data.reel.videoUrl,
        poster: data.reel.thumbnailUrl,
        title: data.reel.title,
        description: data.reel.description,
        username: currentOrg?.name || "you",
        avatar: currentOrg?.profilePhoto
          ? `https://api.gharzoreality.com${currentOrg.profilePhoto}`
          : `https://i.pravatar.cc/100?u=${currentOrg?._id || "you"}`,
        likes: data.reel.likesCount || 0,
        comments: data.reel.commentsCount || 0,
        liked: false,
        following: true,
      };

      setReels((prev) => [newReel, ...prev]);
      setShowUpload(false);
      setForm({
        file: null,
        title: "",
        description: "",
        tags: ["property", "garden", "outdoor"],
        propertyId: "",
        tagsInput: "",
      });
      setTimeout(() => snapTo(0), 50);
      addNotification(data.message || "Reel uploaded successfully!", "success");
    } catch (error) {
      console.error("Upload error:", error);
      addNotification(`You do not have any subscription plan`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirmed = async (id) => {
    try {
      const orgToken = localStorage.getItem("orgToken");
      if (!orgToken) throw new Error("No authentication orgToken found");

      const response = await fetch(`https://api.gharzoreality.com/api/reels/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${orgToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setReels((prev) => prev.filter((r) => r.id !== id));
        addNotification(data.message || "Reel deleted successfully!", "success");
      } else {
        throw new Error(data.message || "Failed to delete reel");
      }
    } catch (error) {
      console.error("Delete error:", error);
      addNotification("Failed to delete reel. Please try again.", "error");
    }
  };

  const handleDelete = (id) => {
    showConfirm("Are you sure you want to delete this reel?", async () => {
      await handleDeleteConfirmed(id);
      hideConfirm();
    });
  };

  return (
    <>
      {/* ==================== FIXED & RESPONSIVE NOTIFICATION MODAL ==================== */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm mx-4 bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-white mb-3">
              {notification.type === "success" ? "Success" : "Information"}
            </h2>
            <p className="text-orange-100 text-lg mb-8 leading-relaxed">
              {notification.message}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={() => removeNotification(notification.id)}
                className="px-6 py-3 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  removeNotification(notification.id);
                  window.location.href = "/organization/subscription-plans";
                }}
                className="px-6 py-3 rounded-lg bg-red-600 hover:bg-blue-700 text-white font-bold shadow-lg transition"
              >
                Buy Subscription
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Custom Confirm Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md bg-white text-black rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{confirmDialog.message}</h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={hideConfirm}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen w-full bg-black text-white overflow-hidden relative">
        <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <ReelsCube3D />
          </div>
          <div className="flex items-center gap-4">
            <button
              aria-label="Upload"
              onClick={() => setShowUpload(true)}
              className="group relative inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 hover:bg-white/10 transition"
              title="Upload Reel"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="hidden sm:inline">Upload</span>
            </button>
          </div>
        </header>

        <main className="pt-16 pb-8 max-w-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 overflow-hidden">
          <div className="mx-auto h-[calc(100vh-4rem)] max-w-[92vw] sm:max-w-[430px] md:max-w-[520px] lg:max-w-[560px] relative">
            <div
              ref={containerRef}
              className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
            >
              <div className="h-4" />
              {reels.length === 0 ? (
                <div className="snap-center flex items-center justify-center min-h-[calc(100vh-6rem)] my-3">
                  <div className="w-[300px] aspect-[9/16] bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-gray-700 animate-pulse" />
                      <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div className="absolute left-3 right-20 bottom-3 space-y-2">
                      <div className="h-4 w-48 bg-gray-700 rounded animate-pulse" />
                      <div className="h-3 w-36 bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div className="absolute right-2 bottom-4 flex flex-col items-center gap-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-10 h-10 bg-gray-700 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {reels.map((reel, idx) => (
                    <article
                      key={reel.id}
                      data-card-index={idx}
                      className="snap-center flex items-center justify-center min-h-[calc(100vh-6rem)] my-3"
                    >
                      <div className="relative w-[300px] aspect-[9/16] bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                        <video
                          data-index={idx}
                          className="absolute inset-0 h-full w-full object-cover"
                          src={reel.src}
                          poster={reel.poster}
                          playsInline
                          muted={false}
                          loop
                          preload="metadata"
                        />
                        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {currentOrg?.name}
                            </span>
                            {currentOrg && reel.organizationId === currentOrg._id && (
                              <button
                                onClick={() => handleDelete(reel.id)}
                                className="text-xs px-2.5 py-1 rounded-full font-semibold bg-red-500 text-white hover:bg-red-600 transition"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="absolute left-3 right-20 bottom-3 space-y-1 pr-2">
                          <p className="text-sm font-semibold leading-tight line-clamp-2">
                            {reel.title}
                          </p>
                          <p className="text-xs text-white/90 leading-tight line-clamp-2">
                            {reel.description}
                          </p>
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-white/80">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M21 18v-8l-9-5-9 5v8l9 5 9-5z" />
                            </svg>
                            <span>
                              Original audio • {formatCompact(reel.likes + 987)} plays
                            </span>
                          </div>
                        </div>
                        <div className="absolute right-2 bottom-4 flex flex-col items-center gap-4">
                          <ActionButton
                            label="Like"
                            active={reel.liked}
                            count={reel.likes}
                            onClick={() => toggleLike(reel.id)}
                            onCountClick={() =>
                              setShowLikesFor(
                                showLikesFor === reel.id ? null : reel.id
                              )
                            }
                            icon={(active) => (
                              <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill={active ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <path d="M12.1 21s-7.1-4.4-9-8.5C1.9 9.6 3.8 7 6.5 7c1.5 0 2.8.8 3.6 2 .8-1.2 2.1-2 3.6-2 2.7 0 4.6 2.6 3.4 5.5-1.9 4.1-9 8.5-9 8.5z" />
                              </svg>
                            )}
                          />
                          <ActionButton
                            label="Comment"
                            count={reel.comments}
                            onClick={() =>
                              setShowCommentsFor(
                                showCommentsFor === reel.id ? null : reel.id
                              )
                            }
                            onCountClick={() =>
                              setShowCommentsFor(
                                showCommentsFor === reel.id ? null : reel.id
                              )
                            }
                            icon={() => (
                              <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <path d="M21 15a4 4 0 0 1-4 4H8l-5 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" />
                              </svg>
                            )}
                          />
                          {currentOrg && reel.organizationId === currentOrg._id && (
                            <ActionButton
                              label="Delete"
                              count={reel.deletions || 0}
                              onClick={() => handleDelete(reel.id)}
                              onCountClick={() => handleDelete(reel.id)}
                              icon={() => (
                                <svg
                                  width="28"
                                  height="28"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                >
                                  <polyline points="3,6 5,6 21,6" />
                                  <path d="M19,6v14a2,2 0 0 1-2,2H7a2,2 0 0 1-2,-2V6m3 0V4a2,2 0 0 1 2,-2h4a2,2 0 0 1 2,2v2" />
                                  <line x1="10" y1="11" x2="10" y2="17" />
                                  <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                              )}
                            />
                          )}
                          <ActionButton
                            label="Share"
                            onClick={() => handleShare(reel)}
                            icon={() => (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="white"
                              >
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line
                                  x1="8.59"
                                  y1="13.51"
                                  x2="15.42"
                                  y2="17.49"
                                  stroke="white"
                                  strokeWidth="2"
                                />
                                <line
                                  x1="15.41"
                                  y1="6.51"
                                  x2="8.59"
                                  y2="10.49"
                                  stroke="white"
                                  strokeWidth="2"
                                />
                              </svg>
                            )}
                          />
                          <ActionButton
  label="Delete"
  onClick={() => handleDelete(reel)}   // apna delete function yahan daal dena
  icon={() => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Trash bin icon - Instagram Reels wala feel */}
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )}
/>
                          <ActionButton
                            label="Sound"
                            onClick={() => {
                              const video = document.querySelector(
                                `video[data-index="${idx}"]`
                              );
                              if (video) video.muted = !video.muted;
                            }}
                            icon={() => (
                              <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                <path d="M19 5v14a8 8 0 0 0 0-14z" />
                              </svg>
                            )}
                          />
                        </div>
                        <CommentsSheet
                          open={showCommentsFor === reel.id}
                          onClose={() => setShowCommentsFor(null)}
                          reel={reel}
                          onAdd={async (text) => {
                            if (!text.trim()) return;
                            try {
                              const orgToken = localStorage.getItem("orgToken");
                              if (!orgToken)
                                throw new Error("No authentication orgToken found");
                              const response = await fetch(
                                `https://api.gharzoreality.com/api/reels/${reel.id}/comment`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${orgToken}`,
                                  },
                                  body: JSON.stringify({ text }),
                                }
                              );
                              if (!response.ok)
                                throw new Error(
                                  `Comment failed: ${response.statusText}`
                                );
                              const data = await response.json();
                              setReels((prev) =>
                                prev.map((r) =>
                                  r.id === reel.id
                                    ? { ...r, comments: data.commentsCount }
                                    : r
                                )
                              );
                            } catch (error) {
                              console.error("Comment error:", error);
                              addNotification("Failed to add comment. Please try again.", "error");
                            }
                          }}
                        />
                        <LikesSheet
                          open={showLikesFor === reel.id}
                          onClose={() => setShowLikesFor(null)}
                          reel={reel}
                        />
                      </div>
                    </article>
                  ))}
                  {hasMore && (
                    <article
                      ref={loadMoreRef}
                      className="snap-center flex items-center justify-center min-h-[calc(100vh-6rem)] my-3 text-center text-gray-400"
                    >
                      <div>
                        {loadingMore ? (
                          <p>Loading more reels...</p>
                        ) : (
                          <p>Scroll for more reels</p>
                        )}
                      </div>
                    </article>
                  )}
                  {!hasMore && reels.length > 0 && (
                    <article className="snap-center flex items-center justify-center min-h-[calc(100vh-6rem)] my-3 text-center text-gray-400">
                      <p>No more reels to load</p>
                    </article>
                  )}
                </>
              )}
              <div className="h-16" />
            </div>
          </div>
        </main>

        {showUpload && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowUpload(false);
            }}
          >
            <div className="w-full max-w-xl rounded-2xl bg-neutral-900 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h3 className="text-lg font-semibold">Upload Reel</h3>
                <button
                  onClick={() => setShowUpload(false)}
                  aria-label="Close"
                  className="p-2 hover:bg-white/10 rounded-full"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleUpload} className="p-2 grid gap-4">
                <div className="max-h-96 overflow-y-scroll">
                  <div>
                    <label className="text-sm text-white/80">Video File</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          file: e.target.files?.[0] || null,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 p-2 file:mr-3 file:rounded-md file:border-0 file:bg-white/20 file:px-3 file:py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      placeholder="Catchy title"
                      className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 p-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Description</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                      placeholder="Say something about your reel…"
                      className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 p-2 resize-y"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/80">Select Property</label>
                    <select
                      value={form.propertyId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, propertyId: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 p-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                      required
                    >
                      <option value="" disabled>
                        Select a property
                      </option>
                      {properties.map((property) => (
                        <option key={property._id} value={property._id} className="text-black">
                          {`${property.name} (${property.type}) - ${property.address}, ${property.city}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUpload(false)}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={uploading}
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {uploading ? "Uploading…" : "Add to Feed"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* Baaki sab components same hi hain – ActionButton, CommentsSheet, LikesSheet, etc. */
function ActionButton({ label, count, icon, onClick, onCountClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`group grid place-items-center rounded-xl p-1.5 hover:bg-white/10 transition ${
        active ? "text-red-400" : "text-white"
      }`}
      aria-label={label}
    >
      {icon?.(!!active)}
      {typeof count === "number" && (
        <span
          className="text-[11px] mt-1 tabular-nums opacity-90 cursor-pointer"
          onClick={(e) => {
            if (onCountClick) {
              e.stopPropagation();
              onCountClick();
            }
          }}
        >
          {formatCompact(count)}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function CommentsSheet({ open, onClose, reel, onAdd }) {
  const [text, setText] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!open) {
      setText("");
      setComments([]);
      return;
    }
    async function fetchComments() {
      try {
        const orgToken = localStorage.getItem("orgToken");
        if (!orgToken) throw new Error("No authentication orgToken found");
        const response = await fetch(
          `https://api.gharzoreality.com/api/reels/${reel.id}/comments`,
          {
            headers: {
              Authorization: `Bearer ${orgToken}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch comments");
        const data = await response.json();
        setComments(data.comments || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchComments();
  }, [open, reel.id, reel.comments]);

  if (!open) return null;
  return (
    <div className="absolute inset-0 z-20 grid">
      <div className="self-end bg-black/40" onClick={onClose} />
      <div className="bg-neutral-950/95 backdrop-blur border-t border-white/10 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-white/80">
            Comments • {formatCompact(reel.comments)}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/60 hover:text-white transition-colors"
            aria-label="Close comments"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
          {comments.map((c, i) => (
            <Comment
              key={i}
              userimage={c.userId?.profilePhoto ? `https://api.gharzoreality.com${c.userId.profilePhoto}` : `https://i.pravatar.cc/40?u=${c.userId?.name || 'user'}`}
              username={c.userId?.name || "user"}
              text={c.text}
            />
          ))}
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (onAdd) await onAdd(text);
            setText("");
            onClose();
          }}
          className="mt-2 flex items-center gap-2"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm"
          />
          <button
            disabled={!text.trim()}
            className="px-3 py-2 rounded-xl bg-white text-black text-sm font-semibold disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function LikesSheet({ open, onClose, reel }) {
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    if (!open) {
      setLikes([]);
      return;
    }
    async function fetchLikes() {
      try {
        const orgToken = localStorage.getItem("orgToken");
        if (!orgToken) throw new Error("No authentication orgToken found");
        const response = await fetch(
          `https://api.gharzoreality.com/api/reels/${reel.id}/likes`,
          {
            headers: {
              Authorization: `Bearer ${orgToken}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch likes");
        const data = await response.json();
        setLikes(data.likes || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchLikes();
  }, [open, reel.id, reel.likes]);

  if (!open) return null;
  return (
    <div className="absolute inset-0 z-20 grid">
      <div className="self-end bg-black/40" onClick={onClose} />
      <div className="bg-neutral-950/95 backdrop-blur border-t border-white/10 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-white/80">
            Likes • {formatCompact(reel.likes)}
          </div>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {likes.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <img
                src={`https://i.pravatar.cc/40?u=${l.userId?.name || "user"}`}
                alt="avatar"
                className="h-6 w-6 rounded-full border border-white/10"
              />
              <span className="text-xs font-medium">
                @{l.userId?.name || "user"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Comment({ username, text, userimage }) {
  return (
    <div className="flex items-start gap-2">
      <img
        src={userimage}
        alt="avatar"
        className="h-6 w-6 rounded-full border border-white/10"
      />
      <div>
        <div className="text-xs">
          <span className="font-medium">{username}</span>{" "}
          <span className="text-white/80">{text}</span>
        </div>
      </div>
    </div>
  );
}

function ReelsCube3D() {
  return (
    <div className="relative grid place-items-center h-10 w-10 [perspective:600px]">
      <div className="relative h-6 w-6 rotate-12 [transform-style:preserve-3d] animate-[spin_8s_linear_infinite]">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 rounded-md shadow-lg shadow-rose-900/40 [transform:translateZ(10px)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 to-violet-500 rounded-md [transform:rotateY(90deg)_translateZ(10px)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-md [transform:rotateX(90deg)_translateZ(10px)]" />
        <svg
          viewBox="0 0 24 24"
          className="absolute inset-0 m-auto h-5 w-5 text-white [transform:translateZ(14px)]"
        >
          <path
            fill="currentColor"
            d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 2H5v2h2V6Zm2 0v2h6V6H9Zm8 0v2h2V6h-2ZM6 10H4v2h2v-2Zm14 0h-2v2h2v-2ZM6 14H4v2h2v-2Zm14 0h-2v2h2v-2ZM7 18H5v-2h2v2Zm10 0h2v-2h-2v2Z"
          />
        </svg>
      </div>
    </div>
  );
}

function buildThresholdList(steps = 20) {
  return Array.from({ length: steps }, (_, i) => (i + 1) / steps);
}

function formatCompact(num) {
  try {
    return new Intl.NumberFormat(undefined, { notation: "compact" }).format(num);
  } catch {
    return String(num);
  }
}

const style = document.createElement("style");
style.textContent = `
  .no-scrollbar { scrollbar-width: none; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
`;
document.head.appendChild(style);

export default OrganizationReels;