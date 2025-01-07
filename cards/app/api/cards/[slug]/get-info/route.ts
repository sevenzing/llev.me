import { userAccessesGiftCorrectly } from "@/repository/gifts";
import { userAccessesGiftIncorrectly } from "@/repository/gifts";
import { getGiftForUser } from "@/repository/gifts";
import { NextResponse, NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  let slug: string | undefined;
  let code: string | undefined;
  try {
    slug = (await params).slug;
    code = (await request.json()).code;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid request" }, { status: 404 });
  }
  if (!slug) {
    return NextResponse.json({ error: "Slug not provided" }, { status: 404 });
  }
  if (!code) {
    return NextResponse.json({ error: "Code not provided" }, { status: 404 });
  }
  const gift = await getGiftForUser(slug);
  if (!gift) {
    return NextResponse.json({ error: "Gift not found" }, { status: 404 });
  }

  if (gift.secret_code !== code) {
    await userAccessesGiftIncorrectly(gift);
    return NextResponse.json({ error: "Invalid code" }, { status: 403 });
  } else {
    await userAccessesGiftCorrectly(gift);
    return NextResponse.json({ gift }, { status: 200 });
  }
}
