package controller

import "testing"

func TestComputeAdjustedUserQuotaFactorModesRound(t *testing.T) {
	tests := []struct {
		name     string
		oldQuota int
		mode     string
		factor   float64
		want     int
	}{
		{
			name:     "multiply rounds half up",
			oldQuota: 101,
			mode:     "multiply",
			factor:   1.5,
			want:     152,
		},
		{
			name:     "divide rounds half up",
			oldQuota: 101,
			mode:     "divide",
			factor:   2,
			want:     51,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := computeAdjustedUserQuota(tt.oldQuota, tt.mode, 0, tt.factor)
			if err != nil {
				t.Fatalf("computeAdjustedUserQuota returned error: %v", err)
			}
			if got != tt.want {
				t.Fatalf("computeAdjustedUserQuota() = %d, want %d", got, tt.want)
			}
		})
	}
}

func TestComputeAdjustedUserQuotaRejectsInvalidFactor(t *testing.T) {
	if _, err := computeAdjustedUserQuota(100, "multiply", 0, 0); err == nil {
		t.Fatal("expected error for zero multiply factor")
	}
	if _, err := computeAdjustedUserQuota(100, "divide", 0, -1); err == nil {
		t.Fatal("expected error for negative divide factor")
	}
}
