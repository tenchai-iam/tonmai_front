import React, { useEffect, useState, useRef } from "react";
import { checkScenarioStatus } from "../../services/api_Scenario.js";
import "../../ComponentsStyles/ScenarioStatus.css";

const ScenarioStatusTracker = ({
  scenarioName,
  scenarioId,
  scenarioType = "budget",
  onComplete,
  onError
}) => {
  const [status, setStatus] = useState("starting");
  const [progress, setProgress] = useState(0);
  const [currentNotebook, setCurrentNotebook] = useState("");
  const [executionTime, setExecutionTime] = useState(0);
  const [error, setError] = useState(null);
  const [notebooksCompleted, setNotebooksCompleted] = useState([]);

  const pollIntervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const pollCountRef = useRef(0);

  useEffect(() => {
    if (!scenarioName) return;

    const pollStatus = async () => {
      try {
        const response = await checkScenarioStatus(scenarioName);

        setStatus(response.status || "running");
        setCurrentNotebook(response.current_notebook || "");

        // Calculate progress based on notebooks completed
        if (response.total_notebooks && response.notebooks_completed) {
          const progressPercent = (response.notebooks_completed.length / response.total_notebooks) * 100;
          setProgress(progressPercent);
          setNotebooksCompleted(response.notebooks_completed || []);
        }

        // Update execution time
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setExecutionTime(elapsed);

        // Increment poll count
        pollCountRef.current += 1;

        // Check if completed
        if (response.status === "completed") {
          clearInterval(pollIntervalRef.current);
          setProgress(100);
          console.log(`✅ Scenario ${scenarioName} completed successfully`);
          if (onComplete) {
            onComplete(response);
          }
          return;
        }

        // Check if failed
        if (response.status === "failed") {
          clearInterval(pollIntervalRef.current);
          const errorMsg = response.error || "Unknown error occurred";
          setError(errorMsg);
          console.error(`❌ Scenario ${scenarioName} failed:`, errorMsg);
          if (onError) {
            onError(response);
          }
          return;
        }

      } catch (err) {
        console.error("Status polling error:", err);

        // Don't stop polling on temporary errors, just log them
        // Only stop if we've tried many times
        if (pollCountRef.current > 100) {
          setError(err.message || "Failed to check status");
          clearInterval(pollIntervalRef.current);
          if (onError) {
            onError({ error: err.message });
          }
        }
      }
    };

    // Smart polling intervals
    const getPollingInterval = () => {
      const pollCount = pollCountRef.current;

      // First minute: poll every 2 seconds
      if (pollCount < 30) return 2000;

      // Next 2 minutes: poll every 3 seconds
      if (pollCount < 70) return 3000;

      // After 3 minutes: poll every 5 seconds
      return 5000;
    };

    // Initial poll immediately
    pollStatus();

    // Set up smart polling with dynamic interval
    const setupPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      pollIntervalRef.current = setInterval(() => {
        pollStatus();
        // Adjust interval based on poll count
        setupPolling();
      }, getPollingInterval());
    };

    setupPolling();

    // Cleanup
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [scenarioName, onComplete, onError]);

  const getStatusIcon = () => {
    switch (status) {
      case "running":
        return "🔄";
      case "starting":
      case "created_and_started":
        return "⏳";
      case "completed":
        return "✅";
      case "failed":
        return "❌";
      default:
        return "⏳";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "running":
        return "กำลังประมวลผล";
      case "starting":
      case "created_and_started":
        return "กำลังเริ่มต้น";
      case "completed":
        return "สำเร็จ";
      case "failed":
        return "เกิดข้อผิดพลาด";
      default:
        return "กำลังเตรียมการ";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "#28a745";
      case "failed":
        return "#dc3545";
      case "running":
        return "#007bff";
      default:
        return "#6c757d";
    }
  };

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds} วินาที`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} นาที ${remainingSeconds} วินาที`;
  };

  const getScenarioTypeLabel = () => {
    switch (scenarioType) {
      case "budget":
        return "งบประมาณ";
      case "risk":
        return "ความเสี่ยง SAIFI";
      case "regional":
        return "งบประมาณแยกตามเขต";
      default:
        return "ทั่วไป";
    }
  };

  return (
    <div className="scenario-status-tracker">
      <div className="status-header">
        <span className="status-icon" style={{ color: getStatusColor() }}>
          {getStatusIcon()}
        </span>
        <div className="status-header-text">
          <span className="status-text">{getStatusText()}</span>
          <span className="scenario-type-badge">{getScenarioTypeLabel()}</span>
        </div>
      </div>

      <div className="status-details">
        <div className="status-detail-row">
          <span className="detail-label">Scenario ID:</span>
          <span className="detail-value">{scenarioId}</span>
        </div>
        <div className="status-detail-row">
          <span className="detail-label">Scenario Name:</span>
          <span className="detail-value">{scenarioName}</span>
        </div>
        <div className="status-detail-row">
          <span className="detail-label">เวลาที่ใช้:</span>
          <span className="detail-value">{formatTime(executionTime)}</span>
        </div>
        {currentNotebook && status === "running" && (
          <div className="status-detail-row">
            <span className="detail-label">Notebook ปัจจุบัน:</span>
            <span className="detail-value current-notebook">{currentNotebook}</span>
          </div>
        )}
        {notebooksCompleted.length > 0 && (
          <div className="status-detail-row">
            <span className="detail-label">Notebooks เสร็จแล้ว:</span>
            <span className="detail-value">{notebooksCompleted.join(", ")}</span>
          </div>
        )}
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              backgroundColor: getStatusColor()
            }}
          >
            {progress > 10 && (
              <span className="progress-inner-text">{Math.round(progress)}%</span>
            )}
          </div>
        </div>
        <span className="progress-text">{Math.round(progress)}%</span>
      </div>

      {error && (
        <div className="error-message">
          <strong>⚠️ ข้อผิดพลาด:</strong>
          <p>{error}</p>
        </div>
      )}

      {status === "completed" && (
        <div className="success-message">
          <strong>✅ สร้างแผนสำเร็จ!</strong>
          <p>แผนพร้อมใช้งานแล้ว กรุณาเลือกจากรายการแผนด้านล่าง</p>
        </div>
      )}
    </div>
  );
};

export default ScenarioStatusTracker;
