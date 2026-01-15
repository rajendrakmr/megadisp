// import { useState, useEffect } from "react";
// import axios from "axios";
// import "./App.css";

// const API_URL = "http://localhost:3001/api/megawatt";

// //const API_URL = "/api/megawatt";

// //const API_URL = "http://172.16.0.59:3001/api/megawatt";


// function App() {
//   const [data, setData] = useState(null);
//   const [source, setSource] = useState("ABT");
//   const [error, setError] = useState("");

//   const fetchData = async () => {
//     try {
//       const res = await axios.post(API_URL, { source });
//       if (res.data.errorFlag === "F") {
//         setData(res.data);
//         setError("");
//       } else {
//         setError(res.data.error || "Unknown error from backend");
//         setData(null);
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch data from backend");
//       setData(null);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(fetchData, 15000); 
//     const reloadTimeout = setTimeout(() => window.location.reload(), 60000); 
//     return () => {
//       clearInterval(interval);
//       clearTimeout(reloadTimeout);
//     };
//   }, []);

//   if (error) return <div className="error-msg">Error: {error}</div>;
//   if (!data) return <div className="loading-msg">Loading...</div>;

//   return (
//     <div className="app-container">
//       <div className="header">THE DURGAPUR PROJECTS LIMITED</div>
//       <div className="sub-header">Live Power Monitoring Dashboard</div>

//       <div className="source-box">
//         Source: <span className="source-label">{source.charAt(0)}</span>
//       </div>

//       <div className="live">
//         <div className="live-dot"></div> LIVE GENERATION DATA
//       </div>

//       {/* Top Info Table */}
//       <table className="info-table">
//         <tbody>
//           <tr>
//             <th>Date</th>
//             <td><label className="info-label">{data.reading_date}</label></td>
//             <th>Time</th>
//             <td><label className="info-label">{data.reading_time}</label></td>
//             <th>Frequency (Hz)</th>
//             <td><label className="info-label">{data.frequency}</label></td>
//           </tr>
//         </tbody>
//       </table>

//       {/* Main Data Table */}
//       <table className="main-table">
//         <tbody>
//           <tr>
//             <th>Unit</th><th>Generation (MW)</th>
//             <th>Block</th><td><label className="total-val" id="eight">{data.block_no}</label></td>
//           </tr>
//           <tr>
//             <th>#7</th><td><label className="total-val" id="eight">{data.seven}</label></td>
//             <th>DC (MW)</th><td><label className="total-val" id="eight">{data.dc_sch}</label></td>
//           </tr>
//           <tr>
//             <th>#8</th><td><label className="total-val" id="eight">{data.eight}</label></td>
//             <th>SG (MW)</th><td><label className="total-val" id="sg_sch">{data.sg_sch}</label></td>
//           </tr>
//           <tr>
//             <th>Total</th><td><label className="total-val">{data.total}</label></td>
//             <th>AG (MW)</th><td><label className="total-val" id="eight">{data.act_sent_out}</label></td>
//           </tr>
//         </tbody>
//       </table>

//       {/* Info Bar */}
//       <div className="info-bar">
//         <marquee scrollamount="6">
//           EVER HIGHEST YEARLY GENERATION (2024-25)(80.68% PLF) → 3887MU |
//           LOWEST ACHIEVED APC (2024-25) → 10.31% |
//           HIGHEST RAKES RECEIVED (2024-25) → 695 Nos |
//           HIGHEST MONTHLY RAKES (MARCH'25) → 95 Nos
//         </marquee>
//       </div>

//       {/* Footer Bar */}
//       <div className="footer-bar">
//         <marquee scrollamount="8">
//           Happiness in life is Ultimate Treasure, Do your job taking SAFETY Measure... 
//           Work with pride, put safety in every stride...
//           <span className="bengali-text">
//             সুরক্ষা নিশ্চিত হলে কাজে আসে গতি, নিরাপদ উৎপাদনে হয় জাতীয় প্রগতি।।
//           </span>
//         </marquee>
//       </div>
//     </div>
//   );
// }

// export default App;



import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:3001/api/megawatt";
// const API_URL = "/api/megawatt";
// const API_URL = "http://172.16.0.59:3001/api/megawatt";

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      // ✅ Do not send source in POST; backend decides
      const res = await axios.post(API_URL);
      if (res.data.errorFlag === "F") {
        setData(res.data);
        setError("");
      } else {
        setError(res.data.error || "Unknown error from backend");
        setData(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data from backend");
      setData(null);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    const reloadTimeout = setTimeout(() => window.location.reload(), 60000);
    return () => {
      clearInterval(interval);
      clearTimeout(reloadTimeout);
    };
  }, []);

  if (error) return <div className="error-msg">Error: {error}</div>;
  if (!data) return <div className="loading-msg">Loading...</div>;

  return (
    <div className="app-container">
      <div className="header">THE DURGAPUR PROJECTS LIMITED</div>
      <div className="sub-header">Live Power Monitoring Dashboard</div>

      {/* ✅ Show source from backend */}
      <div className="source-box">
        Source: <span className="source-label">{data.source.charAt(0)}</span>
      </div>

      <div className="live">
        <div className="live-dot"></div> LIVE GENERATION DATA
      </div>

      {/* Top Info Table */}
      <table className="info-table">
        <tbody>
          <tr>
            <th>Date</th>
            <td><label className="info-label">{data.reading_date}</label></td>
            <th>Time</th>
            <td><label className="info-label">{data.reading_time}</label></td>
            <th>Frequency (Hz)</th>
            <td><label className="info-label">{data.frequency}</label></td>
          </tr>
        </tbody>
      </table>

      {/* Main Data Table */}
      <table className="main-table">
        <tbody>
          <tr>
            <th>Unit</th><th>Generation (MW)</th>
            <th>Block</th><td><label className="total-val" id="eight">{data.block_no}</label></td>
          </tr>
          <tr>
            <th>#7</th><td><label className="total-val" id="eight">{data.seven}</label></td>
            <th>DC (MW)</th><td><label className="total-val" id="eight">{data.dc_sch}</label></td>
          </tr>
          <tr>
            <th>#8</th><td><label className="total-val" id="eight">{data.eight}</label></td>
            <th>SG (MW)</th><td><label className="total-val" id="sg_sch">{data.sg_sch}</label></td>
          </tr>
          <tr>
            <th>Total</th><td><label className="total-val">{data.total}</label></td>
            <th>AG (MW)</th><td><label className="total-val" id="eight">{data.act_sent_out}</label></td>
          </tr>
        </tbody>
      </table>

      {/* Info Bar */}
      <div className="info-bar">
        <marquee scrollamount="6">
          EVER HIGHEST YEARLY GENERATION (2024-25)(80.68% PLF) → 3887MU |
          LOWEST ACHIEVED APC (2024-25) → 10.31% |
          HIGHEST RAKES RECEIVED (2024-25) → 695 Nos |
          HIGHEST MONTHLY RAKES (MARCH'25) → 95 Nos
        </marquee>
      </div>

      {/* Footer Bar */}
      <div className="footer-bar">
        <marquee scrollamount="8">
          Happiness in life is Ultimate Treasure, Do your job taking SAFETY Measure... 
          Work with pride, put safety in every stride...
          <span className="bengali-text">
            সুরক্ষা নিশ্চিত হলে কাজে আসে গতি, নিরাপদ উৎপাদনে হয় জাতীয় প্রগতি।।
          </span>
        </marquee>
      </div>
    </div>
  );
}

export default App;
