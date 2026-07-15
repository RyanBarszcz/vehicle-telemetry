import { auth } from "@clerk/nextjs/server";
import SignedInHome from "@/components/dashboard/SignedInHome";
import SignedOutHome from "@/components/dashboard/SignedOutHome";

// TODO: I think this is the bug for signed in stuff. 
// TODO: Save things to a cache like vehicles in garage and also sessions.

// TODO: Settings page can delete most things. Give option to delete account.
// TODO: Garage, get rid of miles logged 
// TODO: Dashboard, get rid of miles and alerts
// TODO: Delete alerts (not needed)

export default async function HomePage() {
  const { userId } = await auth();

  return userId ? <SignedInHome /> : <SignedOutHome />;
}