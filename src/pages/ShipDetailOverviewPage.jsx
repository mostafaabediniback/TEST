import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Building2,
  Check,
  ChevronRight,
  Copy,
  Heart,
  Image,
  MapPin,
  MessageSquarePlus,
  Navigation,
  Ship,
  X,
} from "lucide-react";
import { useShipDetailData } from "@/hooks/useShipDetailData";
import {
  detailDate,
  detailValue,
  getDetailVoyage,
  getVoyageProgress,
} from "@/lib/shipDetailView";
import { lngLatToTile } from "@/lib/mapTiles";
import "./ship-detail-overview.css";

const VoyageMap = lazy(() => import("@/components/ships/detail/VoyageMap"));
const tabs = [
  "Overview",
  "Port call log",
  "Vessel characteristics",
  "Ownership",
  "Performance insights",
  "Compliance",
  "In the news",
];

function Card({ title, children, className = "" }) {
  return (
    <section className={`vessel-card ${className}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function Fields({ rows }) {
  return (
    <dl className="vessel-fields">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value == null || value === "" ? "—" : value}</dd>
        </div>
      ))}
    </dl>
  );
}
function Flag({ ship }) {
  const code =
    ship.flag_code ??
    (String(ship.flag).toUpperCase() === "BAHAMAS" ? "BS" : null);
  if (code === "BS")
    return (
      <span
        className="vessel-bahamas-flag"
        role="img"
        aria-label="Bahamas flag"
      />
    );
  if (code && /^[A-Z]{2}$/i.test(code))
    return (
      <span aria-label={ship.flag}>
        {[...code.toUpperCase()]
          .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
          .join("")}
      </span>
    );
  return <Ship size={18} aria-label="Vessel" />;
}
function Empty({ children }) {
  return <div className="vessel-empty">{children}</div>;
}
function Modal({ title, onClose, children }) {
  const dialog = useRef(null);
  useEffect(() => {
    dialog.current.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="vessel-modal"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <header>
        <h2>{title}</h2>
        <button
          className="vessel-icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
function readPreferences(id) {
  try {
    const stored = JSON.parse(
      localStorage.getItem("vessel-detail:" + id) ?? "{}",
    );
    return {
      note: typeof stored?.note === "string" ? stored.note : "",
      inFleet: stored?.inFleet === true,
    };
  } catch {
    return {};
  }
}

function DetailContent() {
  const data = useShipDetailData({ allowDemo: true });
  const {
    ship,
    position,
    voyage,
    port,
    summary,
    companies,
    coordinates,
    imageUrl,
    isDemo,
    isLoading,
    isError,
    location,
  } = data;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [preferences, setPreferences] = useState(() =>
    readPreferences(data.id),
  );
  const [note, setNote] = useState(preferences.note ?? "");
  const [editingNotes, setEditingNotes] = useState(false);
  const [modal, setModal] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [photoFailed, setPhotoFailed] = useState(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [now] = useState(() =>
    isDemo ? Date.parse("2026-10-10T11:05:00Z") : Date.now(),
  );
  const trip = getDetailVoyage(voyage, port);
  const progress = getVoyageProgress(trip, now);
  const name = ship.name ?? "Unnamed vessel";
  const region = position.region ?? summary.location;
  const type = ship.vessel_type ?? "Vessel";
  const goodPhoto = imageUrl && !photoFailed;
  const generalRows = [
    ["Name", name],
    [
      "Flag",
      <span className="vessel-flag-value">
        <Flag ship={ship} />
        {detailValue(ship.flag)}
      </span>,
    ],
    ["IMO", ship.imo],
    ["MMSI", ship.mmsi],
    ["Call sign", ship.call_sign ?? ship.callsign],
    ["AIS transponder class", ship.ais_class ?? ship.transponder_class],
    ["General vessel type", ship.general_vessel_type ?? ship.vessel_type],
    ["Detailed vessel type", ship.vessel_type],
    ["Service status", ship.service_status],
    ["Port of registry", ship.port_of_registry],
    ["Year built", ship.yob ?? ship.year_built],
  ];
  const characteristicRows = [
    ...generalRows,
    ["Length overall", detailValue(ship.loa, " m")],
    ["Width", detailValue(ship.width, " m")],
    ["Draught", detailValue(position.draught ?? ship.draft, " m")],
    ["Deadweight", detailValue(ship.dwt, " t")],
    ["Vessel class", ship.vessel_class],
    ["Builder", ship.vessel_maker],
  ];
  const aisRows = [
    ["Navigational status", position.navigational_status ?? voyage.status],
    [
      "Position received",
      detailDate(position.received_at ?? position.update_time, trip.timeZone),
    ],
    ["Vessel's local time", detailDate(now, trip.timeZone)],
    [
      "Latitude / Longitude",
      coordinates
        ? `${coordinates[1].toFixed(5)} / ${coordinates[0].toFixed(5)}`
        : null,
    ],
    ["Speed", detailValue(position.speed, " kn")],
    ["Course", detailValue(position.course, "°")],
    ["True heading", detailValue(position.heading, "°")],
    ["Rate of turn", position.rate_of_turn],
    ["Draught", detailValue(position.draught ?? ship.draft, " m")],
    ["Reported destination", trip.destination],
    [
      "Matched destination",
      port.name ? [port.name, port.country].filter(Boolean).join(", ") : null,
    ],
    ["Reported ETA", detailDate(trip.eta, trip.timeZone)],
    ["AIS vessel type", ship.general_vessel_type ?? ship.vessel_type],
    ["AIS source", position.source],
  ];
  function savePreferences(next) {
    try {
      localStorage.setItem("vessel-detail:" + data.id, JSON.stringify(next));
      setPreferences(next);
      return true;
    } catch {
      setFeedback("Your browser could not save this preference.");
      return false;
    }
  }
  function openLiveMap() {
    if (!coordinates) return;
    const tile = lngLatToTile(coordinates[0], coordinates[1], 7);
    navigate(`/dashboard/${tile.z}/${tile.x}/${tile.y}`);
  }
  const businesses = (
    <div className="vessel-business-grid">
      <Card title="At arrival location">
        {companies.length ? (
          <ul className="vessel-companies">
            {companies
              .slice(0, showAllCompanies ? companies.length : 5)
              .map((company, index) => (
                <li key={company.id ?? index}>
                  <span className="vessel-company-icon">
                    <Building2 size={19} />
                  </span>
                  <div>
                    <span>{company.name}</span>
                    <small>
                      {company.type ?? company.service ?? "Maritime services"}
                    </small>
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <Empty>No businesses reported at the arrival location</Empty>
        )}
        {companies.length > 5 && (
          <button
            className="vessel-text-button"
            onClick={() => setShowAllCompanies(!showAllCompanies)}
          >
            {showAllCompanies ? "Show less" : "View full list"}
            <ChevronRight size={14} />
          </button>
        )}
      </Card>
      <Card title="Near the vessel">
        <Empty>No nearby business data available at the moment</Empty>
      </Card>
    </div>
  );
  const notes = (
    <Card title="Notes" className="vessel-notes-card">
      {editingNotes ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (savePreferences({ ...preferences, note: note.trim() })) {
              setEditingNotes(false);
              setFeedback("Note saved on this device.");
            }
          }}
        >
          <label htmlFor="vessel-note">Private note</label>
          <textarea
            id="vessel-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={5}
            autoFocus
            placeholder="Add a note about this vessel..."
            maxLength={5000}
          />
          <small>Notes are saved on this device.</small>
          <div className="vessel-note-actions">
            <button
              className="vessel-button vessel-button-primary"
              type="submit"
            >
              <Check size={14} />
              Save note
            </button>
            <button
              className="vessel-button"
              type="button"
              onClick={() => {
                setNote(preferences.note ?? "");
                setEditingNotes(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="vessel-notes-content">
          <MessageSquarePlus size={24} />
          <p>{preferences.note || "Keep your vessel notes in one place"}</p>
          <button
            className="vessel-button vessel-button-primary"
            onClick={() => setEditingNotes(true)}
          >
            {preferences.note ? "Edit note" : "Add a note"}
          </button>
          <small>Private · saved on this device</small>
        </div>
      )}
    </Card>
  );

  return (
    <main
      className="vessel-detail-page"
      dir="ltr"
      lang="en"
      aria-busy={isLoading}
    >
      <header className="vessel-page-header">
        <div className="vessel-title-row">
          <div className="vessel-identity">
            <button
              className="vessel-icon-button"
              onClick={data.handleBack}
              aria-label="Back to previous page"
            >
              <ArrowLeft size={17} />
            </button>
            <Flag ship={ship} />
            <h1>{name}</h1>
            <span className="vessel-type-badge">
              <Ship size={13} />
            </span>
            <span className="vessel-subtitle">
              {type} <span>IMO: {detailValue(ship.imo)}</span>
            </span>
            {isDemo && <span className="vessel-demo-badge">Demo data</span>}
          </div>
          <div className="vessel-header-actions">
            <button
              className="vessel-button"
              onClick={() => {
                setActiveTab("Overview");
                setEditingNotes(true);
              }}
            >
              <MessageSquarePlus size={13} />
              Add notes
            </button>
            <button
              className={`vessel-button ${preferences.inFleet ? "vessel-button-selected" : ""}`}
              aria-pressed={Boolean(preferences.inFleet)}
              title="Saved on this device"
              onClick={() => {
                const next = !preferences.inFleet;
                if (savePreferences({ ...preferences, inFleet: next }))
                  setFeedback(
                    next
                      ? "Added to your fleet on this device."
                      : "Removed from your fleet.",
                  );
              }}
            >
              <Heart
                size={13}
                fill={preferences.inFleet ? "currentColor" : "none"}
              />
              {preferences.inFleet ? "In your fleet" : "Add to fleet"}
            </button>
            <button
              className="vessel-button"
              disabled
              title="The notification service is not connected"
            >
              <Bell size={13} />
              Create notifications
            </button>
            <button
              className="vessel-icon-button vessel-copy-button"
              aria-label="Copy vessel link"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  setFeedback("Vessel link copied.");
                } catch {
                  setFeedback(
                    "Could not copy the link. Copy it from your address bar.",
                  );
                }
              }}
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
        <nav className="vessel-tabs" aria-label="Vessel details sections">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              aria-current={activeTab === tab ? "page" : undefined}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
          {!isDemo && (
            <Link
              className="vessel-original-link"
              to={`/ships/${encodeURIComponent(data.id)}/classic${location.search}`}
              state={location.state}
            >
              Original layout ↗
            </Link>
          )}
        </nav>
      </header>
      {(isLoading || isError || feedback) && (
        <div className="vessel-status" role="status">
          {feedback ||
            (isLoading
              ? "Loading vessel information…"
              : "Some vessel information could not be loaded. Available details are shown.")}
          {feedback && (
            <button
              className="vessel-icon-button"
              aria-label="Dismiss message"
              onClick={() => setFeedback("")}
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}
      <div className="vessel-page-content">
        {activeTab === "Overview" ? (
          <div className="vessel-overview-grid">
            <div className="vessel-left-column">
              <Card title="Current voyage" className="vessel-voyage-card">
                <div className="vessel-map-wrap">
                  <Suspense fallback={<Empty>Loading map…</Empty>}>
                    <VoyageMap
                      coordinates={coordinates}
                      course={position.course}
                    />
                  </Suspense>
                  <button
                    className="vessel-button vessel-map-link"
                    onClick={openLiveMap}
                    disabled={!coordinates}
                  >
                    View on live map
                  </button>
                </div>
                <div className="vessel-voyage-ports">
                  <div>
                    <small>Departure from {trip.origin}</small>
                    <strong>{trip.origin}</strong>
                  </div>
                  <div>
                    <small>Arrival at {port.name ?? trip.destination}</small>
                    <strong>{trip.destination}</strong>
                  </div>
                </div>
                <div
                  className="vessel-voyage-progress"
                  aria-label={
                    progress == null
                      ? "Voyage progress unavailable"
                      : `Estimated voyage progress: ${Math.round(progress)}%`
                  }
                >
                  <span className="vessel-departure-dot" />
                  <div className="vessel-progress-line">
                    <span style={{ width: `${progress ?? 0}%` }} />
                    {progress != null && (
                      <Navigation
                        size={19}
                        className="vessel-progress-ship"
                        style={{ left: `${Math.min(97, progress)}%` }}
                      />
                    )}
                  </div>
                  <MapPin size={18} />
                </div>
                <div className="vessel-voyage-times">
                  <div>
                    <small>Actual time of departure:</small>
                    <span>{detailDate(trip.departure, trip.timeZone)}</span>
                  </div>
                  <div>
                    <small>Reported ETA:</small>
                    <span>{detailDate(trip.eta, trip.timeZone)}</span>
                  </div>
                </div>
                <div className="vessel-voyage-actions">
                  <button
                    className="vessel-button"
                    disabled
                    title="Historical positions are not provided by the current API"
                  >
                    Past track
                  </button>
                  <button
                    className="vessel-button"
                    onClick={() => setModal("forecast")}
                  >
                    Route forecast
                  </button>
                </div>
                <div className="vessel-route-info">
                  <Navigation size={24} />
                  <span>{voyage.status ?? "Voyage information"}</span>
                  <strong>
                    {progress == null
                      ? "Waiting for departure and arrival estimates"
                      : `${Math.round(progress)}% of the estimated voyage time elapsed`}
                  </strong>
                  <small>Time-based estimate · {trip.timeZone}</small>
                </div>
              </Card>
              <section className="vessel-business-section">
                <h2>Businesses</h2>
                {businesses}
              </section>
            </div>
            <div className="vessel-right-column">
              <Card title="Summary" className="vessel-summary">
                <h3>Where is the ship?</h3>
                <p>
                  {region ? (
                    <>
                      {type} <strong>{name}</strong> is currently located in{" "}
                      <strong>{region}</strong>.
                    </>
                  ) : coordinates ? (
                    <>
                      <strong>{name}</strong> was last reported at{" "}
                      <strong>
                        {coordinates[1].toFixed(4)}°,{" "}
                        {coordinates[0].toFixed(4)}°
                      </strong>
                      .
                    </>
                  ) : (
                    "The vessel's current location has not been reported."
                  )}
                </p>
                <h3>What kind of ship is this?</h3>
                <p>
                  <strong>{name}</strong> (IMO: {detailValue(ship.imo)}) is a{" "}
                  <strong>{type}</strong>
                  {ship.flag && (
                    <>
                      {" "}
                      and is sailing under the flag of{" "}
                      <strong>{ship.flag}</strong>
                    </>
                  )}
                  .
                  {ship.loa != null && (
                    <> Her length overall (LOA) is {ship.loa} meters</>
                  )}
                  {ship.width != null && (
                    <>
                      {ship.loa != null ? " and her width" : " Her width"} is{" "}
                      {ship.width} meters.
                    </>
                  )}
                </p>
                {summary.description && (
                  <p className="vessel-summary-extra">{summary.description}</p>
                )}
              </Card>
              <div className="vessel-information-grid">
                <Card title="General">
                  <div className="vessel-photo">
                    {goodPhoto ? (
                      <img
                        src={imageUrl}
                        alt={name}
                        onError={() => setPhotoFailed(true)}
                      />
                    ) : isDemo ? (
                      <img
                        src="/images/vessel-demo.svg"
                        alt="Illustration of a reefer vessel in a harbor"
                      />
                    ) : (
                      <div className="vessel-photo-empty">
                        <Ship size={50} />
                        <span>No vessel photo available</span>
                      </div>
                    )}
                    {(goodPhoto || isDemo) && (
                      <button
                        className="vessel-button vessel-photo-action"
                        onClick={() => setModal("photo")}
                      >
                        <Image size={13} />
                        View photo
                      </button>
                    )}
                    {isDemo && (
                      <small className="vessel-photo-credit">
                        Illustrative vessel image
                      </small>
                    )}
                  </div>
                  <Fields rows={generalRows} />
                </Card>
                <div className="vessel-ais-column">
                  <Card title="Latest AIS information">
                    <Fields rows={aisRows} />
                    <p className="vessel-ais-footnote">
                      Latest reported information · {trip.timeZone}
                    </p>
                  </Card>
                  {notes}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="vessel-secondary-view">
            {activeTab === "Port call log" && (
              <Card title="Port call log">
                <p className="vessel-section-description">
                  Events reported for the current voyage.
                </p>
                <div className="vessel-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Port</th>
                        <th>Event</th>
                        <th>Reported time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trip.departure && (
                        <tr>
                          <td>{trip.origin}</td>
                          <td>Departure</td>
                          <td>{detailDate(trip.departure, trip.timeZone)}</td>
                        </tr>
                      )}
                      {trip.arrival && (
                        <tr>
                          <td>{trip.destination}</td>
                          <td>Arrival</td>
                          <td>{detailDate(trip.arrival, trip.timeZone)}</td>
                        </tr>
                      )}
                      {!trip.departure && !trip.arrival && (
                        <tr>
                          <td colSpan={3}>No actual port calls reported</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="vessel-section-description">
                  Reported ETA: {detailDate(trip.eta, trip.timeZone)} ·
                  Estimated arrivals are not actual port calls.
                </p>
              </Card>
            )}
            {activeTab === "Vessel characteristics" && (
              <Card title="Vessel characteristics">
                <Fields rows={characteristicRows} />
              </Card>
            )}
            {activeTab === "Ownership" && (
              <Card title="Ownership">
                <Fields
                  rows={[
                    ["Owner", ship.owner],
                    ["Manager", ship.manager],
                    ["Operator", ship.operator],
                  ]}
                />
                <p className="vessel-section-description">
                  Ownership details appear when supplied by the vessel service.
                </p>
              </Card>
            )}
            {activeTab === "Performance insights" && (
              <Card title="Current voyage performance">
                <Fields
                  rows={[
                    ["Speed", detailValue(position.speed, " kn")],
                    ["Course", detailValue(position.course, "°")],
                    ["Departure", detailDate(trip.departure, trip.timeZone)],
                    ["Reported ETA", detailDate(trip.eta, trip.timeZone)],
                    ["Actual arrival", detailDate(trip.arrival, trip.timeZone)],
                    [
                      "Estimated time elapsed",
                      progress == null ? null : `${Math.round(progress)}%`,
                    ],
                  ]}
                />
                <p className="vessel-section-description">
                  Historical performance is not provided by the current vessel
                  service.
                </p>
              </Card>
            )}
            {activeTab === "Compliance" && (
              <Card title="Vessel identification">
                <Fields
                  rows={[
                    ["IMO", ship.imo],
                    ["MMSI", ship.mmsi],
                    ["Flag", ship.flag],
                    ["Call sign", ship.call_sign ?? ship.callsign],
                  ]}
                />
                <Empty>No compliance records available</Empty>
              </Card>
            )}
            {activeTab === "In the news" && (
              <Card title="In the news">
                <Empty>No news feed connected for this vessel</Empty>
              </Card>
            )}
          </div>
        )}
      </div>
      {modal === "photo" && (
        <Modal title={name + " · Vessel photo"} onClose={() => setModal(null)}>
          <img
            className="vessel-full-photo"
            src={goodPhoto ? imageUrl : "/images/vessel-demo.svg"}
            alt={goodPhoto ? name : "Illustrative reefer vessel"}
          />
          {isDemo && (
            <p className="vessel-section-description">
              Illustrative image for the preview layout.
            </p>
          )}
        </Modal>
      )}
      {modal === "forecast" && (
        <Modal title="Route forecast" onClose={() => setModal(null)}>
          <Fields
            rows={[
              ["From", trip.origin],
              ["To", trip.destination],
              ["Departure", detailDate(trip.departure, trip.timeZone)],
              ["Reported ETA", detailDate(trip.eta, trip.timeZone)],
              ["Time zone", trip.timeZone],
            ]}
          />
          <p className="vessel-section-description">
            This is the vessel's reported arrival estimate. A predicted route is
            not provided by the current API.
          </p>
        </Modal>
      )}
    </main>
  );
}

export default function ShipDetailOverviewPage() {
  const { id } = useParams();
  return <DetailContent key={id} />;
}
