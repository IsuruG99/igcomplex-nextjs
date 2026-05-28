import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ownerSessionCookieName } from "../../lib/owner-auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(ownerSessionCookieName());

  return NextResponse.redirect(new URL("/", request.url), {
    status: 303,
  });
}