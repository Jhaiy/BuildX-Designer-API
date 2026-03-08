import { Request, Response } from "express";
import axios from "axios";

const isProd = process.env.NODE_ENV === "production";

const FRONTEND_URL = isProd
  ? "https://buildxdesigner.site"
  : process.env.LOCAL_FRONTEND_URL;

const CALLBACK_URL = isProd
  ? "https://build-x-designer-api.vercel.app/api/auth/callback"
  : process.env.LOCAL_CALLBACK_URL;

const { SUPABASE_CLIENT_ID, SUPABASE_CLIENT_SECRET } = process.env;

export function handleOAuthAuthorizeRedirect(req: Request, res: Response) {
  console.log(
    "[REDIRECT] User tried to access /v2/oauth/authorize directly. Redirecting to /api/auth/supabase"
  );
  res.redirect("/api/auth/supabase");
}

export function handleSupabaseAuth(req: Request, res: Response) {
  const rootUrl = "https://api.supabase.com/v1/oauth/authorize";
  const options = {
    client_id: SUPABASE_CLIENT_ID || "",
    redirect_uri: CALLBACK_URL || "",
    response_type: "code",
    state: "optional-custom-state",
  };

  const qs = new URLSearchParams(options).toString();
  res.redirect(`${rootUrl}?${qs}`);
}

export async function handleAuthCallback(req: Request, res: Response) {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send("No code provided");
  }

  try {
    const tokenResponse = await axios.post(
      "https://api.supabase.com/v1/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: CALLBACK_URL || "",
        client_id: SUPABASE_CLIENT_ID || "",
        client_secret: SUPABASE_CLIENT_SECRET || "",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 10000,
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    res.redirect(
      `${FRONTEND_URL}/dashboard?status=success&token=${access_token}&refresh_token=${refresh_token}`
    );
  } catch (error: any) {
    console.error("OAuth Error:", error.response?.data || error.message);
    if (error.response?.data) {
      console.error("Details:", JSON.stringify(error.response.data, null, 2));
    }
    res.status(500).send("Authentication failed. Check server logs for details.");
  }
}
