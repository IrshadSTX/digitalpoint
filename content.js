/**
 * ============================================================
 *  DIGITAL POINT — SITE CONTENT
 *  ────────────────────────────────────────────────────────
 *  Edit ONLY this file to update text, numbers, links, and
 *  image paths across the entire website.
 *
 *  HOW TO EDIT:
 *    1. Open this file in any text editor (Notepad, VS Code…)
 *    2. Change the value inside the quotes " "
 *    3. Save the file
 *    4. Push to GitHub — the live site updates in ~2 minutes
 *
 *  RULES:
 *    • Do NOT remove or rename the property keys (left side)
 *    • Only change the values (right side, inside quotes)
 *    • Keep all commas and quote marks intact
 * ============================================================
 */

const CONTENT = {

  /* ── Company info ─────────────────────────────────────── */
  company: {
    name: "Digital Point",
    tagline: "Virtual Power",
    address: "Areekode, Malappuram District, Kerala",
    phone1: "9447247595",
    phone2: "9446250595",
    phone3: "0483 296 5000",
    email: "info@digitalpoint.in",
    copyright: "© 2026 Digital Point, Areekode, Malappuram. All rights reserved.",
  },

  /* ── Social media links ───────────────────────────────── */
  social: {
    instagram: "https://www.instagram.com/digital__point_",
    facebook: "#",   // paste your Facebook page URL here
    x: "#",   // paste your X (Twitter) URL here
    telegram: "#",   // paste your Telegram link here
  },

  /* ── Popup modal ──────────────────────────────────────── */
  popup: {
    badge: "🎓 Admissions Open",
    title_line1: "2026–28 Batch",
    title_line2: "Now Enrolling!",
    subtitle: "B.Ed & M.Ed from Kerala PSC approved universities.",
    urgency: "Limited seats — don't miss your chance.",
    feat1: "Kerala PSC Approved",
    feat2: "TNTEU & SV University",
    feat3: "DiGi Learning App Included",
    feat4: "Free Textbooks & Notes",
    cta_btn: "Enroll Now — It's Free ✦",
    later_btn: "Maybe Later",
  },

  /* ── Navbar ───────────────────────────────────────────── */
  nav: {
    cta_btn: "Apply Now →",
  },

  /* ── Hero section ─────────────────────────────────────── */
  hero: {
    badge: "Admissions Open 2026–28",
    title_line1: "Your Path to a",
    title_line2: "Kerala PSC",
    title_line3: "Teaching Career",
    subtitle: "Kerala's trusted B.Ed & M.Ed admission consultancy. We place you in Kerala PSC-approved, UGC/NCTE-recognised universities — with live classes, study support, and guaranteed guidance from Day 1.",
    cta_primary: "Apply for 2026–28 →",
    cta_secondary: "View Programs ↓",

    /* Stats — update numbers here */
    stat1_num: "2,400+",
    stat1_label: "Students Placed",
    stat2_num: "98%",
    stat2_label: "Success Rate",
    stat3_num: "7",
    stat3_label: "Specialisations",
    stat4_num: "3",
    stat4_label: "University Equivalency",
  },

  /* ── Enquiry card (inside hero) ───────────────────────── */
  card: {
    tag: "✦ Free Admission Enquiry",
    title: "Get Counselling Absolutely Free",
    subtitle: "Fill in your details — our team will call you within 24 hours.",
    cta_btn: "Get Free Counselling ✦",
    success: "✓ We'll Call You Within 24 Hours!",
  },

  /* ── Features strip ───────────────────────────────────── */
  features: [
    { icon: "✅", title: "Kerala PSC Approved", desc: "Recognised for all Kerala government teaching posts" },
    { icon: "🏛️", title: "University Equivalency", desc: "Kerala, Kannur & Calicut University approved" },
    { icon: "📱", title: "DiGi Learning App", desc: "Live & recorded classes on our official app" },
    { icon: "📞", title: "Direct Support", desc: "Call us: 9447247595 / 9446250595" },
  ],

  /* ── Programs section ─────────────────────────────────── */
  programs: {
    section_label: "Our Programs",
    section_title: "B.Ed & M.Ed from Top Universities",
    section_sub: "Admissions open for 2026–28 batch from Tamil Nadu Teacher Education University (TNTEU) and Sri Venkateswara University, Tirupathi — both Kerala PSC approved with limited seats.",

    universities: [
      {
        name: "TNTEU",
        full: "Tamil Nadu Teacher Education University",
        url: "https://www.tnteu.ac.in/",
      },
      {
        name: "SV University",
        full: "Sri Venkateswara University, Tirupathi",
        url: "https://svuniversity.edu.in/",
      },
    ],

    cards: [
      {
        badge: "B.Ed 2026–28 · Limited Seats",
        icon: "🎓",
        name: "Bachelor of Education",
        desc: "Kerala PSC approved B.Ed with equivalency from Kerala, Kannur, and Calicut University. Includes live & recorded classes via DiGi Learning App.",
        details: ["English", "Mathematics", "Physical Science", "Biological Science", "Commerce", "Computer Science", "Social Science"],
        cta: "Apply Now →",
        featured: true,
      },
      {
        badge: "",
        icon: "📖",
        name: "Master of Education",
        desc: "Advance your career with an M.Ed degree from UGC/NCTE/UPSC approved universities. Ideal for experienced teachers seeking promotion eligibility.",
        details: ["Kerala PSC Approved", "UGC / NCTE / UPSC Recognised", "Equivalency: Kerala, Kannur, Calicut University", "Live + Recorded Classes", "Previous Year Question Papers", "Free Textbooks (PDF)"],
        cta: "Apply Now →",
        featured: false,
      },
      {
        badge: "",
        icon: "📱",
        name: "DiGi Learning App",
        desc: "Digital Point's official mobile app — your complete B.Ed / M.Ed syllabus in one place, available free on Play Store and App Store.",
        details: ["Live Classes", "Recorded Video Lectures", "Previous Year Question Papers", "Doubt Clearing Sessions", "Free Textbooks — PDF", "Free Class Notes — PDF"],
        cta: "",
        featured: false,
      },
    ],
  },

  /* ── More Courses (admission posters) ────────────────── */
  courses: {
    section_label: "All Programmes",
    section_title: "More Courses We Offer",
    section_sub: "Beyond B.Ed & M.Ed — explore our full range of programmes for 2026–27.",
    items: [
      { name: "Ph.D Education", img: "assets/images/courses/8.jpg" },
      { name: "LLB", img: "assets/images/courses/7.jpg" },
      { name: "MSc Chemistry", img: "assets/images/courses/6.jpg" },
      { name: "MSc Psychology", img: "assets/images/courses/5.jpg" },
      { name: "MSc Physics", img: "assets/images/courses/1.jpg" },
      { name: "MSc Zoology", img: "assets/images/courses/3.jpg" },
      { name: "MSc Botany", img: "assets/images/courses/2.jpg" },
      { name: "MSc Mathematics", img: "assets/images/courses/4.jpg" },
    ],
  },

  /* ── App download links ───────────────────────────────── */
  app: {
    android: "https://play.google.com/store/apps/details?id=co.stan.sbgwq",
    ios: "https://apps.apple.com/in/app/classplus/id1324522260",
  },

  /* ── Why choose us ────────────────────────────────────── */
  why: {
    section_label: "Why Digital Point",
    section_title: "Everything You Need to Succeed",
    section_sub: "From admission to exam — we support you at every step with approvals, study material, and live learning.",
    cards: [
      { icon: "✅", title: "Kerala PSC Approved", desc: "Degrees valid for all Kerala government and aided school teaching posts." },
      { icon: "🏛️", title: "3 University Equivalency", desc: "Equivalency from Kerala University, Kannur University, and Calicut University." },
      { icon: "📜", title: "UGC / NCTE / UPSC", desc: "Fully approved by UGC, NCTE, and UPSC — nationally recognised credentials." },
      { icon: "📚", title: "Free Study Material", desc: "All 4 semester textbooks, class notes, and question papers provided free." },
    ],
  },

  /* ── Admission process ────────────────────────────────── */
  process: {
    section_label: "Simple Process",
    section_title: "Admission in 4 Easy Steps",
    section_sub: "We handle the paperwork so you focus on your future.",
    steps: [
      { num: "01", title: "Free Counselling", desc: "Call us or fill the form. Our advisor maps the right programme and university to your profile." },
      { num: "02", title: "Document Verification", desc: "We check your marksheets and certificates and guide you through any eligibility requirements." },
      { num: "03", title: "University Selection", desc: "Choose TNTEU or SV University based on your subject, budget, and career goals." },
      { num: "04", title: "Enrolment Confirmed", desc: "Complete the process and start learning immediately on the DiGi Learning App." },
    ],
  },

  /* ── Gallery section ──────────────────────────────────── */
  gallery: {
    section_label: "Media",
    section_title: "Photos & Videos",
    section_sub: "A glimpse of our classes, campus visits, and student life at Digital Point.",

    /**
     * PHOTOS — add your image file names here.
     * Place the image files in: assets/images/gallery/
     * Example: { src: "assets/images/gallery/classroom.jpg", alt: "Classroom session" }
     */
    photos: [
      { src: "", alt: "Add photo here" },
      { src: "", alt: "Add photo here" },
      { src: "", alt: "Add photo here" },
      { src: "", alt: "Add photo here" },
      { src: "", alt: "Add photo here" },
      { src: "", alt: "Add photo here" },
    ],

    /**
     * VIDEOS — paste your YouTube video IDs here.
     * Find the ID in the YouTube URL: youtube.com/watch?v=VIDEO_ID
     * Example: { id: "dQw4w9WgXcQ", caption: "Orientation Day 2024" }
     */
    videos: [
      { id: "", caption: "Add your YouTube video ID here" },
      { id: "", caption: "Add your YouTube video ID here" },
      { id: "", caption: "Add your YouTube video ID here" },
    ],
  },

  /* ── Achievements carousel ────────────────────────────── */
  achievements: [
    { icon: "🎓", num: "2,400+", title: "Students Enrolled", desc: "Successful B.Ed & M.Ed admissions handled since our founding." },
    { icon: "✅", num: "98%", title: "Admission Success Rate", desc: "Industry-leading success rate with end-to-end documentation support." },
    { icon: "🏛️", num: "2", title: "Partner Universities", desc: "TNTEU & SV University — both Kerala PSC and UGC approved." },
    { icon: "📜", num: "3", title: "University Equivalency", desc: "Equivalency from Kerala, Kannur & Calicut Universities." },
    { icon: "📱", num: "1", title: "Official Learning App", desc: "DiGi Learning App with live classes, notes & question papers — free." },
    { icon: "🧑‍🏫", num: "7", title: "B.Ed Specialisations", desc: "English, Maths, Science, Commerce, Computer Science, Social Science & more." },
    { icon: "⚡", num: "7–10", title: "Days to Admission", desc: "Fast-track processing — admission letter in your hands within days." },
    { icon: "📚", num: "100%", title: "Free Study Material", desc: "All 4 semester textbooks, class notes and PYQs provided at no cost." },
  ],

  /* ── Testimonials ─────────────────────────────────────── */
  testimonials: {
    section_label: "Student Stories",
    section_title: "Trusted by Teachers Across Kerala",
    section_sub: "Real experiences from students who built their teaching careers with Digital Point.",
    cards: [
      {
        text: "Digital Point guided me through my entire B.Ed admission. The DiGi Learning App is excellent — live classes, notes, everything in one place. Highly recommended for anyone serious about a teaching career.",
        name: "Akhila K.",
        meta: "B.Ed — Mathematics · Malappuram",
        initials: "AK",
        stars: 5,
      },
      {
        text: "I was worried about Kerala PSC approval. The team at Digital Point confirmed everything — TNTEU degree with full equivalency. Got my admission confirmed in less than two weeks.",
        name: "Rahul S.",
        meta: "B.Ed — English · Kozhikode",
        initials: "RS",
        stars: 5,
      },
      {
        text: "The free textbooks and recorded classes saved me so much. The doubt clearing sessions before exams were especially helpful. Digital Point is more than just an admission office — they support you throughout.",
        name: "Nisha M.",
        meta: "M.Ed · Areekode",
        initials: "NM",
        stars: 5,
      },
    ],
  },

  /* ── CTA band ─────────────────────────────────────────── */
  cta: {
    title_line1: "Seats Are Limited —",
    title_line2: "Apply for 2026–28 Today",
    subtitle: "B.Ed & M.Ed admissions from TNTEU and SV University are now open. Call us or fill the form — counselling is completely free.",
    btn_primary: "Apply Now — It's Free",
    btn_social: "📸 Follow on Instagram",
  },

};
