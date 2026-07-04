export const updateVersionURL = 'https://github.com/thewh1teagle/vibe/releases/latest'
export const unsupportedCpuReadmeURL = 'https://thewh1teagle.github.io/vibe/docs#install'
export const storeFilename = 'app_config.json'
export const latestReleaseURL = 'https://github.com/thewh1teagle/vibe/releases/latest'
export const latestVersionWithoutVulkan = 'https://github.com/thewh1teagle/vibe/releases/download/v2.4.0/vibe_2.4.0_x64-setup.exe'

// Primary model is pinned to a fixed Hugging Face commit (immutable) rather than the mutable
// `resolve/main` ref, so the downloaded bytes can never change under us and can be integrity-checked
// against a known SHA256. Commit verified in handoff/lane_reports/lane_model_hash_evidence_rebuild_run25.md.
export const primaryModelUrl =
	'https://huggingface.co/ggerganov/whisper.cpp/resolve/5359861c739e955e79d9a303bcbc70fb988958b1/ggml-large-v3-turbo.bin'

export const modelUrls = {
	default: [
		primaryModelUrl,
		'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin', // Fallback (non-primary; not pinned/verified in this scope)
	],
	hebrew: ['https://huggingface.co/ivrit-ai/whisper-large-v3-turbo-ggml/resolve/main/ggml-model.bin'],
}

// Expected SHA256 fingerprints, keyed by download URL. Only the primary model is enforced in this
// scope (verified HIGH-confidence against upstream Git-LFS metadata + the on-disk file). A URL absent
// from this map is downloaded without hash enforcement (non-primary models are out of scope here).
export const modelSha256: Record<string, string> = {
	[primaryModelUrl]: '1fc70f774d38eb169993ac391eea357ef47c88757ef72ee5943879b7e8e2bc69',
}

export const embeddingModelFilename = 'wespeaker_en_voxceleb_CAM++.onnx'
export const segmentModelFilename = 'segmentation-3.0.onnx'
export const embeddingModelUrl = 'https://github.com/thewh1teagle/vibe/releases/download/v0.0.1/wespeaker_en_voxceleb_CAM++.onnx'
export const segmentModelUrl = 'https://github.com/thewh1teagle/vibe/releases/download/v0.0.1/segmentation-3.0.onnx'

export const diarizeModelFilename = 'diar_streaming_sortformer_4spk-v2.1.onnx'
export const diarizeModelUrl = 'https://huggingface.co/altunenes/parakeet-rs/resolve/main/diar_streaming_sortformer_4spk-v2.1.onnx'
export const vadModelFilename = 'ggml-silero-v6.2.0.bin'
export const vadModelUrl = 'https://huggingface.co/ggml-org/whisper-vad/resolve/main/ggml-silero-v6.2.0.bin'

export const llmApiKeyUrl = 'https://console.anthropic.com/settings/keys'
export const llmDefaultMaxTokens = 8192 // https://docs.anthropic.com/en/docs/about-claude/models
export const llmLimitsUrl = 'https://console.anthropic.com/settings/limits'
export const llmCostUrl = 'https://console.anthropic.com/settings/cost'

export const ytDlpAssetNames: Record<string, string> = {
	'windows-x86_64': 'yt-dlp.exe',
	'windows-aarch64': 'yt-dlp_arm64.exe',
	'linux-x86_64': 'yt-dlp_linux',
	'linux-aarch64': 'yt-dlp_linux_aarch64',
	'macos-x86_64': 'yt-dlp_macos',
	'macos-aarch64': 'yt-dlp_macos',
}

export function ytDlpDownloadUrl(version: string, key: string): string {
	return `https://github.com/yt-dlp/yt-dlp/releases/download/${version}/${ytDlpAssetNames[key]}`
}

export const videoExtensions = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'webm', 'mxf']
export const audioExtensions = ['mp3', 'wav', 'aac', 'flac', 'oga', 'ogg', 'opic', 'opus', 'm4a', 'm4b', 'wma']
export const themes = ['light', 'dark']
