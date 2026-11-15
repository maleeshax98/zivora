"use server";

import { writeClient } from "@/lib/sanity/client";

export interface ContactSubmissionInput {
  name: string;
  email: string;
  scope?: string;
}

export interface ContactSubmissionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Server action to save contact form submission directly to Sanity Content Lake.
 *
 * @param input - Contact form payload containing name, email, and optional scope
 * @returns Result status with success flag, message, or error detail
 */
export async function submitContactAction(
  input: ContactSubmissionInput
): Promise<ContactSubmissionResult> {
  const name = input.name?.trim();
  const email = input.email?.trim();
  const scope = input.scope?.trim() || "";

  if (!name) {
    return {
      success: false,
      error: "Please share your name so we know who we're speaking with.",
    };
  }

  if (!email) {
    return {
      success: false,
      error: "Please provide your email address so we can write back.",
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: "Please provide a valid email address so we can reply.",
    };
  }

  // Check for write token configuration
  const hasWriteToken = Boolean(
    process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN
  );

  if (!hasWriteToken) {
    // Detailed technical guidance in the server terminal only - NEVER exposed to the webpage
    console.warn(
      "\n[Sanity Configuration Notice]\n" +
        "SANITY_API_WRITE_TOKEN is not configured in environment variables.\n" +
        "Contact submissions cannot be saved to the Sanity Content Lake without a write token.\n" +
        "Please generate an API token with 'Editor' permissions at https://sanity.io/manage and add it to your .env:\n" +
        "SANITY_API_WRITE_TOKEN=your_token_here\n"
    );

    return {
      success: false,
      error:
        "We couldn't deliver your note right now. Please reach us directly on WhatsApp or email, or try again shortly.",
    };
  }

  try {
    await writeClient.create({
      _type: "contact",
      name,
      email,
      scope: scope || undefined,
      submittedAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Thank you for reaching out. We have received your note.",
    };
  } catch (error) {
    // Log complete error details with stack trace to the server terminal only
    console.error("[Sanity Submission Error] Failed to create contact document:", error);

    return {
      success: false,
      error:
        "We couldn't deliver your note right now. Please reach us directly on WhatsApp or email, or try again shortly.",
    };
  }
}
