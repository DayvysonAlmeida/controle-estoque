<#
Converte SVGs em PNGs usando ImageMagick (`magick`), Inkscape ou rsvg-convert.

Uso:
  # do diretório raiz do projeto
  .\scripts\convert_svgs_to_png.ps1

O script irá gerar PNGs correspondentes em `docs/assets/`:
  - banner.png
  - banner_linkedin.png (1584x396)
  - screenshot-1.png, screenshot-2.png, screenshot-3.png

Dependências (instale pelo seu gerenciador):
  - ImageMagick (comando `magick`) ou
  - Inkscape (comando `inkscape`) ou
  - librsvg (`rsvg-convert`)
#>

Set-StrictMode -Version Latest

function Test-Command {
    param([string]$cmd)
    $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (-not $root) { $root = Get-Location }
$assets = Join-Path $root '..\docs\assets' | Resolve-Path

Write-Host "Assets folder: $assets"

$useMagick = Test-Command 'magick'
$useInkscape = Test-Command 'inkscape'
$useRsvg = Test-Command 'rsvg-convert'

if (-not ($useMagick -or $useInkscape -or $useRsvg)) {
    Write-Warning "Nenhuma ferramenta de conversão encontrada. Instale ImageMagick (magick), Inkscape ou librsvg (rsvg-convert)."
    exit 1
}

function Convert-SvgToPng {
    param(
        [string]$svgPath,
        [string]$pngPath,
        [string]$extraArgs = ''
    )

    if ($useMagick) {
        $cmd = "magick convert $extraArgs `"$svgPath`" `"$pngPath`""
        Write-Host "Executando: $cmd"
        & magick convert $extraArgs $svgPath $pngPath
        return $LASTEXITCODE
    }

    if ($useInkscape) {
        # inkscape --export-type=png --export-filename=out.png in.svg
        $cmd = "inkscape --export-type=png --export-filename=`"$pngPath`" --export-dpi=96 `"$svgPath`""
        Write-Host "Executando: $cmd"
        & inkscape --export-type=png --export-filename=$pngPath --export-dpi=96 $svgPath
        return $LASTEXITCODE
    }

    if ($useRsvg) {
        $cmd = "rsvg-convert -o `"$pngPath`" `"$svgPath`""
        Write-Host "Executando: $cmd"
        & rsvg-convert -o $pngPath $svgPath
        return $LASTEXITCODE
    }
}

$files = @(
    'banner.svg',
    'screenshot-1.svg',
    'screenshot-2.svg',
    'screenshot-3.svg'
)

foreach ($f in $files) {
    $svg = Join-Path $assets.Path $f
    if (-not (Test-Path $svg)) {
        Write-Warning "Arquivo não encontrado: $svg - pulando"
        continue
    }
    $png = [System.IO.Path]::ChangeExtension($svg, '.png')
    Write-Host "Convertendo $svg -> $png"
    $rc = Convert-SvgToPng -svgPath $svg -pngPath $png
    if ($rc -ne 0) { Write-Warning "Falha ao converter $svg (exit $rc)" }
}

# Gera banner otimizado para LinkedIn: 1584x396
$bannerSvg = Join-Path $assets.Path 'banner.svg'
$bannerLinkedin = Join-Path $assets.Path 'banner_linkedin.png'
if (Test-Path $bannerSvg) {
    Write-Host "Gerando banner LinkedIn (1584x396): $bannerLinkedin"
    if ($useMagick) {
        & magick convert $bannerSvg -resize 1584x396^> -background white -flatten $bannerLinkedin
    } elseif ($useInkscape) {
        & inkscape --export-type=png --export-filename=$bannerLinkedin --export-width=1584 --export-height=396 $bannerSvg
    } elseif ($useRsvg) {
        & rsvg-convert -w 1584 -h 396 -o $bannerLinkedin $bannerSvg
    }
}

Write-Host "Conversão concluída. Verifique a pasta: $assets"
