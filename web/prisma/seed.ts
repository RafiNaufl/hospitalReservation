import { PrismaClient, UserRole } from '../src/generated/prisma';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from 'bcrypt';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // 1. Clear existing data
  await prisma.notificationLog.deleteMany({});
  await prisma.checkInLog.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.bpjsReferral.deleteMany({});
  await prisma.doctorSchedule.deleteMany({});
  await prisma.mockMedicalRecord.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.specialty.deleteMany({});
  await prisma.user.deleteMany({});

  const saltRounds = 10;
  const commonPassword = await bcrypt.hash('password123', saltRounds);

  // 2. Seed Specialties
  console.log('Seeding specialties...');
  const specialties = [
    { name: 'Dokter Umum', description: 'Layanan konsultasi kesehatan umum' },
    { name: 'Spesialis Anak', description: 'Layanan kesehatan untuk bayi dan anak' },
    { name: 'Spesialis Penyakit Dalam', description: 'Layanan kesehatan organ dalam dewasa' },
    { name: 'Spesialis Bedah Umum', description: 'Layanan bedah umum' },
    { name: 'Spesialis Mata', description: 'Layanan kesehatan mata' },
    { name: 'Spesialis THT', description: 'Layanan kesehatan Telinga, Hidung, dan Tenggorokan' },
    { name: 'Spesialis Kandungan', description: 'Layanan kesehatan reproduksi dan kehamilan' },
  ];

  const createdSpecialties = [];
  for (const s of specialties) {
    const specialty = await prisma.specialty.create({ data: s });
    createdSpecialties.push(specialty);
  }

  // 3. Seed Admin
  console.log('Seeding admin...');
  await prisma.user.create({
    data: {
      email: 'admin@rsud.go.id',
      passwordHash: commonPassword,
      role: UserRole.ADMIN,
      phone: '081234567890',
    },
  });

  // 4. Seed Doctors
  console.log('Seeding doctors...');
  const doctorsData = [
    {
      email: 'dr.andi@rsud.go.id',
      fullName: 'Dr. Andi Pratama',
      specialtyName: 'Dokter Umum',
      sip: 'SIP/123/2023',
      experience: 10,
      location: 'Gedung A, Lantai 1',
    },
    {
      email: 'dr.siti@rsud.go.id',
      fullName: 'Dr. Siti Aminah',
      specialtyName: 'Spesialis Anak',
      sip: 'SIP/456/2023',
      experience: 8,
      location: 'Gedung B, Lantai 2',
    },
    {
      email: 'dr.budi@rsud.go.id',
      fullName: 'Dr. Budi Santoso',
      specialtyName: 'Spesialis Penyakit Dalam',
      sip: 'SIP/789/2023',
      experience: 15,
      location: 'Gedung A, Lantai 3',
    },
  ];

  for (const d of doctorsData) {
    const specialty = createdSpecialties.find(s => s.name === d.specialtyName);
    if (specialty) {
      const user = await prisma.user.create({
        data: {
          email: d.email,
          passwordHash: commonPassword,
          role: UserRole.DOCTOR,
          phone: '08' + Math.floor(Math.random() * 1000000000),
        },
      });

      const doctor = await prisma.doctor.create({
        data: {
          userId: user.id,
          fullName: d.fullName,
          specialtyId: specialty.id,
          sipNumber: d.sip,
          experienceYears: d.experience,
          location: d.location,
          ratingAverage: 4.5 + Math.random() * 0.5,
        },
      });

      // 5. Seed Schedules for each doctor
      for (let day = 1; day <= 5; day++) {
        await prisma.doctorSchedule.create({
          data: {
            doctorId: doctor.id,
            dayOfWeek: day,
            startTime: '08:00',
            endTime: '12:00',
            slotDurationMinutes: 20,
            maxPatientsPerSlot: 1,
            location: d.location,
          },
        });
        await prisma.doctorSchedule.create({
          data: {
            doctorId: doctor.id,
            dayOfWeek: day,
            startTime: '13:00',
            endTime: '16:00',
            slotDurationMinutes: 20,
            maxPatientsPerSlot: 1,
            location: d.location,
          },
        });
      }
    }
  }

  // 6. Seed Patient
  console.log('Seeding patient...');
  const patientUser = await prisma.user.create({
    data: {
      email: 'pasien@example.com',
      passwordHash: commonPassword,
      role: UserRole.PATIENT,
      phone: '089876543210',
    },
  });

  await prisma.patient.create({
    data: {
      userId: patientUser.id,
      nik: '1234567890123456',
      fullName: 'Budi Pasien',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Laki-laki',
      address: 'Jl. Merdeka No. 123, Jakarta',
      rmNumber: 'RM-001',
      isBpjs: true,
      bpjsNumber: '0001234567890',
      bpjsClass: 'Kelas 1',
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
