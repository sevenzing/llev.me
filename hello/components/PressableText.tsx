import { mulberry32 } from "@/utils/random";
import { getValueFromState } from "@/utils/state";
import { Text } from "@chakra-ui/react";

export type PressableProps = { 
  text: string, 
  id: number, 
  size: number, 
  state: any, 
  onLetterPressed: (id: number, index: number) => void 
  checkBoxTopOffset?: number,
  checkBoxLeftOffset?: number,
  disabled?: boolean,
  zIndex?: number,
};


export const PressableText = (props: PressableProps) => {
  if (props.text.length > 32) {
    throw new Error("Text too long");
  }
  const getRandom = mulberry32(0xdeadbeef + props.id);
  const spans = [...props.text].map((char, i) => {
    if (char === ' ') {
      return <Text as="span" key={i}>&nbsp;</Text>
    }
    const checked = getValueFromState(props.state, props.id, i);
    const handleCheckboxChange = () => {
      props.onLetterPressed(props.id, i);
    }
    const animationDelay = `${getRandom()}s`;
    const topOffset = props.checkBoxTopOffset || 0;
    const leftOffset = props.checkBoxLeftOffset || 0;
    return (
      <Text as="span" key={i}>
        <input disabled={props.disabled} style={{
          "height": `${props.size}rem`,
          "width": `${props.size}rem`,
          "marginTop": `${props.size / 2 + topOffset}rem`,
          "marginLeft": `${leftOffset}rem`,
          "zIndex": props.zIndex || 100,
          "cursor": props.disabled ? "revert" : "pointer",
        }} checked={checked} onChange={handleCheckboxChange} className="pressableLetter" type="checkbox" />
        <span style={{ "animationDelay": animationDelay }}>{char}</span>
      </Text>
    )
  });

  return (
    <>{spans}</>
  )
}


export const PressableLetter = (props: { text: string, size: number }) => {

}


export const usePressable = (queryState: string) => {
  let decoded = null;
  try {
    decoded = JSON.parse(atob(queryState));
  } catch (e) {
    console.error(e);
    return
  }




}