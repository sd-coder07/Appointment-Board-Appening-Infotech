async function runTests() {
  const baseUrl = "http://localhost:3000";
  console.log("=== STARTING APPOINTMENT BOARD API TEST SUITE ===");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✕ FAIL: ${message}`);
      failed++;
    }
  }

  // 0. Reseed first to have clean baseline
  console.log("\n[Test 0] Reseeding database...");
  const seedRes = await fetch(`${baseUrl}/api/seed`, { method: "POST" });
  const seedData = await seedRes.json();
  assert(seedRes.status === 200 && seedData.success === true, "Reseed successful");
  assert(seedData.appointments.length === 6, "Has 6 initial seed appointments");

  // 1. GET /api/appointments
  console.log("\n[Test 1] Fetching all appointments...");
  const getAllRes = await fetch(`${baseUrl}/api/appointments`);
  const getAllData = await getAllRes.json();
  assert(getAllRes.status === 200, "GET /api/appointments returns 200");
  assert(getAllData.appointments.length === 6, "Returns 6 appointments");

  // 2. Filter by date
  console.log("\n[Test 2] Filtering by date: 2026-09-13...");
  const dateRes = await fetch(`${baseUrl}/api/appointments?date=2026-09-13`);
  const dateData = await dateRes.json();
  assert(dateData.appointments.every((a) => a.date.startsWith("2026-09-13")), "All results on 2026-09-13");
  assert(dateData.appointments.length === 3, "Exactly 3 appointments on 2026-09-13");

  // 3. Filter by status
  console.log("\n[Test 3] Filtering by status: COMPLETED...");
  const statusRes = await fetch(`${baseUrl}/api/appointments?status=COMPLETED`);
  const statusData = await statusRes.json();
  assert(statusData.appointments.every((a) => a.status === "COMPLETED"), "All results are COMPLETED");
  assert(statusData.appointments.length === 1, "Exactly 1 completed appointment initially");

  // 4. Simultaneous filter: Date + Status
  console.log("\n[Test 4] Simultaneous filter: Date 2026-09-13 + Status SCHEDULED...");
  const dualRes = await fetch(`${baseUrl}/api/appointments?date=2026-09-13&status=SCHEDULED`);
  const dualData = await dualRes.json();
  assert(dualData.appointments.length === 2, "Found 2 scheduled appointments on 2026-09-13");

  // 5. Validation: Missing title
  console.log("\n[Test 5] Validation: Missing title should fail...");
  const missingTitleRes = await fetch(`${baseUrl}/api/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "",
      date: "2026-09-20",
      startTime: "10:00",
      endTime: "11:00",
    }),
  });
  const missingTitleData = await missingTitleRes.json();
  assert(missingTitleRes.status === 400, "Returns 400 Bad Request for empty title");
  assert(missingTitleData.error.includes("Title is required"), "Error mentions Title is required");

  // 6. Validation: End time <= Start time
  console.log("\n[Test 6] Validation: End time equal to or before start time...");
  const invalidTimeRes = await fetch(`${baseUrl}/api/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Invalid Duration Meeting",
      date: "2026-09-20",
      startTime: "14:00",
      endTime: "13:00",
    }),
  });
  const invalidTimeData = await invalidTimeRes.json();
  assert(invalidTimeRes.status === 400, "Returns 400 Bad Request for endTime <= startTime");
  assert(invalidTimeData.error.includes("End time must be after start time"), "Error message matches requirement");

  // 7. Conflict Detection: Overlapping slot
  // On 2026-09-13, we have 10:00 - 10:30 (Team Standup).
  console.log("\n[Test 7] Conflict Detection: Overlapping slot 10:15 - 10:45 on 2026-09-13...");
  const conflictRes = await fetch(`${baseUrl}/api/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Conflicting Sprint Sync",
      date: "2026-09-13",
      startTime: "10:15",
      endTime: "10:45",
    }),
  });
  const conflictData = await conflictRes.json();
  assert(conflictRes.status === 409, "Returns 409 Conflict");
  assert(conflictData.error.includes("conflicts with an existing appointment"), "Error message identifies conflict");

  // 8. Touching / Back-to-Back: 10:30 - 11:00 on 2026-09-13
  // Touches 10:00-10:30 and 11:00-12:00 exactly
  console.log("\n[Test 8] Back-to-Back Appointment: 10:30 - 11:00 on 2026-09-13...");
  const backToBackRes = await fetch(`${baseUrl}/api/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Ad-hoc Sync (Back to Back)",
      date: "2026-09-13",
      startTime: "10:30",
      endTime: "11:00",
    }),
  });
  const backToBackData = await backToBackRes.json();
  assert(backToBackRes.status === 201, "Returns 201 Created for back-to-back appointment");
  assert(backToBackData.appointment.title === "Ad-hoc Sync (Back to Back)", "Appointment created successfully");
  const createdId = backToBackData.appointment.id;

  // 9. Complete Appointment
  console.log("\n[Test 9] Completing Appointment...");
  const completeRes = await fetch(`${baseUrl}/api/appointments/${createdId}/complete`, {
    method: "PATCH",
  });
  const completeData = await completeRes.json();
  assert(completeRes.status === 200, "Returns 200 OK");
  assert(completeData.appointment.status === "COMPLETED", "Status updated to COMPLETED");
  assert(completeData.message === "Appointment marked as completed.", "Returns expected completion message");

  // 10. Cancel Appointment
  console.log("\n[Test 10] Cancelling Appointment...");
  const cancelRes = await fetch(`${baseUrl}/api/appointments/${createdId}/cancel`, {
    method: "PATCH",
  });
  const cancelData = await cancelRes.json();
  assert(cancelRes.status === 200, "Returns 200 OK");
  assert(cancelData.appointment.status === "CANCELLED", "Status updated to CANCELLED");
  assert(cancelData.message === "Appointment cancelled successfully.", "Returns expected cancellation message");

  // 11. Cancelled appointment frees up the time slot!
  console.log("\n[Test 11] Booking slot previously held by cancelled appointment (10:30 - 11:00)...");
  const rebookRes = await fetch(`${baseUrl}/api/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "New Booking Over Cancelled Slot",
      date: "2026-09-13",
      startTime: "10:30",
      endTime: "11:00",
    }),
  });
  const rebookData = await rebookRes.json();
  assert(rebookRes.status === 201, "Returns 201 Created — Cancelled appointment released the slot!");
  const rebookedId = rebookData.appointment.id;

  // 12. Edit appointment conflict check
  console.log("\n[Test 12] Editing appointment into conflicting slot (11:15 - 11:45)...");
  const editConflictRes = await fetch(`${baseUrl}/api/appointments/${rebookedId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Moved into conflict",
      date: "2026-09-13",
      startTime: "11:15",
      endTime: "11:45",
    }),
  });
  assert(editConflictRes.status === 409, "Returns 409 Conflict when editing into an occupied slot");

  // 13. Edit appointment within its own slot (no self-conflict)
  console.log("\n[Test 13] Editing appointment within its own slot...");
  const editSelfRes = await fetch(`${baseUrl}/api/appointments/${rebookedId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Updated Title No Conflict",
      description: "Updated description notes",
      date: "2026-09-13",
      startTime: "10:30",
      endTime: "11:00",
    }),
  });
  const editSelfData = await editSelfRes.json();
  assert(editSelfRes.status === 200, "Returns 200 OK — Self exclusion works during edit");
  assert(editSelfData.appointment.title === "Updated Title No Conflict", "Title properly updated");

  console.log("\n=========================================");
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=========================================");

  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
