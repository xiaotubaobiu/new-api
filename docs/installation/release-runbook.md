# New API 发布运行手册

本文档记录本仓库从功能开发、合并、镜像构建、服务器发布、验证到回滚的标准流程。它适用于当前 fork 的生产部署模式：

- GitHub 仓库负责代码管理和触发 Docker 镜像构建。
- Docker Hub 镜像仓库使用 `xiaotubao/new-api`。
- 服务器通过 Docker Compose 运行 `new-api`、`postgres`、`redis`。
- 生产服务器只拉取镜像并重建应用容器，不在服务器上长期保存源码。

## 1. 当前生产部署形态

当前线上服务采用 Docker Compose 部署：

```text
部署目录: /home/ec2-user/new-api
应用容器: new-api
应用镜像: xiaotubao/new-api:latest
应用端口: 127.0.0.1:3001 -> container 3000
反向代理: Caddy
数据库: postgres:15 容器
缓存: redis:latest 容器
主要配置: /home/ec2-user/new-api/docker-compose.yml
覆盖配置: /home/ec2-user/new-api/docker-compose.override.yml
```

典型访问链路：

```text
公网域名/HTTPS -> Caddy -> 127.0.0.1:3001 -> new-api:3000
```

线上部署目录只应保存运行配置、数据、日志和备份：

```text
/home/ec2-user/new-api/
  docker-compose.yml
  docker-compose.override.yml
  data/
  logs/
  backups/
```

不要把开发源码、临时构建产物、测试数据库或本地 `.env` 文件长期混放在生产部署目录中。

## 2. 开发前准备

从最新 `main` 创建短生命周期分支：

```powershell
cd D:\code-projects\new-api
git checkout main
git fetch origin
git pull --ff-only origin main
git checkout -b feature/<scope>-<short-desc>
```

分支命名建议：

```text
feature/<scope>-<short-desc>   新功能
fix/<scope>-<short-desc>       缺陷修复
refactor/<scope>-<short-desc>  重构
docs/<scope>-<short-desc>      文档
chore/<scope>-<short-desc>     维护
hotfix/<scope>-<short-desc>    紧急修复
```

开发时遵守项目规范：

- Go 业务代码的 JSON 编解码使用 `common/json.go` 中的包装函数。
- 数据库代码必须同时兼容 SQLite、MySQL、PostgreSQL。
- 前端默认使用 Bun。
- 修改计费表达式系统前先阅读 `pkg/billingexpr/expr.md`。
- 不要修改、删除或替换项目策略保护的名称、品牌、归属和元数据。
- 上游 relay 请求 DTO 中的可选标量字段使用指针类型加 `omitempty`，避免显式 `0`、`false` 被丢弃。

## 3. 本地验证

根据改动范围选择最小但有效的验证。

后端改动：

```powershell
go test ./...
```

或只跑相关包：

```powershell
go test ./controller ./model
```

前端改动：

```powershell
cd web/default
bun run typecheck
bun run build
```

涉及前端展示文案或翻译 key：

```powershell
cd web/default
bun run i18n:sync
```

如果本机缺少 Go、Docker 或 Bun，至少应让 GitHub Actions 完成对应构建验证后再发布。

## 4. 提交和合并

提交前检查工作区：

```powershell
git status --short
git diff
```

提交使用 Conventional Commits：

```powershell
git add <files>
git commit -m "feat: add xxx"
git push -u origin feature/<scope>-<short-desc>
```

推荐通过 Pull Request 合并到 `main`。PR 描述应包含：

- 改了什么。
- 为什么改。
- 如何验证。
- 是否涉及数据库迁移、计费、relay/provider、认证、前端 i18n。
- 是否需要运维发布或配置变更。

合并后确认本地 `main` 与远端一致：

```powershell
git checkout main
git pull --ff-only origin main
git log -1 --oneline
```

记录短提交号，例如：

```text
afe5540c
```

## 5. 构建 Docker 镜像

生产镜像通过 GitHub Actions 构建并推送到 Docker Hub。

进入 GitHub：

```text
Actions
-> Publish Docker image (Multi-arch)
-> Run workflow
```

参数填写：

```text
Branch: main
tag: YYYYMMDD-短commit
ref: main
```

示例：

```text
tag: 20260528-afe5540c
ref: main
```

Actions 会构建并推送：

```text
xiaotubao/new-api:YYYYMMDD-短commit
xiaotubao/new-api:latest
```

同时还会生成架构标签：

```text
xiaotubao/new-api:YYYYMMDD-短commit-amd64
xiaotubao/new-api:YYYYMMDD-短commit-arm64
xiaotubao/new-api:latest-amd64
xiaotubao/new-api:latest-arm64
```

### Docker Hub 凭据

GitHub Actions 依赖以下仓库 secrets：

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

`DOCKERHUB_USERNAME` 是 Docker Hub 用户名，例如 `xiaotubao`。

`DOCKERHUB_TOKEN` 是 Docker Hub Personal Access Token，应具备推送 `xiaotubao/new-api` 的权限。不要使用个人密码。

### 常见构建失败

`Username and password required`：

```text
GitHub Actions 缺少 DOCKERHUB_USERNAME 或 DOCKERHUB_TOKEN，或 token 无 push 权限。
```

`go build ... exit code: 1`：

```text
后端编译失败，查看 build record 或 Actions 日志中的 Go 编译错误。
```

`bun run build` 失败：

```text
前端构建失败，优先本地进入 web/default 复现。
```

镜像推送失败：

```text
确认 Docker Hub 仓库存在，且 token 对该仓库有 Read & Write 权限。
```

## 6. 发布前备份

发布服务器前必须先备份。备份目录统一放在：

```text
/home/ec2-user/new-api/backups/release-YYYYMMDDHHMMSS/
```

SSH 到服务器后执行：

```bash
cd /home/ec2-user/new-api
TS=$(date +%Y%m%d%H%M%S)
BACKUP_DIR="backups/release-$TS"
mkdir -p "$BACKUP_DIR"
echo "BACKUP_DIR=$BACKUP_DIR"

cp docker-compose.yml "$BACKUP_DIR/docker-compose.yml"
[ -f docker-compose.override.yml ] && cp docker-compose.override.yml "$BACKUP_DIR/docker-compose.override.yml" || true

docker image tag xiaotubao/new-api:latest "xiaotubao/new-api:rollback-$TS"

docker exec postgres pg_dump -U root -d new-api > "$BACKUP_DIR/new-api-db.sql"

docker image inspect "xiaotubao/new-api:rollback-$TS" \
  --format '{{.RepoTags}} {{.Id}}' > "$BACKUP_DIR/rollback-image.txt"

ls -lh "$BACKUP_DIR"
docker images 'xiaotubao/new-api' \
  --format 'table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedSince}}\t{{.Size}}' | head -20
```

一份合格的发布前备份至少包含：

```text
docker-compose.yml
docker-compose.override.yml
new-api-db.sql
rollback-image.txt
```

还应能看到旧镜像标签：

```text
xiaotubao/new-api:rollback-YYYYMMDDHHMMSS
```

## 7. 服务器发布

确认 GitHub Actions 成功后，在服务器拉取新镜像并重建应用容器。

将 `<tag>` 替换为本次发布 tag，例如 `20260528-afe5540c`：

```bash
cd /home/ec2-user/new-api

docker pull xiaotubao/new-api:<tag>
docker pull xiaotubao/new-api:latest

docker images 'xiaotubao/new-api' \
  --format 'table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedSince}}\t{{.Size}}' | head -20

docker compose up -d new-api
docker compose ps
```

`docker compose up -d new-api` 可能会显示 postgres、redis 处于 Started 状态，这是 Compose 处理依赖服务时的正常输出。重点确认没有删除 volume、没有重建数据库数据目录。

不要执行以下高风险操作，除非非常明确知道后果：

```bash
docker compose down -v
docker volume rm ...
rm -rf data logs backups
```

## 8. 发布后验证

发布后必须验证健康状态、接口和日志。

```bash
cd /home/ec2-user/new-api

for i in $(seq 1 20); do
  docker compose ps
  status=$(docker inspect new-api --format '{{.State.Health.Status}}' 2>/dev/null || echo unknown)
  echo "new-api health=$status"
  [ "$status" = "healthy" ] && break
  sleep 3
done

curl -fsS http://127.0.0.1:3001/api/status | head -c 500
echo

docker logs --tail=120 new-api
```

发布成功的最低确认标准：

```text
new-api health=healthy
postgres healthy
redis healthy
/api/status 返回 200
日志中出现 New API <tag> started
没有持续 panic、migration error、database error、redis error
实际 relay 请求正常返回 200
```

如果站点有公网域名，还应从外部确认：

```bash
curl -I https://<domain>
```

## 9. 镜像回滚

如果新版本异常，优先回滚应用镜像。镜像回滚不会恢复数据库，只会把应用容器切回旧版本。

先查看可用回滚镜像：

```bash
docker images 'xiaotubao/new-api' \
  --format 'table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedSince}}\t{{.Size}}' | grep -E 'rollback|TAG|latest'
```

执行回滚：

```bash
cd /home/ec2-user/new-api

docker tag xiaotubao/new-api:rollback-<backup-ts> xiaotubao/new-api:latest
docker compose up -d new-api

docker compose ps
curl -fsS http://127.0.0.1:3001/api/status | head -c 500
echo
docker logs --tail=120 new-api
```

示例：

```bash
docker tag xiaotubao/new-api:rollback-20260528032953 xiaotubao/new-api:latest
docker compose up -d new-api
```

回滚后也要按发布后验证流程确认健康状态。

## 10. 数据库恢复

数据库恢复是高风险操作。只有在确认数据库被破坏、迁移造成不可接受的数据问题，且应用镜像回滚无法解决时才考虑恢复数据库。

恢复前必须先再次备份当前数据库：

```bash
cd /home/ec2-user/new-api
TS=$(date +%Y%m%d%H%M%S)
docker exec postgres pg_dump -U root -d new-api > "backups/pre-db-restore-$TS.sql"
```

停止应用容器，避免恢复时继续写入：

```bash
docker compose stop new-api
```

恢复 PostgreSQL dump 的具体命令应根据 dump 格式、数据库大小和当前连接情况确认后执行。不要在未确认影响范围时直接覆盖生产数据库。

恢复完成后启动应用并验证：

```bash
docker compose up -d new-api
docker compose ps
curl -fsS http://127.0.0.1:3001/api/status | head -c 500
docker logs --tail=120 new-api
```

一般发布失败只需要回滚镜像，不需要恢复数据库。

## 11. 备份和旧镜像清理

新版本稳定运行 7 到 14 天后，可以清理旧备份和旧镜像。

查看备份：

```bash
cd /home/ec2-user/new-api
find backups -maxdepth 2 -type f -printf '%TY-%Tm-%Td %TH:%TM %10s %p\n' | sort
```

查看镜像：

```bash
docker images 'xiaotubao/new-api'
```

建议至少保留：

```text
最近一次发布前备份
最近一个 rollback 镜像
最近一个明确版本 tag
```

清理旧 SQL 备份前，确认新版本已经稳定，且不再需要恢复到对应时间点。

## 12. 紧急排查命令

查看容器：

```bash
cd /home/ec2-user/new-api
docker compose ps
docker inspect new-api --format '{{.State.Health.Status}}'
```

查看应用日志：

```bash
docker logs --tail=200 new-api
docker logs -f new-api
```

查看本机接口：

```bash
curl -fsS http://127.0.0.1:3001/api/status | head -c 1000
```

查看 Caddy：

```bash
systemctl status caddy --no-pager
journalctl -u caddy -n 100 --no-pager
```

查看数据库和 Redis：

```bash
docker logs --tail=100 postgres
docker logs --tail=100 redis
docker exec postgres pg_isready -U root -d new-api
docker exec redis redis-cli ping
```

查看磁盘和内存：

```bash
free -h
df -h / /home /var/lib/docker 2>/dev/null || true
docker system df
```

## 13. 发布检查清单

发布前：

- `main` 已包含本次发布代码。
- GitHub Actions `Publish Docker image (Multi-arch)` 构建成功。
- 已记录本次发布 tag，例如 `20260528-afe5540c`。
- 已创建 `backups/release-<ts>/`。
- 已备份 compose 文件。
- 已导出 PostgreSQL 数据库。
- 已创建 rollback 镜像 tag。

发布中：

- 已拉取 `xiaotubao/new-api:<tag>`。
- 已拉取 `xiaotubao/new-api:latest`。
- `latest` 指向本次新镜像。
- 已执行 `docker compose up -d new-api`。

发布后：

- `new-api` 为 `healthy`。
- `postgres` 为 `healthy`。
- `redis` 为 `healthy`。
- `/api/status` 返回 200。
- 日志显示 `New API <tag> started`。
- 没有持续错误日志。
- 至少一次真实业务请求或管理页面访问正常。

回滚准备：

- 知道本次备份目录。
- 知道 rollback 镜像 tag。
- 知道如何恢复旧镜像。
- 数据库备份保留且未删除。

## 14. 本次发布记录示例

一次完整发布记录可以写成：

```text
发布时间: 2026-05-28
发布 tag: 20260528-afe5540c
镜像: xiaotubao/new-api:20260528-afe5540c
latest image id: a5d47d58f902
备份目录: /home/ec2-user/new-api/backups/release-20260528032953/
rollback tag: xiaotubao/new-api:rollback-20260528032953
验证:
  new-api healthy
  postgres healthy
  redis healthy
  /api/status 200
  New API 20260528-afe5540c started
```
