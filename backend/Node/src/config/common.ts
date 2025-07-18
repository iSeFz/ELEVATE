export const PORT = process.env.PORT ?? 3000;

export const PROJECT_ROOT = process.env.VERCEL
  ? '/var/task/Node' // Use the correct path in Vercel
  : process.cwd();   // Use working directory in local dev
