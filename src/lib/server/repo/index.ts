import { MockRepo } from './mock';
import type { Repo } from './types';

let instance: Repo | null = null;

export function getRepo(): Repo {
	if (!instance) {
		instance = new MockRepo();
	}
	return instance;
}

export type { Repo } from './types';
