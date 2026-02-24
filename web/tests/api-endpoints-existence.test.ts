import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/prisma", () => {
  return {
    prisma: {},
  };
});

vi.mock("next-auth", () => {
  return {
    getServerSession: vi.fn(),
  };
});

vi.mock("@/pages/api/auth/[...nextauth]", () => {
  return {
    authOptions: {},
  };
});

import * as AdminAppointments from "@/app/api/admin/appointments/route";
import * as AdminDoctors from "@/app/api/admin/doctors/route";
import * as AdminDoctorById from "@/app/api/admin/doctors/[id]/route";
import * as AdminPatients from "@/app/api/admin/patients/route";
import * as AdminPatientById from "@/app/api/admin/patients/[id]/route";
import * as AdminSchedules from "@/app/api/admin/schedules/route";
import * as AdminScheduleById from "@/app/api/admin/schedules/[id]/route";
import * as AdminSpecialties from "@/app/api/admin/specialties/route";
import * as AdminSpecialtyById from "@/app/api/admin/specialties/[id]/route";

import * as Appointments from "@/app/api/appointments/route";
import * as AppointmentReschedule from "@/app/api/appointments/[id]/reschedule/route";
import * as AuthRegister from "@/app/api/auth/register/route";
import * as Checkin from "@/app/api/checkin/route";
import * as CronNoShow from "@/app/api/cron/no-show/route";
import * as CronReminders from "@/app/api/cron/reminders/route";
import * as Doctors from "@/app/api/doctors/route";
import * as DoctorPhoto from "@/app/api/doctors/[id]/photo/route";
import * as DoctorSlots from "@/app/api/doctors/[id]/slots/route";
import * as Specialties from "@/app/api/specialties/route";

const hasHttpHandler = (mod: Record<string, unknown>) => {
  return ["GET", "POST", "PUT", "PATCH", "DELETE"].some((method) => {
    return typeof mod[method] === "function";
  });
};

describe("API endpoints existence", () => {
  it("admin appointments has at least one HTTP handler", () => {
    expect(hasHttpHandler(AdminAppointments)).toBe(true);
  });

  it("admin doctors has at least one HTTP handler", () => {
    expect(hasHttpHandler(AdminDoctors)).toBe(true);
  });

  it("admin doctor by id has at least one HTTP handler", () => {
    expect(hasHttpHandler(AdminDoctorById)).toBe(true);
  });

  it("admin patients has at least one HTTP handler", () => {
    expect(hasHttpHandler(AdminPatients)).toBe(true);
  });

  it("admin patient by id has at least one HTTP handler", () => {
    expect(hasHttpHandler(AdminPatientById)).toBe(true);
  });

  it("admin schedules has at least one HTTP handler", () => {
    expect(hasHttpHandler(AdminSchedules)).toBe(true);
  });

  it("admin schedule by id has at least one HTTP handler", () => {
    expect(hasHttpHandler(AdminScheduleById)).toBe(true);
  });

  it("admin specialties has at least one HTTP handler", () => {
    expect(hasHttpHandler(AdminSpecialties)).toBe(true);
  });

  it("admin specialty by id has at least one HTTP handler", () => {
    expect(hasHttpHandler(AdminSpecialtyById)).toBe(true);
  });

  it("appointments has at least one HTTP handler", () => {
    expect(hasHttpHandler(Appointments)).toBe(true);
  });

  it("appointment reschedule has at least one HTTP handler", () => {
    expect(hasHttpHandler(AppointmentReschedule)).toBe(true);
  });

  it("auth register has at least one HTTP handler", () => {
    expect(hasHttpHandler(AuthRegister)).toBe(true);
  });

  it("checkin has at least one HTTP handler", () => {
    expect(hasHttpHandler(Checkin)).toBe(true);
  });

  it("cron no-show has at least one HTTP handler", () => {
    expect(hasHttpHandler(CronNoShow)).toBe(true);
  });

  it("cron reminders has at least one HTTP handler", () => {
    expect(hasHttpHandler(CronReminders)).toBe(true);
  });

  it("doctors has at least one HTTP handler", () => {
    expect(hasHttpHandler(Doctors)).toBe(true);
  });

  it("doctor photo has at least one HTTP handler", () => {
    expect(hasHttpHandler(DoctorPhoto)).toBe(true);
  });

  it("doctor slots has at least one HTTP handler", () => {
    expect(hasHttpHandler(DoctorSlots)).toBe(true);
  });

  it("specialties has at least one HTTP handler", () => {
    expect(hasHttpHandler(Specialties)).toBe(true);
  });
});

