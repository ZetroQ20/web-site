import Experience from "@/components/Experience";
import JsonLd from "@/components/JsonLd";

export default function Page() {
  return (
    <>
      {/* Salon structured data belongs to the salon page only, not to other brands' pages like /gans. */}
      <JsonLd />
      <Experience />
    </>
  );
}
