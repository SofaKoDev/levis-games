Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = $PSScriptRoot
$audit = Get-Content -LiteralPath (Join-Path $root 'output-originals/source-audit.json') -Raw | ConvertFrom-Json
$out = Join-Path $root 'output-originals'
$size = 256
$results = @()
$flags = @()

foreach ($monster in $audit.monsters) {
    $source = [System.Drawing.Bitmap]::FromFile((Join-Path $root $monster.source))
    try {
        $bounds = @()
        for ($row = 0; $row -lt 5; $row++) {
            for ($col = 0; $col -lt 4; $col++) {
                $x0 = [int]$monster.columnCuts[$col]; $x1 = [int]$monster.columnCuts[$col + 1]
                $y0 = [int]$monster.rowCuts[$row]; $y1 = [int]$monster.rowCuts[$row + 1]
                $minX = $x1; $minY = $y1; $maxX = $x0 - 1; $maxY = $y0 - 1
                for ($y = $y0; $y -lt $y1; $y++) {
                    for ($x = $x0; $x -lt $x1; $x++) {
                        if ($source.GetPixel($x, $y).A -gt 8) {
                            $minX = [Math]::Min($minX, $x); $maxX = [Math]::Max($maxX, $x)
                            $minY = [Math]::Min($minY, $y); $maxY = [Math]::Max($maxY, $y)
                        }
                    }
                }
                if ($maxX -lt $minX) { throw "Empty frame $($monster.id)/$row/$col" }
                $bounds += ,@($minX,$minY,($maxX + 1),($maxY + 1))
            }
        }
        $maxWidth = ($bounds | ForEach-Object { $_[2] - $_[0] } | Measure-Object -Maximum).Maximum
        $maxHeight = ($bounds | ForEach-Object { $_[3] - $_[1] } | Measure-Object -Maximum).Maximum
        $scale = [Math]::Min(($size - 20) / $maxWidth, ($size - 20) / $maxHeight)
        $sequences = [ordered]@{}
        $sheet = [System.Drawing.Bitmap]::new($size * 4, $size * 5, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $sheetGraphics = [System.Drawing.Graphics]::FromImage($sheet)
        $sheetGraphics.Clear([System.Drawing.Color]::Transparent)
        $sheetGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
        try {
            for ($row = 0; $row -lt 5; $row++) {
                $action = [string]$audit.actions[$row]
                $frames = @()
                $frameDir = Join-Path $out "frames/$($monster.id)/$action"
                New-Item -ItemType Directory -Path $frameDir -Force | Out-Null
                for ($col = 0; $col -lt 4; $col++) {
                    $box = $bounds[$row * 4 + $col]
                    $w = [int]($box[2] - $box[0]); $h = [int]($box[3] - $box[1])
                    $dw = [int][Math]::Round($w * $scale); $dh = [int][Math]::Round($h * $scale)
                    $dx = [int][Math]::Floor(($size - $dw) / 2); $dy = $size - 10 - $dh
                    $frame = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
                    $graphics = [System.Drawing.Graphics]::FromImage($frame)
                    $graphics.Clear([System.Drawing.Color]::Transparent)
                    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
                    $graphics.DrawImage($source, [System.Drawing.Rectangle]::new($dx,$dy,$dw,$dh), [System.Drawing.Rectangle]::new($box[0],$box[1],$w,$h), [System.Drawing.GraphicsUnit]::Pixel)
                    $graphics.Dispose()
                    $path = "frames/$($monster.id)/$action/$(('{0:D2}' -f $col)).png"
                    $frame.Save((Join-Path $out $path), [System.Drawing.Imaging.ImageFormat]::Png)
                    $sheetGraphics.DrawImageUnscaled($frame, $col * $size, $row * $size)
                    $frame.Dispose()
                    $frames += [ordered]@{ path=$path; sourceRect=@($box); sourceCell=@($monster.columnCuts[$col],$monster.rowCuts[$row],$monster.columnCuts[$col + 1],$monster.rowCuts[$row + 1]) }
                }
                $sequences[$action] = [ordered]@{ count=4; frames=$frames }
            }
        } finally { $sheetGraphics.Dispose() }
        $sheetDir = Join-Path $out 'sheets'
        New-Item -ItemType Directory -Path $sheetDir -Force | Out-Null
        $sheetPath = "sheets/$($monster.id)-animation-sheet.png"
        $sheet.Save((Join-Path $out $sheetPath), [System.Drawing.Imaging.ImageFormat]::Png)
        $sheet.Dispose()
        foreach ($warning in $monster.cutWarnings) { $flags += "$($monster.id): $warning" }
        $results += [ordered]@{ id=$monster.id; name=([char]::ToUpperInvariant($monster.id[0]) + $monster.id.Substring(1)); source=$monster.source; sourceSha256=$monster.sha256; sheet=$sheetPath; sheetGrid=@(4,5); sequences=$sequences; reviewFlags=@($monster.cutWarnings) }
        Write-Output "Extracted $($monster.id): 20 frames"
    } finally { $source.Dispose() }
}

$manifest = [ordered]@{
    formatVersion=2; frameSize=@($size,$size); frameCount=140; actions=@($audit.actions)
    monsters=$results; reviewRequired=$true; reviewFlags=$flags
    notes=@('Source PNGs are preserved byte-for-byte in source/.','Frames use original alpha and one uniform scale per monster; no pose is invented.','Colored fringes and the flagged cut lines need visual review.','Nighthawk owl differs from the earlier Nightwhisk cat.')
}
$manifest | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath (Join-Path $out 'manifest.json') -Encoding UTF8
$preview = [ordered]@{ monsters=@(foreach ($m in $results) { [ordered]@{ id=$m.id; name=$m.name; sequences=$m.sequences } }) } | ConvertTo-Json -Depth 20 -Compress
('window.RAINBOW_ASSETS = ' + $preview + ';') | Set-Content -LiteralPath (Join-Path $out 'preview-data.js') -Encoding UTF8
