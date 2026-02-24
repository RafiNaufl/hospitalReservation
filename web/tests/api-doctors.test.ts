import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/doctors/route";

interface MockDoctor {
  id: string
  fullName: string
  specialtyId: string
  location?: string | null
  photoUrl?: string | null
}

interface MockSpecialty {
  id: string
  name: string
}

const buildRequest = (url: string) => new Request(url);

let doctorsStore: MockDoctor[] = [];
let specialtiesStore: MockSpecialty[] = [{ id: "spec-umum", name: "Umum" }];

const resetStores = () => {
  doctorsStore = [];
  specialtiesStore = [{ id: "spec-umum", name: "Umum" }];
};

vi.mock("@/lib/prisma", () => {
  return {
    prisma: {
      doctor: {
        findMany: vi.fn(async ({ where }: { where?: { specialtyId?: string } } = {}) => {
          if (!where?.specialtyId) {
            return doctorsStore;
          }
          return doctorsStore.filter((item) => item.specialtyId === where.specialtyId);
        }),
        createMany: vi.fn(async ({ data }: { data: MockDoctor[] }) => {
          doctorsStore = [...doctorsStore, ...data];
          return { count: data.length };
        }),
      },
      specialty: {
        findMany: vi.fn(async () => specialtiesStore),
      },
    },
  };
});

describe("GET /api/doctors", () => {
  beforeEach(() => {
    resetStores();
  });

  it("mengembalikan daftar dokter setelah seeding otomatis ketika awalnya kosong", async () => {
    const response = await GET(buildRequest("http://localhost/api/doctors"));

    expect(response.ok).toBe(true);

    const data = (await response.json()) as unknown;

    expect(Array.isArray(data)).toBe(true);
    expect((data as { fullName: string }[]).length).toBeGreaterThan(0);

    const names = (data as { fullName: string }[]).map((item) => item.fullName);
    expect(names).toContain("dr. Andi Pratama");
  });

  it("menghormati filter specialtyId", async () => {
    await GET(buildRequest("http://localhost/api/doctors"));

    const response = await GET(
      buildRequest("http://localhost/api/doctors?specialtyId=spec-umum"),
    );

    expect(response.ok).toBe(true);

    const data = (await response.json()) as { specialtyId: string }[];

    expect(data.length).toBeGreaterThan(0);
    for (const doctor of data) {
      expect(doctor.specialtyId).toBe("spec-umum");
    }
  });
});
