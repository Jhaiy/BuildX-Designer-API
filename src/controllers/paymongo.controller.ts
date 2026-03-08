import { Request, Response } from "express";
import axios from "axios";

const isProd = process.env.NODE_ENV === "production";
const FRONTEND_URL = isProd
  ? "https://buildxdesigner.site"
  : process.env.LOCAL_FRONTEND_URL;

export async function handlePaymongoCheckout(req: Request, res: Response) {
  const accessToken = req.headers.authorization?.split(" ")[1];
  const { amount, description, currency = "PHP", projectId } = req.body;

  if (!amount) return res.status(400).json({ error: "Amount is required" });

  try {
    const supabaseUrl =
      process.env.SUPABASE_URL || "https://odswfrqmqbybfkhpemsv.supabase.co";
    const supabaseKey =
      process.env.SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kc3dmcnFtcWJ5YmZraHBlbXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2Nzc3ODYsImV4cCI6MjA3NDI1Mzc4Nn0.2iHmgFmD7LxXaXcPO2iOHsimgVt2uCVBFHkKCUTVA-E";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let paymongoKey = null;
    let customerData = {
      name: "Customer",
      email: "customer@example.com",
      phone: undefined as string | undefined,
    };

    if (accessToken) {
      // 1. Authenticated Merchant (Preview/Test mode)
      const userResponse = await axios.get(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: supabaseKey,
        },
      });
      const userData = userResponse.data;
      paymongoKey = userData.user_metadata?.paymongo_key;
      customerData = {
        name: userData.user_metadata?.full_name || "Customer",
        email: userData.email || "customer@example.com",
        phone: userData.phone || userData.user_metadata?.phone,
      };
    } else if (projectId) {
      // 2. Anonymous Visitor on Published Site
      if (!serviceRoleKey) {
        return res.status(500).json({
          error:
            "Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing.",
          details:
            "Project owner credentials cannot be looked up for anonymous checkout.",
        });
      }

      // Fetch the project to get the owner (user_id)
      const projectResponse = await axios.get(
        `${supabaseUrl}/rest/v1/projects?projects_id=eq.${projectId}&select=user_id`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      );

      if (!projectResponse.data || projectResponse.data.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }

      const userId = projectResponse.data[0].user_id;

      // Fetch the owner's metadata using Service Role (Admin client)
      const ownerResponse = await axios.get(
        `${supabaseUrl}/auth/v1/admin/users/${userId}`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      );

      const ownerData = ownerResponse.data;
      paymongoKey = ownerData.user_metadata?.paymongo_key;
    } else {
      return res.status(401).json({
        error: "Authentication required or projectId must be provided.",
      });
    }

    if (!paymongoKey) {
      return res
        .status(400)
        .json({ error: "PayMongo key not found for this project's owner." });
    }

    const isTestMode = paymongoKey.startsWith("sk_test_");
    console.log(`PayMongo Mode: ${isTestMode ? "TEST" : "LIVE"}`);

    let paymentMethodTypes = req.body.payment_method_types;

    if (isTestMode) {
      paymentMethodTypes = ["card"];
      console.log("Test mode detected - restricting to card payments only");
    } else if (
      !paymentMethodTypes ||
      !Array.isArray(paymentMethodTypes) ||
      paymentMethodTypes.length === 0
    ) {
      paymentMethodTypes = ["card", "gcash", "paymaya", "grab_pay", "dob"];
    }

    const checkoutPayload = {
      data: {
        attributes: {
          billing: {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone || undefined,
          },
          line_items: [
            {
              amount: parseInt(amount) * 100,
              currency: currency,
              description: description || "Payment",
              name: description || "Product",
              quantity: 1,
              images: [],
            },
          ],
          payment_method_types: paymentMethodTypes,
          success_url: `${FRONTEND_URL}/success`,
          cancel_url: `${FRONTEND_URL}/cancel`,
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          description: description || "Payment",
        },
      },
    };

    const linkPayload = {
      data: {
        attributes: {
          amount: parseInt(amount) * 100,
          description: description || "Payment",
        },
      },
    };

    console.log("Creating Payment Link:", JSON.stringify(linkPayload, null, 2));

    const linkResponse = await axios.post(
      "https://api.paymongo.com/v1/links",
      linkPayload,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(paymongoKey + ":").toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Payment Link Response:",
      JSON.stringify(linkResponse.data, null, 2)
    );

    res.json({
      data: {
        attributes: {
          checkout_url: linkResponse.data.data.attributes.checkout_url,
        },
      },
    });
  } catch (error: any) {
    console.error(
      "PayMongo Error Details:",
      JSON.stringify(error.response?.data, null, 2) || error.message
    );
    res.status(500).json({
      error: "Payment creation failed",
      details: error.response?.data?.errors || error.message,
    });
  }
}
