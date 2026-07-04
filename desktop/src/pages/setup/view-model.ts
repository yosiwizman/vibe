import { invoke } from '@tauri-apps/api/core'
import { emit, listen } from '@tauri-apps/api/event'
import { useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ErrorModalContext } from '~/providers/error-modal'
import { usePreferenceProvider } from '~/providers/preference'
import * as utils from '~/lib/model'
import * as osExt from '@tauri-apps/plugin-os'
import * as config from '~/lib/config'

export function viewModel() {
	const location = useLocation()
	const [downloadProgress, setDownloadProgress] = useState(0)
	const [isOnline, setIsOnline] = useState<boolean | null>(null)
	const downloadProgressRef = useRef(0)
	const { setState: setErrorModal } = useContext(ErrorModalContext)
	const navigate = useNavigate()
	const preference = usePreferenceProvider()
	const [modelCompany, setModelCompany] = useState('OpenAI')
	const [isDownloading, setIsDownloading] = useState(false)

	function handleProgressEvenets() {
		listen('download_progress', (event) => {
			// event.event is the event name (useful if you want to use a single callback fn for multiple event types)
			// event.payload is the payload object
			const [current, total] = event.payload as [number, number]
			const newDownloadProgress = Number(current / total) * 100

			if (newDownloadProgress > downloadProgressRef.current) {
				// for some reason it jumps if not
				setDownloadProgress(newDownloadProgress)
				downloadProgressRef.current = newDownloadProgress
			}
		})
	}

	async function downloadModel() {
		// In-flight guard: ignore repeated clicks before the first progress event so we never start
		// concurrent downloads or register duplicate progress listeners.
		if (isDownloading) {
			return
		}
		setIsDownloading(true)
		handleProgressEvenets()

		let lastError = null

		try {
			let urls = []

			// Determine model URLs
			if (location?.state?.downloadURL) {
				urls = [location.state.downloadURL]
				console.log(`[model] Using provided model URL: ${urls[0]}`)
				if (urls[0].includes('ivrit')) {
					setModelCompany('ivrit.ai')
				}
			} else {
				urls = [...config.modelUrls.default]
				const locale = await osExt.locale()
				console.log(`[locale] Detected locale: ${locale}`)

				if (locale?.endsWith('-IL')) {
					console.log(`[model] Prioritizing Hebrew models`)
					urls.unshift(...config.modelUrls.hebrew)
					setModelCompany('ivrit.ai')
				}
			}

			// Try downloading from each URL
			for (const url of urls) {
				try {
					console.log(`[model] Attempting to download from: ${url}`)
					// Enforce the known SHA256 for the pinned primary model; other URLs have no entry
					// and download without hash enforcement (out of scope here).
					const path = await utils.downloadModel(url, config.modelSha256[url])
					if (path) {
						console.log(`[model] Download succeeded: ${path}`)
						preference.setModelPath(path)
						navigate('/')
						return
					}
				} catch (err) {
					console.error(`[model] Failed to download from ${url}:`, err)
					lastError = err
				}
			}

			throw new Error(`All model downloads failed. Last error: ${lastError}`)
		} catch (err) {
			console.error(`[model] Unhandled error:`, err)
			setErrorModal?.({ open: true, log: String(err) })
		} finally {
			// Allow a retry after a failed/aborted download (on success we've already navigated away).
			setIsDownloading(false)
		}
	}

	async function downloadIfOnline() {
		try {
			// Check if online
			const isOnlineResponse = await invoke<boolean>('is_online')
			// Update UI first
			setIsOnline(isOnlineResponse)
			// First-run download guard: do NOT auto-start the large model download. Only auto-download
			// when the user explicitly chose a specific model (e.g. a "Magic Setup" deep link supplies a
			// downloadURL). On the default first run the user must click Download (see setup/page.tsx),
			// so the app never silently pulls a large model on launch.
			if (isOnlineResponse && location?.state?.downloadURL) {
				void downloadModel()
			}
		} catch (err) {
			// If the connectivity check itself fails, don't leave the UI stuck on the spinner —
			// treat it as offline so the user gets the retry / manual-setup path.
			console.error('[setup] is_online check failed:', err)
			setIsOnline(false)
		}
	}

	async function cancelSetup() {
		// Cancel and go to settings
		preference.setSkippedSetup(true)
		emit('abort_download')
		navigate('/#settings')
	}

	useEffect(() => {
		downloadIfOnline()
	}, [])

	return {
		modelCompany,
		navigate,
		cancelSetup,
		setErrorModal,
		downloadProgress,
		downloadIfOnline,
		downloadModel,
		isDownloading,
		setDownloadProgress,
		downloadProgressRef,
		isOnline,
		location,
	}
}
