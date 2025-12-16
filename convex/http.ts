import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Wire up Convex Auth HTTP endpoints (for password / OAuth flows).
auth.addHttpRoutes(http);

export default http;

