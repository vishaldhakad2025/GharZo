import React, { useEffect, useRef, useState } from "react";
import user from "../../../assets/Images/instaUser.jpg";
import { useNavigate } from "react-router-dom";

/**
 * Instagram-style Reels experience
 * - Center column vertical-snap feed with auto play/pause on click
 * - Right-side action rail: Like, Comment, Share
 * - Bottom center: Mute/Unmute button
 * - Left-side: caption/description
 * - Bottom: audio line with username
 * - Category tabs (Latest, Popular, Trending) below header on top left
 * - Fully responsive, keyboard accessible, no external deps except Tailwind CSS
 * - Full-screen on mobile, responsive across devices
 * - Total likes and comments fetched and displayed
 * - New comments appear at the top
 */

function ReelsPage() {
  const [reels, setReels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [category, setCategory] = useState("latest"); // Default category
  const [showCommentsFor, setShowCommentsFor] = useState(null);
  const [reelStats, setReelStats] = useState({});
  const [showLandlordModal, setShowLandlordModal] = useState(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Get dynamic token
  const getToken = () => localStorage.getItem("usertoken");

  // Fetch reels based on category
  useEffect(() => {
    async function fetchReels() {
      try {
        const token = getToken();
        if (!token) {
          console.error("No token found");
          setReels([]);
          return;
        }
        const response = await fetch(
          `https://api.gharzoreality.com/api/reels?sort=${category}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch reels");
        const data = await response.json();

        // Filter only active reels
        const activeReels = (data?.reels || []).filter(
          (item) => item.status === "active"
        );

        setReels(
          activeReels.map((item, i) => ({
            id: item._id || item.id || `api-${i}`,
            propertyId: item.propertyId,
            src: item.videoUrl,
            poster: item.thumbnailUrl || "",
            title: item.title || "",
            description: item.description || "",
            username: item.landlordId?.name || "landlord",
            avatar:
              item.landlordId?.profilePhoto ||
              `https://i.pravatar.cc/100?img=${(i + 12) % 70}`,
            likes: item.likesCount || 0,
            comments: item.commentsCount || 0,
            liked: false,
            following: false,
            landlordFull: item.landlordId,
            propertyIdRaw: item.propertyId // keep raw for API call
          }))
        );
      } catch (err) {
        console.error(err);
        setReels([]);
      }
    }
    fetchReels();
  }, [category]);

  // Reset active index and scroll to top when category changes
  useEffect(() => {
    setActiveIndex(0);
    setPaused(false);
    setIsMuted(false);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [category]);

  // Pause all videos when category changes
  useEffect(() => {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });
  }, [category]);

  // Fetch total likes and comments for each reel
  useEffect(() => {
    async function fetchReelStats() {
      try {
        const token = getToken();
        if (!token) {
          console.error("No token found");
          setReelStats({});
          return;
        }
        const statsPromises = reels.map((reel) =>
          Promise.all([
            fetch(`https://api.gharzoreality.com/api/reels/${reel.id}/likes`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }).then((res) =>
              res.ok ? res.json() : { success: false, totalLikes: 0, likes: [] }
            ),
            fetch(`https://api.gharzoreality.com/api/reels/${reel.id}/comments`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }).then((res) =>
              res.ok
                ? res.json()
                : { success: false, totalComments: 0, comments: [] }
            ),
          ]).then(([likesData, commentsData]) => ({
            id: reel.id,
            likes: likesData.success ? likesData.totalLikes || 0 : 0,
            comments: commentsData.success
              ? commentsData.comments.map((c) => ({
                  username: c.userId?.name || "anonymous",
                  text: c.text,
                  timestamp: c.createdAt,
                  id: c._id || c.id,
                }))
              : [],
            totalComments: commentsData.success
              ? commentsData.totalComments || 0
              : 0,
          }))
        );

        const statsArray = await Promise.all(statsPromises);
        const statsMap = statsArray.reduce(
          (acc, { id, likes, comments, totalComments }) => ({
            ...acc,
            [id]: { likes, comments, totalComments },
          }),
          {}
        );
        setReelStats(statsMap);
      } catch (err) {
        console.error(err);
        setReelStats({});
      }
    }
    if (reels.length > 0) fetchReelStats();
  }, [reels]);

  // IntersectionObserver to auto-play the centered reel and pause others
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
            el.muted = false;
            setIsMuted(false);
            el.play().catch(() => {});
            const idx = Number(el.dataset.index || 0);
            setActiveIndex(idx);
            setPaused(false);
          } else {
            el.pause();
          }
        });
      },
      { root: container, threshold: buildThresholdList(30) }
    );

    videos.forEach((v) => {
      v.muted = false;
      io.observe(v);
    });
    return () => io.disconnect();
  }, [reels]);

  // Keyboard support (Up/Down/Page keys)
  useEffect(() => {
    const onKey = (e) => {
      if (
        e.target &&
        (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
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
      const token = getToken();
      if (!token) {
        alert("No token found. Please log in.");
        return;
      }
      const response = await fetch(
        `https://api.gharzoreality.com/api/reels/${id}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Like failed: ${response.statusText}`);
      }

      const data = await response.json();
      setReels((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, liked: data.liked, likes: data.likesCount } : r
        )
      );

      setReelStats((prev) => ({
        ...prev,
        [id]: { ...prev[id], likes: data.likesCount },
      }));
    } catch (error) {
      console.error("Like error:", error);
      alert("Failed to like reel. Please try again.");
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
      url: reel.src,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      }
    } catch (e) {
      // ignore
    }
  };

  // View Property button does nothing now
  const handleViewProperty = (propertyId) => {
    // Navigation removed as requested
  };

  const toggleMute = (idx) => {
    if (activeIndex !== idx) return;
    const video = document.querySelector(`video[data-index="${idx}"]`);
    if (video) {
      const newMuted = !video.muted;
      video.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const handleVideoClick = (e, idx) => {
    if (activeIndex !== idx) return;
    const video = e.currentTarget;
    if (video.paused) {
      video.play().catch(() => {});
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  // Pass propertyId along with landlord data
  const handleLandlordClick = (landlord, propertyId) => {
    setShowLandlordModal({ ...landlord, propertyId });
  };

  return (
    <div className="min-h-screen bottom-20 w-full overflow-hidden relative bg-black text-white">
      {/* Category Buttons at top */}
      <div className="fixed top-0 left-4 right-4 z-20 flex items-center justify-center p-2">
        {/* Commented out as per original */}
      </div>

      {/* Center column feed */}
      <main className="h-screen w-full overflow-hidden pt-20">
        <div
          ref={containerRef}
          className="absolute inset-0 h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
        >
          <div className="h-4" />
          {reels.map((reel, idx) => (
            <article
              key={reel.id}
              data-card-index={idx}
              className="snap-center flex items-center justify-center h-[calc(100vh-0rem)] py-2"
            >
              <div className="relative w-full max-w-[380px] h-full max-h-[700px] bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 mx-2 sm:mx-auto">
                {/* Video */}
                <video
                  data-index={idx}
                  className="absolute inset-0 h-full w-full object-cover cursor-pointer"
                  src={reel.src}
                  poster={reel.poster}
                  playsInline
                  loop
                  preload="metadata"
                  onClick={(e) => handleVideoClick(e, idx)}
                />

                {/* Play overlay for paused state */}
                {activeIndex === idx && paused && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/10 rounded-full blur-xl animate-pulse" />
                      <div className="relative bg-white/20 rounded-full p-4">
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5,3 19,12 5,21 5,3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gradient overlays */}
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

                {/* Bottom-left caption */}
                <div className="absolute left-4 bottom-24 space-y-1 pr-2">
                  <p className="text-2xl font-semibold leading-tight line-clamp-2 text-white">
                    {reel.title}
                  </p>
                  <p className="text-xs text-white/90 leading-tight line-clamp-2">
                    {reel.description}
                  </p>
                </div>

                {/* Music bar at bottom - Username clickable */}
                <div className="absolute bottom-16 left-4 right-4 z-5 flex items-center text-white/70 text-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-2 flex-shrink-0"
                  >
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
                  </svg>

                  <button
                    onClick={() => handleLandlordClick(reel.landlordFull, reel.propertyId)}
                    className="truncate hover:underline focus:underline"
                  >
                    {reel.username}
                  </button>
                </div>

                {/* Right action rail */}
                <div className="absolute right-0 bottom-20 flex flex-col items-center gap-6 pb-6 pl-2 ">
                  <ActionButton
                    label="Like"
                    active={reel.liked}
                    count={reelStats[reel.id]?.likes || reel.likes}
                    onClick={() => toggleLike(reel.id)}
                    icon={(active) => (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill={active ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    )}
                  />
                  <ActionButton
                    label="Comment"
                    count={reelStats[reel.id]?.totalComments || reel.comments}
                    onClick={() =>
                      setShowCommentsFor(
                        showCommentsFor === reel.id ? null : reel.id
                      )
                    }
                    icon={() => (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    )}
                  />
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

                  {/* <ActionButton
                    label="View Property"
                    onClick={() => handleViewProperty(reel.propertyId)}
                    icon={() => (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9,22 9,12 15,12 15,22" />
                      </svg>
                    )}
                  /> */}
                </div>

                {/* Mute/Unmute button */}
                <div className="absolute bottom-14 right-2 z-10">
                  <button
                    onClick={() => toggleMute(idx)}
                    className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition text-white"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 18 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5" />
                      {isMuted && <line x1="17" y1="3" x2="4" y2="20" />}
                    </svg>
                  </button>
                </div>

                {/* Comments drawer */}
                <CommentsSheet
                  open={showCommentsFor === reel.id}
                  onClose={() => setShowCommentsFor(null)}
                  reel={reel}
                  comments={reelStats[reel.id]?.comments || []}
                  onAdd={async (text) => {
                    if (!text.trim()) return;
                    try {
                      const token = getToken();
                      if (!token) {
                        alert("No token found. Please log in.");
                        return;
                      }
                      const response = await fetch(
                        `https://api.gharzoreality.com/api/reels/${reel.id}/comment`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ text }),
                        }
                      );

                      if (!response.ok) {
                        throw new Error(`Comment failed: ${response.statusText}`);
                      }

                      const data = await response.json();
                      setReels((prev) =>
                        prev.map((r) =>
                          r.id === reel.id
                            ? { ...r, comments: data.commentsCount }
                            : r
                        )
                      );

                      setReelStats((prev) => ({
                        ...prev,
                        [reel.id]: {
                          ...prev[reel.id],
                          comments: [
                            {
                              username: data.userId?.name || "anonymous",
                              text,
                              timestamp: Date.now(),
                              id: data._id || `comment-${Date.now()}`,
                            },
                            ...(prev[reel.id]?.comments || []),
                          ],
                          totalComments:
                            (prev[reel.id]?.totalComments || 0) + 1,
                        },
                      }));
                    } catch (error) {
                      console.error("Comment error:", error);
                      alert("Failed to add comment. Please try again.");
                    }
                  }}
                />
              </div>
            </article>
          ))}

          <div className="h-16" />
        </div>
      </main>

      {/* ==== Landlord Profile Modal ==== */}
      {showLandlordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-sm bg-neutral-900 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowLandlordModal(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center space-y-4">
              <img
                src={`https://api.gharzoreality.com${showLandlordModal.profilePhoto}`}
                alt={showLandlordModal.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
              />
              <h2 className="text-xl font-bold">{showLandlordModal.name}</h2>

              <div className="w-full space-y-2 text-sm text-white/80">
                <div className="flex justify-between">
                  {/* <span className="font-medium">ID</span> */}
                  {/* <span>{showLandlordModal._id}</span> */}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Mobile</span>
                  <span>{showLandlordModal.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email</span>
                  <span>{showLandlordModal.email}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowLandlordModal(null);
                  navigate(`/property/${showLandlordModal.propertyId}`);
                }}
                className="mt-4 w-full py-2 bg-white text-black rounded-xl font-medium"
              >
                View Full Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** ACTION BUTTON */
function ActionButton({ label, count, icon, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center gap-1 p-2 hover:bg-white/10 rounded-full transition ${
        active ? "text-red-400" : "text-white"
      }`}
      aria-label={label}
    >
      <div className="p-2">{icon?.(!!active)}</div>
      {typeof count === "number" && count > 0 && (
        <span className="text-xs tabular-nums opacity-90">
          {formatCompact(count)}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}

/** COMMENTS BOTTOM SHEET */
function CommentsSheet({ open, onClose, reel, comments, onAdd }) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!open) setText("");
  }, [open]);
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-0 grid">
      <div className="self-end bg-black/40" onClick={onClose} />
      <div className="bg-neutral-950/95 backdrop-blur border-t border-white/10 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-white/80">
            Comments • {formatCompact(comments.length)}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg"
            aria-label="Close comments"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-32 overflow-auto space-y-2 pr-1">
          {comments.map((comment, idx) => (
            <Comment
              key={`${comment.id}-${idx}`}
              username={comment.username}
              text={comment.text}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm"
          />
          <button
            disabled={!text.trim()}
            onClick={() => {
              onAdd?.(text);
              setText("");
            }}
            className="px-3 py-2 rounded-xl bg-white text-black text-sm font-semibold disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function Comment({ username, text }) {
  return (
    <div className="flex items-start gap-2">
      <img
        src={`https://i.pravatar.cc/40?u=${username}`}
        alt="avatar"
        className="h-6 w-6 rounded-full border border-white/10"
      />
      <div>
        <div className="text-xs">
          <span className="font-medium">@{username}</span>{" "}
          <span className="text-white/80">{text}</span>
        </div>
      </div>
    </div>
  );
}

/** Utilities */
function buildThresholdList(steps = 20) {
  return Array.from({ length: steps }, (_, i) => (i + 1) / steps);
}

function formatCompact(num) {
  try {
    return new Intl.NumberFormat(undefined, { notation: "compact" }).format(
      num
    );
  } catch {
    return String(num);
  }
}

/** Styles */
const style = document.createElement("style");
style.textContent = `
  .no-scrollbar { scrollbar-width: none; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  @media (max-width: 640px) {
    .snap-center { height: 100vh; }
    .snap-center > div { height: 100%; max-height: 100vh; border-radius: 0; }
    video { object-fit: cover; }
  }
`;
document.head.appendChild(style);

export default ReelsPage;