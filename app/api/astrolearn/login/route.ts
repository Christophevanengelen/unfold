import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  applyAstrolearnSessionCookies,
  clearAstrolearnSessionCookies,
  getAdminCredentials,
  isAdminEmail,
} from "@/lib/astrolearn-auth";
import { getAstrolearnPool } from "@/lib/astrolearn-db";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const trimmedUsername = username.trim();
    const { email, password: adminPassword } = getAdminCredentials();
    if (
      trimmedUsername.toLowerCase() === email.toLowerCase() &&
      password === adminPassword
    ) {
      const response = NextResponse.json({
        ok: true,
        username: email,
        name: "Admin",
        isAdmin: true,
      });
      applyAstrolearnSessionCookies(response, { sessionUser: email, isAdmin: true });
      return response;
    }

    const pool = getAstrolearnPool();
    const { rows } = await pool.query(
      `SELECT username, login, first_name, last_name, userpassword
       FROM person
       WHERE (username = $1 OR login = $1)
       LIMIT 1`,
      [trimmedUsername]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const person = rows[0];
    const storedHash: string = person.userpassword ?? "";

    let valid = false;
    if (
      storedHash.startsWith("$2y$") ||
      storedHash.startsWith("$2b$") ||
      storedHash.startsWith("$2a$")
    ) {
      const normalizedHash = storedHash.replace(/^\$2y\$/, "$2b$");
      valid = await bcrypt.compare(password, normalizedHash);
    } else {
      valid = storedHash === password;
    }

    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const sessionUser = person.username || person.login;
    const displayName =
      [person.first_name, person.last_name].filter(Boolean).join(" ") || sessionUser;

    const response = NextResponse.json({
      ok: true,
      username: sessionUser,
      name: displayName,
      isAdmin: isAdminEmail(sessionUser),
    });
    applyAstrolearnSessionCookies(response, {
      sessionUser,
      isAdmin: isAdminEmail(sessionUser),
    });
    return response;
  } catch (err) {
    console.error("[/api/astrolearn/login]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearAstrolearnSessionCookies(response);
  return response;
}
