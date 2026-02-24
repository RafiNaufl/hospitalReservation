import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { BookingClient } from "./booking-client";

interface SearchParams {
  searchParams: Promise<{
    specialtyId?: string;
    doctorId?: string;
  }>;
}

export default async function BookingPage({ searchParams }: SearchParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/booking");
  }

  const resolvedSearchParams = await searchParams;

  const initialSpecialtyId =
    typeof resolvedSearchParams.specialtyId === "string"
      ? resolvedSearchParams.specialtyId
      : "";

  const initialDoctorId =
    typeof resolvedSearchParams.doctorId === "string"
      ? resolvedSearchParams.doctorId
      : "";

  return (
    <BookingClient
      initialSpecialtyId={initialSpecialtyId}
      initialDoctorId={initialDoctorId}
    />
  );
}
