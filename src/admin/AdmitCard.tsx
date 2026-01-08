import "./admit-card.css";
import logo from "@/assets/logo.png";

export default function AdmitCard({ user }: any) {
  // 🔐 Password logic
  const namePart = user.name
    ? user.name.replace(/\s+/g, "").substring(0, 4).toUpperCase()
    : "XXXX";

  const phonePart = user.mobile
    ? user.mobile.slice(-4)
    : "0000";

  const password = `${namePart}${phonePart}`;

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
          <Row
            label="Application Number"
            value={user.applicationNo || user._id?.slice(-6)}
          />
          <Row label="Roll Number" value={user.rollNo || "AUTO-GENERATED"} />
          <Row label="Password" value={password} />
          <Row label="Candidate Name" value={user.name} />
        </div>

        {/* PHOTO */}
        <div className="photo-box">
          {user.photo ? (
            <img
              src={user.photo}
              alt="Student Photo"
              className="w-28 object-contain"
            />
          ) : (
            <span>Student Passport Size Photo</span>
          )}
        </div>
      </div>

      {/* EXAM DETAILS */}
      <div className="exam-section">
        <Row label="Exam Date" value="13/01/2026" bold />

        {renderCentreDetails(user.city)}

        {/* TIMING */}
        <div className="timing-box">
          <div>
            <b>Entry to Exam Centre Closes at:</b> 01:45 PM
          </div>
          <div>
            <b>Examination Timings:</b> 02:00 PM to 05:30 PM
          </div>
        </div>

        <div className="warning">
          No entry in the exam centre after 01:45 PM under any circumstances.
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <p>
          <b>NOTE:</b> Only <b>XEROX COPY</b> of the admit card is required.
        </p>

        <div className="signature">
          Candidate Signature
        </div>
      </div>
    </div>
  );
}

/* ================= CENTRE RENDERER ================= */

function renderCentreDetails(city: string) {
  if (city === "Sambhajinagar") {
    return (
      <>
        <Row
          label="Examination Centre"
          value={
            <>
              <div><b>Chh. Sambhajinagar – ByteZ's InfoTech</b></div>
              <div>Plot No.18, Surana Nagar</div>
              <div>Behind Hotel Yeshodeep & Silver Inn</div>
              <div>Jalna Road, Aurangabad</div>
              <div className="landmark">Landmark: Near Hotel Yeshodeep</div>
            </>
          }
        />
        <Row label="Centre Code" value="ChSam-0002" />
        <Row
          label="Google Map Link"
          value={
            <a
              href="https://maps.app.goo.gl/w3UZU1XAa36iWTYE6"
              target="_blank"
              rel="noreferrer"
              className="map-link"
            >
              Click here to go to the location of your examination centre on Google Maps
            </a>
          }
        />
      </>
    );
  }

  if (city === "Latur") {
    return (
      <>
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
      </>
    );
  }

  if (city === "Nagpur") {
    return (
      <>
        <Row
          label="Examination Centre"
          value={
            <>
              <div><b>Nagpur – Central India Nursing College</b></div>
              <div>Khasra No 25/1B, Mouza Lonara</div>
              <div>Lake Koradi Road, Lonara, Nagpur</div>
              <div className="landmark">Landmark: Near Lonara Lake</div>
            </>
          }
        />
        <Row label="Centre Code" value="N003" />
        <Row
          label="Google Map Link"
          value={
            <a
              href="https://maps.app.goo.gl/ZXC21M8nNF3fx94r7"
              target="_blank"
              rel="noreferrer"
              className="map-link"
            >
              Click here to go to the location of your examination centre on Google Maps
            </a>
          }
        />
      </>
    );
  }

  return null;
}

/* ================= ROW COMPONENT ================= */

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
