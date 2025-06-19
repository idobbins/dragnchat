const authConfig = {
  providers: [
    {
      // Using the Clerk Frontend API URL from the JWT template
      // This is configured in .env.local as CLERK_FRONTEND_API_URL
      domain: process.env.CLERK_FRONTEND_API_URL,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
