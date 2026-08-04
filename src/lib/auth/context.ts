import { createClient } from "@/infrastructure/supabase/server";
import {
  AuthContext,
  UnauthorizedError,
  UserRole,
} from "@/domain/shared/types";

const DEMO_GYM_ID = "22222222-2222-2222-2222-222222222222";

export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError("You must be logged in");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("user_gym_memberships")
    .select(
      `
      role,
      gym_id,
      gyms (
        id,
        name,
        organization_id
      )
    `,
    )
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (!membership?.gyms) {
    throw new UnauthorizedError(
      "Your account is not linked to a gym. Ask an admin to add your membership.",
    );
  }

  const gymData = membership.gyms;
  const gym = (Array.isArray(gymData) ? gymData[0] : gymData) as {
    id: string;
    name: string;
    organization_id: string;
  };

  if (!gym?.id) {
    throw new UnauthorizedError(
      "Your account is not linked to a gym. Ask an admin to add your membership.",
    );
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    gymId: gym.id,
    gymName: gym.name,
    organizationId: gym.organization_id,
    role: membership.role as UserRole,
  };
}

export async function getOptionalAuthContext(): Promise<AuthContext | null> {
  try {
    return await getAuthContext();
  } catch {
    return null;
  }
}

export { DEMO_GYM_ID };
