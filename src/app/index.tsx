
import { Redirect } from "expo-router";
import { useAuth } from "../../hooks/useAuth";

export default function Index() {
  const { isAuthenticated, ready } = useAuth();

  // wait for the saved session so a logged-in user isn't sent to Login first
  if (!ready) return null;

  if (isAuthenticated) {
    return <Redirect href="/Home" />;
  }

  return <Redirect href="/Login" />;
}
