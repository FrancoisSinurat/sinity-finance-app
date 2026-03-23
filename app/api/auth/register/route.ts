import { NextRequest } from "next/server";
import { proxyAuth } from "../_shared";

export async function POST(request: NextRequest) {
  return proxyAuth(request, "register");
}
