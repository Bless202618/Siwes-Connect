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

// Personal email providers — never accepted for student signup.
export const PERSONAL_EMAIL_DOMAINS: string[] = [
  "gmail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
  "zoho.com",
  "yandex.com",
  "mail.com",
  "gmx.com",
];

// Official school email domains (exact or any subdomain, e.g.
// firstname.lastname@students.unilag.edu.ng). Correct any entry.
export const SCHOOL_EMAIL_DOMAINS: [string, ...string[]] = [
  "unilag.edu.ng",
  "ui.edu.ng",
  "oauife.edu.ng",
  "unn.edu.ng",
  "abu.edu.ng",
  "uniben.edu",
  "unilorin.edu.ng",
  "lasu.edu.ng",
  "oouagoiwoye.edu.ng",
  "futa.edu.ng",
  "futminna.edu.ng",
  "futo.edu.ng",
  "yabatech.edu.ng",
  "auchipoly.edu.ng",
  "kadunapolytechnic.edu.ng",
  "covenantuniversity.edu.ng",
  "babcock.edu.ng",
];

export function isSchoolEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  if (!domain || PERSONAL_EMAIL_DOMAINS.includes(domain)) return false;
  if (domain.endsWith(".edu.ng")) return true;
  return SCHOOL_EMAIL_DOMAINS.some(
    (d) => domain === d || domain.endsWith(`.${d}`)
  );
}

// Nigerian banks for the stipend account section (self-reported).
export const BANKS: [string, ...string[]] = [
  "Access Bank",
  "Citibank",
  "Ecobank",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank (FCMB)",
  "Guaranty Trust Bank (GTBank)",
  "Jaiz Bank",
  "Keystone Bank",
  "Moniepoint MFB",
  "Opay",
  "Palmpay",
  "Stanbic IBTC Bank",
  "Standard Chartered",
  "Sterling Bank",
  "Union Bank",
  "United Bank for Africa (UBA)",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
];

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
