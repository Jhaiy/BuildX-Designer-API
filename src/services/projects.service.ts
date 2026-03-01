import supabase from "./database.service";

export async function viewProjectLikes() {
  const { data: projectLikes, error: viewError } = await supabase
    .from("template_interactions")
    .select("*");

  if (viewError) {
    throw viewError;
  }

  return projectLikes;
}

export async function likeProject(userId: string, projectId: string) {
  if (!userId || !projectId) {
    throw new Error("Missing required fields: userId and projectId");
  }

  const { data: likeData, error: likeError } = await supabase
    .from("template_interactions")
    .insert([{ user_id: userId, project_id: projectId }])
    .select();

  if (likeError) {
    throw likeError;
  }

  return likeData;
}

export async function unlikeProject(userId: string, projectId: string) {
  if (!userId || !projectId) {
    throw new Error("Missing required fields: userId and projectId");
  }

  const { data: unlikeData, error: unlikeError } = await supabase
    .from("template_interactions")
    .delete()
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .select();

  if (unlikeError) {
    throw unlikeError;
  }

  return unlikeData;
}

export async function fetchTemplateData(projectId: string) {
  const { data: publishedTemplateData, error: fetchError } = await supabase
    .from("published_templates")
    .select("project_id, user_id, projects(project_layout)");

  if (fetchError) {
    throw fetchError;
  }

  return publishedTemplateData;
}

export async function displayTemplates() {
  const { data: templates, error: displayError } = await supabase
    .from("published_templates")
    .select(
      "project_id, user_id, profiles(user_id, avatar_url, full_name), projects(projects_id, user_id, project_name, thumbnail)",
    );

  if (displayError) {
    throw displayError;
  }

  return templates;
}
export async function insertTemplateData(projectId: string, userId: string) {
  const { data: insertData, error: insertError } = await supabase
    .from("published_templates")
    .insert([{ project_id: projectId, user_id: userId }])
    .select();

  if (insertError) {
    throw insertError;
  }

  return insertData;
}

export async function unpublishTemplate(projectId: string) {
  const { error } = await supabase
    .from("published_templates")
    .delete()
    .eq("project_id", projectId);

  if (error) {
    throw error;
  }

  return { message: "Template unpublished successfully" };
}

export async function updateTemplateStatus(
  projectId: string,
  isPublished: boolean,
) {
  const { data, error } = await supabase
    .from("projects")
    .update({ published_template: isPublished })
    .eq("projects_id", projectId)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function countProjectLikes(projectId: string) {
  const { data: likesData, error: countError } = await supabase
    .from("template_interactions")
    .select("*", { count: "exact" })
    .eq("project_id", projectId);

  if (countError) {
    throw countError;
  }

  return likesData?.length || 0;
}

export async function countProjectLikesForProjects(projectIds: string[]) {
  if (!projectIds.length) {
    return {} as Record<string, number>;
  }

  const { data: likesData, error: countError } = await supabase
    .from("template_interactions")
    .select("project_id")
    .in("project_id", projectIds);

  if (countError) {
    throw countError;
  }

  const counts = (likesData ?? []).reduce(
    (acc: Record<string, number>, like: { project_id: string }) => {
      acc[like.project_id] = (acc[like.project_id] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return counts;
}
