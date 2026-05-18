package openaicompat

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	"github.com/stretchr/testify/require"
	"github.com/tidwall/gjson"
)

func TestChatCompletionsRequestToResponsesRequestConvertsAudioURLToInputAudio(t *testing.T) {
	req := &dto.GeneralOpenAIRequest{
		Model: "mimo-v2-omni",
		Messages: []dto.Message{{
			Role: "user",
			Content: []any{
				map[string]any{"type": "text", "text": "Summarize this audio."},
				map[string]any{"type": "audio_url", "audio_url": "https://example.com/a.mp3"},
			},
		}},
	}

	responsesReq, err := ChatCompletionsRequestToResponsesRequest(req)
	require.NoError(t, err)

	encoded, err := common.Marshal(responsesReq)
	require.NoError(t, err)

	require.Equal(t, "input_audio", gjson.GetBytes(encoded, "input.0.content.1.type").String())
	require.Equal(t, "https://example.com/a.mp3", gjson.GetBytes(encoded, "input.0.content.1.audio_url").String())
}

func TestChatCompletionsRequestToResponsesRequestConvertsVideoURLObjectToInputVideo(t *testing.T) {
	req := &dto.GeneralOpenAIRequest{
		Model: "mimo-v2-omni",
		Messages: []dto.Message{{
			Role: "user",
			Content: []any{
				map[string]any{"type": "text", "text": "Summarize this clip."},
				map[string]any{"type": "video_url", "video_url": map[string]any{"url": "https://example.com/a.mp4"}},
			},
		}},
	}

	responsesReq, err := ChatCompletionsRequestToResponsesRequest(req)
	require.NoError(t, err)

	encoded, err := common.Marshal(responsesReq)
	require.NoError(t, err)

	require.Equal(t, "input_video", gjson.GetBytes(encoded, "input.0.content.1.type").String())
	require.Equal(t, "https://example.com/a.mp4", gjson.GetBytes(encoded, "input.0.content.1.video_url.url").String())
}

func TestChatCompletionsRequestToResponsesRequestConvertsTypedAudioURLAndKeepsAssistantTextType(t *testing.T) {
	user := dto.Message{Role: "user"}
	user.SetMediaContent([]dto.MediaContent{{
		Type:     dto.ContentTypeAudioURL,
		AudioUrl: dto.MessageAudioUrl{Url: "https://example.com/a.mp3"},
	}})

	assistant := dto.Message{Role: "assistant"}
	assistant.SetMediaContent([]dto.MediaContent{{
		Type: dto.ContentTypeText,
		Text: "I heard birdsong.",
	}})

	responsesReq, err := ChatCompletionsRequestToResponsesRequest(&dto.GeneralOpenAIRequest{
		Model:    "mimo-v2-omni",
		Messages: []dto.Message{user, assistant},
	})
	require.NoError(t, err)

	encoded, err := common.Marshal(responsesReq)
	require.NoError(t, err)

	require.Equal(t, "input_audio", gjson.GetBytes(encoded, "input.0.content.0.type").String())
	require.Equal(t, "https://example.com/a.mp3", gjson.GetBytes(encoded, "input.0.content.0.audio_url").String())
	require.Equal(t, "output_text", gjson.GetBytes(encoded, "input.1.content.0.type").String())
	require.Equal(t, "I heard birdsong.", gjson.GetBytes(encoded, "input.1.content.0.text").String())
}
