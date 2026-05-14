import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "astrolearn",
  user: "postgres",
  password: "L{3Agn/Ycr%[<~?XJ5zU",
});

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `SELECT username, login, first_name, last_name, userpassword
       FROM person
       WHERE (username = $1 OR login = $1)
       LIMIT 1`,
      [username.trim()]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const person = rows[0];
    const storedHash: string = person.userpassword ?? "";

    // Support both plain text (legacy) and bcrypt ($2y$ PHP or $2b$ Node)
    let valid = false;
    if (storedHash.startsWith("$2y$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2a$")) {
      // Normalize PHP $2y$ → $2b$ for bcryptjs compatibility
      const normalizedHash = storedHash.replace(/^\$2y\$/, "$2b$");
      valid = await bcrypt.compare(password, normalizedHash);
    } else {
      valid = storedHash === password;
    }

    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Use username field, fall back to login field
    const sessionUser = person.username || person.login;
    const displayName = [person.first_name, person.last_name].filter(Boolean).join(" ") || sessionUser;

    const response = NextResponse.json({ ok: true, username: sessionUser, name: displayName });
    response.cookies.set("astrolearn_session", sessionUser, {
      httpOnly: true,
      path: "/",
      maxAge: 86400, // 24h
      sameSite: "lax",
    });
    return response;
  } catch (err) {
    console.error("[/api/astrolearn/login]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("astrolearn_session", "", { maxAge: 0, path: "/" });
  return response;
}
