package model

import (
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/require"
)

func TestUserValidationAllowsOAuthDisplayNamesLongerThanUsernameLimit(t *testing.T) {
	user := User{
		Username:    "oidc_176",
		Password:    "password123",
		DisplayName: "zhangsimin660@gmail.com",
	}

	require.NoError(t, common.Validate.Struct(&user))
}

func TestUserValidationRejectsOverlongDisplayName(t *testing.T) {
	user := User{
		Username:    "oidc_176",
		Password:    "password123",
		DisplayName: strings.Repeat("a", 101),
	}

	require.Error(t, common.Validate.Struct(&user))
}
