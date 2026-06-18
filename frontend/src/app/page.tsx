import SignedInHome from "@/components/dashboard/SignedInHome";
import SignedOutHome from "@/components/dashboard/SignedOutHome";

const isSignedIn = true;

export default function HomePage() {
  return isSignedIn ? <SignedInHome /> : <SignedOutHome />;
}
