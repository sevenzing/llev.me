import { PrismaClient } from '@prisma/client'
import { NextResponse, NextRequest } from "next/server";
import { getGiftForUser } from './get-info/route';

const prisma = new PrismaClient()

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const slug = (await params).slug
    if (!slug) {
        return NextResponse.json({ error: 'Slug not provided' }, { status: 404 })
    }
    const gift = await getGiftForUser(slug)
    if (!gift) {
      return NextResponse.json({ exists: false }, { status: 200 })
    }
    return NextResponse.json({ exists: true, preview_content: gift.preview_content }, { status: 200 })
}
