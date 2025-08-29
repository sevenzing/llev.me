import { AbsoluteCenter, Text, VStack } from "@chakra-ui/react";

export default function Home() {
  return <AbsoluteCenter>
    <VStack alignItems="center" justifyContent="center" gap={4}>
    <Text fontSize="xl" textAlign="center">
      This site contains a collection of cards -- presents for my friends.
    </Text>
    <Text textAlign="center">
    If you dont have a specifal url, I think its not time for you to receive a gift.
    </Text>
    </VStack>
    </AbsoluteCenter>;
}
