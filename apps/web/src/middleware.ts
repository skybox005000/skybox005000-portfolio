import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
      "WWW-Authenticate": 'Basic realm="Portfolio Dashboard", charset="UTF-8"',
    },
  });
}

function dashboardConfigured() {
  return Boolean(process.env.DASHBOARD_PASSWORD);
}

function dashboardPasswordMatches(request: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD;

  if (!password) {
    return false;
  }

  const authorization = request.headers.get("authorization") || "";
  const [scheme, encoded] = authorization.split(" ");

  if (scheme !== "Basic" || !encoded) {
    return false;
  }

  let decoded = "";

  try {
    decoded = atob(encoded);
  } catch {
    return false;
  }

  const separatorIndex = decoded.indexOf(":");
  const submittedPassword = separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : "";

  return submittedPassword === password;
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (!dashboardConfigured() && process.env.NODE_ENV === "production") {
    return new NextResponse("Not found.", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (!dashboardConfigured()) {
    return NextResponse.next();
  }

  if (!dashboardPasswordMatches(request)) {
    return unauthorized();
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
