import { useState, useMemo } from "react";
import {
  FaYoutube,
  FaCode,
  FaFileAlt,
  FaCheckCircle,
  FaCircle,
} from "react-icons/fa";
import useProgressStore from "../stores/progressStore";

export default function ChapterAccordion({ chapter }) {
  const [expanded, setExpanded] = useState(false);
  const completedProblems = useProgressStore(
    (state) => state.completedProblems,
  );
  const toggleProblem = useProgressStore((state) => state.toggleProblem);

  const chapterProgress = useMemo(() => {
    let totalProblems = 0;
    let completedProblemsCount = 0;

    chapter.topics.forEach((topic) => {
      topic.problems.forEach((problem) => {
        totalProblems++;
        if (completedProblems.has(problem.id)) {
          completedProblemsCount++;
        }
      });
    });

    const percentage =
      totalProblems > 0
        ? Math.round((completedProblemsCount / totalProblems) * 100)
        : 0;
    return {
      totalProblems,
      completedProblems: completedProblemsCount,
      percentage,
    };
  }, [chapter, completedProblems]);

  return (
    <div className="chapter-card">
      <button
        type="button"
        className="chapter-header"
        onClick={() => setExpanded((open) => !open)}
      >
        <div className="chapter-info">
          <h2>{chapter.title}</h2>
          <p>{chapter.description}</p>
          <div className="chapter-progress">
            <div className="progress-text">
              <span>
                {chapterProgress.completedProblems} of{" "}
                {chapterProgress.totalProblems} problems
              </span>
              <span className="progress-percentage">
                {chapterProgress.percentage}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${chapterProgress.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="chapter-actions">
          <span className={`accordion-icon ${expanded ? "open" : ""}`}>▾</span>
        </div>
      </button>

      {expanded && (
        <div className="chapter-content">
          {chapter.topics.map((topic) => (
            <div key={topic.title} className="topic-block">
              <div className="topic-header">
                <h3>{topic.title}</h3>
                {topic.description && <p>{topic.description}</p>}
              </div>
              {topic.problems.length > 0 ? (
                topic.problems.map((problem) => (
                  <div key={problem.id} className="problem-row">
                    <label className="problem-checkbox">
                      <input
                        type="checkbox"
                        checked={completedProblems.has(problem.id)}
                        onChange={() => toggleProblem(problem.id)}
                      />
                      <span>{problem.title}</span>
                    </label>
                    <div className="problem-meta">
                      <span
                        className={`badge badge-${problem.level.toLowerCase()}`}
                      >
                        {problem.level}
                      </span>
                      <div className="link-list">
                        {problem.youtubeLink && (
                          <a
                            href={problem.youtubeLink}
                            target="_blank"
                            rel="noreferrer"
                            className="link-icon"
                            title="YouTube"
                          >
                            <FaYoutube />
                          </a>
                        )}
                        {problem.leetcodeLink && (
                          <a
                            href={problem.leetcodeLink}
                            target="_blank"
                            rel="noreferrer"
                            className="link-icon"
                            title="LeetCode"
                          >
                            <FaCode />
                          </a>
                        )}
                        {problem.codeforcesLink && (
                          <a
                            href={problem.codeforcesLink}
                            target="_blank"
                            rel="noreferrer"
                            className="link-icon"
                            title="Codeforces"
                          >
                            <FaCode />
                          </a>
                        )}
                        {problem.articleLink && (
                          <a
                            href={problem.articleLink}
                            target="_blank"
                            rel="noreferrer"
                            className="link-icon"
                            title="Article"
                          >
                            <FaFileAlt />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">
                  No problems available for this topic yet.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
