import "server-only";
import { createServerAuthClient } from "../supabase/server";

export async function verifiedUser() {
  const auth = await createServerAuthClient();
  // getUser asks Auth to verify the session; getSession's user is never trusted.
  const { data, error } = await auth.auth.getUser();
  return { auth, user: error ? null : data.user, unavailable: !!error && (error.status === 0 || (error.status !== undefined && error.status >= 500)) };
}
