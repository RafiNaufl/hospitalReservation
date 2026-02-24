import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import type { AppointmentStatus } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

const searchParamsSchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

const validAppointmentStatuses: AppointmentStatus[] = [
  "BOOKED",
  "CHECKED_IN",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json(
      { message: "Hanya admin yang boleh mengelola kunjungan pasien" },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const raw = {
    q: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    type: url.searchParams.get("type") ?? undefined,
    startDate: url.searchParams.get("startDate") ?? undefined,
    endDate: url.searchParams.get("endDate") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  };

  const parsed = searchParamsSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Filter tidak valid" },
      { status: 400 }
    );
  }

  const { q, status, type, startDate, endDate, page, pageSize } = parsed.data;

  const pageNumber = (() => {
    if (!page) return 1;
    const parsedPage = Number(page);
    if (Number.isNaN(parsedPage) || parsedPage < 1) return 1;
    return parsedPage;
  })();

  const resolvedPageSize = (() => {
    if (!pageSize) return 10;
    const parsedSize = Number(pageSize);
    if (Number.isNaN(parsedSize) || parsedSize < 1 || parsedSize > 100) {
      return 10;
    }
    return parsedSize;
  })();

  const dateFilter = (() => {
    if (!startDate && !endDate) {
      return {};
    }

    let gte: Date | undefined;
    let lte: Date | undefined;

    if (startDate) {
      const start = new Date(startDate);
      if (!Number.isNaN(start.getTime())) {
        gte = start;
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      if (!Number.isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        lte = end;
      }
    }

    if (!gte && !lte) {
      return {};
    }

    return {
      date: {
        ...(gte ? { gte } : {}),
        ...(lte ? { lte } : {}),
      },
    };
  })();

  const where: Prisma.AppointmentWhereInput = {
    AND: [
      q
        ? {
            OR: [
              {
                patient: {
                  is: {
                    fullName: { contains: q },
                  },
                },
              },
              {
                patient: {
                  is: {
                    nik: { contains: q },
                  },
                },
              },
              {
                doctor: {
                  is: {
                    fullName: { contains: q },
                  },
                },
              },
              {
                doctor: {
                  is: {
                    specialty: {
                      is: {
                        name: { contains: q },
                      },
                    },
                  },
                },
              },
              { bookingCode: { contains: q } },
            ],
          }
        : {},
      status && validAppointmentStatuses.includes(status as AppointmentStatus)
        ? {
            status: status as AppointmentStatus,
          }
        : {},
      type === "BPJS" || type === "GENERAL"
        ? {
            appointmentType: type,
          }
        : {},
      dateFilter,
    ],
  };

  const [totalCount, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      skip: (pageNumber - 1) * resolvedPageSize,
      take: resolvedPageSize,
      include: {
        patient: true,
        doctor: {
          include: {
            specialty: true,
          },
        },
      },
    }),
  ]);

  const totalPages =
    totalCount === 0
      ? 1
      : Math.max(1, Math.ceil(totalCount / resolvedPageSize));

  return NextResponse.json({
    items: appointments,
    totalCount,
    page: pageNumber,
    pageSize: resolvedPageSize,
    totalPages,
  });
}
