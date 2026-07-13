import SignedInHome from "@/components/dashboard/SignedInHome";
import SignedOutHome from "@/components/dashboard/SignedOutHome";

// TODO: I think this is the bug for signed in stuff. 
// TODO: Save things to a cache like vehicles in garage and also sessions.

const isSignedIn = true;

export default function HomePage() {
  return isSignedIn ? <SignedInHome /> : <SignedOutHome />;
}
