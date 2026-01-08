import "./admit-card.css";
import logo from "@/assets/logo.png";

export default function AdmitCard({ user }: any) {
  return (
    <div className="admit-card mx-auto">

      {/* HEADER */}
      <div className="header">
        <div className="logo">
          <img src={logo} alt="XPrepPG" />
        </div>
        <div className="title">
          <h1>XPREPPG PRACTICE TEST HALL TICKET</h1>
          <h2>FOR NEET PG 2026</h2>
          <h3>HALL TICKET</h3>
        </div>
      </div>

      {/* BASIC INFO */}
      <div className="info-section">
        <div className="info-left">
          <Row label="Application Number" value={user.applicationNo || user._id?.slice(-6)} />
          <Row label="Roll Number" value={user.rollNo || "AUTO-GENERATED"} />
          <Row label="Password" value="****" />
          <Row label="Candidate Name" value={user.name} />
          <Row label="Date of Birth" value={user.dob || "-"} />
          <Row label="Nationality" value="Indian" />
        </div>

        <div className="photo-box">
          {user.photo ? (
            <img src={user.photo} alt="Student Photo" className="w-28 object-contain" />
          ) : (
            <span>Student Passport Size Photo</span>
          )}
        </div>
      </div>

      {/* EXAM DETAILS */}
      <div className="exam-section">
        <Row label="Exam Date" value="Tuesday, 13/01/2026" bold />

        <Row
          label="Examination Centre"
          value={
            <>
              <div><b>LATUR – COSS INSTITUTE OF COMPUTER EDUCATION</b></div>
              <div>Near MS Bidve Engineering College</div>
              <div>Barshi Road, Harangul (BK), Latur</div>
              <div className="landmark">
                Landmark: Near MS Bidve Engineering College
              </div>
            </>
          }
        />

        <Row label="Centre Code" value="LTR001" />

        <Row
          label="Google Map Link"
          value={
            <a
              href="https://maps.google.com/?q=COSS+Institute+Latur"
              target="_blank"
              rel="noreferrer"
              className="map-link"
            >
              Click here to go to the location of your examination centre on Google Maps
            </a>
          }
        />

        <div className="timing-box">
          <div><b>Reporting at Examination Centre Starts at:</b> 12:00 PM</div>
          <div><b>Entry to Exam Centre Closes at:</b> 01:30 PM</div>
          <div><b>Examination Timings:</b> 02:00 PM to 05:30 PM</div>
        </div>

        <div className="warning">
          No entry in the exam centre after 01:30 PM under any circumstances.
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <p>
          <b>NOTE:</b> The admit card containing 1 page MUST be printed in
          <b> COLOR</b> on a single A4 size white paper.
        </p>

        <div className="signature">
          Candidate Signature
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: any) {
  return (
    <div className="row">
      <div className="label">{label}:</div>
      <div className={`value ${bold ? "bold" : ""}`}>
        {value}
      </div>
    </div>
  );
}
