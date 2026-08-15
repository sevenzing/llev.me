declare module "@/components/react-bits/LetterGlitch.jsx" {
  import { FC } from "react";

  const LetterGlitch: FC<{
    glitchColors?: string[];
    className?: string;
    glitchSpeed?: number;
    centerVignette?: boolean;
    outerVignette?: boolean;
    smooth?: boolean;
    characters?: string;
  }>;

  export default LetterGlitch;
}
