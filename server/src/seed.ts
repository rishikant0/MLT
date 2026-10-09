import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from './lib/db';
import {
  User,
  Course,
  Semester,
  Subject,
  Material,
  Blog,
} from './models';

dotenv.config();

const INITIAL_COURSES = [
  { name: 'D Pharma', category: 'Pharmacy', duration: '2 Years', eligibility: '10+2 PCB/PCM' },
  { name: 'B Pharma', category: 'Pharmacy', duration: '4 Years', eligibility: '10+2 PCB/PCM (50%)' },
  { name: 'DMLT', category: 'Medical Lab Technology', duration: '2 Years', eligibility: '10+2 Science' },
  { name: 'BMLS', category: 'Medical Lab Technology', duration: '4 Years', eligibility: '10+2 PCB/PCM' },
  { name: 'DOT', category: 'Operation Theatre', duration: '2 Years', eligibility: '10+2 Science' },
  { name: 'BOT', category: 'Operation Theatre', duration: '4 Years', eligibility: '10+2 PCB' },
  { name: 'DRIT', category: 'Radiology & Imaging', duration: '2 Years', eligibility: '10+2 Science' },
  { name: 'BRIT', category: 'Radiology & Imaging', duration: '4 Years', eligibility: '10+2 PCB' },
  { name: 'B.Sc Cath Lab', category: 'Cardiology Technology', duration: '3 Years', eligibility: '10+2 PCB' },
  { name: 'B.Sc Optometry', category: 'Eye Care Technology', duration: '4 Years', eligibility: '10+2 PCB' },
  { name: 'B.Sc Cardiac Perfusion', category: 'Cardiology Technology', duration: '4 Years', eligibility: '10+2 PCB' },
  { name: 'B.Sc Emergency Technician', category: 'Critical & Emergency Care', duration: '3 Years', eligibility: '10+2 PCB' },
  { name: 'ANM', category: 'Nursing Care', duration: '2 Years', eligibility: '10+2 Any Stream' },
  { name: 'GNM', category: 'Nursing Care', duration: '3 Years', eligibility: '10+2 PCB (40%)' },
  { name: 'B.Sc Nursing', category: 'Nursing Care', duration: '4 Years', eligibility: '10+2 PCB (45%)' },
];

async function seed() {
  await connectDB();

  console.log('🌱 Starting MongoDB database seeding for Allied Learning Zone...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Semester.deleteMany({}),
    Subject.deleteMany({}),
    Material.deleteMany({}),
    Blog.deleteMany({}),
  ]);

  console.log('🧹 Cleaned existing database records.');

  // 1. Seed Demo Admin & Student Users
  const rawAdminEmail = process.env.ADMIN_EMAIL || 'Alliedlearningzone@gmail.com';
  const rawAdminPassword = process.env.ADMIN_PASSWORD || 'Allied@5995';
  const adminPassword = await bcrypt.hash(rawAdminPassword, 10);
  const studentPassword = await bcrypt.hash('Student@12345', 10);

  const admin = await User.create({
    name: 'Academic Administrator',
    email: rawAdminEmail.toLowerCase().trim(),
    phone: '+916206465995',
    password: adminPassword,
    role: 'ADMIN',
    isVerified: true,
    status: 'ACTIVE',
  });

  const student = await User.create({
    name: 'Rahul Sharma',
    email: 'student@alliedlearningzone.com',
    phone: '+919876543211',
    password: studentPassword,
    role: 'STUDENT',
    isVerified: true,
    status: 'ACTIVE',
  });

  console.log(`👤 Admin created: ${admin.email}`);
  console.log(`👤 Student created: ${student.email}`);

  // 2. Seed All 15 Courses
  const createdCourses = [];
  for (const cData of INITIAL_COURSES) {
    const slug = cData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const course = await Course.create({
      name: cData.name,
      slug,
      category: cData.category,
      duration: cData.duration,
      eligibility: cData.eligibility,
      shortDescription: `Professional ${cData.name} degree curriculum notes, MCQs, and exam question banks.`,
      description: `Comprehensive academic prep program for ${cData.name} students containing verified medical notes, handwritten summaries, chapterwise MCQs, and previous year university exam questions.`,
      price: 2999,
      offerPrice: 2499,
      careerOpportunities: [
        'Government & Private Hospitals',
        'Clinical Diagnostic Centers',
        'Medical Research Institutions',
        'Healthcare Quality Assurance',
      ],
      thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=60',
      status: 'ACTIVE',
    });
    createdCourses.push(course);
  }

  console.log(`📚 ${createdCourses.length} courses seeded successfully.`);

  // 3. Seed Semesters, Subjects, and Materials for major courses
  const coursesToSeed = [
    { slug: 'anm', code: 'ANM' },
    { slug: 'bmls', code: 'BMLS' },
    { slug: 'dmlt', code: 'DMLT' },
    { slug: 'b-pharma', code: 'BPH' },
    { slug: 'd-pharma', code: 'DPH' },
    { slug: 'gnm', code: 'GNM' },
    { slug: 'b-sc-nursing', code: 'BSN' },
  ];

  for (const cInfo of coursesToSeed) {
    const courseObj = createdCourses.find((c) => c.slug === cInfo.slug);
    if (!courseObj) continue;

    const sem1 = await Semester.create({
      courseId: courseObj._id,
      name: 'Semester 1',
      semesterNumber: 1,
      description: `Foundational ${courseObj.name} Semester 1 Curriculum`,
      price: 2499,
      status: 'ACTIVE',
    });

    const sem2 = await Semester.create({
      courseId: courseObj._id,
      name: 'Semester 2',
      semesterNumber: 2,
      description: `Advanced ${courseObj.name} Semester 2 Curriculum`,
      price: 2499,
      status: 'ACTIVE',
    });

    const subj1 = await Subject.create({
      courseId: courseObj._id,
      semesterId: sem1._id,
      name: `${courseObj.name} Anatomy & Fundamentals`,
      code: `${cInfo.code}-101`,
      description: 'Core concepts, tissue anatomy, and fundamental procedures',
      price: 499,
      status: 'ACTIVE',
    });

    const subj2 = await Subject.create({
      courseId: courseObj._id,
      semesterId: sem1._id,
      name: `${courseObj.name} Physiology & Clinical Practice`,
      code: `${cInfo.code}-102`,
      description: 'System physiology, clinical pathology, and lab protocols',
      price: 499,
      status: 'ACTIVE',
    });

    await Material.create([
      {
        courseId: courseObj._id,
        semesterId: sem1._id,
        subjectId: subj1._id,
        title: `${courseObj.name} Semester 1 Detailed Study Notes`,
        description: 'Comprehensive chapterwise PDF notes covering core topics.',
        type: 'PDF',
        file: '/uploads/materials/sample_notes.pdf',
        filePath: '/uploads/materials/sample_notes.pdf',
        fileSize: '4.5 MB',
        mimeType: 'application/pdf',
        isPaid: true,
        price: 199,
        status: 'ACTIVE',
      },
      {
        courseId: courseObj._id,
        semesterId: sem1._id,
        subjectId: subj1._id,
        title: `${courseObj.name} Topper Handwritten Notes`,
        description: 'High-yield handwritten diagrams and mnemonics.',
        type: 'HANDWRITTEN_NOTES',
        file: '/uploads/materials/sample_handwritten.pdf',
        filePath: '/uploads/materials/sample_handwritten.pdf',
        fileSize: '6.1 MB',
        mimeType: 'application/pdf',
        isPaid: true,
        price: 199,
        status: 'ACTIVE',
      },
      {
        courseId: courseObj._id,
        semesterId: sem1._id,
        subjectId: subj1._id,
        title: `${courseObj.name} Free Sample Practice MCQs`,
        description: 'Free sample questions for self-assessment.',
        type: 'MCQ',
        file: '/uploads/materials/sample_mcq.pdf',
        filePath: '/uploads/materials/sample_mcq.pdf',
        fileSize: '2.1 MB',
        mimeType: 'application/pdf',
        isPaid: false,
        price: 0,
        status: 'ACTIVE',
      },
    ]);
  }

  console.log('📖 Sample Semesters, Subjects, and Materials created.');

  // 4. Seed Blogs
  await Blog.create([
    {
      title: 'How to Crack BMLS & DMLT Board Exams in 2026',
      slug: 'how-to-crack-bmls-dmlt-board-exams-2026',
      category: 'Exam Strategy',
      author: 'Dr. Suresh Kumar, HOD MLT',
      content: `Preparing for Medical Laboratory Technology university exams requires structured planning, continuous diagram practice, and clear conceptual understanding of Clinical Biochemistry and Pathology.\n\nKey Strategies:\n1. Focus on Diagrammatic Representations\n2. Solve 5 Previous Years Question Papers\n3. Memorize Normal Reference Values for Hematology and Bio-chemistry tests.`,
      status: 'PUBLISHED',
      seoTitle: 'BMLS & DMLT Exam Preparation Strategy Guide 2026',
      seoDescription: 'Expert academic advice for paramedical students to clear BMLS and DMLT semester exams with top distinction.',
    },
    {
      title: 'Top Career Opportunities after B.Pharma and D.Pharma',
      slug: 'top-career-opportunities-after-bpharma-dpharma',
      category: 'Career Guidance',
      author: 'Prof. Ananya Sen',
      content: `Pharmacy education opens doors to diverse sectors including Pharmaceutical Manufacturing, Quality Control, Clinical Research, Regulatory Affairs, and Retail Pharmacy Entrepreneurship.`,
      status: 'PUBLISHED',
      seoTitle: 'B Pharma & D Pharma Career Options & Salary Guide',
      seoDescription: 'Explore high-paying career paths and job profiles for Pharmacy graduates in India and abroad.',
    },
  ]);

  console.log('📰 Sample Blogs seeded successfully.');
  console.log('✅ DATABASE SEEDING COMPLETE!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding Error:', err);
  process.exit(1);
});
