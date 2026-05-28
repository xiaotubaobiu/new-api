package model

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func insertUserForSearchTest(t *testing.T, id int, username string) {
	t.Helper()
	require.NoError(t, DB.Create(&User{
		Id:          id,
		Username:    username,
		Password:    "password123",
		DisplayName: username,
		Status:      common.UserStatusEnabled,
		Group:       "default",
		AffCode:     username,
	}).Error)
}

func collectUserIds(users []*User) []int {
	ids := make([]int, 0, len(users))
	for _, user := range users {
		ids = append(ids, user.Id)
	}
	return ids
}

func TestSearchUsersFiltersByActiveSubscription(t *testing.T) {
	truncateTables(t)

	now := common.GetTimestamp()
	insertUserForSearchTest(t, 501, "active-sub-user")
	insertUserForSearchTest(t, 502, "expired-sub-user")
	insertUserForSearchTest(t, 503, "cancelled-sub-user")
	insertUserForSearchTest(t, 504, "no-sub-user")

	require.NoError(t, DB.Create(&UserSubscription{
		UserId:      501,
		PlanId:      1,
		Status:      "active",
		StartTime:   now - 3600,
		EndTime:     now + 3600,
		AmountTotal: 1000,
	}).Error)
	require.NoError(t, DB.Create(&UserSubscription{
		UserId:      502,
		PlanId:      1,
		Status:      "active",
		StartTime:   now - 7200,
		EndTime:     now - 3600,
		AmountTotal: 1000,
	}).Error)
	require.NoError(t, DB.Create(&UserSubscription{
		UserId:      503,
		PlanId:      1,
		Status:      "cancelled",
		StartTime:   now - 3600,
		EndTime:     now + 3600,
		AmountTotal: 1000,
	}).Error)

	hasActive := true
	users, total, err := SearchUsers("", "", nil, nil, &hasActive, 0, 20)
	require.NoError(t, err)
	assert.Equal(t, int64(1), total)
	assert.Equal(t, []int{501}, collectUserIds(users))

	hasNoActive := false
	users, total, err = SearchUsers("", "", nil, nil, &hasNoActive, 0, 20)
	require.NoError(t, err)
	assert.Equal(t, int64(3), total)
	assert.ElementsMatch(t, []int{502, 503, 504}, collectUserIds(users))
}
