import { invoke } from '@tauri-apps/api/core'
import * as fsExt from '@tauri-apps/plugin-fs'
import { load } from '@tauri-apps/plugin-store'
import * as config from './config'
import { NamedPath } from './types'

export async function resetApp() {
	const modelPath = localStorage.getItem('model_path')
	try {
		const store = await load(config.storeFilename)
		await store.clear()
		if (modelPath) {
			try {
				await fsExt.remove(modelPath)
			} catch (e) {
				console.error(e)
			}
		}
	} catch (e) {
		console.error(e)
	} finally {
		localStorage.clear()
		location.href = '/setup'
	}
}

export async function getIssueUrl(_logs: string): Promise<string> {
	// PrivateNote Therapist V1: upstream issue reporting is disabled. Do not open the
	// upstream thewh1teagle/vibe issue tracker. Returns an empty string; callers no-op on empty.
	return ''
}

export async function openPath(path: NamedPath) {
	await invoke('open_path', { path: path.path })
}
