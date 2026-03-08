import { Request, Response } from "express";
import axios from "axios";

export async function handleGetProjects(req: Request, res: Response) {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) return res.status(401).send("No access token provided");

  try {
    const response = await axios.get("https://api.supabase.com/v1/projects", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Fetch Projects Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to fetch projects",
      details: error.response?.data || error.message,
    });
  }
}

export async function handleGetOrganizations(req: Request, res: Response) {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) return res.status(401).send("No access token provided");

  try {
    const response = await axios.get("https://api.supabase.com/v1/organizations", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Fetch Orgs Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to fetch organizations",
      details: error.response?.data || error.message,
    });
  }
}

export async function handleGetApiKeys(req: Request, res: Response) {
  const accessToken = req.headers.authorization?.split(" ")[1];
  const { ref } = req.params;

  if (!accessToken) return res.status(401).send("No access token provided");
  if (!ref) return res.status(400).send("No project ref provided");

  try {
    const response = await axios.get(
      `https://api.supabase.com/v1/projects/${ref}/api-keys`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    res.json(response.data);
  } catch (error: any) {
    console.error("Fetch Keys Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to fetch api keys",
      details: error.response?.data || error.message,
    });
  }
}

export async function handleGetSchema(req: Request, res: Response) {
  const { projectUrl, anonKey } = req.query;

  if (!projectUrl || !anonKey) {
    return res.status(400).json({ error: "Missing projectUrl or anonKey" });
  }

  try {
    const response = await axios.get(
      `${projectUrl}/rest/v2/?apikey=${anonKey}`,
      {
        headers: { Accept: "application/openapi+json" },
      }
    );

    const definitions = response.data.definitions;
    const tables = Object.keys(definitions).map((tableName) => {
      const def = definitions[tableName];
      return {
        name: tableName,
        columns: Object.keys(def.properties || {}).map((colName) => ({
          name: colName,
          type: def.properties[colName].type,
          format: def.properties[colName].format,
        })),
      };
    });

    res.json({ tables });
  } catch (error: any) {
    console.error("Fetch Schema Error:", error.message);
    res.status(500).json({
      error: "Failed to fetch schema",
      details: error.message,
    });
  }
}
