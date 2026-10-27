import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { lstat, readFile, writeFile, rename, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { Writable } from "node:stream";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const path = resolve(root, ".env.local");

async function main() {
  execFileSync("git", ["check-ignore", "--quiet", "--", ".env.local"], { cwd: root, stdio: "ignore" });
  if (!(await lstat(path)).isFile()) throw new Error("일반 .env.local 파일이 필요합니다.");
  const source = await readFile(path, "utf8");
  const entries = ["DATABASE_URL", "MIGRATION_DATABASE_URL"].map((name) => {
    const match = source.match(new RegExp(`^${name}=(.+)$`, "m"));
    if (!match) throw new Error("먼저 Connect의 두 연결 주소를 준비하세요.");
    const url = new URL(match[1]);
    if (!["postgres:", "postgresql:"].includes(url.protocol)) {
      throw new Error("비밀번호 자리표시자가 있는 주소만 입력할 수 있습니다. 기존 비밀번호는 덮어쓰지 않습니다.");
    }
    return { name, url };
  });
  const passwords = entries.map(({ url }) => decodeURIComponent(url.password));
  const configured = passwords.map((password) => !!password && password !== "[YOUR-PASSWORD]");
  if (configured.every(Boolean)) {
    if (passwords[0] !== passwords[1]) {
      throw new Error("두 DB 주소의 비밀번호 값이 다릅니다. 기존 파일을 유지했습니다. 로컬 설정을 확인하세요.");
    }
    console.log("두 DB 주소에 비밀번호 값이 이미 있습니다. 기존 .env.local을 유지했습니다.");
    console.log("다시 입력할 필요가 없습니다. pnpm env:check와 pnpm db:check로 실제 연결을 확인하세요.");
    return;
  }
  if (passwords.some((password) => password !== "[YOUR-PASSWORD]")) {
    throw new Error("일부 DB 주소만 입력되어 있습니다. 기존 파일을 유지했습니다. 두 주소의 로컬 설정을 확인하세요.");
  }
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("직접 연 터미널에서 실행하세요. 비밀번호를 명령 인자로 전달하지 마세요.");
  }

  // readline이 키 입력을 되비추는 출력만 버려 비밀번호가 터미널에 남지 않게 한다.
  const silentOutput = new Writable({ write(_chunk, _encoding, done) { done(); } });
  const input = createInterface({ input: process.stdin, output: silentOutput, terminal: true });
  let password;
  try {
    process.stdout.write("Supabase에서 생성한 DB 비밀번호 (입력 내용은 표시되지 않음): ");
    password = await input.question("");
    process.stdout.write("\n같은 비밀번호를 한 번 더 입력하세요: ");
    const confirmation = await input.question("");
    process.stdout.write("\n");
    if (!password || password !== confirmation) throw new Error("입력이 비었거나 두 값이 다릅니다. 파일은 변경하지 않았습니다.");
  } finally {
    input.close();
  }

  let updated = source;
  for (const { name, url } of entries) {
    url.password = encodeURIComponent(password);
    updated = updated.replace(new RegExp(`^${name}=.*$`, "m"), () => `${name}=${url.toString()}`);
  }
  if (await readFile(path, "utf8") !== source) {
    throw new Error("입력 중 환경 파일이 바뀌었습니다. 기존 변경을 보존하고 중단했습니다.");
  }
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, updated, { flag: "wx", mode: 0o600 });
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
  console.log("두 DB 주소를 로컬 .env.local에 저장했습니다. 비밀번호·주소는 출력하지 않았습니다.");
  console.log("입력 완료를 알려 주시면 실제 DB·Next.js 연결을 검증합니다.");
}

main().catch((error) => {
  // 위의 자체 안내 문구 이외에는 파일 내용·URL을 포함할 수 있는 원본 오류를 출력하지 않는다.
  const known = [
    "직접 연 터미널에서 실행하세요. 비밀번호를 명령 인자로 전달하지 마세요.",
    "일반 .env.local 파일이 필요합니다.",
    "먼저 Connect의 두 연결 주소를 준비하세요.",
    "비밀번호 자리표시자가 있는 주소만 입력할 수 있습니다. 기존 비밀번호는 덮어쓰지 않습니다.",
    "두 DB 주소의 비밀번호 값이 다릅니다. 기존 파일을 유지했습니다. 로컬 설정을 확인하세요.",
    "일부 DB 주소만 입력되어 있습니다. 기존 파일을 유지했습니다. 두 주소의 로컬 설정을 확인하세요.",
    "입력이 비었거나 두 값이 다릅니다. 파일은 변경하지 않았습니다.",
    "입력 중 환경 파일이 바뀌었습니다. 기존 변경을 보존하고 중단했습니다.",
  ];
  console.error(known.includes(error?.message) ? error.message : "로컬 설정을 저장하지 못했습니다. 파일·Git 제외·입력을 확인하세요.");
  process.exitCode = 1;
});
