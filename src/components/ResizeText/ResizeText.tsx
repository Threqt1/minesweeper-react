import { useEffect, useRef, useState } from "react";

import { Difficulty } from "../../data/difficulties";
import { WindowDimensions } from "../App/App";

import "./ResizeText.scss";

const increment = 0.3;

function isOverflown(currWidth: number, currHeight: number, reqSize: number) {
  return currWidth > reqSize || currHeight > reqSize;
}

const ResizeText = (props: {
  setFontSize: (difficulty: Difficulty | null, info?: WindowDimensions) => void;
  size: WindowDimensions;
  difficulty: Difficulty;
}) => {
  let textHolderRef = useRef<HTMLDivElement>();
  const [fontSize, setFontSize] = useState<number>(-1);

  useEffect(() => {
    setFontSize(0);
  }, [props.size]);

  useEffect(() => {
    if (textHolderRef.current) {
      let overflown = isOverflown(
        textHolderRef.current.clientWidth,
        textHolderRef.current.clientHeight,
        props.size.size
      );
      if (!overflown) {
        setFontSize((oldVal) => oldVal + increment);
      } else {
        props.setFontSize(props.difficulty, {
          size: fontSize - increment,
          type: props.size.type,
        });
      }
    }
  }, [fontSize]);

  return (
    <div
      className="textTester"
      style={{ width: `${props.size.size}px`, height: `${props.size.size}px` }}
    >
      <div
        ref={textHolderRef as any}
        style={{
          fontSize: `${fontSize}${props.size.type === "width" ? `vw` : `vh`}`,
        }}
      >
        1
      </div>
    </div>
  );
};

export default ResizeText;
