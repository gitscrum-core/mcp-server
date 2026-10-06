/**
 * Application Context & Vurb Instance
 *
 * Central factory for the vurb.ts framework integration.
 * All tools share the same `AppContext` which carries the API client.
 */

import { initVurb } from '@vurb/core';
import type { GitScrumClient } from './client/GitScrumClient.js';

export interface AppContext {
  client: GitScrumClient;
}

export const f = initVurb<AppContext>();
