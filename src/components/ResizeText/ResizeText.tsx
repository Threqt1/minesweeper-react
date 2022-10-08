import { useEffect, useRef, useState } from "react";
import { Difficulties } from "../../data/difficulties";
import "./ResizeText.scss";

const increment = 5;

function isOverflown(currWidth: number, currHeight: number, reqSize: number) {
  return currWidth > reqSize || currHeight > reqSize;
}

const ResizeText = (props: {
  setFontSize: React.Dispatch<
    React.SetStateAction<Partial<Record<Difficulties, number>>>
  >;
  width: number;
  difficulty: Difficulties;
}) => {
  let textHolderRef = useRef<any>();
  const [fontSize, setFontSize] = useState<number>(-1);

  useEffect(() => {
    setFontSize(0);
  }, [props.width]);

  useEffect(() => {
    if (textHolderRef.current) {
      let overflown = isOverflown(
        textHolderRef.current.clientWidth,
        textHolderRef.current.clientHeight,
        props.width
      );
      if (!overflown) {
        setFontSize((oldVal) => oldVal + increment);
      } else {
        props.setFontSize((oldVal) =>
          Object.assign(oldVal, {
            [props.difficulty]: fontSize - increment,
          })
        );
      }
    }
  }, [fontSize]);

  return (
    <div
      className="textTester"
      style={{ width: `${props.width}px`, height: `${props.width}px` }}
    >
      <div ref={textHolderRef} style={{ fontSize: `${fontSize}px` }}>
        1
      </div>
    </div>
  );
};

export default ResizeText;
