import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "cubicle-rift";
const githubPagesBase = repositoryName.endsWith(".github.io") ? "/" : `/${repositoryName}/`;

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? githubPagesBase : "/",
  plugins: [react()],
});
