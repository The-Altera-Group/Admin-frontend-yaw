<#
run-docker.ps1
Builds the student-service Docker image, stops/removes any existing container named 'student-service', runs the container on port 8083 and tails logs.
Run in an elevated PowerShell session in Windows where Docker Desktop is installed.
Usage: .\run-docker.ps1
#>
param(
    [string]$ServicePath = "services/school-springboot/student-service",
    [string]$ImageName = "altera/student-service:latest",
    [string]$ContainerName = "student-service",
    [int]$HostPort = 8083,
    [int]$ContainerPort = 8083,
    [int]$MaxWaitSeconds = 120
)

Set-StrictMode -Version Latest

function Fail([string]$msg) {
    Write-Error $msg
    exit 1
}

# Resolve to absolute path relative to repository root (this script is expected to be run from repo root)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# repo root is three levels up from the service script folder (Altera-System)
$repoRoot = Resolve-Path -Path (Join-Path $scriptDir "..\..\..") -ErrorAction SilentlyContinue
if ($repoRoot) {
    $repoRoot = $repoRoot.Path
} else {
    # fallback to current directory
    $repoRoot = (Get-Location).Path
}
$absServicePath = Join-Path $repoRoot $ServicePath
if (-not (Test-Path $absServicePath)) { Fail "Service path '$absServicePath' not found. Run this script from the repository root or set -ServicePath correctly." }

# Ensure Docker CLI is available
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { Fail "Docker CLI not found in PATH. Install Docker Desktop and ensure 'docker' is available in PATH." }

# Try to start Docker Desktop if not running (best-effort) by locating the default install path
function Try-StartDockerDesktop {
    $possible = @(
        "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe",
        "C:\\Program Files (x86)\\Docker\\Docker\\Docker Desktop.exe"
    )
    foreach ($path in $possible) {
        if (Test-Path $path) {
            Write-Host "Found Docker Desktop at $path, starting..."
            Start-Process -FilePath $path -WindowStyle Minimized | Out-Null
            return $true
        }
    }
    return $false
}

function Wait-ForDocker {
    $elapsed = 0
    $sleep = 2
    while ($elapsed -lt $MaxWaitSeconds) {
        try {
            docker version --format '{{.Server.Version}}' | Out-Null
            return $true
        } catch {
            Start-Sleep -Seconds $sleep
            $elapsed += $sleep
        }
    }
    return $false
}

# Ensure Docker daemon is available
# Try a diagnostic `docker version` and capture output so we can provide better troubleshooting guidance.
$dockerVersionOutput = & docker version 2>&1
if ($LASTEXITCODE -eq 0) {
    # All good
} else {
    if ($dockerVersionOutput -match "Docker Desktop is unable to start") {
        Fail "Docker Desktop is unable to start. Open Docker Desktop > Troubleshoot, try 'Restart Docker Desktop' or 'Reset to factory defaults'.\nCommon fixes: ensure WSL2 features are enabled (if using WSL), virtualization is available in BIOS, and sufficient disk space.\nYou can also check logs: `Get-ChildItem -Path \"$env:APPDATA\\Docker\\log\"` and inspect recent files. After resolving, re-run this script."
    }

    Write-Host "Docker daemon not responding. Attempting to start Docker Desktop (if installed)..."
    if (Try-StartDockerDesktop) {
        Write-Host "Waiting for Docker daemon (max $MaxWaitSeconds seconds)..."
        if (-not (Wait-ForDocker)) { Fail "Docker daemon did not become available in time. Start Docker Desktop manually and re-run this script." }
    } else {
        Fail "Docker daemon not responding and Docker Desktop executable not found. Start Docker Desktop and re-run this script."
    }
}

# Build image
Write-Host "Building Docker image $ImageName using repository root as build context so multi-module POM can be resolved..."
$repoRoot = Resolve-Path -Path $repoRoot
Write-Host "Build context: $repoRoot"
$dockerfilePath = Join-Path $absServicePath "Dockerfile"
if (-not (Test-Path $dockerfilePath)) { Fail "Dockerfile not found at $dockerfilePath" }
$buildCmd = "docker build --progress=plain -f `"$dockerfilePath`" -t $ImageName $repoRoot"
Write-Host $buildCmd
$buildProc = Invoke-Expression $buildCmd
$buildExit = $LASTEXITCODE
if ($buildExit -ne 0) { Fail "Docker build failed (exit code $buildExit). Check the Dockerfile and build output above." }

# Remove existing container if present
$existing = docker ps -a --filter "name=^/$ContainerName$" --format '{{.Names}}'
if ($existing -eq $ContainerName) {
    Write-Host "Stopping and removing existing container $ContainerName..."
    docker rm -f $ContainerName | Out-Null
}

# Run the container
Write-Host "Running container $ContainerName (host:$HostPort -> container:$ContainerPort)..."
$run = docker run -d --name $ContainerName --restart unless-stopped -p "$HostPort`:$ContainerPort" $ImageName
if ($LASTEXITCODE -ne 0) { Fail "Failed to start container." }

Write-Host "Container started with id: $run"
Write-Host "Streaming logs (Ctrl+C to stop) - last 200 lines then follow..."
docker logs -f --tail 200 $ContainerName
