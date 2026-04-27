import { create } from "zustand";
import axios from "axios";
import { authHeader } from "../services/authService";

const useProgressStore = create((set, get) => {
  // Store for debounced API calls
  const pendingUpdates = {};
  const debounceTimers = {};

  return {
    completedProblems: new Set(),
    loading: false,
    error: null,

    // Load user's progress from API
    loadProgress: async () => {
      try {
        set({ loading: true, error: null });
        const response = await axios.get("/api/progress", {
          headers: authHeader(),
        });
        set({
          completedProblems: new Set(response.data.completedProblemIds),
          loading: false,
        });
      } catch (error) {
        console.error("Failed to load progress:", error);
        set({
          error: error.response?.data?.message || "Failed to load progress",
          loading: false,
        });
      }
    },

    // Toggle problem completion with immediate UI update and debounced API call
    toggleProblem: (problemId) => {
      const { completedProblems } = get();
      const currentlyCompleted = completedProblems.has(problemId);
      const newCompleted = !currentlyCompleted;

      // Update UI immediately (optimistic update)
      const newSet = new Set(completedProblems);
      if (newCompleted) {
        newSet.add(problemId);
      } else {
        newSet.delete(problemId);
      }
      set({ completedProblems: newSet });

      // Track pending update
      pendingUpdates[problemId] = newCompleted;

      // Clear existing timer for this problem
      if (debounceTimers[problemId]) {
        clearTimeout(debounceTimers[problemId]);
      }

      // Set new debounced API call
      debounceTimers[problemId] = setTimeout(async () => {
        try {
          await axios.patch(
            `/api/progress/${problemId}`,
            { completed: pendingUpdates[problemId] },
            { headers: authHeader() },
          );
          delete pendingUpdates[problemId];
        } catch (error) {
          console.error("Failed to update progress:", error);
          // Revert optimistic update on error
          const { completedProblems: current } = get();
          const revertSet = new Set(current);
          if (!pendingUpdates[problemId]) {
            revertSet.add(problemId);
          } else {
            revertSet.delete(problemId);
          }
          set({ completedProblems: revertSet });
          delete pendingUpdates[problemId];
        }
      }, 500);
    },

    // Check if problem is completed
    isCompleted: (problemId) => {
      return get().completedProblems.has(problemId);
    },

    // Clear progress (for logout)
    clearProgress: () => {
      set({ completedProblems: new Set(), loading: false, error: null });
    },
  };
});

export default useProgressStore;
