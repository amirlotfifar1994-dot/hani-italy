$ErrorActionPreference = 'Stop'
$articleAssetRoot = Join-Path $PSScriptRoot '../dist/assets/journal'
New-Item -ItemType Directory -Path $articleAssetRoot -Force | Out-Null
$photoFiles = @(
    @{ key='bologna-pavaglione'; title='Bologna , portico del Pavaglione.jpg' },
    @{ key='isfahan-square'; title='Naqsh-e Jahan Square.JPG' },
    @{ key='boboli-garden'; title='Boboli, il viottolone 01.JPG' },
    @{ key='shiraz-eram'; title='Eram-garden-shiraz1.jpg' },
    @{ key='matera-sassi'; title='View of Sassi di Matera, Matera, Italy (PPL2-Enhanced) julesvernex2.jpg' },
    @{ key='yazd-roofs'; title='Rooftops of Yazd, Dusk, Iran (16967495339).jpg' }
)
$photoManifest = @()
foreach ($photoFile in $photoFiles) {
    $photoQuery = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize&iiurlwidth=1600&titles=' + [uri]::EscapeDataString('File:' + $photoFile.title)
    $photoResponse = Invoke-RestMethod -Uri $photoQuery -UserAgent 'PersiaMarketPreview/1.0 (editorial photo attribution)'
    $photoPage = $photoResponse.query.pages.PSObject.Properties.Value | Select-Object -First 1
    if (!$photoPage.imageinfo) { throw ('Missing photograph: ' + $photoFile.title) }
    $photoInfo = $photoPage.imageinfo[0]
    $photoMeta = $photoInfo.extmetadata
    if ($photoMeta.LicenseShortName.value -notmatch '^CC BY') { throw ('Unreviewed license: ' + $photoFile.title) }
    $photoUrl = if ($photoInfo.thumburl) { $photoInfo.thumburl } else { $photoInfo.url }
    Invoke-WebRequest -Uri $photoUrl -UserAgent 'PersiaMarketPreview/1.0' -OutFile (Join-Path $articleAssetRoot ($photoFile.key + '.jpg'))
    $photoManifest += [ordered]@{
        key=$photoFile.key; title=$photoFile.title; src=('/assets/journal/' + $photoFile.key + '.jpg')
        width=($photoInfo.thumbwidth ?? $photoInfo.width); height=($photoInfo.thumbheight ?? $photoInfo.height)
        author=[System.Net.WebUtility]::HtmlDecode(($photoMeta.Artist.value -replace '<[^>]+>',''))
        license=$photoMeta.LicenseShortName.value; licenseUrl=$photoMeta.LicenseUrl.value
        source=$photoInfo.descriptionurl; original=$photoInfo.url; downloaded=$photoUrl
    }
}
$photoManifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'journal-photo-credits.json') -Encoding utf8
$photoManifest | Select-Object key,author,license,width,height | ConvertTo-Json -Depth 3
