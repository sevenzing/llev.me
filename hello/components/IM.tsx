import { keyframes } from "@emotion/react";
import { PressableProps, PressableText } from "./PressableText";
import { useEffect, useRef, useState } from "react";
import { Box, Center, Flex, Tag } from "@chakra-ui/react";

const moveText = keyframes`
  7% {margin-top: 0;}
  14% {margin-top: 0;}
  21% {margin-top: -4.5rem;}
  28% {margin-top: -4.5rem;}
  35% {margin-top: -9rem;}
  42% {margin-top: -9rem;}
  49% {margin-top: -13.5rem;}
  56% {margin-top: -13.5rem;}
  63% {margin-top: -9rem;}
  70% {margin-top: -9rem;}
  77% {margin-top: -4.5rem;}
  84% {margin-top: -4.5rem;}
  91% {margin-top: 0;}
  100% {margin-top: 0;}
`;


export type IMProps = {
  text: string;
  isFirst?: boolean;
  bg: string;
} & PressableProps;

export const IM = (props: IMProps) => {
  const [_time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  const textAnimation = `${moveText} 20s 1s infinite`;

  // disable if current position of box is not shown due to animation
  const maxAllowedTop = ref.current?.parentElement?.getBoundingClientRect().top || 0;
  const maxAllowedBottom = ref.current?.parentElement?.getBoundingClientRect().bottom || 0;
  const topDiff = Math.abs((ref.current?.getBoundingClientRect().top || 0) - maxAllowedTop);
  const bottomDiff = Math.abs((ref.current?.getBoundingClientRect().bottom || 0) - maxAllowedBottom);
  const disabled = topDiff > 30 || bottomDiff > 30;

  return (
    <Box animation={props.isFirst ? textAnimation : undefined} ref={ref}>
      <Tag justifyContent="center" textColor="gray.800" fontSize="inherit" size="lg" variant="solid" bg={props.bg}>
          <PressableText {...props} disabled={disabled}/>
      </Tag>
    </Box>
  )
};
