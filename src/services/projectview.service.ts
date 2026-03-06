import supabase from "./database.service";

export async function viewSharedProjects(userId: string) {
  const { data: sharedProjects, error } = await supabase
    .from("project_collaborators")
    .select(
      "user_id, project_id, role, projects(projects_id, user_id, project_name, description, thumbnail, is_published)",
    )
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  if (!sharedProjects || sharedProjects.length === 0) {
    return sharedProjects;
  }

  const ownerIds = [
    ...new Set(
      sharedProjects
        .map((sp: any) => sp.projects?.user_id)
        .filter((id: any) => id),
    ),
  ];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, full_name, avatar_url")
    .in("user_id", ownerIds);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);

  const enrichedProjects = sharedProjects
    .filter((sp: any) => sp.projects?.user_id !== userId)
    .map((sp: any) => ({
      ...sp,
      projects: sp.projects
        ? {
            ...sp.projects,
            owner_profile: profileMap.get(sp.projects.user_id) || null,
          }
        : null,
    }));

  return enrichedProjects;
}

export async function fetchPublishedTemplates(userId: string) {
  const { data: publishedTemplates, error } = await supabase
    .from("published_templates")
    .select(
      "project_id, user_id, profiles(user_id, full_name, avatar_url), projects(projects_id, project_name, description, thumbnail, category, is_published)",
    )
    .eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }
  return publishedTemplates;
}
