import Link from "next/link";
import { Layers3 } from "lucide-react";
export default function Brand() {
  return (
    <Link href="/" className="brand" aria-label="InternTrack home">
      <span className="brand-icon">
        <Layers3 size={22} />
      </span>
      Intern<span className="text-blue-600">Track</span>
    </Link>
  );
}
