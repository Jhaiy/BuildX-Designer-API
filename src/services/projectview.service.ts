import supabase from "./database.service";

export async function viewSharedProjects(userId: string) {
  const normalizedUserId = String(userId).trim();

  const { data: sharedProjects, error } = await supabase
    .from("project_collaborators")
    .select(
      "user_id, project_id, role, projects(projects_id, user_id, project_name, description, thumbnail, is_published)",
    )
    .eq("user_id", normalizedUserId);

  if (error) {
    throw new Error(error.message);
  }

  if (!sharedProjects || sharedProjects.length === 0) {
    return [];
  }

  const filteredSharedProjects = sharedProjects.filter((sp: any) => {
    const collaboratorUserId = String(sp?.user_id ?? "").trim();
    const projectOwnerUserId = String(sp?.projects?.user_id ?? "").trim();
    const role = String(sp?.role ?? "")
      .trim()
      .toLowerCase();

    const isOwnerRole = role === "owner";
    const isOwnProject =
      projectOwnerUserId === normalizedUserId ||
      collaboratorUserId === normalizedUserId;

    return !isOwnerRole && !isOwnProject;
  });

  if (filteredSharedProjects.length === 0) {
    return [];
  }

  const ownerIds = [
    ...new Set(
      filteredSharedProjects
        .map((sp: any) => sp.projects?.user_id)
        .filter(Boolean),
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

  return filteredSharedProjects.map((sp: any) => ({
    ...sp,
    projects: sp.projects
      ? {
          ...sp.projects,
          owner_profile: profileMap.get(sp.projects.user_id) || null,
        }
      : null,
  }));
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
