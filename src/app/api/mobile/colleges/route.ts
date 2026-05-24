import { NextResponse } from "next/server";
import { getAllMappedColleges } from "@/lib/college-domain-map";

export async function GET() {
  try {
    const colleges = getAllMappedColleges()
      .map((college) => ({
        name: college.name,
        slug: college.slug,
        city: college.city,
        type: college.type,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ colleges });
  } catch (error) {
    console.error("Mobile colleges error:", error);
    return NextResponse.json(
      { error: "Failed to fetch colleges" },
      { status: 500 }
    );
  }
}
