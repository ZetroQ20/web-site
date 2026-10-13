import { Fragment, type ElementType } from "react";

type Props = {
  text: string;
  by?: "chars" | "words";
  className?: string;
  /** Class applied to every animated inner span (target this from GSAP). */
  innerClassName?: string;
  as?: ElementType;
};

/**
 * Splits text into masked spans so each piece can slide up from behind its mask.
 * Words stay unbroken when splitting into chars.
 */
export default function SplitText({ text, by = "chars", className = "", innerClassName = "", as: Tag = "span" }: Props) {
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          {by === "words" ? (
            <span className="mask" aria-hidden>
              <span className={innerClassName}>{word}</span>
            </span>
          ) : (
            <span className="inline-block whitespace-nowrap" aria-hidden>
              {Array.from(word).map((ch, ci) => (
                <span key={ci} className="mask">
                  <span className={innerClassName}>{ch}</span>
                </span>
              ))}
            </span>
          )}
          {wi < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
