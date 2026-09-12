const fs = require("fs");
const path = require("path");

const initialAppointments = [
  {
    title: "Engineering Team Standup",
    description: "Daily synchronization on sprint blockers, PR reviews, and deployment roadmap.",
    date: "2026-09-13",
    startTime: "10:00",
    endTime: "10:30",
    status: "SCHEDULED",
  },
  {
    title: "Ad-hoc Sync (Back to Back)",
    description: "Follow-up discussion on deployment automation immediately following standup.",
    date: "2026-09-13",
    startTime: "10:30",
    endTime: "11:00",
    status: "SCHEDULED",
  },
  {
    title: "Enterprise Client Strategy Meeting",
    description: "Q4 product requirement walk-through and SLA agreement review.",
    date: "2026-09-13",
    startTime: "11:00",
    endTime: "12:00",
    status: "SCHEDULED",
  },
  {
    title: "Architecture & Code Review",
    description: "Deep dive review into appointment conflict-detection and indexing logic.",
    date: "2026-09-13",
    startTime: "14:00",
    endTime: "15:00",
    status: "COMPLETED",
  },
  {
    title: "Product Roadmap Discussion",
    description: "Aligning next sprint priorities with product managers and stakeholders.",
    date: "2026-09-14",
    startTime: "10:00",
    endTime: "11:00",
    status: "SCHEDULED",
  },
  {
    title: "Design System Sync (Cancelled)",
    description: "Figma UI/UX component alignment session with frontend engineering.",
    date: "2026-09-14",
    startTime: "14:00",
    endTime: "15:00",
    status: "CANCELLED",
  },
  {
    title: "Sprint Retrospective & Demo",
    description: "Sprint closeout, accomplishments review, and process improvements.",
    date: "2026-09-15",
    startTime: "16:00",
    endTime: "17:00",
    status: "SCHEDULED",
  },
  {
    title: "Mobile App Wireframe Review",
    description: "Early concept review for iOS & Android companion applications.",
    date: "2026-09-15",
    startTime: "11:00",
    endTime: "12:00",
    status: "CANCELLED",
  },
];

const dataDir = path.join(__dirname, "..", ".data");
const dataFile = path.join(dataDir, "appointments.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const records = initialAppointments.map((item, idx) => ({
  id: `seed-appt-${idx + 1}`,
  title: item.title,
  description: item.description,
  date: item.date,
  startTime: item.startTime,
  endTime: item.endTime,
  status: item.status,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

fs.writeFileSync(dataFile, JSON.stringify(records, null, 2), "utf-8");
console.log(`Successfully seeded ${records.length} sample appointments into .data/appointments.json!`);
