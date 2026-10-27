import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, renameSync, rmSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { readLocalTestSettings } from "../src/lib/database/test-config";
import { safeFailure, SetupError } from "../src/lib/database/config";

const root = resolve(__dirname, "..");
const project = "community-lab-test";
const workdir = "test-infra";
const binary = existsSync(resolve(root, ".tools/bin/supabase")) ? resolve(root, ".tools/bin/supabase") : "supabase";

function run(command: string, args: string[], message: string) {
  // CLI의 기본 상태 출력에는 서버 키가 포함되므로 원본을 터미널로 전달하지 않는다.
  const result = spawnSync(command, args, {
    cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024, timeout: 20 * 60_000,
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error || result.status !== 0) throw new SetupError("TEST_ENV_COMMAND", message);
  return result.stdout;
}

function ensureNetwork() {
  const found = spawnSync("docker", ["network", "inspect", project], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (found.status === 0) {
    const network = JSON.parse(found.stdout)[0];
    if (network.Labels?.["community-lab.environment"] !== "test" ||
        network.Options?.["com.docker.network.bridge.host_binding_ipv4"] !== "127.0.0.1") {
      throw new SetupError("TEST_NETWORK", "기존 네트워크의 소유 표시·로컬 바인딩이 다릅니다. 변경하지 않았습니다.");
    }
  } else {
    run("docker", ["network", "create", "--driver", "bridge", "--label", "community-lab.environment=test",
      "--opt", "com.docker.network.bridge.host_binding_ipv4=127.0.0.1", project], "Docker 엔진과 테스트 네트워크를 확인하세요.");
  }
}

function syncEnvironment() {
  const info = JSON.parse(run(binary, ["status", "--workdir", workdir, "--output", "json", "--agent", "no"], "로컬 Supabase 상태를 읽지 못했습니다."));
  const values: Record<string, string> = {
    LOCAL_SUPABASE_PROJECT_ID: project,
    NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3003",
    NEXT_PUBLIC_SUPABASE_URL: info.API_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: info.PUBLISHABLE_KEY,
    DATABASE_URL: info.DB_URL,
    MIGRATION_DATABASE_URL: info.DB_URL,
  };
  readLocalTestSettings(values);
  for (const name of [`supabase_db_${project}`, `supabase_kong_${project}`]) {
    const container = JSON.parse(run("docker", ["inspect", name], "테스트 컨테이너를 확인할 수 없습니다."))[0];
    const ports = container.NetworkSettings.Ports as Record<string, { HostIp: string }[] | null>;
    if (!container.State.Running || Object.values(ports).some((bindings) => bindings?.some((port) => port.HostIp !== "127.0.0.1"))) {
      throw new SetupError("TEST_NETWORK", "테스트 컨테이너의 실행·로컬 바인딩을 확인하세요.");
    }
  }
  const path = resolve(root, ".env.test.local");
  const before = existsSync(path) ? readFileSync(path, "utf8") : "";
  if (before && !/^LOCAL_SUPABASE_PROJECT_ID=community-lab-test$/m.test(before)) {
    throw new SetupError("TEST_ENV_EXISTS", "다른 테스트 환경 파일이 있습니다. 보존하고 중단했습니다.");
  }
  let after = before;
  for (const [key, value] of Object.entries(values)) {
    const pattern = new RegExp(`^${key}=.*$`, "m");
    after = pattern.test(after) ? after.replace(pattern, () => `${key}=${value}`) : `${after.trimEnd()}\n${key}=${value}\n`;
  }
  if (existsSync(path) && readFileSync(path, "utf8") !== before) throw new SetupError("TEST_ENV_CHANGED", "환경 파일 변경을 감지해 중단했습니다.");
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, after.trimStart(), { mode: 0o600, flag: "wx" });
    renameSync(temporary, path);
  } finally {
    rmSync(temporary, { force: true });
  }
}

try {
  const action = process.argv[2];
  if (!["start", "stop", "sync"].includes(action)) throw new SetupError("TEST_ARGUMENT", "start·stop·sync 중 하나가 필요합니다.");
  const config = readFileSync(resolve(root, workdir, "supabase/config.toml"), "utf8");
  if (!/^project_id = "community-lab-test"$/m.test(config)) throw new SetupError("TEST_PROJECT", "전용 테스트 프로젝트 설정이 필요합니다.");
  if (run(binary, ["--version"], "Supabase CLI 2.122.0을 준비하세요. test-infra/README.md를 참고하세요.").trim() !== "2.122.0") {
    throw new SetupError("TEST_CLI_VERSION", "확인된 CLI 2.122.0을 사용하세요.");
  }
  if (action === "stop") {
    run(binary, ["stop", "--workdir", workdir, "--agent", "no"], "로컬 테스트 환경을 중지하지 못했습니다.");
    console.log("로컬 테스트 서비스를 중지했습니다.");
  } else {
    ensureNetwork();
    if (action === "start") {
      console.log("분리 테스트 DB·Auth를 준비합니다. 최초 실행은 컨테이너 이미지 다운로드가 필요합니다.");
      run(binary, ["start", "--workdir", workdir, "--network-id", project, "--exclude",
        "realtime,storage-api,imgproxy,postgres-meta,studio,edge-runtime,logflare,vector,supavisor", "--agent", "no", "--log-level", "warn"],
        "로컬 테스트 기동에 실패했습니다. Docker 실행·네트워크·포트를 확인하세요.");
    }
    syncEnvironment();
    console.log("전용 로컬 환경값을 .env.test.local에 저장했습니다. 키·비밀번호는 출력하지 않았습니다.");
    console.log("pnpm test:env:check로 DB·Auth의 실제 읽기를 확인하세요.");
  }
} catch (error) {
  console.error(JSON.stringify({ status: "error", environment: "local-test", ...safeFailure(error) }));
  process.exitCode = 1;
}
