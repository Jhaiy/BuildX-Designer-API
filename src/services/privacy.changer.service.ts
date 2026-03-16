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

async function changeAnyoneCanPermission(
  projectId: string,
  anyoneCan: "edit" | "view",
) {
  if (!projectId || !anyoneCan) {
    throw new Error("Missing fields!");
  }

  const { error } = await supabase
    .from("project_collaborators")
    .update({ anyone_can: anyoneCan })
    .eq("project_id", projectId);

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

export { changeProjectPrivacySettings, changeAnyoneCanPermission };
