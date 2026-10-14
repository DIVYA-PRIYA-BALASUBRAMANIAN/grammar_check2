// Zenve Vet™ — Comprehensive Mock Data Ecosystem

export const MOCK_DOCTORS = [
  {
    id: "doc-1",
    name: "Dr. Ananya Sharma",
    specialty: "Small Animal Medicine",
    city: "Bengaluru",
    state: "Karnataka",
    avatar: "https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=600&q=80",
    verified: true,
    isExample: true,
    qualification: "BVSc & AH, MVSc (Medicine)",
    clinic: "Bangalore Pet Hospital & Critical Care",
    experienceYears: 8,
    casesCount: 34,
    bio: "Passionate about internal veterinary medicine, canine endocrinology, and critical emergency triage. Contributing member of Indian Veterinary Association.",
    connectionsCount: 428
  },
  {
    id: "doc-2",
    name: "Dr. Arjun Mehta",
    specialty: "Veterinary Surgery",
    city: "Mumbai",
    state: "Maharashtra",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
    verified: true,
    isExample: true,
    qualification: "BVSc, MVSc (Surgery & Radiology)",
    clinic: "MetroVet Super Specialty Hospital, Bandra",
    experienceYears: 12,
    casesCount: 89,
    bio: "Specializing in soft tissue reconstructive surgery and minimally invasive laparoscopy in small companion animals.",
    connectionsCount: 712
  },
  {
    id: "doc-3",
    name: "Dr. Priya Nair",
    specialty: "Veterinary Dermatology",
    city: "Kochi",
    state: "Kerala",
    avatar: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80",
    verified: true,
    isExample: true,
    qualification: "BVSc & AH, PhD (Dermatology)",
    clinic: "Cochin Animal Allergy & Skin Clinic",
    experienceYears: 10,
    casesCount: 45,
    bio: "Dedicated to chronic atopic dermatitis management, intradermal testing, and autoimmune skin conditions in canines and felines.",
    connectionsCount: 560
  },
  {
    id: "doc-4",
    name: "Dr. Vikram Singh",
    specialty: "Equine Medicine",
    city: "Jaipur",
    state: "Rajasthan",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80",
    verified: true,
    isExample: true,
    qualification: "BVSc & AH, MVSc (Equine Sports Medicine)",
    clinic: "Royal Rajasthan Stud & Equine Clinic",
    experienceYears: 15,
    casesCount: 62,
    bio: "Field expert in Thoroughbred sports orthopedics, colic management, and performance horse rehabilitation.",
    connectionsCount: 380
  },
  {
    id: "doc-5",
    name: "Dr. Tanya Bhatt",
    specialty: "Veterinary Surgery",
    city: "Dehradun",
    state: "Uttarakhand",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
    verified: true,
    isExample: true,
    qualification: "MVSc (Wildlife Health & Conservation)",
    clinic: "Himalayan Wildlife Rescue Trust",
    experienceYears: 9,
    casesCount: 29,
    bio: "Focused on soft tissue surgical procedures, avian orthopedics, and emergency wildlife triage.",
    connectionsCount: 495
  },
  {
    id: "doc-6",
    name: "Dr. Suresh Patil",
    specialty: "Small Animal Medicine",
    city: "Nashik",
    state: "Maharashtra",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80",
    verified: true,
    isExample: true,
    qualification: "BVSc, MVSc (Medicine & Clinical Dietetics)",
    clinic: "Sahyadri Pet Clinic & Critical Care",
    experienceYears: 14,
    casesCount: 53,
    bio: "Diagnostic clinical protocols, renal therapeutics, and companion animal gastroenterology.",
    connectionsCount: 310
  },
  {
    id: "doc-7",
    name: "Dr. Divya Menon",
    specialty: "Preventive Medicine",
    city: "Thiruvananthapuram",
    state: "Kerala",
    avatar: "https://images.unsplash.com/photo-1594824813603-78e7f9ff32f9?auto=format&fit=crop&w=300&q=80",
    verified: true,
    isExample: true,
    qualification: "BVSc & AH, MPH",
    clinic: "Apex Veterinary One Health Center",
    experienceYears: 7,
    casesCount: 38,
    bio: "One Health advocate focusing on anti-rabies protocols, vector-borne disease suppression, and public veterinary health.",
    connectionsCount: 440
  },
  {
    id: "doc-8",
    name: "Dr. Harpreet Kaur",
    specialty: "Veterinary Ophthalmology",
    city: "Chandigarh",
    state: "Punjab",
    avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80",
    verified: true,
    isExample: true,
    qualification: "BVSc, MVSc (Ophthalmology)",
    clinic: "VisionVet Animal Eye Hospital",
    experienceYears: 11,
    casesCount: 74,
    bio: "Microsurgery of the cornea, phacoemulsification for canine cataracts, and gonioscopy for glaucoma screening.",
    connectionsCount: 520
  }
];

export const MOCK_STORIES = [
  {
    id: "story-1",
    doctorName: "Ananya",
    fullDoctorName: "Dr. Ananya Sharma",
    avatar: "https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=300&q=80",
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80",
    caption: "Post-op recovery for Bruno after successful GDV gastropexy. Vital signs fully stable!",
    time: "2h ago"
  },
  {
    id: "story-2",
    doctorName: "Arjun",
    fullDoctorName: "Dr. Arjun Mehta",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
    image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80",
    caption: "Laparoscopic ovariectomy in a 14-month Golden Retriever. Minimal incision, quick recovery.",
    time: "4h ago"
  },
  {
    id: "story-3",
    doctorName: "Priya",
    fullDoctorName: "Dr. Priya Nair",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80",
    caption: "Cytology of Malassezia dermatitis resolved at 3-week follow up.",
    time: "6h ago"
  },
  {
    id: "story-4",
    doctorName: "Kavya",
    fullDoctorName: "Dr. Kavya Sundaram",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80",
    image: "https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=80",
    caption: "Ultrasound screening showed early stage feline hypertrophic cardiomyopathy. Initiating atenolol.",
    time: "7h ago"
  },
  {
    id: "story-5",
    doctorName: "Sanjay",
    fullDoctorName: "Dr. Sanjay Verma",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80",
    image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80",
    caption: "Field vaccination drive in rural Pune completed — 120 animals covered today!",
    time: "9h ago"
  },
  {
    id: "story-6",
    doctorName: "Ritika",
    fullDoctorName: "Dr. Ritika Joshi",
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=300&q=80",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    caption: "Avian beak repair using dental acrylic composite on an injured rescue parrot.",
    time: "12h ago"
  }
];

export const MOCK_POSTS = [
  {
    id: "post-1",
    authorId: "doc-5",
    authorName: "Dr. Tanya Bhatt",
    authorSpecialty: "Wildlife Medicine",
    authorCity: "Dehradun",
    authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    timeAgo: "3 hours ago",
    type: "CLINICAL_CASE",
    badgeLabel: "CASE REPORT · WILDLIFE TRIAGE",
    content: "Sharing an unusual presentation: An adult rescued Himalayan Black Bear cub presented with acute unilateral corneal edema, hyphema, and lethargy following trauma. Slit lamp evaluation revealed superficial stromal ulceration without deep perforation. Initiated topical autologous serum drops and oral NSAID protocol. Follow up at Day 7 shown below with significant clearing.",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    likes: 84,
    commentsCount: 19,
    isLiked: false,
    isBookmarked: false,
    species: "Wildlife",
    tags: ["CornealUlcer", "Ophthalmology", "WildlifeMedicine", "AutologousSerum"]
  },
  {
    id: "post-2",
    authorId: "doc-1",
    authorName: "Dr. Ananya Sharma",
    authorSpecialty: "Small Animal Medicine",
    authorCity: "Bengaluru",
    authorAvatar: "https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=300&q=80",
    timeAgo: "6 hours ago",
    type: "GENERAL_POST",
    badgeLabel: "CLINICAL INSIGHT",
    content: "Reminder for colleagues dealing with canine immune-mediated hemolytic anemia (IMHA): Don't overlook low-dose ultra-fractionated heparin alongside prednisolone when spherocytosis is prominent. We have observed a 40% reduction in thromboembolic events over the last 18 months using early thromboprophylaxis. What protocol are you all preferring in your practice?",
    imageUrl: null,
    likes: 128,
    commentsCount: 42,
    isLiked: true,
    isBookmarked: true,
    species: "Canine",
    tags: ["InternalMedicine", "Hematology", "IMHA", "CriticalCare"]
  },
  {
    id: "post-3",
    authorId: "doc-2",
    authorName: "Dr. Arjun Mehta",
    authorSpecialty: "Veterinary Surgery",
    authorCity: "Mumbai",
    authorAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
    timeAgo: "Yesterday",
    type: "CLINICAL_CASE",
    badgeLabel: "SURGICAL RECONSTRUCTION",
    content: "Successful management of a comminuted humeral fracture in a 3-year-old German Shepherd using a 3.5mm locking compression plate (LCP) and intramedullary pin tie-in. Immediate post-op radiographic alignment shows anatomic reduction with restoration of the mechanical axis. Full weight-bearing resumed within 72 hours.",
    imageUrl: "https://images.unsplash.com/photo-1516715094483-75da7dee9758?auto=format&fit=crop&w=800&q=80",
    likes: 215,
    commentsCount: 36,
    isLiked: false,
    isBookmarked: false,
    species: "Canine",
    tags: ["Orthopedics", "FractureRepair", "LCP", "VeterinarySurgery"]
  }
];

export const MOCK_CLINICAL_CASES = [
  {
    id: "case-1",
    title: "Acute Dilated Cardiomyopathy with Atrial Fibrillation in a Doberman Pinscher",
    authorName: "Dr. Ananya Sharma",
    authorSpecialty: "Small Animal Cardiology",
    species: "Canine (Doberman, 6 yr, Male)",
    presentingComplaint: "Acute syncope episode, exercise intolerance, tachypnea at rest for 48 hours.",
    clinicalFindings: "Heart rate 190 bpm with pulse deficits. Gallop sound noted on auscultation. CRT 2.5s. ECG confirmed fast atrial fibrillation with wide QRS complexes.",
    diagnostics: "Echocardiogram: LVIDd 62mm (severely dilated), Fractional Shortening 11% (normal 25-45%). Thoracic radiographs revealed severe cardiomegaly and mild alveolar pulmonary edema.",
    diagnosis: "Stage C Dilated Cardiomyopathy (DCM) secondary to genetic predisposition, complicated by atrial fibrillation.",
    treatmentProtocol: "1. Pimobendan 0.25 mg/kg PO BID (inodilator)\n2. Furosemide 2 mg/kg IV then 1.5 mg/kg PO BID\n3. Diltiazem 0.5 mg/kg PO TID for ventricular rate control\n4. Benazepril 0.5 mg/kg PO SID",
    outcome: "Patient stabilized within 36 hours. Resting respiratory rate decreased to 22 bpm. Active and quality of life preserved at 6-month follow-up.",
    views: 480,
    comments: 24,
    mediaUrl: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "case-2",
    title: "Strangulating Lipoma Causing Small Intestinal Volvulus in an Aged Marwari Stallion",
    authorName: "Dr. Vikram Singh",
    authorSpecialty: "Equine Surgery",
    species: "Equine (Marwari, 18 yr, Stallion)",
    presentingComplaint: "Severe unremitting colic unresponsive to flunixin meglumine. Pawing, sweating, violent recumbency.",
    clinicalFindings: "Heart rate 78 bpm, toxic mucous membrane rings, absent borborygmi in all four quadrants. Nasogastric reflux yielded 8 liters of foul net-positive fluid.",
    diagnostics: "Abdominal ultrasound (FLASH protocol) showed distended, amotile small intestinal loops (>5cm diameter) with thickened hyperechoic wall (>4mm) in ventral abdomen.",
    diagnosis: "Strangulating pedunculated lipoma of the jejunum requiring immediate exploratory laparotomy.",
    treatmentProtocol: "Ventral midline laparotomy under general inhalation anesthesia. Identified 1.2m of ischemic jejunum encircling a pedunculated lipoma. Performed enterectomy and side-to-side jejunojejunal anastomosis with polyglactin 910.",
    outcome: "Discharged at Day 12 post-surgery. Full recovery to paddock turnout at Week 8.",
    views: 620,
    comments: 31,
    mediaUrl: "https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "case-3",
    title: "Canine Generalized Demodicosis with Secondary Pseudomonas Folliculitis",
    authorName: "Dr. Priya Nair",
    authorSpecialty: "Veterinary Dermatology",
    species: "Canine (Pug, 1.5 yr, Female)",
    presentingComplaint: "Generalized alopecia, erythema, severe pruritus, crusting, and foul odor across trunk and facial folds.",
    clinicalFindings: "Extensive follicular casts, pustules, comedones, and draining tracts over dorsum and paws. Peripheral lymphadenopathy.",
    diagnostics: "Deep skin scrapings revealed high numbers of Demodex canis adult mites and cigar-shaped eggs (>20 per high-power field). Bacterial culture identified multidrug-resistant Pseudomonas aeruginosa.",
    diagnosis: "Juvenile-onset Generalized Demodicosis with secondary deep pyoderma.",
    treatmentProtocol: "1. Fluralaner (Bravecto) single oral dose repeated at 12 weeks\n2. Marbofloxacin 5 mg/kg PO SID based on susceptibility\n3. Weekly chlorhexidine 4% medicated bathes\n4. Avoided any immunosuppressive steroids",
    outcome: "Two consecutive negative skin scrapings achieved at Week 8. 100% hair re-growth at Month 3.",
    views: 395,
    comments: 18,
    mediaUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80"
  }
];

export const MOCK_SHORT_VIDEOS = [
  {
    id: "vid-1",
    title: "Rapid Subdermal Suture Pattern for Tension Relief",
    doctorName: "Dr. Arjun Mehta",
    doctorSpecialty: "Surgery · Mumbai",
    views: "3.4k",
    duration: "0:45",
    thumbnail: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=500&q=80",
    likes: 412,
    comments: 29
  },
  {
    id: "vid-2",
    title: "Identifying Comet-Tail Artifacts on Lung Ultrasound (TFAST)",
    doctorName: "Dr. Ananya Sharma",
    doctorSpecialty: "Critical Care · Bengaluru",
    views: "5.8k",
    duration: "0:58",
    thumbnail: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&q=80",
    likes: 670,
    comments: 48
  },
  {
    id: "vid-3",
    title: "Low-Stress Feline Blood Sampling: Medial Saphenous Technique",
    doctorName: "Dr. Priya Nair",
    doctorSpecialty: "Feline Practice · Kochi",
    views: "4.1k",
    duration: "0:39",
    thumbnail: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80",
    likes: 520,
    comments: 34
  },
  {
    id: "vid-4",
    title: "Correct Intubation Angle in Psittacine Birds",
    doctorName: "Dr. Tanya Bhatt",
    doctorSpecialty: "Avian/Exotics · Dehradun",
    views: "2.9k",
    duration: "0:52",
    thumbnail: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=500&q=80",
    likes: 380,
    comments: 22
  }
];

export const MOCK_CONVERSATIONS = [
  {
    id: "chat-1",
    doctor: MOCK_DOCTORS[0], // Dr. Ananya Sharma
    lastMessage: "Thank you for the echo interpretation! The DCM patient is now stabilized on Pimobendan.",
    timestamp: "10:45 AM",
    unread: 1,
    messages: [
      { id: 1, sender: "me", text: "Hi Dr. Ananya, did you get a chance to review the ECG recording I sent for Bruno?", time: "10:20 AM" },
      { id: 2, sender: "doctor", text: "Yes! Fast atrial fibrillation with variable R-R intervals. I recommend starting diltiazem at 0.5 mg/kg PO TID alongside pimobendan.", time: "10:35 AM" },
      { id: 3, sender: "me", text: "Will initiate right away and monitor blood pressure.", time: "10:40 AM" },
      { id: 4, sender: "doctor", text: "Thank you for the echo interpretation! The DCM patient is now stabilized on Pimobendan.", time: "10:45 AM" }
    ]
  },
  {
    id: "chat-2",
    doctor: MOCK_DOCTORS[1], // Dr. Arjun Mehta
    lastMessage: "I can take the orthopedic referral on Thursday morning.",
    timestamp: "Yesterday",
    unread: 0,
    messages: [
      { id: 1, sender: "doctor", text: "Hey! Saw your post regarding the humeral fracture. Amazing LCP alignment.", time: "Yesterday" },
      { id: 2, sender: "me", text: "Thanks Arjun. Do you have slots for a complex TPLO referral later this week?", time: "Yesterday" },
      { id: 3, sender: "doctor", text: "I can take the orthopedic referral on Thursday morning.", time: "Yesterday" }
    ]
  }
];

export const SPECIALTIES = [
  "All specialties",
  "Small Animal Medicine",
  "Veterinary Surgery",
  "Veterinary Dermatology",
  "Equine Medicine",
  "Wildlife Medicine",
  "Animal Nutrition",
  "Preventive Medicine",
  "Veterinary Ophthalmology",
  "Veterinary Cardiology",
  "Avian & Exotic Medicine",
  "Veterinary Pathology"
];

export const STATES_INDIA = [
  "All states",
  "Karnataka",
  "Maharashtra",
  "Kerala",
  "Rajasthan",
  "Uttarakhand",
  "Punjab",
  "Delhi",
  "Tamil Nadu",
  "Telangana",
  "Gujarat",
  "West Bengal"
];
