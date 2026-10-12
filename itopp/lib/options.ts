// Single source of truth for dropdown options (forms + server validation).
// Departments = courses approved for SIWES / industrial training
// (engineering, sciences & technology, computing, agriculture,
// environmental, allied health). Existing names are unchanged so saved
// profiles and postings keep matching.
export const DEPARTMENTS: [string, ...string[]] = [
  // Computing & ICT
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Computer Engineering",
  "Cybersecurity",
  "Data Science",
  "Information Systems",
  // Engineering
  "Agricultural Engineering",
  "Chemical Engineering",
  "Civil Engineering",
  "Electrical/Electronics Engineering",
  "Mechanical Engineering",
  "Mechatronics Engineering",
  "Petroleum Engineering",
  "Metallurgical & Materials Engineering",
  // Sciences & technology
  "Biochemistry",
  "Biology",
  "Botany",
  "Chemistry",
  "Geology",
  "Industrial Chemistry",
  "Mathematics",
  "Microbiology",
  "Physics",
  "Science Laboratory Technology",
  "Statistics",
  "Zoology",
  // Agriculture
  "Agricultural Science",
  "Animal Science",
  "Crop Science",
  "Fisheries & Aquaculture",
  "Food Science & Technology",
  "Forestry & Wildlife",
  "Soil Science",
  // Environmental
  "Architecture",
  "Building Technology",
  "Estate Management",
  "Quantity Surveying",
  "Surveying & Geoinformatics",
  "Urban & Regional Planning",
  // Allied health
  "Medical Laboratory Science",
];

export const LEVELS: [string, ...string[]] = ["400 Level", "500 Level"];

// Higher institutions offering SIWES placements (pilot list, extendable).
export const INSTITUTIONS: [string, ...string[]] = [
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "Obafemi Awolowo University (OAU)",
  "University of Nigeria, Nsukka (UNN)",
  "Ahmadu Bello University (ABU)",
  "University of Benin (UNIBEN)",
  "University of Ilorin (UNILORIN)",
  "Lagos State University (LASU)",
  "Olabisi Onabanjo University (OOU)",
  "Federal University of Technology, Akure (FUTA)",
  "Federal University of Technology, Minna (FUTMINNA)",
  "Federal University of Technology, Owerri (FUTO)",
  "Yaba College of Technology (YabaTech)",
  "Auchi Polytechnic",
  "Kaduna Polytechnic",
  "Covenant University",
  "Babcock University",
];

// Report reasons (shared by the report dialog + server validation).
export const REPORT_REASONS: [string, ...string[]] = [
  "Scam / fake opening",
  "Asks for payment",
  "Ghosted after shortlist",
  "Unsafe workplace",
  "Other",
];
