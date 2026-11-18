Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$pipelineRoot = $PSScriptRoot
$layout = Get-Content -LiteralPath (Join-Path $pipelineRoot 'layout.json') -Raw | ConvertFrom-Json
$sourcePath = Join-Path $pipelineRoot $layout.source
$outputRoot = Join-Path $pipelineRoot 'output'
$frameRoot = Join-Path $outputRoot 'frames'
$frameSize = [int]$layout.frameSize
$actions = @($layout.actions)
New-Item -ItemType Directory -Path $frameRoot -Force | Out-Null

function New-TransparentBitmap([int]$width, [int]$height) {
    return [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
}

function Export-Frame($source, [int]$left, [int]$top, [int]$width, [int]$height, [string]$destination, [int]$size, [string]$maskMode, [int]$alphaThreshold) {
    $pixelCount = $width * $height
    $seed = [bool[]]::new($pixelCount)
    $colors = [System.Drawing.Color[]]::new($pixelCount)
    $seedCount = 0
    $edgeCount = 0

    for ($y = 0; $y -lt $height; $y++) {
        for ($x = 0; $x -lt $width; $x++) {
            $index = $y * $width + $x
            $color = $source.GetPixel($left + $x, $top + $y)
            $colors[$index] = $color
            $maxChannel = [Math]::Max($color.R, [Math]::Max($color.G, $color.B))
            if ($maskMode -eq 'alpha-threshold') {
                $isForeground = $color.A -ge $alphaThreshold
            } else {
                $isForeground = $maxChannel -ge 64 -or
                    ($color.G -ge 45 -and $color.G -gt $color.R * 1.15 -and $color.G -gt $color.B * 0.7) -or
                    ($color.R -ge 48 -and $color.R -gt $color.G * 1.35 -and $color.R -gt $color.B * 0.8)
            }
            if ($isForeground) {
                $seed[$index] = $true
                $seedCount++
                if ($x -le 1 -or $x -ge $width - 2 -or $y -le 1 -or $y -ge $height - 2) { $edgeCount++ }
            }
        }
    }

    $cut = New-TransparentBitmap $width $height
    $keptCount = 0
    for ($y = 0; $y -lt $height; $y++) {
        for ($x = 0; $x -lt $width; $x++) {
            $index = $y * $width + $x
            $keep = $seed[$index]
            if (-not $keep) {
                for ($dy = -1; $dy -le 1 -and -not $keep; $dy++) {
                    for ($dx = -1; $dx -le 1 -and -not $keep; $dx++) {
                        $nx = $x + $dx; $ny = $y + $dy
                        if ($nx -ge 0 -and $nx -lt $width -and $ny -ge 0 -and $ny -lt $height) {
                            $keep = $seed[$ny * $width + $nx]
                        }
                    }
                }
            }
            if ($keep) {
                $color = $colors[$index]
                $alpha = if ($maskMode -eq 'alpha-threshold') { [Math]::Max($color.A, 70) } else { 255 }
                $cut.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B))
                $keptCount++
            }
        }
    }

    $frame = New-TransparentBitmap $size $size
    $graphics = [System.Drawing.Graphics]::FromImage($frame)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $scale = [Math]::Min(($size - 8) / $width, ($size - 8) / $height)
    $drawWidth = [int][Math]::Floor($width * $scale)
    $drawHeight = [int][Math]::Floor($height * $scale)
    $drawLeft = [int][Math]::Floor(($size - $drawWidth) / 2)
    $drawTop = [int][Math]::Floor(($size - $drawHeight) / 2)
    $graphics.DrawImage($cut, [System.Drawing.Rectangle]::new($drawLeft, $drawTop, $drawWidth, $drawHeight))
    $graphics.Dispose()
    $cut.Dispose()
    $frame.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
    $frame.Dispose()
    return [ordered]@{
        path = $destination.Substring($outputRoot.Length + 1).Replace('\', '/')
        sourceRect = @($left, $top, $width, $height)
        sourceForegroundPixels = $seedCount
        sourceEdgePixels = $edgeCount
        transparentBackground = ($keptCount -lt $pixelCount)
        flags = @(
            if ($edgeCount -gt 6) { 'possible_crop_clipping' }
            if ($seedCount -lt 90) { 'very_small_pose' }
        )
    }
}

$source = [System.Drawing.Bitmap]::FromFile($sourcePath)
try {
    foreach ($monster in $layout.monsters) {
        if ($source.Width -lt $monster.panel[2] -or $source.Height -lt $monster.panel[3]) {
            throw "Source is smaller than the panel for $($monster.id)."
        }
    }
    $monsterResults = @()
    $reviewFlags = @()
    foreach ($monster in $layout.monsters) {
        $sequences = [ordered]@{}
        for ($actionIndex = 0; $actionIndex -lt $actions.Count; $actionIndex++) {
            $action = $actions[$actionIndex]
            $count = [int]$monster.frames.$action
            $panelLeft = [int]$monster.panel[0]
            $panelTop = [int]$monster.panel[1]
            $panelWidth = [int]$monster.panel[2] - $panelLeft
            $panelHeight = [int]$monster.panel[3] - $panelTop
            $rowTop = $panelTop + [int][Math]::Floor($actionIndex * $panelHeight / $actions.Count)
            $rowBottom = $panelTop + [int][Math]::Floor(($actionIndex + 1) * $panelHeight / $actions.Count)
            $actionDir = Join-Path (Join-Path $frameRoot $monster.id) $action
            New-Item -ItemType Directory -Path $actionDir -Force | Out-Null
            $frames = @()
            for ($i = 0; $i -lt $count; $i++) {
                $cellLeft = $panelLeft + [int][Math]::Floor($i * $panelWidth / $count)
                $cellRight = $panelLeft + [int][Math]::Floor(($i + 1) * $panelWidth / $count)
                $left = $cellLeft + 2
                $top = $rowTop + 2
                $width = $cellRight - $cellLeft - 4
                $height = $rowBottom - $rowTop - 4
                $destination = Join-Path $actionDir ('{0:D2}.png' -f $i)
                $frame = Export-Frame $source $left $top $width $height $destination $frameSize $layout.maskMode $layout.alphaThreshold
                $frames += $frame
                foreach ($flag in $frame.flags) { $reviewFlags += "$($monster.id)/$action/$i`: $flag" }
            }
            $sequences[$action] = [ordered]@{ count = $count; frames = $frames }
        }
        $sheetDir = Join-Path $outputRoot 'sheets'
        New-Item -ItemType Directory -Path $sheetDir -Force | Out-Null
        $sheetPath = Join-Path $sheetDir ($monster.id + '-animation-sheet.png')
        $sheet = New-TransparentBitmap ($frameSize * 4) ($frameSize * $actions.Count)
        $sheetGraphics = [System.Drawing.Graphics]::FromImage($sheet)
        $sheetGraphics.Clear([System.Drawing.Color]::Transparent)
        for ($actionIndex = 0; $actionIndex -lt $actions.Count; $actionIndex++) {
            $action = $actions[$actionIndex]
            for ($frameIndex = 0; $frameIndex -lt $sequences[$action].count; $frameIndex++) {
                $framePath = Join-Path (Join-Path $frameRoot $monster.id) (Join-Path $action ('{0:D2}.png' -f $frameIndex))
                $frameBitmap = [System.Drawing.Bitmap]::FromFile($framePath)
                try { $sheetGraphics.DrawImageUnscaled($frameBitmap, $frameIndex * $frameSize, $actionIndex * $frameSize) }
                finally { $frameBitmap.Dispose() }
            }
        }
        $sheetGraphics.Dispose()
        $sheet.Save($sheetPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $sheet.Dispose()
        if ([int]$monster.frames.sleep -ne 4) { $reviewFlags += "$($monster.id): sleep has $($monster.frames.sleep) visible poses; board label says 4" }
        $monsterResults += [ordered]@{
            id = $monster.id
            name = $monster.name
            sourcePanel = $monster.panel
            sheet = ('sheets/' + $monster.id + '-animation-sheet.png')
            sheetGrid = @(4, 5)
            sheetRows = $actions
            missingCells = @(if ([int]$monster.frames.sleep -lt 4) { 'sleep/03' })
            sequences = $sequences
        }
    }
    $manifest = [ordered]@{
        formatVersion = 1
        source = [ordered]@{
            file = $layout.source
            sha256 = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash.ToLowerInvariant()
            width = $source.Width
            height = $source.Height
            opaqueComposite = $false
            backgroundArtifacts = $true
        }
        frameSize = @($frameSize, $frameSize)
        frameCount = ($monsterResults | ForEach-Object { $_.sequences.Values | ForEach-Object { $_.count } } | Measure-Object -Sum).Sum
        monsters = $monsterResults
        reviewRequired = $true
        reviewFlags = $reviewFlags
        notes = @(
            'Both supplied composite images are preserved unchanged in source/.',
            'Frames are deterministic crops with an alpha threshold, not redrawn artwork.',
            'This source shows four visible frames for all five actions, including Moonmoth sleep.',
            'Verify every cutout by eye before replacing in-game art; glow and panel artifacts may remain.'
        )
    }
    $manifestPath = Join-Path $outputRoot 'manifest.json'
    $manifest | ConvertTo-Json -Depth 16 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
    $previewMonsters = @(
        foreach ($monster in $monsterResults) {
            $previewSequences = [ordered]@{}
            foreach ($action in $actions) {
                $previewSequences[$action] = [ordered]@{
                    count = $monster.sequences[$action].count
                    frames = @($monster.sequences[$action].frames | ForEach-Object { [ordered]@{ path = $_.path } })
                }
            }
            [ordered]@{ id = $monster.id; name = $monster.name; sequences = $previewSequences }
        }
    )
    $previewData = [ordered]@{ monsters = $previewMonsters } | ConvertTo-Json -Depth 12 -Compress
    ('window.RAINBOW_ASSETS = ' + $previewData + ';') | Set-Content -LiteralPath (Join-Path $outputRoot 'preview-data.js') -Encoding UTF8
    Write-Output ("Built $($manifest.frameCount) frames for $($monsterResults.Count) monsters: $manifestPath")
} finally {
    $source.Dispose()
}
