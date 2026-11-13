
// BLOOD DONOR FINDER - MAIN JAVASCRIPT

const screens = document.querySelectorAll(".screen");
let currentScreen = 0;

const screenNames = [
  "Welcome",
  "Importance of Blood",
  "About Donation",
  "Hospitals",
  "Blood Banks",
  "Donor Registration",
  "Search Donors",
  "Blood Requests",
  "Donation Camps",
  "Thank You"
];

const districts = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore",
  "Cuddalore", "Dharmapuri", "Dindigul", "Erode",
  "Kallakurichi", "Kancheepuram", "Kanniyakumari", "Karur",
  "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam",
  "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga",
  "Tenkasi", "Thanjavur", "Theni", "Thoothukudi",
  "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur",
  "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore",
  "Viluppuram", "Virudhunagar"
];

// Demo profiles only. These are fictional sample entries.
const sampleDonors = [
  { name: "Sample Donor 1", blood: "O+", district: "Coimbatore", city: "Coimbatore", available: true },
  { name: "Sample Donor 2", blood: "A+", district: "Chennai", city: "Chennai", available: true },
  { name: "Sample Donor 3", blood: "B+", district: "Madurai", city: "Madurai", available: true },
  { name: "Sample Donor 4", blood: "AB+", district: "Salem", city: "Salem", available: true },
  { name: "Sample Donor 5", blood: "O-", district: "Tiruchirappalli", city: "Trichy", available: true },
  { name: "Sample Donor 6", blood: "A-", district: "Erode", city: "Erode", available: true }
];

function readStorage(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    alert("Browser storage is unavailable. Please check your browser settings.");
    return false;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

// Add district options to all district dropdowns.
function fillDistrictDropdowns() {
  const dropdownIds = [
    "hospitalDistrict",
    "bloodBankDistrict",
    "donorDistrict",
    "searchDistrict",
    "requestDistrict"
  ];

  dropdownIds.forEach(id => {
    const dropdown = document.getElementById(id);
    if (!dropdown) return;

    const firstOption = dropdown.options[0].outerHTML;
    dropdown.innerHTML = firstOption;

    districts.forEach(district => {
      const option = document.createElement("option");
      option.value = district;
      option.textContent = district;
      dropdown.appendChild(option);
    });
  });
}

// Navigate to a particular screen.
function showScreen(index) {
  if (index < 0 || index >= screens.length) return;

  currentScreen = index;

  screens.forEach((screen, i) => {
    screen.classList.toggle("active", i === currentScreen);
  });

  document.getElementById("screenCount").textContent =
    `Screen ${currentScreen + 1} of ${screens.length}`;

  document.getElementById("pageLabel").textContent =
    screenNames[currentScreen];

  document.getElementById("prevBtn").disabled = currentScreen === 0;
  document.getElementById("nextBtn").disabled =
    currentScreen === screens.length - 1;

  if (currentScreen === 7) displayRequests();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function changeScreen(direction) {
  showScreen(currentScreen + direction);
}

function goTo(index) {
  showScreen(index);
}

// Hospital district information.
document.getElementById("hospitalDistrict").addEventListener("change", function () {
  const district = this.value;
  const result = document.getElementById("hospitalResult");

  if (!district) {
    result.textContent = "Choose a district to view information.";
    return;
  }

  result.innerHTML = `
    <h3>${escapeHTML(district)} District</h3>
    <p>For government hospital details, contact the official district health office or government hospital.</p>
    <p><strong>Reminder:</strong> Verify the hospital address, services and contact number through official sources.</p>
  `;
});

// Blood bank guidance.
document.getElementById("bloodBankDistrict").addEventListener("change", function () {
  const district = this.value;
  const result = document.getElementById("bloodBankResult");

  if (!district) {
    result.textContent = "Choose a district for guidance.";
    return;
  }

  result.innerHTML = `
    <h3>${escapeHTML(district)} District</h3>
    <p>Contact an authorised blood bank or government hospital in this district.</p>
    <p>Ask them directly about current stock, blood group availability and eligibility requirements.</p>
    <strong>This website does not show live blood stock.</strong>
  `;
});

// Donor registration.
document.getElementById("donorForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("donorName").value.trim();
  const blood = document.getElementById("donorBlood").value;
  const district = document.getElementById("donorDistrict").value;
  const city = document.getElementById("donorCity").value.trim();
  const available = document.getElementById("donorAvailable").checked;
  const message = document.getElementById("donorMessage");

  if (!name || !blood || !district || !city) {
    message.textContent = "Please fill in all required fields.";
    return;
  }

  const donors = readStorage("bloodFinderDonors");

  donors.push({
    name,
    blood,
    district,
    city,
    available
  });

  if (saveStorage("bloodFinderDonors", donors)) {
    message.textContent = "Demo donor registered successfully!";
    this.reset();
  }
});

// Donor search.
function searchDonors() {
  const blood = document.getElementById("searchBlood").value;
  const district = document.getElementById("searchDistrict").value;
  const result = document.getElementById("donorResults");

  const registeredDonors = readStorage("bloodFinderDonors");
  const allDonors = [...sampleDonors, ...registeredDonors];

  const matches = allDonors.filter(donor => {
    const bloodMatches = !blood || donor.blood === blood;
    const districtMatches = !district || donor.district === district;
    return bloodMatches && districtMatches && donor.available;
  });

  if (matches.length === 0) {
    result.textContent = "No matching demo donor found. Try another blood group or district.";
    return;
  }

  result.innerHTML = `<h3>${matches.length} matching demo donor(s)</h3>`;

  matches.forEach(donor => {
    const item = document.createElement("div");
    item.className = "result-item";
    item.innerHTML = `
      <strong>${escapeHTML(donor.name)}</strong><br>
      Blood Group: ${escapeHTML(donor.blood)}<br>
      District: ${escapeHTML(donor.district)}<br>
      City: ${escapeHTML(donor.city)}<br>
      Status: Available in demo
    `;
    result.appendChild(item);
  });
}

// Blood request form.
document.getElementById("requestForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const request = {
    name: document.getElementById("requesterName").value.trim(),
    blood: document.getElementById("requestBlood").value,
    district: document.getElementById("requestDistrict").value,
    hospital: document.getElementById("requestHospital").value.trim()
  };

  if (!request.name || !request.blood || !request.district || !request.hospital) {
    document.getElementById("requestMessage").textContent =
      "Please fill in all required fields.";
    return;
  }

  const requests = readStorage("bloodFinderRequests");
  requests.push(request);

  if (saveStorage("bloodFinderRequests", requests)) {
    document.getElementById("requestMessage").textContent =
      "Demo blood request submitted successfully!";
    this.reset();
    displayRequests();
  }
});

// Display submitted demo requests.
function displayRequests() {
  const result = document.getElementById("requestResults");
  const requests = readStorage("bloodFinderRequests");

  if (requests.length === 0) {
    result.textContent = "No demo requests added yet.";
    return;
  }

  result.innerHTML = "";

  requests.forEach((request, index) => {
    const item = document.createElement("div");
    item.className = "result-item";
    item.innerHTML = `
      <strong>Request ${index + 1}</strong><br>
      Name: ${escapeHTML(request.name)}<br>
      Blood Group: ${escapeHTML(request.blood)}<br>
      District: ${escapeHTML(request.district)}<br>
      Hospital: ${escapeHTML(request.hospital)}
    `;
    result.appendChild(item);
  });
}

// Start the website.
fillDistrictDropdowns();
showScreen(0);
