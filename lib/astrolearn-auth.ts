import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ASTROLEARN_SESSION_COOKIE = "astrolearn_session";
export const ASTROLEARN_ROLE_COOKIE = "astrolearn_role";
export const ASTROLEARN_VIEW_SUBJECT_COOKIE = "astrolearn_view_subject";
export const ASTROLEARN_SESSION_MAX_AGE = 86_400;

export type ViewSubject =
  | { source: "astrolearn"; personId: string; label: string; username?: string }
  | { source: "unfold"; deviceId: string; label: string };

export function getAdminCredentials(): { email: string; password: string } {
  return {
    email: process.env.ASTROLEARN_ADMIN_EMAIL ?? "admin@astrolearn.io",
    password: process.env.ASTROLEARN_ADMIN_PASSWORD ?? "123456",
  };
}

export function isAdminEmail(email: string): boolean {
  const { email: adminEmail } = getAdminCredentials();
  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
}

export function parseViewSubject(raw: string | undefined): ViewSubject | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ViewSubject;
    if (parsed.source === "astrolearn" && parsed.personId && parsed.label) {
      return parsed;
    }
    if (parsed.source === "astrolearn" && parsed.username && parsed.label) {
      return {
        source: "astrolearn",
        personId: parsed.username,
        label: parsed.label,
        username: parsed.username,
      };
    }
    if (parsed.source === "unfold" && parsed.deviceId && parsed.label) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export async function getAstrolearnAuthState(): Promise<{
  sessionUser: string | null;
  isAdmin: boolean;
  viewSubject: ViewSubject | null;
}> {
  const cookieStore = await cookies();
  const sessionUser = cookieStore.get(ASTROLEARN_SESSION_COOKIE)?.value ?? null;
  const isAdmin =
    cookieStore.get(ASTROLEARN_ROLE_COOKIE)?.value === "admin" ||
    (sessionUser !== null && isAdminEmail(sessionUser));
  const viewSubject = parseViewSubject(cookieStore.get(ASTROLEARN_VIEW_SUBJECT_COOKIE)?.value);

  return { sessionUser, isAdmin, viewSubject };
}

export function applyAstrolearnSessionCookies(
  response: NextResponse,
  options: { sessionUser: string; isAdmin?: boolean }
): void {
  response.cookies.set(ASTROLEARN_SESSION_COOKIE, options.sessionUser, {
    httpOnly: true,
    path: "/",
    maxAge: ASTROLEARN_SESSION_MAX_AGE,
    sameSite: "lax",
  });

  if (options.isAdmin) {
    response.cookies.set(ASTROLEARN_ROLE_COOKIE, "admin", {
      httpOnly: true,
      path: "/",
      maxAge: ASTROLEARN_SESSION_MAX_AGE,
      sameSite: "lax",
    });
  } else {
    response.cookies.set(ASTROLEARN_ROLE_COOKIE, "", { maxAge: 0, path: "/" });
    response.cookies.set(ASTROLEARN_VIEW_SUBJECT_COOKIE, "", { maxAge: 0, path: "/" });
  }
}

export function applyViewSubjectCookie(response: NextResponse, subject: ViewSubject): void {
  response.cookies.set(ASTROLEARN_VIEW_SUBJECT_COOKIE, JSON.stringify(subject), {
    httpOnly: true,
    path: "/",
    maxAge: ASTROLEARN_SESSION_MAX_AGE,
    sameSite: "lax",
  });
}

export function clearAstrolearnSessionCookies(response: NextResponse): void {
  response.cookies.set(ASTROLEARN_SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set(ASTROLEARN_ROLE_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set(ASTROLEARN_VIEW_SUBJECT_COOKIE, "", { maxAge: 0, path: "/" });
}

export async function requireAdminSession(): Promise<
  | { ok: true; sessionUser: string; viewSubject: ViewSubject | null }
  | { ok: false; status: number; error: string }
> {
  const { sessionUser, isAdmin, viewSubject } = await getAstrolearnAuthState();
  if (!sessionUser) {
    return { ok: false, status: 401, error: "Not authenticated" };
  }
  if (!isAdmin) {
    return { ok: false, status: 401, error: "Admin access required" };
  }
  return { ok: true, sessionUser, viewSubject };
}
