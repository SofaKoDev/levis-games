Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = $PSScriptRoot
$layout = Get-Content -LiteralPath (Join-Path $root 'original-layout.json') -Raw | ConvertFrom-Json
$outputDir = Join-Path $root 'output-originals'
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

function Find-Cuts([int[]]$occupancy, [int]$start, [int]$end, [int]$count) {
    $cuts = @($start)
    $warnings = @()
    $span = $end - $start
    for ($index = 1; $index -lt $count; $index++) {
        $expected = $start + $index * $span / $count
        $radius = [int][Math]::Floor($span / $count * 0.3)
        $searchStart = [int][Math]::Max($cuts[-1] + 2, [Math]::Floor($expected - $radius))
        $searchEnd = [int][Math]::Min($end - 2, [Math]::Ceiling($expected + $radius))
        $best = $searchStart
        $bestScore = [double]::PositiveInfinity
        for ($candidate = $searchStart; $candidate -le $searchEnd; $candidate++) {
            $score = $occupancy[$candidate] + [Math]::Abs($candidate - $expected) * 0.05
            if ($score -lt $bestScore) { $bestScore = $score; $best = $candidate }
        }
        $cuts += $best
        if ($occupancy[$best] -gt 4) { $warnings += "boundary $index touches $($occupancy[$best]) sampled foreground pixels" }
    }
    $cuts += $end
    return [ordered]@{ cuts = $cuts; warnings = $warnings }
}

$results = @()
foreach ($monster in $layout.monsters) {
    $sourcePath = Join-Path $root $monster.source
    $bitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)
    try {
        $left = [int]$monster.panel[0]; $top = [int]$monster.panel[1]
        $right = [int]$monster.panel[2]; $bottom = [int]$monster.panel[3]
        if ($right -gt $bitmap.Width -or $bottom -gt $bitmap.Height) { throw "Panel out of bounds for $($monster.id)" }
        $xOccupancy = [int[]]::new($bitmap.Width)
        $yOccupancy = [int[]]::new($bitmap.Height)
        for ($y = $top; $y -lt $bottom; $y += 2) {
            for ($x = $left; $x -lt $right; $x += 2) {
                if ($bitmap.GetPixel($x, $y).A -gt 32) {
                    $xOccupancy[$x]++
                    if ($x + 1 -lt $right) { $xOccupancy[$x + 1]++ }
                    $yOccupancy[$y]++
                    if ($y + 1 -lt $bottom) { $yOccupancy[$y + 1]++ }
                }
            }
        }
        $xCuts = Find-Cuts $xOccupancy $left $right ([int]$monster.columns)
        $yCuts = Find-Cuts $yOccupancy $top $bottom ([int]$monster.rows)
        $emptyCells = @()
        for ($row = 0; $row -lt $monster.rows; $row++) {
            for ($column = 0; $column -lt $monster.columns; $column++) {
                $hit = 0
                for ($y = $yCuts.cuts[$row] + 2; $y -lt $yCuts.cuts[$row + 1] - 2; $y += 4) {
                    for ($x = $xCuts.cuts[$column] + 2; $x -lt $xCuts.cuts[$column + 1] - 2; $x += 4) {
                        if ($bitmap.GetPixel($x, $y).A -gt 32) { $hit++ }
                    }
                }
                if ($hit -lt 30) { $emptyCells += "${row}/${column}" }
            }
        }
        $results += [ordered]@{
            id = $monster.id
            source = $monster.source
            sha256 = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash.ToLowerInvariant()
            sourceSize = @($bitmap.Width, $bitmap.Height)
            panel = $monster.panel
            cornerAlpha = @($bitmap.GetPixel($left, $top).A, $bitmap.GetPixel($right - 1, $bottom - 1).A)
            columnCuts = $xCuts.cuts
            rowCuts = $yCuts.cuts
            frameCount = $monster.columns * $monster.rows
            emptyCells = $emptyCells
            cutWarnings = @($xCuts.warnings | ForEach-Object { "vertical $_" }) + @($yCuts.warnings | ForEach-Object { "horizontal $_" })
        }
        Write-Output ("$($monster.id): $($monster.columns)x$($monster.rows), empty=$($emptyCells.Count), boundary warnings=$($xCuts.warnings.Count + $yCuts.warnings.Count)")
    } finally { $bitmap.Dispose() }
}

[ordered]@{
    sourceSet = 'six transparent PNG files containing seven monster designs'
    actions = $layout.actions
    monsters = $results
    notes = @(
        'Cut points are chosen from alpha gaps near expected grid divisions; they are not assumed equal.',
        'Colored edge fringes visible in source art remain and require manual review.',
        'Nighthawk is an owl and must not be silently substituted for the earlier Nightwhisk cat.'
    )
} | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $outputDir 'source-audit.json') -Encoding UTF8
