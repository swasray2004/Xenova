"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Users, Zap, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const commands: CommandItem[] = [
    {
      id: "campaign",
      label: "New Campaign",
      description: "Create an AI-powered campaign with natural language",
      icon: <Sparkles className="w-4 h-4" />,
      badge: "AI",
      action: () => {
        router.push("/campaign-studio");
        setOpen(false);
        setSearch("");
      },
    },
    {
      id: "customers",
      label: "View Customers",
      description: "Browse and manage your customer database",
      icon: <Users className="w-4 h-4" />,
      action: () => {
        router.push("/customers");
        setOpen(false);
        setSearch("");
      },
    },
    {
      id: "dashboard",
      label: "Dashboard",
      description: "View analytics and key metrics",
      icon: <Zap className="w-4 h-4" />,
      action: () => {
        router.push("/");
        setOpen(false);
        setSearch("");
      },
    },
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>      {/* Keyboard hint - bottom right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-40 hidden sm:block"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all shadow-sm"
        >
          <Command className="w-4 h-4 text-gray-600" />
          <span className="text-xs text-gray-600 font-inter">
            ⌘K
          </span>
        </motion.button>
      </motion.div>      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 mx-4"
          >
            <div className="rounded-xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="relative px-4 py-4 border-b border-gray-200">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search commands..."
                  autoFocus
                  className="w-full bg-transparent border-none pl-8 pr-4 py-2 text-sm text-gray-900 font-inter placeholder:text-gray-400 focus:outline-none"
                />
              </div>

              {/* Commands List */}
              <motion.div className="max-h-96 overflow-y-auto">
                {filtered.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-2"
                  >                    {filtered.map((cmd, idx) => (
                      <motion.button
                        key={cmd.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ x: 5 }}
                        onClick={cmd.action}
                        className="w-full flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left group"
                      >
                        <div className="flex-shrink-0 mt-1 text-gray-600 group-hover:text-indigo-600 transition-colors">
                          {cmd.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-syne font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {cmd.label}
                            </p>
                            {cmd.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-inter font-semibold bg-indigo-50 border border-indigo-200 text-indigo-600">
                                {cmd.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {cmd.description}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 py-8 text-center"
                  >
                    <p className="text-sm text-gray-500 font-inter">
                      No commands found
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Footer */}
              <motion.div className="border-t border-gray-200 px-4 py-3 text-xs text-gray-500 font-inter flex items-center justify-between">
                <span>
                  {filtered.length > 0 && (
                    <>
                      <span className="hidden sm:inline">↑↓ to navigate</span>
                      <span className="sm:hidden">•</span>
                    </>
                  )}
                </span>
                <span>ESC to close</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
