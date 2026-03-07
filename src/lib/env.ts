function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env file.`
    );
  }
  return value;
}

export const env = {
  get DATABASE_URL() {
    return requiredEnv("DATABASE_URL");
  },
  get NEXTAUTH_SECRET() {
    return requiredEnv("NEXTAUTH_SECRET");
  },
  get NEXTAUTH_URL() {
    return process.env.NEXTAUTH_URL || "http://localhost:3000";
  },
  get GOOGLE_CLIENT_ID() {
    return process.env.GOOGLE_CLIENT_ID || "";
  },
  get GOOGLE_CLIENT_SECRET() {
    return process.env.GOOGLE_CLIENT_SECRET || "";
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
};
