<#
.SYNOPSIS
  Roda o sa-admin (Vue 3 + Quasar).

.EXAMPLE
  .\run.ps1                         # dev em http://localhost:9000 usando o backend real
  .\run.ps1 -Mocks                  # dev com os dados de exemplo (sem backend)
  .\run.ps1 -Backend https://outro-ambiente.com.br
  .\run.ps1 -Mode build             # gera dist/spa
  .\run.ps1 -Mode typecheck         # vue-tsc
  .\run.ps1 -Install                # força npm install antes de rodar
#>
[CmdletBinding()]
param(
    [ValidateSet('dev', 'build', 'typecheck')]
    [string]$Mode = 'dev',

    # Backend para onde o dev server repassa /api
    [string]$Backend,

    # Usa os dados de exemplo em vez do backend
    [switch]$Mocks,

    [string]$GaMeasurementId,

    [switch]$Install
)

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

# Node 20/22/24 (engines do package.json)
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'Node.js nao encontrado. Instale o Node 20, 22 ou 24: https://nodejs.org'
}
$nodeMajor = [int]((node --version).TrimStart('v').Split('.')[0])
if ($nodeMajor -notin 20, 22, 24) {
    Write-Warning "Node v$nodeMajor detectado; o projeto suporta 20, 22 ou 24."
}

# Carrega .env (ou .env.example como padrao) sem sobrescrever variaveis ja definidas
$envFile = if (Test-Path '.env') { '.env' } elseif (Test-Path '.env.example') { '.env.example' } else { $null }
if ($envFile) {
    foreach ($line in Get-Content $envFile) {
        if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$') {
            $name = $Matches[1]
            $value = $Matches[2].Trim('"', "'")
            if (-not [Environment]::GetEnvironmentVariable($name, 'Process')) {
                [Environment]::SetEnvironmentVariable($name, $value, 'Process')
            }
        }
    }
    Write-Host "Variaveis carregadas de $envFile" -ForegroundColor DarkGray
}

# Parametros da linha de comando tem prioridade
if ($Backend) {
    $env:API_PROXY_TARGET = $Backend.TrimEnd('/')
    $env:USE_MOCKS = 'false'
}
if ($Mocks) { $env:USE_MOCKS = 'true' }
if ($PSBoundParameters.ContainsKey('GaMeasurementId')) { $env:GA_MEASUREMENT_ID = $GaMeasurementId }
if (-not $env:API_BASE_URL) { $env:API_BASE_URL = '/api/v1' }
if (-not $env:API_PROXY_TARGET) { $env:API_PROXY_TARGET = 'https://strategyanalytics.codebiz.com.br' }
if (-not $env:USE_MOCKS) { $env:USE_MOCKS = 'false' }

if ($env:USE_MOCKS -eq 'true') {
    Write-Host 'Backend: dados de exemplo (USE_MOCKS=true)' -ForegroundColor DarkGray
} else {
    Write-Host "Backend: $env:API_PROXY_TARGET  (via proxy em $env:API_BASE_URL)" -ForegroundColor DarkGray
    if ($Mode -eq 'build' -and $env:API_BASE_URL.StartsWith('/')) {
        Write-Warning 'O build usa API_BASE_URL relativo: o servidor que hospedar dist/spa precisa repassar /api para o backend.'
    }
}

if ($Install -or -not (Test-Path 'node_modules')) {
    Write-Host 'Instalando dependencias...' -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install falhou (codigo $LASTEXITCODE)" }
}

switch ($Mode) {
    'dev' { Write-Host 'Iniciando em http://localhost:9000 ...' -ForegroundColor Green }
    'build' { Write-Host 'Gerando build em dist/spa ...' -ForegroundColor Green }
    'typecheck' { Write-Host 'Rodando vue-tsc ...' -ForegroundColor Green }
}

npm run $Mode
exit $LASTEXITCODE
