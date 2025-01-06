import { Box, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState } from "react";

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
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) {
      return
    }
    if (backChildren) {
      setIsFlipped((prev) => !prev);
    }
  };

  return (
    <MotionBox
    className="glow"
    style={{
        perspective: 1000,
        cursor: backChildren ? "pointer" : "default", // Pointer cursor only if back content exists
        transformStyle: "preserve-3d",
    }}
    onClick={handleCardClick} // Enable click flip
    animate={{
        rotateY: isFlipped ? 180 : 0,
    }}
    transition={{ duration: 0.8, ease: "easeInOut" }}
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
            {frontChildren}
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
                {backChildren}
            </Box>
            )}
        </MotionBox>
    </MotionBox>
  );
};

export default CardSkeleton;
