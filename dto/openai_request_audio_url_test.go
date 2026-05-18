package dto

import (
	"testing"

	"github.com/QuantumNous/new-api/types"
	"github.com/stretchr/testify/require"
)

func TestMessageParseContentParsesAudioURL(t *testing.T) {
	message := Message{
		Role: "user",
		Content: []any{
			map[string]any{"type": "text", "text": "Summarize this audio."},
			map[string]any{"type": "audio_url", "audio_url": "https://example.com/a.mp3"},
		},
	}

	parts := message.ParseContent()
	require.Len(t, parts, 2)
	require.Equal(t, ContentTypeAudioURL, parts[1].Type)
	audio := parts[1].GetAudioUrl()
	require.NotNil(t, audio)
	require.Equal(t, "https://example.com/a.mp3", audio.Url)
}

func TestMessageParseContentParsesVideoURLObject(t *testing.T) {
	message := Message{
		Role: "user",
		Content: []any{
			map[string]any{"type": "text", "text": "Summarize this video."},
			map[string]any{"type": "video_url", "video_url": map[string]any{"url": "https://example.com/a.mp4"}},
		},
	}

	parts := message.ParseContent()
	require.Len(t, parts, 2)
	require.Equal(t, ContentTypeVideoUrl, parts[1].Type)
	video := parts[1].GetVideoUrl()
	require.NotNil(t, video)
	require.Equal(t, "https://example.com/a.mp4", video.Url)
}

func TestGeneralOpenAIRequestGetTokenCountMetaTreatsTypedAudioURLAsAudioFile(t *testing.T) {
	message := Message{Role: "user"}
	message.SetMediaContent([]MediaContent{{
		Type:     ContentTypeAudioURL,
		AudioUrl: MessageAudioUrl{Url: "https://example.com/a.mp3"},
	}})

	meta := (&GeneralOpenAIRequest{
		Messages: []Message{message},
	}).GetTokenCountMeta()

	require.Len(t, meta.Files, 1)
	require.Equal(t, types.FileTypeAudio, meta.Files[0].FileType)
	require.True(t, meta.Files[0].IsURL())
	require.Equal(t, "https://example.com/a.mp3", meta.Files[0].GetRawData())
}

func TestGeneralOpenAIRequestGetTokenCountMetaTreatsTypedVideoURLAsVideoFile(t *testing.T) {
	message := Message{Role: "user"}
	message.SetMediaContent([]MediaContent{{
		Type:     ContentTypeVideoUrl,
		VideoUrl: MessageVideoUrl{Url: "https://example.com/a.mp4"},
	}})

	meta := (&GeneralOpenAIRequest{
		Messages: []Message{message},
	}).GetTokenCountMeta()

	require.Len(t, meta.Files, 1)
	require.Equal(t, types.FileTypeVideo, meta.Files[0].FileType)
	require.True(t, meta.Files[0].IsURL())
	require.Equal(t, "https://example.com/a.mp4", meta.Files[0].GetRawData())
}
