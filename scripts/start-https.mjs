import { accessSync, constants, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const certDir = join(projectRoot, '.certs');
const certPemPath = join(certDir, 'localhost.pem');
const keyPemPath = join(certDir, 'localhost-key.pem');
const certDerPath = join(certDir, 'localhost.cer');
const opensslConfigPath = join(certDir, 'localhost-openssl.cnf');
const localhostNames = ['localhost', '127.0.0.1', '::1'];

function commandExists(command) {
  // Windows: 'where', Mac/Linux: 'which'
  const cmdCheck = process.platform === 'win32' ? 'where' : 'which';
  const result = spawnSync(cmdCheck, [command], { stdio: 'ignore', shell: true });
  return result.status === 0;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    ...options,
  });

  if (result.status !== 0) {
    const joinedArgs = args.join(' ');
    throw new Error(`Command failed: ${command} ${joinedArgs}`);
  }
}

function ensureCertDir() {
  mkdirSync(certDir, { recursive: true });
}

function generateWithMkcert() {
  if (!commandExists('mkcert')) {
    return false;
  }

  run('mkcert', ['-install']);
  run('mkcert', [
    '-key-file', keyPemPath,
    '-cert-file', certPemPath,
    ...localhostNames,
  ]);

  return true;
}

function generateWithOpenSSL() {
  if (!commandExists('openssl')) {
    throw new Error('Neither mkcert nor openssl is available. Install mkcert or OpenSSL.');
  }

  const opensslConfig = `
[req]
default_bits = 2048
prompt = no
default_md = sha256
x509_extensions = req_ext
distinguished_name = dn

[dn]
CN = localhost

[req_ext]
subjectAltName = @alt_names
extendedKeyUsage = serverAuth
keyUsage = digitalSignature, keyEncipherment

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
IP.2 = ::1
`;

  writeFileSync(opensslConfigPath, opensslConfig.trim() + '\n', 'utf8');

  run('openssl', [
    'req',
    '-x509',
    '-nodes',
    '-newkey', 'rsa:2048',
    '-days', '3650',
    '-keyout', keyPemPath,
    '-out', certPemPath,
    '-config', opensslConfigPath,
    '-extensions', 'req_ext',
  ]);

  run('openssl', ['x509', '-in', certPemPath, '-outform', 'der', '-out', certDerPath]);

  return true;
}

function trustCertificate() {
  if (process.platform === 'win32') {
    if (!existsSync(certDerPath)) {
      return;
    }

    const result = spawnSync('certutil', ['-user', '-addstore', 'Root', certDerPath], {
      stdio: 'inherit',
      shell: false,
    });

    if (result.status !== 0) {
      throw new Error('Unable to trust the local certificate on Windows.');
    }

    return;
  }

  if (process.platform === 'darwin') {
    const keychain = `${process.env.HOME}/Library/Keychains/login.keychain-db`;
    const result = spawnSync('security', ['add-trusted-cert', '-d', '-r', 'trustRoot', '-k', keychain, certPemPath], {
      stdio: 'inherit',
      shell: false,
    });

    if (result.status !== 0) {
      throw new Error('Unable to trust the local certificate on macOS.');
    }
  }
}

function ensureCertificates() {
  ensureCertDir();

  if (existsSync(certPemPath) && existsSync(keyPemPath)) {
    trustCertificate();
    console.log('Dev certificate already exists.');
    return;
  }

  const usedMkcert = generateWithMkcert();
  if (!usedMkcert) {
    generateWithOpenSSL();
    trustCertificate();
  }

  if (!existsSync(certPemPath) || !existsSync(keyPemPath)) {
    throw new Error('Certificate generation did not produce the expected PEM files.');
  }

  console.log(`Created trusted dev certificate in ${certDir}`);
}

try {
  ensureCertificates();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
