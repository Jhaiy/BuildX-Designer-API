import supabase from "./database.service";

async function changeProjectPrivacySettings(
  projectId: string,
  isPublic: boolean,
) {
  if (!projectId || isPublic === undefined) {
    throw new Error("Missing fields!");
  }

  const { error: updateError } = await supabase
    .from("projects")
    .update({ is_public: isPublic })
    .eq("projects_id", projectId)
    .select();

  if (updateError) {
    throw new Error(`Database error: ${updateError.message}`);
  }
}

export { changeProjectPrivacySettings };
