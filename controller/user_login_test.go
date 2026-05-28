package controller

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
)

func TestCanUseLocalPasswordLoginWhenDisabled(t *testing.T) {
	tests := []struct {
		name string
		role int
		want bool
	}{
		{name: "common user blocked", role: common.RoleCommonUser, want: false},
		{name: "admin allowed", role: common.RoleAdminUser, want: true},
		{name: "root allowed", role: common.RoleRootUser, want: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := canUseLocalPasswordLoginWhenDisabled(tt.role); got != tt.want {
				t.Fatalf("canUseLocalPasswordLoginWhenDisabled(%d) = %v, want %v", tt.role, got, tt.want)
			}
		})
	}
}
