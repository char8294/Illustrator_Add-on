$ErrorActionPreference = "Stop"

$extensionId = "com.local.tripleformatexporter"
$source = Join-Path $PSScriptRoot "cep-panel"
$targetRoot = Join-Path $env:APPDATA "Adobe\CEP\extensions"
$target = Join-Path $targetRoot $extensionId

if (-not (Test-Path -LiteralPath $source)) {
    throw "CEP panel source folder was not found: $source"
}

New-Item -ItemType Directory -Force -Path $targetRoot | Out-Null

if (Test-Path -LiteralPath $target) {
    Remove-Item -LiteralPath $target -Recurse -Force
}

Copy-Item -LiteralPath $source -Destination $target -Recurse -Force

foreach ($version in 8..13) {
    $key = "HKCU:\Software\Adobe\CSXS.$version"
    New-Item -Path $key -Force | Out-Null
    New-ItemProperty -Path $key -Name "PlayerDebugMode" -Value "1" -PropertyType String -Force | Out-Null
}

Write-Host "Installed Triple Format Exporter CEP panel to:"
Write-Host $target
Write-Host ""
Write-Host "Restart Adobe Illustrator, then open Window > Extensions > Triple Export."
