import { gifts as GiftModel, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MAX_INCORRECT_REQUESTS = 100;

export async function getGiftForUser(
  slug: string,
  maxIncorrectRequests: number = MAX_INCORRECT_REQUESTS,
) {
  const gift = await prisma.gifts.findFirst({
    where: {
      slug: slug,
      incorrect_requests: {
        lte: maxIncorrectRequests,
      },
    },
  });
  return gift;
}

export async function userAccessesGiftIncorrectly(gift: GiftModel) {
  await prisma.gifts.update({
    where: { id: gift.id },
    data: { incorrect_requests: { increment: 1 }, requests: { increment: 1 } },
  });
}

export async function userAccessesGiftCorrectly(gift: GiftModel) {
  await prisma.gifts.update({
    where: { id: gift.id },
    data: { requests: { increment: 1 } },
  });
}
