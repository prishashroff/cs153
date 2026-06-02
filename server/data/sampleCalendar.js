const today = new Date().toISOString().split("T")[0];

module.exports = [
  {
    id: "c1",
    date: today,
    title: "CS 101 - Intro to Programming",
    startTime: "08:45",
    endTime: "10:15",
    location: "Gates Hall 101",
    locationId: "academic1",
    type: "class",
    color: "#6366f1",
  },
  {
    id: "c2",
    date: today,
    title: "Math 202 - Linear Algebra",
    startTime: "12:45",
    endTime: "14:15",
    location: "Math Building 204",
    locationId: "academic1",
    type: "class",
    color: "#8b5cf6",
  },
  {
    id: "c3",
    date: today,
    title: "Study Group - CS Project",
    startTime: "15:30",
    endTime: "17:30",
    location: "Green Library",
    locationId: "library1",
    type: "study",
    color: "#06b6d4",
  },
];
