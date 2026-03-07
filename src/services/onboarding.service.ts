import supabase from "./database.service";

interface OnboardingData {
  primary_role: string;
  workplace_type: string;
  experience: string;
  main_goal: string;
  team_size: string;
}

export async function fetchUserOnboardingData(userId: string) {
  const { data: onboardingData, error } = await supabase
    .from("onboarding_data")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return onboardingData;
}

export async function insertOnboardingData(
  userId: string,
  data: OnboardingData,
) {
  const { error } = await supabase
    .from("onboarding_data")
    .insert([
      {
        user_id: userId,
        primary_role: data.primary_role,
        workplace_type: data.workplace_type,
        experience: data.experience,
        main_goal: data.main_goal,
        team_size: data.team_size,
      },
    ])
    .select();

  if (error) {
    throw error;
  }

  return { success: true };
}
