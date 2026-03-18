import supabase from "./database.service";

type ServiceError = Error & {
  status?: number;
  details?: unknown;
};

function createServiceError(
  message: string,
  status: number,
  details?: unknown,
): ServiceError {
  const error = new Error(message) as ServiceError;
  error.status = status;
  error.details = details;
  return error;
}

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
    throw createServiceError(
      "Missing required fields: userId and projectId",
      400,
    );
  }

  const { data: existingLikes, error: existingLikeError } = await supabase
    .from("template_interactions")
    .select("*")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .limit(1);

  if (existingLikeError) {
    throw existingLikeError;
  }

  if ((existingLikes ?? []).length > 0) {
    return existingLikes;
  }

  const { data: likeData, error: likeError } = await supabase
    .from("template_interactions")
    .insert([{ user_id: userId, project_id: projectId }])
    .select();

  if (likeError) {
    if (likeError.code === "23505") {
      const { data: fallbackLike, error: fallbackLikeError } = await supabase
        .from("template_interactions")
        .select("*")
        .eq("user_id", userId)
        .eq("project_id", projectId)
        .limit(1);

      if (fallbackLikeError) {
        throw fallbackLikeError;
      }

      if ((fallbackLike ?? []).length === 0) {
        return [
          {
            user_id: userId,
            project_id: projectId,
            already_liked: true,
          },
        ];
      }

      return fallbackLike ?? [];
    }

    throw likeError;
  }

  if ((likeData ?? []).length === 0) {
    const { data: persistedLike, error: persistedLikeError } = await supabase
      .from("template_interactions")
      .select("*")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .limit(1);

    if (persistedLikeError) {
      throw persistedLikeError;
    }

    if ((persistedLike ?? []).length === 0) {
      throw createServiceError(
        "Like operation did not persist a record. Verify table constraints and RLS policies.",
        500,
      );
    }

    return persistedLike;
  }

  return likeData;
}

export async function unlikeProject(userId: string, projectId: string) {
  if (!userId || !projectId) {
    throw createServiceError(
      "Missing required fields: userId and projectId",
      400,
    );
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
    .select("project_id, user_id, projects(project_layout)")
    .eq("project_id", projectId);

  if (fetchError) {
    throw fetchError;
  }

  return publishedTemplateData;
}

export async function displayTemplates() {
  const { data: templates, error: displayError } = await supabase
    .from("published_templates")
    .select(
      "project_id, user_id, profiles(user_id, avatar_url, full_name), projects(projects_id, description, category, user_id, project_name, thumbnail)",
    );

  if (displayError) {
    throw displayError;
  }

  return templates;
}
export async function insertTemplateData(projectId: string, userId: string) {
  if (!projectId || !userId) {
    throw createServiceError("Missing projectId or userId", 400);
  }

  const { data: existing, error: existingError } = await supabase
    .from("published_templates")
    .select("project_id")
    .eq("project_id", projectId)
    .limit(1);

  if (existingError) {
    throw existingError;
  }

  if ((existing ?? []).length > 0) {
    return existing;
  }

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
    .update({
      published_template: isPublished,
    })
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

export async function insertUserComment(
  projectId: string,
  userId: string,
  userComment: string,
) {
  const { data, error } = await supabase
    .from("template_comments")
    .insert([
      { projects_id: projectId, user_id: userId, user_comment: userComment },
    ])
    .select();
  if (error) {
    throw error;
  }

  return data;
}

export async function fetchUserComments(projectId: string) {
  const { data: commentsData, error: fetchError } = await supabase
    .from("template_comments")
    .select(
      "comment_id, user_id, user_comment, profiles(user_id, full_name, avatar_url)",
    )
    .eq("projects_id", projectId);

  if (commentsData) {
    return commentsData;
  }

  if (fetchError) {
    throw fetchError;
  }
}

export async function fetchMostLikedTemplates(limit = 20) {
  const { data: templates, error: templatesError } = await supabase
    .from("published_templates")
    .select(
      `
      project_id,
      user_id,
      profiles(user_id, avatar_url, full_name),
      projects(
        projects_id,
        description,
        category,
        user_id,
        project_name,
        thumbnail,
        is_published,
        published_template
      )
    `,
    );

  if (templatesError) {
    throw templatesError;
  }

  const projectIds = (templates ?? []).map(
    (template: any) => template.project_id,
  );

  if (projectIds.length === 0) {
    return [];
  }

  const likeCounts = await countProjectLikesForProjects(projectIds);

  const templatesWithLikeCount = (templates ?? []).map((template: any) => ({
    ...template,
    likeCount: likeCounts[template.project_id] ?? 0,
  }));

  templatesWithLikeCount.sort((a: any, b: any) => {
    return (b.likeCount ?? 0) - (a.likeCount ?? 0);
  });

  return templatesWithLikeCount.slice(0, limit);
}

export async function fetchTrashedTemplates(userId: string) {
  const { data: trashedTemplates, error } = await supabase
    .from("projects")
    .select(
      "projects_id, project_name, description, category, thumbnail, published_template",
    )
    .eq("user_id", userId)
    .eq("status", "trash");

  if (error) {
    throw error;
  }

  return trashedTemplates;
}

export async function insertTemplateFlags(
  projectId: string,
  userId: string,
  reason: string[],
  category: string,
) {
  const { data, error } = await supabase
    .from("template_flags")
    .insert([
      {
        project_id: projectId,
        user_id: userId,
        flag_reason: reason,
        flag_category: category,
      },
    ])
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function viewTemplateFlags() {
  const { data: templateFlags, error } = await supabase.from("template_flags")
    .select(`
      id,
      user_id,
      created_at,
      flag_category,
      flag_reason,
      projects (
        projects_id,
        project_name,
        user_id,
        description,
        project_layout,
        is_public,
        subdomain,
        category,
        thumbnail
      )
    `);

  if (error) {
    throw error;
  }

  const flags = templateFlags ?? [];

  const authorIds = Array.from(
    new Set(flags.map((flag: any) => flag.projects?.user_id).filter(Boolean)),
  );

  if (authorIds.length === 0) {
    return flags.map((flag: any) => ({
      ...flag,
      reporter_id: flag.user_id,
      projects: flag.projects
        ? {
            ...flag.projects,
            author_id: flag.projects.user_id,
            author_profile: null,
          }
        : null,
    }));
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, full_name, avatar_url, email_address")
    .in("user_id", authorIds);

  if (profilesError) {
    throw profilesError;
  }

  const profileMap = new Map(
    (profiles ?? []).map((profile: any) => [profile.user_id, profile]),
  );

  return flags.map((flag: any) => ({
    ...flag,
    reporter_id: flag.user_id,
    projects: flag.projects
      ? {
          ...flag.projects,
          author_id: flag.projects.user_id,
          author_profile: profileMap.get(flag.projects.user_id) ?? null,
        }
      : null,
  }));
}

export async function deleteTemplateFlag(flagId: string) {
  const { error } = await supabase
    .from("template_flags")
    .delete()
    .eq("id", flagId);

  if (error) {
    throw error;
  }

  return { message: "Flag deleted successfully" };
}
