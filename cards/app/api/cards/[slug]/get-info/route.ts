import { PrismaClient } from '@prisma/client'
import { NextResponse, NextRequest } from "next/server";

const MAX_INCORRECT_REQUESTS = 100
const prisma = new PrismaClient()

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    let slug: string | undefined
    let code: string | undefined
    try {
        slug = (await params).slug
        code = (await request.json()).code
    }
    catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 404 })
    }
    if (!slug) {
        return NextResponse.json({ error: 'Slug not provided' }, { status: 404 })
    }
    if (!code) {
        return NextResponse.json({ error: 'Code not provided' }, { status: 404 })
    }
    const gift = await getGiftForUser(slug);
    if (!gift) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 })
    }

    if (gift.secret_code !== code) {
        await prisma.gift.update({
            where: { id: gift.id },
            data: { incorrect_requests: { increment: 1 }, requests: { increment: 1 } },
        })
        return NextResponse.json({ error: 'Invalid code' }, { status: 403 })
    }

    await prisma.gift.update({
        where: { id: gift.id },
        data: { requests: { increment: 1 } },
    })
    return NextResponse.json({ gift }, { status: 200 })
}

export async function getGiftForUser(slug: string) {
    const gift = await prisma.gift.findFirst({
      where: {
        slug: slug,
        incorrect_requests: {
            lte: MAX_INCORRECT_REQUESTS
        }
      },
    })
    return gift
}