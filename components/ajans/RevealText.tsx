import { Fragment, type ElementType } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** Words wrapped in *asterisks* are set in italic serif. */
  text: string;
  as?: ElementType;
  className?: string;
  /** Class for the italic segments. */
  accentClassName?: string;
  id?: string;
};

/**
 * Heading whose words each sit in their own mask, so GSAP can slide them up from
 * behind the line (`[data-split] .mask > span`, see AgencySite). The full sentence
 * stays readable to assistive tech through aria-label.
 */
export default function RevealText({ text, as: Tag = "h2", className, accentClassName = "italic", id }: Props) {
  const plain = text.replace(/\*/g, "");
  const segments = text.split("*");
  return (
    <Tag id={id} className={className} aria-label={plain} data-split>
      {segments.map((seg, si) =>
        seg.split(/(\s+)/).map((word, wi) =>
          /^\s+$/.test(word) || !word ? (
            <Fragment key={`${si}-${wi}`}>{word.includes("\n") ? <br /> : " "}</Fragment>
          ) : (
            <span key={`${si}-${wi}`} className="mask" aria-hidden>
              <span className={cn(si % 2 === 1 && accentClassName)}>{word}</span>
            </span>
          )
        )
      )}
    </Tag>
  );
}
