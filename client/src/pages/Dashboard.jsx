import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authHeader, clearToken, getToken } from "../services/authService";
import ChapterAccordion from "../components/ChapterAccordion";
import useProgressStore from "../stores/progressStore";
import {
  FaUser,
  FaSignOutAlt,
  FaFilter,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaBookOpen,
  FaSearch,
} from "react-icons/fa";

export default function Dashboard() {
  const [chapters, setChapters] = useState([]);
  const [filteredChapters, setFilteredChapters] = useState([]);
  const [message, setMessage] = useState("Loading dashboard...");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [levelFilter, setLevelFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [progressStats, setProgressStats] = useState({
    totalProblems: 0,
    completedProblems: 0,
    completionPercentage: 0,
  });
  const navigate = useNavigate();
  const completedProblems = useProgressStore((state) => state.completedProblems);

  const calculateProgressStats = (chaptersData) => {
    const { isCompleted } = useProgressStore.getState();
    let totalProblems = 0;
    let completedProblems = 0;

    chaptersData.forEach((chapter) => {
      chapter.topics.forEach((topic) => {
        topic.problems.forEach((problem) => {
          totalProblems++;
          if (isCompleted(problem.id)) {
            completedProblems++;
          }
        });
      });
    });

    const completionPercentage =
      totalProblems > 0
        ? Math.round((completedProblems / totalProblems) * 100)
        : 0;

    setProgressStats({
      totalProblems,
      completedProblems,
      completionPercentage,
    });
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [protectedRes, chaptersRes] = await Promise.all([
          axios.get("/api/protected", { headers: authHeader() }),
          axios.get("/api/chapters", { headers: authHeader() }),
        ]);

        setMessage(protectedRes.data.message);
        setUser(protectedRes.data.user);
        setChapters(chaptersRes.data);

        // Load user progress
        await useProgressStore.getState().loadProgress();

        // Calculate progress stats
        calculateProgressStats(chaptersRes.data);
      } catch (err) {
        clearToken();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    if (getToken()) {
      fetchData();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (filteredChapters.length > 0 || chapters.length > 0) {
      calculateProgressStats(filteredChapters.length > 0 ? filteredChapters : chapters);
    }
  }, [completedProblems]);

  useEffect(() => {
    let filtered = chapters;

    // Apply level filter
    if (levelFilter !== "all") {
      filtered = chapters
        .map((chapter) => ({
          ...chapter,
          topics: chapter.topics
            .map((topic) => ({
              ...topic,
              problems: topic.problems.filter(
                (problem) =>
                  problem.level.toLowerCase() === levelFilter.toLowerCase(),
              ),
            }))
            .filter((topic) => topic.problems.length > 0),
        }))
        .filter((chapter) => chapter.topics.length > 0);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered
        .map((chapter) => ({
          ...chapter,
          topics: chapter.topics
            .map((topic) => ({
              ...topic,
              problems: topic.problems.filter(
                (problem) =>
                  problem.title.toLowerCase().includes(query) ||
                  problem.level.toLowerCase().includes(query),
              ),
            }))
            .filter((topic) => topic.problems.length > 0),
        }))
        .filter((chapter) => chapter.topics.length > 0);
    }

    setFilteredChapters(filtered);
    calculateProgressStats(filtered);
  }, [chapters, levelFilter, searchQuery]);

  function handleLogout() {
    clearToken();
    useProgressStore.getState().clearProgress();
    navigate("/login");
  }

  return (
    <div className="page-shell">
      <div className="dashboard-container">
        {/* Enhanced Header */}
        <div className="dashboard-header-card">
          <div className="header-content">
            <div className="header-text">
              <h1>
                <FaBookOpen className="header-icon" />
                DSA Interview Prep
              </h1>
              <p className="welcome-message">
                Welcome back, {user?.username || "User"}! {message}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="logout-button"
              title="Logout"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Progress Overview Cards */}
        {!loading && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FaChartLine />
              </div>
              <div className="stat-content">
                <h3>{progressStats.completionPercentage}%</h3>
                <p>Overall Progress</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressStats.completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaCheckCircle />
              </div>
              <div className="stat-content">
                <h3>{progressStats.completedProblems}</h3>
                <p>Problems Solved</p>
                <span className="stat-subtitle">
                  of {progressStats.totalProblems} total
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaClock />
              </div>
              <div className="stat-content">
                <h3>
                  {progressStats.totalProblems -
                    progressStats.completedProblems}
                </h3>
                <p>Remaining</p>
                <span className="stat-subtitle">problems to solve</span>
              </div>
            </div>
          </div>
        )}

        {/* Controls Section */}
        {!loading && chapters.length > 0 && (
          <div className="controls-section">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-controls">
              <FaFilter className="filter-icon" />
              <label>
                <span>Difficulty:</span>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="level-filter"
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="tough">Tough</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {/* Chapters List */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your DSA journey...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="error-message">{error}</p>
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="empty-state">
            <FaBookOpen className="empty-icon" />
            <h3>No problems found</h3>
            <p>
              {levelFilter === "all" && !searchQuery
                ? "No chapters available yet."
                : `No ${levelFilter !== "all" ? levelFilter : ""} problems match your search${searchQuery ? ` for "${searchQuery}"` : ""}.`}
            </p>
          </div>
        ) : (
          <div className="chapters-section">
            <h2 className="section-title">
              Chapters ({filteredChapters.length})
            </h2>
            <div className="chapters-list">
              {filteredChapters.map((chapter) => (
                <ChapterAccordion key={chapter.id} chapter={chapter} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
