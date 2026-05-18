package ratio_setting

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestClaude46ModelsUseThirtyTimesOfficialPricing(t *testing.T) {
	InitRatioSettings()

	tests := []struct {
		name                     string
		model                    string
		expectedInputRatio       float64
		expectedCompletionRatio  float64
		expectedCacheReadRatio   float64
		expectedCacheCreateRatio float64
	}{
		{
			name:                     "claude-opus-4-6 uses 30x official pricing",
			model:                    "claude-opus-4-6",
			expectedInputRatio:       75,
			expectedCompletionRatio:  5,
			expectedCacheReadRatio:   0.1,
			expectedCacheCreateRatio: 1.25,
		},
		{
			name:                     "claude-sonnet-4-6 uses 30x official pricing",
			model:                    "claude-sonnet-4-6",
			expectedInputRatio:       45,
			expectedCompletionRatio:  5,
			expectedCacheReadRatio:   0.1,
			expectedCacheCreateRatio: 1.25,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, ok := GetModelPrice(tt.model, false)
			require.False(t, ok)

			ratio, ok, _ := GetModelRatio(tt.model)
			require.True(t, ok)
			require.Equal(t, tt.expectedInputRatio, ratio)
			require.Equal(t, tt.expectedCompletionRatio, GetCompletionRatio(tt.model))

			cacheRatio, ok := GetCacheRatio(tt.model)
			require.True(t, ok)
			require.Equal(t, tt.expectedCacheReadRatio, cacheRatio)

			createCacheRatio, ok := GetCreateCacheRatio(tt.model)
			require.True(t, ok)
			require.Equal(t, tt.expectedCacheCreateRatio, createCacheRatio)
		})
	}
}

func TestClaude45AliasesUseOfficialPricing(t *testing.T) {
	InitRatioSettings()

	tests := []struct {
		name            string
		model           string
		expectedRatio   float64
		expectedCompRat float64
	}{
		{
			name:            "claude-haiku-4-5 uses official ratio",
			model:           "claude-haiku-4-5",
			expectedRatio:   0.5,
			expectedCompRat: 5,
		},
		{
			name:            "claude-opus-4-5 uses official ratio",
			model:           "claude-opus-4-5",
			expectedRatio:   2.5,
			expectedCompRat: 5,
		},
		{
			name:            "claude-sonnet-4-5 uses official ratio",
			model:           "claude-sonnet-4-5",
			expectedRatio:   1.5,
			expectedCompRat: 5,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, ok := GetModelPrice(tt.model, false)
			require.False(t, ok)

			ratio, ok, _ := GetModelRatio(tt.model)
			require.True(t, ok)
			require.Equal(t, tt.expectedRatio, ratio)
			require.Equal(t, tt.expectedCompRat, GetCompletionRatio(tt.model))
		})
	}
}

func TestAllDefaultGeminiModelsAreFree(t *testing.T) {
	InitRatioSettings()

	for model := range GetDefaultModelRatioMap() {
		if !strings.HasPrefix(model, "gemini-") {
			continue
		}
		ratio, ok, _ := GetModelRatio(model)
		require.Truef(t, ok, "expected gemini model %s to be configured", model)
		require.Zerof(t, ratio, "expected gemini model %s to be free", model)
	}
}
