import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function App() {
  const [batteries, setBatteries] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      const liveData = [];

      for (let i = 1; i <= 10; i++) {
        liveData.push({
          id: `B${i}`,
          voltage: Number((Math.random() * 5 + 8).toFixed(2)),
        });
      }

      setBatteries(liveData);
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, []);

  const totalVoltage = batteries.reduce(
    (sum, battery) => sum + Number(battery.voltage || 0),
    0,
  );

  const alerts = batteries.filter(
    (battery) => battery.voltage < 8.75 || battery.voltage > 12.5,
  );

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(batteries);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Battery Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, "Battery_Report.xlsx");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "25px",
        fontFamily: "Arial",
        color: "white",
        background:
          "linear-gradient(135deg, #001f14, #003d29, #006b45, #001f14)",
      }}
    >
      <div
        style={{
          padding: "25px",
          borderRadius: "20px",
          background: "rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          boxShadow: "0 8px 32px rgba(0, 255, 120, 0.25)",
        }}
      >
        <h1>🔋 Battery Monitoring Dashboard</h1>

        <h2>Total Voltage: {totalVoltage.toFixed(2)}V</h2>

        <h3 style={{ color: "#00ff88" }}>🟢 System Status: ONLINE</h3>

        <p>Last Updated: {new Date().toLocaleTimeString()}</p>

        <button
          onClick={downloadExcel}
          style={{
            padding: "12px 22px",
            margin: "15px 0",
            cursor: "pointer",
            background: "linear-gradient(135deg, #00ff88, #00b865)",
            color: "#002b1a",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            boxShadow: "0 0 15px rgba(0, 255, 136, 0.7)",
          }}
        >
          📥 Download Excel Report
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "18px",
            marginTop: "20px",
          }}
        >
          {batteries.map((battery) => {
            let status = "OK";
            let color = "#00ff88";

            if (battery.voltage < 8.75) {
              status = "UNDER";
              color = "#ff4d4d";
            } else if (battery.voltage > 12.5) {
              status = "OVER";
              color = "#ffb300";
            }

            return (
              <div
                key={battery.id}
                style={{
                  padding: "18px",
                  textAlign: "center",
                  borderRadius: "18px",
                  background: "rgba(255, 255, 255, 0.14)",
                  backdropFilter: "blur(12px)",
                  border: `2px solid ${color}`,
                  boxShadow: `0 0 20px ${color}`,
                }}
              >
                <h3>{battery.id}</h3>
                <h2>{battery.voltage}V</h2>
                <h4 style={{ color }}>{status}</h4>
              </div>
            );
          })}
        </div>

        <h2 style={{ marginTop: "35px" }}>⚠ Alerts</h2>

        <div
          style={{
            padding: "15px",
            borderRadius: "15px",
            background: "rgba(255, 255, 255, 0.12)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
          }}
        >
          {alerts.length === 0 ? (
            <p style={{ color: "#00ff88" }}>No alerts. All batteries normal.</p>
          ) : (
            alerts.map((battery) => (
              <p key={battery.id} style={{ color: "#ff8080" }}>
                {battery.id} -{" "}
                {battery.voltage < 8.75 ? "UNDER VOLTAGE" : "OVER VOLTAGE"}
              </p>
            ))
          )}
        </div>

        <h2 style={{ marginTop: "35px" }}>📊 Battery Voltage Graph</h2>

        <div
          style={{
            width: "100%",
            height: 350,
            minHeight: 350,
            padding: "15px",
            borderRadius: "18px",
            background: "rgba(255, 255, 255, 0.14)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={batteries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff55" />
              <XAxis dataKey="id" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip />
              <Bar dataKey="voltage" fill="#00ff88" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default App;
