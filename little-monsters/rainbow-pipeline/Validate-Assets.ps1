Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$outputRoot = Join-Path $PSScriptRoot 'output'
$manifest = Get-Content -LiteralPath (Join-Path $outputRoot 'manifest.json') -Raw | ConvertFrom-Json
$errors = @()
$warnings = @($manifest.reviewFlags)
$checked = 0
$actualFrameCount = 0

foreach ($monster in $manifest.monsters) {
    foreach ($property in $monster.sequences.PSObject.Properties) {
        $action = $property.Name
        $sequence = $property.Value
        if ($sequence.count -ne $sequence.frames.Count) { $errors += "$($monster.id)/$action count mismatch" }
        foreach ($frame in $sequence.frames) {
            $actualFrameCount++
            $path = Join-Path $outputRoot $frame.path
            if (-not (Test-Path -LiteralPath $path)) { $errors += "Missing $($frame.path)"; continue }
            $bitmap = [System.Drawing.Bitmap]::FromFile($path)
            try {
                if ($bitmap.Width -ne 128 -or $bitmap.Height -ne 128) { $errors += "Wrong size: $($frame.path)" }
                if ($bitmap.GetPixel(0, 0).A -ne 0 -or $bitmap.GetPixel(127, 127).A -ne 0) {
                    $errors += "Opaque corner: $($frame.path)"
                }
                if (-not $frame.transparentBackground) { $warnings += "No transparent source background: $($frame.path)" }
                $checked++
            } finally { $bitmap.Dispose() }
        }
    }
    $sheetPath = Join-Path $outputRoot $monster.sheet
    if (-not (Test-Path -LiteralPath $sheetPath)) { $errors += "Missing sheet: $($monster.sheet)"; continue }
    $sheet = [System.Drawing.Bitmap]::FromFile($sheetPath)
    try {
        if ($sheet.Width -ne 512 -or $sheet.Height -ne 640) { $errors += "Wrong sheet size: $($monster.sheet)" }
        if ($monster.missingCells -contains 'sleep/03' -and $sheet.GetPixel(511, 639).A -ne 0) {
            $errors += "Missing fourth sleep cell is not transparent: $($monster.sheet)"
        }
    } finally { $sheet.Dispose() }
}

if ($actualFrameCount -ne $manifest.frameCount) { $errors += 'Manifest frameCount mismatch' }
$report = [ordered]@{
    checkedFrames = $checked
    checkedSheets = $manifest.monsters.Count
    expectedFrames = $manifest.frameCount
    structuralErrors = $errors
    reviewWarnings = $warnings
    productionReady = ($errors.Count -eq 0 -and $warnings.Count -eq 0)
}
$reportPath = Join-Path $outputRoot 'validation-report.json'
$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $reportPath -Encoding UTF8
Write-Output ("Checked $checked frames and $($report.checkedSheets) sheets; $($errors.Count) structural errors; $($warnings.Count) review warnings")
if ($errors.Count) { exit 1 }
