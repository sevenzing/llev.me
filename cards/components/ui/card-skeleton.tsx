import { Box, Flex, Icon, Text, VStack, Color } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaArrowsRotate } from "react-icons/fa6";

interface CardSkeletonProps {
  frontChildren: React.ReactNode; // Front side content
  backChildren?: React.ReactNode; // Back side content (optional)
  initialFlipped?: boolean; // Initial flipped state
}

const MotionBox = motion(Box);

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  frontChildren,
  backChildren,
  initialFlipped = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(initialFlipped);

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement) {
      return
    }
    if (backChildren) {
      setIsFlipped((prev) => !prev);
    }
  };

  return (
    <MotionBox
    className="glow"
    animate={{
        rotateY: isFlipped ? 180 : 0,
    }}
    transition={{ duration: 0.8, ease: "easeInOut" }}
    style={{
        perspective: 1000,
        cursor: backChildren ? "pointer" : "default", // Pointer cursor only if back content exists
        transformStyle: "preserve-3d",
    }}
    >
        <MotionBox
        background="white"
        
        width="300px"
        height="450px"
        borderRadius="md"
        boxShadow="md"
        backgroundColor="white"
        borderWidth="1px"
        borderColor="gray.200"
        p={4}
        display="flex"
        justifyContent="center"
        alignItems="center"
        style={{
            perspective: 1000,
            cursor: backChildren ? "pointer" : "default", // Pointer cursor only if back content exists
            transformStyle: "preserve-3d",
        }}
        onClick={handleCardClick} // Enable click flip
        transition={{ duration: 0.8, ease: "easeInOut" }}
        >
        
            {/* Front Side */}
            <Box
                position="absolute"
                width="100%"
                height="100%"
                backfaceVisibility="hidden"
                display="flex"
                justifyContent="center"
            >
            <Content>{frontChildren}</Content>
            </Box>

            {/* Back Side */}
            {backChildren && (
            <Box
                position="absolute"
                width="100%"
                height="100%"
                backfaceVisibility="hidden"
                transform="rotateY(180deg)"
                display="flex"
                justifyContent="center"
            >
                <Content>{backChildren}</Content>
            </Box>
            )}
        </MotionBox>
    </MotionBox>
  );
};


interface ContentProps {
    children: React.ReactNode;
}


// addes flip icon to the bottom right of the card
const Content: React.FC<ContentProps> = ({
    children
  }) => {
    return (
        <Flex direction="column" justifyContent="space-between" h="100%" w="100%">
            <Flex height="100%" justifyContent="center">
                {children}
            </Flex>
            <Flex justifyContent="flex-end" mb={4} mx={4}><Icon color="gray.500"><FaArrowsRotate/></Icon></Flex>
            
        </Flex>
    )
  }


export default CardSkeleton;
