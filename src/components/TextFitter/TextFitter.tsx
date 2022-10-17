import { createContext, useEffect, useReducer, useRef } from "react";

import { DifficultyList } from "../../data/difficulties";
import { Difficulties, Utility, Fonts } from "../../types";

import "./TextFitter.scss";

/**
 * The size increment to increase font by
 */
const textIncrement = 0.3;

/**
 * Represents the font context
 */
export const FontContext = createContext<`${number}${"vw" | "vh"}`>(`0vw`);

interface TextFitterProps {
  children: React.ReactNode;
  difficulty: Difficulties.Difficulty;
  windowSize: Utility.WindowDimensions;
}

/**
 * Provides a font size that fits inside each cell
 */
const TextFitter = (props: TextFitterProps) => {
  /* States */

  /**
   * Represents the font size state
   */
  const [fontSizes, updateFontSizes] = useReducer<
    (
      fonts: Fonts.FontSizes,
      update: Fonts.Events.FONTS_EVENT
    ) => Fonts.FontSizes,
    null
  >(fontSizeReducer, null, () => {
    return {
      type: "width",
    };
  });

  /* Refs */

  /**
   * Represents the text fitter element's ref
   */
  const textFitterRef = useRef<HTMLDivElement>();

  /**
   * Represents the text inside the text fitter element's ref
   */
  const textFitterTextRef = useRef<HTMLDivElement>();

  /* Effects */

  /**
   * Reset the font sizes once a window size change is detected
   */
  useEffect(() => {
    updateFontSizes({ type: "RESET_FONTS" });
    updateFontSizes({
      type: "UPDATE_FONTS_TYPE",
      newType: props.windowSize.type,
    });
    updateFontSizes({
      type: "UPDATE_FONTS",
      difficulty: props.difficulty.name,
      newSize: findTextSize(
        textFitterRef,
        textFitterTextRef,
        props.windowSize,
        props.difficulty
      ),
    });
  }, [props.windowSize.size, props.windowSize.type]);

  /**
   * Check if there is a font size for the difficulty, if not, generate it
   */
  useEffect(() => {
    if ((fontSizes[props.difficulty.name] ?? 0) <= 0) {
      updateFontSizes({
        type: "UPDATE_FONTS",
        difficulty: props.difficulty.name,
        newSize: findTextSize(
          textFitterRef,
          textFitterTextRef,
          props.windowSize,
          props.difficulty
        ),
      });
    }
  }, [props.difficulty.name]);

  /* Render */
  return (
    <>
      <div ref={textFitterRef as any} className="textTester">
        <div ref={textFitterTextRef as any}>1</div>
      </div>
      <FontContext.Provider
        value={`${fontSizes[props.difficulty.name] ?? 0}${
          props.windowSize.type === "width" ? "vw" : "vh"
        }`}
      >
        {props.children}
      </FontContext.Provider>
    </>
  );
};

/**
 * Checks if the current text size is making the component expand
 * @param currentSize - The current size of the element
 * @param requiredSize - The required size of the element
 * @returns If the text is overflowing/forcing the component to resize
 */
function isTextOverflown(currentSize: Utility.Size, requiredSize: number) {
  return currentSize.width > requiredSize || currentSize.height > requiredSize;
}

/**
 *
 * @param textFitterRef - The reference to the tester element
 * @param windowSize - The current window size
 * @param difficulty - The difficulty information
 *
 * @returns The max font size
 */
function findTextSize(
  textFitterRef: React.MutableRefObject<HTMLDivElement | undefined>,
  textFitterTextRef: React.MutableRefObject<HTMLDivElement | undefined>,
  windowSize: Utility.WindowDimensions,
  difficulty: Difficulties.Difficulty
): number {
  if (!textFitterRef.current || !textFitterTextRef.current) return 0;
  let maxSize = Math.ceil(windowSize.size / difficulty.boardSize.width);
  let currentFontSize = 0;
  textFitterRef.current.style.width = `${maxSize}px`;
  textFitterRef.current.style.height = `${maxSize}px`;
  textFitterTextRef.current.style.fontSize = `${currentFontSize}${
    windowSize.type === "width" ? "vw" : "vh"
  }`;
  while (
    !isTextOverflown(
      {
        width: textFitterTextRef.current.clientWidth,
        height: textFitterTextRef.current.clientHeight,
      },
      maxSize
    ) &&
    currentFontSize <= 100
  ) {
    currentFontSize += textIncrement;
    textFitterTextRef.current.style.fontSize = `${currentFontSize}${
      windowSize.type === "width" ? "vw" : "vh"
    }`;
  }
  return currentFontSize - textIncrement;
}

/**
 * The reducer for the fonts state
 * @param fonts - The current fonts state
 * @param update - The updated info
 * @returns Updates the font state
 */
function fontSizeReducer(
  fonts: Fonts.FontSizes,
  update: Fonts.Events.FONTS_EVENT
): Fonts.FontSizes {
  switch (update.type) {
    case "RESET_FONTS":
      let newFontSizes: Partial<{
        [key in Difficulties.Difficulties]: number;
      }> = {};
      for (let difficulty of Object.values(DifficultyList)) {
        newFontSizes[difficulty.name] = 0;
      }
      return { ...fonts, ...newFontSizes };
    case "UPDATE_FONTS":
      return { ...fonts, [update.difficulty]: update.newSize };
    case "UPDATE_FONTS_TYPE":
      return { ...fonts, type: update.newType };
  }
}

export default TextFitter;
