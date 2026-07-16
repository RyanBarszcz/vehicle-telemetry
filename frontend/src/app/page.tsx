import { auth } from "@clerk/nextjs/server";
import SignedInHome from "@/components/dashboard/SignedInHome";
import SignedOutHome from "@/components/dashboard/SignedOutHome";

// TODO: Later save things to a cache like vehicles in garage and also sessions.
// TODO: Later Work on sharing cars to other accounts

export default async function HomePage() {
  const { userId } = await auth();

  return userId ? <SignedInHome /> : <SignedOutHome />;
}