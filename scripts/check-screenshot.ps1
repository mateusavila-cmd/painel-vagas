Add-Type -AssemblyName System.Drawing

$path = "$env:TEMP\landing-shot.png"
$bmp = [System.Drawing.Bitmap]::FromFile($path)
$w = $bmp.Width
$h = $bmp.Height
Write-Host "Imagem: ${w}x${h}"

# Pontos de amostragem: nome, x%, y%
$points = @(
    @("Topo (navbar)",            50, 2),
    @("Hero (fundo)",             12, 10),
    @("Hero (centro)",            50, 12),
    @("Vantagens (fundo entre cards)", 50, 22),
    @("Vantagens (fundo esquerda)",    5, 20),
    @("Como funciona (fundo)",    50, 33),
    @("Sobre/Pre-req (fundo)",    50, 45),
    @("Depoimentos (fundo)",      50, 58),
    @("FAQ (fundo)",              50, 72),
    @("CTA final (fundo)",        10, 88),
    @("Rodape",                   50, 97)
)

foreach ($p in $points) {
    $x = [int]($w * $p[1] / 100)
    $y = [int]($h * $p[2] / 100)
    $c = $bmp.GetPixel($x, $y)
    $lum = 0.2126 * $c.R + 0.7152 * $c.G + 0.0722 * $c.B
    $tag = if ($lum -lt 60) { "ESCURO" } elseif ($lum -lt 160) { "MEDIO" } else { "CLARO" }
    Write-Host ("{0,-36} ({1,4},{2,4})  RGB({3,3},{4,3},{5,3})  lum={6,5:N0}  -> {7}" -f $p[0], $x, $y, $c.R, $c.G, $c.B, $lum, $tag)
}

$bmp.Dispose()
