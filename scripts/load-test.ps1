<#
.SYNOPSIS
    Load Testing Script for Content Intelligence Platform (PowerShell)

.DESCRIPTION
    This script runs comprehensive load tests using k6 against the staging
    environment and generates performance reports.

.PARAMETER Scenario
    Test scenario to run: all, upload, generation, ratelimit, stress (default: all)

.PARAMETER Environment
    Target environment: local, staging, production (default: staging)

.PARAMETER BaseUrl
    Custom base URL (overrides environment defaults)

.PARAMETER OutputFormat
    Output format: console, json, html (default: console)

.EXAMPLE
    .\scripts\load-test.ps1
    Run all tests against staging

.EXAMPLE
    .\scripts\load-test.ps1 -Scenario upload -Environment local
    Run upload test against local environment

.EXAMPLE
    .\scripts\load-test.ps1 -Scenario all -Environment staging -OutputFormat json
    Run all tests with JSON output
#>

[CmdletBinding()]
param(
    [Parameter(Position=0)]
    [ValidateSet('all', 'upload', 'generation', 'ratelimit', 'stress')]
    [string]$Scenario = 'all',
    
    [Parameter(Position=1)]
    [ValidateSet('local', 'staging', 'production')]
    [string]$Environment = 'staging',
    
    [Parameter()]
    [string]$BaseUrl = '',
    
    [Parameter()]
    [ValidateSet('console', 'json', 'html')]
    [string]$OutputFormat = 'console'
)

# Configuration
$ErrorActionPreference = 'Stop'
$ResultsDir = 'load-tests\results'
$ReportFile = 'docs\LOAD_TEST_RESULTS.md'
$Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = 'White'
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-ColorOutput "================================================================" -Color Cyan
    Write-ColorOutput "  $Text" -Color Cyan
    Write-ColorOutput "================================================================" -Color Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "[SUCCESS] $Message" -Color Green
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "[ERROR] $Message" -Color Red
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "[WARNING] $Message" -Color Yellow
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "[INFO] $Message" -Color Cyan
}

# Determine base URL
if ($BaseUrl) {
    $TargetUrl = $BaseUrl
} else {
    switch ($Environment) {
        'local' {
            $TargetUrl = 'http://localhost:3000'
        }
        'staging' {
            $TargetUrl = if ($env:STAGING_URL) { $env:STAGING_URL } else { 'https://staging.content-intelligence.example.com' }
        }
        'production' {
            $TargetUrl = if ($env:PRODUCTION_URL) { $env:PRODUCTION_URL } else { 'https://api.content-intelligence.example.com' }
            Write-Host ""
            Write-Warning "Running load tests against PRODUCTION!"
            $confirm = Read-Host "Are you sure? (yes/no)"
            if ($confirm -ne 'yes') {
                Write-Host "Aborted."
                exit 1
            }
        }
    }
}

# Check if k6 is installed
try {
    $k6Version = & k6 version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "k6 not found"
    }
} catch {
    Write-Error "k6 is not installed"
    Write-Host ""
    Write-Host "Install k6: https://k6.io/docs/getting-started/installation/"
    Write-Host ""
    Write-Host "Quick install options:"
    Write-Host "  Windows: choco install k6"
    Write-Host "  Or download from: https://github.com/grafana/k6/releases"
    exit 1
}

# Create results directory
if (-not (Test-Path $ResultsDir)) {
    New-Item -ItemType Directory -Path $ResultsDir -Force | Out-Null
}

# Display configuration
Write-Header "Content Intelligence Platform - Load Testing"
Write-Info "Environment: $Environment"
Write-Info "Base URL:    $TargetUrl"
Write-Info "Scenario:    $Scenario"
Write-Info "Timestamp:   $Timestamp"
Write-Info "k6 Version:  $k6Version"

# Test scenarios
$TestScenarios = @{
    'upload' = @{
        Name = 'File Upload Load Test'
        File = 'load-tests\scenarios\upload-load.js'
    }
    'generation' = @{
        Name = 'Content Generation Load Test'
        File = 'load-tests\scenarios\content-generation-load.js'
    }
    'ratelimit' = @{
        Name = 'Rate Limiting Test'
        File = 'load-tests\scenarios\rate-limit-test.js'
    }
    'stress' = @{
        Name = 'Stress Test'
        File = 'load-tests\scenarios\stress-test.js'
    }
}

# Function to run a test
function Invoke-LoadTest {
    param(
        [string]$TestName,
        [string]$TestFile
    )
    
    Write-Host ""
    Write-ColorOutput "================================================================" -Color Yellow
    Write-ColorOutput "Running: $TestName" -Color Yellow
    Write-ColorOutput "================================================================" -Color Yellow
    Write-Host ""
    
    $startTime = Get-Date
    
    try {
        & k6 run --env BASE_URL="$TargetUrl" $TestFile
        
        if ($LASTEXITCODE -eq 0) {
            $duration = (Get-Date) - $startTime
            Write-Success "$TestName completed successfully (Duration: $($duration.ToString('mm\:ss')))"
            return $true
        } else {
            Write-Error "$TestName failed"
            return $false
        }
    } catch {
        Write-Error "$TestName failed with exception: $_"
        return $false
    }
}

# Run tests
$FailedTests = 0
$PassedTests = 0
$TestResults = @()

if ($Scenario -eq 'all') {
    Write-Info "Running all test scenarios..."
    
    $testOrder = @('upload', 'generation', 'ratelimit', 'stress')
    $testNumber = 1
    
    foreach ($testKey in $testOrder) {
        $test = $TestScenarios[$testKey]
        $testName = "$testNumber. $($test.Name)"
        
        $result = Invoke-LoadTest -TestName $testName -TestFile $test.File
        
        $TestResults += @{
            Name = $test.Name
            Passed = $result
            Scenario = $testKey
        }
        
        if ($result) {
            $PassedTests++
        } else {
            $FailedTests++
        }
        
        # Wait between tests
        if ($testNumber -lt $testOrder.Count) {
            Write-Info "Waiting 5 seconds before next test..."
            Start-Sleep -Seconds 5
        }
        
        $testNumber++
    }
} else {
    $test = $TestScenarios[$Scenario]
    $result = Invoke-LoadTest -TestName $test.Name -TestFile $test.File
    
    $TestResults += @{
        Name = $test.Name
        Passed = $result
        Scenario = $Scenario
    }
    
    if ($result) {
        $PassedTests++
    } else {
        $FailedTests++
    }
}

# Generate report
Write-Host ""
Write-Header "Generating Performance Report"

try {
    & node scripts\generate-load-test-report.js $Environment $Timestamp $Scenario
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Report generated: $ReportFile"
    } else {
        Write-Warning "Report generation completed with warnings"
    }
} catch {
    Write-Error "Failed to generate report: $_"
}

# Display summary
Write-Host ""
Write-Header "Test Summary"

Write-Host ""
Write-Info "Total Tests:  $($PassedTests + $FailedTests)"
Write-ColorOutput "Passed:       $PassedTests" -Color Green
if ($FailedTests -gt 0) {
    Write-ColorOutput "Failed:       $FailedTests" -Color Red
} else {
    Write-ColorOutput "Failed:       $FailedTests" -Color Green
}
Write-Host ""

# Display individual test results
foreach ($result in $TestResults) {
    $status = if ($result.Passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($result.Passed) { "Green" } else { "Red" }
    Write-ColorOutput "  $status $($result.Name)" -Color $color
}

Write-Host ""
Write-Info "Results saved to: $ResultsDir"
Write-Info "Report available at: $ReportFile"
Write-Host ""

# Exit with appropriate code
if ($FailedTests -eq 0) {
    Write-Success "All tests passed successfully!"
    exit 0
} else {
    Write-Error "$FailedTests test(s) failed"
    exit 1
}
