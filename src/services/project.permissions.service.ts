import supabase from "./database.service";

export async function viewPermissions(projectId: string) {
  const { data, error } = await supabase
    .from("project_collaborators")
    .select(
      "user_id, role, anyone_can, profiles (user_id, avatar_url, full_name, email_address)",
    )
    .eq("project_id", projectId);

  if (!error) {
    return {
      anyone_can: data?.[0]?.anyone_can ?? "view",
      collaborators: data ?? [],
    };
  }

  if (!error.message?.includes("Could not find a relationship")) {
    throw error;
  }

  const { data: collaborators, error: collaboratorsError } = await supabase
    .from("project_collaborators")
    .select("user_id, role, anyone_can")
    .eq("project_id", projectId);

  if (collaboratorsError) {
    throw collaboratorsError;
  }

  const userIds = (collaborators ?? []).map(
    (collaborator) => collaborator.user_id,
  );

  if (!userIds.length) {
    return {
      anyone_can: collaborators?.[0]?.anyone_can ?? "view",
      collaborators: [],
    };
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, avatar_url, full_name, email_address")
    .in("user_id", userIds);

  if (profilesError) {
    throw profilesError;
  }

  const profilesByUserId = new Map(
    (profiles ?? []).map((profile) => [profile.user_id, profile]),
  );

  return {
    anyone_can: collaborators?.[0]?.anyone_can ?? "view",
    collaborators: (collaborators ?? []).map((collaborator) => ({
      user_id: collaborator.user_id,
      role: collaborator.role,
      anyone_can: collaborator.anyone_can,
      profiles: profilesByUserId.get(collaborator.user_id) ?? null,
    })),
  };
}

export async function checkProjectPermission(
  userId: string,
  projectId: string,
  requiredRole: "owner" | "editor" | "viewer",
) {
  const { data: permissions, error } = await supabase
    .from("project_collaborators")
    .select("*")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .limit(1)
    .single();

  if (error) {
    throw error;
  }

  if (!permissions) {
    return false;
  }

  const roleHierarchy: { [key: string]: number } = {
    owner: 3,
    editor: 2,
    viewer: 1,
  };

  return roleHierarchy[permissions.role] >= roleHierarchy[requiredRole];
}

export async function updateProjectPermission(
  projectId: string,
  userId: string,
  newRole: "editor" | "viewer",
) {
  const { data, error } = await supabase
    .from("project_collaborators")
    .update({ role: newRole })
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function addProjectCollaborator(
  projectId: string,
  email: string,
  role: string,
) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email_address", email)
    .limit(1)
    .single();

  if (profileError) {
    throw profileError;
  }

  if (!profile?.user_id) {
    throw new Error("User not found for the provided email");
  }

  const { data, error } = await supabase
    .from("project_collaborators")
    .insert([{ project_id: projectId, user_id: profile.user_id, role }])
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeProjectCollaborator(
  projectId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("project_collaborators")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .select();

  if (error) {
    throw error;
  }

  return data;
}
