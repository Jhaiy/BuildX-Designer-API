import supabase from "./database.service";

export async function viewPermissions(projectId: string) {
  const { data, error } = await supabase
    .from("project_collaborators")
    .select("user_id, role, profiles (avatar_url, full_name, email_address)")
    .eq("project_id", projectId);

  if (error) {
    throw error;
  }

  return data;
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
  userId: string,
  role: string,
) {
  const { data, error } = await supabase
    .from("project_collaborators")
    .insert([{ project_id: projectId, user_id: userId, role }])
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
