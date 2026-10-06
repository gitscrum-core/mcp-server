/**
 * Project Context Resolution Utilities
 *
 * Shared helpers used by multiple tool modules to resolve
 * project and workspace context from partial parameters.
 */

import type { GitScrumClient } from '../client/GitScrumClient.js';

export interface ProjectContext {
  company_slug: string;
  project_slug: string;
}

/**
 * Auto-resolve company_slug when only project_slug is provided.
 * Searches the user's workspaces and projects to find the matching pair.
 */
export async function resolveProjectContext(
  client: GitScrumClient,
  args: { company_slug?: string; project_slug?: string },
): Promise<ProjectContext | null> {
  if (args.company_slug && args.project_slug) {
    return { company_slug: args.company_slug, project_slug: args.project_slug };
  }

  if (!args.project_slug) return null;

  try {
    const project = await client.findProjectByName(args.project_slug);
    if (project) {
      return {
        company_slug: project.company_slug,
        project_slug: project.project_slug || args.project_slug,
      };
    }
  } catch {
    // Silent fallback
  }

  return null;
}

/**
 * Normalize color string: strips '#' prefix.
 */
export function normalizeColor(color: string): string {
  return color.replace(/^#/, '');
}
