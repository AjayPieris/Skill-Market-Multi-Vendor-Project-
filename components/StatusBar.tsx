"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Eye,
  Trash2,
} from "lucide-react";
import {
  createStatusAction,
  markStatusViewedAction,
  deleteStatusAction,
} from "@/app/actions/status";
import { useUploadThing } from "@/lib/uploadthing";

// ─── Types ──────────────────────────────────────────────────────────────────

interface StatusItem {
  id: string;
  mediaUrl: string;
  mediaType: string; // "image" | "video"
  caption: string | null;
  expiresAt: string;
  createdAt: string;
  viewedByMe: boolean;
  viewCount: number;
}

interface StatusUser {
  userId: string;
  name: string;
  image: string | null;
  isMe: boolean;
  hasUnseen: boolean;
  statuses: StatusItem[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function StatusBar({
  currentUserId,
}: {
  currentUserId: string;
}) {
  // Feed dialog
  const [feedOpen, setFeedOpen] = useState(false);
  const [feed, setFeed] = useState<StatusUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeUserIdx, setActiveUserIdx] = useState(0);
  const [activeStatusIdx, setActiveStatusIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  // Upload dialog
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { startUpload } = useUploadThing("statusMedia");

  // ── Fetch feed ────────────────────────────────────────────────────────────

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/statuses");
      const data = await res.json();
      setFeed(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch status feed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (feedOpen) fetchFeed();
  }, [feedOpen, fetchFeed]);

  // Has any followed user's unseen story
  const hasUnseenStatuses = feed.some((u) => !u.isMe && u.hasUnseen);

  // ── Viewer helpers ────────────────────────────────────────────────────────

  const activeUser = feed[activeUserIdx] ?? null;
  const activeStatus = activeUser?.statuses[activeStatusIdx] ?? null;

  const advanceStatus = useCallback(() => {
    const user = feed[activeUserIdx];
    if (!user) return;

    if (activeStatusIdx < user.statuses.length - 1) {
      setActiveStatusIdx((i) => i + 1);
      setProgress(0);
    } else if (activeUserIdx < feed.length - 1) {
      // jump to next user that has statuses
      let nextIdx = activeUserIdx + 1;
      while (nextIdx < feed.length && feed[nextIdx].statuses.length === 0) {
        nextIdx++;
      }
      if (nextIdx < feed.length) {
        setActiveUserIdx(nextIdx);
        setActiveStatusIdx(0);
        setProgress(0);
      } else {
        setViewerOpen(false);
      }
    } else {
      setViewerOpen(false);
    }
  }, [feed, activeUserIdx, activeStatusIdx]);

  const goBack = () => {
    if (activeStatusIdx > 0) {
      setActiveStatusIdx((i) => i - 1);
      setProgress(0);
    } else if (activeUserIdx > 0) {
      let prevIdx = activeUserIdx - 1;
      while (prevIdx >= 0 && feed[prevIdx].statuses.length === 0) prevIdx--;
      if (prevIdx >= 0) {
        const prevUser = feed[prevIdx];
        setActiveUserIdx(prevIdx);
        setActiveStatusIdx(prevUser.statuses.length - 1);
        setProgress(0);
      }
    }
  };

  // Auto-progress timer (images only — videos advance on `onEnded`)
  useEffect(() => {
    if (!viewerOpen || !activeStatus) return;
    if (activeStatus.mediaType === "video") return;

    setProgress(0);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    progressTimerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressTimerRef.current!);
          advanceStatus();
          return 0;
        }
        return p + 2; // 100 steps × 100 ms = 5 s per image
      });
    }, 100);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerOpen, activeUserIdx, activeStatusIdx]);

  const openViewer = (userIdx: number, statusIdx = 0) => {
    setActiveUserIdx(userIdx);
    setActiveStatusIdx(statusIdx);
    setProgress(0);
    setViewerOpen(true);
    setFeedOpen(false);

    // Fire-and-forget: mark as viewed
    const user = feed[userIdx];
    if (user && !user.isMe) {
      const status = user.statuses[statusIdx];
      if (status && !status.viewedByMe) {
        markStatusViewedAction(status.id).then(() => fetchFeed());
      }
    }
  };

  // ── Upload helpers ────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const res = await startUpload([selectedFile]);
      const fileUrl = res?.[0]?.url;
      if (!fileUrl)
        throw new Error(
          "Upload failed — no URL returned. Check file size/type.",
        );
      const mediaType = selectedFile.type.startsWith("video")
        ? "video"
        : "image";
      await createStatusAction(fileUrl, mediaType, caption.trim() || null);
      // success — reset and close
      setUploadOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");
      setUploadError(null);
      fetchFeed();
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteStatus = async (statusId: string) => {
    await deleteStatusAction(statusId);
    advanceStatus();
    fetchFeed();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── NAVBAR ICON BUTTON ── */}
      <button
        onClick={() => setFeedOpen(true)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
        title="Stories / Status"
      >
        <Clapperboard className="h-5 w-5 text-gray-600" />
        {hasUnseenStatuses && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full border border-white" />
        )}
      </button>

      {/* ── FEED DIALOG ── */}
      <Dialog.Root open={feedOpen} onOpenChange={setFeedOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[60]" />
          <Dialog.Content
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 outline-none"
            aria-describedby={undefined}
          >
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-bold">Stories</Dialog.Title>
              <div className="flex items-center gap-2">
                {/* Always-visible Add Story button */}
                <button
                  onClick={() => setUploadOpen(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Story
                </button>
                <Dialog.Close className="p-1 rounded-full hover:bg-gray-100 transition">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : (
              <div className="flex gap-5 overflow-x-auto pb-3 snap-x">
                {/* Own status bubble */}
                {feed
                  .filter((u) => u.isMe)
                  .map((u) => (
                    <div
                      key={u.userId}
                      className="flex-none flex flex-col items-center gap-1 snap-start"
                    >
                      <button
                        onClick={() => {
                          if (u.statuses.length > 0) {
                            openViewer(feed.indexOf(u));
                          } else {
                            // Open upload dialog on top — do NOT close the feed dialog
                            // (closing & opening simultaneously causes Radix race condition)
                            setUploadOpen(true);
                          }
                        }}
                        className="relative"
                      >
                        {/* Ring */}
                        <div
                          className={`w-16 h-16 rounded-full p-0.5 ${
                            u.statuses.length > 0
                              ? "bg-gradient-to-tr from-blue-400 to-purple-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                            {u.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={u.image}
                                alt={u.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                                {u.name?.[0]?.toUpperCase() ?? "?"}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* + badge */}
                        <span className="absolute bottom-0 right-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white text-white">
                          <Plus className="h-3 w-3" />
                        </span>
                      </button>
                      <span className="text-xs text-gray-500 max-w-[64px] truncate text-center">
                        Your Story
                      </span>
                    </div>
                  ))}

                {/* Following users */}
                {feed
                  .filter((u) => !u.isMe && u.statuses.length > 0)
                  .map((u) => (
                    <div
                      key={u.userId}
                      className="flex-none flex flex-col items-center gap-1 snap-start"
                    >
                      <button
                        onClick={() => openViewer(feed.indexOf(u))}
                        className="relative"
                      >
                        <div
                          className={`w-16 h-16 rounded-full p-0.5 ${
                            u.hasUnseen
                              ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                              : "bg-gray-300"
                          }`}
                        >
                          <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                            {u.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={u.image}
                                alt={u.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                                {u.name?.[0]?.toUpperCase() ?? "?"}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                      <span className="text-xs text-gray-500 max-w-[64px] truncate text-center">
                        {u.name}
                      </span>
                    </div>
                  ))}

                {/* Empty state */}
                {feed.filter((u) => !u.isMe && u.statuses.length > 0).length ===
                  0 && (
                  <div className="flex-1 flex items-center justify-center py-6 text-sm text-gray-400">
                    No stories from people you follow yet.
                  </div>
                )}
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── STORY VIEWER ── */}
      <Dialog.Root open={viewerOpen} onOpenChange={setViewerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/90 z-[70]" />
          <Dialog.Content
            className="fixed inset-0 z-[70] flex items-center justify-center outline-none"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">Story Viewer</Dialog.Title>

            {activeUser && activeStatus && (
              <div
                className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden bg-black"
                style={{ height: "80vh" }}
              >
                {/* ── Progress bars ── */}
                <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
                  {activeUser.statuses.map((s, i) => (
                    <div
                      key={s.id}
                      className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full bg-white rounded-full"
                        style={{
                          width:
                            i < activeStatusIdx
                              ? "100%"
                              : i === activeStatusIdx
                                ? `${progress}%`
                                : "0%",
                          transition:
                            i === activeStatusIdx
                              ? "width 100ms linear"
                              : "none",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* ── Header ── */}
                <div className="absolute top-6 left-2 right-2 z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white flex-none">
                      {activeUser.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={activeUser.image}
                          alt={activeUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-500 flex items-center justify-center text-white text-sm font-bold">
                          {activeUser.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-white text-sm font-semibold drop-shadow">
                      {activeUser.isMe ? "Your Story" : activeUser.name}
                    </span>
                    <span className="text-white/60 text-xs">
                      {new Date(activeStatus.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeUser.isMe && (
                      <button
                        onClick={() => handleDeleteStatus(activeStatus.id)}
                        className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
                        title="Delete this story"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <Dialog.Close className="text-white p-1 rounded-full hover:bg-white/10 transition">
                      <X className="h-5 w-5" />
                    </Dialog.Close>
                  </div>
                </div>

                {/* ── Media ── */}
                {activeStatus.mediaType === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeStatus.mediaUrl}
                    alt="story"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    key={activeStatus.id} // remount for each new status
                    src={activeStatus.mediaUrl}
                    className="w-full h-full object-contain"
                    autoPlay
                    playsInline
                    onTimeUpdate={(e) => {
                      const v = e.currentTarget;
                      if (v.duration)
                        setProgress((v.currentTime / v.duration) * 100);
                    }}
                    onEnded={advanceStatus}
                  />
                )}

                {/* ── Caption ── */}
                {activeStatus.caption && (
                  <div className="absolute bottom-10 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-xl p-3 text-white text-sm">
                    {activeStatus.caption}
                  </div>
                )}

                {/* ── View count (own stories) ── */}
                {activeUser.isMe && (
                  <div className="absolute bottom-3 left-4 flex items-center gap-1 text-white/60 text-xs">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{activeStatus.viewCount} views</span>
                  </div>
                )}

                {/* ── Navigation side buttons ── */}
                <button
                  onClick={goBack}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 transition z-10"
                  aria-label="Previous story"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={advanceStatus}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 transition z-10"
                  aria-label="Next story"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* ── Invisible tap zones (left = back, right = advance) ── */}
                <div
                  onClick={goBack}
                  className="absolute left-0 top-0 w-1/3 h-full z-[5] cursor-pointer"
                />
                <div
                  onClick={advanceStatus}
                  className="absolute right-0 top-0 w-1/3 h-full z-[5] cursor-pointer"
                />
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── UPLOAD / ADD STORY DIALOG ── */}
      <Dialog.Root
        open={uploadOpen}
        onOpenChange={(o) => {
          if (!o) {
            setSelectedFile(null);
            setPreviewUrl(null);
            setCaption("");
            setUploadError(null);
          }
          setUploadOpen(o);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[80]" />
          <Dialog.Content
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 outline-none"
            aria-describedby={undefined}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <Dialog.Title className="text-lg font-bold mb-1">
                Add to Your Story
              </Dialog.Title>
              <p className="text-xs text-gray-400 mb-4">
                Visible to your followers for 24 hours
              </p>

              {/* Drop zone / Preview */}
              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl h-52 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                >
                  <Plus className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">
                    Click to pick a photo or video
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Image ≤ 8 MB · Video ≤ 64 MB (≈30 s)
                  </p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden h-52 bg-black">
                  {selectedFile?.type.startsWith("video") ? (
                    <video
                      src={previewUrl}
                      className="w-full h-full object-contain"
                      controls
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="w-full h-full object-contain"
                    />
                  )}
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Caption */}
              <input
                type="text"
                placeholder="Add a caption... (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={150}
                className="mt-3 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
              />

              {/* Error message */}
              {uploadError && (
                <p className="mt-3 text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {uploadError}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Dialog.Close className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </Dialog.Close>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {uploading ? "Uploading..." : "Share Story"}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
